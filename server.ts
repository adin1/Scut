import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { CLUJ_RESOURCE_PROVIDERS, CLUJ_NATIONAL_HELPLINES } from './src/data/cluj';

dotenv.config();

const CLUJ_RESOURCES_PROMPT_BLOCK = [
  ...CLUJ_NATIONAL_HELPLINES.map(h => `- ${h.label}: ${h.phone} (${h.availability})`),
  ...CLUJ_RESOURCE_PROVIDERS.map(r => `- ${r.name}: ${r.phone}${r.address ? ` — ${r.address}` : ''}`),
].join('\n');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Minimal in-memory rate limiter for the AI endpoints — these call the real
// Gemini API with a server-side key, so an unauthenticated caller hammering
// them repeatedly is a real cost/abuse risk, not just a theoretical one.
const rateLimitHits = new Map<string, number[]>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const hits = (rateLimitHits.get(key) || []).filter(t => now - t < windowMs);
    if (hits.length >= maxRequests) {
      return res.status(429).json({ error: 'Prea multe cereri. Încearcă din nou peste un minut.' });
    }
    hits.push(now);
    rateLimitHits.set(key, hits);
    next();
  };
}
const aiRateLimit = rateLimit(20, 60_000);

// Initialize Google GenAI client lazily
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    serverTimeUtc: new Date().toISOString()
  });
});

// AI Triage Crisis Assistant Endpoint
app.post('/api/chat/triage', aiRateLimit, async (req, res) => {
  try {
    const { message, history, contextCategory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mesajul este obligatoriu.' });
    }
    if (message.length > 4000) {
      return res.status(400).json({ error: 'Mesajul este prea lung (limită: 4000 caractere).' });
    }
    if (history !== undefined && !Array.isArray(history)) {
      return res.status(400).json({ error: 'Istoricul conversației trebuie să fie o listă.' });
    }

    const ai = getGenAIClient();

    // If Gemini key is available, use real Gemini
    if (ai) {
      const systemInstruction = `Ești „Asistentul de Criză SCUT”, un modul asistiv de sprijin decizional și informare pentru victimele violenței domestice din România.
IMPORTANT: Ești un asistent consultativ. Toate recomandările tale sunt strict informative și nu înlocuiesc o decizie juridică, medicală sau polițienească oficială.

PRINCIPII OBLIGATORII:
1. Răspunde ÎNTOTDEAUNA în limba română, cald, empatic, calm, clar și foarte structurat (cu pași numerotați scurți).
2. PRIORITATEA ZERO este siguranța fizică a victimei. Dacă utilizatoarea este în pericol iminent, instruiește-o să apeleze 112 sau să folosească butonul SOS.
3. Oferă îndrumări legale precise conform legislației din România (Legea 217/2003 republicată):
   - Ordinul de Protecție Provizoriu (OPP): Se emite pe loc de către polițist pentru 5 zile, pe baza formularului de evaluare a riscului. Presupune evacuarea imediată a agresorului din locuință.
   - Ordinul de Protecție Judecătoresc: Solicitat prin Judecătorie, valabil până la 12 luni, cu asistență juridică gratuită obligatorie asigurată de Barou.
4. Oferă îndrumări medicale & INML precise:
   - În caz de răni: Apel 112 / UPU pentru îngrijiri imediate și fișă medicală.
   - Certificatul Medico-Legal INML: Se obține de la Institutul de Medicină Legală în maximum 48-72 ore de la agresiune. Nu este necesară plângerea penală prealabilă pentru examinare.
5. Oferă îndrumări despre adăpost & evadare:
   - Adăposturile DGASPC au adrese confidențiale/secrete.
   - Bagajul de urgență minim: Acte de identitate, bani/carduri, chei, medicamente, acte copii.
   - Număr Helpline Național ANES gratuit 24/7: 0800.500.333.
6. Păstrează răspunsurile concise, directe și ușor de citit pe un ecran de telefon. Folosește bullet points clare.
7. Dacă victima menționează sau pare să fie în județul Cluj / Cluj-Napoca, recomandă prioritar instituțiile locale verificate de mai jos (nu inventa alte numere sau adrese):
${CLUJ_RESOURCES_PROMPT_BLOCK}
8. Context curent de triage dacă este specificat: ${contextCategory || 'general'}.`;

      const contents: Array<{ role?: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'counselor' || item.sender === 'bot') {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const replyText = response.text || 'Suntem aici pentru tine. Dacă ești în pericol iminent, sună la 112 sau apelează gratuit 0800.500.333.';
      return res.json({ 
        reply: replyText, 
        source: 'gemini',
        isAiGenerated: true,
        aiVerificationNotice: true,
        disclaimer: 'Conținut generat automat cu rol de sprijin decizional – necesită verificare umană de către specialiști autorizați.' 
      });
    }

    // Fallback rule-based smart response when no Gemini API key is configured
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('112') || lower.includes('pericol') || lower.includes('casa') || lower.includes('omoara') || lower.includes('acum')) {
      reply = `🚨 **MĂSURI DE URGENȚĂ IMEDIATĂ:**\n\n1. **Adăpostește-te:** Încuie-te într-o cameră cu ieșire sau cu telefonul la tine.\n2. **Apelează 112:** Spune adresa exactă și faptul că ești victimă a violenței domestice.\n3. **Activează Ieșirea Rapidă ([X] / ESC):** Dacă agresorul se apropie, apasă tasta roșie de ieșire pentru a masca ecranul.`;
    } else if (lower.includes('inml') || lower.includes('lovit') || lower.includes('ranit') || lower.includes('medic') || lower.includes('certificat') || lower.includes('spital')) {
      reply = `🩹 **GHID MEDICAL & CERTIFICAT MEDICO-LEGAL (INML):**\n\n1. **Îngrijiri de Urgență:** Mergi la cel mai apropiat UPU pentru tratament și fișa de constatare a traumatismelor.\n2. **Prezentare la INML:** Mergi la Medicină Legală în max 48-72 ore. Costul este redus, iar certificatul este probă capitală în instanță.\n3. **Probe Foto în SCUT:** Fotografiază leziunile direct din Seiful SCUT (nu se salvează în galeria telefonului).`;
    } else if (lower.includes('ordin') || lower.includes('opp') || lower.includes('politie') || lower.includes('avocat') || lower.includes('plangere') || lower.includes('lege')) {
      reply = `⚖️ **GHID JURIDIC – ORDIN DE PROTECȚIE (Legea 217/2003):**\n\n1. **Ordinul Provizoriu (OPP):** Poliția îl emite pe loc pentru **5 zile**. Agresorul este evacuat din casă chiar dacă este proprietar.\n2. **Ordinul de la Judecătorie:** Poate dura până la **12 luni** (interdicție de apropiere la sub 200m, brățară electronică de monitorizare).\n3. **Avocat Gratuit:** Statul român este obligat prin Barou să îți asigure avocat din oficiu gratuit.`;
    } else if (lower.includes('plec') || lower.includes('adapost') || lower.includes('copii') || lower.includes('dgaspc') || lower.includes('bagaj')) {
      reply = `🏠 **GHID EVADARE ÎN SIGURANȚĂ & ADĂPOST:**\n\n1. **Bagaj Secret:** Ia actele tale și ale copiilor, bani, chei de rezervă și rețete medicale.\n2. **Adăposturi DGASPC:** Au locații secrete păzite 24/7 cu cazare, hrană și asistență juridică gratuită.\n3. **Helpline ANES:** Apelează gratuit **0800.500.333** pentru a fi repartizată la un centru sigur.`;
    } else {
      reply = `🛡️ **Suntem alături de tine.** Spune-mi ce se întâmplă sau alege una dintre opțiunile rapide:
- 🩹 *Ajutor Medical & Certificat INML*
- ⚖️ *Emitere Ordin de Protecție & Plângere Poliție*
- 🏠 *Plecare Sigură & Adăpost DGASPC Secret*
- 📞 *Helpline Național Gratuit: 0800.500.333*`;
    }

    return res.json({ 
      reply, 
      source: 'local_protocol',
      isAiGenerated: false,
      aiVerificationNotice: true,
      disclaimer: 'Conținut generat pe baza protocoalelor naționale de criză (Legea 217/2003).' 
    });
  } catch (error: any) {
    console.error('Error in triage chat:', error);
    return res.status(500).json({
      reply: 'A apărut o eroare la conexiunea securizată. Pentru urgențe, apelează 112 sau Helpline Național ANES: 0800.500.333.',
      error: error.message,
    });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SCUT Secure Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

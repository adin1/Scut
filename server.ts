import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or when key is available
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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Triage Crisis Assistant Endpoint
app.post('/api/chat/triage', async (req, res) => {
  try {
    const { message, history, contextCategory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mesajul este obligatoriu.' });
    }

    const ai = getGenAIClient();

    // If Gemini key is available, use real Gemini 3.7 Flash
    if (ai) {
      const systemInstruction = `Ești „Asistentul de Criză SCUT”, un consilier virtual de urgență specializat în asistență confidențială pentru victimele violenței domestice din România.

PRINCIPII OBLIGATORII:
1. Răspunde ÎNTOTDEAUNA în limba română, cald, empatic, calm, clar și foarte structurat (cu pași numerotați scurți).
2. PRIORITATEA ZERO este siguranța fizică a victimei. Dacă utilizatoarea este în pericol iminent, instruiește-o să apeleze 112 sau să folosească butonul SOS.
3. Oferă îndrumări legale precise conform legislației din România (Legea 217/2003 republicată):
   - Ordinul de Protecție Provizoriu (OPP): Se emite pe loc de către polițist pentru 5 zile, pe baza formularului de evaluare a riscului. Presupune evacuarea imediată a agresorului din locuință.
   - Ordinul de Protecție Judecătoresc: Solicitat prin Judecătorie, valabil până la 12 luni, cu asistență juridică gratuită obligatorie asigurată de Barou.
4. Oferă îndrumări medicale & INML precise:
   - În caz de răni: Apel 112 / UPU (Unitate Primiri Urgențe) pentru îngrijiri imediate și fișă medicală.
   - Certificatul Medico-Legal INML: Se obține de la Institutul de Medicină Legală (sau Serviciul Județean de Medicină Legală) în maximum 48-72 ore de la agresiune. Nu este necesară plângerea penală prealabilă pentru examinare.
5. Oferă îndrumări despre adăpost & evadare:
   - Adăposturile DGASPC au adrese confidențiale/secrete.
   - Bagajul de urgență minim: Acte de identitate, bani/carduri, chei, medicamente, acte copii.
   - Număr Helpline Național ANES gratuit 24/7: 0800.500.333.
6. Păstrează răspunsurile concise, directe și ușor de citit pe un ecran de telefon. Folosește bullet points clare.
7. Context curent de triage dacă este specificat: ${contextCategory || 'general'}.`;

      // Build conversation contents
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
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const replyText = response.text || 'Suntem aici pentru tine. Dacă ești în pericol iminent, sună la 112 sau apelează gratuit 0800.500.333.';
      return res.json({ reply: replyText, source: 'gemini' });
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

    return res.json({ reply, source: 'local_protocol' });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SCUT Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

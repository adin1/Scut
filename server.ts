import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '15mb' }));

// ---------------------------------------------------------------------------
// Institutional access: every staff route requires a bearer token.
// SCUT_STAFF_TOKENS = JSON map {"<token>": {"actorId","actorRole","actorInstitution"}}.
// The actor recorded in the audit ledger always comes from the token, never from req.body.
// ---------------------------------------------------------------------------
interface StaffIdentity {
  actorId: string;
  actorRole: string;
  actorInstitution: string;
}

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

function loadStaffTokens(): Map<string, StaffIdentity> {
  const tokens = new Map<string, StaffIdentity>();
  const raw = process.env.SCUT_STAFF_TOKENS;
  if (!raw) return tokens;
  try {
    for (const [token, identity] of Object.entries(JSON.parse(raw) as Record<string, StaffIdentity>)) {
      if (token.length >= 32 && identity?.actorId && identity?.actorRole) {
        tokens.set(sha256(token), { ...identity, actorInstitution: identity.actorInstitution || 'Nespecificată' });
      }
    }
  } catch {
    console.error('SCUT_STAFF_TOKENS nu este JSON valid; accesul instituțional rămâne închis.');
  }
  return tokens;
}

// Keyed by the token's hash, so the lookup never compares secrets directly.
const staffTokens = loadStaffTokens();

const requireStaff: express.RequestHandler = (req, res, next) => {
  if (staffTokens.size === 0) {
    return res.status(503).json({ error: 'Accesul instituțional nu este configurat pe acest server.' });
  }
  const match = /^Bearer (.+)$/.exec(req.get('authorization') || '');
  const identity = match ? staffTokens.get(sha256(match[1])) : undefined;
  if (!identity) {
    return res.status(401).json({ error: 'Autentificare instituțională necesară.' });
  }
  res.locals.staff = identity;
  next();
};

// Fixed-window limiter per IP for the public (victim-facing) endpoints.
function rateLimit(maxRequests: number, windowMs: number): express.RequestHandler {
  const hits = new Map<string, { count: number; windowStart: number }>();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const entry = hits.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      return next();
    }
    if (++entry.count > maxRequests) {
      return res.status(429).json({
        error: 'Prea multe cereri. Pentru urgențe, apelează 112 sau Helpline ANES 0800.500.333.'
      });
    }
    next();
  };
}

const publicLimiter = rateLimit(40, 10 * 60 * 1000);

// ---------------------------------------------------------------------------
// Audit ledger: hash-chained, append-only. Each block's hash covers the
// previous block's hash, so editing or deleting any block breaks every
// block after it. Persistence goes through auditLedger.ts once Prisma is wired in.
// ---------------------------------------------------------------------------
interface ServerAuditEvent {
  id: string;
  timestamp: number;
  timeString: string;
  actorId: string;
  actorRole: string;
  actorInstitution: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  legalBasis: string;
  ipAddress?: string;
  breakGlassReason?: string;
  immutableBlockIndex: number;
  prevBlockHash: string;
  blockHash: string;
}

type AuditEventInput = Pick<ServerAuditEvent,
  'actorId' | 'actorRole' | 'actorInstitution' | 'action' | 'resourceType' | 'resourceId' | 'description' | 'legalBasis'
> & { ipAddress?: string; breakGlassReason?: string; timestamp?: number };

const GENESIS_HASH = '0'.repeat(64);
const serverAuditLedger: ServerAuditEvent[] = [];

// Fixed field order; a separator that cannot appear in normal text keeps fields from running together.
function hashAuditBlock(block: Omit<ServerAuditEvent, 'blockHash' | 'timeString'>): string {
  return sha256([
    block.prevBlockHash,
    block.immutableBlockIndex,
    block.id,
    new Date(block.timestamp).toISOString(),
    block.actorId,
    block.actorRole,
    block.actorInstitution,
    block.action,
    block.resourceType,
    block.resourceId,
    block.description,
    block.legalBasis,
    block.ipAddress ?? '',
    block.breakGlassReason ?? ''
  ].join('\u001f'));
}

function appendAuditEvent(input: AuditEventInput): ServerAuditEvent {
  const timestamp = input.timestamp ?? Date.now();
  const prev = serverAuditLedger.at(-1);
  const block = {
    ...input,
    id: `aud-${crypto.randomUUID()}`,
    timestamp,
    immutableBlockIndex: serverAuditLedger.length,
    prevBlockHash: prev ? prev.blockHash : GENESIS_HASH
  };
  const event: ServerAuditEvent = {
    ...block,
    timeString: new Date(timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
    blockHash: hashAuditBlock(block)
  };
  serverAuditLedger.push(Object.freeze(event));
  return event;
}

function verifyAuditChain(): { valid: boolean; blocks: number; brokenAtIndex?: number } {
  let prevHash = GENESIS_HASH;
  for (const [index, event] of serverAuditLedger.entries()) {
    const { blockHash, timeString, ...block } = event;
    if (event.prevBlockHash !== prevHash || event.immutableBlockIndex !== index || hashAuditBlock(block) !== blockHash) {
      return { valid: false, blocks: serverAuditLedger.length, brokenAtIndex: index };
    }
    prevHash = blockHash;
  }
  return { valid: true, blocks: serverAuditLedger.length };
}

// Demo seed, written through the same chain as every real event.
appendAuditEvent({
  timestamp: Date.now() - 1000 * 60 * 35,
  actorId: 'usr-lawyer-003',
  actorRole: 'lawyer',
  actorInstitution: 'Baroul București Pro-Bono',
  action: 'view',
  resourceType: 'case',
  resourceId: 'SCUT-RO-2026-B0892',
  description: 'Consultare dosar judiciar pentru redactarea cererii de prelungire OP la Judecătorie.',
  legalBasis: 'Consimțământ victimă #CSNT-889 & Împuternicire Avocațială Seria B/10294',
  ipAddress: '10.24.8.91 (Rețea Securizată Justiție)'
});

// ---------------------------------------------------------------------------
// AI access. Victim data is special-category data (GDPR art. 9), so by default
// AI runs only through Vertex AI in an EU region. The Gemini Developer API
// (GEMINI_API_KEY) has no EU data-residency guarantee and needs an explicit
// SCUT_ALLOW_NON_EU_AI=true. Every text is redacted before it leaves the server.
// ---------------------------------------------------------------------------
const AI_MODEL = process.env.SCUT_AI_MODEL || 'gemini-2.5-flash';

let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  if (process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true' && process.env.GOOGLE_CLOUD_PROJECT) {
    aiClient = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'europe-west1'
    });
  } else if (process.env.GEMINI_API_KEY && process.env.SCUT_ALLOW_NON_EU_AI === 'true') {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Strips direct identifiers before any text reaches the model. Names and
// addresses are not caught here; the consent text tells the victim not to share them.
function redactPII(text: string): string {
  return text
    .replace(/\b[1-9]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{6}\b/g, '[CNP]')
    .replace(/\bRO\d{2}\s?[A-Z]{4}(\s?[0-9A-Z]{4}){4}\b/gi, '[IBAN]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]')
    .replace(/(\+40|0040|\b0)\s?7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/g, '[TELEFON]')
    .replace(/(\+40|0040|\b0)\s?[23]\d{1,2}[\s.-]?\d{3}[\s.-]?\d{3,4}\b/g, '[TELEFON]')
    .replace(/\b\d{1,3}\.\d{3,}\s*,\s*\d{1,3}\.\d{3,}\b/g, '[COORDONATE]');
}

type AiContent = { role?: string; parts: Array<{ text: string }> };

// The only place the server talks to a model, so the provider can be swapped in one function.
async function generateText(options: {
  contents: AiContent[];
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}): Promise<string | null> {
  const ai = getGenAIClient();
  if (!ai) return null;
  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: options.contents.map(c => ({ ...c, parts: c.parts.map(p => ({ text: redactPII(p.text) })) })),
    config: {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature,
      responseMimeType: options.responseMimeType
    }
  });
  return response.text ?? null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'SCUT - Infrastructură Digitală Interinstituțională',
    version: '2.0.0-pilot',
    aiEnabled: Boolean(getGenAIClient()),
    serverTimeUtc: new Date().toISOString(),
    eidasTimestampReadiness: 'not_integrated',
    chainOfCustodyLedgerBlocks: serverAuditLedger.length
  });
});

// AI Triage Crisis Assistant Endpoint
app.post('/api/chat/triage', publicLimiter, async (req, res) => {
  try {
    const { message, history, contextCategory, aiConsent } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mesajul este obligatoriu.' });
    }

    // Without explicit consent the victim's words never leave the server.
    if (aiConsent === true && getGenAIClient()) {
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
7. Context curent de triage dacă este specificat: ${contextCategory || 'general'}.`;

      const contents: AiContent[] = [];

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

      const generated = await generateText({ contents, systemInstruction, temperature: 0.3 });

      const replyText = generated || 'Suntem aici pentru tine. Dacă ești în pericol iminent, sună la 112 sau apelează gratuit 0800.500.333.';
      return res.json({ 
        reply: replyText, 
        source: 'gemini',
        isAiGenerated: true,
        aiVerificationNotice: true,
        disclaimer: 'Conținut generat automat cu rol de sprijin decizional – necesită verificare umană de către specialiști autorizați.' 
      });
    }

    // Rule-based response from the national crisis protocols (no consent, or AI not configured)
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

// Assistive OCR & Metadata Summarizer (Assistive AI only - no hallucination of legal facts)
app.post('/api/ai/ocr-summarize', requireStaff, async (req, res) => {
  try {
    const { documentText, documentTitle, category } = req.body;

    if (!documentText) {
      return res.status(400).json({ error: 'Textul documentului este obligatoriu.' });
    }

    if (getGenAIClient()) {
      const prompt = `Ești un asistent tehnic pentru organizarea dosarelor juridice în sistemul SCUT.
Analizează textul brut de mai jos extras dintr-un document (${category || 'act'}) intitulat "${documentTitle || 'Document'}".
Sarcina ta:
1. Extrage strict faptele menționate: date calendaristice, tipul leziunilor/evenimentelor, instituțiile menționate, concluzia medico-legală sau decizia autorității.
2. NU inventa detalii, NU emite opinii juridice sau verdicte de vinovăție.
3. Răspunde în limba română într-un rezumat factual scurt și o listă de 3-4 puncte cheie.

Text brut:
${documentText}`;

      const summary = await generateText({ contents: [{ role: 'user', parts: [{ text: prompt }] }], temperature: 0.1 });

      return res.json({
        summary,
        isAiGenerated: true,
        disclaimer: 'Conținut generat automat – necesită verificare umană de către avocat sau ofițerul de caz.'
      });
    }

    // Local fallback extraction
    return res.json({
      summary: `Document primit: ${documentTitle || 'Document'}\n- Rezumatul automat nu este disponibil (AI neconfigurat). Documentul trebuie citit integral de specialist.`,
      isAiGenerated: false,
      disclaimer: 'Extras conform regulilor de indexare locală a probelor.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Chronological Incident Timeline Generator (Assistive AI)
app.post('/api/ai/timeline-extract', requireStaff, async (req, res) => {
  try {
    const { notesList } = req.body;
    if (!Array.isArray(notesList)) {
      return res.status(400).json({ error: 'Lista de note este obligatorie.' });
    }

    if (getGenAIClient() && notesList.length > 0) {
      const prompt = `Ești un asistent de structurare cronologică pentru dosare de violență domestică în sistemul SCUT.
Ai următoarele înregistrări factuale:
${JSON.stringify(notesList, null, 2)}

Sarcina ta:
1. Ordonează evenimentele cronologic (de la cel mai vechi la cel mai recent).
2. Identifică pentru fiecare data, tipul faptei (amenințare, agresiune fizică, violare ordin etc.) și gravitatea declarată.
3. Răspunde strict în format JSON cu structura:
{
  "events": [
    { "date": "string", "title": "string", "category": "string", "severity": "critic|ridicat|moderat", "summary": "string" }
  ]
}`;

      const generated = await generateText({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        responseMimeType: 'application/json'
      });

      const parsed = JSON.parse(generated || '{"events": []}');
      return res.json({
        timeline: parsed.events,
        isAiGenerated: true,
        disclaimer: 'Cronologie generată asistat – verificarea fiecărui eveniment este obligatorie înainte de transmiterea în instanță.'
      });
    }

    return res.json({
      timeline: notesList.map((n: any, idx: number) => ({
        date: n.date || 'Data neprecizată',
        title: n.title || `Incident #${idx + 1}`,
        category: n.category || 'incident',
        severity: 'ridicat',
        summary: n.description || ''
      })),
      isAiGenerated: false,
      disclaimer: 'Cronologie structurată conform datelor introduse.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Structured Risk Assessment Evaluation Endpoint
app.post('/api/triage/assess', publicLimiter, (req, res) => {
  try {
    const { responses } = req.body;
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Răspunsurile la chestionar sunt obligatorii.' });
    }

    // Scoring weights based on Romanian Police Risk Assessment Matrix (Legea 217/2003)
    let score = 0;
    const maxScore = 20;

    const criticalQuestions = [
      'hasWeaponThreat', 
      'hasStrangulationAttempt', 
      'hasDeathThreat', 
      'hasRepeatedViolations', 
      'hasChildrenThreat'
    ];

    const highQuestions = [
      'hasPhysicalAssault',
      'hasForcedConfinement',
      'hasSubstanceAbuseAggressor',
      'hasStalkingBehavior'
    ];

    const moderateQuestions = [
      'hasEconomicControl',
      'hasIsolationFromFamily',
      'hasVerbalAbuse'
    ];

    for (const key of criticalQuestions) {
      if (responses[key] === true || responses[key] === 'da') score += 4;
    }
    for (const key of highQuestions) {
      if (responses[key] === true || responses[key] === 'da') score += 2;
    }
    for (const key of moderateQuestions) {
      if (responses[key] === true || responses[key] === 'da') score += 1;
    }

    let riskLevel: 'CRITIC' | 'RIDICAT' | 'MODERAT' | 'PREVENTIE_SUPORT' = 'PREVENTIE_SUPORT';
    let recommendations: string[] = [];

    if (score >= 12 || responses.hasWeaponThreat || responses.hasStrangulationAttempt || responses.hasDeathThreat) {
      riskLevel = 'CRITIC';
      recommendations = [
        'Solicitare imediată emitere Ordin de Protecție Provizoriu (OPP) la 112 (5 zile).',
        'Montare de urgență a brățării electronice SIME pe agresor.',
        'Găzduire de siguranță la adăpost secret DGASPC / ONG.',
        'Reprezentare juridică gratuită de urgență prin Barou.'
      ];
    } else if (score >= 7) {
      riskLevel = 'RIDICAT';
      recommendations = [
        'Întocmire formular de evaluare a riscului la secția de poliție.',
        'Examinare medico-legală INML pentru constatarea urmelor.',
        'Pregătirea bagajului secret de urgență și a planului de siguranță offline.'
      ];
    } else if (score >= 3) {
      riskLevel = 'MODERAT';
      recommendations = [
        'Consiliere psihologică post-traumă gratuită.',
        'Documentarea securizată a tuturor incidentelor în Seiful SCUT.',
        'Setarea contactelor de încredere și a cuvintelor de cod.'
      ];
    } else {
      riskLevel = 'PREVENTIE_SUPORT';
      recommendations = [
        'Informare privind drepturile victimelor conform Legii 217/2003.',
        'Activarea funcțiilor de verificare a siguranței digitale pe telefon.'
      ];
    }

    return res.json({
      computedScore: Math.min(score, maxScore),
      maxScore,
      riskLevel,
      recommendations,
      disclaimer: 'Instrument de sprijin decizional pentru specialiști și victimă, nu constituie o expertiză judiciară definitivă.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Digital Evidence Integrity & SHA-256 Verification Endpoint
app.post('/api/evidence/verify-integrity', requireStaff, (req, res) => {
  try {
    const { expectedHash, contentToVerify, evidenceId } = req.body;
    const staff: StaffIdentity = res.locals.staff;

    if (typeof expectedHash !== 'string' || !/^[0-9a-f]{64}$/i.test(expectedHash)) {
      return res.status(400).json({ error: 'Hash-ul așteptat trebuie să fie un SHA-256 în format hex (64 de caractere).' });
    }
    // Without the content there is nothing to verify; never report a match on the hash alone.
    if (typeof contentToVerify !== 'string' || contentToVerify.length === 0) {
      return res.status(400).json({ error: 'Conținutul probei este obligatoriu pentru verificare.' });
    }

    const computedHash = sha256(contentToVerify);
    const matches = computedHash === expectedHash.toLowerCase();

    const auditEntry = appendAuditEvent({
      ...staff,
      action: 'integrity_verify',
      resourceType: 'evidence',
      resourceId: evidenceId || 'EV-NESPECIFICAT',
      description: `Verificare integritate SHA-256 probă: ${matches ? 'INTEGRITATE CONFIRMATĂ' : 'INTEGRITATE COMPROMISĂ'}`,
      legalBasis: 'Verificare integritate probă digitală',
      ipAddress: req.ip
    });

    return res.json({
      evidenceId,
      expectedHash,
      computedHash,
      matches,
      algorithm: 'SHA-256',
      status: matches ? 'verified' : 'integrity_failed',
      auditLedgerBlockIndex: auditEntry.immutableBlockIndex
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Audit Logs Ledger Endpoint (Append-only); the chain status is recomputed on every read.
app.get('/api/audit-logs', requireStaff, (req, res) => {
  const chain = verifyAuditChain();
  return res.json({
    totalBlocks: chain.blocks,
    logs: serverAuditLedger,
    ledgerTamperProofStatus: chain.valid ? 'chain_verified' : 'chain_broken',
    brokenAtIndex: chain.brokenAtIndex
  });
});

app.post('/api/audit-logs', requireStaff, (req, res) => {
  try {
    const { action, resourceType, resourceId, description, legalBasis } = req.body;
    const staff: StaffIdentity = res.locals.staff;

    if (!action || !resourceType || !resourceId || !legalBasis) {
      return res.status(400).json({ error: 'Acțiunea, resursa și temeiul legal sunt obligatorii.' });
    }

    const newEntry = appendAuditEvent({
      ...staff,
      action,
      resourceType,
      resourceId,
      description: description || '',
      legalBasis,
      ipAddress: req.ip
    });
    return res.json({ success: true, entry: newEntry });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Break-Glass Emergency Access Logging
app.post('/api/break-glass', requireStaff, (req, res) => {
  try {
    const { caseId, mandatoryReason, legalGrounds } = req.body;
    const staff: StaffIdentity = res.locals.staff;

    if (!caseId) {
      return res.status(400).json({ error: 'Identificatorul dosarului este obligatoriu.' });
    }
    if (!mandatoryReason || mandatoryReason.length < 15) {
      return res.status(400).json({ error: 'Justificarea de urgență este obligatorie (minim 15 caractere).' });
    }

    const breakGlassEntry = appendAuditEvent({
      ...staff,
      action: 'break_glass',
      resourceType: 'case',
      resourceId: caseId,
      description: `ACCES EXCEPȚIONAL DE URGENȚĂ (BREAK-GLASS): ${mandatoryReason}`,
      legalBasis: legalGrounds || 'Stare de necesitate / Pericol iminent viață',
      breakGlassReason: mandatoryReason,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Accesul de urgență a fost acordat și înregistrat în registrul de audit.',
      blockIndex: breakGlassEntry.immutableBlockIndex
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Court Evidentiary Package Manifest Generator
app.post('/api/court/generate-package', requireStaff, (req, res) => {
  try {
    const { caseId, evidenceList, recipientRole, legalCaseNumber } = req.body;
    const staff: StaffIdentity = res.locals.staff;

    if (!caseId || !Array.isArray(evidenceList)) {
      return res.status(400).json({ error: 'Dosarul și lista de probe sunt obligatorii.' });
    }

    // The server does not hold the originals, so it lists fingerprints as declared
    // and leaves verification to /api/evidence/verify-integrity on the original content.
    const manifestItems = evidenceList.map((ev: any, idx: number) => ({
      itemNumber: idx + 1,
      evidenceId: ev.evidenceId || ev.id || `EV-${idx + 1}`,
      title: ev.title,
      category: ev.category,
      sha256Hash: typeof ev.sha256Hash === 'string' && /^[0-9a-f]{64}$/i.test(ev.sha256Hash) ? ev.sha256Hash : null,
      dateCreated: ev.dateCreated,
      originalVsDerived: ev.originalVsDerived || 'original',
      integrityStatus: 'declared_not_verified'
    }));

    const manifestData = {
      packageId: `PKG-RO-${crypto.randomUUID()}`,
      caseId,
      legalCaseNumber: legalCaseNumber || null,
      generatedAt: new Date().toISOString(),
      generatedBy: staff,
      recipient: recipientRole || null,
      status: 'Pachet probatoriu pregătit pentru transmitere',
      standardsCompliance: ['SHA-256 fingerprints per item', 'Hash-chained audit ledger'],
      evidenceItemsCount: manifestItems.length,
      items: manifestItems
    };

    const packageSha256 = sha256(JSON.stringify(manifestData));

    appendAuditEvent({
      ...staff,
      action: 'court_package',
      resourceType: 'case',
      resourceId: caseId,
      description: `Pachet probatoriu generat (${manifestItems.length} probe), SHA-256 manifest ${packageSha256}`,
      legalBasis: 'Transmitere probe către instanță',
      ipAddress: req.ip
    });

    return res.json({
      ...manifestData,
      packageSha256Manifest: packageSha256
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
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
    console.log(`SCUT Secure Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

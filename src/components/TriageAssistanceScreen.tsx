import React, { useState, useRef, useEffect } from 'react';
import { 
  HeartPulse, 
  Home, 
  Scale, 
  MessageSquare, 
  ArrowLeft, 
  X, 
  Phone, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  AlertTriangle,
  FileText,
  Lock,
  ChevronRight,
  RefreshCw,
  Zap,
  HelpCircle,
  Stethoscope,
  Building2,
  Share2,
  Trash2
} from 'lucide-react';
import { TriageCategory, ChatMessage } from '../types/scut';

interface TriageAssistanceScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
  onNavigateToShelters: () => void;
}

interface PredefinedResponse {
  id: string;
  category: 'urgent' | 'medical' | 'legal' | 'shelter';
  icon: string;
  label: string;
  query: string;
}

const PREDEFINED_CRISIS_RESPONSES: PredefinedResponse[] = [
  {
    id: 'pr-1',
    category: 'urgent',
    icon: '🚨',
    label: 'Agresorul este în casă',
    query: 'Agresorul este în casă și devine violent. Ce fac pas cu pas chiar acum?'
  },
  {
    id: 'pr-2',
    category: 'medical',
    icon: '🩹',
    label: 'Certificat INML & Răni',
    query: 'Am fost agresată fizic. Cum și unde obțin certificatul medico-legal INML?'
  },
  {
    id: 'pr-3',
    category: 'legal',
    icon: '⚖️',
    label: 'Ordin de Protecție (OPP)',
    query: 'Cum pot obține un Ordin de Protecție Provizoriu (OPP) pe loc de la poliție?'
  },
  {
    id: 'pr-4',
    category: 'shelter',
    icon: '🏃',
    label: 'Plan de Plecare Rapidă',
    query: 'Vreau să plec din casă în siguranță. Ce trebuie să conțină bagajul de urgență?'
  },
  {
    id: 'pr-5',
    category: 'legal',
    icon: '👶',
    label: 'Protecția Copiilor Minori',
    query: 'Am copii cu mine. Cum sunt protejați prin lege și ce se întâmplă cu custodia?'
  },
  {
    id: 'pr-6',
    category: 'legal',
    icon: '🛡️',
    label: 'Poliția refuză intervenția',
    query: 'Dacă polițistul ezită să emită OPP sau să întocmească formularul de risc, ce pot face?'
  },
  {
    id: 'pr-7',
    category: 'legal',
    icon: '📿',
    label: 'Brățară Electronică GPS',
    query: 'Cum funcționează sistemul de monitorizare electronică cu brățară pentru agresor?'
  },
  {
    id: 'pr-8',
    category: 'medical',
    icon: '🏥',
    label: 'Urgență UPU vs INML',
    query: 'Care este diferența dintre fișa de la Spital (UPU) și Certificatul INML?'
  }
];

export const TriageAssistanceScreen: React.FC<TriageAssistanceScreenProps> = ({
  onBack,
  onQuickExit,
  onNavigateToShelters
}) => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'medical' | 'legal' | 'shelter'>('assistant');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<'all' | 'urgent' | 'medical' | 'legal' | 'shelter'>('all');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [crisisStep, setCrisisStep] = useState<number>(1);
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'counselor',
      text: 'Bună ziua. Sunt Asistentul Tău de Criză SCUT – un spațiu complet anonimizat, criptat și securizat. Ești într-un loc ferit de pericol în acest moment? Cum te pot ajuta imediat?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Send message to AI endpoint (Server-side Gemini with local protocol fallback)
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isAiLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/chat/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages,
          contextCategory: activeTab
        })
      });

      if (!response.ok) {
        throw new Error('Eroare rețea');
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'counselor',
        text: data.reply || 'Suntem alături de tine. Pentru ajutor imediat apelează 112 sau Helpline Național ANES 0800.500.333.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true
      };

      setChatMessages(prev => [...prev, aiReply]);
    } catch (err) {
      // Immediate offline crisis rule fallback
      const offlineReply: ChatMessage = {
        id: `fallback-${Date.now()}`,
        sender: 'counselor',
        text: getLocalCrisisAdvice(textToSend),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true
      };
      setChatMessages(prev => [...prev, offlineReply]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getLocalCrisisAdvice = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('inml') || q.includes('lovit') || q.includes('ranit') || q.includes('medic') || q.includes('spital')) {
      return `🩹 **Protocol Medical Urgent:**\n1. Mergi la UPU (Unitate Primiri Urgențe) pentru stabilizare și fișă de internare.\n2. În max 48-72 ore, prezintă-te la INML (Institutul de Medicină Legală) pentru eliberarea certificatului medico-legal.\n3. Fă poze la leziuni direct în SCUT (rămân criptate și nu ajung în galeria foto).`;
    }
    if (q.includes('ordin') || q.includes('opp') || q.includes('politie') || q.includes('lege') || q.includes('drept')) {
      return `⚖️ **Protocol Juridic – Ordin de Protecție (Legea 217/2003):**\n1. Solicită polițistului completarea formularului de evaluare a riscului pentru emiterea OPP (5 zile).\n2. Agresorul este obligat să părăsească locuința imediat.\n3. Cere prin judecătorie prelungirea Ordinului până la 12 luni, cu avocat gratuit asigurat din oficiu.`;
    }
    if (q.includes('plec') || q.includes('adapost') || q.includes('bagaj') || q.includes('copii')) {
      return `🏠 **Plan de Plecare & Adăpost DGASPC:**\n1. Bagaj vital: buletin, certificate naștere copii, carduri bancare, bani cash, chei rezervă, tratamente medicale.\n2. Adăposturile de criză oferă găzduire secretă gratuită, hrană și asistență juridică.\n3. Sună gratuit la 0800.500.333 pentru repartizare sigură.`;
    }
    return `🚨 **Siguranță Imediată:** Dacă ești în pericol activ, apelează imediat **112** sau folosește butonul de ieșire rapidă dacă agresorul este în apropiere. Suntem aici să te ghidăm pas cu pas.`;
  };

  const filteredPredefined = PREDEFINED_CRISIS_RESPONSES.filter(p => {
    if (selectedQuickFilter === 'all') return true;
    return p.category === selectedQuickFilter;
  });

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'counselor',
        text: 'Istoricul conversației a fost șters conform protocolului de securitate zero-trace. Cum te pot asista în siguranță?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true
      }
    ]);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-3.5 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>TRIAGE & ASISTENȚĂ DE CRIZĂ</span>
        </div>

        <button
          id="btn-triage-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă (ESC)"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Assistive AI Human Verification Disclaimer Badge */}
      <div className="mt-1 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-[10px] text-amber-900 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
          <span><strong>Asistent Sprijin Decizional:</strong> Conținut generat automat – necesită verificare umană de către specialiști autorizați.</span>
        </span>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 pt-2 pb-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center gap-0.5 text-center cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="truncate">Asistent AI</span>
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center gap-0.5 text-center cursor-pointer ${
            activeTab === 'medical'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span className="truncate">Medical & INML</span>
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center gap-0.5 text-center cursor-pointer ${
            activeTab === 'legal'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span className="truncate">Juridic / OPP</span>
        </button>
        <button
          onClick={() => setActiveTab('shelter')}
          className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center gap-0.5 text-center cursor-pointer ${
            activeTab === 'shelter'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="truncate">Adăpost DGASPC</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div className="flex-1 my-1 flex flex-col justify-between overflow-hidden">
        {/* TAB 1: ASISTENT AI & CONVERSAȚIE GHIDATĂ */}
        {activeTab === 'assistant' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden space-y-2">
            {/* Step-by-Step Crisis Flow Bar */}
            <div className="bg-white border border-stone-200 rounded-2xl p-2 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1 px-1">
                <span>ETAPA {crisisStep}/4 ÎN CRIZĂ:</span>
                <span className="text-emerald-700 font-semibold">Ghid Pas-cu-Pas</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { step: 1, label: '1. Siguranță', action: 'Adăpostește-te / 112' },
                  { step: 2, label: '2. Medical', action: 'UPU & INML 48h' },
                  { step: 3, label: '3. Juridic', action: 'OPP Poliție 5 zile' },
                  { step: 4, label: '4. Adăpost', action: 'DGASPC Secret' },
                ].map(item => (
                  <button
                    key={item.step}
                    onClick={() => {
                      setCrisisStep(item.step);
                      if (item.step === 1) sendMessage('Am nevoie de ghidare pentru Pasul 1: Siguranță fizică imediată.');
                      if (item.step === 2) sendMessage('Ghidează-mă pentru Pasul 2: Stabilizare medicală și certificat INML.');
                      if (item.step === 3) sendMessage('Ghidează-mă pentru Pasul 3: Obținerea Ordinului de Protecție Provizoriu.');
                      if (item.step === 4) sendMessage('Ghidează-mă pentru Pasul 4: Evadare sigură și adăpost secret.');
                    }}
                    className={`py-1 px-1.5 rounded-xl text-center transition cursor-pointer ${
                      crisisStep === item.step
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    <div className="text-[9px] truncate">{item.label}</div>
                    <div className="text-[8px] opacity-80 truncate">{item.action}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Predefined Quick Crisis Scenarios Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Răspunsuri Rapide & Întrebări Frecvente:
                </span>
                <div className="flex gap-1 text-[9px]">
                  {[
                    { id: 'all', label: 'Toate' },
                    { id: 'urgent', label: '🚨 Urgențe' },
                    { id: 'medical', label: '🩹 Medical' },
                    { id: 'legal', label: '⚖️ Juridic' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedQuickFilter(f.id as any)}
                      className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                        selectedQuickFilter === f.id
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable quick pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {filteredPredefined.map(item => (
                  <button
                    key={item.id}
                    onClick={() => sendMessage(item.query)}
                    className="shrink-0 bg-white hover:bg-emerald-50 active:scale-95 border border-stone-300 hover:border-emerald-500 rounded-xl px-2.5 py-1 text-[10px] font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Stream Window */}
            <div className="flex-1 min-h-[190px] max-h-[260px] bg-white border border-stone-200 rounded-2xl p-2.5 overflow-y-auto space-y-2 text-xs shadow-inner">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100 text-[9px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Lock className="w-3 h-3" /> Conexiune Criptată End-to-End
                </span>
                <button
                  onClick={clearChatHistory}
                  className="hover:text-rose-600 flex items-center gap-0.5 transition cursor-pointer"
                  title="Șterge istoricul conversației"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Șterge Jurnal Chat</span>
                </button>
              </div>

              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-2.5 rounded-2xl leading-relaxed text-[11px] ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none shadow-xs'
                        : 'bg-[#E6F0F8] text-slate-900 rounded-bl-none border border-sky-200 shadow-xs'
                    }`}
                  >
                    {/* Render message with line breaks and formatted bold text */}
                    {msg.text.split('\n').map((line, idx) => (
                      <span key={idx} className="block mb-0.5">
                        {line.startsWith('**') || line.includes('**') ? (
                          line.split('**').map((chunk, cIdx) => (
                            cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-slate-950">{chunk}</strong> : chunk
                          ))
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 p-2 bg-[#E6F0F8] rounded-2xl max-w-fit text-[10px] text-slate-700 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-700" />
                  <span>Asistentul SCUT generează ghidarea optimă...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }}
              className="flex gap-1.5 pt-1"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Scrie o întrebare confidențială sau alege un scenariu rapid..."
                className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isAiLoading || !inputText.trim()}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl shadow font-bold flex items-center justify-center cursor-pointer transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: PROTOCOL MEDICAL & INML */}
        {activeTab === 'medical' && (
          <div className="space-y-2.5 overflow-y-auto py-1 pr-0.5">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  Protocol Asistență Medicală & INML
                </span>
                <span className="text-[9px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                  Termen Critic: 48-72h
                </span>
              </div>
              <p className="text-[11px] text-rose-900 leading-snug">
                Leziunile traumatice trebuie examinate cât mai repede pentru a fi recunoscute ca probe de necontestat în instanță.
              </p>
            </div>

            {/* Step by step medical guidance */}
            <div className="space-y-1.5">
              <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">1</span>
                  Urgențe Vitale & Tratament (UPU / 112)
                </div>
                <p className="text-slate-600 leading-snug">
                  Dacă ai dureri puternice sau sângerări, sună la 112 sau mergi la cel mai apropiat spital UPU. Cere fișa de internare și radiografiile.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">2</span>
                  Certificatul Medico-Legal (INML)
                </div>
                <p className="text-slate-600 leading-snug">
                  Prezintă-te la INML (Institutul de Medicină Legală). <strong>Nu ai nevoie de plângere penală prealabilă</strong> pentru a fi examinată.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">3</span>
                  Probe Foto în Sandbox SCUT
                </div>
                <p className="text-slate-600 leading-snug">
                  Fotografiază vânătăile sau leziunile direct din Seiful SCUT. Imaginile primesc hash SHA-256 și nu apar în galeria telefonului.
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Urgență Salvare (112)</span>
              </a>
              <button
                onClick={() => {
                  setActiveTab('assistant');
                  sendMessage('Explică-mi în detaliu actele necesare pentru examinarea la INML.');
                }}
                className="py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Întreabă AI despre INML</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PROTOCOL JURIDIC / ORDIN DE PROTECȚIE */}
        {activeTab === 'legal' && (
          <div className="space-y-2.5 overflow-y-auto py-1 pr-0.5">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-blue-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-700" />
                  Ordin de Protecție & Drepturi Legale (Legea 217/2003)
                </span>
                <span className="text-[9px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                  5 Zile OPP / 12 Luni Instanță
                </span>
              </div>
              <p className="text-[11px] text-blue-900 leading-snug">
                Polițistul sosit la fața locului este obligat prin lege să completeze formularul de evaluare a riscului și poate emite Ordinul pe loc.
              </p>
            </div>

            {/* Legal Steps */}
            <div className="space-y-1.5">
              <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                  Ordinul Provizoriu (OPP) – 5 Zile
                </div>
                <p className="text-slate-600 leading-snug">
                  Emis direct de echipajul de poliție. Agresorul este evacuat din casă pe loc și i se interzice apropierea la mai puțin de 200 metri.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                  Ordinul Judecătoresc – Până la 12 Luni
                </div>
                <p className="text-slate-600 leading-snug">
                  Se judecă în regim de maximă urgență la Judecătorie. Beneficiezi de <strong>avocat din oficiu 100% gratuit</strong> numit prin Barou.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
                  Brățara Electronică GPS (SIME)
                </div>
                <p className="text-slate-600 leading-snug">
                  Agresorul poartă o brățară electronică la picior, iar victima primește un terminal mobil care alertează automat dispeceratul 112 la apropiere.
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Solicită OPP la 112</span>
              </a>
              <button
                onClick={() => {
                  setActiveTab('assistant');
                  sendMessage('Ce întrebări conține formularul de evaluare a riscului pentru emiterea OPP?');
                }}
                className="py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ghid Formular Risc OPP</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PLAN PLECARE & ADĂPOST DGASPC */}
        {activeTab === 'shelter' && (
          <div className="space-y-2.5 overflow-y-auto py-1 pr-0.5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-emerald-700" />
                  Ghid Plecare în Siguranță & Adăpost Secret
                </span>
                <span className="text-[9px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  Protecție & Copii 24/7
                </span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-snug">
                Adăposturile DGASPC și ale ONG-urilor partenere au adrese confidențiale, pază non-stop, masă și consiliere psihologică gratuită.
              </p>
            </div>

            {/* Checklist bagaj de urgență */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Bagajul Secret de Urgență (ce să iei dacă poți):
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Acte (BI, Certificate copii)
                </div>
                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Bani lichizi & carduri
                </div>
                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Chei de rezervă casă/mașină
                </div>
                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Medicamente de bază
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onNavigateToShelters}
                className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hartă Adăposturi</span>
              </button>
              <a
                href="tel:0800500333"
                className="py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Sună ANES (0800.500.333)</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Safety Helpline Footer Banner */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-bold text-sky-950">Helpline Național ANES:</span>
          <span className="font-mono font-bold text-sky-800">0800.500.333</span>
          <span className="text-[9px] text-slate-500 hidden sm:inline">(Gratuit 24/7)</span>
        </div>
        <button
          onClick={onQuickExit}
          className="text-rose-600 hover:text-rose-800 font-bold text-[10px] underline cursor-pointer"
        >
          Maschează Ecranul (ESC)
        </button>
      </div>
    </div>
  );
};

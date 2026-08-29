import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  ShieldAlert, 
  Radio, 
  Volume2, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  HelpCircle, 
  Activity, 
  Lock, 
  Sliders, 
  Clock,
  EyeOff,
  AlertTriangle,
  Play
} from 'lucide-react';
import { VoiceTriggerConfig, VoiceTriggerEvent } from '../types/scut';
import { PRESET_TRIGGER_KEYWORDS } from '../data/mockData';

interface VoiceTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceTriggerConfig;
  onUpdateConfig: (newConfig: VoiceTriggerConfig) => void;
  voiceEvents: VoiceTriggerEvent[];
  isListening: boolean;
  audioLevel: number;
  latestTranscript: string;
  interimTranscript: string;
  onSimulateVoicePhrase: (phrase: string) => void;
  activeScreenMode: string;
}

export const VoiceTriggerModal: React.FC<VoiceTriggerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  voiceEvents,
  isListening,
  audioLevel,
  latestTranscript,
  interimTranscript,
  onSimulateVoicePhrase,
  activeScreenMode
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'test_lab' | 'history'>('config');
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');
  const [customPhraseToTest, setCustomPhraseToTest] = useState<string>('');
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleEnable = () => {
    onUpdateConfig({
      ...config,
      enabled: !config.enabled
    });
  };

  const handleSelectPrimaryKeyword = (kw: string) => {
    onUpdateConfig({
      ...config,
      primaryKeyword: kw
    });
  };

  const handleAddSecondaryKeyword = () => {
    const trimmed = newKeywordInput.trim();
    if (!trimmed) return;
    if (config.secondaryKeywords.includes(trimmed) || config.primaryKeyword.toLowerCase() === trimmed.toLowerCase()) {
      return;
    }
    onUpdateConfig({
      ...config,
      secondaryKeywords: [...config.secondaryKeywords, trimmed]
    });
    setNewKeywordInput('');
  };

  const handleRemoveSecondaryKeyword = (kwToRemove: string) => {
    onUpdateConfig({
      ...config,
      secondaryKeywords: config.secondaryKeywords.filter(k => k !== kwToRemove)
    });
  };

  const handleRunSimulation = (phrase: string) => {
    setTestFeedback(`🎙️ Declanșare simulată pentru: „${phrase}”`);
    onSimulateVoicePhrase(phrase);
    setTimeout(() => setTestFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans select-none">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white transition shadow-sm ${
              config.enabled ? 'bg-rose-600 shadow-rose-600/30 animate-pulse' : 'bg-stone-500'
            }`}>
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Declanșator Vocal SOS Automat</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  config.enabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-100 text-stone-600'
                }`}>
                  {config.enabled ? '● Monitorizare Activă' : '○ Dezactivat'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Activare protocol de urgență prin recunoaștere cuvinte cheie chiar și cu ecranul camuflat sau blocat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio & Recognition Status Capsule */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${config.enabled && isListening ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
              <span className="font-semibold text-slate-200">
                {config.enabled 
                  ? (isListening ? 'Microfon în fundal: Ascultă activ...' : 'Inițializare motor vocal...') 
                  : 'Senzor vocal oprit'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Ecran curent: <strong className="text-teal-300">{activeScreenMode}</strong>
            </span>
          </div>

          {/* Audio Waveform Bars */}
          <div className="flex items-center gap-1.5 h-5 px-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex-1 flex items-center gap-1 h-full">
              {[15, 35, 65, 85, 45, 95, 30, 70, 50, 80, 20, 60, 40, 90, 30, 75, 45, 85, 25, 55].map((heightPct, idx) => {
                const isActiveBar = config.enabled && (audioLevel > 5 ? (idx % 3 === 0 || audioLevel > idx * 4) : false);
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-all duration-75 ${
                      isActiveBar ? 'bg-teal-400' : 'bg-slate-700/60'
                    }`}
                    style={{
                      height: isActiveBar ? `${Math.max(20, Math.min(100, audioLevel * (heightPct / 60)))}%` : '20%'
                    }}
                  />
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-teal-400 w-9 text-right">{audioLevel}% dB</span>
          </div>

          {/* Live Transcript Display */}
          {(latestTranscript || interimTranscript) && (
            <div className="text-[11px] bg-slate-800/90 rounded-xl p-2 border border-slate-700 text-slate-300">
              <span className="text-stone-400 text-[10px] block mb-0.5">Recunoaștere vorbire în timp real:</span>
              <p className="font-mono text-white">
                {latestTranscript} <span className="text-teal-300 italic">{interimTranscript}</span>
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'config' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configurare & Cuvinte Cheie</span>
          </button>

          <button
            onClick={() => setActiveTab('test_lab')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'test_lab' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulator & Testare Vocală</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Istoric Declanșări ({voiceEvents.length})</span>
          </button>
        </div>

        {/* TAB 1: CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="space-y-4 text-xs text-slate-700">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Activare Declanșator Vocal Continuu</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Menține microfonul activ în fundal pentru detecția frazelor de pericol chiar dacă ești în Calculator sau pe ecranul blocat.
                </p>
              </div>
              <button
                onClick={handleToggleEnable}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 cursor-pointer ${
                  config.enabled ? 'bg-teal-600' : 'bg-stone-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Primary & Preset Keywords Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-xs">
                  Cuvânt / Frază Cheie Principală de Declanșare:
                </label>
                <span className="text-[10px] text-stone-500">Selectează sau personalizează</span>
              </div>

              {/* Preset selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TRIGGER_KEYWORDS.map(item => {
                  const isSelected = config.primaryKeyword.toLowerCase() === item.keyword.toLowerCase();
                  return (
                    <button
                      key={item.keyword}
                      onClick={() => handleSelectPrimaryKeyword(item.keyword)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-400' 
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>„{item.keyword}”</span>
                          {isSelected && <span className="text-[10px] text-rose-600 font-semibold">(Activ)</span>}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{item.description}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold inline-block mt-1 ${
                          item.stealthLevel.includes('Maxim') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Nivel Deghizare: {item.stealthLevel}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Keywords List */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Cuvinte Cheie Secundare / Sinonime Suportate:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {config.secondaryKeywords.map(kw => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-slate-800 text-xs shadow-xs"
                  >
                    <span>„{kw}”</span>
                    <button
                      onClick={() => handleRemoveSecondaryKeyword(kw)}
                      className="hover:text-rose-600 transition"
                      title="Șterge cuvânt cheie"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Keyword */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adaugă alt cuvânt sau frază secretă..."
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSecondaryKeyword()}
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleAddSecondaryKeyword}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adaugă</span>
                </button>
              </div>
            </div>

            {/* Stealth & Action Behavior Settings */}
            <div className="space-y-2 pt-1">
              <h3 className="font-bold text-slate-900 text-xs">Măsuri de Securitate la Declanșare:</h3>

              {/* Silent Camouflaged Mode Toggle */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-start gap-2.5 pr-2">
                  <EyeOff className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-950 text-xs block">
                      Mod Silențios & Camuflat (Zero Suspiciune)
                    </span>
                    <p className="text-[11px] text-teal-800 mt-0.5 leading-snug">
                      La rostirea cuvântului, ecranul <strong>RĂMÂNE în Calculator / Vreme</strong> fără să sară la ecranul SOS, dar trimite imediat alerta la 112, pornește înregistrarea audio și alertează contactele în fundal.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.silentMode}
                  onChange={(e) => onUpdateConfig({ ...config, silentMode: e.target.checked })}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <label className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-slate-800">Înregistrare audio vault</span>
                  <input
                    type="checkbox"
                    checked={config.recordAudioOnTrigger}
                    onChange={(e) => onUpdateConfig({ ...config, recordAudioOnTrigger: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>

                <label className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-slate-800">Transmitere GPS 112</span>
                  <input
                    type="checkbox"
                    checked={config.dispatch112OnTrigger}
                    onChange={(e) => onUpdateConfig({ ...config, dispatch112OnTrigger: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>

                <label className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-slate-800">SMS Camuflat Contacte</span>
                  <input
                    type="checkbox"
                    checked={config.notifyContactsOnTrigger}
                    onChange={(e) => onUpdateConfig({ ...config, notifyContactsOnTrigger: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEST LAB & SIMULATOR */}
        {activeTab === 'test_lab' && (
          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-sky-950">
              <span className="font-bold block text-xs mb-1">Laborator de Testare Voice SOS</span>
              <p className="text-[11px] leading-snug text-sky-900">
                Poți testa funcționalitatea vorbind direct în microfonul dispozitivului sau apăsând pe butoanele de simulare rapidă de mai jos pentru a verifica reacția sistemului în orice ecran.
              </p>
            </div>

            {testFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold rounded-xl text-xs animate-fade-in flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testFeedback}</span>
              </div>
            )}

            {/* Quick Test Chips */}
            <div>
              <span className="font-bold text-slate-900 block text-xs mb-1.5">
                Apasă pentru a simula rostirea cuvântului cheie:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleRunSimulation('Ajutor')}
                  className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Spune: „Ajutor!”</span>
                </button>

                <button
                  onClick={() => handleRunSimulation('Cod Roșu')}
                  className="p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Spune: „Cod Roșu”</span>
                </button>

                <button
                  onClick={() => handleRunSimulation('Trandafir roșu')}
                  className="p-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Spune: „Trandafir roșu”</span>
                </button>

                <button
                  onClick={() => handleRunSimulation('Salvați-mă')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Spune: „Salvați-mă”</span>
                </button>

                <button
                  onClick={() => handleRunSimulation('Am uitat cheile')}
                  className="p-2.5 bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Spune: „Am uitat cheile”</span>
                </button>

                <button
                  onClick={() => handleRunSimulation('Scut 112')}
                  className="p-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Spune: „Scut 112”</span>
                </button>
              </div>
            </div>

            {/* Custom Sentence Simulator */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Testează o frază rostită personalizată:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Exemplu: Te rog oprește-te, am nevoie de ajutor urgent..."
                  value={customPhraseToTest}
                  onChange={(e) => setCustomPhraseToTest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && customPhraseToTest && handleRunSimulation(customPhraseToTest)}
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => customPhraseToTest && handleRunSimulation(customPhraseToTest)}
                  disabled={!customPhraseToTest}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Testează</span>
                </button>
              </div>
            </div>

            {/* How it works in background guidance */}
            <div className="p-3 bg-stone-100 rounded-2xl text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">💡 Cum funcționează protecția în fundal:</span>
              <p>
                1. <strong>Calculator activ:</strong> Dacă agresorul te forțează să folosești telefonul și spui cuvântul cheie într-o conversație, SCUT nu deschide ecranul roșu, dar trimite imediat dosarul și coordonatele tale la 112.
              </p>
              <p>
                2. <strong>Ecran blocat:</strong> Motorul de recunoaștere Web Speech rulează continuu în fundal, captând sunetul prin buffer audio securizat.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Jurnal Detecție Evenimente Vocale</span>
              <span className="text-[10px] text-slate-500">{voiceEvents.length} evenimente înregistrate</span>
            </div>

            {voiceEvents.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-stone-200 text-slate-400">
                <Mic className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-xs">Nicio declanșare vocală înregistrată până acum.</p>
                <p className="text-[10px] mt-0.5">Testează spunând „Ajutor” sau folosind simulatorul din tabul anterior.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {voiceEvents.map(evt => (
                  <div key={evt.id} className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Cuvânt: „{evt.keywordDetected}”</span>
                        {evt.isSilent && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-semibold">
                            Silențios
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500">{evt.timeString}</span>
                    </div>

                    <p className="text-[11px] font-mono text-slate-600 bg-white p-1.5 rounded border border-stone-200">
                      „{evt.rawTranscript}”
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Stare telefon: <strong className="text-slate-800">{evt.modeAtTrigger}</strong></span>
                      <span className="text-emerald-700 font-semibold">✓ Dispecerat 112 & Audio Salvat</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Salvează & Închide
          </button>
        </div>

      </div>
    </div>
  );
};

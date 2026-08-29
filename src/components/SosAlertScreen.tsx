import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Radio, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  X, 
  Mic, 
  AlertTriangle,
  Volume2
} from 'lucide-react';

interface SosAlertScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
  voiceTriggeredKeyword?: string | null;
}

export const SosAlertScreen: React.FC<SosAlertScreenProps> = ({ onBack, onQuickExit, voiceTriggeredKeyword }) => {
  const [sosSent, setSosSent] = useState<boolean>(Boolean(voiceTriggeredKeyword));
  const [silentAlertSent, setSilentAlertSent] = useState<boolean>(false);
  const [audioRecording, setAudioRecording] = useState<boolean>(Boolean(voiceTriggeredKeyword));
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);
  const [simulatedCalling, setSimulatedCalling] = useState<boolean>(false);
  const [etaMinutes, setEtaMinutes] = useState<number>(3);

  useEffect(() => {
    if (voiceTriggeredKeyword) {
      setSosSent(true);
      setAudioRecording(true);
    }
  }, [voiceTriggeredKeyword]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosSent && etaMinutes > 1) {
      timer = setInterval(() => {
        setEtaMinutes(prev => (prev > 1 ? prev - 1 : 1));
      }, 45000);
    }
    return () => clearInterval(timer);
  }, [sosSent, etaMinutes]);

  const handleTriggerSos = () => {
    setSosSent(true);
    setAudioRecording(true);
  };

  const handleTriggerSilentAlert = () => {
    setSilentAlertSent(true);
    setAudioRecording(true);
  };

  const handleStart112Call = () => {
    setCallModalOpen(false);
    setSimulatedCalling(true);
    setSosSent(true);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header with Back & Panic X */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>URGENȚĂ SOS</span>
        </div>

        <button
          id="btn-sos-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition"
          title="Ieșire Rapidă"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main SOS Content */}
      <div className="my-auto py-2 space-y-3">
        {/* Live GPS Map Simulation Container */}
        <div className="relative w-full h-44 bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner flex flex-col justify-between p-3">
          {/* Simulated Map Visual Vector Background */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Simulated Road Lines */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-400/60" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 50 Q 150 120 400 80" fill="none" strokeWidth="6" strokeDasharray="4 2" />
            <path d="M 120 0 L 120 200" fill="none" strokeWidth="8" />
            <path d="M 280 0 L 220 200" fill="none" strokeWidth="5" />
            <circle cx="180" cy="90" r="40" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* User Location Live Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 animate-ping absolute inset-0"></div>
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded-full shadow backdrop-blur whitespace-nowrap">
              Locația Ta Curentă (±3m)
            </div>
          </div>

          {/* Top Map GPS Overlay Info */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono bg-white/90 px-2 py-1 rounded-md border border-slate-300 font-semibold text-slate-800 shadow-sm">
              GPS: 44.4378° N, 26.0946° E
            </span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Live Geolocation
            </span>
          </div>

          {/* Nearest Police / Emergency distance badge */}
          <div className="z-10 self-start">
            <span className="text-[10px] bg-slate-900/85 text-slate-100 px-2 py-1 rounded-md shadow-sm">
              Secția 1 Poliție: <strong>850 metri</strong> distanță
            </span>
          </div>
        </div>

        {/* Voice Trigger Detected Banner */}
        {voiceTriggeredKeyword && (
          <div className="bg-rose-950 text-white border border-rose-500/80 rounded-2xl p-2.5 shadow-md animate-fade-in flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-rose-200 block">
                  Protocol SOS Declanșat Vocal
                </span>
                <span className="text-[10px] text-stone-300">
                  Cuvânt detectat: <strong className="text-white bg-rose-900/60 px-1.5 py-0.5 rounded font-mono">„{voiceTriggeredKeyword}”</strong>
                </span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
              AUTO-DISPATCH
            </span>
          </div>
        )}

        {/* SOS Sent Status Feedback Banner */}
        {(sosSent || silentAlertSent) && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 text-emerald-950 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Alerta SOS Trimisă. Echipele sunt pe drum.</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Dispeceratul 112 a recepționat poziția ta și dosarul preliminar. Rămâi pe loc dacă ești într-un spațiu sigur.
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Timp estimat sosire (ETA): <strong>~{etaMinutes} minute</strong>
              </span>
              <span className="text-[10px] font-mono text-emerald-700">Cod: #SOS-112-RO</span>
            </div>
          </div>
        )}

        {/* Ambient Audio Stream Active Indicator */}
        {audioRecording && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-2 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="text-[11px] font-semibold">Înregistrare ambientală probă activă</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
              Salvat direct în Vault
            </span>
          </div>
        )}

        {/* Simulated Active Call Screen Modal / Bar */}
        {simulatedCalling && (
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">Apel 112 în curs...</div>
                <div className="text-[10px] text-slate-300">Dispecerat Național Unic pentru Apeluri de Urgență</div>
              </div>
            </div>
            <button
              onClick={() => setSimulatedCalling(false)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg"
            >
              Închide
            </button>
          </div>
        )}

        {/* Action Buttons: Sună 112 & Trimite Alertă Silențioasă */}
        <div className="space-y-2 pt-1">
          {/* Button 1: Call 112 */}
          <button
            id="btn-call-112"
            onClick={() => setCallModalOpen(true)}
            className="w-full h-14 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>SUNĂ 112 (URGENȚĂ)</span>
          </button>

          {/* Button 2: Silent Alert to Dispatch */}
          <button
            id="btn-silent-alert"
            onClick={handleTriggerSilentAlert}
            className="w-full h-12 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer border border-slate-700"
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Trimite Alertă Silențioasă la Dispecerat</span>
          </button>
        </div>
      </div>

      {/* Safety Protocol Guidance */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2.5 text-[11px] text-slate-700">
        <p className="font-semibold text-slate-900 mb-0.5">Protocol de Siguranță:</p>
        <p className="leading-tight text-slate-600">
          Dacă agresorul se apropie, apasă tasta <strong>ESC</strong> sau butonul <strong>[X]</strong>. Dispeceratul va continua localizarea pe baza alertei deja transmise.
        </p>
      </div>

      {/* 112 Confirmation Modal */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-xs w-full text-slate-900 shadow-2xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-center">Confirmare Apel 112</h3>
            <p className="text-xs text-slate-600 text-center mt-1 leading-snug">
              Ești pe cale să inițiezi un apel vocal direct către Serviciul de Urgență 112.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl"
              >
                Anulează
              </button>
              <button
                onClick={handleStart112Call}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Inițiază Apel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

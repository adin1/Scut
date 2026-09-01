import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Mic, 
  MicOff, 
  Radio, 
  CheckCircle, 
  X, 
  Volume2,
  ScanFace,
  Fingerprint
} from 'lucide-react';
import { AppMode, BiometricConfig } from '../types/scut';

interface PhoneFrameProps {
  children: React.ReactNode;
  currentMode: AppMode;
  onQuickExit: () => void;
  onOpenDocs: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenVoiceSettings: () => void;
  onQuickVoiceTrigger: (phrase: string) => void;
  voiceTriggerEnabled: boolean;
  voicePrimaryKeyword: string;
  isVoiceListening: boolean;
  audioLevel: number;
  silentSosActiveToast: { keyword: string; timestamp: number } | null;
  onDismissSilentToast: () => void;
  onOpenActiveSos: () => void;
  biometricConfig: BiometricConfig;
  onOpenBiometricSettings: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  currentMode,
  onQuickExit,
  onOpenDocs,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenVoiceSettings,
  onQuickVoiceTrigger,
  voiceTriggerEnabled,
  voicePrimaryKeyword,
  isVoiceListening,
  audioLevel,
  silentSosActiveToast,
  onDismissSilentToast,
  onOpenActiveSos,
  biometricConfig,
  onOpenBiometricSettings
}) => {
  const [currentTime, setCurrentTime] = useState<string>('12:45');
  const [isWideView, setIsWideView] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut ESC for Quick Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onQuickExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onQuickExit]);

  const triggerShakeSimulation = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      onQuickExit();
    }, 600);
  };

  const isCamouflaged = currentMode === 'calculator' || currentMode === 'phone_home' || currentMode === 'duress_weather' || currentMode === 'quick_exit_decoy';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 select-none font-sans">
      {/* Top Global Control Toolbar */}
      <header className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-stone-900/90 backdrop-blur border border-stone-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">SCUT • Platformă de Camuflaj</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold ${
                isCamouflaged 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isCamouflaged ? 'Mod Camuflat Activ' : 'Mod Securizat SCUT'}
              </span>
            </div>
            <p className="text-xs text-stone-400">Protecție, asistență 112 și jurnal de probe pentru victimele violenței domestice</p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Voice Guardian Button & Status */}
          <button
            id="btn-voice-trigger-settings"
            onClick={onOpenVoiceSettings}
            title="Configurează și testează declanșatorul vocal automat SOS"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              voiceTriggerEnabled
                ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-600/60 shadow-xs'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border-stone-700'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Mic className={`w-3.5 h-3.5 ${voiceTriggerEnabled ? 'text-rose-400' : 'text-stone-500'}`} />
              {voiceTriggerEnabled && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              )}
            </div>
            <span className="font-mono">Voice SOS: {voiceTriggerEnabled ? `„${voicePrimaryKeyword}”` : 'Oprit'}</span>
          </button>

          {/* Biometric 2FA Gate Button */}
          <button
            id="btn-biometric-settings"
            onClick={onOpenBiometricSettings}
            title="Configurează scanarea biometrică 2FA (FaceID / Amprentă)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              biometricConfig.enabled
                ? 'bg-teal-950/80 hover:bg-teal-900 text-teal-200 border-teal-600/60 shadow-xs'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border-stone-700'
            }`}
          >
            {biometricConfig.preferredMethod === 'face_id' ? (
              <ScanFace className="w-3.5 h-3.5 text-teal-400" />
            ) : (
              <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span className="font-mono">
              2FA: {biometricConfig.enabled ? (biometricConfig.preferredMethod === 'face_id' ? 'Face ID' : 'Touch ID') : 'Oprit'}
            </span>
          </button>

          {/* Quick Voice Simulation Shortcut */}
          <button
            id="btn-voice-quick-test"
            onClick={() => onQuickVoiceTrigger(voicePrimaryKeyword)}
            title={`Simulează rostirea cuvântului cheie „${voicePrimaryKeyword}” chiar acum`}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <span>🗣️ Spune: „{voicePrimaryKeyword}”</span>
          </button>

          {/* Quick Exit Panic Trigger */}
          <button
            id="btn-global-quick-exit"
            onClick={onQuickExit}
            title="Închide instant aplicația și deschide Google (Tasta ESC)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Ieșire Rapidă (ESC)</span>
          </button>

          {/* Shake Simulation */}
          <button
            id="btn-simulate-shake"
            onClick={triggerShakeSimulation}
            title="Simulează agitarea telefonului pentru închidere de urgență"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg border border-stone-700 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Simulează Agitare</span>
          </button>

          {/* Notifications Simulator */}
          <button
            id="btn-disguised-notifs"
            onClick={onOpenNotifications}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg border border-stone-700 transition cursor-pointer"
          >
            <span>Notificări Camuflate</span>
            {unreadNotificationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            )}
          </button>

          {/* Docs & Spec */}
          <button
            id="btn-open-spec-docs"
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Specificații Tehnice</span>
          </button>

          {/* Layout Toggle */}
          <button
            id="btn-toggle-layout"
            onClick={() => setIsWideView(!isWideView)}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 transition cursor-pointer"
            title={isWideView ? 'Vizualizare Telefon Mobil' : 'Vizualizare Extinsă'}
          >
            {isWideView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Simulator Device Body */}
      <main className="w-full flex items-center justify-center">
        <div
          className={`transition-all duration-300 ${
            isShaking ? 'animate-bounce' : ''
          } ${
            isWideView 
              ? 'w-full max-w-5xl min-h-[780px] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden' 
              : 'w-full max-w-[390px] h-[820px] max-h-[92vh] bg-stone-950 border-[10px] border-stone-800 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative ring-1 ring-stone-700/50'
          }`}
        >
          {/* Smartphone Hardware Notch / Dynamic Island */}
          {!isWideView && (
            <div className="w-full pt-3 pb-1 px-7 flex items-center justify-between bg-black text-stone-300 text-xs font-medium shrink-0 z-30 select-none">
              <span className="font-semibold tracking-tight">{currentTime}</span>
              
              {/* Dynamic Island Capsule with Voice Monitoring Dot */}
              <div 
                onClick={onOpenVoiceSettings}
                title="Senzor Vocal de Urgență Activ"
                className="h-5 bg-stone-900 rounded-full flex items-center justify-center gap-2 px-2.5 border border-stone-800/80 cursor-pointer hover:border-stone-700 transition"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-stone-800 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/60"></div>
                </div>
                
                {/* Voice Listener Status Dot in Dynamic Island */}
                {voiceTriggerEnabled ? (
                  <div className="flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5 text-teal-400" />
                    <div className={`w-1.5 h-1.5 rounded-full ${audioLevel > 15 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-600"></div>
                )}
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-stone-300" />
                <span className="text-[10px] font-mono">5G</span>
                <div className="flex items-center gap-0.5">
                  <Battery className="w-4 h-4 text-stone-300" />
                </div>
              </div>
            </div>
          )}

          {/* Discreet Silent SOS Toast when triggered silently in disguised mode */}
          {silentSosActiveToast && (
            <div className="z-40 bg-stone-950/95 border-b border-rose-500/80 px-3 py-2 text-stone-100 flex items-center justify-between shadow-lg backdrop-blur animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-rose-300 block">
                    Protocol SOS Silențios Declanșat Vocal
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Cuvânt: „{silentSosActiveToast.keyword}” • Dispecerat 112 notificat & Audio pornit
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenActiveSos}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded"
                >
                  Vezi SOS
                </button>
                <button
                  onClick={onDismissSilentToast}
                  className="p-1 text-stone-400 hover:text-white"
                  title="Păstrează camuflajul"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Screen Content Container */}
          <div className="flex-1 overflow-y-auto relative bg-[#F4F4F4] text-stone-900 flex flex-col">
            {children}
          </div>

          {/* Smartphone Bottom Home Bar */}
          {!isWideView && (
            <div className="h-5 bg-black flex items-center justify-center shrink-0 z-30">
              <div className="w-32 h-1 bg-stone-500 rounded-full"></div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Helper text */}
      <footer className="w-full max-w-5xl mt-3 text-center text-xs text-stone-500 flex flex-wrap items-center justify-center gap-4">
        <span>🎙️ Declanșator Vocal: <strong className="text-rose-400">Spune „{voicePrimaryKeyword}” oricând</strong></span>
        <span>🔐 Cod Standard: <strong className="text-stone-300">1234=</strong></span>
        <span>⚠️ PIN Constrângere: <strong className="text-amber-400">0000=</strong></span>
        <span>🚨 Ieșire de urgență: <strong className="text-rose-400">Tasta ESC</strong></span>
      </footer>
    </div>
  );
};

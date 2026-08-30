import React, { useState } from 'react';
import { 
  ScanFace, 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  X, 
  Check, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  Cpu, 
  Vibrate, 
  Eye, 
  KeyRound,
  RotateCcw,
  Zap
} from 'lucide-react';
import { BiometricConfig, BiometricMethod } from '../types/scut';

interface BiometricSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BiometricConfig;
  onUpdateConfig: (newConfig: BiometricConfig) => void;
  onLaunchTestGate: () => void;
}

export const BiometricSettingsModal: React.FC<BiometricSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onLaunchTestGate
}) => {
  const [localConfig, setLocalConfig] = useState<BiometricConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Securitate Biometrică 2FA
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                  Enclave Guard
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Poartă de autentificare suplimentară la trecerea din Calculator în SCUT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* 1. Master Toggle */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="space-y-0.5 pr-4">
              <span className="font-bold text-sm text-white block">
                Activează Poarta Biometrică (2FA)
              </span>
              <p className="text-slate-400 text-[11px]">
                După introducerea codului <code>1234=</code> în calculator, solicită confirmare facială sau amprentă înainte de a deschide dosarele.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={localConfig.enabled}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {/* 2. Preferred Biometric Modality */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block">Metoda Biometrică Preferată</label>
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Face ID */}
              <button
                type="button"
                onClick={() => setLocalConfig(prev => ({ ...prev, preferredMethod: 'face_id' }))}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center space-y-2 transition cursor-pointer ${
                  localConfig.preferredMethod === 'face_id'
                    ? 'bg-teal-950/40 border-teal-400 text-teal-200 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  localConfig.preferredMethod === 'face_id' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  <ScanFace className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-white">Face ID (Scanare 3D)</span>
                  <span className="text-[10px] text-slate-400">Verificare optică & adâncime</span>
                </div>
              </button>

              {/* Fingerprint */}
              <button
                type="button"
                onClick={() => setLocalConfig(prev => ({ ...prev, preferredMethod: 'fingerprint' }))}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center space-y-2 transition cursor-pointer ${
                  localConfig.preferredMethod === 'fingerprint'
                    ? 'bg-teal-950/40 border-teal-400 text-teal-200 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  localConfig.preferredMethod === 'fingerprint' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-white">Amprentă Digitală</span>
                  <span className="text-[10px] text-slate-400">Senzor capacitiv/ultrasonic</span>
                </div>
              </button>

            </div>
          </div>

          {/* 3. Security Settings & Safeguards */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <span className="font-bold text-slate-300 block text-xs">Protecții Avansate Anti-Spoofing</span>

            {/* Liveness Detection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 text-xs block">Detecție Liveness (Anti-Fotografie)</span>
                  <span className="text-[10px] text-slate-400">Refuză deblocarea dacă se folosește o poză sau un ecran 2D</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.livenessDetection}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, livenessDetection: e.target.checked }))}
                className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
              />
            </div>

            {/* Duress Fingerprint Enabled */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-amber-200 text-xs block">Amprentă / Față Sub Constrângere</span>
                  <span className="text-[10px] text-slate-400">Dacă ești forțată, deblocarea cu degetul index stâng declanșează 112 silențios</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.duressFingerprintEnabled}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, duressFingerprintEnabled: e.target.checked }))}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 text-xs block">Vibrații Haptice Senzor</span>
                  <span className="text-[10px] text-slate-400">Micro-vibrații de confirmare la atingerea senzorului</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.hapticFeedback}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, hapticFeedback: e.target.checked }))}
                className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
              />
            </div>

            {/* Max failed attempts */}
            <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
              <span className="text-slate-300 text-xs">Limită încercări eșuate înainte de auto-blocare:</span>
              <select
                value={localConfig.maxFailedAttempts}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, maxFailedAttempts: Number(e.target.value) }))}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1"
              >
                <option value={1}>1 încercare</option>
                <option value={3}>3 încercări (recomandat)</option>
                <option value={5}>5 încercări</option>
              </select>
            </div>
          </div>

          {/* Test Scanner Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onUpdateConfig(localConfig);
                onLaunchTestGate();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-300 border border-teal-500/30 font-semibold flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-teal-400" />
              <span>Testează Poarta Biometrică Live</span>
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
          >
            Anulează
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Salvat!</span>
              </>
            ) : (
              <span>Salvează Configurația</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

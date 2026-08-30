import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanFace, 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  X, 
  RotateCcw, 
  Check, 
  Camera, 
  Cpu, 
  Zap, 
  KeyRound,
  Eye,
  Sparkles
} from 'lucide-react';
import { BiometricConfig, BiometricMethod } from '../types/scut';

interface BiometricAuthScreenProps {
  config: BiometricConfig;
  onSuccess: () => void;
  onDuressTrigger: () => void;
  onCancel: () => void;
  onQuickExit: () => void;
}

type ScanStatus = 'idle' | 'scanning' | 'analyzing' | 'success' | 'failed' | 'duress_triggered';

export const BiometricAuthScreen: React.FC<BiometricAuthScreenProps> = ({
  config,
  onSuccess,
  onDuressTrigger,
  onCancel,
  onQuickExit
}) => {
  const [selectedMethod, setSelectedMethod] = useState<BiometricMethod>(config.preferredMethod || 'face_id');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Autentificare biometrică necesară');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isHoldingFinger, setIsHoldingFinger] = useState<boolean>(false);
  const [useRealCamera, setUseRealCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimerRef = useRef<any>(null);

  // Trigger Haptics
  const triggerHaptic = (pattern: number[]) => {
    if (config.hapticFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  // FaceID Auto-scan simulation on mount if enabled
  useEffect(() => {
    if (config.autoScanOnTransition && selectedMethod === 'face_id' && status === 'idle') {
      startFaceIdScan();
    }
  }, [selectedMethod]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  const startFaceIdScan = () => {
    if (status === 'scanning' || status === 'analyzing') return;

    setStatus('scanning');
    setStatusMessage('Scanare trăsături faciale 3D...');
    setProgress(0);
    triggerHaptic([30]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);

      if (currentProgress === 40) {
        setStatusMessage('Verificare liveness & adâncime infraroșu...');
        triggerHaptic([30]);
      } else if (currentProgress === 80) {
        setStatus('analyzing');
        setStatusMessage('Decriptare cheie Secure Enclave...');
        triggerHaptic([40, 20, 40]);
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        handleScanSuccess();
      }
    }, 280);
  };

  const handleScanSuccess = () => {
    setStatus('success');
    setStatusMessage('Identitate confirmată • Acces acordat');
    triggerHaptic([60, 40, 100]);

    setTimeout(() => {
      onSuccess();
    }, 650);
  };

  const handleScanFailure = (reason = 'Trăsături nerecunoscute') => {
    setStatus('failed');
    setStatusMessage(`Eșec autentificare: ${reason}`);
    triggerHaptic([100, 50, 100, 50, 150]);
    const nextFailed = failedAttempts + 1;
    setFailedAttempts(nextFailed);

    if (nextFailed >= config.maxFailedAttempts) {
      setTimeout(() => {
        // Automatic safe lockout -> fallback to calculator or decoy
        onCancel();
      }, 1500);
    } else {
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setStatusMessage('Apasă pentru reîncercare');
      }, 1800);
    }
  };

  const handleDuressScan = () => {
    setStatus('duress_triggered');
    setStatusMessage('Verificare forțată detectată • Activare protocol silențios');
    triggerHaptic([200, 100, 200]);

    setTimeout(() => {
      onDuressTrigger();
    }, 800);
  };

  // Touch & Hold Fingerprint Logic
  const handleFingerTouchStart = () => {
    if (status === 'success' || status === 'duress_triggered') return;
    setIsHoldingFinger(true);
    setStatus('scanning');
    setStatusMessage('Menține degetul pe senzorul biometric...');
    setProgress(0);
    triggerHaptic([40]);

    let p = 0;
    holdTimerRef.current = setInterval(() => {
      p += 12;
      setProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(holdTimerRef.current);
        setIsHoldingFinger(false);
        setStatus('analyzing');
        setStatusMessage('Potrivire minunții amprentă digitală...');
        triggerHaptic([50, 30, 80]);
        setTimeout(() => {
          handleScanSuccess();
        }, 350);
      }
    }, 100);
  };

  const handleFingerTouchEnd = () => {
    if (progress < 100 && (status === 'scanning' || status === 'analyzing')) {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      setIsHoldingFinger(false);
      setStatus('idle');
      setProgress(0);
      setStatusMessage('Scanare întreruptă. Ține apăsat continuu.');
      triggerHaptic([80]);
    }
  };

  // Optional real camera preview for realistic demonstration
  const toggleRealCamera = async () => {
    if (useRealCamera) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setUseRealCamera(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setUseRealCamera(true);
      } catch {
        // Camera access denied or unavailable
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-950 text-white flex flex-col justify-between p-5 select-none font-sans relative overflow-hidden">
      
      {/* Background Subtle Tech Grid Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
      
      {/* Glowing Ambient Aura */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        status === 'success' ? 'bg-emerald-500/20' :
        status === 'failed' ? 'bg-rose-500/20' :
        status === 'duress_triggered' ? 'bg-amber-500/20' :
        'bg-teal-500/15'
      }`} />

      {/* Top Bar: Security Enclave & Quick Exit */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-[11px] text-slate-300 backdrop-blur-md">
          <Cpu className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-mono text-[10px]">Secure Enclave 2FA Gate</span>
        </div>

        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          title="Înapoi la Calculator (Anulare)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Biometric Centerstage */}
      <div className="flex flex-col items-center justify-center my-auto z-10 space-y-6">
        
        {/* Method Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              setSelectedMethod('face_id');
              setStatus('idle');
              setProgress(0);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedMethod === 'face_id' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>Face ID 3D</span>
          </button>

          <button
            onClick={() => {
              setSelectedMethod('fingerprint');
              setStatus('idle');
              setProgress(0);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedMethod === 'fingerprint' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Amprentă Digitală</span>
          </button>
        </div>

        {/* 1. FACE ID INTERACTIVE SCANNER */}
        {selectedMethod === 'face_id' && (
          <div className="flex flex-col items-center space-y-4">
            <div 
              onClick={startFaceIdScan}
              className={`relative w-44 h-44 rounded-3xl border-2 flex items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md ${
                status === 'success' 
                  ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]' 
                  : status === 'failed'
                  ? 'border-rose-500 bg-rose-950/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                  : status === 'scanning' || status === 'analyzing'
                  ? 'border-teal-400 bg-teal-950/20 shadow-[0_0_30px_rgba(45,212,191,0.25)]'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
              }`}
            >
              {/* Optional Camera Feed inside Face ID Box */}
              {useRealCamera && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover opacity-35 filter grayscale contrast-125"
                />
              )}

              {/* Corner Targeting Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-400/80 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-400/80 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-400/80 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-400/80 rounded-br-sm" />

              {/* Animated Laser Scanning Line */}
              {(status === 'scanning' || status === 'analyzing') && (
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_12px_#2dd4bf] animate-bounce duration-700 pointer-events-none"
                  style={{ top: `${progress}%` }}
                />
              )}

              {/* Central Dynamic Icon / Mesh */}
              {status === 'success' ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 animate-scale-up">
                  <Check className="w-10 h-10" />
                </div>
              ) : status === 'failed' ? (
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 animate-shake">
                  <X className="w-10 h-10" />
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  <ScanFace className={`w-20 h-20 transition-transform duration-300 ${
                    status === 'scanning' ? 'text-teal-400 scale-105 animate-pulse' : 'text-slate-400'
                  }`} />
                  {config.livenessDetection && (
                    <span className="text-[9px] font-mono text-teal-400/80 mt-1 uppercase tracking-widest">
                      3D Depth Active
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Toggle Real Camera Helper */}
            <button
              onClick={toggleRealCamera}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-teal-300 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{useRealCamera ? 'Oprește previzualizarea camerei' : 'Activează camera frontală (opțional)'}</span>
            </button>
          </div>
        )}

        {/* 2. FINGERPRINT SCANNER */}
        {selectedMethod === 'fingerprint' && (
          <div className="flex flex-col items-center space-y-4">
            <div
              onMouseDown={handleFingerTouchStart}
              onMouseUp={handleFingerTouchEnd}
              onTouchStart={handleFingerTouchStart}
              onTouchEnd={handleFingerTouchEnd}
              className={`relative w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden ${
                status === 'success'
                  ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
                  : status === 'failed'
                  ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                  : isHoldingFinger
                  ? 'border-teal-400 bg-teal-950/40 shadow-[0_0_25px_rgba(45,212,191,0.4)] scale-98'
                  : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
              }`}
            >
              {/* Circular Progress SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="72"
                  cy="72"
                  r="66"
                  className="stroke-slate-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="66"
                  className="stroke-teal-400 transition-all duration-75"
                  strokeWidth="4"
                  strokeDasharray={414}
                  strokeDashoffset={414 - (414 * progress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {status === 'success' ? (
                <Check className="w-12 h-12 text-emerald-400 animate-scale-up" />
              ) : status === 'failed' ? (
                <X className="w-12 h-12 text-rose-400 animate-shake" />
              ) : (
                <Fingerprint className={`w-16 h-16 transition-all duration-200 ${
                  isHoldingFinger ? 'text-teal-300 scale-110 animate-pulse' : 'text-slate-400'
                }`} />
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              {isHoldingFinger ? 'Scanez crestele papilare...' : 'Apasă și ține apăsat degetul pe senzor'}
            </p>
          </div>
        )}

        {/* Dynamic Status Text & Progress */}
        <div className="text-center space-y-1 max-w-xs">
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
            {status === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {status === 'failed' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
            {(status === 'scanning' || status === 'analyzing') && (
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            )}
            <span className={`transition-colors ${
              status === 'success' ? 'text-emerald-300' :
              status === 'failed' ? 'text-rose-400' :
              status === 'duress_triggered' ? 'text-amber-400' :
              'text-slate-200'
            }`}>
              {statusMessage}
            </span>
          </div>

          {failedAttempts > 0 && failedAttempts < config.maxFailedAttempts && (
            <p className="text-[10px] text-rose-400">
              Încercări eșuate: {failedAttempts} / {config.maxFailedAttempts} (La {config.maxFailedAttempts} se blochează în mod sigur)
            </p>
          )}
        </div>

        {/* Action / Simulation Controls for Complete Testing */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pb-1 border-b border-slate-800">
            <span>Simulator de Scenarii Biometrice:</span>
            <span className="text-teal-400">Garanție de Acces</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* 1. Simulate Success (Owner) */}
            <button
              onClick={handleScanSuccess}
              className="p-2 bg-teal-700/80 hover:bg-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-teal-200" />
              <span>Proprietar (Reușit)</span>
            </button>

            {/* 2. Simulate Mismatch (Unauthorized) */}
            <button
              onClick={() => handleScanFailure('Chip / Amprentă străină')}
              className="p-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulează Eșec</span>
            </button>
          </div>

          {/* 3. Simulate Duress Fingerprint / Forced Face Unlock */}
          {config.duressFingerprintEnabled && (
            <button
              onClick={handleDuressScan}
              className="w-full p-2 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer text-[11px]"
              title="Declanșează duress beacon și trimite alertă silențioasă 112"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Amprentă Sub Constrângere (Distress Decoy)</span>
            </button>
          )}
        </div>

      </div>

      {/* Bottom Footer Info */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 z-10">
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Calculator</span>
        </button>

        <span className="font-mono text-[10px] text-slate-500">
          Hardware Shield: <strong className="text-teal-500">AES-256</strong>
        </span>

        <button
          onClick={onQuickExit}
          className="text-rose-400 hover:text-rose-300 font-semibold transition"
        >
          Ieșire Panică
        </button>
      </div>

    </div>
  );
};

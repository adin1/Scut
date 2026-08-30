import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Cpu, 
  Key, 
  Hash, 
  FileCheck, 
  Sparkles,
  Zap,
  CheckCircle2,
  Binary
} from 'lucide-react';
import { EvidenceItem } from '../types/scut';

interface AesEncryptionModalProps {
  isOpen: boolean;
  item: EvidenceItem | null;
  onComplete: (item: EvidenceItem) => void;
  onCancel?: () => void;
}

interface EncryptionStep {
  id: number;
  label: string;
  sublabel: string;
  minProgress: number;
  maxProgress: number;
}

const ENCRYPTION_STEPS: EncryptionStep[] = [
  {
    id: 1,
    label: 'Izolare Sandbox & Curățare Metadate',
    sublabel: 'Eliminare trackere EXIF și izolare memorie volatilă RAM',
    minProgress: 0,
    maxProgress: 22
  },
  {
    id: 2,
    label: 'Generare Cheie 256-bit & Vector IV (96-bit)',
    sublabel: 'Derivare hardware PBKDF2-HMAC-SHA256 în Secure Enclave',
    minProgress: 23,
    maxProgress: 48
  },
  {
    id: 3,
    label: 'Criptare Blocuri AES-256-GCM',
    sublabel: '14 runde de substituție (SubBytes), ShiftRows & MixColumns',
    minProgress: 49,
    maxProgress: 78
  },
  {
    id: 4,
    label: 'Generare Hash Integritate SHA-256 & Tag GMAC',
    sublabel: 'Creare sigiliu probatoriu legal conform Legii 217/2003',
    minProgress: 79,
    maxProgress: 95
  },
  {
    id: 5,
    label: 'Sigiliu Aplicat • Fișier Încuiat în Seif',
    sublabel: 'Blocare finală în spațiul stocării criptate AES-256',
    minProgress: 96,
    maxProgress: 100
  }
];

export const AesEncryptionModal: React.FC<AesEncryptionModalProps> = ({
  isOpen,
  item,
  onComplete
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hexSnippet, setHexSnippet] = useState<string>('00 1a 3f 8c e2 b4 99 1f');
  const [processedBlocks, setProcessedBlocks] = useState<number>(0);
  const [totalBlocks, setTotalBlocks] = useState<number>(128);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !item) {
      setProgress(0);
      setCurrentStepIndex(0);
      setIsDone(false);
      return;
    }

    // Estimate total AES 128-bit blocks based on file size string
    const sizeNum = parseFloat(item.fileSize || '1.5');
    const estimatedBlocks = Math.max(64, Math.round(sizeNum * 120));
    setTotalBlocks(estimatedBlocks);
    setProcessedBlocks(0);
    setProgress(0);
    setIsDone(false);

    const generateRandomHex = () => {
      const bytes: string[] = [];
      for (let i = 0; i < 8; i++) {
        bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
      }
      return bytes.join(' ').toUpperCase();
    };

    let p = 0;
    const interval = setInterval(() => {
      // Non-linear realistic progress speed
      const increment = p < 20 ? 4 : p < 75 ? 3 : p < 92 ? 2 : 1;
      p = Math.min(100, p + increment);
      setProgress(p);
      setHexSnippet(generateRandomHex());
      setProcessedBlocks(Math.round((p / 100) * estimatedBlocks));

      // Calculate step index
      const stepIdx = ENCRYPTION_STEPS.findIndex(
        s => p >= s.minProgress && p <= s.maxProgress
      );
      if (stepIdx !== -1) {
        setCurrentStepIndex(stepIdx);
      }

      if (p >= 100) {
        clearInterval(interval);
        setIsDone(true);
        setTimeout(() => {
          onComplete(item);
        }, 900);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const currentStep = ENCRYPTION_STEPS[currentStepIndex] || ENCRYPTION_STEPS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans select-none">
      <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative overflow-hidden space-y-4">
        
        {/* Glowing Background Radial */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isDone ? 'bg-emerald-500/25' : 'bg-sky-500/20'
        }`} />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[11px] text-sky-400">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Modul Criptare AES-256</span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
            GCM Mode (Galois/Counter)
          </span>
        </div>

        {/* Central Animated Locking Graphic */}
        <div className="flex flex-col items-center justify-center py-2 z-10 relative space-y-3">
          
          <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${
            isDone
              ? 'bg-emerald-950/60 border-emerald-400 text-emerald-400 shadow-emerald-500/20 scale-105'
              : 'bg-slate-900/90 border-sky-500/50 text-sky-400 shadow-sky-500/20'
          }`}>
            {/* Spinning Ring during encryption */}
            {!isDone && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="stroke-sky-400 transition-all duration-75"
                  strokeWidth="3"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
            )}

            {isDone ? (
              <div className="flex flex-col items-center">
                <Lock className="w-10 h-10 text-emerald-400 animate-bounce duration-700" />
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 absolute -top-1 -right-1" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {progress < 40 ? (
                  <Unlock className="w-9 h-9 text-sky-400/80 animate-pulse" />
                ) : (
                  <Lock className="w-9 h-9 text-sky-400 animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Target Item Name & Size */}
          <div className="text-center max-w-xs">
            <h3 className="text-xs font-bold text-white truncate max-w-[240px] mx-auto">
              {item.title}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Dimensiune: <span className="font-mono text-slate-300">{item.fileSize || '1.8 MB'}</span> • Categorie: <span className="uppercase text-sky-400 font-semibold">{item.category}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar with glowing percentage */}
        <div className="space-y-1.5 z-10 relative bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Proces Încuiere & Criptare:
            </span>
            <span className={`font-mono text-sm ${isDone ? 'text-emerald-400' : 'text-sky-400'}`}>
              {progress}%
            </span>
          </div>

          {/* The Progress Bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-100 relative overflow-hidden ${
                isDone 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_12px_#34d399]' 
                  : 'bg-gradient-to-r from-sky-600 via-teal-500 to-sky-400 shadow-[0_0_10px_#38bdf8]'
              }`}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer animation */}
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1.5s_infinite] [background-size:200%_100%]" />
            </div>
          </div>

          {/* Active Step Label */}
          <div className="pt-1 flex items-start gap-2">
            {isDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0 mt-1.5" />
            )}
            <div className="leading-tight">
              <span className={`text-xs font-bold block ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                {currentStep.label}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentStep.sublabel}
              </span>
            </div>
          </div>
        </div>

        {/* Live Hex Byte Scrambler & Forensic Stream */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 font-mono text-[10px] space-y-1 z-10 relative">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/60">
            <span className="flex items-center gap-1 text-[9px]">
              <Binary className="w-3 h-3 text-sky-400" />
              FLUX TEXT CIFRAT (BLOCK STREAM):
            </span>
            <span className="text-[9px] text-teal-400">
              Bloc {processedBlocks} / {totalBlocks}
            </span>
          </div>

          <div className="text-teal-300/90 tracking-widest text-[9px] truncate">
            {hexSnippet} {hexSnippet.slice(0, 11)}
          </div>

          <div className="text-slate-500 text-[9px] flex items-center justify-between pt-0.5">
            <span>Runde AES: <strong className="text-slate-300">14/14</strong></span>
            <span>Tag GMAC: <strong className="text-slate-300 font-mono">128-bit</strong></span>
            <span>Cheie: <strong className="text-emerald-400">256-bit</strong></span>
          </div>
        </div>

        {/* Cryptographic SHA-256 Stamp Confirmation */}
        <div className="pt-1 text-center">
          <p className="text-[9px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Amprentă SHA-256: <span className="text-slate-400 truncate max-w-[170px]">{item.sha256Hash}</span>
          </p>
        </div>

      </div>
    </div>
  );
};

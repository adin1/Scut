import React from 'react';
import { 
  AlertOctagon, 
  FolderLock, 
  HeartHandshake, 
  MapPin, 
  PhoneCall, 
  FileCheck2, 
  X, 
  Lock, 
  Info, 
  ChevronRight, 
  Mic, 
  ScanFace, 
  Fingerprint, 
  ShieldAlert, 
  ShieldCheck, 
  KeyRound, 
  Scale, 
  Building2,
  Sparkles
} from 'lucide-react';
import { AppMode, BiometricConfig } from '../types/scut';

interface ScutDashboardProps {
  onNavigate: (mode: AppMode) => void;
  onQuickExit: () => void;
  onLockApp: () => void;
  onOpenVoiceSettings: () => void;
  onOpenBiometricSettings: () => void;
  evidenceCount: number;
  contactsCount: number;
  voiceTriggerEnabled: boolean;
  voicePrimaryKeyword: string;
  biometricConfig: BiometricConfig;
}

export const ScutDashboard: React.FC<ScutDashboardProps> = ({
  onNavigate,
  onQuickExit,
  onLockApp,
  onOpenVoiceSettings,
  onOpenBiometricSettings,
  evidenceCount,
  contactsCount,
  voiceTriggerEnabled,
  voicePrimaryKeyword,
  biometricConfig
}) => {
  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-3.5 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header bar with Quick Exit X */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E6F0F8] border border-sky-200 flex items-center justify-center text-sky-800">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-800">SCUT</h1>
              <span className="text-[9px] bg-slate-900 text-teal-300 px-1.5 py-0.2 rounded font-mono font-bold">5 MODULE</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sesiune Criptată • În Siguranță
            </p>
          </div>
        </div>

        {/* Action icons: Lock back to calculator & Quick Panic Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLockApp}
            className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            title="Blochează și revino la Calculator"
          >
            <Lock className="w-3 h-3" />
            <span className="text-[10px]">Blochează</span>
          </button>

          {/* Critical Red Panic X Button */}
          <button
            id="btn-scut-quick-exit"
            onClick={onQuickExit}
            className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-md transition cursor-pointer"
            title="Ieșire Rapidă / Închide aplicația (ESC)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Sanctuary Dashboard Body */}
      <div className="my-auto py-2 space-y-2">
        {/* 1. Primary Big SOS Button */}
        <div 
          onClick={() => onNavigate('sos_screen')}
          className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-2xl p-3 shadow-md hover:shadow-lg transition transform active:scale-98 cursor-pointer flex items-center justify-between relative overflow-hidden group"
        >
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-wide uppercase">🔴 SOS Panică Rapidă</span>
                <span className="bg-white/25 text-[9px] font-bold px-1.5 py-0.2 rounded-full">112</span>
              </div>
              <p className="text-[10px] text-rose-100 mt-0.5">
                Apel 112, alertă silențioasă și transmitere coordonate GPS
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 z-10" />
        </div>

        {/* 2. SCUT Safe Highlights: Safety Check & Safety Plan (Module 1) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Verificare Dispozitiv (Safety Check) */}
          <button
            id="btn-nav-safety-check"
            onClick={() => onNavigate('safety_check')}
            className="bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 rounded-2xl p-2.5 text-left flex flex-col justify-between h-24 shadow-2xs transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-amber-200/90 text-amber-900 px-1.5 py-0.2 rounded-full">
                Audit Securitate
              </span>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-slate-900 group-hover:text-amber-950">Verificare Securitate</h2>
              <p className="text-[9px] text-slate-600 leading-tight mt-0.5">Conturi partajate, GPS & Spyware</p>
            </div>
          </button>

          {/* Planul Meu de Siguranță (Safety Plan) */}
          <button
            id="btn-nav-safety-plan"
            onClick={() => onNavigate('safety_plan')}
            className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-2xl p-2.5 text-left flex flex-col justify-between h-24 shadow-2xs transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-emerald-200/90 text-emerald-900 px-1.5 py-0.2 rounded-full">
                Offline
              </span>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-950">Plan de Siguranță</h2>
              <p className="text-[9px] text-slate-600 leading-tight mt-0.5">Bagaj secret, rută & coduri</p>
            </div>
          </button>
        </div>

        {/* 3. Core 5 Modules Navigation Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Module 2: SCUT Evidence */}
          <button
            id="btn-nav-evidence"
            onClick={() => onNavigate('evidence_vault')}
            className="bg-[#E6F0F8] hover:bg-[#d8e8f5] border border-sky-200/80 rounded-2xl p-2.5 text-left flex flex-col justify-between h-24 shadow-2xs transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <FolderLock className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-sky-200/80 text-sky-900 px-1.5 py-0.2 rounded-full">
                {evidenceCount} probe
              </span>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-slate-800 group-hover:text-sky-900">Seif Probatoriu (SHA-256)</h2>
              <p className="text-[9px] text-slate-500 leading-tight">Foto, audio & fișiere INML</p>
            </div>
          </button>

          {/* Module 4: SCUT Response (Triage Asistat) */}
          <button
            id="btn-nav-triage"
            onClick={() => onNavigate('triage_help')}
            className="bg-[#D8F3DC] hover:bg-[#c6ebd0] border border-emerald-300/80 rounded-2xl p-2.5 text-left flex flex-col justify-between h-24 shadow-2xs transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full">
                Asistent AI
              </span>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-950">Triage & Ghid Criză</h2>
              <p className="text-[9px] text-slate-500 leading-tight">Medical, OPP, DGASPC</p>
            </div>
          </button>

          {/* Module 3: SCUT Case (Dosar Interinstituțional & Consimțământ) */}
          <button
            id="btn-nav-dossier"
            onClick={() => onNavigate('case_dossier')}
            className="bg-white hover:bg-stone-50 border border-stone-200 rounded-2xl p-2.5 text-left flex flex-col justify-between h-24 shadow-2xs transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                Interinstituțional
              </span>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-900">Dosar Unic Interinstituțional</h2>
              <p className="text-[9px] text-slate-500 leading-tight">Partajare securizată & poliție</p>
            </div>
          </button>

          {/* Module 5: SCUT Court (Pachet Probatoriu) */}
          <button
            id="btn-nav-court-export"
            onClick={() => onNavigate('court_export')}
            className="bg-white hover:bg-stone-50 border border-stone-200 rounded-2xl p-2.5 text-left flex flex-col justify-between h-24 shadow-2xs transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-xl bg-cyan-700 text-white flex items-center justify-center shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded-full font-serif">
                PDF/A Instanță
              </span>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-slate-800 group-hover:text-cyan-900">Pachet Probatoriu Judiciar</h2>
              <p className="text-[9px] text-slate-500 leading-tight">Manifest, ZIP & Index ECRIS</p>
            </div>
          </button>
        </div>

        {/* 4. Consent Management & Specialist Dashboard Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Cine are acces? (Consent Manager) */}
          <button
            id="btn-nav-consent"
            onClick={() => onNavigate('consent_manager')}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-2.5 text-left shadow-xs flex items-center justify-between transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] font-bold text-white leading-tight">Control Consimțământ</div>
                <p className="text-[9px] text-slate-400 truncate">Cine are acces?</p>
              </div>
            </div>
          </button>

          {/* Panou Specialiști (Specialist Dashboard) */}
          <button
            id="btn-nav-specialist"
            onClick={() => onNavigate('specialist_dashboard')}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-2.5 text-left shadow-xs flex items-center justify-between transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] font-bold text-white leading-tight">Panou Specialiști</div>
                <p className="text-[9px] text-slate-400 truncate">Poliție, DGASPC, Barou</p>
              </div>
            </div>
          </button>
        </div>

        {/* 5. Additional quick navigation cards: Adăposturi & Contacte */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('shelters_map')}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-left flex items-center gap-2 text-xs transition cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-900 block text-[10px]">Adăposturi Sigure</span>
              <span className="text-[9px] text-slate-500">DGASPC & ONG-uri</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('trusted_contacts')}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-left flex items-center gap-2 text-xs transition cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-900 block text-[10px]">Contacte Încredere</span>
              <span className="text-[9px] text-slate-500">{contactsCount} active • cod secret</span>
            </div>
          </button>
        </div>
      </div>

      {/* Safety Bottom Information Banner */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200/90 rounded-xl p-2 text-slate-700 text-[10px] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          <span className="leading-tight">
            <strong>Siguranță:</strong> Fișierele din SCUT sunt izolate în sandbox și nu ajung în galeria foto.
          </span>
        </div>
      </div>
    </div>
  );
};

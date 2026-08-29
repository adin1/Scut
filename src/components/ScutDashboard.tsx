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
  Sliders
} from 'lucide-react';
import { AppMode } from '../types/scut';

interface ScutDashboardProps {
  onNavigate: (mode: AppMode) => void;
  onQuickExit: () => void;
  onLockApp: () => void;
  onOpenVoiceSettings: () => void;
  evidenceCount: number;
  contactsCount: number;
  voiceTriggerEnabled: boolean;
  voicePrimaryKeyword: string;
}

export const ScutDashboard: React.FC<ScutDashboardProps> = ({
  onNavigate,
  onQuickExit,
  onLockApp,
  onOpenVoiceSettings,
  evidenceCount,
  contactsCount,
  voiceTriggerEnabled,
  voicePrimaryKeyword
}) => {
  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header bar with Quick Exit X */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E6F0F8] border border-sky-200 flex items-center justify-center text-sky-800">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800">SCUT</h1>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sesiune Criptată • În Siguranță
            </p>
          </div>
        </div>

        {/* Action icons: Lock back to calculator & Quick Panic Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLockApp}
            className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1 transition"
            title="Blochează și revino la Calculator"
          >
            <Lock className="w-3 h-3" />
            <span className="text-[11px]">Blochează</span>
          </button>

          {/* Critical Red Panic X Button */}
          <button
            id="btn-scut-quick-exit"
            onClick={onQuickExit}
            className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-md transition cursor-pointer"
            title="Ieșire Rapidă / Închide aplicația (Quick Exit)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Sanctuary Dashboard Body */}
      <div className="my-auto py-3 space-y-3">
        {/* 1. Primary Big SOS Button */}
        <div 
          onClick={() => onNavigate('sos_screen')}
          className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition transform active:scale-98 cursor-pointer flex items-center justify-between relative overflow-hidden group"
        >
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-wide uppercase">🔴 SOS Panică Rapidă</span>
                <span className="bg-white/25 text-[10px] font-bold px-2 py-0.5 rounded-full">112</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Apel direct 112, alertă silențioasă și transmitere GPS
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 z-10" />
        </div>

        {/* 2. Voice-Activated SOS Status Banner / Quick Settings */}
        <div 
          onClick={onOpenVoiceSettings}
          className="w-full bg-slate-900 text-white rounded-2xl p-3 shadow-md border border-slate-800 flex items-center justify-between hover:bg-slate-850 transition active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
              voiceTriggerEnabled ? 'bg-rose-600 shadow-sm animate-pulse' : 'bg-stone-700'
            }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">Declanșator Vocal SOS</h3>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                  voiceTriggerEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-stone-800 text-stone-400'
                }`}>
                  {voiceTriggerEnabled ? 'Activ în fundal' : 'Oprit'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Cuvânt declanșator: <strong className="text-teal-300 font-mono">„{voicePrimaryKeyword}”</strong> • Funcționează și din Calculator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Sliders className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Grid of Core Features */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Jurnalul Meu (Evidence Vault) */}
          <button
            id="btn-nav-evidence"
            onClick={() => onNavigate('evidence_vault')}
            className="bg-[#E6F0F8] hover:bg-[#d8e8f5] border border-sky-200/80 rounded-2xl p-3.5 text-left flex flex-col justify-between h-28 shadow-sm transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
                <FolderLock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-full">
                {evidenceCount} dovezi
              </span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 group-hover:text-sky-900">Jurnalul Meu (Probe)</h2>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Foto, audio & notițe izolate</p>
            </div>
          </button>

          {/* Asistență (Triage) */}
          <button
            id="btn-nav-triage"
            onClick={() => onNavigate('triage_help')}
            className="bg-[#D8F3DC] hover:bg-[#c6ebd0] border border-emerald-300/80 rounded-2xl p-3.5 text-left flex flex-col justify-between h-28 shadow-sm transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                4 domenii
              </span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">Solicitare Asistență</h2>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Medical, Juridic, Psihologic</p>
            </div>
          </button>

          {/* Adăposturi (Hartă) */}
          <button
            id="btn-nav-shelters"
            onClick={() => onNavigate('shelters_map')}
            className="bg-white hover:bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-left flex flex-col justify-between h-28 shadow-sm transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                Non-stop
              </span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Adăposturi Sigure</h2>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Centre DGASPC & ONG-uri</p>
            </div>
          </button>

          {/* Contacte Verificate */}
          <button
            id="btn-nav-contacts"
            onClick={() => onNavigate('trusted_contacts')}
            className="bg-white hover:bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-left flex flex-col justify-between h-28 shadow-sm transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {contactsCount} active
              </span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 group-hover:text-amber-900">Contacte de Încredere</h2>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Alerte automate cu cod secret</p>
            </div>
          </button>
        </div>

        {/* 3. Dosarul Electronic Unic Card (Phase 3 Feature) */}
        <button
          id="btn-nav-dossier"
          onClick={() => onNavigate('case_dossier')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-3.5 text-left shadow-sm flex items-center justify-between transition active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-white">Dosarul Electronic Unic</h2>
                <span className="text-[9px] bg-teal-900/60 text-teal-300 px-1.5 py-0.5 rounded border border-teal-700/50">Faza 3</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">Partajat securizat între 112, Poliție, Medici și DGASPC</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Safety Bottom Information Banner */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200/90 rounded-xl p-2.5 text-slate-700 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="leading-tight">
            <strong>Siguranță:</strong> Fișierele foto/audio din SCUT nu sunt salvate în galeria telefonului.
          </span>
        </div>
      </div>
    </div>
  );
};

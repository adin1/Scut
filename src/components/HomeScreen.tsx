import React from 'react';
import { CloudSun, MessageSquare, Camera, Image, Settings, Phone, Calendar, Music, Sparkles, Lock, Bell } from 'lucide-react';
import { DisguisedNotification } from '../types/scut';

interface HomeScreenProps {
  onOpenCalculator: () => void;
  notifications: DisguisedNotification[];
  onOpenNotificationsModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCalculator,
  notifications,
  onOpenNotificationsModal
}) => {
  const currentDate = new Date().toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="flex-1 w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-stone-950 text-white p-5 flex flex-col justify-between select-none relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Lock & Weather / Time Widget */}
      <div className="pt-4 flex flex-col items-center text-center z-10">
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
          <Lock className="w-3 h-3" />
          <span className="capitalize">{currentDate}</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-100">12:45</h2>

        {/* Mini Weather Widget */}
        <div className="mt-3 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 flex items-center gap-2 text-xs text-slate-200">
          <CloudSun className="w-4 h-4 text-amber-300" />
          <span>București • 24°C Însorit</span>
        </div>

        {/* Camouflaged Lockscreen Notification Banner */}
        {notifications.length > 0 && (
          <div 
            onClick={onOpenNotificationsModal}
            className="mt-4 w-full max-w-xs bg-slate-800/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 text-left shadow-lg cursor-pointer hover:bg-slate-800 transition active:scale-98"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-teal-400" />
                <span className="font-semibold text-slate-300">{notifications[0].disguisedTitle}</span>
              </div>
              <span>{notifications[0].time}</span>
            </div>
            <p className="text-xs text-slate-200 leading-snug font-medium line-clamp-1">
              {notifications[0].disguisedBody}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50 pt-1">
              <span className="text-teal-400">🛡️ Notificare camuflată SCUT</span>
              <span>Apasă pentru detalii</span>
            </div>
          </div>
        )}
      </div>

      {/* Main App Grid */}
      <div className="my-auto py-4 grid grid-cols-4 gap-y-5 gap-x-3 text-center z-10">
        {/* Camouflaged Target App: CALCULATOR */}
        <button
          id="btn-app-calculator"
          onClick={onOpenCalculator}
          className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-90 transition transform"
        >
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] border border-blue-400/40 shadow-lg flex items-center justify-center text-white group-hover:ring-2 ring-blue-400/60 transition">
            {/* Real camouflage icon: + and = inside a dark blue circle as specified in Phase 1 */}
            <div className="w-9 h-9 rounded-full bg-blue-600/80 flex items-center justify-center font-mono font-bold text-lg shadow-inner">
              <span className="tracking-tighter text-blue-100">+ =</span>
            </div>
            {/* Subtle glow badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-slate-900 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-slate-900"></span>
          </div>
          <span className="text-[11px] font-medium text-slate-200 tracking-tight">Calculator</span>
        </button>

        {/* Regular Phone Apps */}
        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
            <Phone className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Telefon</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Mesaje</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center text-white shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Cameră</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
            <Image className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Galerie</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Calendar</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Music className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Muzică</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-not-allowed">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Setări</span>
        </div>
      </div>

      {/* Camouflage Instruction */}
      <div className="w-full bg-blue-950/80 border border-blue-800/80 rounded-xl p-2.5 text-center text-xs text-blue-200 z-10 space-y-1.5">
        <div>
          <p className="font-semibold text-white flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Faza 1: Masca pe ecranul principal</span>
          </p>
          <p className="text-[11px] text-blue-300/90 mt-0.5">
            Apasă pe iconița <strong>Calculator</strong> pentru a testa funcționalitatea de deghizare (PIN: 1312).
          </p>
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="mt-3 p-2.5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-around z-10">
        <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow">
          <Phone className="w-5 h-5" />
        </div>
        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow">
          <MessageSquare className="w-5 h-5" />
        </div>
        {/* Quick Calculator in Dock */}
        <button 
          onClick={onOpenCalculator}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-400/60 flex items-center justify-center text-blue-200 shadow cursor-pointer active:scale-95 transition"
        >
          <span className="font-mono font-bold text-sm">+ =</span>
        </button>
        <div className="w-11 h-11 rounded-2xl bg-stone-700 flex items-center justify-center text-white shadow">
          <Camera className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

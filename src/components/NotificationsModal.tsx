import React, { useState } from 'react';
import { Bell, ShieldCheck, X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { DisguisedNotification } from '../types/scut';
import { DISGUISED_NOTIFICATIONS_CATALOG } from '../data/mockData';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DisguisedNotification[];
  onTriggerTestNotif: (notif: DisguisedNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onTriggerTestNotif
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'catalog'>('received');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 font-sans">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-4 shadow-2xl border border-stone-200 space-y-3 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Laborator Notificări Camuflate</h3>
              <p className="text-[10px] text-slate-500">Faza 2: Caracteristici de Siguranță Critică</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concept Box */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-[11px] text-emerald-950 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mecanismul Deghizării pe Ecranul Blocat:</span>
          </div>
          Toate notificările SCUT sunt mascate ca actualizări de sistem, alerte meteo sau remindere generice. Agresorul care privește ecranul telefonului nu va bănui absolut nimic.
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 border-b border-stone-200 pb-1">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'received'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-stone-100'
            }`}
          >
            Notificări Primite ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-stone-100'
            }`}
          >
            Modele & Catalog Simulare
          </button>
        </div>

        {/* List Content */}
        <div className="space-y-2.5">
          {activeTab === 'received' ? (
            notifications.map(notif => (
              <div key={notif.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono uppercase font-bold text-teal-700">Deghizare Activă</span>
                  <span>{notif.time}</span>
                </div>

                {/* What the aggressor sees */}
                <div className="bg-stone-200/80 p-2.5 rounded-xl border border-stone-300">
                  <div className="text-[10px] font-bold text-stone-700 flex items-center gap-1 mb-0.5">
                    <span>📱 Ce vede agresorul pe ecranul blocat:</span>
                  </div>
                  <div className="text-xs font-semibold text-stone-900">{notif.disguisedTitle}</div>
                  <div className="text-[11px] text-stone-600 leading-tight mt-0.5">{notif.disguisedBody}</div>
                </div>

                {/* What it really means inside SCUT */}
                <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200">
                  <div className="text-[10px] font-bold text-teal-900 flex items-center gap-1 mb-0.5">
                    <span>🛡️ Mesajul real intern (Decriptat în SCUT):</span>
                  </div>
                  <div className="text-xs font-semibold text-teal-950">{notif.realTitle}</div>
                  <div className="text-[11px] text-teal-800 leading-tight mt-0.5">{notif.realBody}</div>
                </div>
              </div>
            ))
          ) : (
            DISGUISED_NOTIFICATIONS_CATALOG.map(catalogItem => (
              <div key={catalogItem.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{catalogItem.disguisedTitle}</span>
                  <button
                    onClick={() => onTriggerTestNotif(catalogItem)}
                    className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Trimite Simulare</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">"{catalogItem.disguisedBody}"</p>
                <div className="text-[10px] text-teal-700 font-medium">
                  Semnificație reală: {catalogItem.realTitle}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl"
        >
          Închide Panoul de Notificări
        </button>
      </div>
    </div>
  );
};

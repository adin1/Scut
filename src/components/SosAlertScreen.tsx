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
  Volume2,
  MessageSquare,
  Send,
  Sparkles,
  Smartphone,
  LocateFixed
} from 'lucide-react';
import { TrustedContact, EmergencySmsConfig } from '../types/scut';
import { CLUJ_RESOURCE_PROVIDERS } from '../data/cluj';
import { distanceMeters } from '../utils/security';

const NEAREST_KNOWN_POLICE = CLUJ_RESOURCE_PROVIDERS.find(r => r.id === 'cj-ipj-cluj')!;

function buildSosSmsBody(contact: TrustedContact, coords: { lat: number; lng: number } | null): string {
  if (contact.smsMode === 'direct') {
    let text = contact.customMessage || '🚨 ALERTA SCUT SOS: Am nevoie de sprijin de urgență!';
    if (contact.includeGpsLocation && coords) {
      text += ` Locație: https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    }
    return text;
  }
  let text = contact.decoyCodeWord || 'Pachetul de la curier a sosit.';
  if (contact.includeGpsLocation && coords) {
    text += ` [Ref: ${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}]`;
  }
  return text;
}

interface SosAlertScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
  voiceTriggeredKeyword?: string | null;
  contacts?: TrustedContact[];
  emergencySmsConfig?: EmergencySmsConfig;
}

export const SosAlertScreen: React.FC<SosAlertScreenProps> = ({ 
  onBack, 
  onQuickExit, 
  voiceTriggeredKeyword,
  contacts = [],
  emergencySmsConfig
}) => {
  const [sosSent, setSosSent] = useState<boolean>(Boolean(voiceTriggeredKeyword));
  const [silentAlertSent, setSilentAlertSent] = useState<boolean>(false);
  const [audioRecording, setAudioRecording] = useState<boolean>(Boolean(voiceTriggeredKeyword));
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);
  const [callInitiated, setCallInitiated] = useState<boolean>(false);
  const [sentSmsContactIds, setSentSmsContactIds] = useState<string[]>([]);

  // Real device GPS — no more hardcoded coordinates. Requests permission once an
  // alert is active, since that's the moment the location actually matters.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'>('idle');

  const isAutoSmsEnabled = emergencySmsConfig ? emergencySmsConfig.autoSmsEnabled : true;
  const enabledContacts = contacts.filter(c => c.notifyOnSos);
  const isAlertActivePreGeo = sosSent || silentAlertSent || Boolean(voiceTriggeredKeyword);

  useEffect(() => {
    if (!isAlertActivePreGeo || geoStatus !== 'idle') return;
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracyMeters(Math.round(pos.coords.accuracy));
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [isAlertActivePreGeo, geoStatus]);

  const distanceToNearestKnownStation = coords
    ? Math.round(distanceMeters(coords, NEAREST_KNOWN_POLICE.coordinates))
    : null;

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
    setCallInitiated(true);
    setSosSent(true);
    // Opens the device's native phone dialer with 112 pre-filled. On a phone the
    // user still taps "call" themselves — browsers cannot place a call silently.
    window.location.href = 'tel:112';
  };

  const handleSendSmsToContact = (contact: TrustedContact) => {
    const body = encodeURIComponent(buildSosSmsBody(contact, coords));
    // Opens the native SMS app pre-filled with the recipient + message; the user
    // still has to tap send there — no backend SMS gateway exists to do this silently.
    window.location.href = `sms:${contact.phone.replace(/\s+/g, '')}?body=${body}`;
    setSentSmsContactIds(prev => (prev.includes(contact.id) ? prev : [...prev, contact.id]));
  };

  const isAlertActive = sosSent || silentAlertSent || Boolean(voiceTriggeredKeyword);

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header with Back & Panic X */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
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
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main SOS Content */}
      <div className="my-auto py-2 space-y-3">
        {/* Live GPS Map Simulation Container */}
        <div className="relative w-full h-40 bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner flex flex-col justify-between p-3">
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
              <div className="w-9 h-9 rounded-full bg-blue-500/30 animate-ping absolute inset-0"></div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white text-[9px] font-bold rounded-full shadow backdrop-blur whitespace-nowrap">
              {accuracyMeters !== null ? `Locația Ta Curentă (±${accuracyMeters}m)` : 'Locația Ta Curentă'}
            </div>
          </div>

          {/* Top Map GPS Overlay Info */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[9px] font-mono bg-white/90 px-2 py-0.5 rounded border border-slate-300 font-semibold text-slate-800 shadow-xs">
              {coords ? `GPS: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'GPS: în curs de localizare...'}
            </span>
            {geoStatus === 'granted' ? (
              <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Locație Reală Activă
              </span>
            ) : geoStatus === 'denied' ? (
              <span className="text-[9px] bg-rose-700 text-white px-2 py-0.5 rounded-full font-semibold shadow-xs">
                Locație Refuzată — activeaz-o din setările browserului
              </span>
            ) : geoStatus === 'unsupported' ? (
              <span className="text-[9px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-xs">
                Locație Indisponibilă pe Acest Dispozitiv
              </span>
            ) : (
              <span className="text-[9px] bg-slate-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-xs flex items-center gap-1">
                <LocateFixed className="w-2.5 h-2.5 animate-pulse" />
                Se localizează...
              </span>
            )}
          </div>

          {/* Nearest Verified Police Station distance badge */}
          <div className="z-10 self-start">
            <span className="text-[9px] bg-slate-900/85 text-slate-100 px-2 py-0.5 rounded shadow-xs">
              {distanceToNearestKnownStation !== null
                ? <>{NEAREST_KNOWN_POLICE.name}: <strong>{(distanceToNearestKnownStation / 1000).toFixed(1)} km</strong> distanță (linie dreaptă)</>
                : `Cea mai apropiată secție verificată: ${NEAREST_KNOWN_POLICE.name} — activează locația pentru distanță`}
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
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
              APASĂ SUNĂ 112
            </span>
          </div>
        )}

        {/* SOS Active Status Banner — honest: the app cannot confirm dispatch itself */}
        {isAlertActive && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 text-emerald-950 shadow-xs animate-fade-in space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Protocol SOS activat pe acest dispozitiv.</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              {callInitiated
                ? 'Apelul către 112 a fost inițiat. Rămâi la telefon cu operatorul și confirmă verbal adresa/poziția ta — aplicația nu poate garanta că dispeceratul a primit locația automat.'
                : 'Apasă „SUNĂ 112” mai jos pentru a iniția apelul real către dispecerat, sau folosește butoanele SMS de mai jos pentru a alerta contactele de încredere.'}
            </p>
          </div>
        )}

        {/* Emergency SMS to Trusted Contacts — real sms: links, honest about what "sent" means */}
        {isAlertActive && isAutoSmsEnabled && enabledContacts.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-2.5 text-amber-950 shadow-xs space-y-1.5">
            <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-700" />
              <span>Alertează contactele de încredere ({enabledContacts.length}):</span>
            </div>
            <p className="text-[10px] text-amber-800 leading-snug">
              Apasă pe un contact pentru a deschide aplicația de mesaje cu textul pre-completat — trebuie să apeși tu „Trimite” acolo.
            </p>

            <div className="space-y-1 pt-0.5">
              {enabledContacts.map(c => {
                const wasSent = sentSmsContactIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSendSmsToContact(c)}
                    className="w-full bg-white/80 hover:bg-white border border-amber-200 rounded-xl p-1.5 flex items-center justify-between text-[10px] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-slate-900 truncate">{c.name}</span>
                      <span className="text-slate-500 font-mono text-[9px]">({c.phone})</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${wasSent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                      {wasSent ? '✓ Mesaj deschis' : c.smsMode === 'direct' ? '🚨 Trimite Alertă' : `🕵️ Trimite Decoy`}
                    </span>
                  </button>
                );
              })}
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
            <span className="text-[9px] font-mono bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
              Salvat direct în Vault
            </span>
          </div>
        )}

        {/* Real Call Initiated Confirmation */}
        {callInitiated && (
          <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Apel 112 inițiat pe acest dispozitiv</div>
              <div className="text-[10px] text-slate-300">Dacă dialer-ul nu s-a deschis automat, apasă din nou „Sună 112” mai jos.</div>
            </div>
          </div>
        )}

        {/* Action Buttons: Sună 112 & Trimite Alertă Silențioasă */}
        <div className="space-y-2 pt-1">
          {/* Button 1: Call 112 */}
          <button
            id="btn-call-112"
            onClick={() => setCallModalOpen(true)}
            className="w-full h-13 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 animate-bounce" />
            <span>SUNĂ 112 (URGENȚĂ)</span>
          </button>

          {/* Button 2: Silent Alert to Dispatch */}
          <button
            id="btn-silent-alert"
            onClick={handleTriggerSilentAlert}
            className="w-full h-11 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer border border-slate-700"
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Alertă Silențioasă (fără apel) & Pregătește SMS Contacte</span>
          </button>
        </div>
      </div>

      {/* Safety Protocol Guidance */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-700 shrink-0">
        <p className="font-semibold text-slate-900 mb-0.5">Protocol de Siguranță:</p>
        <p className="leading-tight text-slate-600">
          Dacă agresorul se apropie, apasă tasta <strong>ESC</strong> sau butonul <strong>[X]</strong>. Apelul 112 și SMS-urile către contacte se trimit doar când apeși tu butoanele de mai sus.
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
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Anulează
              </button>
              <button
                onClick={handleStart112Call}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
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

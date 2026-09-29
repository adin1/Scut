import React, { useState, useEffect, useRef } from 'react';
import { CloudSun, Wind, Droplets, Compass, MapPin, AlertOctagon, ArrowLeft, Mic } from 'lucide-react';
import { EvidenceItem } from '../types/scut';
import { computeSha256Hash, encryptVaultText } from '../utils/security';

interface WeatherDuressScreenProps {
  onReturnToCalculator: () => void;
  onReturnHome: () => void;
  /** Already-permitted mic stream from the voice-guardian listener, if it's running — reusing it avoids a second, visible permission prompt that would tip off the person coercing the victim. */
  activeMediaStream: MediaStream | null;
  /** Session vault key, if the victim already unlocked the evidence vault earlier — used to actually encrypt the recording. Recording still proceeds without it, just unencrypted. */
  vaultKey: CryptoKey | null;
  onSaveEvidence: (item: EvidenceItem) => void;
}

export const WeatherDuressScreen: React.FC<WeatherDuressScreenProps> = ({
  onReturnToCalculator,
  onReturnHome,
  activeMediaStream,
  vaultKey,
  onSaveEvidence
}) => {
  const [audioRecordingSeconds, setAudioRecordingSeconds] = useState<number>(60);
  const [showAuditorTelemetry, setShowAuditorTelemetry] = useState<boolean>(true);
  const [recorderState, setRecorderState] = useState<'unavailable' | 'recording' | 'saved'>('unavailable');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const savedRef = useRef(false);

  const finalizeRecording = async () => {
    if (savedRef.current || chunksRef.current.length === 0) return;
    savedRef.current = true;
    const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    const sha256Hash = await computeSha256Hash(arrayBuffer);
    const plainDescription = 'Înregistrare audio ambientală reală, pornită automat la introducerea PIN-ului de constrângere.';

    let description = plainDescription;
    let descriptionIv: string | undefined;
    if (vaultKey) {
      const sealed = await encryptVaultText(vaultKey, plainDescription);
      description = sealed.ciphertextB64;
      descriptionIv = sealed.ivB64;
    }

    onSaveEvidence({
      id: `ev-duress-audio-${Date.now()}`,
      title: 'Înregistrare Audio — Mod Constrângere',
      category: 'audio',
      date: new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      description,
      descriptionIv,
      tags: ['Mod Constrângere', 'Audio Ambiental'],
      fileSize: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
      duration: `${60 - audioRecordingSeconds}s`,
      sha256Hash,
      isEncrypted: Boolean(vaultKey),
      tamperProofVerified: true
    });
    setRecorderState('saved');
  };

  // Real ambient audio recording off the already-permitted mic stream, for up to 60s.
  useEffect(() => {
    if (!activeMediaStream || typeof MediaRecorder === 'undefined') {
      setRecorderState('unavailable');
      return;
    }
    try {
      const recorder = new MediaRecorder(activeMediaStream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => { finalizeRecording(); };
      recorder.start();
      setRecorderState('recording');
    } catch {
      setRecorderState('unavailable');
    }

    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMediaStream]);

  // Countdown timer for the real 60s ambient audio recording window.
  useEffect(() => {
    const timer = setInterval(() => {
      setAudioRecordingSeconds(prev => {
        if (prev <= 1 && recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.stop();
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 w-full h-full bg-gradient-to-b from-sky-400 via-sky-600 to-indigo-900 text-white p-4 flex flex-col justify-between select-none font-sans relative overflow-y-auto">
      {/* Top Header of Decoy Weather App */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={onReturnToCalculator}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs flex items-center gap-1 transition"
          title="Înapoi la Calculator"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[11px]">Calculator</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-amber-300" />
          <span>București, Sector 1</span>
        </div>

        <button
          onClick={() => setShowAuditorTelemetry(!showAuditorTelemetry)}
          className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/30 border border-amber-300/40 text-amber-200"
        >
          {showAuditorTelemetry ? 'Ascunde Auditor' : 'Vezi Telemetrie'}
        </button>
      </div>

      {/* Hidden Auditor / Security Telemetry Panel (Explaining Phase 2 Duress Action) */}
      {showAuditorTelemetry && (
        <div className="my-2 bg-stone-950/95 border border-rose-500/80 rounded-2xl p-3 text-stone-200 text-xs shadow-2xl backdrop-blur-md z-20 animate-fade-in">
          <div className="flex items-center justify-between text-rose-400 font-bold mb-1.5 pb-1 border-b border-rose-500/30">
            <span className="flex items-center gap-1.5 text-xs">
              <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
              PIN CONSTRÂNGERE ACTIVAT (0000)
            </span>
            <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded-full font-mono">
              NICIO ALERTĂ AUTOMATĂ
            </span>
          </div>

          <p className="text-[11px] text-stone-300 leading-relaxed mb-2">
            Agresorul vede doar o aplicație obișnuită de vreme. <strong className="text-amber-300">Important:</strong> o pagină web nu poate suna sau transmite locația la 112 fără o acțiune vizibilă — nimic nu a fost trimis automat. Dacă poți, sună real la 112 imediat ce e sigur.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-stone-900 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">TRANSMITERE GPS:</span>
              <span className="text-amber-400 font-semibold">Netrimisă automat</span>
              <span className="text-stone-500 block text-[8px]">Necesită apel/SMS real</span>
            </div>
            <div className="bg-stone-900 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">ÎNREGISTRARE AUDIO AMBIENTAL:</span>
              {recorderState === 'recording' ? (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <Mic className="w-3 h-3 animate-pulse" />
                  Activ real ({audioRecordingSeconds}s rămase)
                </span>
              ) : recorderState === 'saved' ? (
                <span className="text-emerald-400 font-semibold">Salvată în Seif{vaultKey ? ' (criptată)' : ''}</span>
              ) : (
                <span className="text-amber-400 font-semibold">Indisponibilă (microfon nepermis anterior)</span>
              )}
              <span className="text-stone-500 block text-[8px]">Reutilizează microfonul deja permis, fără prompt nou</span>
            </div>
          </div>
        </div>
      )}

      {/* Decoy Weather Content (Totally normal looking) */}
      <div className="my-auto text-center z-10 py-2">
        <CloudSun className="w-20 h-20 mx-auto text-amber-300 drop-shadow-md animate-pulse" />
        <h2 className="text-6xl font-light tracking-tight mt-2 text-white">24°</h2>
        <p className="text-sm font-medium text-sky-100">Predominant Însorit</p>
        <p className="text-xs text-sky-200 mt-0.5">Min: 16° • Max: 27° • Indice UV: 4 (Moderat)</p>

        {/* Weather details card */}
        <div className="mt-5 grid grid-cols-3 gap-2 bg-white/15 backdrop-blur-md rounded-2xl p-3 text-xs border border-white/20">
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-4 h-4 text-sky-200" />
            <span className="text-[10px] text-sky-200">Vânt</span>
            <span className="font-semibold">12 km/h NV</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-sky-200" />
            <span className="text-[10px] text-sky-200">Umiditate</span>
            <span className="font-semibold">48%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Compass className="w-4 h-4 text-sky-200" />
            <span className="text-[10px] text-sky-200">Presiune</span>
            <span className="font-semibold">1014 hPa</span>
          </div>
        </div>

        {/* 3-Day Forecast */}
        <div className="mt-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 text-xs text-left border border-white/15">
          <div className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider mb-2">Prognoză 3 Zile</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Mâine</span>
              <div className="flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-sky-200">Însorit</span>
              </div>
              <span className="font-medium">17° / 26°</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Duminică</span>
              <div className="flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-sky-200">Parțial noros</span>
              </div>
              <span className="font-medium">18° / 28°</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Luni</span>
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-sky-200">Averse izolate</span>
              </div>
              <span className="font-medium">15° / 23°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom return bar */}
      <div className="pt-2 flex items-center justify-between text-xs text-sky-200 z-10">
        <button onClick={onReturnHome} className="hover:underline text-[11px]">
          Ecran Principal Telefon
        </button>
        <span className="text-[10px] opacity-75">Actualizat acum 2 min</span>
      </div>
    </div>
  );
};

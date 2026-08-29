import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, Compass, MapPin, Radio, AlertOctagon, RefreshCw, ArrowLeft, Mic } from 'lucide-react';

interface WeatherDuressScreenProps {
  onReturnToCalculator: () => void;
  onReturnHome: () => void;
}

export const WeatherDuressScreen: React.FC<WeatherDuressScreenProps> = ({
  onReturnToCalculator,
  onReturnHome
}) => {
  const [audioRecordingSeconds, setAudioRecordingSeconds] = useState<number>(60);
  const [showAuditorTelemetry, setShowAuditorTelemetry] = useState<boolean>(true);

  // Countdown timer for simulated 60s ambient audio buffer
  useEffect(() => {
    const timer = setInterval(() => {
      setAudioRecordingSeconds(prev => (prev > 0 ? prev - 1 : 0));
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
            <span className="text-[10px] bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded-full font-mono">
              ALERTA SILENȚIOASĂ TRIMISĂ
            </span>
          </div>

          <p className="text-[11px] text-stone-300 leading-relaxed mb-2">
            Agresorul vede doar o aplicație obișnuită de vreme. În fundal, SCUT a executat măsurile de urgență:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-stone-900 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">COORDONATE GPS REALE:</span>
              <span className="text-emerald-400 font-semibold">44.4378° N, 26.0946° E</span>
              <span className="text-stone-500 block text-[8px]">Acuratețe: 3m (Dispecerat 112)</span>
            </div>
            <div className="bg-stone-900 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">ÎNREGISTRARE AUDIO AMBIENTAL:</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <Mic className="w-3 h-3 animate-pulse" />
                {audioRecordingSeconds > 0 ? `Activ (${audioRecordingSeconds}s rămase)` : '60s Salvat în Vault'}
              </span>
              <span className="text-stone-500 block text-[8px]">Criptat AES-256 (fără notificare)</span>
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

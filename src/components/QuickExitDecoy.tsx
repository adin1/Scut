import React from 'react';
import { Search, Globe, RefreshCw, Shield, ArrowLeft } from 'lucide-react';

interface QuickExitDecoyProps {
  onReturnToCalculator: () => void;
  onReturnHome: () => void;
}

export const QuickExitDecoy: React.FC<QuickExitDecoyProps> = ({
  onReturnToCalculator,
  onReturnHome
}) => {
  return (
    <div className="flex-1 w-full h-full bg-white text-slate-800 p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Fake Google / Browser Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-[11px] truncate max-w-[180px]">https://www.google.ro/search</span>
        </div>
        <button
          onClick={onReturnToCalculator}
          className="text-[10px] text-slate-400 hover:text-slate-700 underline"
        >
          Reintră în Calculator
        </button>
      </div>

      {/* Google Decoy Search Interface */}
      <div className="my-auto py-4 flex flex-col items-center text-center space-y-4">
        <div className="text-4xl font-bold tracking-tight">
          <span className="text-blue-500">G</span>
          <span className="text-red-500">o</span>
          <span className="text-yellow-500">o</span>
          <span className="text-blue-500">g</span>
          <span className="text-green-500">l</span>
          <span className="text-red-500">e</span>
        </div>

        <div className="w-full max-w-xs bg-white border border-slate-300 hover:shadow-md rounded-full px-4 py-2.5 flex items-center gap-2 shadow-xs transition">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            readOnly
            value="rețete simple prăjituri rapide"
            className="w-full text-xs text-slate-700 outline-none bg-transparent"
          />
        </div>

        {/* Realistic Neutral Search Results Preview */}
        <div className="w-full max-w-xs space-y-2 text-left text-xs pt-2">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-emerald-700 block">culinar.ro › retete-rapide</span>
            <div className="text-blue-700 font-medium text-[11px] hover:underline cursor-pointer">
              10 Rețete de Prăjituri Fără Coacere Gata în 15 Minute
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Descoperă cele mai simple deserturi rapide pentru întreaga familie...</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-emerald-700 block">bucataria-azi.ro › desert</span>
            <div className="text-blue-700 font-medium text-[11px] hover:underline cursor-pointer">
              Cum prepari cel mai pufos chec cu mere și scorțișoară
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Ingrediente la îndemână, instrucțiuni pas cu pas și timp redus de preparare...</p>
          </div>
        </div>
      </div>

      {/* Safety Notice in Dev Mode */}
      <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
        <span>Ieșire de panică executată cu succes.</span>
        <button
          onClick={onReturnHome}
          className="text-slate-600 hover:text-slate-900 font-semibold"
        >
          Ecran Principal Telefon
        </button>
      </div>
    </div>
  );
};

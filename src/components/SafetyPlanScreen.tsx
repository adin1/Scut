import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  CheckSquare, 
  Square, 
  Navigation, 
  Home, 
  Baby, 
  Dog, 
  Phone, 
  Key, 
  EyeOff,
  Sparkles,
  Download,
  AlertCircle,
  Lock
} from 'lucide-react';
import { SafetyPlan } from '../types/scut';
import { DEFAULT_SAFETY_PLAN } from '../data/mockData';

interface SafetyPlanScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
}

export const SafetyPlanScreen: React.FC<SafetyPlanScreenProps> = ({ onBack, onQuickExit }) => {
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>(DEFAULT_SAFETY_PLAN);
  const [activeTab, setActiveTab] = useState<'bag' | 'route' | 'children' | 'codewords'>('bag');
  const [isPlanHidden, setIsPlanHidden] = useState(false);

  const toggleBagItem = (itemId: string) => {
    setSafetyPlan(prev => ({
      ...prev,
      emergencyBagItems: prev.emergencyBagItems.map(item => 
        item.id === itemId ? { ...item, packed: !item.packed } : item
      )
    }));
  };

  const packedCount = safetyPlan.emergencyBagItems.filter(i => i.packed).length;
  const totalCount = safetyPlan.emergencyBagItems.length;

  if (isPlanHidden) {
    return (
      <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-center items-center font-sans select-none text-center">
        <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">Planul de Siguranță este Mascat</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-[240px]">
          Conținutul a fost ascuns pentru a preveni privirile indiscrete.
        </p>
        <button
          onClick={() => setIsPlanHidden(false)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
        >
          Afișează Planul de Siguranță
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-3.5 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PLANUL MEU DE SIGURANȚĂ</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlanHidden(true)}
            className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition cursor-pointer"
            title="Maschează Planul"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-safety-plan-quick-exit"
            onClick={onQuickExit}
            className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
            title="Ieșire Rapidă (ESC)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 pt-2 pb-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('bag')}
          className={`py-1.5 px-1 rounded-xl transition text-center cursor-pointer ${
            activeTab === 'bag'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Bagaj Secret
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`py-1.5 px-1 rounded-xl transition text-center cursor-pointer ${
            activeTab === 'route'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Evadare & Rută
        </button>
        <button
          onClick={() => setActiveTab('children')}
          className={`py-1.5 px-1 rounded-xl transition text-center cursor-pointer ${
            activeTab === 'children'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Copii & Casă
        </button>
        <button
          onClick={() => setActiveTab('codewords')}
          className={`py-1.5 px-1 rounded-xl transition text-center cursor-pointer ${
            activeTab === 'codewords'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Cuvinte Cod
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 my-1 overflow-y-auto space-y-2.5">
        {/* TAB 1: BAGAJUL DE URGENȚĂ */}
        {activeTab === 'bag' && (
          <div className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-emerald-950 text-[11px] flex items-center justify-between">
              <div>
                <span className="font-bold block text-emerald-900">Progres Pregătire Bagaj Secret:</span>
                <span className="text-[10px] text-emerald-800">{packedCount} din {totalCount} articole esențiale bifate</span>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-200 px-2 py-0.5 rounded-full text-emerald-950">
                {Math.round((packedCount / totalCount) * 100)}%
              </span>
            </div>

            <div className="space-y-1.5">
              {safetyPlan.emergencyBagItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleBagItem(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                    item.packed 
                      ? 'bg-white border-emerald-300 text-slate-900 shadow-2xs' 
                      : 'bg-stone-100/70 border-stone-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.packed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                    <span className={item.packed ? 'font-medium' : ''}>{item.label}</span>
                  </div>
                  <span className="text-[9px] bg-stone-200/60 px-1.5 py-0.5 rounded text-stone-600">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EVADARE & RUTĂ */}
        {activeTab === 'route' && (
          <div className="space-y-2 text-xs">
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Traseu de Ieșire din Locuință:</span>
              </div>
              <p className="text-[11px] text-slate-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                {safetyPlan.evacuationRoute}
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Locație Sigură de Refugiu:</span>
              </div>
              <p className="text-[11px] text-slate-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                {safetyPlan.safeLocation}
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Chei & Mijloc de Transport:</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div><strong>Chei rezervă:</strong> {safetyPlan.keys}</div>
                <div><strong>Transport:</strong> {safetyPlan.transportMethod}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COPII & ANIMALE */}
        {activeTab === 'children' && (
          <div className="space-y-2 text-xs">
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Baby className="w-4 h-4 text-purple-600" />
                <span>Plan Protecție Copii Minori:</span>
              </div>
              <p className="text-[11px] text-slate-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                {safetyPlan.childProtectionPlan}
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Dog className="w-4 h-4 text-amber-700" />
                <span>Plan Animale de Companie:</span>
              </div>
              <p className="text-[11px] text-slate-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                {safetyPlan.petPlan}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: CUVINTE COD SECRETE */}
        {activeTab === 'codewords' && (
          <div className="space-y-2 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Cuvânt de Cod pentru Familie (112):</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 font-mono text-xs font-bold text-amber-950">
                „{safetyPlan.safeCodeWordFamily}”
              </div>
              <p className="text-[10px] text-amber-800">
                Când trimiți acest mesaj, persoana de încredere sună imediat la 112 și indică adresa ta.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Cuvânt de Cod pentru Prieteni:</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-200 font-mono text-xs font-bold text-blue-950">
                „{safetyPlan.safeCodeWordContacts}”
              </div>
              <p className="text-[10px] text-blue-800">
                Semnalizează că ai nevoie de sprijin și activarea adăpostului de refugiu.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Offline Status Footer */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-700 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Plan disponibil offline (fără conexiune la internet)
        </span>
        <button
          onClick={() => setIsPlanHidden(true)}
          className="text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer"
        >
          Maschează
        </button>
      </div>
    </div>
  );
};

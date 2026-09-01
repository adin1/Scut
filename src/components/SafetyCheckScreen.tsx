import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  MapPin, 
  Smartphone, 
  Radio, 
  KeyRound, 
  CloudOff, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Plus,
  Lock,
  Sparkles,
  Layers,
  BatteryCharging,
  Sliders,
  Check
} from 'lucide-react';
import { SafetyCheckItem } from '../types/scut';
import { INITIAL_SAFETY_CHECK_ITEMS } from '../data/mockData';

interface SafetyCheckScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
}

export const SafetyCheckScreen: React.FC<SafetyCheckScreenProps> = ({ onBack, onQuickExit }) => {
  const [items, setItems] = useState<SafetyCheckItem[]>(INITIAL_SAFETY_CHECK_ITEMS);
  const [expandedId, setExpandedId] = useState<string | null>('sc-1');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [newCheckTitle, setNewCheckTitle] = useState<string>('');
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'safe' ? 'needs_action' : 'safe';
        return { ...item, status: nextStatus, isReviewed: true };
      }
      return item;
    }));
  };

  const markAllAsReviewed = () => {
    setItems(prev => prev.map(item => ({ ...item, status: 'safe', isReviewed: true })));
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStep('Analiză permisiuni de localizare & servicii GPS...');
    setTimeout(() => {
      setScanStep('Verificare sesiuni active WhatsApp Web & conturi partajate...');
    }, 800);
    setTimeout(() => {
      setScanStep('Căutare profile MDM, servicii de accesibilitate & stalkerware...');
    }, 1600);
    setTimeout(() => {
      setScanStep('Audit sincronizare automată cloud & albume foto...');
    }, 2400);
    setTimeout(() => {
      setIsScanning(false);
      setScanStep('');
    }, 3200);
  };

  const handleAddCustomCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckTitle.trim()) return;
    const newItem: SafetyCheckItem = {
      id: `sc-custom-${Date.now()}`,
      category: 'devices',
      title: newCheckTitle.trim(),
      riskDescription: 'Punct de verificare personalizat adăugat de utilizator pentru securitatea dispozitivului.',
      howToFixStep: 'Inspectează manual setările dispozitivului sau obiectul respectiv pentru a confirma absența riscurilor.',
      isReviewed: false,
      status: 'warning'
    };
    setItems(prev => [newItem, ...prev]);
    setNewCheckTitle('');
    setIsAddingCustom(false);
    setExpandedId(newItem.id);
  };

  const safeCount = items.filter(i => i.status === 'safe').length;
  const actionCount = items.filter(i => i.status !== 'safe').length;
  const scorePercentage = Math.round((safeCount / items.length) * 100) || 0;

  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.riskDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.howToFixStep.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'location': return <MapPin className="w-4 h-4 text-rose-600" />;
      case 'devices': return <Smartphone className="w-4 h-4 text-amber-600" />;
      case 'trackers': return <Radio className="w-4 h-4 text-red-600" />;
      case 'accounts': return <KeyRound className="w-4 h-4 text-blue-600" />;
      case 'backups': return <CloudOff className="w-4 h-4 text-purple-600" />;
      default: return <ShieldAlert className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'location': return 'Localizare GPS';
      case 'devices': return 'Dispozitiv & Sesiuni';
      case 'trackers': return 'Trackere & Spyware';
      case 'accounts': return 'Conturi & Parole';
      case 'backups': return 'Cloud & Backup';
      default: return 'Securitate';
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-3.5 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>VERIFICARE SECURITATE DISPOZITIV</span>
        </div>

        <button
          id="btn-safety-check-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă (ESC)"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 space-y-2.5">
        {/* Core Realistic Security Warning */}
        <div className="bg-amber-50 border border-amber-300/90 rounded-2xl p-2.5 text-amber-950 text-[11px] leading-relaxed shadow-2xs">
          <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Avertisment Realist de Securitate</span>
            </span>
            <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">CRITIC</span>
          </div>
          <p>
            <strong>Nicio aplicație pe un dispozitiv compromis nu poate garanta invizibilitatea absolută.</strong> Dacă agresorul are acces fizic la telefon, parolele sau aplicații spion de fundal, parcurge această listă pas cu pas pentru a elimina scurgerile de date.
          </p>
        </div>

        {/* Security Audit Gauge & Action Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-xs shadow-xs ${
                scorePercentage >= 80 ? 'bg-emerald-600' : scorePercentage >= 50 ? 'bg-amber-600' : 'bg-rose-600'
              }`}>
                {scorePercentage}%
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Scor Audit Siguranță</h3>
                <p className="text-[10px] text-slate-500">{safeCount} din {items.length} verificări securizate</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold shadow-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Se analizează...' : 'Audit Rapid'}</span>
              </button>

              <button
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl transition cursor-pointer"
                title="Adaugă punct de verificare personalizat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                scorePercentage >= 80 ? 'bg-emerald-500' : scorePercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>

          {/* Dynamic Live Scan Feedback */}
          {isScanning && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-2 text-[10px] text-sky-900 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="font-medium">{scanStep}</span>
            </div>
          )}
        </div>

        {/* Custom Item Input Drawer */}
        {isAddingCustom && (
          <form onSubmit={handleAddCustomCheck} className="bg-white border border-stone-300 rounded-2xl p-2.5 shadow-xs space-y-2">
            <div className="text-[11px] font-bold text-slate-800">Adaugă Verificare Personalizată</div>
            <input
              type="text"
              value={newCheckTitle}
              onChange={(e) => setNewCheckTitle(e.target.value)}
              placeholder="ex: Verifică dacă cheia mașinii are tracker atașat..."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-2.5 py-1 text-[10px] font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow-xs"
              >
                Salvează Punctul
              </button>
            </div>
          </form>
        )}

        {/* Category Tabs & Search Bar */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută în verificări (GPS, WhatsApp, AirTag, Parolă)..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-none">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer ${
                filterCategory === 'all' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              Toate ({items.length})
            </button>
            <button
              onClick={() => setFilterCategory('accounts')}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'accounts' 
                  ? 'bg-blue-800 text-white shadow-xs' 
                  : 'bg-white border border-stone-200 text-blue-800 hover:bg-blue-50'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>Conturi Partajate</span>
            </button>
            <button
              onClick={() => setFilterCategory('location')}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'location' 
                  ? 'bg-rose-700 text-white shadow-xs' 
                  : 'bg-white border border-stone-200 text-rose-800 hover:bg-rose-50'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Localizare GPS</span>
            </button>
            <button
              onClick={() => setFilterCategory('trackers')}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'trackers' 
                  ? 'bg-red-800 text-white shadow-xs' 
                  : 'bg-white border border-stone-200 text-red-800 hover:bg-red-50'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Spyware & Trackers</span>
            </button>
            <button
              onClick={() => setFilterCategory('backups')}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'backups' 
                  ? 'bg-purple-800 text-white shadow-xs' 
                  : 'bg-white border border-stone-200 text-purple-800 hover:bg-purple-50'
              }`}
            >
              <CloudOff className="w-3 h-3" />
              <span>Cloud & Backup</span>
            </button>
          </div>
        </div>

        {/* Security Checklist Cards */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center text-xs text-stone-500">
              Niciun rezultat găsit pentru căutarea selectată.
            </div>
          ) : (
            filteredItems.map(item => {
              const isExpanded = expandedId === item.id;
              const isSafe = item.status === 'safe';

              return (
                <div 
                  key={item.id}
                  className={`border rounded-2xl p-3 transition shadow-xs ${
                    isSafe 
                      ? 'bg-white border-stone-200/90' 
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  {/* Card Header Row */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 pr-2">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSafe ? 'bg-stone-100 text-slate-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.riskDescription}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isSafe 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-900 font-extrabold border border-rose-200 animate-pulse'
                      }`}>
                        {isSafe ? '✓ Securizat' : '⚠️ Verifică'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-stone-400" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-stone-100 space-y-2 text-[11px]">
                      {/* Risk explanation */}
                      <div className="bg-stone-50 p-2.5 rounded-xl text-slate-700 border border-stone-200/60 leading-relaxed">
                        <span className="text-slate-900 block text-[10px] uppercase font-bold mb-0.5">
                          🔴 De ce este un risc critic:
                        </span>
                        {item.riskDescription}
                      </div>

                      {/* Step-by-step fix guide */}
                      <div className="bg-emerald-50/70 p-2.5 rounded-xl text-emerald-950 border border-emerald-200/80 leading-relaxed">
                        <span className="text-emerald-900 block text-[10px] uppercase font-bold mb-0.5 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Ghid pas cu pas de rezolvare (Android & iOS):</span>
                        </span>
                        {item.howToFixStep}
                      </div>

                      {/* Immediate Safety Advice Alert */}
                      <div className="bg-sky-50/80 p-2 rounded-xl text-sky-950 border border-sky-200 text-[10px] leading-tight flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Sfat de siguranță:</strong> Dacă suspectezi că agresorul te urmărește activ, oprirea bruscă a partajării îi poate trimite notificare. Fă această verificare într-un loc sigur (la birou, la secție sau la adăpost).
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-slate-400 font-mono">
                          Categorie: {getCategoryLabel(item.category)}
                        </span>

                        <button
                          onClick={() => toggleStatus(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                            isSafe 
                              ? 'bg-stone-200 text-slate-700 hover:bg-stone-300' 
                              : 'bg-emerald-700 text-white hover:bg-emerald-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isSafe ? 'Marchează ca neverificat' : 'Am verificat & e în regulă'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info Banner */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200/90 rounded-xl p-2 text-[10px] text-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          <span className="leading-tight">
            <strong>Recomandare:</strong> Repetă auditul lunar sau după orice acces nesupravegheat la telefon.
          </span>
        </div>
        <button
          onClick={markAllAsReviewed}
          className="text-[9px] font-bold text-sky-800 hover:underline shrink-0 ml-2 cursor-pointer"
        >
          Validează toate
        </button>
      </div>
    </div>
  );
};

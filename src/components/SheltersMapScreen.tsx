import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Phone, 
  ArrowLeft, 
  X, 
  ShieldCheck, 
  Navigation, 
  Building2, 
  HeartHandshake, 
  Cross,
  CheckCircle2,
  Clock,
  Brain,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Check,
  Info,
  ChevronRight
} from 'lucide-react';
import { ShelterLocation } from '../types/scut';
import { SHELTERS_LIST } from '../data/mockData';

interface SheltersMapScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
}

export const SheltersMapScreen: React.FC<SheltersMapScreenProps> = ({ onBack, onQuickExit }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [only24h, setOnly24h] = useState<boolean>(false);
  const [onlyPsychological, setOnlyPsychological] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShelter, setSelectedShelter] = useState<ShelterLocation | null>(SHELTERS_LIST[0]);

  // Comprehensive Filtering Logic
  const filteredShelters = useMemo(() => {
    return SHELTERS_LIST.filter(item => {
      // 1. Facility Type Filter
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }

      // 2. Non-Stop 24/7 Filter
      if (only24h && !item.emergency24h) {
        return false;
      }

      // 3. Specialized Psychological Support Filter
      if (onlyPsychological && !item.hasPsychologicalSupport) {
        return false;
      }

      // 4. Search Query (City, Name, Services, Address)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesAddress = item.address.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesServices = item.services?.some(s => s.toLowerCase().includes(query)) || false;
        if (!matchesName && !matchesCity && !matchesAddress && !matchesDesc && !matchesServices) {
          return false;
        }
      }

      return true;
    });
  }, [filterType, only24h, onlyPsychological, searchQuery]);

  // Keep selected shelter valid if filtered out
  const activeSelected = useMemo(() => {
    if (selectedShelter && filteredShelters.some(s => s.id === selectedShelter.id)) {
      return selectedShelter;
    }
    return filteredShelters.length > 0 ? filteredShelters[0] : null;
  }, [filteredShelters, selectedShelter]);

  const resetAllFilters = () => {
    setFilterType('all');
    setOnly24h(false);
    setOnlyPsychological(false);
    setSearchQuery('');
  };

  const hasActiveFilters = filterType !== 'all' || only24h || onlyPsychological || searchQuery.trim() !== '';

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>HARTĂ ADĂPOSTURI & RESURSE</span>
        </div>

        <button
          id="btn-shelters-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="my-auto py-2 space-y-2.5">
        
        {/* Search & Quick Filter Bar */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută oraș (București, Cluj, etc.) sau serviciu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-300 focus:border-indigo-500 rounded-xl text-xs outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Primary Specialization Filter Chips (Non-Stop & Psychological Support) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 1. Non-Stop 24/7 Filter Button */}
            <button
              id="filter-24h-toggle"
              onClick={() => setOnly24h(prev => !prev)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                only24h
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Clock className={`w-3 h-3 ${only24h ? 'text-emerald-200' : 'text-emerald-600'}`} />
              <span>Deschise Non-Stop (24/7)</span>
              {only24h && <Check className="w-2.5 h-2.5 ml-0.5" />}
            </button>

            {/* 2. Specialized Psychological Support Filter Button */}
            <button
              id="filter-psych-toggle"
              onClick={() => setOnlyPsychological(prev => !prev)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                onlyPsychological
                  ? 'bg-purple-800 text-white border-purple-900 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Brain className={`w-3 h-3 ${onlyPsychological ? 'text-purple-200' : 'text-purple-600'}`} />
              <span>Suport Psihologic Specializat</span>
              {onlyPsychological && <Check className="w-2.5 h-2.5 ml-0.5" />}
            </button>

            {/* Reset Filters Shortcut */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2 py-1 rounded-full text-[10px] font-medium text-stone-500 hover:text-stone-800 bg-stone-200 hover:bg-stone-300 transition flex items-center gap-0.5 cursor-pointer ml-auto"
                title="Resetează toate filtrele"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Resetează</span>
              </button>
            )}
          </div>

          {/* Secondary Facility Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'Toate Tipurile' },
              { id: 'shelter', label: '🏠 Adăposturi DGASPC' },
              { id: 'ngo', label: '🤝 ONG-uri & Centre Criză' },
              { id: 'police', label: '🛡️ Secții Poliție' },
              { id: 'hospital', label: '🏥 INML & Spitale' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap text-[10px] font-semibold transition cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Map Visual Vector Container */}
        <div className="relative w-full h-36 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-2.5">
          {/* Stylized vector map grid */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          <svg className="absolute inset-0 w-full h-full stroke-slate-800" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 30 L 380 70" fill="none" strokeWidth="3" />
            <path d="M 80 0 L 140 180" fill="none" strokeWidth="5" />
            <path d="M 260 0 L 220 180" fill="none" strokeWidth="4" />
            <circle cx="160" cy="70" r="28" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Interactive Shelter Pins */}
          {filteredShelters.map((shelter, idx) => {
            const isSelected = activeSelected?.id === shelter.id;
            const positions = [
              { top: '35%', left: '28%' },
              { top: '65%', left: '72%' },
              { top: '42%', left: '54%' },
              { top: '78%', left: '22%' },
              { top: '22%', left: '76%' },
              { top: '55%', left: '86%' },
              { top: '68%', left: '44%' },
              { top: '25%', left: '42%' }
            ];
            const pos = positions[idx % positions.length];

            return (
              <div
                key={shelter.id}
                onClick={() => setSelectedShelter(shelter)}
                style={{ top: pos.top, left: pos.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition transform ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                }`}
                title={`${shelter.name} (${shelter.city})`}
              >
                <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg border-2 ${
                  isSelected ? 'border-amber-300 ring-2 ring-amber-400' : 'border-white'
                } ${
                  shelter.hasPsychologicalSupport ? 'bg-purple-700' :
                  shelter.type === 'shelter' ? 'bg-emerald-600' :
                  shelter.type === 'police' ? 'bg-blue-600' :
                  shelter.type === 'hospital' ? 'bg-rose-600' :
                  'bg-indigo-600'
                }`}>
                  {shelter.hasPsychologicalSupport ? (
                    <Brain className="w-3.5 h-3.5 text-purple-200" />
                  ) : shelter.type === 'shelter' ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : shelter.type === 'police' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : shelter.type === 'hospital' ? (
                    <Cross className="w-3.5 h-3.5" />
                  ) : (
                    <HeartHandshake className="w-3.5 h-3.5" />
                  )}

                  {/* 24/7 Dot Badge on Pin */}
                  {shelter.emergency24h && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Top overlay count */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded text-emerald-400 font-semibold backdrop-blur border border-slate-800">
              {filteredShelters.length} Locații Găsite
            </span>
            <span className="text-[9px] bg-indigo-600/90 text-white px-2 py-0.5 rounded-full font-semibold">
              Rețea Securizată Națională
            </span>
          </div>

          <div className="text-[9px] text-slate-300 z-10 bg-black/70 px-2 py-0.5 rounded backdrop-blur max-w-fit flex items-center gap-1">
            <Info className="w-3 h-3 text-sky-400" />
            <span>Apasă pe un pin pentru fișa de contact și asistență.</span>
          </div>
        </div>

        {/* Empty State If No Filter Match */}
        {filteredShelters.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              Niciun adăpost sau centru nu corespunde filtrelor selectate.
            </p>
            <p className="text-[10px] text-slate-500">
              Încercați să debifați filtrul Non-Stop sau Suport Psihologic pentru a vedea toate centrele disponibile.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
            >
              Afișează Toate Adăposturile
            </button>
          </div>
        )}

        {/* Selected Shelter Details Card */}
        {activeSelected && (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-3 shadow-xs space-y-2">
            {/* Header & Badges */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Type Badge */}
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {activeSelected.type === 'shelter' ? 'Adăpost DGASPC' :
                     activeSelected.type === 'ngo' ? 'ONG / Centru Criză' :
                     activeSelected.type === 'police' ? 'Secție Poliție' :
                     'INML / Medical'}
                  </span>

                  {/* 24/7 Non-Stop Badge */}
                  {activeSelected.emergency24h ? (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-emerald-700" />
                      Non-Stop 24/7
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-amber-700" />
                      {activeSelected.schedule || 'Program de zi'}
                    </span>
                  )}

                  {/* Psychological Support Badge */}
                  {activeSelected.hasPsychologicalSupport && (
                    <span className="text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Brain className="w-2.5 h-2.5 text-purple-700" />
                      Suport Psihologic
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-1">{activeSelected.name}</h3>
                <p className="text-[10px] text-slate-500">{activeSelected.address}, {activeSelected.city}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-600 leading-relaxed bg-stone-50 p-2 rounded-xl border border-stone-100">
              {activeSelected.description}
            </p>

            {/* Available Services Tag Cloud */}
            {activeSelected.services && activeSelected.services.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {activeSelected.services.map((srv, i) => (
                  <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                    ✓ {srv}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-1 flex gap-2">
              <a
                href={`tel:${activeSelected.phone}`}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-center text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Apelează ({activeSelected.phone})</span>
              </a>
              <button
                onClick={() => alert(`Traseu confidențial optimizat către ${activeSelected.name} generat. Navigarea nu lasă istoric în Google Maps.`)}
                className="px-3 py-2 bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Traseu Sigur</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Matching List Carousel */}
        {filteredShelters.length > 1 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
              <span>Alte locații conforme filtrelor ({filteredShelters.length}):</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {filteredShelters.map(s => {
                const isCurrent = activeSelected?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShelter(s)}
                    className={`min-w-[160px] max-w-[170px] p-2 rounded-xl border text-left cursor-pointer transition shrink-0 ${
                      isCurrent 
                        ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-1 ring-indigo-300' 
                        : 'bg-white border-stone-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 truncate">
                      {s.hasPsychologicalSupport && <Brain className="w-3 h-3 text-purple-600 shrink-0" />}
                      <span className="truncate">{s.city}</span>
                      {s.emergency24h && <span className="text-emerald-600 font-mono">24/7</span>}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-900 truncate mt-0.5">{s.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Safety Notice */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center shrink-0">
        Adresele exacte ale adăposturilor de grad 0 sunt confidențiale și sunt comunicate doar la confirmarea cazului de către DGASPC.
      </div>

    </div>
  );
};

import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { ShelterLocation } from '../types/scut';
import { SHELTERS_LIST } from '../data/mockData';

interface SheltersMapScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
}

export const SheltersMapScreen: React.FC<SheltersMapScreenProps> = ({ onBack, onQuickExit }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedShelter, setSelectedShelter] = useState<ShelterLocation | null>(SHELTERS_LIST[0]);

  const filteredShelters = SHELTERS_LIST.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>HARTĂ ADĂPOSTURI & RESURSE</span>
        </div>

        <button
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition"
          title="Ieșire Rapidă"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 space-y-3">
        {/* Interactive Map Visual Vector Container */}
        <div className="relative w-full h-44 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-3">
          {/* Stylized vector map grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px]"></div>
          
          <svg className="absolute inset-0 w-full h-full stroke-slate-700/80" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 30 L 380 70" fill="none" strokeWidth="4" />
            <path d="M 80 0 L 140 180" fill="none" strokeWidth="6" />
            <path d="M 260 0 L 220 180" fill="none" strokeWidth="5" />
            <circle cx="160" cy="80" r="30" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Interactive Shelter Pins */}
          {filteredShelters.map((shelter, idx) => {
            const isSelected = selectedShelter?.id === shelter.id;
            const positions = [
              { top: '35%', left: '30%' },
              { top: '65%', left: '70%' },
              { top: '45%', left: '55%' },
              { top: '75%', left: '25%' },
              { top: '20%', left: '75%' },
              { top: '50%', left: '85%' },
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
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white ${
                  shelter.type === 'shelter' ? 'bg-emerald-600' :
                  shelter.type === 'police' ? 'bg-blue-600' :
                  shelter.type === 'hospital' ? 'bg-rose-600' :
                  'bg-indigo-600'
                }`}>
                  {shelter.type === 'shelter' && <Building2 className="w-3.5 h-3.5" />}
                  {shelter.type === 'police' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {shelter.type === 'hospital' && <Cross className="w-3.5 h-3.5" />}
                  {shelter.type === 'ngo' && <HeartHandshake className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}

          {/* Top overlay */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded text-emerald-400 font-semibold backdrop-blur">
              {filteredShelters.length} Locații Sigure Verificate
            </span>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
              București & Național
            </span>
          </div>

          <div className="text-[10px] text-slate-300 z-10 bg-black/60 px-2 py-1 rounded backdrop-blur max-w-fit">
            Apasă pe un pin pentru detalii de acces confidențial.
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Toate' },
            { id: 'shelter', label: '🏠 Adăposturi DGASPC' },
            { id: 'police', label: '🛡️ Secții Poliție' },
            { id: 'hospital', label: '🏥 INML & Spitale' },
            { id: 'ngo', label: '🤝 ONG-uri ANAIS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[10px] font-semibold transition ${
                filterType === tab.id
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Shelter Details Card */}
        {selectedShelter && (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-3.5 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {selectedShelter.type.toUpperCase()} • 24/7
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-1">{selectedShelter.name}</h3>
                <p className="text-[11px] text-slate-500">{selectedShelter.address}, {selectedShelter.city}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed bg-stone-50 p-2 rounded-xl border border-stone-100">
              {selectedShelter.description}
            </p>

            <div className="pt-1 flex gap-2">
              <a
                href={`tel:${selectedShelter.phone}`}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-center text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Apelează ({selectedShelter.phone})</span>
              </a>
              <button
                onClick={() => alert(`Traseu confidențial optimizat către ${selectedShelter.name} generat.`)}
                className="px-3 py-2 bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Traseu Sigur</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center">
        Adresele exacte ale adăposturilor de grad 0 sunt confidențiale și sunt comunicate doar la confirmarea cazului de către DGASPC.
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Layers, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { CASE_DOSSIER_MOCK } from '../data/mockData';

interface CaseDossierScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
}

export const CaseDossierScreen: React.FC<CaseDossierScreenProps> = ({ onBack, onQuickExit }) => {
  const [selectedRole, setSelectedRole] = useState<'victima' | 'politie' | 'dgaspc' | 'medic_inml' | 'psiholog' | 'avocat'>('victima');

  const roleLabels: Record<string, { label: string; desc: string; badge: string }> = {
    victima: { label: 'Victimă (Titular Dosar)', desc: 'Acces complet la datele proprii și stadiul măsurilor de protecție.', badge: 'bg-emerald-100 text-emerald-800' },
    politie: { label: 'Poliția Română (112 / Secție)', desc: 'Acces la identitate, risc, adrese, istoric agresiuni și emitere OPP.', badge: 'bg-blue-100 text-blue-800' },
    dgaspc: { label: 'DGASPC (Asistență Socială)', desc: 'Acces la situația minorilor, alocare adăpost și pachete de reintegrare.', badge: 'bg-indigo-100 text-indigo-800' },
    medic_inml: { label: 'Medic Legist (INML)', desc: 'Acces strict la fișele medicale, leziuni traumatice și certificate.', badge: 'bg-rose-100 text-rose-800' },
    psiholog: { label: 'Psiholog / Terapeut', desc: 'Acces confidențial la evaluările de traumă și notele de terapie.', badge: 'bg-teal-100 text-teal-800' },
    avocat: { label: 'Avocat Pro-Bono (Barou)', desc: 'Acces la dosarul judiciar pentru susținerea Ordinului în instanță.', badge: 'bg-amber-100 text-amber-800' },
  };

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

        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
          <FileCheck2 className="w-4 h-4 text-teal-600" />
          <span>DOSARUL ELECTRONIC UNIC</span>
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
        {/* Anti-Retraumatization Principle Explanation (Phase 3 Spec) */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-teal-950 text-[11px] leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-teal-900 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Prevenirea Retraumatizării prin Dosar Unic:</span>
          </div>
          Victima nu mai este nevoită să repete povestea abuzului la 5 instituții diferite. Informațiile sunt partajate securizat cu acces strict pe bază de rol (RBAC) și criptare de la un capăt la altul.
        </div>

        {/* Role Switcher Simulator */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 px-1">
            <span className="font-bold text-slate-800">Simulare Perspectivă Rol (RBAC):</span>
            <span className="text-[10px] text-teal-700 font-medium">Alege un rol</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.keys(roleLabels).map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role as any)}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition text-center truncate ${
                  selectedRole === role
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Active Role Description */}
        <div className="bg-white border border-stone-200 rounded-2xl p-2.5 shadow-xs text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-900">{roleLabels[selectedRole].label}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${roleLabels[selectedRole].badge}`}>
              Nivel Permisiuni
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{roleLabels[selectedRole].desc}</p>
        </div>

        {/* Case File Sections Matrix */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {CASE_DOSSIER_MOCK.map(section => {
            const hasAccess = section.authorizedRoles.includes(selectedRole);

            return (
              <div
                key={section.id}
                className={`border rounded-2xl p-3 transition ${
                  hasAccess 
                    ? 'bg-white border-stone-200 shadow-xs' 
                    : 'bg-stone-100/70 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      hasAccess ? 'bg-teal-100 text-teal-800' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {hasAccess ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">{section.title}</h3>
                  </div>

                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    hasAccess ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {hasAccess ? 'Acces Permis' : 'Criptat / Restricționat'}
                  </span>
                </div>

                {hasAccess ? (
                  <div className="space-y-1.5 pt-1">
                    {section.dataFields.map((field, idx) => (
                      <div key={idx} className="bg-stone-50 p-2 rounded-xl text-[11px] border border-stone-100">
                        <span className="text-slate-500 block text-[10px]">{field.label}:</span>
                        <span className="font-semibold text-slate-800">{field.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-200/50 rounded-xl text-center text-[10px] text-stone-500 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Conținut blocat conform principiului "Need to Know". Rolul ales nu are drept de decriptare.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Security Notice */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center">
        Toate accesările dosarului sunt auditate criptografic într-un registru distribuit de securitate.
      </div>
    </div>
  );
};

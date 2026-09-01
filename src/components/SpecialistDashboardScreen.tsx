import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  AlertTriangle, 
  FileText, 
  Scale, 
  HeartPulse, 
  Baby, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Flame, 
  UserCheck, 
  Radio, 
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { InstitutionalRole, Case, ProtectionOrder, Child, CaseStatus, PilotRegionConfig } from '../types/scut';
import { 
  INITIAL_CASES, 
  INITIAL_PROTECTION_ORDERS, 
  INITIAL_CHILDREN, 
  PILOT_REGION_CONFIG, 
  VERIFIED_STATISTICS 
} from '../data/mockData';

interface SpecialistDashboardScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
  onNavigateToCourtExport: () => void;
}

export const SpecialistDashboardScreen: React.FC<SpecialistDashboardScreenProps> = ({
  onBack,
  onQuickExit,
  onNavigateToCourtExport
}) => {
  const [selectedRole, setSelectedRole] = useState<InstitutionalRole>('police');
  const [activeTab, setActiveTab] = useState<'cases' | 'orders' | 'children' | 'pilot_stats' | 'break_glass'>('cases');
  const [caseFilterStatus, setCaseFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-001');

  // Break glass state
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [breakGlassSuccess, setBreakGlassSuccess] = useState(false);

  const roleLabels: Record<InstitutionalRole, { label: string; org: string; color: string }> = {
    victim: { label: 'Victimă', org: 'Titular Dosar', color: 'bg-emerald-100 text-emerald-800' },
    police: { label: 'Poliția Română', org: 'Secția 1 Poliție (OPP & 112)', color: 'bg-blue-100 text-blue-800' },
    dgaspc: { label: 'DGASPC', org: 'Direcția Asistență Socială & Minori', color: 'bg-indigo-100 text-indigo-800' },
    social_worker: { label: 'Asistent Social', org: 'Serviciul Comunitar', color: 'bg-purple-100 text-purple-800' },
    ngo_operator: { label: 'Operator ONG', org: 'Asociația ANAIS', color: 'bg-teal-100 text-teal-800' },
    doctor: { label: 'Medic Spital', org: 'Unitate Primiri Urgențe (UPU)', color: 'bg-rose-100 text-rose-800' },
    forensic_inml: { label: 'Medic Legist', org: 'INML Mina Minovici', color: 'bg-red-100 text-red-800' },
    psychologist: { label: 'Psihoterapeut', org: 'Centrul Maternal Traumă', color: 'bg-amber-100 text-amber-800' },
    lawyer: { label: 'Avocat Barou', org: 'Baroul București (Pro-Bono)', color: 'bg-cyan-100 text-cyan-800' },
    institutional_admin: { label: 'Administrator', org: 'Registru Regional Pilot', color: 'bg-slate-100 text-slate-800' },
    auditor: { label: 'Auditor eIDAS', org: 'Comisie Audit & Conformitate', color: 'bg-stone-100 text-stone-800' }
  };

  const handleBreakGlassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (breakGlassReason.length < 15) return;
    setBreakGlassSuccess(true);
  };

  const filteredCases = INITIAL_CASES.filter(c => {
    if (caseFilterStatus === 'all') return true;
    return c.status === caseFilterStatus;
  });

  const selectedCase = INITIAL_CASES.find(c => c.id === selectedCaseId) || INITIAL_CASES[0];

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

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Building2 className="w-4 h-4 text-blue-700" />
          <span>SCUT CASE • PANOU SPECIALIȘTI</span>
        </div>

        <button
          id="btn-specialist-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă (ESC)"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Role Switcher Matrix */}
      <div className="pt-2 pb-1 space-y-1">
        <div className="flex items-center justify-between text-[11px] px-1">
          <span className="font-bold text-slate-800">Simulare Perspectivă Specialist (RBAC):</span>
          <span className="text-[10px] text-blue-700 font-semibold">{roleLabels[selectedRole].org}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(['police', 'dgaspc', 'lawyer', 'forensic_inml', 'psychologist', 'ngo_operator', 'doctor', 'auditor'] as InstitutionalRole[]).map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`py-1 px-1 rounded-xl text-[9px] font-bold border transition text-center truncate cursor-pointer ${
                selectedRole === r
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {roleLabels[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1 pt-1.5 pb-1 text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`py-1.5 px-0.5 rounded-xl transition text-center cursor-pointer truncate ${
            activeTab === 'cases' ? 'bg-blue-700 text-white shadow-xs' : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Dosare ({INITIAL_CASES.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-1.5 px-0.5 rounded-xl transition text-center cursor-pointer truncate ${
            activeTab === 'orders' ? 'bg-blue-700 text-white shadow-xs' : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Ordine OPP
        </button>
        <button
          onClick={() => setActiveTab('children')}
          className={`py-1.5 px-0.5 rounded-xl transition text-center cursor-pointer truncate ${
            activeTab === 'children' ? 'bg-blue-700 text-white shadow-xs' : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Minori ({INITIAL_CHILDREN.length})
        </button>
        <button
          onClick={() => setActiveTab('pilot_stats')}
          className={`py-1.5 px-0.5 rounded-xl transition text-center cursor-pointer truncate ${
            activeTab === 'pilot_stats' ? 'bg-blue-700 text-white shadow-xs' : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          Pilot & Stats
        </button>
        <button
          onClick={() => setActiveTab('break_glass')}
          className={`py-1.5 px-0.5 rounded-xl transition text-center cursor-pointer truncate ${
            activeTab === 'break_glass' ? 'bg-rose-700 text-white shadow-xs' : 'bg-stone-200 text-rose-800 hover:bg-stone-300'
          }`}
        >
          Break-Glass
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 my-1 overflow-y-auto space-y-2.5">
        {/* TAB 1: CASES MANAGEMENT */}
        {activeTab === 'cases' && (
          <div className="space-y-2">
            {/* Status Filter Scrollable Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[9px] no-scrollbar">
              {[
                { id: 'all', label: 'Toate' },
                { id: 'urgent', label: '🚨 Urgente' },
                { id: 'expiring_orders', label: '⚠️ Expiră Ordine' },
                { id: 'in_progress', label: 'În lucru' },
                { id: 'awaiting_docs', label: 'Așteaptă doc' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCaseFilterStatus(f.id as any)}
                  className={`px-2 py-1 rounded-lg shrink-0 font-bold transition cursor-pointer ${
                    caseFilterStatus === f.id ? 'bg-slate-900 text-white' : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Case List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredCases.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer shadow-xs ${
                    selectedCaseId === c.id 
                      ? 'bg-white border-blue-500 ring-2 ring-blue-500/20' 
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{c.caseNumber}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                        c.riskLevel === 'CRITIC' ? 'bg-rose-100 text-rose-800 font-extrabold' : 'bg-amber-100 text-amber-800'
                      }`}>
                        RISC {c.riskLevel}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{c.lastUpdated}</span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug line-clamp-2 mb-2">{c.summary}</p>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Regiune: <strong>{c.pilotRegion}</strong></span>
                      {c.hasActiveBracelet && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5" /> Brățară SIME Activă
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToCourtExport();
                      }}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5 text-[10px]"
                    >
                      <span>Pachet Probatoriu</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROTECTION ORDERS LIFECYCLE */}
        {activeTab === 'orders' && (
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-blue-950 text-[11px] leading-relaxed">
              <span className="font-bold block text-blue-900 mb-0.5">Management Ordine de Protecție (Legea 217/2003):</span>
              Monitorizarea automată a termenelor de expirare pentru OPP (5 zile) și tranziția către Ordinul Judecătoresc de 12 luni.
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {INITIAL_PROTECTION_ORDERS.map(po => (
                <div key={po.id} className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">{po.orderNumber}</span>
                      <span className="text-[10px] text-slate-500">{po.issuingAuthority}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      po.status === 'expira_in_curand' 
                        ? 'bg-rose-100 text-rose-800 font-extrabold animate-pulse' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {po.status === 'expira_in_curand' ? `⚠️ Expiră în ${po.daysUntilExpiry} zi` : 'În Procedură'}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2 rounded-xl text-[11px] space-y-1 border border-stone-100">
                    <div className="text-slate-700"><strong>Distanță impusă:</strong> {po.enforcedDistanceMeters} metri</div>
                    <div className="text-slate-700"><strong>Persoane protejate:</strong> {po.protectedPersons.join(', ')}</div>
                    <div className="text-slate-700"><strong>Monitorizare SIME:</strong> {po.electronicBraceletActive ? 'Activă (Semnal GPS sincronizat 112)' : 'Inactivă'}</div>
                  </div>

                  {po.notes && (
                    <p className="text-[10px] text-slate-500 italic">{po.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CHILDREN PROTECTION MODULE */}
        {activeTab === 'children' && (
          <div className="space-y-2">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 text-purple-950 text-[11px] leading-relaxed">
              <span className="font-bold block text-purple-900 mb-0.5">Protecție Specială Minori & Copii Martori (DGASPC):</span>
              Securizarea perimetrelor educaționale și prevenirea abuzurilor secundare sau a preluării neautorizate.
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {INITIAL_CHILDREN.map(ch => (
                <div key={ch.id} className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                        <Baby className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{ch.nameOrAlias} ({ch.age} ani)</h4>
                        <p className="text-[10px] text-slate-500">{ch.schoolOrKindergarten}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Risc {ch.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Persoane autorizate preluare de la școală:</span>
                      <span className="font-semibold text-slate-800">{ch.authorizedPersonsToPickUp.join(' • ')}</span>
                    </div>
                    {ch.specialNeeds && (
                      <div className="pt-1 text-[10px] text-purple-900">
                        <strong>Măsură DGASPC:</strong> {ch.specialNeeds}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PILOT METRICS & VERIFIED STATISTICS */}
        {activeTab === 'pilot_stats' && (
          <div className="space-y-2.5">
            {/* Pilot Status Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300">{PILOT_REGION_CONFIG.pilotRegionName}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PILOT {PILOT_REGION_CONFIG.pilotStatus.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Timp mediu triere:</span>
                  <span className="font-mono font-bold text-white">{PILOT_REGION_CONFIG.averageTriageMinutes} min</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Integritate probe:</span>
                  <span className="font-mono font-bold text-emerald-400">{PILOT_REGION_CONFIG.verifiedEvidenceIntegrityRate}% SHA-256</span>
                </div>
              </div>
            </div>

            {/* Verified Statistics Registry (Requirement 35) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1 px-1">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Statistici Oficiale Verificate (România & UE):</span>
              </div>
              {VERIFIED_STATISTICS.map(stat => (
                <div key={stat.id} className="bg-white border border-stone-200 rounded-xl p-2.5 text-xs shadow-2xs space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{stat.metricLabel}</span>
                    <span className="text-blue-700 font-mono">{stat.value}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 flex justify-between">
                    <span>Sursă: {stat.source}</span>
                    <span>Anul: {stat.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BREAK-GLASS EMERGENCY ACCESS */}
        {activeTab === 'break_glass' && (
          <div className="space-y-2 text-xs">
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 text-rose-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Protocol Break-Glass (Acces Excepțional de Urgență)</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-snug">
                Utilizat <strong>exclusiv în situații de pericol iminent de moarte</strong> când victima este inconștientă sau în imposibilitate de a acorda consimțământ. Accesarea este auditată ireversibil.
              </p>
            </div>

            {breakGlassSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-emerald-950 text-center space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-xs">Acces de Urgență Autorizat</h4>
                <p className="text-[11px] text-emerald-800">
                  Dosarul #{selectedCase.caseNumber} a fost deblocat pentru intervenție. Evenimentul a fost salvat în registrul de audit imutabil eIDAS Block #1044.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBreakGlassSubmit} className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Justificare Obligatorie Intervenție (minim 15 caractere):
                  </label>
                  <textarea
                    value={breakGlassReason}
                    onChange={e => setBreakGlassReason(e.target.value)}
                    placeholder="Ex: Apel 112 cu risc letal activ. Victima este sechestrată, necesită deblocare adrese de siguranță..."
                    className="w-full h-20 p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div className="text-[10px] text-slate-500">
                  Baza legală: <strong>CPP Art. 209 / Stare de necesitate Cod Penal Art. 20</strong>
                </div>

                <button
                  type="submit"
                  disabled={breakGlassReason.length < 15}
                  className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-bold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Deblochează Dosarul de Urgență</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center">
        Platforma SCUT interconectează Poliția, DGASPC, INML și Baroul conform Legii 217/2003 republicată.
      </div>
    </div>
  );
};

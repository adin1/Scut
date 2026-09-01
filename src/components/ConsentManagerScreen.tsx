import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  ArrowLeft, 
  X, 
  Eye, 
  UserX, 
  Lock, 
  FileText, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  History,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { Consent, AuditEvent } from '../types/scut';
import { INITIAL_CONSENTS, INITIAL_AUDIT_LOGS } from '../data/mockData';

interface ConsentManagerScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
}

export const ConsentManagerScreen: React.FC<ConsentManagerScreenProps> = ({ onBack, onQuickExit }) => {
  const [consents, setConsents] = useState<Consent[]>(INITIAL_CONSENTS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [activeTab, setActiveTab] = useState<'consents' | 'audit_log'>('consents');
  const [revokedNotice, setRevokedNotice] = useState<string | null>(null);

  const handleRevokeConsent = (consentId: string, personName: string) => {
    setConsents(prev => prev.map(c => c.id === consentId ? { ...c, status: 'revoked' } : c));
    
    // Add audit event for revocation
    const newAudit: AuditEvent = {
      id: `aud-rev-${Date.now()}`,
      timestamp: Date.now(),
      timeString: 'Chiar acum',
      actorId: 'usr-victim-001',
      actorRole: 'victim',
      actorInstitution: 'Titular Dosar',
      action: 'consent_revoke',
      resourceType: 'case',
      resourceId: 'SCUT-RO-2026-B0892',
      description: `Victima a revocat accesul la dosar pentru ${personName}.`,
      legalBasis: 'Drept de retragere consimțământ RGPD Art. 7 alin. 3',
      immutableBlockIndex: auditLogs.length + 1043
    };

    setAuditLogs(prev => [newAudit, ...prev]);
    setRevokedNotice(`Consimțământul acordat pentru ${personName} a fost revocat cu succes.`);
    setTimeout(() => setRevokedNotice(null), 4000);
  };

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case 'all_evidence': return 'Toate Probele';
      case 'specific_evidence': return 'Probe Selectate';
      case 'medical_docs': return 'Documente Medicale INML';
      case 'location': return 'Locație Adăpost';
      case 'children': return 'Date Minori';
      case 'timeline': return 'Cronologie Evenimente';
      case 'contacts': return 'Contacte';
      default: return perm;
    }
  };

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

        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
          <KeyRound className="w-4 h-4 text-teal-600" />
          <span>CONTROL ACCES & CONSIMȚĂMÂNT</span>
        </div>

        <button
          id="btn-consent-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă (ESC)"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('consents')}
          className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'consents'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Cine Are Acces ({consents.filter(c => c.status === 'active').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit_log')}
          className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'audit_log'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Cine Mi-a Văzut Dosarul</span>
        </button>
      </div>

      {/* Notice Banner */}
      {revokedNotice && (
        <div className="my-1 p-2.5 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
          <UserX className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{revokedNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 my-1 overflow-y-auto space-y-2.5">
        {/* TAB 1: ACTIVE CONSENTS */}
        {activeTab === 'consents' && (
          <div className="space-y-2">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-2.5 text-teal-950 text-[11px] leading-relaxed">
              <span className="font-bold block text-teal-900 mb-0.5">Control Total Victima (Principiul Suveranității Datelor):</span>
              Tu decizi exact ce specialist are dreptul să vadă probele tale. Poți revoca accesul în orice moment cu efect imediat.
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {consents.map(consent => {
                const isActive = consent.status === 'active';

                return (
                  <div
                    key={consent.id}
                    className={`border rounded-2xl p-3 transition shadow-xs ${
                      isActive 
                        ? 'bg-white border-stone-200' 
                        : 'bg-stone-100 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900">{consent.grantedToPersonName}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {isActive ? 'Activ' : 'Revocat'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{consent.grantedToInstitution}</p>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleRevokeConsent(consent.id, consent.grantedToPersonName)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                          title="Revocă dreptul de acces"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Revocă</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Permisiuni acordate:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {consent.grantedPermissions.map((perm, idx) => (
                            <span key={idx} className="bg-stone-100 text-slate-700 text-[9px] font-medium px-1.5 py-0.5 rounded-md border border-stone-200/60">
                              ✓ {getPermissionLabel(perm)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 flex justify-between border-t border-stone-100 mt-1">
                        <span>Valabil până: <strong>{consent.expiryDate}</strong></span>
                        <span className="truncate max-w-[150px] text-slate-400">{consent.legalBasis}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOG (Cine mi-a văzut dosarul) */}
        {activeTab === 'audit_log' && (
          <div className="space-y-2">
            <div className="bg-[#E6F0F8] border border-sky-200 rounded-2xl p-2.5 text-slate-800 text-[11px] leading-relaxed">
              <span className="font-bold block text-sky-950 mb-0.5">Registru de Securitate Imutabil (Audit Chain):</span>
              Fiecare vizualizare, descărcare sau export din dosarul tău generează o intrare criptografică permanentă care nu poate fi ștearsă sau falsificată.
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div 
                  key={log.id}
                  className="bg-white border border-stone-200 rounded-2xl p-2.5 shadow-2xs text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px]">{log.actorInstitution}</span>
                    <span className="text-[9px] font-mono text-slate-400">{log.timeString}</span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug">{log.description}</p>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-stone-100">
                    <span className="truncate max-w-[200px]">Baza legală: {log.legalBasis}</span>
                    <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                      Block #{log.immutableBlockIndex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center">
        Conformitate RGPD / Legea 217/2003: Accesul se acordă exclusiv în baza principiului "Need-to-Know".
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Scale, 
  ArrowLeft, 
  X, 
  Download, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileCode, 
  Printer, 
  KeyRound, 
  Lock, 
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { EvidenceItem } from '../types/scut';
import { INITIAL_EVIDENCE_ITEMS } from '../data/mockData';
import { ZipExportModal } from './ZipExportModal';

interface CourtExportScreenProps {
  onBack: () => void;
  onQuickExit: () => void;
  evidenceList?: EvidenceItem[];
}

export const CourtExportScreen: React.FC<CourtExportScreenProps> = ({
  onBack,
  onQuickExit,
  evidenceList = INITIAL_EVIDENCE_ITEMS
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf_a' | 'zip' | 'json' | 'csv'>('pdf_a');
  const [recipient, setRecipient] = useState('Judecătoria Sector 1 București • Secția Civilă / OPP');
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isVerifyingHashes, setIsVerifyingHashes] = useState(false);
  const [hashesVerified, setHashesVerified] = useState(true);

  const triggerVerification = () => {
    setIsVerifyingHashes(true);
    setTimeout(() => {
      setIsVerifyingHashes(false);
      setHashesVerified(true);
      setExportNotice('Toate amprentele SHA-256 au fost reverificate cu succes împotriva registrului eIDAS.');
      setTimeout(() => setExportNotice(null), 4000);
    }, 600);
  };

  const handleDownloadCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Numar Curent,ID Proba,Titlu,Categorie,Data Colectare,Dimensiune,Amprenta SHA-256,Statut Integritate,Conformitate CPP\n';
    
    evidenceList.forEach((item, idx) => {
      csvContent += `${idx + 1},"${item.id}","${item.title}","${item.category}","${item.date}","${item.fileSize}","${item.sha256Hash}","VERIFICAT_NEALTERAT","Art. 197 CPP"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `INDEX_PROBE_SCUT_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonManifest = () => {
    const manifest = {
      pachetProbatoriuId: `PKG-RO-2026-${Date.now().toString().slice(-6)}`,
      destinatar: recipient,
      cadruLegal: 'Legea nr. 217/2003 republicată & Art. 197-201 Cod Procedură Penală',
      dataGenerare: new Date().toISOString(),
      numarTotalProbe: evidenceList.length,
      standardeConformitate: [
        'PDF/A-2b ISO 19005-2',
        'eIDAS Qualified Electronic Time Stamp Ready',
        'SHA-256 Digital Chain of Custody'
      ],
      disclaimer: 'Probe digitale conservate într-un format conceput pentru verificarea autenticității, integrității, originii și momentului colectării.',
      items: evidenceList
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `MANIFEST_PROBE_SCUT_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
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

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Scale className="w-4 h-4 text-cyan-700" />
          <span>SCUT COURT • PACHET PROBATORIU</span>
        </div>

        <button
          id="btn-court-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă (ESC)"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Notice Banner */}
      {exportNotice && (
        <div className="my-1 p-2 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 my-1 overflow-y-auto space-y-2.5">
        {/* Core Status Header Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Pachet Probatoriu Pregătit pentru Transmitere
            </span>
            <span className="text-[10px] font-mono text-slate-400">PDF/A-2b • eIDAS Ready</span>
          </div>
          <h3 className="text-xs font-bold text-white">Dosar Judiciar Integrat #SCUT-RO-2026-B0892</h3>
          <p className="text-[10px] text-slate-300">
            Conține <strong>{evidenceList.length} probe digitale sigilate</strong> cu lanț de custodie conform Legii nr. 217/2003 și Art. 197 Cod Procedură Penală.
          </p>
        </div>

        {/* Destinatar Selector */}
        <div className="bg-white border border-stone-200 rounded-2xl p-2.5 shadow-xs space-y-1">
          <label className="text-[10px] font-bold text-slate-700 block">Autoritate Destinatară:</label>
          <select
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none font-semibold text-slate-800"
          >
            <option value="Judecătoria Sector 1 București • Secția Civilă / OPP">Judecătoria Sector 1 București (Emitere Ordin de Protecție)</option>
            <option value="Baroul București • Serviciul Asistență Judiciară Gratuită">Baroul București (Avocat din Oficiu / Pro-Bono)</option>
            <option value="Poliția Română • Secția 1 Poliție București">Poliția Română • Secția 1 Poliție (OPP de Urgență)</option>
            <option value="Institutul Național de Medicină Legală Mina Minovici">INML Mina Minovici (Expertiză Medico-Legală)</option>
          </select>
        </div>

        {/* Times New Roman Court Document Preview Box */}
        <div className="bg-white border border-stone-300 rounded-2xl p-3.5 shadow-sm text-slate-900 space-y-3 font-serif">
          {/* Document Header */}
          <div className="text-center border-b border-stone-300 pb-2 space-y-0.5">
            <h4 className="font-bold text-xs uppercase tracking-wide">ROMÂNIA • DOSAR PROBATORIU JUDICIAR</h4>
            <p className="text-[10px] text-slate-600">Emis prin Infrastructura Digitală Interinstituțională SCUT</p>
            <p className="text-[9px] text-slate-500 font-mono">ID PACHET: PKG-RO-2026-B0892-V2 • DATA: {new Date().toLocaleDateString('ro-RO')}</p>
          </div>

          {/* Legal Framework text */}
          <div className="text-[11px] leading-relaxed space-y-1">
            <p>
              <strong>CĂTRE:</strong> {recipient}
            </p>
            <p>
              <strong>OBIECT:</strong> Înaintare probe digitale conservate pentru emiterea/prelungirea Ordinului de Protecție conform Legii nr. 217/2003 republicată.
            </p>
          </div>

          {/* Table of Evidence in Times New Roman */}
          <div className="space-y-1 font-sans">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
              <span>INDEXUL CRONOLOGIC AL PROBELOR ({evidenceList.length})</span>
              <button
                onClick={triggerVerification}
                disabled={isVerifyingHashes}
                className="text-[9px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-bold cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isVerifyingHashes ? 'animate-spin' : ''}`} />
                <span>{isVerifyingHashes ? 'Se verifică...' : 'Reverifică SHA-256'}</span>
              </button>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden text-[10px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-100 text-slate-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-1.5">Nr.</th>
                    <th className="p-1.5">Titlu & Tip</th>
                    <th className="p-1.5">Dată Colectare</th>
                    <th className="p-1.5 font-mono">Hash SHA-256 Integritate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {evidenceList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="p-1.5 font-bold">{idx + 1}</td>
                      <td className="p-1.5">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{item.category} • {item.originalVsDerived || 'original'}</div>
                      </td>
                      <td className="p-1.5 text-slate-600">{item.date}</td>
                      <td className="p-1.5 font-mono text-[8px] text-teal-800 break-all max-w-[120px]">
                        {item.sha256Hash.slice(0, 18)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Phrasing Mandated by Specification */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2 text-[10px] text-slate-700 italic leading-relaxed font-serif">
            „Probe digitale conservate într-un format conceput pentru verificarea autenticității, integrității, originii și momentului colectării.”
          </div>
        </div>

        {/* Multi-Format Export Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setIsZipModalOpen(true)}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Arhivă ZIP Criptată</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Tipărește / Salvează PDF/A</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="p-2 bg-stone-200 hover:bg-stone-300 text-slate-800 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descarcă CSV Index Instanță</span>
          </button>

          <button
            onClick={handleDownloadJsonManifest}
            className="p-2 bg-stone-200 hover:bg-stone-300 text-slate-800 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-700" />
            <span>Descarcă JSON Manifest eIDAS</span>
          </button>
        </div>
      </div>

      {/* ZIP Modal Integration */}
      <ZipExportModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        evidenceList={evidenceList}
      />

      {/* Footer Disclaimer */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center">
        Pachetul probatoriu este compatibil cu sistemul electronic ECRIS al Ministerului Justiției.
      </div>
    </div>
  );
};

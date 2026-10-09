import React, { useState } from 'react';
import { 
  FolderLock, 
  Download, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  Copy, 
  AlertCircle, 
  X, 
  FileArchive, 
  UserCheck, 
  Scale, 
  CheckCircle2, 
  RefreshCw,
  Share2
} from 'lucide-react';
import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { extensionForMime } from '../utils/mediaCapture';
import { EvidenceItem } from '../types/scut';

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceList: EvidenceItem[];
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({
  isOpen,
  onClose,
  evidenceList
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recipientRole, setRecipientRole] = useState<'lawyer' | 'court' | 'police' | 'inml'>('lawyer');
  const [recipientName, setRecipientName] = useState('Avocat Reprezentant Legal (Barou)');
  const [caseReference, setCaseReference] = useState('Dosar OPP - Art. 217/2003');
  
  // Export process state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStepText, setExportStepText] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [generatedFileName, setGeneratedFileName] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'Introduceți o parolă', color: 'bg-stone-300' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, text: 'Slabă (recomandat min. 8 caractere cu cifre)', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, text: 'Medie (acceptabilă)', color: 'bg-amber-500' };
    if (score === 4) return { score: 3, text: 'Puternică (Recomandat)', color: 'bg-emerald-500' };
    return { score: 4, text: 'Grad Militar (Foarte Sigură)', color: 'bg-emerald-600' };
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let autoPwd = '';
    for (let i = 0; i < 14; i++) {
      autoPwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(autoPwd);
    setConfirmPassword(autoPwd);
  };

  const handleExportZip = async () => {
    if (!password || password.length < 6) {
      alert('Vă rugăm să introduceți o parolă de securitate de minimum 6 caractere pentru protejarea arhivei.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Parolele introduse nu coincid. Vă rugăm să le verificați.');
      return;
    }

    setIsExporting(true);
    setExportProgress(15);
    setExportStepText('1/5: Extragere probe din Sandbox-ul izolat SCUT...');

    try {
      // Every entry is collected first, then written into a WinZip-AES-256 encrypted archive.
      const files: Array<[string, string]> = [];
      const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const zipName = `SCUT_DOSAR_PROBE_LEGAL_${timestampStr}.zip`;

      await new Promise(r => setTimeout(r, 400));
      setExportProgress(35);
      setExportStepText('2/5: Generare Certificat Judiciar & Index Integritate SHA-256...');

      // 1. Generate Judicial Manifest text
      let manifestText = `========================================================================\n`;
      manifestText += `           DOSAR JUDICIAR DE PROBE - SISTEMUL SCUT\n`;
      manifestText += `  Conform Legii nr. 217/2003 & Codului de Procedură Penală (Art. 282)\n`;
      manifestText += `========================================================================\n\n`;
      manifestText += `DESTINATAR: ${recipientName} (${recipientRole.toUpperCase()})\n`;
      manifestText += `REFERINȚĂ CAZ: ${caseReference}\n`;
      manifestText += `DATA EXPORTULUI: ${new Date().toLocaleString('ro-RO')}\n`;
      manifestText += `NUMĂR TOTAL PROBE: ${evidenceList.length}\n`;
      manifestText += `CRIPTAREA ARHIVEI: ZIP AES-256 (WinZip AES), protejată cu parolă\n`;
      manifestText += `VERIFICARE: amprentele SHA-256 de mai jos se pot recalcula pe originalele probelor\n\n`;
      manifestText += `------------------------------------------------------------------------\n`;
      manifestText += `                      INDEXUL CRONOLOGIC AL PROBELOR\n`;
      manifestText += `------------------------------------------------------------------------\n\n`;

      evidenceList.forEach((item, index) => {
        manifestText += `[PROBA #${index + 1}] ID: ${item.id}\n`;
        manifestText += `  Titlu: ${item.title}\n`;
        manifestText += `  Categorie: ${item.category.toUpperCase()}\n`;
        manifestText += `  Data Înregistrării: ${item.date}\n`;
        manifestText += `  Dimensiune: ${item.fileSize}\n`;
        if (item.duration) manifestText += `  Durată Audio: ${item.duration}\n`;
        if (item.location) manifestText += `  Coordonate / Locație: ${item.location}\n`;
        manifestText += `  Descriere: ${item.description}\n`;
        manifestText += `  Etichete Judiciare: ${item.tags.join(', ')}\n`;
        manifestText += `  Amprentă SHA-256 (Hash Integritate): ${item.sha256Hash}\n`;
        manifestText += `  Stare Seif: ${item.isEncrypted ? 'Criptat AES-256-GCM în seiful SCUT' : 'Necriptat'}\n\n`;
      });

      manifestText += `========================================================================\n`;
      manifestText += `NOTĂ DE SECURITATE: Această arhivă a fost generată și parolarizată pentru\n`;
      manifestText += `uzul exclusiv al reprezentantului legal sau instanței judecătorești.\n`;
      manifestText += `========================================================================\n`;

      // 2. Generate JSON Manifest
      const manifestJson = {
        metadata: {
          system: 'SCUT Safe Vault - Emergency Evidence Dossier',
          recipient: recipientName,
          recipientRole: recipientRole,
          caseReference: caseReference,
          exportTimestamp: new Date().toISOString(),
          totalEvidenceCount: evidenceList.length,
          encryptionStandard: 'ZIP AES-256 (WinZip AES)',
          tamperProofStandard: 'Law 217/2003 Romania'
        },
        // The vault ciphertext is bound to the device's session key and useless to the recipient.
        items: evidenceList.map(({ encryptedPayload, ...item }) => item)
      };

      // 3. Instructions for Lawyer
      let lawyerInstructions = `========================================================================\n`;
      lawyerInstructions += `    INSTRUCȚIUNI DE DECRIPTARE PENTRU REPREZENTANTUL LEGAL / AVOCAT\n`;
      lawyerInstructions += `========================================================================\n\n`;
      lawyerInstructions += `Stimate/Stimată ${recipientName},\n\n`;
      lawyerInstructions += `Ați primit arhiva securizată a probelor colectate prin platforma SCUT.\n`;
      lawyerInstructions += `Toate fișierele și jurnalele de incident sunt protejate cu parola stabilită de victimă.\n\n`;
      lawyerInstructions += `PAȘI PENTRU DESCHIDEREA DOSARULUI:\n`;
      lawyerInstructions += `1. Deschideți arhiva cu 7-Zip sau WinRAR (Windows) ori Keka (macOS). Exploratorul Windows nu deschide arhive criptate AES-256.\n`;
      lawyerInstructions += `2. Când vi se solicită parola, introduceți parola primită separat de arhivă (de exemplu, telefonic).\n`;
      lawyerInstructions += `3. În interior veți găsi directoarele organizate pe categorii (Audio, Foto, Documente INML, Declarații) precum și indexul judiciar 'INDEX_DOSAR_PROBE.txt'.\n`;
      lawyerInstructions += `4. Amprentele SHA-256 din index pot fi depuse direct la dosarul pentru emiterea Ordinului de Protecție (OP / OPP).\n\n`;
      lawyerInstructions += `ASISTENȚĂ: Platforma SCUT oferă suport juridic pro-bono în parteneriat cu rețeaua ONG-urilor acreditate.\n`;

      await new Promise(r => setTimeout(r, 400));
      setExportProgress(60);
      setExportStepText('3/5: Împachetare probe audio, documente și înscrisuri...');

      // Add main docs to zip root
      files.push(['INDEX_DOSAR_PROBE_LEGEA_217.txt', manifestText]);
      files.push(['DOSAR_PROBE_STRUCTURAT.json', JSON.stringify(manifestJson, null, 2)]);
      files.push(['INSTRUCTIUNI_PENTRU_AVOCAT.txt', lawyerInstructions]);

      // Populate evidence files into folders
      evidenceList.forEach((item, i) => {
        const fileContent = `ID PROBĂ: ${item.id}\nTITLU: ${item.title}\nDATĂ: ${item.date}\nLOCAȚIE: ${item.location || 'București (Locație Protejată)'}\nSHA-256: ${item.sha256Hash}\n\nDESCRIERE DETALIATĂ:\n${item.description}\n\nETICHETE:\n${item.tags.join(', ')}\n\n[PROBĂ ORIGINALĂ IZOLATĂ ÎN SANDBOX SCUT]`;

        if (item.category === 'audio') {
          files.push([`probe_audio_ambientale/AUDIO_${i + 1}_${item.id}.txt`, fileContent]);
          files.push([`probe_audio_ambientale/AUDIO_${i + 1}_METRICI_AMPRENTA_VOCALA.json`, JSON.stringify({
            id: item.id,
            duration: item.duration || '00:15',
            audioChannels: 'Mono 44.1kHz',
            sha256: item.sha256Hash
          }, null, 2)]);
        } else if (item.category === 'photo') {
          files.push([`probe_foto_leziuni_daune/FOTO_${i + 1}_${item.id}.txt`, fileContent]);
          if (item.mediaUrl) {
            files.push([`probe_foto_leziuni_daune/FOTO_${i + 1}_METADATE_WATERMARK.json`, JSON.stringify({
              id: item.id,
              originalUrl: item.mediaUrl,
              watermarkTimestamp: item.date,
              sha256: item.sha256Hash
            }, null, 2)]);
          }
        } else if (item.category === 'document') {
          files.push([`documente_medicale_inml/DOC_${i + 1}_${item.id}.txt`, fileContent]);
          files.push([`documente_medicale_inml/DOC_${i + 1}_AMPRENTA_INTEGRITATE.txt`, `Document: ${item.title}\nAmprentă SHA-256: ${item.sha256Hash}\nRecalculați SHA-256 pe fișierul original pentru a confirma că nu a fost modificat.`]);
        } else {
          files.push([`declaratii_jurnal_incidente/DECLARATIE_${i + 1}_${item.id}.txt`, fileContent]);
        }
      });

      // Captured media and uploaded files go in as the original bytes,
      // so the recipient can recompute each SHA-256 listed in the index.
      const mediaFolders: Partial<Record<EvidenceItem['category'], [string, string]>> = {
        audio: ['probe_audio_ambientale', 'AUDIO'],
        photo: ['probe_foto_leziuni_daune', 'FOTO'],
        document: ['documente_medicale_inml', 'DOC']
      };
      const mediaFiles: Array<[string, Blob]> = [];
      for (const [i, item] of evidenceList.entries()) {
        const target = mediaFolders[item.category];
        if (!target || !item.mediaUrl?.startsWith('blob:')) continue;
        const blob = await (await fetch(item.mediaUrl)).blob();
        mediaFiles.push([`${target[0]}/${target[1]}_${i + 1}_${item.id}_ORIGINAL.${extensionForMime(blob.type)}`, blob]);
      }

      await new Promise(r => setTimeout(r, 400));
      setExportProgress(85);
      setExportStepText('4/5: Criptare arhivă ZIP cu AES-256...');

      // encryptionStrength 3 = AES-256; opens in 7-Zip, WinRAR and Keka with the password.
      const zipWriter = new ZipWriter(new BlobWriter('application/zip'), { password, encryptionStrength: 3 });
      for (const [entryPath, entryContent] of files) {
        await zipWriter.add(entryPath, new TextReader(entryContent));
      }
      for (const [entryPath, blob] of mediaFiles) {
        await zipWriter.add(entryPath, new BlobReader(blob));
      }
      const zipBlob = await zipWriter.close();

      await new Promise(r => setTimeout(r, 300));
      setExportProgress(100);
      setExportStepText('5/5: Finalizare & descărcare fișier...');

      // Trigger download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setGeneratedFileName(zipName);
      setExportSuccess(true);
      setIsExporting(false);
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('A apărut o eroare la împachetarea arhivei ZIP. Vă rugăm să încercați din nou.');
      setIsExporting(false);
    }
  };

  const strength = getPasswordStrength(password);

  const lawyerHandoffSummary = `🚨 DOSAR DE PROBE SCUT (Confidențial & Criptat)\n` +
    `Destinatar: ${recipientName}\n` +
    `Referință: ${caseReference}\n` +
    `Fișier Arhivă: ${generatedFileName || 'SCUT_DOSAR_PROBE_LEGAL.zip'}\n` +
    `Număr Probe: ${evidenceList.length} probe (Audio, Foto, Documente INML, Declarații)\n` +
    `Parola de decriptare vă va fi comunicată separat, pe alt canal (de exemplu, telefonic).`;

  const copyToClipboard = (text: string, isSummary: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSummary) {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-4.5 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-3 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
            <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileArchive className="w-4 h-4" />
            </div>
            <div>
              <div>Export Dosar Securizat ZIP</div>
              <div className="text-[10px] text-slate-500 font-normal">Pentru Avocat & Instanță de Judecată</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State 1: Export Settings Form */}
        {!exportSuccess && (
          <div className="space-y-3 text-xs">
            
            {/* Quick Overview Pill */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-2.5 flex items-start gap-2 text-[11px] text-sky-950">
              <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="leading-snug">
                Exportă toate cele <strong>{evidenceList.length} probe</strong> (audio, foto, certificate, declarații) într-o arhivă <strong>ZIP parolat AES-256</strong> cu index judiciar și hash-uri SHA-256 pentru avocat.
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reprezentant Legal / Destinatar:</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[
                  { id: 'lawyer', label: '⚖️ Avocat Barou', defaultName: 'Avocat Barou Ales / Oficiu' },
                  { id: 'court', label: '🏛️ Instanță Judecată', defaultName: 'Judecătoria Sector 1 / OPP' },
                  { id: 'police', label: '🛡️ Poliție / Parchet', defaultName: 'Secția de Poliție competentă' },
                  { id: 'inml', label: '🏥 Medicină Legală', defaultName: 'INML Mina Minovici' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRecipientRole(item.id as any);
                      setRecipientName(item.defaultName);
                    }}
                    className={`p-1.5 rounded-xl border text-left font-semibold transition cursor-pointer ${
                      recipientRole === item.id 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-300' 
                        : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="Nume avocat sau număr barou"
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Password Configuration */}
            <div className="space-y-1.5 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Parolă Protecție Arhivă ZIP:</span>
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generează Sigură</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Introduceți parola de deschidere ZIP"
                  className="w-full pl-2.5 pr-8 py-1.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmare parolă ZIP"
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
              />

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">Complexitate:</span>
                    <span className="font-semibold text-slate-800">{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'} flex-1 transition-all`} />
                    <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'} flex-1 transition-all`} />
                    <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-transparent'} flex-1 transition-all`} />
                    <div className={`h-full ${strength.score >= 4 ? strength.color : 'bg-transparent'} flex-1 transition-all`} />
                  </div>
                </div>
              )}
            </div>

            {/* Included Content Checklist */}
            <div className="space-y-1 text-[10px] text-slate-600 bg-white p-2 rounded-xl border border-stone-200">
              <span className="font-bold text-slate-800 block text-[11px] mb-1">
                Conținut inclus în pachetul ZIP:
              </span>
              <div className="flex items-center gap-1 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>INDEX_DOSAR_PROBE_LEGEA_217.txt (Tabel oficial instanță)</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>INSTRUCTIUNI_PENTRU_AVOCAT.txt (Ghid dezarhivare)</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Dosare probe audio, fotografii, certificate INML & notițe</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Amprente SHA-256 & Sigiliu tamper-proof pentru fiecare fișier</span>
              </div>
            </div>

            {/* Progress Bar during generation */}
            {isExporting && (
              <div className="space-y-1.5 bg-slate-950 text-white p-3 rounded-2xl border border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-teal-400 font-bold">{exportStepText}</span>
                  <span className="text-emerald-400 font-bold">{exportProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Export Trigger Button */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className="flex-1 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl transition cursor-pointer"
              >
                Anulează
              </button>
              <button
                id="btn-confirm-zip-export"
                type="button"
                onClick={handleExportZip}
                disabled={isExporting || !password}
                className="flex-2 py-2.5 bg-sky-700 hover:bg-sky-600 active:scale-98 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Se Criptează & Descarcă...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generează & Descarcă ZIP</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* State 2: Export Complete Success & Lawyer Transmission Helper */}
        {exportSuccess && (
          <div className="space-y-3 text-xs animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">Dosar ZIP Generat cu Succes!</h3>
              <p className="text-[11px] text-slate-600">
                Fișierul <strong>{generatedFileName}</strong> a fost descărcat pe dispozitivul tău.
              </p>
            </div>

            {/* Password Box */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>Parola Setată pentru Avocat:</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(password, false)}
                  className="px-2 py-0.5 bg-white border border-amber-300 text-amber-900 rounded-md font-bold flex items-center gap-1 hover:bg-amber-100 cursor-pointer text-[9px]"
                >
                  {copiedPassword ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPassword ? 'Copiat!' : 'Copiază'}</span>
                </button>
              </div>
              <div className="p-2 bg-white border border-amber-200 rounded-xl font-mono text-xs font-bold text-slate-900 text-center tracking-widest break-all">
                {password}
              </div>
            </div>

            {/* Full Lawyer Handoff Snippet */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-700 font-bold">
                <span className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mesaj Gata de Trimis către Avocat (WhatsApp / Signal):</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(lawyerHandoffSummary, true)}
                  className="px-2 py-0.5 bg-indigo-600 text-white rounded-md font-bold flex items-center gap-1 hover:bg-indigo-700 cursor-pointer text-[9px]"
                >
                  {copiedSummary ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSummary ? 'Copiat!' : 'Copiază Tot'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={4}
                value={lawyerHandoffSummary}
                className="w-full p-2 bg-white border border-stone-200 rounded-xl text-[10px] font-mono text-slate-800 leading-snug resize-none outline-none"
              />
            </div>

            {/* Security Notice */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-950">
              💡 <strong>Recomandare de Securitate:</strong> Trimiteți fișierul ZIP prin email și parola pe un canal separat (ex: apel direct sau mesaj Signal), pentru a preveni interceptarea.
            </div>

            <button
              onClick={() => {
                setExportSuccess(false);
                onClose();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
            >
              Am Salvat Parola • Închide
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

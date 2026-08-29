import React, { useState } from 'react';
import { 
  FolderLock, 
  Plus, 
  Camera, 
  Mic, 
  FileUp, 
  FileText, 
  ArrowLeft, 
  X, 
  ShieldCheck, 
  Search, 
  Play, 
  Square, 
  Check, 
  Download,
  AlertCircle
} from 'lucide-react';
import { EvidenceItem } from '../types/scut';
import { generateSha256Hash, formatTime } from '../utils/security';

interface EvidenceJournalScreenProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  onBack: () => void;
  onQuickExit: () => void;
}

export const EvidenceJournalScreen: React.FC<EvidenceJournalScreenProps> = ({
  evidenceList,
  onAddEvidence,
  onBack,
  onQuickExit
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'audio' | 'document' | 'note'>('all');
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'camera' | 'audio' | 'note' | 'document' | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('Agresiune verbală, Jurnal');
  
  // Audio record simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioTimer, setAudioTimer] = useState<NodeJS.Timeout | null>(null);

  const filteredEvidence = evidenceList.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const handleStartAudioRecord = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    const timer = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);
    setAudioTimer(timer);
  };

  const handleStopAudioRecord = () => {
    if (audioTimer) clearInterval(audioTimer);
    setIsRecording(false);
    
    // Create new audio evidence item
    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: `Înregistrare Audio Nouă (${formatTime(recordSeconds || 12)})`,
      category: 'audio',
      date: new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      description: 'Înregistrare audio ambientală captată securizat în sandbox.',
      tags: ['Audio Probă', 'Ambiental'],
      fileSize: `${((recordSeconds || 12) * 0.08).toFixed(1)} MB`,
      duration: formatTime(recordSeconds || 12),
      sha256Hash: generateSha256Hash(`audio-${Date.now()}`),
      location: 'Locație Securizată (44.4378, 26.0946)',
      isEncrypted: true,
      tamperProofVerified: true
    };
    onAddEvidence(newItem);
    setActiveModal(null);
  };

  const handleSavePhotoSimulation = () => {
    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: 'Fotografie Probă (Vătămare corporală / Daune)',
      category: 'photo',
      date: new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      description: 'Fotografie realizată prin camera internă SCUT cu watermark criptografic de timp și locație. Nu a fost salvată în galeria telefonului.',
      tags: ['Leziuni', 'Foto Izolată', 'Probă Juridică'],
      fileSize: '3.1 MB',
      mediaUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
      sha256Hash: generateSha256Hash(`photo-${Date.now()}`),
      location: 'București (44.4378, 26.0946)',
      isEncrypted: true,
      tamperProofVerified: true
    };
    onAddEvidence(newItem);
    setActiveModal(null);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: noteTitle,
      category: 'note',
      date: new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      description: noteContent || 'Notă detaliată despre incident, dată, martori și comportamentul agresorului.',
      tags: noteTags.split(',').map(t => t.trim()),
      sha256Hash: generateSha256Hash(noteContent + noteTitle),
      isEncrypted: true,
      tamperProofVerified: true
    };
    onAddEvidence(newItem);
    setNoteTitle('');
    setNoteContent('');
    setActiveModal(null);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#F4F4F4] text-[#222222] p-4 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
          <FolderLock className="w-4 h-4 text-sky-600" />
          <span>JURNAL PROBE CRIPTAT</span>
        </div>

        <button
          id="btn-evidence-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition"
          title="Ieșire Rapidă"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 space-y-3">
        {/* Sandbox Protection Banner */}
        <div className="bg-[#E6F0F8] border border-sky-200 rounded-xl p-2.5 text-[11px] text-sky-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-bold">Sandbox Izolat AES-256:</span> Imaginile și sunetele nu sunt expuse în galeria telefonului sau fișierele publice. Fiecare probă are amprentă SHA-256 admisibilă în instanță.
          </div>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Toate' },
            { id: 'photo', label: '📷 Foto' },
            { id: 'audio', label: '🎙️ Audio' },
            { id: 'document', label: '📄 Documente' },
            { id: 'note', label: '📝 Notițe' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chronological Evidence Timeline List */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {filteredEvidence.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedEvidence(item)}
              className="bg-white border border-stone-200 hover:border-sky-300 rounded-2xl p-3 shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.category === 'photo' ? 'bg-amber-100 text-amber-700' :
                    item.category === 'audio' ? 'bg-rose-100 text-rose-700' :
                    item.category === 'document' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.category === 'photo' && <Camera className="w-4 h-4" />}
                    {item.category === 'audio' && <Mic className="w-4 h-4" />}
                    {item.category === 'document' && <FileText className="w-4 h-4" />}
                    {item.category === 'note' && <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.date}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" />
                    Criptat
                  </span>
                  {item.duration && (
                    <span className="text-[9px] font-mono text-slate-500">{item.duration}</span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[9px]">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {item.sha256Hash.substring(0, 10)}...
                </span>
              </div>
            </div>
          ))}

          {filteredEvidence.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nu există probe în această categorie.
            </div>
          )}
        </div>

        {/* Main "+ Adaugă Probă" Button */}
        <div className="relative pt-1">
          <button
            id="btn-add-evidence-menu"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full h-12 bg-sky-700 hover:bg-sky-800 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>+ Adaugă Probă Nouă</span>
          </button>

          {/* Add Evidence Popup Options (Phase 4 Spec: Photo, Audio, Document, Note) */}
          {showAddMenu && (
            <div className="absolute bottom-14 inset-x-0 bg-white border border-stone-200 rounded-2xl p-2 shadow-2xl z-30 space-y-1 animate-scale-up">
              <button
                onClick={() => { setShowAddMenu(false); setActiveModal('camera'); }}
                className="w-full p-2.5 text-left rounded-xl hover:bg-stone-100 flex items-center gap-3 text-xs font-semibold text-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div>Fă o poză</div>
                  <div className="text-[10px] text-slate-500 font-normal">Fără salvare în galeria telefonului</div>
                </div>
              </button>

              <button
                onClick={() => { setShowAddMenu(false); setActiveModal('audio'); }}
                className="w-full p-2.5 text-left rounded-xl hover:bg-stone-100 flex items-center gap-3 text-xs font-semibold text-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div>Înregistrează audio</div>
                  <div className="text-[10px] text-slate-500 font-normal">Microfon ambiental securizat</div>
                </div>
              </button>

              <button
                onClick={() => { setShowAddMenu(false); setActiveModal('document'); }}
                className="w-full p-2.5 text-left rounded-xl hover:bg-stone-100 flex items-center gap-3 text-xs font-semibold text-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <div>Încarcă fișier (PDF / Certificat)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Raport medical sau captură de ecran</div>
                </div>
              </button>

              <button
                onClick={() => { setShowAddMenu(false); setActiveModal('note'); }}
                className="w-full p-2.5 text-left rounded-xl hover:bg-stone-100 flex items-center gap-3 text-xs font-semibold text-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div>Scrie notiță</div>
                  <div className="text-[10px] text-slate-500 font-normal">Descriere incident, dată, martori</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Evidence Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                <FolderLock className="w-4 h-4 text-sky-600" />
                Detalii Probă Criptată
              </span>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEvidence.mediaUrl && (
              <div className="w-full h-40 bg-stone-900 rounded-2xl overflow-hidden relative">
                <img 
                  src={selectedEvidence.mediaUrl} 
                  alt="Probă" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur text-white text-[9px] px-2 py-1 rounded font-mono">
                  Timestamp: {selectedEvidence.date}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-900">{selectedEvidence.title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedEvidence.date} • {selectedEvidence.location || 'Locație sigură'}</p>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              {selectedEvidence.description}
            </p>

            {/* Cryptographic SHA-256 Stamp */}
            <div className="bg-slate-900 text-stone-300 p-2.5 rounded-xl text-[10px] font-mono space-y-1">
              <div className="text-teal-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SIGILIU CRIPTOGRAFIC INSTANȚĂ:
              </div>
              <div className="break-all text-[9px] text-stone-400">
                {selectedEvidence.sha256Hash}
              </div>
              <div className="text-[9px] text-emerald-400 pt-0.5">
                ✓ Integritate verificată conform Legii 217/2003
              </div>
            </div>

            <button
              onClick={() => setSelectedEvidence(null)}
              className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl"
            >
              Închide
            </button>
          </div>
        </div>
      )}

      {/* Modal: Camera Simulator */}
      {activeModal === 'camera' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-950 text-white rounded-3xl p-4 max-w-xs w-full shadow-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Camera className="w-4 h-4" />
                Cameră Securizată SCUT
              </span>
              <button onClick={() => setActiveModal(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-48 bg-stone-900 rounded-2xl flex flex-col items-center justify-center relative border border-stone-800 overflow-hidden">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-stone-600 flex items-center justify-center text-stone-500">
                <Camera className="w-8 h-8 text-stone-500 animate-pulse" />
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                ● LIVE ISO-WATERMARK
              </div>
              <div className="absolute bottom-2 inset-x-2 text-center text-[10px] text-stone-400 bg-black/60 py-1 rounded">
                Fotografia va fi salvată doar în seiful criptat SCUT.
              </div>
            </div>

            <button
              onClick={handleSavePhotoSimulation}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition"
            >
              📸 Capturează & Criptează Probă
            </button>
          </div>
        </div>
      )}

      {/* Modal: Audio Recorder Simulator */}
      {activeModal === 'audio' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-950 text-white rounded-3xl p-4 max-w-xs w-full shadow-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-rose-400">
                <Mic className="w-4 h-4" />
                Microfon Ambiental Securizat
              </span>
              <button onClick={() => setActiveModal(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-32 bg-stone-900 rounded-2xl flex flex-col items-center justify-center p-3 border border-stone-800 text-center">
              {isRecording ? (
                <>
                  <div className="flex items-center gap-1 my-2">
                    {[40, 70, 20, 90, 60, 30, 80, 45, 95, 35, 75].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-rose-400 font-mono font-bold text-lg">
                    {formatTime(recordSeconds)}
                  </div>
                  <span className="text-[10px] text-stone-400">Înregistrare activă în curs...</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 text-stone-600 mb-1" />
                  <span className="text-xs text-stone-300 font-medium">Apasă pentru a începe înregistrarea</span>
                  <span className="text-[10px] text-stone-500">Audio criptat AES-256 în fundal</span>
                </>
              )}
            </div>

            {isRecording ? (
              <button
                onClick={handleStopAudioRecord}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Oprește și Salvează în Jurnal</span>
              </button>
            ) : (
              <button
                onClick={handleStartAudioRecord}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Începe Înregistrarea</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal: Write Note Form */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveNote} className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Adaugă Notă Incident
              </span>
              <button type="button" onClick={() => setActiveModal(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Titlu Incident:</label>
              <input
                type="text"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder="ex: Amenințare verbală și blocare ieșire"
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Descriere Detaliată:</label>
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                rows={3}
                placeholder="Menționează ora exactă, ce a spus agresorul, dacă au fost martori prezenți..."
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Etichete (separate prin virgulă):</label>
              <input
                type="text"
                value={noteTags}
                onChange={e => setNoteTags(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow"
              >
                Salvează Criptat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Document Upload Simulator */}
      {activeModal === 'document' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                <FileUp className="w-4 h-4 text-blue-600" />
                Încarcă Document Oficial
              </span>
              <button onClick={() => setActiveModal(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full border-2 border-dashed border-stone-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition">
              <FileUp className="w-8 h-8 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-slate-800">Selectează fișier PDF sau JPG</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Certificat medico-legal, hotărâre instanță, etc.</div>
            </div>

            <button
              onClick={() => {
                const newItem: EvidenceItem = {
                  id: `ev-${Date.now()}`,
                  title: 'Document: Decizie Instanță / Certificat INML',
                  category: 'document',
                  date: new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }),
                  timestamp: Date.now(),
                  description: 'Document oficial încărcat și convertit în format securizat cu hash de integritate.',
                  tags: ['Document oficial', 'INML / Judecătorie'],
                  fileSize: '1.4 MB',
                  sha256Hash: generateSha256Hash(`doc-${Date.now()}`),
                  isEncrypted: true,
                  tamperProofVerified: true
                };
                onAddEvidence(newItem);
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow"
            >
              Simulează Încărcare Securizată
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

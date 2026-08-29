import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Radio, 
  HeartHandshake, 
  X, 
  CheckCircle2, 
  Key, 
  Share2, 
  AlertTriangle,
  FileCheck2,
  Palette
} from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2' | 'phase3' | 'phase4'>('phase1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 font-sans">
      <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full p-5 shadow-2xl border border-stone-200 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-700 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">🛡️ SCUT – Specificații de Arhitectură & UX/UI</h2>
              <p className="text-xs text-slate-500">Documentație Principală de Securitate Cibernetică și Design Sigur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-stone-100 p-1.5 rounded-2xl">
          {[
            { id: 'phase1', label: 'Faza 1: Camuflaj & Deblocare' },
            { id: 'phase2', label: 'Faza 2: Siguranță Critică' },
            { id: 'phase3', label: 'Faza 3: Arhitectură & Stakeholders' },
            { id: 'phase4', label: 'Faza 4: Prototipare Vizuală' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center truncate ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Faza 1 */}
        {activeTab === 'phase1' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed animate-fade-in">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5">
              <h3 className="text-sm font-bold text-blue-950 mb-1">1. Conceptul de Camuflaj (Masca)</h3>
              <p className="text-blue-900">
                <strong>Concept Ales:</strong> Calculatorul Inteligent. Este utilitatea de bază ideală deoarece există pe orice telefon mobil, este complet banală și nu trezește curiozitatea sau suspiciunea agresorului.
              </p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <span className="font-bold text-slate-900 block">Nume pe ecranul telefonului:</span>
                  <span className="text-slate-600">„Calculator” (și nu „SCUT”)</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <span className="font-bold text-slate-900 block">Iconiță aplicație:</span>
                  <span className="text-slate-600">Pictogramă simplă cu semnul [+] și [=] într-un cerc albastru închis.</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Mecanismul de Deblocare Secretă</h3>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                <li>Utilizatoarea deschide aplicația <strong>Calculator</strong>.</li>
                <li>Apare o interfață de calculator nativ complet funcțională, capabilă de calcule reale.</li>
                <li><strong>Mecanism de activare:</strong> Se tastează PIN-ul secret de 4 cifre (ex: <code>1234</code>) urmat de tasta <strong>[=]</strong>.</li>
                <li>Dacă codul este corect, calculatorul se estompează subtil și se deschide Tabloul de Comandă <strong>SCUT</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Faza 2 */}
        {activeTab === 'phase2' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed animate-fade-in">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
              <h3 className="text-sm font-bold text-amber-950 mb-1">1. Sistemul de Notificări Deghizat</h3>
              <p className="text-amber-900">
                Notificările de pe ecranul blocat și din bara de stare sunt deghizate pentru a părea alerte inofensive de sistem, știri meteo sau remindere.
              </p>
              <div className="mt-2 bg-white p-2.5 rounded-xl border border-amber-100 text-[11px] space-y-1">
                <div><strong className="text-stone-700">Ecran Blocat:</strong> <em>„Actualizare sistem: Listă de contacte sincronizată.”</em></div>
                <div><strong className="text-teal-700">Sens Real Intern:</strong> <em>„Ați primit un mesaj de la psihologul DGASPC.”</em></div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
              <h3 className="text-sm font-bold text-rose-950 mb-1">2. Declanșator Vocal SOS (Voice Guardian)</h3>
              <p className="text-[11px] text-rose-900 mb-2">
                Permite declanșarea protocolului de salvare fără atingerea telefonului, chiar dacă ecranul este blocat sau aplicația se află în mod camuflat (Calculator, Vreme, Acasă).
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-900">
                <li><strong>Cuvânt cheie configurabil:</strong> Implicit <code>„Ajutor”</code>, <code>„SCUT Salvează”</code> sau cod neutru <code>„Nu mai vreau”</code>.</li>
                <li><strong>Procesare Locală:</strong> Normalizare fonetică și recunoaștere continuă fără trimiterea vocii către servere externe până la declanșare.</li>
                <li><strong>Mod Silențios Automat:</strong> Înregistrează proba audio probatorie (criptată SHA-256) și transmite coordonatele 112 fără a schimba ecranul camuflat.</li>
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
              <h3 className="text-sm font-bold text-rose-950 mb-1">3. Butonul de Panică Rapidă (Quick Exit)</h3>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-900">
                <li><strong>Butonul roșu [X]:</strong> Prezent în colțul din dreapta sus al fiecărui ecran SCUT.</li>
                <li><strong>La apăsare sau agitarea telefonului:</strong> Aplicația se închide instant, curăță cheile din memorie și redirecționează către o pagină neutră (ex: Google / Vremea).</li>
                <li><strong>Scurtătură tastatură:</strong> Tasta <code>ESC</code> execută aceeași ieșire de panică.</li>
              </ul>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5">
              <h3 className="text-sm font-bold text-slate-900 mb-1">4. PIN-ul de Constrângere (Duress PIN - 0000)</h3>
              <p className="text-[11px] text-slate-600 mb-2">
                Dacă utilizatoarea este obligată sub amenințare fizică să deblocheze aplicația și introduce <code>0000=</code>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="font-bold text-slate-900 block">Ce vede agresorul:</span>
                  <span>O pagină neutră de vreme și știri locale complet banală.</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <span className="font-bold text-rose-600 block">Ce se execută în fundal:</span>
                  <span>Alertă silențioasă de urgență maximă la 112 cu GPS live și înregistrare audio ambientală 60 secunde.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Faza 3 */}
        {activeTab === 'phase3' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed animate-fade-in">
            {/* Triage flow diagram */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2">
              <h3 className="text-sm font-bold text-teal-400">1. Fluxul de Interconectare & Triage Curs</h3>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-[10px] text-teal-200 overflow-x-auto leading-relaxed border border-slate-800">
                [Victimă (SCUT App)] ──(SOS / Triage)──► [Dispecerat Central SCUT / 112]<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────┴──────────────┐<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Urgență Imediată: 112 / Poliție]&nbsp;&nbsp;&nbsp;[Nevoie Socială: DGASPC Adăpost]<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Nevoie Medicală: Spital / INML]&nbsp;&nbsp;&nbsp;&nbsp;[Nevoie Juridică: Barou Avocați]<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─► [Emitere Ordin de Protecție Provizoriu OPP]
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Dosarul Electronic Unic al Cazului (RBAC)</h3>
              <p className="text-[11px] text-slate-600">
                Partajare securizată pe baza rolurilor instituționale pentru eliminarea traumei repetitive:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <strong className="text-blue-700">Poliție:</strong> Identitate, istoric apeluri, risc, declarație preliminară, emitere OPP.
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <strong className="text-indigo-700">DGASPC:</strong> Situație copii, alocare adăpost, resurse sociale și reintegrare.
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <strong className="text-rose-700">Medic / INML:</strong> Fișe medicale, leziuni traumatice, certificate medico-legale.
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200">
                  <strong className="text-teal-700">Psiholog:</strong> Note terapeutice, evaluare PTSD (strict confidențial).
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-[11px] text-emerald-950">
              <h3 className="text-sm font-bold text-emerald-950 mb-1">3. Criptare & Sandbox Izolat</h3>
              <p>
                <strong>Zero Gallery Exposure:</strong> Imaginile capturate prin camera internă SCUT sunt stocate exclusiv în memoria sandbox a aplicației și nu apar niciodată în galeria telefonului sau în Google/Apple Photos.
              </p>
              <p className="mt-1">
                <strong>Integritate Admisibilă în Justiție:</strong> Fiecare probă primește un sigiliu SHA-256 și timestamp ISO-8601, asigurând conformitatea legală în instanță (Legea 217/2003).
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Faza 4 */}
        {activeTab === 'phase4' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed animate-fade-in">
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-teal-600" />
                Identitate Vizuală & Psihologia Culorilor (UX Calmant)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="bg-[#E6F0F8] p-2.5 rounded-xl border border-sky-200 text-sky-900 font-semibold">
                  Albastru Pal (#E6F0F8)<br/><span className="text-[9px] font-normal">Calm, claritate mentală</span>
                </div>
                <div className="bg-[#D8F3DC] p-2.5 rounded-xl border border-emerald-200 text-emerald-900 font-semibold">
                  Verde Mentă (#D8F3DC)<br/><span className="text-[9px] font-normal">Siguranță & vindecare</span>
                </div>
                <div className="bg-[#F4F4F4] p-2.5 rounded-xl border border-stone-300 text-stone-800 font-semibold">
                  Gri Cald (#F4F4F4)<br/><span className="text-[9px] font-normal">Neutralitate odihnitoare</span>
                </div>
                <div className="bg-[#222222] p-2.5 rounded-xl text-white font-semibold">
                  Negru de Fum (#222222)<br/><span className="text-[9px] font-normal">Contrast & lizibilitate</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-[11px]">
              <h3 className="text-sm font-bold text-slate-900">Machete Vizuale ale Ecranelor Cheie:</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                <li><strong>Ecran 1: Camuflaj Calculator:</strong> Interfață matematică cu taste mari, deblocare silențioasă la <code>1234=</code> și duress la <code>0000=</code>.</li>
                <li><strong>Ecran 2: Tabloul SCUT În Siguranță:</strong> Grilă tactilă clară cu butoanele SOS, Jurnal Probe, Triage, Hartă Adăposturi, Contacte Verificate și Quick Exit [X].</li>
                <li><strong>Ecran 3: Alerte SOS Active:</strong> Hartă live cu marker utilizator, buton Sună 112, alertă silențioasă și cronometru sosire echipaje.</li>
                <li><strong>Ecran 4: Jurnal Probe Criptat:</strong> Cameră internă fără galerie, microfon ambiental, note incident și sigiliu SHA-256.</li>
                <li><strong>Ecran 5: Solicitare Asistență:</strong> 4 butoane mari de triage („Sunt rănită”, „Vreau să plec”, „Depun plângere”, „Vreau să vorbesc”) cu chat securizat.</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow"
        >
          Închide Panoul de Specificații
        </button>
      </div>
    </div>
  );
};

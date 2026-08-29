import React, { useState } from 'react';
import { 
  PhoneCall, 
  Plus, 
  ArrowLeft, 
  X, 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  UserCheck, 
  Sparkles,
  Lock
} from 'lucide-react';
import { TrustedContact } from '../types/scut';

interface TrustedContactsScreenProps {
  contacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onDeleteContact: (id: string) => void;
  onBack: () => void;
  onQuickExit: () => void;
}

export const TrustedContactsScreen: React.FC<TrustedContactsScreenProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onBack,
  onQuickExit
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [decoyCodeWord, setDecoyCodeWord] = useState('Pachetul de la curier a sosit.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: TrustedContact = {
      id: `ct-${Date.now()}`,
      name,
      relationship: relationship || 'Persoană apropiată',
      phone,
      notifyOnSos: true,
      decoyCodeWord
    };

    onAddContact(newContact);
    setName('');
    setRelationship('');
    setPhone('');
    setShowAddModal(false);
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

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>CONTACTE DE ÎNCREDERE</span>
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
        {/* Camouflage Code System Explanation */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-950 text-[11px] leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sistem Mesaje Decoy (Coduri Deghizate):</span>
          </div>
          Când declanșezi SOS, contactele tale primesc un SMS aparent banal (ex: <em>„Am uitat umbrela la birou”</em>), dar care pentru ei înseamnă <strong>„Am nevoie urgentă de ajutor”</strong>.
        </div>

        {/* Contacts List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{contact.name}</h3>
                    <p className="text-[10px] text-slate-500">{contact.relationship} • {contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    SOS Activ
                  </span>
                  <button
                    onClick={() => onDeleteContact(contact.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition"
                    title="Șterge contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Decoy text preview */}
              <div className="bg-stone-50 border border-stone-100 rounded-xl p-2 text-[10px] text-slate-700 flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Mesaj Decoy SOS: </span>
                  <span className="italic text-slate-600">„{contact.decoyCodeWord}”</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Contact Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-12 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ Adaugă Contact de Încredere</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Adaugă Contact de Siguranță
              </span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Nume & Relație:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Maria Ionescu (Soră)"
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Număr de Telefon:</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="ex: +40 722 000 000"
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Mesaj Decoy Secret (ce va primi în caz de SOS):</label>
              <input
                type="text"
                value={decoyCodeWord}
                onChange={e => setDecoyCodeWord(e.target.value)}
                placeholder="ex: Am ajuns cu bine acasă."
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Salvează Contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safety Notice */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center">
        Contactele nu sunt sincronizate în agenda publică a telefonului, ci sunt stocate exclusiv în memoria criptată SCUT.
      </div>
    </div>
  );
};

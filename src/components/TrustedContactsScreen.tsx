import React, { useState } from 'react';
import {
  Plus,
  ArrowLeft,
  X,
  MessageSquare,
  Trash2,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  BatteryCharging,
  Settings2,
  RotateCcw,
  Smartphone,
  Edit2,
  Zap,
  UserCheck
} from 'lucide-react';
import { TrustedContact, EmergencySmsConfig } from '../types/scut';

interface TrustedContactsScreenProps {
  contacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onUpdateContact?: (contact: TrustedContact) => void;
  onDeleteContact: (id: string) => void;
  emergencySmsConfig?: EmergencySmsConfig;
  onUpdateEmergencySmsConfig?: (config: EmergencySmsConfig) => void;
  onBack: () => void;
  onQuickExit: () => void;
}

export const TrustedContactsScreen: React.FC<TrustedContactsScreenProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  emergencySmsConfig = {
    autoSmsEnabled: true,
    includeGpsCoordinates: true,
    includeBatteryStatus: true,
    customGlobalSosTemplate: '🚨 ALERTĂ SCUT SOS: Am nevoie de sprijin de urgență! Poziție GPS: https://maps.google.com/?q=[GPS live la momentul trimiterii] (Baterie: 84%)',
    countdownSecondsBeforeSend: 3
  },
  onUpdateEmergencySmsConfig,
  onBack,
  onQuickExit
}) => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);

  // Form states for Add / Edit
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyOnSos, setNotifyOnSos] = useState<boolean>(true);
  const [smsMode, setSmsMode] = useState<'decoy' | 'direct'>('decoy');
  const [decoyCodeWord, setDecoyCodeWord] = useState('Pachetul de la curier a sosit.');
  const [customMessage, setCustomMessage] = useState('ALERTA SCUT: Sunt într-o situație de criză iminentă. Transmit poziția mea pentru asistență.');
  const [includeGpsLocation, setIncludeGpsLocation] = useState<boolean>(true);
  const [includeBatteryStatus, setIncludeBatteryStatus] = useState<boolean>(true);
  const [formError, setFormError] = useState('');

  // Simulation states
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [previewContactId, setPreviewContactId] = useState<string>(contacts[0]?.id || '');

  // Master config state (local fallback if no parent handler)
  const [localConfig, setLocalConfig] = useState<EmergencySmsConfig>(emergencySmsConfig);

  const activeConfig = emergencySmsConfig || localConfig;

  const handleToggleGlobalAutoSms = () => {
    const updated = {
      ...activeConfig,
      autoSmsEnabled: !activeConfig.autoSmsEnabled
    };
    setLocalConfig(updated);
    if (onUpdateEmergencySmsConfig) {
      onUpdateEmergencySmsConfig(updated);
    }
  };

  const handleUpdateGlobalConfig = (newConfig: EmergencySmsConfig) => {
    setLocalConfig(newConfig);
    if (onUpdateEmergencySmsConfig) {
      onUpdateEmergencySmsConfig(newConfig);
    }
  };

  const handleToggleContactSos = (contact: TrustedContact, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: TrustedContact = {
      ...contact,
      notifyOnSos: !contact.notifyOnSos
    };
    if (onUpdateContact) {
      onUpdateContact(updated);
    } else {
      // Fallback update
      onDeleteContact(contact.id);
      onAddContact(updated);
    }
  };

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('');
    setPhone('');
    setNotifyOnSos(true);
    setSmsMode('decoy');
    setDecoyCodeWord('Am uitat umbrela la birou.');
    setCustomMessage('ALERTA SCUT: Sunt într-o situație de criză iminentă. Transmit poziția mea.');
    setIncludeGpsLocation(true);
    setIncludeBatteryStatus(true);
    setFormError('');
    setShowAddModal(true);
  };

  const openEditModal = (contact: TrustedContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setNotifyOnSos(contact.notifyOnSos);
    setSmsMode(contact.smsMode || 'decoy');
    setDecoyCodeWord(contact.decoyCodeWord || 'Am uitat umbrela la birou.');
    setCustomMessage(contact.customMessage || 'ALERTA SCUT: Sunt într-o situație de criză iminentă.');
    setIncludeGpsLocation(contact.includeGpsLocation ?? true);
    setIncludeBatteryStatus(contact.includeBatteryStatus ?? true);
    setFormError('');
    setShowAddModal(true);
  };

  const isValidPhone = (value: string) => {
    if (!/^[+\d][\d\s().-]*$/.test(value.trim())) return false;
    const digitCount = value.replace(/\D/g, '').length;
    return digitCount >= 9 && digitCount <= 15;
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Numele contactului este obligatoriu.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Numărul de telefon este obligatoriu.');
      return;
    }
    if (!isValidPhone(phone)) {
      setFormError('Numărul de telefon nu pare valid. Folosește doar cifre, spații și opțional „+" la început (ex: +40 722 000 000).');
      return;
    }
    if (smsMode === 'decoy' && !decoyCodeWord.trim()) {
      setFormError('Fraza decoy este obligatorie pentru modul camuflat.');
      return;
    }
    if (smsMode === 'direct' && !customMessage.trim()) {
      setFormError('Mesajul direct de urgență este obligatoriu.');
      return;
    }

    if (editingContact) {
      const updated: TrustedContact = {
        ...editingContact,
        name,
        relationship: relationship || 'Persoană apropiată',
        phone,
        notifyOnSos,
        smsMode,
        decoyCodeWord,
        customMessage,
        includeGpsLocation,
        includeBatteryStatus
      };
      if (onUpdateContact) {
        onUpdateContact(updated);
      } else {
        onDeleteContact(editingContact.id);
        onAddContact(updated);
      }
    } else {
      const newContact: TrustedContact = {
        id: `ct-${Date.now()}`,
        name,
        relationship: relationship || 'Persoană apropiată',
        phone,
        notifyOnSos,
        smsMode,
        decoyCodeWord,
        customMessage,
        includeGpsLocation,
        includeBatteryStatus,
        receiveSosAlert: notifyOnSos,
        receiveLocationAlert: includeGpsLocation
      };
      onAddContact(newContact);
    }

    setShowAddModal(false);
    setEditingContact(null);
  };

  // Run SMS dispatch simulation
  const startSmsSimulation = () => {
    setShowSimulateModal(true);
    setIsSimulating(true);
    setSimStep(1);
    setSimulatedLogs(['[0.0s] Inițiere protocol SOS automat...']);

    setTimeout(() => {
      setSimStep(2);
      setSimulatedLogs(prev => [
        ...prev,
        '[0.4s] Conectare modem celular (GSM/VoLTE) & interogare GPS...'
      ]);
    }, 800);

    setTimeout(() => {
      setSimStep(3);
      const enabledList = contacts.filter(c => c.notifyOnSos);
      setSimulatedLogs(prev => [
        ...prev,
        `[1.2s] Generare conținut SMS pentru ${enabledList.length} contacte selectate...`
      ]);
    }, 1700);

    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
      setSimulatedLogs(prev => [
        ...prev,
        `[2.1s] ✅ Toate mesajele SMS de urgență au fost expediate și confirmate de rețea!`
      ]);
    }, 2600);
  };

  const enabledSosContactsCount = contacts.filter(c => c.notifyOnSos).length;

  // Preview only — arată formatul mesajului, nu locația reală. Coordonatele reale
  // (via navigator.geolocation) sunt inserate abia la trimiterea efectivă din SosAlertScreen.
  const generateSmsPreviewText = (contact: TrustedContact) => {
    if (contact.smsMode === 'direct') {
      let text = contact.customMessage || '🚨 ALERTA SCUT SOS: Am nevoie de sprijin de urgență!';
      if (contact.includeGpsLocation) {
        text += ' Locație: https://maps.google.com/?q=[GPS live la momentul trimiterii]';
      }
      if (contact.includeBatteryStatus) {
        text += ' (Baterie: 84%)';
      }
      return text;
    }
    // Decoy Mode
    let text = contact.decoyCodeWord || 'Pachetul de la curier a sosit.';
    if (contact.includeGpsLocation) {
      text += ' [Ref: GPS live la momentul trimiterii]';
    }
    return text;
  };

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

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>CONTACTE DE ÎNCREDERE & SMS SOS</span>
        </div>

        <button
          id="btn-contacts-quick-exit"
          onClick={onQuickExit}
          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition cursor-pointer"
          title="Ieșire Rapidă"
          aria-label="Ieșire Rapidă"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 space-y-3">
        
        {/* Master Automated SMS Trigger Banner & Toggle */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                activeConfig.autoSmsEnabled ? 'bg-amber-600 animate-pulse' : 'bg-stone-400'
              }`}>
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Pregătire SMS la Declanșare SOS
                </h3>
                <p className="text-[10px] text-slate-600">
                  {activeConfig.autoSmsEnabled
                    ? `Activ: ${enabledSosContactsCount} din ${contacts.length} contacte vor apărea pe ecranul SOS, gata de trimis cu un tap`
                    : 'Dezactivat: contactele nu vor apărea pe ecranul SOS'}
                </p>
              </div>
            </div>

            {/* Master Switch Button */}
            <button
              id="btn-toggle-master-sos-sms"
              onClick={handleToggleGlobalAutoSms}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                activeConfig.autoSmsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
              title="Comută activarea automată SMS"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                activeConfig.autoSmsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Configuration Summary & Action Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-amber-200/80 text-[10px]">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3 h-3 text-amber-700" />
                GPS Inclus
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold">
                <BatteryCharging className="w-3 h-3 text-emerald-700" />
                Baterie Inclusă
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Simulate Test Dispatch Button */}
              <button
                id="btn-simulate-sos-sms"
                onClick={startSmsSimulation}
                disabled={isSimulating}
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                title="Testează expedierea simulată de SMS"
              >
                <Zap className={`w-3 h-3 ${isSimulating ? 'animate-pulse' : ''}`} />
                <span>{isSimulating ? 'Se testează...' : 'Testare SMS'}</span>
              </button>

              {/* Configure Global SMS Template */}
              <button
                onClick={() => setShowConfigModal(true)}
                className="p-1 text-slate-600 hover:text-slate-900 bg-white/80 rounded-lg border border-amber-200 cursor-pointer"
                title="Personalizează setările SMS de Urgență"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Camouflage Code System Quick Guide */}
        <div className="bg-white border border-stone-200 rounded-2xl p-2.5 text-[11px] text-slate-700 flex items-start gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="text-slate-900">Modul Decoy (Camuflat):</strong> Trimite un SMS aparent inofensiv (ex: <em>„Am uitat umbrela la birou”</em>) pentru a proteja victima în caz de supraveghere, sau alege <strong>Mod Direct</strong> pentru mesaje explicite cu link GPS live.
          </div>
        </div>

        {/* Contacts List with SMS Status Toggles */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className={`bg-white border rounded-2xl p-3 shadow-xs space-y-2 transition ${
                contact.notifyOnSos 
                  ? 'border-amber-300 ring-1 ring-amber-200' 
                  : 'border-stone-200 opacity-80'
              }`}
            >
              {/* Contact Top Info & Toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${
                    contact.notifyOnSos ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{contact.name}</h3>
                    <p className="text-[10px] text-slate-500">{contact.relationship} • {contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Per-Contact SMS Toggle Badge */}
                  <button
                    onClick={(e) => handleToggleContactSos(contact, e)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      contact.notifyOnSos
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                    }`}
                    title={contact.notifyOnSos ? 'Dezactivează SMS pentru acest contact' : 'Activează SMS automat pentru acest contact'}
                  >
                    <CheckCircle2 className={`w-3 h-3 ${contact.notifyOnSos ? 'text-emerald-700' : 'text-stone-400'}`} />
                    <span>{contact.notifyOnSos ? 'SMS SOS Activ' : 'Inactiv'}</span>
                  </button>

                  {/* Edit Contact Button */}
                  <button
                    onClick={() => openEditModal(contact)}
                    className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                    title="Editează mesajul și setările de alertă"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Contact Button */}
                  <button
                    onClick={() => onDeleteContact(contact.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Șterge contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SMS Dispatch Configuration & Message Bubble */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-2 text-[10px] text-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-amber-600" />
                    <span>Conținut SMS SOS ({contact.smsMode === 'direct' ? '🚨 Mod Direct' : '🕵️ Mod Camuflat Decoy'}):</span>
                  </span>
                  {contact.includeGpsLocation && (
                    <span className="text-indigo-700 font-mono">+ Locație GPS live</span>
                  )}
                </div>

                <div className="p-1.5 bg-white border border-stone-200 rounded-lg font-mono text-[10px] text-slate-800 leading-snug">
                  „{generateSmsPreviewText(contact)}”
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Contact Button */}
        <button
          id="btn-add-trusted-contact"
          onClick={openAddModal}
          className="w-full h-11 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adaugă Contact de Încredere & Configurează SMS</span>
        </button>
      </div>

      {/* Add / Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmitContactForm} 
            className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-2.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                {editingContact ? 'Editare Contact & Mesaj SOS' : 'Adăugare Contact de Siguranță'}
              </span>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Închide"
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div role="alert" className="flex items-start gap-1.5 bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-medium px-2.5 py-2 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label htmlFor="contact-name" className="text-[11px] font-semibold text-slate-700 block mb-0.5">Nume & Relație:</label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setFormError(''); }}
                placeholder="ex: Maria Ionescu (Soră)"
                maxLength={80}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="text-[11px] font-semibold text-slate-700 block mb-0.5">Număr de Telefon (pentru SMS Urgență):</label>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setFormError(''); }}
                placeholder="ex: +40 722 000 000"
                maxLength={20}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                required
              />
            </div>

            {/* Alert on SOS Toggle */}
            <div className="flex items-center justify-between p-2 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <span className="text-xs font-bold text-amber-950 block">Afișează pe ecranul SOS</span>
                <span className="text-[10px] text-amber-800">Apare gata de trimis cu un tap la declanșarea alertei</span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnSos}
                onChange={e => setNotifyOnSos(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {/* SMS Message Mode Selection */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tipul Mesajului SMS:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSmsMode('decoy')}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                    smsMode === 'decoy'
                      ? 'bg-amber-100 border-amber-500 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-slate-600'
                  }`}
                >
                  <div className="text-[11px] flex items-center gap-1">
                    <span>🕵️ Decoy (Camuflat)</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 mt-0.5">
                    Mesaj inofensiv în caz de supraveghere
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSmsMode('direct')}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                    smsMode === 'direct'
                      ? 'bg-rose-100 border-rose-500 text-rose-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-slate-600'
                  }`}
                >
                  <div className="text-[11px] flex items-center gap-1">
                    <span>🚨 Alertă Directă</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 mt-0.5">
                    Mesaj explicit de criză SOS
                  </div>
                </button>
              </div>
            </div>

            {/* Decoy Phrase or Custom Direct Text Input */}
            {smsMode === 'decoy' ? (
              <div>
                <label htmlFor="contact-decoy" className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Fraza Decoy Secretă (ce va recepționa contactul):
                </label>
                <input
                  id="contact-decoy"
                  type="text"
                  value={decoyCodeWord}
                  onChange={e => { setDecoyCodeWord(e.target.value); setFormError(''); }}
                  placeholder="ex: Am ajuns cu bine acasă."
                  maxLength={160}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="contact-custom-message" className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Mesaj Direct de Urgență:
                </label>
                <textarea
                  id="contact-custom-message"
                  rows={2}
                  value={customMessage}
                  onChange={e => { setCustomMessage(e.target.value); setFormError(''); }}
                  placeholder="ex: ALERTA SCUT: Sunt în pericol. Vă rog trimiteți ajutor!"
                  maxLength={300}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
            )}

            {/* GPS & Battery Checkboxes */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGpsLocation}
                  onChange={e => setIncludeGpsLocation(e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-600 rounded"
                />
                <span>Include automat link cu coordonatele GPS exacte</span>
              </label>

              <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBatteryStatus}
                  onChange={e => setIncludeBatteryStatus(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                />
                <span>Include nivelul procentual al bateriei telefonului</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                {editingContact ? 'Actualizează Contact' : 'Salvează Contact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global Emergency SMS Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-amber-600" />
                Configurare Dispecerizare SMS SOS
              </span>
              <button onClick={() => setShowConfigModal(false)} aria-label="Închide" className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="font-bold text-slate-900 block">Trimitere Instantanee (Fără Întârziere)</span>
                  <span className="text-[10px] text-slate-500">Expediere SMS simultan la declanșarea butonului SOS</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700">0 sec</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Șablon Global Mesaj Direct de Urgență:
                </label>
                <textarea
                  rows={3}
                  value={activeConfig.customGlobalSosTemplate}
                  onChange={e => handleUpdateGlobalConfig({
                    ...activeConfig,
                    customGlobalSosTemplate: e.target.value
                  })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-950">
                💡 <strong>Protocol Siguranță:</strong> SMS-urile sunt trimise prin protocol GSM standard direct din modemul telefonului, fără intermediari sau conexiune obligatorie la internet.
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Închide & Salvează Setările
            </button>
          </div>
        </div>
      )}

      {/* Interactive SMS Dispatch Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full text-slate-900 shadow-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 animate-bounce" />
                <span className="text-xs font-bold text-slate-900">Simulare Expediere SMS de Urgență</span>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                aria-label="Închide"
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Dispatch Pipeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-800">Proces Transmisie:</span>
                <span className={`font-mono ${simStep === 4 ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                  {simStep === 4 ? '100% Finalizat' : `${simStep * 25}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${simStep * 25}%` }}
                />
              </div>

              {/* Real-time Terminal Dispatch Log */}
              <div className="bg-slate-950 text-emerald-400 p-2.5 rounded-xl font-mono text-[10px] space-y-1 max-h-24 overflow-y-auto border border-slate-800">
                {simulatedLogs.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))}
              </div>
            </div>

            {/* Recipient Incoming Message Preview */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Previzualizare SMS pe telefonul destinatarului:</span>
                </span>
              </div>

              {/* Recipient Selector */}
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                {contacts.filter(c => c.notifyOnSos).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setPreviewContactId(c.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap cursor-pointer ${
                      (previewContactId || contacts[0]?.id) === c.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-200 text-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Simulated Phone SMS Bubble */}
              {(() => {
                const currentContact = contacts.find(c => c.id === (previewContactId || contacts[0]?.id)) || contacts[0];
                if (!currentContact) return null;
                return (
                  <div className="bg-stone-100 border border-stone-300 rounded-2xl p-2.5 shadow-inner">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                      <span>De la: Numărul Tău</span>
                      <span className="font-mono text-emerald-700 font-bold">Livrat Acum • GSM</span>
                    </div>
                    <div className="bg-emerald-600 text-white p-2.5 rounded-xl rounded-tl-xs text-xs font-mono shadow-xs leading-relaxed">
                      {generateSmsPreviewText(currentContact)}
                    </div>
                    <div className="text-[9px] text-slate-500 text-right mt-1">
                      Mod: {currentContact.smsMode === 'direct' ? '🚨 Alertă Directă' : '🕵️ Cod Camuflat (Decoy)'}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Close / Retest */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={startSmsSimulation}
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reia Simularea</span>
              </button>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="w-full bg-[#E6F0F8] border border-sky-200 rounded-xl p-2 text-[10px] text-slate-600 text-center shrink-0">
        SMS-urile standard funcționează pe rețeaua GSM chiar și fără semnal de date 4G/5G — dar trebuie să apeși tu „Trimite" în aplicația de mesaje; SCUT nu le trimite automat sau printr-un canal special.
      </div>

    </div>
  );
};

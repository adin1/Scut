import { EvidenceItem, ShelterLocation, TrustedContact, DisguisedNotification, CaseDossierSection, VoiceTriggerConfig, VoiceTriggerEvent, BiometricConfig, EmergencySmsConfig } from '../types/scut';

export const DEFAULT_BIOMETRIC_CONFIG: BiometricConfig = {
  enabled: true,
  preferredMethod: 'face_id',
  livenessDetection: true,
  autoScanOnTransition: true,
  duressFingerprintEnabled: true,
  hapticFeedback: true,
  maxFailedAttempts: 3
};

export const DEFAULT_VOICE_CONFIG: VoiceTriggerConfig = {
  enabled: true,
  primaryKeyword: 'Ajutor',
  secondaryKeywords: ['Cod Roșu', 'SOS', 'Salvați-mă', 'Trandafir roșu', 'Am uitat cheile', 'Scut 112'],
  silentMode: true, // Default to stealth/silent so disguise is preserved
  recordAudioOnTrigger: true,
  dispatch112OnTrigger: true,
  notifyContactsOnTrigger: true,
  hapticFeedback: true,
  sensitivity: 'medium',
  listenInDisguisedModes: true,
  listenInLockScreen: true
};

export const INITIAL_VOICE_EVENTS: VoiceTriggerEvent[] = [
  {
    id: 'vt-sample-01',
    timestamp: Date.now() - 3600000 * 4,
    timeString: 'Azi, 08:32',
    keywordDetected: 'Ajutor',
    rawTranscript: 'Te rog lasă-mă, ajutor!',
    modeAtTrigger: 'calculator',
    isSilent: true,
    coordinates: { lat: 44.4378, lng: 26.0946 },
    evidenceLoggedId: 'ev-002',
    status: 'completed'
  }
];

export const PRESET_TRIGGER_KEYWORDS = [
  { keyword: 'Ajutor', description: 'Urgență directă (Română)', category: 'direct', stealthLevel: 'Direct' },
  { keyword: 'Cod Roșu', description: 'Cuvânt de cod tactil', category: 'code', stealthLevel: 'Moderat' },
  { keyword: 'SOS', description: 'Standard internațional', category: 'direct', stealthLevel: 'Direct' },
  { keyword: 'Salvați-mă', description: 'Urgență extremă', category: 'direct', stealthLevel: 'Direct' },
  { keyword: 'Trandafir roșu', description: 'Expresie camuflată inofensivă', category: 'covert', stealthLevel: 'Maxim (Camuflat)' },
  { keyword: 'Am uitat cheile', description: 'Frază conversațională banală', category: 'covert', stealthLevel: 'Maxim (Camuflat)' },
  { keyword: 'Scut 112', description: 'Comandă directă SCUT', category: 'code', stealthLevel: 'Moderat' }
];

export const INITIAL_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-001',
    title: 'Mesaje de amenințare SMS & WhatsApp',
    category: 'photo',
    date: '28 Aug 2026, 21:40',
    timestamp: 1787953200000,
    description: 'Captură ecran cu mesaje de amenințare cu violență fizică și distrugere bunuri.',
    tags: ['Violență psihologică', 'Amenințare scrisă', 'Mesaje text'],
    fileSize: '2.4 MB',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    location: 'Str. Victoriei, Sector 1, București (44.4378, 26.0946)',
    isEncrypted: true,
    tamperProofVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ev-002',
    title: 'Înregistrare audio agresiune verbală',
    category: 'audio',
    date: '24 Aug 2026, 19:15',
    timestamp: 1787600100000,
    description: 'Înregistrare de 3 min 45 sec în care agresorul sparge obiecte în locuință și adresează injurii.',
    tags: ['Agresiune verbală', 'Distrugere', 'Probă audio'],
    fileSize: '4.8 MB',
    duration: '03:45',
    sha256Hash: 'a8f5f167f44f4964e6c998dee827110c0175ef9892c2a05cf4e12c96a341ac90',
    location: 'Domiciliu comun (44.4321, 26.0892)',
    isEncrypted: true,
    tamperProofVerified: true
  },
  {
    id: 'ev-003',
    title: 'Certificat Medico-Legal Preliminar (INML Mina Minovici)',
    category: 'document',
    date: '19 Aug 2026, 11:30',
    timestamp: 1787139000000,
    description: 'Constatare leziuni traumatice antebraț și echimoze toracice, 4-5 zile îngrijiri medicale.',
    tags: ['INML', 'Certificat medical', 'Leziuni fizice'],
    fileSize: '1.8 MB',
    sha256Hash: 'f4560731a5c68b753c52a0a2df3d8544c7952a1df70c17a86f9e8023793e2b26',
    location: 'INML București',
    isEncrypted: true,
    tamperProofVerified: true
  },
  {
    id: 'ev-004',
    title: 'Notă incident: blocare acces la fonduri și chei',
    category: 'note',
    date: '15 Aug 2026, 08:00',
    timestamp: 1786780800000,
    description: 'Mi-a reținut cardul bancar de salariu și a încuiat ușa refuzând să mă lase să merg la serviciu. Martor: vecina de la ap. 14.',
    tags: ['Violență economică', 'Sechestrare parțială', 'Jurnal'],
    sha256Hash: '7d793037a0760186574b0282f2f435e7b1e50774690f69799f935d902a7818e6',
    isEncrypted: true,
    tamperProofVerified: true
  }
];

export const SHELTERS_LIST: ShelterLocation[] = [
  {
    id: 'sh-001',
    name: 'Centrul de Primire în Regim de Urgență „Sfânta Maria” (DGASPC)',
    type: 'shelter',
    address: 'Locație Confidențială - Sector 1',
    city: 'București',
    county: 'București',
    phone: '0800.500.333',
    emergency24h: true,
    hasPsychologicalSupport: true,
    schedule: 'Non-Stop 24/7',
    services: ['Cazare de urgență', 'Suport Psihologic Traumă', 'Pază armată 24/7', 'Asistență juridică'],
    coordinates: { lat: 44.4510, lng: 26.0790 },
    capacityStatus: 'available',
    description: 'Cazare de urgență pentru mame și copii, consiliere psihologică de criză, masă caldă, pază permanentă 24/7.'
  },
  {
    id: 'sh-002',
    name: 'Adăpostul de Criză „Aripa Speranței” (Asociația ANAIS)',
    type: 'ngo',
    address: 'Locație Securizată Anonimizată',
    city: 'București',
    county: 'București',
    phone: '0743.088.880',
    emergency24h: true,
    hasPsychologicalSupport: true,
    schedule: 'Non-Stop 24/7',
    services: ['Adăpost de criză', 'Psihoterapie de grup și individuală', 'Asistență avocat OPP', 'Linie de urgență'],
    coordinates: { lat: 44.4268, lng: 26.1025 },
    capacityStatus: 'available',
    description: 'Adăpost confidențial, psihoterapie specializată pentru traume de violență domestică și suport juridic pentru emiterea Ordinului de Protecție.'
  },
  {
    id: 'sh-003',
    name: 'Secția de Poliție Nr. 1 - Compartimentul Violență Domestică',
    type: 'police',
    address: 'Bulevardul Lascăr Catargiu Nr. 34',
    city: 'București',
    county: 'București',
    phone: '112 / 021.314.1516',
    emergency24h: true,
    hasPsychologicalSupport: false,
    schedule: 'Non-Stop 24/7',
    services: ['Ordin de Protecție Provizoriu (OPP)', 'Monitorizare Brățară Electronică', 'Intervenție de urgență 112'],
    coordinates: { lat: 44.4485, lng: 26.0890 },
    capacityStatus: 'available',
    description: 'Emitere imediată a Ordinului de Protecție Provizoriu (OPP) valabil 5 zile pe loc și monitorizare brățară electronică.'
  },
  {
    id: 'sh-004',
    name: 'Institutul Național de Medicină Legală „Mina Minovici”',
    type: 'hospital',
    address: 'Șoseaua Vitan-Bârzești Nr. 9',
    city: 'București',
    county: 'București',
    phone: '021.332.1217',
    emergency24h: true,
    hasPsychologicalSupport: false,
    schedule: 'Non-Stop 24/7 (Urgențe Medico-Legale)',
    services: ['Constatare leziuni fizice', 'Certificat medico-legal oficial', 'Recoltare probe biologice'],
    coordinates: { lat: 44.4012, lng: 26.1368 },
    capacityStatus: 'available',
    description: 'Examinare medico-legală gratuită sau decontată, eliberare certificat constatator oficial pentru dosarul penal și instanță.'
  },
  {
    id: 'sh-005',
    name: 'Centrul de Consiliere Psihologică și Sprijin Emoțional „Sens”',
    type: 'ngo',
    address: 'Strada Academiei Nr. 17, Sector 1',
    city: 'București',
    county: 'București',
    phone: '0722.345.678',
    emergency24h: false,
    hasPsychologicalSupport: true,
    schedule: 'Luni - Vineri: 08:30 - 19:30',
    services: ['Psihoterapie EMDR & Traumă', 'Consiliere copii martori', 'Grupuri de suport ghidate', 'Consiliere vocațională'],
    coordinates: { lat: 44.4355, lng: 26.0998 },
    capacityStatus: 'available',
    description: 'Centru de zi specializat exclusiv pe psihoterapie clinică, managementul sindromului de stres post-traumatic (PTSD) și refacere emoțională.'
  },
  {
    id: 'sh-006',
    name: 'Centrul Maternal de Urgență Cluj-Napoca (DGASPC Cluj)',
    type: 'shelter',
    address: 'Locație Securizată',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    phone: '0264.420.147',
    emergency24h: true,
    hasPsychologicalSupport: true,
    schedule: 'Non-Stop 24/7',
    services: ['Găzduire securizată', 'Suport Psihologic Permanent', 'Asistență socială', 'Baroul Cluj Pro-Bono'],
    coordinates: { lat: 46.7712, lng: 23.6236 },
    capacityStatus: 'available',
    description: 'Găzduire securizată, asistență psihologică permanentă pentru mame și minori, asistență juridică gratuită.'
  },
  {
    id: 'sh-007',
    name: 'Centrul de Asistență pentru Victimele Violenței Timișoara',
    type: 'shelter',
    address: 'Adresă Protejată',
    city: 'Timișoara',
    county: 'Timiș',
    phone: '0256.490.281',
    emergency24h: true,
    hasPsychologicalSupport: true,
    schedule: 'Non-Stop 24/7',
    services: ['Servicii de criză 24/7', 'Consiliere psihologică', 'Sprijin reintegrare', 'Cazare sigură'],
    coordinates: { lat: 45.7537, lng: 21.2257 },
    capacityStatus: 'available',
    description: 'Servicii de criză 24/7, sprijin reintegrare, consiliere juridică și suport psihologic specializat.'
  },
  {
    id: 'sh-008',
    name: 'Cabinet Specializat Psihoterapie Familială & Traumă Iași',
    type: 'ngo',
    address: 'Bulevardul Carol I Nr. 12',
    city: 'Iași',
    county: 'Iași',
    phone: '0232.267.890',
    emergency24h: false,
    hasPsychologicalSupport: true,
    schedule: 'Luni - Sâmbătă: 09:00 - 18:00',
    services: ['Psihoterapie individuală', 'Terapie desensibilizare traumă', 'Evaluare psihologică pentru instanță'],
    coordinates: { lat: 47.1635, lng: 27.5830 },
    capacityStatus: 'available',
    description: 'Evaluare psihologică de specialitate, rapoarte de expertiză pentru instanță și terapie de recuperare după abuz.'
  }
];

export const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'ct-001',
    name: 'Elena Popescu (Soră)',
    relationship: 'Soră',
    phone: '+40 722 123 456',
    notifyOnSos: true,
    smsMode: 'decoy',
    decoyCodeWord: 'Cafeaua de dimineață a fost confirmată.',
    includeGpsLocation: true,
    includeBatteryStatus: true
  },
  {
    id: 'ct-002',
    name: 'Ioana Radu (Prietenă de încredere)',
    relationship: 'Prietenă',
    phone: '+40 744 987 654',
    notifyOnSos: true,
    smsMode: 'decoy',
    decoyCodeWord: 'Am uitat umbrela la birou.',
    includeGpsLocation: true,
    includeBatteryStatus: true
  },
  {
    id: 'ct-003',
    name: 'Av. Simona Marinescu (Asistență Pro-Bono)',
    relationship: 'Avocat Barou',
    phone: '+40 730 555 777',
    notifyOnSos: true,
    smsMode: 'direct',
    decoyCodeWord: 'Documentele fiscale sunt pregătite.',
    customMessage: 'ALERTA SCUT: Sunt într-o situație de criză iminentă. Transmit poziția mea pentru asistență juridică și sesizare.',
    includeGpsLocation: true,
    includeBatteryStatus: true
  }
];

export const DEFAULT_EMERGENCY_SMS_CONFIG: EmergencySmsConfig = {
  autoSmsEnabled: true,
  includeGpsCoordinates: true,
  includeBatteryStatus: true,
  customGlobalSosTemplate: '🚨 ALERTĂ SCUT SOS: Am nevoie de sprijin de urgență! Poziție GPS: https://maps.google.com/?q=44.4378,26.0946 (Baterie: 84%)',
  countdownSecondsBeforeSend: 3
};

export const DISGUISED_NOTIFICATIONS_CATALOG: DisguisedNotification[] = [
  {
    id: 'notif-1',
    disguisedTitle: 'Actualizare sistem',
    disguisedBody: 'Listă de contacte sincronizată cu serverul de backup.',
    realTitle: 'Mesaj nou Psiholog DGASPC',
    realBody: '„Suntem disponibili pentru ședința de consiliere gratuită astăzi la ora 14:00.”',
    category: 'system',
    time: 'Acum 10 min',
    sender: 'Consilier DGASPC'
  },
  {
    id: 'notif-2',
    disguisedTitle: 'Prognoză Meteo',
    disguisedBody: 'Șanse reduse de precipitații pentru weekendul acesta.',
    realTitle: 'Răspuns Juridic Barou',
    realBody: '„Cererea pentru Ordinul de Protecție Provizoriu a fost completată de avocat.”',
    category: 'weather',
    time: 'Acum 1 oră',
    sender: 'Avocat Pro-Bono'
  },
  {
    id: 'notif-3',
    disguisedTitle: 'Google Play Store',
    disguisedBody: '3 aplicații de calcul și productivitate actualizate cu succes.',
    realTitle: 'Alertă Adăpost Sigur',
    realBody: '„Loc disponibil confirmat la Centrul de Primire în Regim de Urgență.”',
    category: 'store',
    time: 'Ieri, 18:30',
    sender: 'Dispecerat Asistență'
  }
];

export const CASE_DOSSIER_MOCK: CaseDossierSection[] = [
  {
    id: 'sec-identity',
    title: '1. Date de Identificare & Siguranță',
    authorizedRoles: ['victima', 'politie', 'dgaspc', 'avocat'],
    status: 'complet',
    lastUpdated: '28 Aug 2026',
    dataFields: [
      { label: 'Cod Unic Anonimizat Caz', value: 'SCUT-RO-2026-B0892', confidential: false },
      { label: 'Nume Prenume (Criptat AES-256)', value: 'M. P. (Acces restricționat prin cheie partajată)', confidential: true },
      { label: 'Adresă Risc Ridicat', value: 'Locație monitorizată - Sector 1, București', confidential: true },
      { label: 'Copii Minori în Întreținere', value: '2 minori (băiat 6 ani, fată 3 ani)', confidential: false },
      { label: 'Nivel Evaluare Risc Poliție', value: 'IMINENT / RIDICAT (Scor 18/20 la formularul de risc)', confidential: false }
    ]
  },
  {
    id: 'sec-police',
    title: '2. Istoric Poliție & Măsuri de Protecție',
    authorizedRoles: ['politie', 'avocat', 'dgaspc'],
    status: 'actualizat',
    lastUpdated: '26 Aug 2026',
    dataFields: [
      { label: 'Sesizări Anterioare 112', value: '3 apeluri înregistrate în ultimele 60 de zile', confidential: false },
      { label: 'Ordin de Protecție Provizoriu (OPP)', value: 'Emis la 26.08.2026 de Secția 1 Poliție (Valabil 5 zile)', confidential: false },
      { label: 'Măsură Brățară Electronică', value: 'Dispozitiv de monitorizare activ pe agresor (Rază 500m)', confidential: false },
      { label: 'Interdicții Active', value: 'Evacuare temporară a agresorului din domiciliu, interdicție contact', confidential: false }
    ]
  },
  {
    id: 'sec-medical',
    title: '3. Rapoarte Medicale & Constatări INML',
    authorizedRoles: ['medic_inml', 'victima', 'politie', 'avocat'],
    status: 'complet',
    lastUpdated: '19 Aug 2026',
    dataFields: [
      { label: 'Certificat Medico-Legal', value: 'Nr. A4/8892 eliberat de INML Mina Minovici', confidential: false },
      { label: 'Zile Îngrijiri Medicale', value: '4-5 zile (leziuni contuzive traumatice, echimoze multiple)', confidential: false },
      { label: 'Stare Fizică Curentă', value: 'Tratament ambulatoriu, investigații radiologice negative pentru fracturi', confidential: true }
    ]
  },
  {
    id: 'sec-psychology',
    title: '4. Evaluare Psihologică & Plan de Reabilitare',
    authorizedRoles: ['psiholog', 'victima'],
    status: 'in_evaluare',
    lastUpdated: '27 Aug 2026',
    dataFields: [
      { label: 'Simptomatologie Trauma', value: 'Sindrom de stres post-traumatic (PTSD), hipervigilență, anxietate acută', confidential: true },
      { label: 'Plan Intervenție', value: '10 ședințe psihoterapie de suport traumă decontate de DGASPC', confidential: true },
      { label: 'Note Confidențiale Terapeut', value: '„Victima manifestă dorință fermă de securizare a minorilor și separare definitivă.”', confidential: true }
    ]
  },
  {
    id: 'sec-social',
    title: '5. Plan de Sprijin Social & Adăpost (DGASPC)',
    authorizedRoles: ['dgaspc', 'victima', 'avocat'],
    status: 'actualizat',
    lastUpdated: '28 Aug 2026',
    dataFields: [
      { label: 'Statut Adăpost de Urgență', value: 'Loc rezervat în Centrul „Sfânta Maria” (Cazare + Masă + Asistență)', confidential: false },
      { label: 'Pachet Sprijin Financiar', value: 'Ajutor de urgență pentru chirie temporară aprobat', confidential: false },
      { label: 'Școală/Grădiniță Copii', value: 'Procedură de transfer temporar confidențial în derulare', confidential: true }
    ]
  }
];

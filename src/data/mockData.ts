import {
  Evidence,
  Incident,
  Case,
  Child,
  ProtectionOrder,
  AuditEvent,
  Consent,
  SafetyPlan,
  SafetyCheckItem,
  ResourceProvider,
  TrustedContact,
  DisguisedNotification,
  CaseDossierSection,
  VoiceTriggerConfig,
  VoiceTriggerEvent,
  BiometricConfig,
  EmergencySmsConfig,
  PilotRegionConfig,
  VerifiedStatistic,
  CaseTask,
  CaseNote
} from '../types/scut';
import { CLUJ_RESOURCE_PROVIDERS } from './cluj';

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
  silentMode: true,
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

export const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: 'ev-001',
    evidenceId: 'EV-2026-0828-A492',
    caseId: 'SCUT-RO-2026-B0892',
    originalVsDerived: 'original',
    title: 'Mesaje de amenințare SMS & WhatsApp',
    category: 'screenshot',
    dateCreated: '28 Aug 2026, 21:40',
    serverTimestamp: 1787953200000,
    deviceTimestamp: 1787953198000,
    mimeType: 'image/png',
    fileSize: '2.4 MB',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    integrityStatus: 'verified',
    technicalMetadata: {
      fileDimensions: '1170x2532 px',
      deviceModel: 'Secure Sandbox Enclave',
      exifPreserved: true,
      storageLayer: 'aes256_gcm_vault'
    },
    source: 'uploaded_file',
    coordinates: { lat: 44.4378, lng: 26.0946 },
    uploaderUserId: 'usr-victim-001',
    uploaderRole: 'victim',
    isEncrypted: true,
    description: 'Captură ecran cu mesaje de amenințare cu violență fizică și distrugere bunuri.',
    tags: ['Violență psihologică', 'Amenințare scrisă', 'Mesaje text'],
    eidasTimestampStatus: 'qualified_timestamp_embedded',
    mediaUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ev-002',
    evidenceId: 'EV-2026-0824-B109',
    caseId: 'SCUT-RO-2026-B0892',
    originalVsDerived: 'original',
    title: 'Înregistrare audio agresiune verbală și distrugere',
    category: 'audio',
    dateCreated: '24 Aug 2026, 19:15',
    serverTimestamp: 1787600100000,
    deviceTimestamp: 1787600095000,
    mimeType: 'audio/m4a',
    fileSize: '4.8 MB',
    duration: '03:45',
    sha256Hash: 'a8f5f167f44f4964e6c998dee827110c0175ef9892c2a05cf4e12c96a341ac90',
    integrityStatus: 'verified',
    technicalMetadata: {
      audioCodec: 'AAC 128kbps / 48kHz',
      deviceModel: 'Direct Secure Mic',
      exifPreserved: true,
      storageLayer: 'aes256_gcm_vault'
    },
    source: 'direct_microphone',
    coordinates: { lat: 44.4321, lng: 26.0892 },
    uploaderUserId: 'usr-victim-001',
    uploaderRole: 'victim',
    isEncrypted: true,
    description: 'Înregistrare în care agresorul sparge veselă și amenință explicit victima în domiciliu.',
    tags: ['Agresiune verbală', 'Distrugere', 'Probă audio'],
    eidasTimestampStatus: 'qualified_timestamp_embedded'
  },
  {
    id: 'ev-003',
    evidenceId: 'EV-2026-0819-C882',
    caseId: 'SCUT-RO-2026-B0892',
    originalVsDerived: 'original',
    title: 'Certificat Medico-Legal Preliminar (INML Mina Minovici)',
    category: 'medical_cert',
    dateCreated: '19 Aug 2026, 11:30',
    serverTimestamp: 1787139000000,
    deviceTimestamp: 1787138980000,
    mimeType: 'application/pdf',
    fileSize: '1.8 MB',
    sha256Hash: 'f4560731a5c68b753c52a0a2df3d8544c7952a1df70c17a86f9e8023793e2b26',
    integrityStatus: 'verified',
    technicalMetadata: {
      deviceModel: 'INML Digital Gateway',
      exifPreserved: true,
      storageLayer: 'immutable_cold_storage'
    },
    source: 'uploaded_file',
    uploaderUserId: 'usr-inml-04',
    uploaderRole: 'forensic_inml',
    isEncrypted: true,
    description: 'Constatare leziuni traumatice antebraț și echimoze toracice, 4-5 zile îngrijiri medicale.',
    tags: ['INML', 'Certificat medical', 'Leziuni fizice'],
    eidasTimestampStatus: 'qualified_timestamp_embedded'
  },
  {
    id: 'ev-004',
    evidenceId: 'EV-2026-0815-D301',
    caseId: 'SCUT-RO-2026-B0892',
    originalVsDerived: 'original',
    title: 'Notă incident: blocare acces la fonduri și chei',
    category: 'incident_log',
    dateCreated: '15 Aug 2026, 08:00',
    serverTimestamp: 1786780800000,
    deviceTimestamp: 1786780800000,
    mimeType: 'text/plain',
    fileSize: '12 KB',
    sha256Hash: '7d793037a0760186574b0282f2f435e7b1e50774690f69799f935d902a7818e6',
    integrityStatus: 'verified',
    technicalMetadata: {
      deviceModel: 'SCUT Encrypted Vault Journal',
      exifPreserved: true,
      storageLayer: 'aes256_gcm_vault'
    },
    source: 'triage_session',
    uploaderUserId: 'usr-victim-001',
    uploaderRole: 'victim',
    isEncrypted: true,
    description: 'Reținere forțată a cardului bancar de salariu și încuierea ușii pentru a împiedica plecarea la serviciu.',
    tags: ['Violență economică', 'Sechestrare parțială', 'Jurnal'],
    eidasTimestampStatus: 'simulated_pkcs7'
  },
  {
    id: 'ev-005',
    evidenceId: 'EV-2026-0829-DER-01',
    caseId: 'SCUT-RO-2026-B0892',
    originalVsDerived: 'derived',
    parentEvidenceId: 'ev-001',
    title: 'Extras Anonimizat Mesaje pentru Instanță (Versiune Derivată)',
    category: 'screenshot',
    dateCreated: '29 Aug 2026, 14:10',
    serverTimestamp: 1788012600000,
    deviceTimestamp: 1788012600000,
    mimeType: 'image/png',
    fileSize: '1.1 MB',
    sha256Hash: 'c9f82637a82914ba74b0282f2f435e7b1e50774690f69799f935d902a7811122',
    integrityStatus: 'verified',
    technicalMetadata: {
      fileDimensions: '1170x2532 px',
      deviceModel: 'SCUT Legal Redactor',
      exifPreserved: false,
      storageLayer: 'aes256_gcm_vault'
    },
    source: 'uploaded_file',
    uploaderUserId: 'usr-lawyer-003',
    uploaderRole: 'lawyer',
    isEncrypted: true,
    isDerivedAnnotated: true,
    description: 'Versiune de lucru derivată cu numerele de telefon ale terților mascate pentru depunerea la dosar.',
    tags: ['Versiune derivată', 'Anonimizat', 'Instanță'],
    eidasTimestampStatus: 'simulated_pkcs7'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    caseId: 'SCUT-RO-2026-B0892',
    date: '28 Aug 2026',
    time: '21:30',
    timestamp: 1787952600000,
    title: 'Amenințări verbale repetate și blocare ieșire',
    category: 'threat',
    description: 'Agresorul a blocat ușa de la intrare timp de 45 de minute, adresând amenințări cu moartea dacă victima apelează la poliție.',
    location: 'București, Sector 1 (Domiciliu comun)',
    witnesses: ['Vecin ap. 14 (declarație disponibilă)'],
    associatedEvidenceIds: ['ev-001'],
    verifiedIntegrity: true,
    eidasTimestampAvailable: true,
    severity: 'critic'
  },
  {
    id: 'inc-002',
    caseId: 'SCUT-RO-2026-B0892',
    date: '26 Aug 2026',
    time: '18:45',
    timestamp: 1787768700000,
    title: 'Intervenție Echipaj Poliție și Emitere OPP',
    category: 'police_intervention',
    description: 'Echipajul Secției 1 Poliție a intervenit în urma apelului la 112. A completat formularul de risc (scor 18/20) și a emis Ordinul de Protecție Provizoriu pentru 5 zile.',
    location: 'București, Sector 1',
    witnesses: ['Agent principal I. Dumitrescu', 'Agent M. Stan'],
    associatedEvidenceIds: ['ev-002'],
    verifiedIntegrity: true,
    eidasTimestampAvailable: true,
    severity: 'critic'
  },
  {
    id: 'inc-003',
    caseId: 'SCUT-RO-2026-B0892',
    date: '19 Aug 2026',
    time: '09:15',
    timestamp: 1787130900000,
    title: 'Agresiune fizică la domiciliu și examinare INML',
    category: 'physical_violence',
    description: 'Episod de violență fizică soldat cu leziuni contuzive la nivelul brațelor și toracelui. Victima s-a prezentat la INML.',
    location: 'Str. Victoriei, Sector 1',
    associatedEvidenceIds: ['ev-003'],
    verifiedIntegrity: true,
    eidasTimestampAvailable: true,
    severity: 'critic'
  },
  {
    id: 'inc-004',
    caseId: 'SCUT-RO-2026-B0892',
    date: '15 Aug 2026',
    time: '08:00',
    timestamp: 1786780800000,
    title: 'Restricționare fonduri și confiscare chei',
    category: 'economic_abuse',
    description: 'Reținerea cardului de salariu și a cheilor locuinței.',
    location: 'Domiciliu',
    associatedEvidenceIds: ['ev-004'],
    verifiedIntegrity: true,
    eidasTimestampAvailable: false,
    severity: 'moderat'
  }
];

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'ch-001',
    nameOrAlias: 'M. P. Jr. (Băiat)',
    age: 6,
    relationship: 'Fiu',
    schoolOrKindergarten: 'Școala Gimnazială Nr. 17, Sector 1',
    authorizedPersonsToPickUp: ['Mama (M. P.)', 'Elena Popescu (Mătușă)'],
    riskLevel: 'ridicat',
    violenceExposure: 'martor_frecvent',
    specialNeeds: 'Suport psihologic de criză prin DGASPC pentru anxietate',
    involvedInstitutions: ['DGASPC Sector 1', 'Școala Gimnazială Nr. 17'],
    activeMeasures: ['Interdicție apropiere tată la 200m de unitatea școlară', 'Consiliere de specialitate']
  },
  {
    id: 'ch-002',
    nameOrAlias: 'A. P. (Fată)',
    age: 3,
    relationship: 'Fiică',
    schoolOrKindergarten: 'Grădinița Nr. 42',
    authorizedPersonsToPickUp: ['Mama (M. P.)', 'Elena Popescu (Mătușă)'],
    riskLevel: 'ridicat',
    violenceExposure: 'martor_ocazional',
    involvedInstitutions: ['DGASPC Sector 1', 'Grădinița Nr. 42'],
    activeMeasures: ['Protecție extinsă prin Ordinul de Protecție Provizoriu']
  }
];

export const INITIAL_PROTECTION_ORDERS: ProtectionOrder[] = [
  {
    id: 'po-001',
    orderNumber: 'OPP-2026-S1-094',
    issuingAuthority: 'Secția 1 Poliție București',
    type: 'OPP_5_zile',
    issueDate: '26 Aug 2026',
    expiryDate: '31 Aug 2026',
    status: 'expira_in_curand',
    daysUntilExpiry: 1,
    enforcedDistanceMeters: 200,
    protectedPersons: ['Victima (M. P.)', 'Minor M. P. Jr.', 'Minoră A. P.'],
    obligationsImposedOnAggressor: [
      'Evacuarea imediată din locuința comună',
      'Păstrarea distanței minime de 200m față de victimă și copii',
      'Interdicția contactului telefonic sau prin mesaje electronice',
      'Purtarea obligatorie a brățării electronice SIME'
    ],
    electronicBraceletActive: true,
    notes: 'Dosarul de prelungire la 12 luni a fost înaintat către Judecătoria Sector 1 București.'
  },
  {
    id: 'po-002',
    orderNumber: 'DOSAR-JUD-2026-11892',
    issuingAuthority: 'Judecătoria Sector 1 București',
    type: 'OP_judecatoresc_12_luni',
    issueDate: 'În procedură de judecată (Termen: 31 Aug 2026)',
    expiryDate: '31 Aug 2027 (Estimată)',
    status: 'prelungire_analizata',
    daysUntilExpiry: 365,
    enforcedDistanceMeters: 500,
    protectedPersons: ['Victima (M. P.)', 'Minor M. P. Jr.', 'Minoră A. P.'],
    obligationsImposedOnAggressor: [
      'Evacuare pe o perioadă de 12 luni',
      'Distanță de siguranță 500m',
      'Interzicerea apropierii de grădiniță și școală',
      'Program obligatoriu de consiliere psihologică agresor'
    ],
    electronicBraceletActive: true,
    notes: 'Reprezentare asigurată de Av. Simona Marinescu prin Baroul București.'
  }
];

export const INITIAL_CASES: Case[] = [
  {
    id: 'case-001',
    caseNumber: 'SCUT-RO-2026-B0892',
    status: 'expiring_orders',
    riskLevel: 'CRITIC',
    victimAlias: 'M. P. (București, Sector 1)',
    dateCreated: '15 Aug 2026',
    lastUpdated: '29 Aug 2026, 16:30',
    children: INITIAL_CHILDREN,
    assignedSpecialists: [
      { role: 'police', name: 'Ag. Principal Ion Dumitrescu', institution: 'Secția 1 Poliție', assignedDate: '26 Aug 2026' },
      { role: 'dgaspc', name: 'Inspector Ana Maria Vlădescu', institution: 'DGASPC Sector 1', assignedDate: '26 Aug 2026' },
      { role: 'lawyer', name: 'Av. Simona Marinescu', institution: 'Baroul București Pro-Bono', assignedDate: '27 Aug 2026' },
      { role: 'psychologist', name: 'Dr. Carmen Enache', institution: 'Centrul Maternal ANAIS', assignedDate: '27 Aug 2026' },
      { role: 'forensic_inml', name: 'Dr. Legist M. Voinea', institution: 'INML Mina Minovici', assignedDate: '19 Aug 2026' }
    ],
    activeInstitutions: ['Poliția Română', 'DGASPC Sector 1', 'Baroul București', 'INML Mina Minovici', 'ONG ANAIS'],
    protectionOrdersCount: 2,
    hasActiveBracelet: true,
    summary: 'Risc critic de escaladare. OPP emis pe 26 august cu brățară electronică. Dosar înaintat judecătoriei pentru ordin pe 12 luni. 2 minori asigurați prin DGASPC.',
    pilotRegion: 'Sector 1 București'
  },
  {
    id: 'case-002',
    caseNumber: 'SCUT-RO-2026-CJ-0144',
    status: 'urgent',
    riskLevel: 'CRITIC',
    victimAlias: 'C. I. (Cluj-Napoca)',
    dateCreated: '27 Aug 2026',
    lastUpdated: '29 Aug 2026, 11:20',
    children: [],
    assignedSpecialists: [
      { role: 'police', name: 'Subcomisar R. Pop', institution: 'IPJ Cluj', assignedDate: '27 Aug 2026' },
      { role: 'social_worker', name: 'Asist. Soc. M. Dan', institution: 'DGASPC Cluj', assignedDate: '28 Aug 2026' }
    ],
    activeInstitutions: ['IPJ Cluj', 'DGASPC Cluj', 'Centrul Maternal Cluj'],
    protectionOrdersCount: 1,
    hasActiveBracelet: false,
    summary: 'Episod acut de violență fizică. Victima a fost plasată provizoriu la adăpostul secret DGASPC Cluj. Solicitare OPP în curs de emitere.',
    pilotRegion: 'Cluj-Napoca'
  },
  {
    id: 'case-003',
    caseNumber: 'SCUT-RO-2026-B0721',
    status: 'in_progress',
    riskLevel: 'RIDICAT',
    victimAlias: 'E. T. (București, Sector 2)',
    dateCreated: '10 Aug 2026',
    lastUpdated: '28 Aug 2026, 14:00',
    children: [],
    assignedSpecialists: [
      { role: 'lawyer', name: 'Av. Radu Ionescu', institution: 'Baroul București', assignedDate: '12 Aug 2026' },
      { role: 'psychologist', name: 'Terapeut L. Stanciu', institution: 'Centrul Sens', assignedDate: '15 Aug 2026' }
    ],
    activeInstitutions: ['Baroul București', 'Centrul Sens'],
    protectionOrdersCount: 1,
    hasActiveBracelet: true,
    summary: 'Ordin judecătoresc activ valabil 6 luni. Ședințe de psihoterapie de suport traumă în desfășurare. Nu sunt înregistrate încălcări recente.',
    pilotRegion: 'Sector 2 București'
  },
  {
    id: 'case-004',
    caseNumber: 'SCUT-RO-2026-TM-0089',
    status: 'awaiting_docs',
    riskLevel: 'MODERAT',
    victimAlias: 'D. V. (Timișoara)',
    dateCreated: '20 Aug 2026',
    lastUpdated: '25 Aug 2026, 09:40',
    children: [],
    assignedSpecialists: [
      { role: 'social_worker', name: 'Asist. L. Berinde', institution: 'DGASPC Timiș', assignedDate: '21 Aug 2026' }
    ],
    activeInstitutions: ['DGASPC Timiș'],
    protectionOrdersCount: 0,
    hasActiveBracelet: false,
    summary: 'Se așteaptă raportul de expertiză medico-legală pentru definitivarea cererii de ordin de protecție.',
    pilotRegion: 'Timișoara'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: Date.now() - 1000 * 60 * 35,
    timeString: 'Azi, 15:55',
    actorId: 'usr-lawyer-003',
    actorRole: 'lawyer',
    actorInstitution: 'Baroul București Pro-Bono',
    action: 'view',
    resourceType: 'case',
    resourceId: 'SCUT-RO-2026-B0892',
    description: 'Consultare dosar judiciar pentru redactarea cererii de prelungire OP la Judecătorie.',
    legalBasis: 'Consimțământ victimă #CSNT-889 & Împuternicire Avocațială Seria B/10294',
    ipAddress: '10.24.8.91 (Rețea Securizată Justiție)',
    immutableBlockIndex: 1042
  },
  {
    id: 'aud-002',
    timestamp: Date.now() - 1000 * 60 * 180,
    timeString: 'Azi, 13:30',
    actorId: 'usr-police-101',
    actorRole: 'police',
    actorInstitution: 'Secția 1 Poliție București',
    action: 'integrity_verify',
    resourceType: 'evidence',
    resourceId: 'EV-2026-0828-A492',
    description: 'Verificare integritate SHA-256 probă captură mesaje: Hash verificat cu succes (corespunde originalului).',
    legalBasis: 'Ordonanță verificare mijloace de probă CPP Art. 197',
    ipAddress: '192.168.1.42 (Terminal Dispecerat)',
    immutableBlockIndex: 1041
  },
  {
    id: 'aud-003',
    timestamp: Date.now() - 1000 * 60 * 360,
    timeString: 'Azi, 10:30',
    actorId: 'usr-dgaspc-002',
    actorRole: 'dgaspc',
    actorInstitution: 'DGASPC Sector 1',
    action: 'view',
    resourceType: 'child',
    resourceId: 'ch-001',
    description: 'Actualizare măsuri de securitate la unitatea de învățământ pentru minorul M. P. Jr.',
    legalBasis: 'Legea 272/2004 privind protecția drepturilor copilului',
    immutableBlockIndex: 1040
  },
  {
    id: 'aud-004',
    timestamp: Date.now() - 1000 * 60 * 1440 * 2,
    timeString: '27 Aug 2026, 17:10',
    actorId: 'usr-victim-001',
    actorRole: 'victim',
    actorInstitution: 'Titular Dosar',
    action: 'consent_grant',
    resourceType: 'case',
    resourceId: 'SCUT-RO-2026-B0892',
    description: 'Victima a acordat drept de vizualizare dosar către Av. Simona Marinescu (Baroul București).',
    legalBasis: 'Consimțământ expres RGPD / Legea 217/2003',
    immutableBlockIndex: 1039
  },
  {
    id: 'aud-005',
    timestamp: Date.now() - 1000 * 60 * 1440 * 3,
    timeString: '26 Aug 2026, 19:00',
    actorId: 'usr-police-101',
    actorRole: 'police',
    actorInstitution: 'Secția 1 Poliție',
    action: 'create',
    resourceType: 'protection_order',
    resourceId: 'OPP-2026-S1-094',
    description: 'Înregistrare emitere Ordin de Protecție Provizoriu valabil 5 zile cu monitorizare GPS agresor.',
    legalBasis: 'Legea 217/2003 Art. 22 ind. 1',
    immutableBlockIndex: 1038
  }
];

export const INITIAL_CONSENTS: Consent[] = [
  {
    id: 'csnt-001',
    victimId: 'usr-victim-001',
    grantedToRole: 'lawyer',
    grantedToInstitution: 'Baroul București Pro-Bono',
    grantedToPersonName: 'Av. Simona Marinescu',
    grantedPermissions: ['all_evidence', 'medical_docs', 'timeline', 'children'],
    grantDate: '27 Aug 2026',
    expiryDate: '27 Feb 2027 (6 luni)',
    legalBasis: 'Asistență juridică gratuită pentru susținerea Ordinului de Protecție',
    revocable: true,
    status: 'active'
  },
  {
    id: 'csnt-002',
    victimId: 'usr-victim-001',
    grantedToRole: 'dgaspc',
    grantedToInstitution: 'DGASPC Sector 1',
    grantedToPersonName: 'Inspector Ana Maria Vlădescu',
    grantedPermissions: ['children', 'specific_evidence', 'timeline'],
    specificEvidenceIds: ['ev-001', 'ev-003'],
    grantDate: '26 Aug 2026',
    expiryDate: '26 Aug 2027 (1 an)',
    legalBasis: 'Plan de servicii și securizare minori Legea 272/2004',
    revocable: true,
    status: 'active'
  },
  {
    id: 'csnt-003',
    victimId: 'usr-victim-001',
    grantedToRole: 'psychologist',
    grantedToInstitution: 'Centrul Sens',
    grantedToPersonName: 'Dr. Carmen Enache',
    grantedPermissions: ['medical_docs', 'timeline'],
    grantDate: '27 Aug 2026',
    expiryDate: '27 Nov 2026 (3 luni)',
    legalBasis: 'Consiliere psihologică post-traumă',
    revocable: true,
    status: 'active'
  }
];

export const DEFAULT_SAFETY_PLAN: SafetyPlan = {
  id: 'sp-001',
  trustedPeople: ['Elena Popescu (Soră)', 'Ioana Radu (Prietenă)', 'Av. Simona Marinescu'],
  safeLocation: 'Adăpostul secret DGASPC / Locuința bunicii din județul Ilfov',
  evacuationRoute: 'Scara de serviciu B, ieșire direct în curtea interioară ferită de bulevard',
  emergencyBagItems: [
    { id: 'eb-1', label: 'Buletin identitate & Certificate naștere copii', packed: true, category: 'Acte' },
    { id: 'eb-2', label: 'Bani lichizi de urgență (300 lei ascunși)', packed: true, category: 'Finanțe' },
    { id: 'eb-3', label: 'Card bancar duplicat pe numele meu', packed: true, category: 'Finanțe' },
    { id: 'eb-4', label: 'Chei rezervă mașină și casă prietenă', packed: true, category: 'Acces' },
    { id: 'eb-5', label: 'Încărcător telefon și baterie externă', packed: true, category: 'Electronice' },
    { id: 'eb-6', label: 'Tratament cronic astm copil (2 inhalatoare)', packed: true, category: 'Medical' },
    { id: 'eb-7', label: 'Schimb haine de bază pentru 2 zile (copii)', packed: false, category: 'Esențial' },
    { id: 'eb-8', label: 'Certificat INML și copii după plângeri', packed: true, category: 'Documente' }
  ],
  medicines: 'Ventolin inhalator (pentru minor), analgezice de bază',
  moneyAndCards: 'Bani ascunși în căptușeala genții de rezervă la serviciu',
  keys: 'Set de chei la sora mea Elena',
  transportMethod: 'Taxi comandat din aplicație cu punct de întâlnire la 2 străzi distanță',
  childProtectionPlan: 'Dacă situația devine violentă, copiii merg imediat în camera lor și încuie ușa din interior până sosește poliția',
  petPlan: 'Câinele va fi preluat temporar de vecina Ioana',
  importantNumbers: [
    { label: 'Poliție Urgențe', phone: '112' },
    { label: 'Helpline Național ANES', phone: '0800.500.333' },
    { label: 'Sora Elena', phone: '0722.123.456' },
    { label: 'Avocat Barou', phone: '0730.555.777' }
  ],
  safeCodeWordFamily: 'Trandafir roșu (Semnifică: Sună imediat la 112 și trimite echipaj la mine)',
  safeCodeWordContacts: 'Am uitat cheile (Semnifică: Sunt în pericol, activează planul de sprijin)',
  offlineAvailable: true,
  hiddenFromNormalUI: true
};

export const INITIAL_SAFETY_CHECK_ITEMS: SafetyCheckItem[] = [
  {
    id: 'sc-1',
    category: 'location',
    title: 'Partajare Locație Google Maps & Apple Find My',
    riskDescription: 'Agresorul poate avea acces permanent la coordonatele tale GPS în timp real prin funcția de partajare activată fără acordul tău.',
    howToFixStep: 'Android: Deschide Google Maps -> Poză profil -> Partajare locație -> Elimină persoana. iOS: Deschide Aplicația Găsire (Find My) -> Oameni -> Oprește partajarea.',
    isReviewed: true,
    status: 'safe'
  },
  {
    id: 'sc-2',
    category: 'devices',
    title: 'Sesiuni Active WhatsApp Web, Telegram & Messenger',
    riskDescription: 'Mesajele, fotografiile și apelurile pot fi monitorizate în direct pe un laptop sau alt telefon dacă s-a scanat codul QR al contului.',
    howToFixStep: 'WhatsApp: Setări -> Dispozitive Conectate -> „Deconectează toate dispozitivele”. Telegram: Setări -> Dispozitive -> Încheie toate celelalte sesiuni.',
    isReviewed: false,
    status: 'needs_action'
  },
  {
    id: 'sc-3',
    category: 'trackers',
    title: 'Dispozitive Bluetooth Ascunse (AirTag, SmartTag, Tile)',
    riskDescription: 'Trackere fizice miniaturale pot fi cusute în haine, ascunse în rucsac, cărucior sau sub bancheta mașinii pentru urmărire fizică continuă.',
    howToFixStep: 'Android: Setări -> Siguranță & Urgențe -> „Alerte de urmărire necunoscute” -> Scanează acum. iOS: Verifică notificarea „AirTag Detected Moving With You” și folosește „Play Sound”.',
    isReviewed: false,
    status: 'warning'
  },
  {
    id: 'sc-4',
    category: 'trackers',
    title: 'Aplicații Stalkerware & Permisiuni de Accesibilitate',
    riskDescription: 'Aplicații de spionaj (mSpy, KidsGuard, Cerberus) se deghizează ca utilitare de sistem („Battery Care”, „System Service”) și înregistrează tastele și ecranul.',
    howToFixStep: 'Android: Setări -> Aplicații -> Acces Special -> Aplicații de administrare dispozitiv & Servicii de Accesibilitate -> Dezactivează orice aplicație necunoscută. iOS: Verifică Setări -> General -> VPN și gestionare dispozitive (Profile MDM).',
    isReviewed: false,
    status: 'needs_action'
  },
  {
    id: 'sc-5',
    category: 'accounts',
    title: 'Conturi Partajate & Apple Family Sharing / Google Family Link',
    riskDescription: 'Dacă faci parte dintr-un grup de familie controlat de agresor, acesta poate vedea locația, aplicațiile descărcate și timpul de utilizare.',
    howToFixStep: 'iOS: Setări -> Numele tău (Apple ID) -> Partajare familială -> Părăsește grupul de familie dacă este sigur. Android: Setări -> Google -> Gestionare cont -> Oameni & Partajare.',
    isReviewed: false,
    status: 'warning'
  },
  {
    id: 'sc-6',
    category: 'accounts',
    title: 'Autentificare în 2 Pași (2FA) & Parolă E-mail Principal',
    riskDescription: 'Dacă agresorul deține parola adresei de e-mail sau a contului Apple/Google, poate reseta parolele tuturor celorlalte conturi.',
    howToFixStep: 'Schimbă parola contului de e-mail de pe un dispozitiv sigur (nu cel monitorizat) și activează 2FA cu o aplicație de autentificare (Google Authenticator / Aegis), evitând SMS-urile dacă telefonul e accesibil agresorului.',
    isReviewed: true,
    status: 'safe'
  },
  {
    id: 'sc-7',
    category: 'location',
    title: 'Permisiuni de Locație în Fundal („Permite Mereu”) & Timeline',
    riskDescription: 'Aplicații terțe instalate anterior pot transmite istoricul de deplasare chiar și când ecranul este stins.',
    howToFixStep: 'Setări telefon -> Confidențialitate & Securitate -> Manager Permisiuni -> Locație -> Schimbă permisiunile în „Doar în timp ce utilizezi aplicația” sau „Refuză”. Dezactivează Google Timeline.',
    isReviewed: true,
    status: 'safe'
  },
  {
    id: 'sc-8',
    category: 'backups',
    title: 'Sincronizare Automată Galerie Cloud & Albume Partajate',
    riskDescription: 'Fotografiile normale (vânătăi, capturi de ecran) se pot sincroniza automat în contul comun Google Photos sau iCloud Shared Albums accesat de agresor.',
    howToFixStep: 'Important: În SCUT, toate probele se stochează exclusiv în Sandbox-ul Criptat AES-256 local și nu ajung în galeria foto a telefonului. Nu păstra dovezi în galeria foto publică.',
    isReviewed: true,
    status: 'safe'
  },
  {
    id: 'sc-9',
    category: 'devices',
    title: 'Blocare Ecran, Notificări Confidențiale & Amprente Înregistrate',
    riskDescription: 'Dacă agresorul are amprenta biometrică înregistrată în telefon sau vede previzualizarea notificărilor pe ecranul stins, poate intercepta coduri de securitate.',
    howToFixStep: 'Setări -> Securitate -> Șterge toate amprentele biometrice necunoscute. Schimbă codul PIN în 6 cifre complexe. Setează Notificările pe ecranul de blocare ca „Ascunde conținutul confidențial”.',
    isReviewed: true,
    status: 'safe'
  }
];

export const INITIAL_RESOURCE_PROVIDERS: ResourceProvider[] = [
  {
    id: 'sh-001',
    name: 'Centrul de Primire în Regim de Urgență „Sfânta Maria” (DGASPC)',
    type: 'shelter',
    address: 'Locație Confidențială - Sector 1',
    city: 'București',
    county: 'București',
    phone: '0800.500.333',
    email: 'urgenta.dgaspc1@bucuresti.ro',
    emergency24h: true,
    hasPsychologicalSupport: true,
    schedule: 'Non-Stop 24/7',
    services: ['Cazare de urgență', 'Suport Psihologic Traumă', 'Pază armată 24/7', 'Asistență juridică'],
    coordinates: { lat: 44.4510, lng: 26.0790 },
    capacityStatus: 'available',
    eligibility: 'Victime ale violenței domestice cu sau fără copii minori.',
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
    email: 'contact@asociatia-anais.ro',
    emergency24h: true,
    hasPsychologicalSupport: true,
    schedule: 'Non-Stop 24/7',
    services: ['Adăpost de criză', 'Psihoterapie de grup și individuală', 'Asistență avocat OPP', 'Linie de urgență'],
    coordinates: { lat: 44.4268, lng: 26.1025 },
    capacityStatus: 'available',
    eligibility: 'Femei victime ale violenței domestice și de gen.',
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
    eligibility: 'Sesizări de urgență, emitere OPP.',
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
    eligibility: 'Persoane vătămate fizic.',
    description: 'Examinare medico-legală gratuită sau decontată, eliberare certificat constatator oficial pentru dosarul penal și instanță.'
  },
  ...CLUJ_RESOURCE_PROVIDERS,
  {
    id: 'sh-006',
    name: 'Cabinet Barou Pro-Bono Asistență Juridică Gratuită',
    type: 'court',
    address: 'Strada Academiei Nr. 17',
    city: 'București',
    county: 'București',
    phone: '0730.555.777',
    emergency24h: false,
    hasPsychologicalSupport: false,
    schedule: 'Luni - Vineri: 08:30 - 18:00',
    services: ['Redactare cerere Ordin de Protecție', 'Reprezentare gratuită instanță', 'Consultanță dreptul familiei'],
    coordinates: { lat: 44.4355, lng: 26.0998 },
    capacityStatus: 'available',
    eligibility: 'Victime ale violenței domestice conform Legii 217/2003.',
    description: 'Avocați specializați desemnați din oficiu sau pro-bono pentru susținerea cauzelor de ordin de protecție la Judecătorie.'
  }
];

export const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'ct-001',
    name: 'Elena Popescu (Soră)',
    relationship: 'Soră',
    phone: '+40 722 123 456',
    notifyOnSos: true,
    decoyCodeWord: 'Cafeaua de dimineață a fost confirmată.',
    smsMode: 'decoy',
    includeGpsLocation: true,
    includeBatteryStatus: true,
    receiveSosAlert: true,
    receiveLocationAlert: true,
    lastDispatchedTimestamp: null
  },
  {
    id: 'ct-002',
    name: 'Ioana Radu (Prietenă de încredere)',
    relationship: 'Prietenă',
    phone: '+40 744 987 654',
    notifyOnSos: true,
    decoyCodeWord: 'Am uitat umbrela la birou.',
    smsMode: 'decoy',
    includeGpsLocation: true,
    includeBatteryStatus: true,
    receiveSosAlert: true,
    receiveLocationAlert: true,
    lastDispatchedTimestamp: null
  },
  {
    id: 'ct-003',
    name: 'Av. Simona Marinescu (Asistență Barou)',
    relationship: 'Avocat Barou',
    phone: '+40 730 555 777',
    notifyOnSos: true,
    decoyCodeWord: 'Documentele fiscale sunt pregătite.',
    smsMode: 'direct',
    customMessage: 'ALERTĂ SCUT: Sunt într-o situație de criză iminentă. Transmit poziția mea pentru asistență juridică și sesizare.',
    includeGpsLocation: true,
    includeBatteryStatus: true,
    receiveSosAlert: true,
    receiveLocationAlert: true,
    lastDispatchedTimestamp: null
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

export const PILOT_REGION_CONFIG: PilotRegionConfig = {
  pilotRegionName: 'Regiunea Pilot: Sector 1 București & Cluj-Napoca',
  enabledInstitutionsCount: 12,
  totalInstitutions: 12,
  pilotStatus: 'activ',
  averageTriageMinutes: 4.2,
  averageCaseAllocationHours: 1.8,
  verifiedEvidenceIntegrityRate: 100,
  safetyPlanCoverageRate: 94.5,
  reportedSecurityIncidents: 0
};

export const VERIFIED_STATISTICS: VerifiedStatistic[] = [
  {
    id: 'stat-001',
    metricLabel: 'Cazuri de violență domestică sesizate anual la Poliție',
    value: 'Peste 100.000 sesizări / an',
    source: 'Inspectoratul General al Poliției Române (IGPR) / ANES',
    sourceUrl: 'https://anes.gov.ro',
    year: 2024,
    lastUpdated: '2025'
  },
  {
    id: 'stat-002',
    metricLabel: 'Ordine de Protecție Provizorii (OPP) emise de Poliție',
    value: '13.238 OPP-uri emise',
    source: 'Poliția Română - Raport Anual de Evaluare',
    sourceUrl: 'https://politiaromana.ro',
    year: 2024,
    lastUpdated: '2025'
  },
  {
    id: 'stat-003',
    metricLabel: 'Procentul victimelor care nu declară primul incident din frică',
    value: 'Aprox. 68% din victime',
    source: 'Agenția pentru Drepturi Fundamentale a UE (FRA)',
    sourceUrl: 'https://fra.europa.eu',
    year: 2023,
    lastUpdated: '2024'
  },
  {
    id: 'stat-004',
    metricLabel: 'Timp mediu de reacție asigurat de Sistemul SIME cu Brățară',
    value: '< 7 minute dispecerat 112',
    source: 'Ministerul Afacerilor Interne (MAI) - SIME',
    sourceUrl: 'https://mai.gov.ro',
    year: 2024,
    lastUpdated: '2025'
  }
];

export const CASE_DOSSIER_MOCK: CaseDossierSection[] = [
  {
    id: 'sec-identity',
    title: '1. Date de Identificare & Siguranță',
    authorizedRoles: ['victim', 'police', 'dgaspc', 'lawyer', 'institutional_admin', 'auditor'],
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
    authorizedRoles: ['police', 'lawyer', 'dgaspc', 'institutional_admin', 'auditor'],
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
    authorizedRoles: ['forensic_inml', 'doctor', 'victim', 'police', 'lawyer', 'institutional_admin', 'auditor'],
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
    authorizedRoles: ['psychologist', 'victim', 'institutional_admin'],
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
    authorizedRoles: ['dgaspc', 'social_worker', 'victim', 'lawyer', 'institutional_admin'],
    status: 'actualizat',
    lastUpdated: '28 Aug 2026',
    dataFields: [
      { label: 'Statut Adăpost de Urgență', value: 'Loc rezervat în Centrul „Sfânta Maria” (Cazare + Masă + Asistență)', confidential: false },
      { label: 'Pachet Sprijin Financiar', value: 'Ajutor de urgență pentru chirie temporară aprobat', confidential: false },
      { label: 'Școală/Grădiniță Copii', value: 'Procedură de transfer temporar confidențial în derulare', confidential: true }
    ]
  }
];

export const INITIAL_CASE_TASKS: CaseTask[] = [
  {
    id: 'tsk-001',
    caseId: 'SCUT-RO-2026-B0892',
    title: 'Depunere cerere prelungire Ordin la Judecătoria Sector 1',
    assignedToRole: 'lawyer',
    dueDate: '30 Aug 2026',
    status: 'in_progress'
  },
  {
    id: 'tsk-002',
    caseId: 'SCUT-RO-2026-B0892',
    title: 'Verificare respectare perimetru monitorizare electronică SIME',
    assignedToRole: 'police',
    dueDate: '29 Aug 2026',
    status: 'completed'
  },
  {
    id: 'tsk-003',
    caseId: 'SCUT-RO-2026-B0892',
    title: 'Securizare traseu școlar pentru minor M. P. Jr.',
    assignedToRole: 'dgaspc',
    dueDate: '01 Sept 2026',
    status: 'pending'
  }
];

export const INITIAL_CASE_NOTES: CaseNote[] = [
  {
    id: 'not-001',
    caseId: 'SCUT-RO-2026-B0892',
    authorName: 'Av. Simona Marinescu',
    authorRole: 'lawyer',
    date: '28 Aug 2026, 17:00',
    content: 'Am definitivat extrasul anonimizat al mesajelor de amenințare și l-am atașat la pachetul judiciar.',
    confidentialRoleOnly: false
  },
  {
    id: 'not-002',
    caseId: 'SCUT-RO-2026-B0892',
    authorName: 'Dr. Carmen Enache',
    authorRole: 'psychologist',
    date: '27 Aug 2026, 15:30',
    content: 'Victima a participat la prima ședință de evaluare clinică. Recomandăm evitarea oricărei confruntări directe cu agresorul.',
    confidentialRoleOnly: true
  }
];

// Backward compatibility alias for SheltersMapScreen & CourtExportScreen
export const SHELTERS_LIST = INITIAL_RESOURCE_PROVIDERS;
export const INITIAL_EVIDENCE_ITEMS = INITIAL_EVIDENCE;

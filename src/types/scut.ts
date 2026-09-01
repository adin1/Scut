export type AppMode = 
  | 'phone_home' 
  | 'calculator' 
  | 'biometric_gate'
  | 'scut_home' 
  | 'safety_check'
  | 'safety_plan'
  | 'sos_screen' 
  | 'evidence_vault' 
  | 'timeline_view'
  | 'case_dossier'
  | 'consent_manager'
  | 'triage_help' 
  | 'shelters_map' 
  | 'trusted_contacts' 
  | 'court_export'
  | 'specialist_dashboard'
  | 'admin_pilot'
  | 'duress_weather' 
  | 'quick_exit_decoy';

// 5 Core Conceptual Product Modules
export type ScutModule = 
  | 'scut_safe'       // Protecția și interfața discretă pentru victimă
  | 'scut_evidence'   // Jurnal și seif probatoriu digital securizat
  | 'scut_case'       // Dosarul electronic interinstituțional
  | 'scut_response'   // Triere structurată, alerte și coordonarea intervenției
  | 'scut_court';     // Pachet probatoriu pentru avocat, poliție, procuror sau instanță

// Role-Based Access Control (RBAC) & Attribute-Based Access Control (ABAC)
export type InstitutionalRole = 
  | 'victim'                // Victimă (Titular Dosar)
  | 'ngo_operator'          // Operator ONG specializat
  | 'social_worker'         // Asistent Social Comunitar
  | 'dgaspc'                // DGASPC (Protecția Copilului & Asistență)
  | 'police'                // Poliția Română (112 / Secție / OPP)
  | 'doctor'                // Medic Primar / UPU
  | 'forensic_inml'         // Medicină Legală (INML)
  | 'psychologist'          // Psiholog / Terapeut Traumă
  | 'lawyer'                // Avocat Barou (Pro-Bono / Din Oficiu)
  | 'institutional_admin'   // Administrator Instituțional
  | 'auditor';              // Auditor Conformitate & eIDAS

export interface User {
  id: string;
  email?: string;
  role: InstitutionalRole;
  institutionId?: string;
  institutionName?: string;
  displayName: string;
  badgeNumber?: string;
  mfaEnabled: boolean;
  webAuthnRegistered?: boolean;
  lastLoginAt: number;
}

export interface VictimProfile {
  id: string;
  anonymousAlias: string;
  caseId: string;
  emergencyPin: string;
  duressPin: string;
  safetyCheckCompleted: boolean;
  lastSafetyCheckDate?: string;
  isHighRisk: boolean;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  role: InstitutionalRole;
  institution: string;
  department: string;
  officialEmail: string;
  verifiedCredentialId: string;
  activeAssignedCasesCount: number;
}

export interface Institution {
  id: string;
  name: string;
  type: 'police' | 'dgaspc' | 'inml' | 'hospital' | 'barou' | 'court' | 'ngo' | 'emergency_center';
  county: string;
  pilotRegionId: string;
  isPilotActive: boolean;
  contactEmergencyPhone: string;
  gatewayEndpoint?: string;
}

export type CaseStatus = 
  | 'new'                 // Cazuri noi
  | 'urgent'              // Urgente
  | 'in_progress'         // În lucru
  | 'awaiting_docs'       // Așteaptă documente
  | 'active_orders'       // Ordine active
  | 'expiring_orders'     // Ordine care expiră
  | 'follow_up'           // Follow-up necesar
  | 'closed';             // Cazuri închise

export type RiskLevel = 'CRITIC' | 'RIDICAT' | 'MODERAT' | 'PREVENTIE_SUPORT';

export interface Child {
  id: string;
  nameOrAlias: string;
  age: number;
  relationship: string;
  schoolOrKindergarten: string;
  authorizedPersonsToPickUp: string[];
  riskLevel: 'scazut' | 'mediu' | 'ridicat' | 'critic';
  violenceExposure: 'martor_ocazional' | 'martor_frecvent' | 'tinta_directa' | 'fara_expunere_directa';
  specialNeeds?: string;
  involvedInstitutions: string[];
  activeMeasures: string[];
}

export interface Case {
  id: string;
  caseNumber: string;               // e.g. SCUT-RO-2026-B0892
  status: CaseStatus;
  riskLevel: RiskLevel;
  victimAlias: string;
  dateCreated: string;
  lastUpdated: string;
  children: Child[];
  assignedSpecialists: {
    role: InstitutionalRole;
    name: string;
    institution: string;
    assignedDate: string;
  }[];
  activeInstitutions: string[];
  protectionOrdersCount: number;
  hasActiveBracelet: boolean;
  summary: string;
  pilotRegion: string;
}

export interface CaseParticipant {
  id: string;
  caseId: string;
  userId: string;
  role: InstitutionalRole;
  grantedBy: 'victim_consent' | 'court_order' | 'break_glass' | 'police_opp';
  accessGrantedAt: number;
  accessExpiresAt?: number;
}

export interface Incident {
  id: string;
  caseId?: string;
  date: string;
  time: string;
  timestamp: number;
  title: string;
  category: 
    | 'physical_violence' 
    | 'threat' 
    | 'verbal_abuse' 
    | 'stalking' 
    | 'economic_abuse' 
    | 'protection_order_violation' 
    | 'medical_injury' 
    | 'police_intervention' 
    | 'dgaspc_referral' 
    | 'witness_statement';
  description: string;
  location?: string;
  witnesses?: string[];
  associatedEvidenceIds: string[];
  verifiedIntegrity: boolean;
  eidasTimestampAvailable: boolean;
  severity: 'critic' | 'ridicat' | 'moderat';
}

export interface Evidence {
  id: string;
  evidenceId?: string;                // e.g. EV-2026-0828-A492
  caseId?: string;
  originalVsDerived?: 'original' | 'derived';
  parentEvidenceId?: string;         // If derived (annotated/resized copy)
  title: string;
  category: 'photo' | 'video' | 'audio' | 'screenshot' | 'message' | 'document' | 'medical_cert' | 'note' | 'incident_log';
  dateCreated?: string;
  date?: string;
  timestamp?: number;
  serverTimestamp?: number;
  deviceTimestamp?: number;
  mimeType?: string;
  fileSize: string;
  sha256Hash: string;
  integrityStatus?: 'verified' | 'failed' | 'pending';
  technicalMetadata?: {
    fileDimensions?: string;
    deviceModel?: string;
    audioCodec?: string;
    exifPreserved: boolean;
    storageLayer: 'aes256_gcm_vault' | 'immutable_cold_storage';
  };
  source?: 'direct_camera' | 'direct_microphone' | 'uploaded_file' | 'triage_session' | 'sms_import';
  coordinates?: { lat: number; lng: number };
  location?: string;
  tamperProofVerified?: boolean;
  uploaderUserId?: string;
  uploaderRole?: InstitutionalRole;
  isEncrypted: boolean;
  description: string;
  tags: string[];
  mediaUrl?: string;
  duration?: string;
  eidasTimestampStatus?: 'qualified_timestamp_embedded' | 'simulated_pkcs7' | 'local_hash_sealed';
  isDerivedAnnotated?: boolean;
}

// Backward compatibility alias
export type EvidenceItem = Evidence;

export interface EvidenceVersion {
  versionId: string;
  evidenceId: string;
  versionNumber: number;
  sha256Hash: string;
  createdDate: string;
  notes: string;
}

export interface EvidenceHash {
  evidenceId: string;
  algorithm: 'SHA-256' | 'SHA-512';
  computedHash: string;
  calculatedAt: number;
  matchesOriginal: boolean;
}

export interface EvidenceTimestamp {
  evidenceId: string;
  timestampUtc: string;
  eidasProvider: string;
  tokenStatus: 'valid' | 'verified';
}

export interface EvidenceAccess {
  id: string;
  evidenceId: string;
  accessedByUserId: string;
  accessedByRole: InstitutionalRole;
  accessedByInstitution: string;
  accessedAt: number;
  accessType: 'view' | 'download_original' | 'generate_derived' | 'court_export' | 'break_glass';
  justification?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  timeString: string;
  actorId: string;
  actorRole: InstitutionalRole;
  actorInstitution: string;
  action: 
    | 'create' 
    | 'view' 
    | 'export' 
    | 'share' 
    | 'break_glass' 
    | 'consent_grant' 
    | 'consent_revoke' 
    | 'integrity_verify' 
    | 'evidence_lock';
  resourceType: 'evidence' | 'case' | 'medical' | 'child' | 'safety_plan' | 'protection_order';
  resourceId: string;
  description: string;
  legalBasis: string;
  ipAddress?: string;
  breakGlassReason?: string;
  immutableBlockIndex: number;
}

export interface Consent {
  id: string;
  victimId: string;
  grantedToRole: InstitutionalRole;
  grantedToInstitution: string;
  grantedToPersonName: string;
  grantedPermissions: Array<
    | 'all_evidence' 
    | 'specific_evidence' 
    | 'medical_docs' 
    | 'location' 
    | 'children' 
    | 'timeline' 
    | 'contacts'
  >;
  specificEvidenceIds?: string[];
  grantDate: string;
  expiryDate: string;
  legalBasis: string;
  revocable: boolean;
  status: 'active' | 'revoked' | 'expired';
}

export interface BreakGlassRequest {
  id: string;
  caseId: string;
  actorName: string;
  actorRole: InstitutionalRole;
  actorInstitution: string;
  mandatoryReason: string;
  legalGrounds: string;
  timestamp: number;
  timeString: string;
  accessedDataScope: string[];
}

export interface SafetyPlan {
  id: string;
  trustedPeople: string[];
  safeLocation: string;
  evacuationRoute: string;
  emergencyBagItems: { id: string; label: string; packed: boolean; category: string }[];
  medicines: string;
  moneyAndCards: string;
  keys: string;
  transportMethod: string;
  childProtectionPlan: string;
  petPlan: string;
  importantNumbers: { label: string; phone: string }[];
  safeCodeWordFamily: string;
  safeCodeWordContacts: string;
  offlineAvailable: boolean;
  hiddenFromNormalUI: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notifyOnSos: boolean;
  decoyCodeWord: string;
  smsMode?: 'decoy' | 'direct' | 'custom';
  customMessage?: string;
  includeGpsLocation?: boolean;
  includeBatteryStatus?: boolean;
  receiveSosAlert: boolean;
  receiveLocationAlert: boolean;
  lastDispatchedTimestamp?: number | null;
}

export interface SOSAlert {
  id: string;
  caseId?: string;
  timestamp: number;
  triggeredBy: 'button_sos' | 'duress_pin' | 'voice_trigger' | 'shake';
  coordinates: { lat: number; lng: number };
  batteryLevel?: number;
  status: 'active' | 'dispatched_contacts' | 'acknowledged_by_support';
  silentMode: boolean;
  notifiedContactsCount: number;
}

export interface RiskAssessment {
  id: string;
  timestamp: number;
  dateString: string;
  responses: Record<string, boolean | string>;
  computedScore: number;                 // e.g. 18/20
  riskLevel: RiskLevel;
  assessorRole: InstitutionalRole;
  notes: string;
  disclaimer: string;                    // "Instrument de sprijin decizional, nu diagnostic sau decizie juridică."
}

export interface ServiceRequest {
  id: string;
  category: 'medical' | 'shelter' | 'legal' | 'psychological' | 'child_support';
  status: 'pending' | 'accepted' | 'in_progress' | 'fulfilled';
  requestedAt: string;
  assignedProviderName: string;
  notes: string;
}

export interface ResourceProvider {
  id: string;
  name: string;
  type: 'shelter' | 'police' | 'hospital' | 'dgaspc' | 'ngo' | 'court' | 'child_service';
  address: string;
  city: string;
  county: string;
  phone: string;
  email?: string;
  emergency24h: boolean;
  hasPsychologicalSupport?: boolean;
  schedule?: string;
  services?: string[];
  coordinates: { lat: number; lng: number };
  capacityStatus?: 'available' | 'limited' | 'confidential';
  eligibility: string;
  description: string;
}

// Backward compatibility alias
export type ShelterLocation = ResourceProvider;

export interface ProtectionOrder {
  id: string;
  orderNumber: string;                 // e.g. OPP-2026-S1-094
  issuingAuthority: string;            // e.g. Secția 1 Poliție București / Judecătoria Sector 1
  type: 'OPP_5_zile' | 'OP_judecatoresc_12_luni';
  issueDate: string;
  expiryDate: string;
  status: 'solicitat' | 'emis' | 'activ' | 'expira_in_curand' | 'incalcat' | 'prelungire_analizata' | 'expirat';
  daysUntilExpiry: number;
  enforcedDistanceMeters: number;      // e.g. 200m or 500m
  protectedPersons: string[];
  obligationsImposedOnAggressor: string[];
  electronicBraceletActive: boolean;
  notes?: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  title: string;
  assignedToRole: InstitutionalRole;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorName: string;
  authorRole: InstitutionalRole;
  date: string;
  content: string;
  confidentialRoleOnly: boolean;
}

export interface CourtExport {
  id: string;
  exportId: string;                    // e.g. PKG-2026-RO-094
  caseId: string;
  exportDate: string;
  generatedBy: string;
  format: 'pdf_a' | 'zip_package' | 'json_manifest' | 'csv_index';
  evidenceCount: number;
  sha256ManifestHash: string;
  title: string;                       // "Pachet probatoriu pregătit pentru transmitere"
  authorizedRecipient: string;
}

export interface NotificationPreference {
  neutralNotificationsEnabled: boolean;
  decoyTitle: string;
  decoyBody: string;
  suppressLockscreenPreview: boolean;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastActive: string;
  isCurrentDevice: boolean;
  compromiseRiskFlag: boolean;
}

export interface SafetyCheckItem {
  id: string;
  category: 'location' | 'accounts' | 'devices' | 'trackers' | 'backups';
  title: string;
  riskDescription: string;
  howToFixStep: string;
  isReviewed: boolean;
  status: 'safe' | 'warning' | 'needs_action';
}

export interface PilotRegionConfig {
  pilotRegionName: string;             // e.g. "Regiunea Pilot Cluj - Sector 1 București"
  enabledInstitutionsCount: number;
  totalInstitutions: number;
  pilotStatus: 'activ' | 'in_configurare';
  averageTriageMinutes: number;
  averageCaseAllocationHours: number;
  verifiedEvidenceIntegrityRate: number;
  safetyPlanCoverageRate: number;
  reportedSecurityIncidents: number;
}

export interface VerifiedStatistic {
  id: string;
  metricLabel: string;
  value: string;
  source: string;
  sourceUrl: string;
  year: number;
  lastUpdated: string;
}

export type BiometricMethod = 'face_id' | 'fingerprint';

export interface BiometricConfig {
  enabled: boolean;
  preferredMethod: BiometricMethod;
  livenessDetection: boolean;
  autoScanOnTransition: boolean;
  duressFingerprintEnabled: boolean;
  hapticFeedback: boolean;
  maxFailedAttempts: number;
}

export interface EmergencySmsConfig {
  autoSmsEnabled: boolean;
  includeGpsCoordinates: boolean;
  includeBatteryStatus: boolean;
  customGlobalSosTemplate: string;
  countdownSecondsBeforeSend: number;
}

export interface DisguisedNotification {
  id: string;
  disguisedTitle: string;
  disguisedBody: string;
  realTitle: string;
  realBody: string;
  category: 'system' | 'weather' | 'store' | 'calendar';
  time: string;
  sender: string;
}

export interface CaseDossierSection {
  id: string;
  title: string;
  authorizedRoles: InstitutionalRole[];
  dataFields: { label: string; value: string; confidential?: boolean }[];
  status: 'complet' | 'in_evaluare' | 'actualizat';
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'counselor' | 'bot';
  text: string;
  time: string;
  isEncrypted?: boolean;
  isAiGenerated?: boolean;
  aiVerificationNotice?: boolean;
}

export interface VoiceTriggerConfig {
  enabled: boolean;
  primaryKeyword: string;
  secondaryKeywords: string[];
  silentMode: boolean;
  recordAudioOnTrigger: boolean;
  dispatch112OnTrigger: boolean;
  notifyContactsOnTrigger: boolean;
  hapticFeedback: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  listenInDisguisedModes: boolean;
  listenInLockScreen: boolean;
}

export interface VoiceTriggerEvent {
  id: string;
  timestamp: number;
  timeString: string;
  keywordDetected: string;
  rawTranscript: string;
  modeAtTrigger: AppMode;
  isSilent: boolean;
  coordinates: { lat: number; lng: number };
  evidenceLoggedId?: string;
  status: 'dispatched_112' | 'contacts_alerted' | 'audio_recording' | 'completed';
}

export type TriageCategory = 'urgent' | 'medical' | 'legal' | 'shelter' | 'psychological' | 'child_support';


export type AppMode = 
  | 'phone_home' 
  | 'calculator' 
  | 'scut_home' 
  | 'sos_screen' 
  | 'evidence_vault' 
  | 'triage_help' 
  | 'shelters_map' 
  | 'trusted_contacts' 
  | 'duress_weather' 
  | 'quick_exit_decoy'
  | 'case_dossier';

export type TriageCategory = 'medical' | 'shelter' | 'legal' | 'psychological';

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'photo' | 'audio' | 'document' | 'note';
  date: string;
  timestamp: number;
  description: string;
  tags: string[];
  fileSize?: string;
  duration?: string;
  mediaUrl?: string;
  sha256Hash: string;
  location?: string;
  isEncrypted: boolean;
  tamperProofVerified: boolean;
}

export interface ShelterLocation {
  id: string;
  name: string;
  type: 'shelter' | 'police' | 'hospital' | 'dgaspc' | 'ngo';
  address: string;
  city: string;
  county: string;
  phone: string;
  emergency24h: boolean;
  coordinates: { lat: number; lng: number };
  capacityStatus?: 'available' | 'limited' | 'confidential';
  description: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notifyOnSos: boolean;
  decoyCodeWord: string;
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
  authorizedRoles: ('victima' | 'politie' | 'dgaspc' | 'medic_inml' | 'psiholog' | 'avocat')[];
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


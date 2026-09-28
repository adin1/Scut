/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  AppMode, 
  EvidenceItem, 
  TrustedContact, 
  DisguisedNotification,
  VoiceTriggerConfig,
  VoiceTriggerEvent,
  BiometricConfig,
  EmergencySmsConfig
} from './types/scut';
import { 
  INITIAL_EVIDENCE, 
  DEFAULT_CONTACTS, 
  DISGUISED_NOTIFICATIONS_CATALOG,
  DEFAULT_VOICE_CONFIG,
  INITIAL_VOICE_EVENTS,
  DEFAULT_BIOMETRIC_CONFIG,
  DEFAULT_EMERGENCY_SMS_CONFIG
} from './data/mockData';
import { computeSha256Hash, deriveVaultKey, encryptVaultText } from './utils/security';
import { useVoiceGuardian } from './hooks/useVoiceGuardian';
import { PhoneFrame } from './components/PhoneFrame';
import { VaultUnlockPrompt } from './components/VaultUnlockPrompt';
import { HomeScreen } from './components/HomeScreen';
import { CalculatorScreen } from './components/CalculatorScreen';
import { BiometricAuthScreen } from './components/BiometricAuthScreen';
import { WeatherDuressScreen } from './components/WeatherDuressScreen';
import { ScutDashboard } from './components/ScutDashboard';
import { SosAlertScreen } from './components/SosAlertScreen';
import { EvidenceJournalScreen } from './components/EvidenceJournalScreen';
import { TriageAssistanceScreen } from './components/TriageAssistanceScreen';
import { SheltersMapScreen } from './components/SheltersMapScreen';
import { TrustedContactsScreen } from './components/TrustedContactsScreen';
import { CaseDossierScreen } from './components/CaseDossierScreen';
import { SafetyCheckScreen } from './components/SafetyCheckScreen';
import { SafetyPlanScreen } from './components/SafetyPlanScreen';
import { ConsentManagerScreen } from './components/ConsentManagerScreen';
import { CourtExportScreen } from './components/CourtExportScreen';
import { SpecialistDashboardScreen } from './components/SpecialistDashboardScreen';
import { QuickExitDecoy } from './components/QuickExitDecoy';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { VoiceTriggerModal } from './components/VoiceTriggerModal';
import { BiometricSettingsModal } from './components/BiometricSettingsModal';

export default function App() {
  // App navigation state
  const [currentMode, setCurrentMode] = useState<AppMode>('phone_home');
  
  // Data state
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(INITIAL_EVIDENCE);
  const [contacts, setContacts] = useState<TrustedContact[]>(DEFAULT_CONTACTS);
  const [notifications, setNotifications] = useState<DisguisedNotification[]>(DISGUISED_NOTIFICATIONS_CATALOG);
  
  // Biometric Security Gate state
  const [biometricConfig, setBiometricConfig] = useState<BiometricConfig>(DEFAULT_BIOMETRIC_CONFIG);

  // Emergency SMS Dispatch Config state
  const [emergencySmsConfig, setEmergencySmsConfig] = useState<EmergencySmsConfig>(DEFAULT_EMERGENCY_SMS_CONFIG);

  // Voice Guardian state
  const [voiceConfig, setVoiceConfig] = useState<VoiceTriggerConfig>(DEFAULT_VOICE_CONFIG);
  const [voiceEvents, setVoiceEvents] = useState<VoiceTriggerEvent[]>(INITIAL_VOICE_EVENTS);
  const [voiceTriggeredKeyword, setVoiceTriggeredKeyword] = useState<string | null>(null);
  const [silentSosToast, setSilentSosToast] = useState<{ keyword: string; timestamp: number } | null>(null);

  // Modals state
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isBiometricSettingsOpen, setIsBiometricSettingsOpen] = useState<boolean>(false);

  // Real AES-256-GCM vault key, derived from a session-only passphrase (never persisted).
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const handleUnlockVault = async (passphrase: string) => {
    const { key } = await deriveVaultKey(passphrase);
    setVaultKey(key);
  };

  // Refs so the voice-trigger handler (created once, before the mic stream or
  // vault key necessarily exist) always reads their latest values without
  // needing to be recreated on every change.
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const vaultKeyRef = useRef<CryptoKey | null>(null);
  useEffect(() => { vaultKeyRef.current = vaultKey; }, [vaultKey]);

  // Records real ambient audio off the already-permitted mic stream and saves
  // it as evidence once done. Runs independently of handleVoiceSOS so the
  // silent-mode UI doesn't block on a 60s recording. Never fabricates a
  // recording if no stream is available.
  const startVoiceTriggerRecording = useCallback((evidenceId: string, keyword: string, triggerMode: AppMode) => {
    const stream = mediaStreamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') return;

    const chunks: Blob[] = [];
    const startedAt = Date.now();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream);
    } catch {
      return;
    }
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      if (chunks.length === 0) return;
      const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      const sha256Hash = await computeSha256Hash(arrayBuffer);
      const plainDescription = `Înregistrare ambientală reală, pornită automat prin detecție vocală („${keyword}”) în timp ce telefonul rula modul: ${triggerMode}.`;

      let description = plainDescription;
      let descriptionIv: string | undefined;
      if (vaultKeyRef.current) {
        const sealed = await encryptVaultText(vaultKeyRef.current, plainDescription);
        description = sealed.ciphertextB64;
        descriptionIv = sealed.ivB64;
      }

      setEvidenceList(prev => [{
        id: evidenceId,
        title: `Înregistrare Audio SOS Declanșată Vocal [„${keyword}”]`,
        date: new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: startedAt,
        category: 'audio',
        fileSize: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: `${Math.round((Date.now() - startedAt) / 1000)}s`,
        sha256Hash,
        description,
        descriptionIv,
        tags: ['SOS Vocal', 'Înregistrare Automată'],
        isEncrypted: Boolean(vaultKeyRef.current),
        tamperProofVerified: true
      }, ...prev]);
    };
    recorder.start();
    setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 60000);
  }, []);

  // Voice SOS Trigger Handler
  const handleVoiceSOS = useCallback(async (keyword: string, transcript: string, isSilent: boolean) => {
    const eventTimestamp = Date.now();
    const evidenceId = `ev-voice-${eventTimestamp}`;
    const hasMic = Boolean(mediaStreamRef.current);
    const willRecord = voiceConfig.recordAudioOnTrigger && hasMic;

    // Best-effort real GPS fix — never a hardcoded/fabricated location.
    let coordinates: { lat: number; lng: number } | undefined;
    if ('geolocation' in navigator) {
      coordinates = await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(undefined),
          { enableHighAccuracy: true, timeout: 4000 }
        );
      });
    }

    // 1. Log Voice Event — status reflects what actually happened, not a promise.
    const newEvent: VoiceTriggerEvent = {
      id: `ve-${eventTimestamp}`,
      timestamp: eventTimestamp,
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keywordDetected: keyword,
      rawTranscript: transcript,
      modeAtTrigger: currentMode,
      isSilent: isSilent,
      coordinates,
      evidenceLoggedId: willRecord ? evidenceId : undefined,
      status: willRecord ? 'audio_recording' : isSilent ? 'completed' : 'dispatched_112'
    };
    setVoiceEvents(prev => [newEvent, ...prev]);

    // 2. Real ambient audio recording (off the mic already permitted for
    // wake-word listening) — only if we actually have a stream to record from.
    if (willRecord) {
      startVoiceTriggerRecording(evidenceId, keyword, currentMode);
    }

    // 3. Dispatch action depending on silent mode
    if (isSilent) {
      // Keep stealth / disguised screen intact and display discreet toast in Dynamic Island
      setSilentSosToast({ keyword, timestamp: eventTimestamp });

      // Also inject a disguised system notification — honest about what the
      // app can and cannot do: it cannot silently call or notify 112 itself.
      const disguisedAck: DisguisedNotification = {
        id: `notif-voice-${eventTimestamp}`,
        disguisedTitle: 'Actualizare Sistem Finalizată',
        disguisedBody: 'Optimizarea memoriei cache s-a încheiat cu succes.',
        realTitle: '🔕 Cuvânt de Cod Detectat — Nimic Trimis Automat',
        realBody: willRecord
          ? 'Se înregistrează audio ambiental real. Nimeni nu a fost notificat automat — deschide SCUT și apasă Sună 112 imediat ce e sigur.'
          : 'Microfonul nu era disponibil, așa că nu s-a înregistrat nimic. Nimeni nu a fost notificat automat — deschide SCUT și apasă Sună 112 imediat ce e sigur.',
        category: 'system',
        time: 'Chiar acum',
        sender: 'Serviciu de Securitate SCUT'
      };
      setNotifications(prev => [disguisedAck, ...prev]);
    } else {
      // Normal SOS mode: transition to the emergency screen
      setVoiceTriggeredKeyword(keyword);
      setCurrentMode('sos_screen');
    }
  }, [currentMode, voiceConfig.recordAudioOnTrigger, startVoiceTriggerRecording]);

  // Initialize Voice Guardian Hook
  const {
    isListening,
    latestTranscript,
    interimTranscript,
    audioLevel,
    simulateVoiceInput,
    activeMediaStream
  } = useVoiceGuardian({
    config: voiceConfig,
    currentMode: currentMode,
    onTriggerSOS: handleVoiceSOS
  });

  useEffect(() => { mediaStreamRef.current = activeMediaStream; }, [activeMediaStream]);


  // Quick exit emergency panic trigger
  const handleQuickExit = () => {
    setCurrentMode('quick_exit_decoy');
  };

  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList(prev => [item, ...prev]);
  };

  const handleAddContact = (contact: TrustedContact) => {
    setContacts(prev => [...prev, contact]);
  };

  const handleUpdateContact = (updated: TrustedContact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleTriggerTestNotif = (notif: DisguisedNotification) => {
    const newNotif = {
      ...notif,
      id: `notif-${Date.now()}`,
      time: 'Chiar acum'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="w-full min-h-screen bg-stone-950 text-stone-100 font-sans">
      <PhoneFrame
        currentMode={currentMode}
        onQuickExit={handleQuickExit}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.length}
        onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
        onQuickVoiceTrigger={(phrase) => simulateVoiceInput(phrase)}
        voiceTriggerEnabled={voiceConfig.enabled}
        voicePrimaryKeyword={voiceConfig.primaryKeyword}
        isVoiceListening={isListening}
        audioLevel={audioLevel}
        silentSosActiveToast={silentSosToast}
        onDismissSilentToast={() => setSilentSosToast(null)}
        onOpenActiveSos={() => {
          setSilentSosToast(null);
          setVoiceTriggeredKeyword(voiceConfig.primaryKeyword);
          setCurrentMode('sos_screen');
        }}
        biometricConfig={biometricConfig}
        onOpenBiometricSettings={() => setIsBiometricSettingsOpen(true)}
      >
        {/* 1. Smartphone Home Launcher */}
        {currentMode === 'phone_home' && (
          <HomeScreen
            onOpenCalculator={() => setCurrentMode('calculator')}
            notifications={notifications}
            onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
          />
        )}

        {/* 2. Disguised Calculator Screen (Phase 1) */}
        {currentMode === 'calculator' && (
          <CalculatorScreen
            onUnlockSuccess={() => {
              if (biometricConfig.enabled) {
                setCurrentMode('biometric_gate');
              } else {
                setCurrentMode('scut_home');
              }
            }}
            onDuressTrigger={() => setCurrentMode('duress_weather')}
            onReturnHome={() => setCurrentMode('phone_home')}
          />
        )}

        {/* 2.5 Biometric Security Gate (FaceID / TouchID 2FA) */}
        {currentMode === 'biometric_gate' && (
          <BiometricAuthScreen
            config={biometricConfig}
            onSuccess={() => setCurrentMode('scut_home')}
            onDuressTrigger={() => setCurrentMode('duress_weather')}
            onCancel={() => setCurrentMode('calculator')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 3. Duress Weather Screen (Phase 2) */}
        {currentMode === 'duress_weather' && (
          <WeatherDuressScreen
            onReturnToCalculator={() => setCurrentMode('calculator')}
            onReturnHome={() => setCurrentMode('phone_home')}
            activeMediaStream={activeMediaStream}
            vaultKey={vaultKey}
            onSaveEvidence={handleAddEvidence}
          />
        )}

        {/* 4. SCUT Real Sanctuary Dashboard (Phase 4 Screen 2) */}
        {currentMode === 'scut_home' && (
          <ScutDashboard
            onNavigate={(mode) => setCurrentMode(mode)}
            onQuickExit={handleQuickExit}
            onLockApp={() => setCurrentMode('calculator')}
            onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
            onOpenBiometricSettings={() => setIsBiometricSettingsOpen(true)}
            evidenceCount={evidenceList.length}
            contactsCount={contacts.length}
            voiceTriggerEnabled={voiceConfig.enabled}
            voicePrimaryKeyword={voiceConfig.primaryKeyword}
            biometricConfig={biometricConfig}
          />
        )}

        {/* 5. SOS Active Screen (Phase 4 Screen 3) */}
        {currentMode === 'sos_screen' && (
          <SosAlertScreen
            onBack={() => {
              setVoiceTriggeredKeyword(null);
              setCurrentMode('scut_home');
            }}
            onQuickExit={handleQuickExit}
            voiceTriggeredKeyword={voiceTriggeredKeyword}
            contacts={contacts}
            emergencySmsConfig={emergencySmsConfig}
          />
        )}

        {/* 6. Evidence Vault Screen (Phase 4 Screen 4) */}
        {currentMode === 'evidence_vault' && (
          vaultKey ? (
            <EvidenceJournalScreen
              evidenceList={evidenceList}
              onAddEvidence={handleAddEvidence}
              onBack={() => setCurrentMode('scut_home')}
              onQuickExit={handleQuickExit}
              vaultKey={vaultKey}
            />
          ) : (
            <VaultUnlockPrompt onUnlock={handleUnlockVault} />
          )
        )}

        {/* 7. Triage & Assistance Screen (Phase 4 Screen 5) */}
        {currentMode === 'triage_help' && (
          <TriageAssistanceScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
            onNavigateToShelters={() => setCurrentMode('shelters_map')}
          />
        )}

        {/* 8. Shelters Map Screen */}
        {currentMode === 'shelters_map' && (
          <SheltersMapScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 9. Trusted Contacts Screen */}
        {currentMode === 'trusted_contacts' && (
          <TrustedContactsScreen
            contacts={contacts}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            emergencySmsConfig={emergencySmsConfig}
            onUpdateEmergencySmsConfig={setEmergencySmsConfig}
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 10. Single Electronic Case File */}
        {currentMode === 'case_dossier' && (
          <CaseDossierScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 11. Safety Check (Device Security Audit & Anti-Spyware) */}
        {currentMode === 'safety_check' && (
          <SafetyCheckScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 12. Safety Plan (Offline Checklists, Emergency Bag & Codewords) */}
        {currentMode === 'safety_plan' && (
          <SafetyPlanScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 13. Consent Manager & Break-Glass Audit */}
        {currentMode === 'consent_manager' && (
          <ConsentManagerScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 14. Court Export (Judicial Packets PDF/A & ZIP) */}
        {currentMode === 'court_export' && (
          <CourtExportScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
            evidenceList={evidenceList}
          />
        )}

        {/* 15. Specialist Dashboard (Multi-Institutional Workspaces) */}
        {currentMode === 'specialist_dashboard' && (
          <SpecialistDashboardScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
            onNavigateToCourtExport={() => setCurrentMode('court_export')}
          />
        )}

        {/* 16. Quick Exit Decoy Screen (Google / News) */}
        {currentMode === 'quick_exit_decoy' && (
          <QuickExitDecoy
            onReturnToCalculator={() => setCurrentMode('calculator')}
            onReturnHome={() => setCurrentMode('phone_home')}
          />
        )}
      </PhoneFrame>

      {/* Voice Trigger Configuration & Testing Modal */}
      <VoiceTriggerModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        config={voiceConfig}
        onUpdateConfig={(newConfig) => setVoiceConfig(newConfig)}
        voiceEvents={voiceEvents}
        isListening={isListening}
        audioLevel={audioLevel}
        latestTranscript={latestTranscript}
        interimTranscript={interimTranscript}
        onSimulateVoicePhrase={(phrase) => simulateVoiceInput(phrase)}
        activeScreenMode={currentMode}
      />


      {/* Full Architecture & Specifications Modal (Phases 1-4) */}
      <ArchitectureDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Biometric 2FA Configuration Modal */}
      <BiometricSettingsModal
        isOpen={isBiometricSettingsOpen}
        onClose={() => setIsBiometricSettingsOpen(false)}
        config={biometricConfig}
        onUpdateConfig={(newConfig) => setBiometricConfig(newConfig)}
        onLaunchTestGate={() => {
          setIsBiometricSettingsOpen(false);
          setCurrentMode('biometric_gate');
        }}
      />

      {/* Disguised Notifications Testing Lab */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onTriggerTestNotif={handleTriggerTestNotif}
      />
    </div>
  );
}


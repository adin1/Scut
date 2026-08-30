/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
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
import { generateSha256Hash } from './utils/security';
import { useVoiceGuardian } from './hooks/useVoiceGuardian';
import { PhoneFrame } from './components/PhoneFrame';
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

  // Voice SOS Trigger Handler
  const handleVoiceSOS = useCallback((keyword: string, transcript: string, isSilent: boolean) => {
    const eventTimestamp = Date.now();
    const evidenceId = `ev-voice-${eventTimestamp}`;

    // 1. Log Voice Event
    const newEvent: VoiceTriggerEvent = {
      id: `ve-${eventTimestamp}`,
      timestamp: eventTimestamp,
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keywordDetected: keyword,
      rawTranscript: transcript,
      modeAtTrigger: currentMode,
      isSilent: isSilent,
      coordinates: { lat: 44.4378, lng: 26.0946 },
      evidenceLoggedId: evidenceId,
      status: isSilent ? 'audio_recording' : 'dispatched_112'
    };
    setVoiceEvents(prev => [newEvent, ...prev]);

    // 2. Automatically record sealed tamper-proof audio evidence in vault
    if (voiceConfig.recordAudioOnTrigger) {
      const newAudioEvidence: EvidenceItem = {
        id: evidenceId,
        title: `Înregistrare Audio SOS Declanșată Vocal [„${keyword}”]`,
        date: new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: eventTimestamp,
        category: 'audio',
        fileSize: '1.4 MB',
        duration: '01:00',
        location: 'Str. Victoriei, Sector 1, București',
        sha256Hash: generateSha256Hash(`voice-sos-rec-${eventTimestamp}-${keyword}`),
        description: `Înregistrare ambientală inițiată automat prin detecție vocală („${keyword}”) în timp ce telefonul rula modul: ${currentMode}.`,
        tags: ['SOS Vocal', 'Urgență 112', 'Înregistrare Automată'],
        isEncrypted: true,
        tamperProofVerified: true
      };
      setEvidenceList(prev => [newAudioEvidence, ...prev]);
    }

    // 3. Dispatch action depending on silent mode
    if (isSilent) {
      // Keep stealth / disguised screen intact and display discreet toast in Dynamic Island
      setSilentSosToast({ keyword, timestamp: eventTimestamp });
      
      // Also inject a disguised system notification
      const disguisedAck: DisguisedNotification = {
        id: `notif-voice-${eventTimestamp}`,
        disguisedTitle: 'Actualizare Sistem Finalizată',
        disguisedBody: 'Optimizarea memoriei cache s-a încheiat cu succes.',
        realTitle: '🚨 Dispecerat 112 Notificat (Declanșare Vocală)',
        realBody: `Dispeceratul a recepționat poziția ta și proba audio criptată. Ajutorul este pe drum.`,
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
  }, [currentMode, voiceConfig.recordAudioOnTrigger]);

  // Initialize Voice Guardian Hook
  const {
    isListening,
    latestTranscript,
    interimTranscript,
    audioLevel,
    simulateVoiceInput
  } = useVoiceGuardian({
    config: voiceConfig,
    currentMode: currentMode,
    onTriggerSOS: handleVoiceSOS
  });


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
          <EvidenceJournalScreen
            evidenceList={evidenceList}
            onAddEvidence={handleAddEvidence}
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
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

        {/* 10. Single Electronic Case File (Phase 3) */}
        {currentMode === 'case_dossier' && (
          <CaseDossierScreen
            onBack={() => setCurrentMode('scut_home')}
            onQuickExit={handleQuickExit}
          />
        )}

        {/* 11. Quick Exit Decoy Screen (Google / News) */}
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


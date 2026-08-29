import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceTriggerConfig, AppMode } from '../types/scut';

// Helper to normalize strings for robust keyword matching (handles diacritics, punctuation, spacing)
export function normalizeSpeechText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics (ă->a, ș->s, etc.)
    .replace(/[^a-z0-9\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchKeywordInTranscript(transcript: string, keywords: string[]): string | null {
  const normalizedTranscript = normalizeSpeechText(transcript);
  
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeSpeechText(keyword);
    if (!normalizedKeyword) continue;
    
    // Check if normalized keyword exists as a phrase or substring within the speech
    if (normalizedTranscript.includes(normalizedKeyword)) {
      return keyword;
    }
  }
  return null;
}

interface UseVoiceGuardianProps {
  config: VoiceTriggerConfig;
  currentMode: AppMode;
  onTriggerSOS: (keyword: string, transcript: string, isSilent: boolean) => void;
}

export function useVoiceGuardian({ config, currentMode, onTriggerSOS }: UseVoiceGuardianProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [latestTranscript, setLatestTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [lastTriggerTime, setLastTriggerTime] = useState<number | null>(null);
  const [lastTriggeredKeyword, setLastTriggeredKeyword] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRestartingRef = useRef<boolean>(false);
  const lastTriggerTimestampRef = useRef<number>(0);

  // Compile full list of trigger keywords
  const allKeywords = [
    config.primaryKeyword,
    ...config.secondaryKeywords
  ].filter(Boolean);

  const checkAndFireTrigger = useCallback((transcriptText: string) => {
    if (!config.enabled) return;
    
    // Check debounce (prevent multi-firing within 4 seconds)
    const now = Date.now();
    if (now - lastTriggerTimestampRef.current < 4000) {
      return;
    }

    const matchedKeyword = matchKeywordInTranscript(transcriptText, allKeywords);
    if (matchedKeyword) {
      lastTriggerTimestampRef.current = now;
      setLastTriggerTime(now);
      setLastTriggeredKeyword(matchedKeyword);
      
      // Haptic vibration simulation if supported
      if (config.hapticFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100, 50, 200]);
        } catch {
          // Ignore vibration error
        }
      }

      onTriggerSOS(matchedKeyword, transcriptText, config.silentMode);
    }
  }, [config.enabled, config.silentMode, config.hapticFeedback, allKeywords, onTriggerSOS]);

  // Programmatic simulation method for quick UI testing
  const simulateVoiceInput = useCallback((phrase: string) => {
    setLatestTranscript(phrase);
    setInterimTranscript('');
    checkAndFireTrigger(phrase);
  }, [checkAndFireTrigger]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!config.enabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicPermissionState('unsupported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ro-RO'; // Primary Romanian, also picks up phonetic matches

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionState('granted');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPiece;
          } else {
            interim += transcriptPiece;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          checkAndFireTrigger(interim);
        }

        if (final) {
          setLatestTranscript(final);
          setInterimTranscript('');
          checkAndFireTrigger(final);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setMicPermissionState('denied');
          setIsListening(false);
        } else if (event.error !== 'no-speech') {
          // Restart on non-fatal errors
          if (!isRestartingRef.current && config.enabled) {
            isRestartingRef.current = true;
            setTimeout(() => {
              try {
                if (config.enabled) {
                  recognition.start();
                }
              } catch {}
              isRestartingRef.current = false;
            }, 1000);
          }
        }
      };

      recognition.onend = () => {
        // Continuous listening guard: auto-restart immediately if enabled
        if (config.enabled && !isRestartingRef.current) {
          isRestartingRef.current = true;
          setTimeout(() => {
            try {
              if (config.enabled) {
                recognition.start();
                setIsListening(true);
              }
            } catch {}
            isRestartingRef.current = false;
          }, 300);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (err) {
        // Might throw if already started
      }
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [config.enabled, checkAndFireTrigger]);

  // Audio level analyzer for UI waveform/mic feedback
  useEffect(() => {
    if (!config.enabled) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      return;
    }

    let isCancelled = false;

    const initAudioAnalyser = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isCancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
          }
          animationFrameRef.current = requestAnimationFrame(tick);
        };

        tick();
      } catch (err) {
        // Microphone access might not be granted or blocked
      }
    };

    initAudioAnalyser();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [config.enabled]);

  return {
    isListening,
    micPermissionState,
    latestTranscript,
    interimTranscript,
    audioLevel,
    lastTriggerTime,
    lastTriggeredKeyword,
    allKeywords,
    simulateVoiceInput
  };
}

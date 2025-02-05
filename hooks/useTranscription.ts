import { useState, useEffect, useCallback, useRef } from 'react';
import { TranscriptionSegment, TranscriptionStatus, Summary, Speaker } from '../types';
import { formatTimestamp, generateSummary, removeDuplicates } from '../utils/transcription';
import { useOpenAI } from './useOpenAI';
import { configService } from '../services/configService';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'pss_transcription_data';
const AUTOSAVE_INTERVAL = 5000; // Save every 5 seconds
const MAX_RETRY_ATTEMPTS = 10; // Increased for better continuity
const RETRY_DELAY = 1000; // Reduced for faster recovery
const SEGMENT_UPDATE_INTERVAL = 5000; // Create new segments every 5 seconds
const RECONNECTION_TIMEOUT = 30000; // 30 seconds timeout for reconnection attempts

interface StoredTranscriptionData {
  segments: TranscriptionSegment[];
  startTime: string;
  participants: Speaker[];
  lastSaved: number;
}

export const useTranscription = () => {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [recentText, setRecentText] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker>('A');
  const [startTime] = useState<string>(formatTimestamp(new Date()));
  const [participants] = useState<Speaker[]>(['A', 'B']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef(false);
  const retryAttemptsRef = useRef(0);
  const retryTimeoutRef = useRef<number>();
  const autoSaveIntervalRef = useRef<number>();
  const segmentUpdateIntervalRef = useRef<number>();
  const lastSegmentTimeRef = useRef<number>(0);
  const { sendToOpenAI } = useOpenAI();

  const saveTranscriptionData = useCallback(() => {
    if (segments.length > 0) {
      const dataToSave: StoredTranscriptionData = {
        segments,
        startTime,
        participants,
        lastSaved: Date.now()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving transcription:', error);
      }
    }
  }, [segments, startTime, participants]);

  const loadSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const data: StoredTranscriptionData = JSON.parse(savedData);
        if (Date.now() - data.lastSaved < 24 * 60 * 60 * 1000) {
          return data.segments;
        }
      }
    } catch (error) {
      console.error('Error loading saved transcription:', error);
    }
    return null;
  }, []);

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing saved transcription:', error);
    }
  }, []);

  const createNewSegment = useCallback(() => {
    if (currentTranscriptRef.current.trim()) {
      const newSegment: TranscriptionSegment = {
        text: currentTranscriptRef.current.trim(),
        timestamp: formatTimestamp(new Date()),
        speaker: currentSpeaker,
        id: crypto.randomUUID()
      };
      setSegments(prev => removeDuplicates([...prev, newSegment]));
      currentTranscriptRef.current = '';
      lastSegmentTimeRef.current = Date.now();
    }
  }, [currentSpeaker]);

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore stop errors
      }
      recognitionRef.current.onstart = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current = null;
    }

    if (segmentUpdateIntervalRef.current) {
      clearInterval(segmentUpdateIntervalRef.current);
      segmentUpdateIntervalRef.current = undefined;
    }
  }, []);

  const setupRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatus('error');
      setErrorMessage('Speech recognition is not supported in your browser. Please use Chrome.');
      toast.error('Speech recognition is not supported in your browser. Please use Chrome.');
      return null;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setStatus('recording');
      retryAttemptsRef.current = 0;
      setErrorMessage('');
      setRecentText('');

      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      autoSaveIntervalRef.current = window.setInterval(saveTranscriptionData, AUTOSAVE_INTERVAL);

      if (segmentUpdateIntervalRef.current) {
        clearInterval(segmentUpdateIntervalRef.current);
      }
      segmentUpdateIntervalRef.current = window.setInterval(() => {
        if (currentTranscriptRef.current.trim()) {
          createNewSegment();
        }
      }, SEGMENT_UPDATE_INTERVAL);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      if (currentTranscriptRef.current.trim() || interimTranscriptRef.current.trim()) {
        const finalText = (currentTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();
        if (finalText) {
          currentTranscriptRef.current = finalText;
          createNewSegment();
        }
      }
      
      if (isRecordingRef.current) {
        handleRetry();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (isRecordingRef.current) {
        handleRetry();
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript + ' ';
        }
      }

      interimTranscriptRef.current = interimTranscript;

      if (finalTranscript) {
        currentTranscriptRef.current += finalTranscript;
        
        const now = Date.now();
        const timeSinceLastSegment = now - lastSegmentTimeRef.current;
        
        if (timeSinceLastSegment >= SEGMENT_UPDATE_INTERVAL) {
          createNewSegment();
        }
      }

      setRecentText((currentTranscriptRef.current + interimTranscript).trim());
    };

    return recognition;
  }, [createNewSegment, saveTranscriptionData]);

  const handleRetry = useCallback(() => {
    if (!isRecordingRef.current) return;

    if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
      console.log(`Retrying speech recognition (attempt ${retryAttemptsRef.current + 1}/${MAX_RETRY_ATTEMPTS})`);
      
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = window.setTimeout(() => {
        if (isRecordingRef.current) {
          try {
            cleanupRecognition();
            const newRecognition = setupRecognition();
            if (newRecognition) {
              recognitionRef.current = newRecognition;
              setRecognition(newRecognition);
              newRecognition.start();
              retryAttemptsRef.current = 0;
              setErrorMessage('');
            }
          } catch (error) {
            console.error('Error restarting recognition:', error);
            retryAttemptsRef.current++;
            handleRetry();
          }
        }
      }, RETRY_DELAY);

      setTimeout(() => {
        if (isRecordingRef.current) {
          retryAttemptsRef.current = 0;
        }
      }, RECONNECTION_TIMEOUT);
    } else {
      retryAttemptsRef.current = 0;
      handleRetry();
    }
  }, [cleanupRecognition, setupRecognition]);

  const startTranscription = useCallback(async () => {
    if (status === 'recording') return;

    setErrorMessage('');
    currentTranscriptRef.current = '';
    retryAttemptsRef.current = 0;
    isRecordingRef.current = true;

    const savedSegments = loadSavedData();
    if (savedSegments && savedSegments.length > 0) {
      const shouldContinue = confirm(
        'Press OK to continue the transcript or Cancel to Clear the Prior Transcript.'
      );
      
      if (!shouldContinue) {
        clearSavedData();
        setSegments([]);
        toast.success('Starting fresh transcript');
      } else {
        setSegments(savedSegments);
        toast.success('Continuing previous transcript');
      }
    } else {
      setSegments([]);
    }

    setSummary(null);
    setShowSummary(false);
    setRecentText('');
    
    try {
      cleanupRecognition();
      const newRecognition = setupRecognition();
      if (newRecognition) {
        recognitionRef.current = newRecognition;
        setRecognition(newRecognition);
        await newRecognition.start();
        console.log('Recognition started successfully');
      }
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Failed to start recording. Please try again.');
      setStatus('error');
      isRecordingRef.current = false;
    }
  }, [status, loadSavedData, clearSavedData, cleanupRecognition, setupRecognition]);

  const stopTranscription = useCallback(() => {
    console.log('Stopping transcription...');
    isRecordingRef.current = false;
    setStatus('stopped');

    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = undefined;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }

    createNewSegment();
    cleanupRecognition();
    retryAttemptsRef.current = 0;
    saveTranscriptionData();
    toast.success('Recording stopped');
  }, [saveTranscriptionData, cleanupRecognition, createNewSegment]);

  const toggleSpeaker = useCallback(() => {
    setCurrentSpeaker(prev => prev === 'A' ? 'B' : 'A');
  }, []);

  const generateTranscriptionSummary = useCallback(async () => {
    if (segments.length > 0) {
      const basicSummary = generateSummary(segments, {
        startTime,
        endTime: formatTimestamp(new Date()),
        participants
      });

      const config = configService.loadConfig();
      if (!config?.apiKey) {
        toast.error('Please configure your OpenAI API key first');
        return;
      }

      try {
        const transcriptText = segments
          .map(s => `Speaker ${s.speaker} (${s.timestamp}): ${s.text}`)
          .join('\n');

        await sendToOpenAI(config, transcriptText);
        setSummary(basicSummary);
        setShowSummary(true);
        clearSavedData();
        window.print();
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
        toast.error('Failed to generate AI summary. Using basic summary instead.');
        setSummary(basicSummary);
        setShowSummary(true);
        window.print();
      }
    }
  }, [segments, startTime, participants, sendToOpenAI, clearSavedData]);

  const closeSummary = useCallback(() => {
    setShowSummary(false);
  }, []);

  const setTranscriptSegments = useCallback((newSegments: TranscriptionSegment[]) => {
    setSegments(newSegments);
    saveTranscriptionData();
  }, [saveTranscriptionData]);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      cleanupRecognition();
      
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (segmentUpdateIntervalRef.current) {
        clearInterval(segmentUpdateIntervalRef.current);
      }
    };
  }, [cleanupRecognition]);

  return {
    status,
    segments,
    recentText,
    summary,
    showSummary,
    currentSpeaker,
    errorMessage,
    startTranscription,
    stopTranscription,
    toggleSpeaker,
    generateTranscriptionSummary,
    closeSummary,
    canGenerateSummary: status === 'stopped' && segments.length > 0,
    setTranscriptSegments
  };
};
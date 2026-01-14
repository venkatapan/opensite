import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  /* INIT SPEECH RECOGNITION */
  useEffect(() => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    setRecognition(rec);
  }, []);

  /* TOGGLE LISTENING */
  const toggleListening = useCallback(async () => {
    if (!recognition) {
      alert('Voice search not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        // 🔑 This ensures permission dialog + fixes silent failures
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic permission denied', err);
        setIsListening(false);
      }
    }
  }, [isListening, recognition]);

  /* EVENTS */
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onTranscript(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [recognition, onTranscript]);

  /* ALWAYS RENDER ICON */
  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-colors ${
        isListening
          ? 'bg-red-100 text-red-600'
          : 'hover:bg-gray-100 text-blue-600'
      }`}
      aria-label="Voice Search"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceInput;

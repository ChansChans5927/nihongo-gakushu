import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeech() {
  const [textToSpeechSupported, setTextToSpeechSupported] = useState(false);
  const japaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    setTextToSpeechSupported(true);

    const updateVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => /ja[-_]JP/i.test(v.lang));
      if (jaVoice) {
        japaneseVoiceRef.current = jaVoice;
      }
    };

    updateVoice();
    
    // Chrome and other browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoice;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    try {
      // 1. Clear any pending speak timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 2. Cancel current speech immediately
      window.speechSynthesis.cancel();
      
      // Clean periods from readings (e.g. こお.る -> こおる) to avoid pauses in speech
      const cleanedText = text.replace(/\./g, "");
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85; // Slightly slower for crisp clear listening
      
      // Explicitly assign the Japanese voice if found
      if (japaneseVoiceRef.current) {
        utterance.voice = japaneseVoiceRef.current;
      }
      
      // 3. Delay speak by 250ms to allow cancel() to fully reset the browser's speech engine
      timeoutRef.current = setTimeout(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.speak(utterance);
        }
      }, 250);
    } catch (e) {
      console.error("Text to speech failed:", e);
    }
  }, []);

  return {
    textToSpeechSupported,
    speakJapanese
  };
}


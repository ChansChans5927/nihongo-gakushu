import { useState, useEffect, useCallback } from "react";

export function useSpeech() {
  const [textToSpeechSupported, setTextToSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setTextToSpeechSupported(true);
    }
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    try {
      // Clear previous spoken queues
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85; // Slightly slower for crisp clear listening
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Text to speech failed:", e);
    }
  }, []);

  return {
    textToSpeechSupported,
    speakJapanese
  };
}

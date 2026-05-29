import { useCallback, useRef } from "react";

/**
 * Reliable Japanese TTS hook using server-side Google Translate TTS proxy.
 * Audio is fetched through our Express server (/api/tts) which adds proper
 * headers to avoid Google's referrer blocking, then played via <audio> element.
 * Falls back to Web Speech API (speechSynthesis) if the server proxy fails.
 */
export function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakJapanese = useCallback((text: string) => {
    try {
      const cleanText = text.replace(/[\n\r]/g, " ").trim();
      if (!cleanText) return;

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      // Use our server-side TTS proxy to avoid Google blocking
      const url = `/api/tts?q=${encodeURIComponent(cleanText)}&lang=ja`;

      const audio = new Audio(url);
      audio.playbackRate = 1.2; // Google TTS defaults to a slow pace; speed up slightly
      audioRef.current = audio;

      audio.onended = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      audio.onerror = () => {
        console.warn("Server TTS proxy failed, falling back to speechSynthesis");
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = "ja-JP";
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      audio.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
    } catch (e) {
      console.error("Text to speech failed:", e);
    }
  }, []);

  return {
    textToSpeechSupported: true,
    speakJapanese,
  };
}

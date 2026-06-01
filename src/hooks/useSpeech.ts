import { useCallback, useRef } from "react";

/**
 * Reliable Japanese TTS hook using server-side Google Translate TTS proxy.
 * Audio is fetched through our Express server (/api/tts) which adds proper
 * headers to avoid Google's referrer blocking, then played via <audio> element.
 * Falls back to Web Speech API (speechSynthesis) if the server proxy fails.
 */
export function useSpeech(username?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakJapanese = useCallback((text: string) => {
    try {
      const cleanText = text.replace(/[\n\r]/g, " ").trim();
      if (!cleanText) return;

      // Stop any currently playing audio or speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Read settings from localStorage
      const speedKey = username ? `${username}_ttsSpeed` : "ttsSpeed";
      const genderKey = username ? `${username}_ttsGender` : "ttsGender";
      const ttsSpeed = localStorage.getItem(speedKey) || "normal";
      const ttsGender = localStorage.getItem(genderKey) || "female";

      // Use our server-side TTS proxy to avoid Google blocking
      const url = `/api/tts?q=${encodeURIComponent(cleanText)}&lang=ja&speed=${ttsSpeed}&gender=${ttsGender}`;

      const audio = new Audio(url);
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

          // Fallback speed
          let webRate = 0.85;
          if (ttsSpeed === "slow") webRate = 0.65;
          else if (ttsSpeed === "fast") webRate = 1.1;
          utterance.rate = webRate;

          // Fallback gender
          const voices = window.speechSynthesis.getVoices();
          const jaVoices = voices.filter(v => v.lang.startsWith("ja"));
          if (jaVoices.length > 0) {
            if (ttsGender === "male") {
              const maleVoice = jaVoices.find(v =>
                v.name.toLowerCase().includes("otoya") ||
                v.name.toLowerCase().includes("ichiro") ||
                v.name.toLowerCase().includes("male")
              );
              utterance.voice = maleVoice || jaVoices[1] || jaVoices[0];
            } else {
              const femaleVoice = jaVoices.find(v =>
                v.name.toLowerCase().includes("kyoko") ||
                v.name.toLowerCase().includes("haruka") ||
                v.name.toLowerCase().includes("female")
              );
              utterance.voice = femaleVoice || jaVoices[0];
            }
          }

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
  }, [username]);

  return {
    textToSpeechSupported: true,
    speakJapanese,
  };
}

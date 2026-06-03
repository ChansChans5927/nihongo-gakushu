import express from "express";
import { tts } from "../config.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  const text = req.query.q as string;
  const lang = (req.query.lang as string) || "ja";
  const speed = (req.query.speed as string) || "normal";
  const gender = (req.query.gender as string) || "female";

  if (!text) {
    return res.status(400).json({ error: "Missing q parameter" });
  }

  try {
    let voiceName = "ja-JP-Wavenet-B"; // default female WaveNet
    let ssmlGender = "FEMALE";

    if (gender === "male") {
      voiceName = "ja-JP-Wavenet-C";
      ssmlGender = "MALE";
    }

    let speakingRate = 1.0;
    if (speed === "slow") {
      speakingRate = 0.8;
    } else if (speed === "fast") {
      speakingRate = 1.25;
    }

    const response = await tts.text.synthesize({
      requestBody: {
        input: { text },
        voice: {
          languageCode: "ja-JP",
          name: voiceName,
          ssmlGender: ssmlGender,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: speakingRate,
        },
      },
    });

    if (!response.data.audioContent) {
      throw new Error("No audio content returned from Google TTS");
    }

    const buffer = Buffer.from(response.data.audioContent, "base64");

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=86400", // Cache for 24h
    });
    res.send(buffer);
  } catch (e) {
    console.error("Google Cloud TTS error, falling back to unofficial Translate TTS:", e);
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;

      const response = await fetch(ttsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://translate.google.com/",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Google Translate TTS fallback failed" });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=86400",
      });
      res.send(buffer);
    } catch (fallbackError) {
      console.error("TTS proxy fallback failed:", fallbackError);
      res.status(500).json({ error: "TTS proxy failed" });
    }
  }
});

export default router;

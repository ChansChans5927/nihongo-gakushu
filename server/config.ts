import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";
import webpush from "web-push";
import { Expo } from "expo-server-sdk";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// 1. Initialize Gemini Client (Vertex AI mode to utilize Google Cloud Credits)
export const ai = new GoogleGenAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
  vertexai: true,
});

// 2. Initialize Google Cloud Text-to-Speech Client
const ttsAuth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
export const tts = google.texttospeech({
  version: "v1",
  auth: ttsAuth,
});

// 3. Configure Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:contact@nihongo-gakushu.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}
export { webpush };

// 4. Initialize Expo SDK client
export const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

import { Type } from "@google/genai";
import { ai } from "../config.ts";

export const KANJI_BREAKDOWN_SCHEMA = {
  type: Type.ARRAY,
  description: "Array of sub-parts or radicals comprising this Kanji character",
  items: {
    type: Type.OBJECT,
    properties: {
      component: { type: Type.STRING, description: "The component or radical, e.g. '目' or '儿'" },
      meaning: { type: Type.STRING, description: "Korean explanation or meaning of this component, e.g. '눈 목'" },
      mnemonic: { type: Type.STRING, description: "Highly concise Korean mnemonic visual association storyline, under 1 sentence (maximum 15 words)" }
    },
    required: ["component", "meaning", "mnemonic"]
  }
};

export const RELATED_WORDS_SCHEMA = {
  type: Type.ARRAY,
  description: "Array of exactly 3 relevant study words using this Kanji",
  items: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: "The Japanese word" },
      hiragana: { type: Type.STRING, description: "Hiragana writing" },
      pronunciation: { type: Type.STRING, description: "Korean pronunciation" },
      meaning: { type: Type.STRING, description: "Korean translation" }
    },
    required: ["word", "hiragana", "pronunciation", "meaning"]
  }
};

export const EXAMPLE_SENTENCE_SCHEMA = {
  type: Type.OBJECT,
  description: "One natural educational Japanese sentence",
  properties: {
    japanese: { type: Type.STRING, description: "Japanese sentence" },
    hiragana: { type: Type.STRING, description: "Hiragana layout" },
    pronunciation: { type: Type.STRING, description: "Korean pronunciation" },
    meaning: { type: Type.STRING, description: "Korean translation" }
  },
  required: ["japanese", "hiragana", "pronunciation", "meaning"]
};

export const VOCAB_KANJI_BREAKDOWN_SCHEMA = {
  type: Type.ARRAY,
  description: "Array breakdown of Kanjis contained in this word",
  items: {
    type: Type.OBJECT,
    properties: {
      kanji: { type: Type.STRING, description: "Single Kanji character" },
      meaning: { type: Type.STRING, description: "Korean Hanja name, e.g. 통할 통" },
      mnemonic: { type: Type.STRING, description: "Vivid visual association explanation in Korean (under 2 sentences) deconstructing the components. E.g. '눈(目)으로 사람(儿)이 하는 것은 보는 것이니 볼 견'." }
    },
    required: ["kanji", "meaning", "mnemonic"]
  }
};

export const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  description: "List of multiple choice questions matching the generated vocabulary cards.",
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER, description: "Question ID" },
      type: { type: Type.STRING, description: "One of: meaning, reading, kanji_match, blank_fill" },
      targetWord: { type: Type.STRING, description: "The target word from study cards" },
      questionText: { type: Type.STRING, description: "Question instruction text in Korean" },
      questionSentence: { type: Type.STRING, description: "Sentence with '__blank__' replacing target word (e.g., '本を__blank__。'). For other types, empty string." },
      choices: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 4 choices. Conjugated to match blank context if blank_fill."
      },
      correctIndex: { type: Type.INTEGER, description: "Correct choice index" },
      explanation: { type: Type.STRING, description: "Korean answer explanation" }
    },
    required: ["id", "type", "targetWord", "questionText", "questionSentence", "choices", "correctIndex", "explanation"]
  }
};

// Helper to call NVIDIA NIM API (Gemma 2 27B) as a fallback
async function callNvidiaNIM(prompt: string, systemInstruction: string, schema: any) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured in .env");
  }

  const model = "google/gemma-4-31b-it";
  console.log(`[NVIDIA NIM API] Calling ${model} as fallback...`);

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `${systemInstruction}\nYou MUST return a JSON object that strictly conforms to this JSON Schema:\n${JSON.stringify(schema, null, 2)}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA NIM API failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("NVIDIA NIM API returned empty content");
  }

  console.log(`[NVIDIA NIM API] Raw Response content:\n${content}`);

  return JSON.parse(content.trim());
}

// Unified helper for Gemini calls expecting JSON
export async function callGeminiJSON(prompt: string, systemInstruction: string, schema: any) {
  const models = ["gemini-3.5-flash", "nvidia-nim", "gemini-2.5-flash"];
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const currentModel = models[attempt] || "gemini-2.5-flash";
    try {
      const startTime = Date.now();
      let parsed: any;

      if (currentModel === "nvidia-nim") {
        if (!process.env.NVIDIA_API_KEY) {
          console.log("[Gemini API] Skipping NVIDIA NIM fallback (NVIDIA_API_KEY not configured).");
          attempt++;
          continue;
        }
        parsed = await callNvidiaNIM(prompt, systemInstruction, schema);
        const durationMs = Date.now() - startTime;
        console.log(`[NVIDIA NIM API] Call took ${durationMs}ms`);
      } else {
        console.log(`[Gemini API] Calling ${currentModel} (attempt ${attempt + 1}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });

        const durationMs = Date.now() - startTime;
        console.log(`[Gemini API] Call to ${currentModel} took ${durationMs}ms`);

        const bodyText = response.text || "[]";
        parsed = JSON.parse(bodyText.trim());
      }

      // 보정 로직: 스키마가 Type.ARRAY를 기대하지만 결과가 배열이 아닐 경우
      if (schema && schema.type === Type.ARRAY && !Array.isArray(parsed)) {
        console.log("[callGeminiJSON] Root schema is ARRAY but returned data is an object. Attempting to extract array...");
        // 객체 키 중 배열 타입인 첫 번째 키를 찾음 (예: "cards", "data", "items" 등)
        const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
        if (firstArrayKey) {
          console.log(`[callGeminiJSON] Extracted array from key: ${firstArrayKey}`);
          parsed = parsed[firstArrayKey];
        } else {
          // 배열을 찾을 수 없는 경우 강제로 예외를 던져 다음 시도(gemini-2.5-flash 등)로 넘어가게 함
          throw new Error("Root schema is Type.ARRAY but parsed JSON contains no array fields.");
        }
      }

      return parsed;
    } catch (err: any) {
      attempt++;
      console.warn(`[Gemini API] Call to ${currentModel} failed: ${err.message || err}`);
      
      if (attempt >= maxRetries) {
        throw err;
      }
      
      const delayMs = 2000 * attempt;
      console.log(`[Gemini API] Retrying with next model in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

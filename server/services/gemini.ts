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

// Unified helper for Gemini calls expecting JSON
export async function callGeminiJSON(prompt: string, systemInstruction: string, schema: any) {
  const models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.5-flash"];
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const currentModel = models[attempt] || "gemini-2.5-flash";
    try {
      const startTime = Date.now();
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
      return JSON.parse(bodyText.trim());
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

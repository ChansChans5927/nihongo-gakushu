import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { MongoClient } from "mongodb";
import yts from "yt-search";
import { YoutubeTranscript } from "youtube-transcript";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Initialize Gemini Client (Vertex AI mode to utilize Google Cloud Credits)
const ai = new GoogleGenAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
  vertexai: true,
});

let db: any = null;

// ==========================================
// COMMON SCHEMAS & UTILITIES
// ==========================================

const KANJI_BREAKDOWN_SCHEMA = {
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

const RELATED_WORDS_SCHEMA = {
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

const EXAMPLE_SENTENCE_SCHEMA = {
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

const VOCAB_KANJI_BREAKDOWN_SCHEMA = {
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

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  description: "List of multiple choice questions matching the generated vocabulary cards.",
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER, description: "Question ID" },
      type: { type: Type.STRING, description: "One of: meaning, reading, kanji_match, blank_fill" },
      targetWord: { type: Type.STRING, description: "The target word from study cards" },
      questionText: { type: Type.STRING, description: "Question instruction text in Korean" },
      questionSentence: { type: Type.STRING, description: "Sentence with '__blank__' replacing target word (e.g., '本을__blank__。'). For other types, empty string." },
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
async function callGeminiJSON(prompt: string, systemInstruction: string, schema: any) {
  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const durationMs = Date.now() - startTime;
  console.log(`[Gemini API] Call took ${durationMs}ms`);

  const bodyText = response.text || "[]";
  return JSON.parse(bodyText.trim());
}

// GET Endpoint for TTS proxy — fetches Google Translate TTS audio server-side
// to bypass browser referrer/CORS blocking that causes silent audio.
app.get("/api/tts", async (req, res) => {
  const text = req.query.q as string;
  const lang = (req.query.lang as string) || "ja";

  if (!text) {
    return res.status(400).json({ error: "Missing q parameter" });
  }

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Google TTS request failed" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=86400", // Cache for 24h
    });
    res.send(buffer);
  } catch (e) {
    console.error("TTS proxy error:", e);
    res.status(500).json({ error: "TTS proxy failed" });
  }
});

// POST Endpoint to generate Kanji List
app.post("/api/kanji/generate", async (req, res) => {
  const { count, level, excludeKanji } = req.body;
  const numCount = parseInt(count, 10) || 5;
  const targetLevel = level || "all";
  const excludedList = Array.isArray(excludeKanji) ? excludeKanji : [];

  // Check if Google Cloud Project ID is configured
  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;

  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  try {
    let cachedKanjis: any[] = [];
    if (db) {
      const query: any = {};
      if (targetLevel !== "all") {
        query.jlptLevel = targetLevel;
      }
      if (excludedList.length > 0) {
        query.kanji = { $nin: excludedList };
      }
      try {
        cachedKanjis = await db.collection("kanjis").find(query).toArray();
      } catch (err) {
        console.error("Failed to fetch cached kanjis from MongoDB:", err);
      }
    }

    if (cachedKanjis.length >= numCount) {
      const shuffled = cachedKanjis.sort(() => 0.5 - Math.random());
      const selectedKanjis = shuffled.slice(0, numCount);
      console.log(`[Kanji Gen] Served ${numCount} cards instantly from MongoDB cache.`);
      return res.json({ success: true, source: "mongodb_cache", data: selectedKanjis });
    }

    const missingCount = numCount - cachedKanjis.length;

    let allDbKanjis: string[] = [];
    if (db) {
      try {
        const dbKanjis = await db.collection("kanjis").find({}, { projection: { kanji: 1 } }).toArray();
        allDbKanjis = dbKanjis.map((item: any) => item.kanji);
      } catch (err) {
        console.error("Failed to fetch all DB kanjis for exclusion:", err);
      }
    }
    const fullExcludedList = Array.from(new Set([...excludedList, ...allDbKanjis]));

    const batchSizes: number[] = [];
    let remaining = missingCount;
    while (remaining > 0) {
      const size = Math.min(remaining, 5);
      batchSizes.push(size);
      remaining -= size;
    }

    const batchInstructions = [
      "Focus primarily on common action verbs or everyday item noun words (e.g., 食べる, 行く, 本).",
      "Focus primarily on active words, movement, or basic adjectives and descriptors.",
      "Focus primarily on abstract nouns, relations, timing, or situational words.",
      "Focus primarily on feelings, natural elements, workspace items, or social words."
    ];

    const promises = batchSizes.map(async (size, idx) => {
      const focusHint = batchInstructions[idx % batchInstructions.length];
      const prompt = `
        Create a list of exactly ${size} Japanese Kanji (한자) learning cards for a Korean speaker studying Japanese.
        Target JLPT difficulty level filter: ${targetLevel === "all" ? "A high quality balanced mix of useful JLPT levels from N5 to N1" : `Strictly JLPT ${targetLevel}`} level characters.
        
        Focus hint for this specific small batch of ${size} characters (which MUST be followed to ensure character diversity): ${focusHint}
        
        For each Kanji character, provide concise, creative, and easy-to-remember Korean mnemonics/association stories ("mnemonic" - 외우는 방법).
        To prevent truncation and ensure snappy responses, keep all mnemonics and explanations very brief (maximum 2 concise sentences each).
        
        CRITICAL DUPLICATION CONSTRAINT:
        - Strictly ensure all generated Kanji are globally unique.
        - ABSOLUTELY EXCLUDE the following list of Kanji characters (which the user has already mastered): ${JSON.stringify(fullExcludedList)}. Do not include any of these characters in the response.
        
        CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
        - **Radical Breakdown Accuracy**: Deconstruct the Kanji into its actual visual components. If a part is not a standard Kanji, do NOT map it to an incorrect character (e.g., do NOT map the right side of '拝' to '未'). Describe it directly as a shape (e.g., component: "丰", meaning: "양손을 맞잡은 모양").
        - **Mnemonic Consistency**: The mnemonic story must be strictly consistent with the components in \`radicalsBreakdown\`. Do not mention unrelated characters or meanings (e.g., for '換', use '扌' and '奐'; do NOT mention '황새 황').
        - **Pictorial Explanations**: Describe ancient pictographs or non-standard symbols as visual shapes representing objects or actions rather than forcing a modern character match.

        The prompt matches the book design style:
        - "mnemonic" (외우는 방법): Create extremely intuitive, vivid, and memorable visual association explanations in Korean, but KEEP IT VERY CONCISE (maximum 1-2 short sentences). Describe the components, like "눈(目)으로 사람(儿)이 하는 것은 보는 것이니 볼 견".
        - "meaning": The Korean Hanja definition, format: "뜻 음" (e.g. "볼 견", "날 일", "말할 왈", "보일 시").
        - "onyomi" is the Japanese 音(음독) in Hiragana, "onyomiKorean" is its Korean pronunciation (e.g. "けん" -> "켄").
        - "hunyomi" is the Japanese 訓(훈독) in Hiragana, "hunyomiKorean" is its Korean pronunciation (e.g. "みる" -> "미루").
        - "radicalsBreakdown": Provide an array of constituent components or radicals that form this Kanji. For each component, provide its single character ("component"), its Korean meaning ("meaning", e.g., "눈 목"), and a very brief Korean mnemonic visual association storyline ("mnemonic", e.g., "눈(目)은 사람의 눈모습을 세워서 본뜬 모양") strictly under 1 sentence (maximum 15 words) to help study.
        - Provide exactly 3 high-quality, practical "relatedWords" in Japanese containing the main Kanji. Their pronunciation and meaning should represent common usage (e.g. 발견 - はっけん, 핫켄 - 발견).
        - Provide 1 natural "exampleSentence" utilizing one of the main readings or words.

        Make sure to return absolutely valid JSON following the provided responseSchema precisely.
      `;

      const systemInstruction = "You are an expert Japanese and Kanji language professor who specializes in visual mnemonics, associations, and helping Korean learners master Japanese characters with minimal effort.";
      const schema = {
        type: Type.ARRAY,
        description: "List of Kanji learning cards",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique alphabetic id" },
            kanji: { type: Type.STRING, description: "The single Kanji character" },
            strokeCount: { type: Type.INTEGER, description: "Stroke count as an integer" },
            jlptLevel: { type: Type.STRING, description: "The JLPT level (e.g., N5, N4, N3, N2, N1)" },
            grade: { type: Type.STRING, description: "School grade or level (e.g., 초등 1학년, 상용 한자)" },
            mnemonic: { type: Type.STRING, description: "An intuitive visual association storyboard in Korean (strictly maximum 2 brief sentences, under 40 Korean words)" },
            meaning: { type: Type.STRING, description: "Korean meaning and Hanja reading Name (e.g., 볼 견)" },
            onyomi: { type: Type.STRING, description: "Main Onyomi readings in Hiragana split by comma" },
            onyomiKorean: { type: Type.STRING, description: "Main Onyomi Korean pronunciations split by comma" },
            hunyomi: { type: Type.STRING, description: "Main Hunyomi readings in Hiragana split by comma" },
            hunyomiKorean: { type: Type.STRING, description: "Main Hunyomi Korean pronunciations split by comma" },
            radicalsBreakdown: KANJI_BREAKDOWN_SCHEMA,
            relatedWords: RELATED_WORDS_SCHEMA,
            exampleSentence: EXAMPLE_SENTENCE_SCHEMA
          },
          required: [
            "id", "kanji", "strokeCount", "jlptLevel", "grade", "mnemonic", "meaning",
            "onyomi", "onyomiKorean", "hunyomi", "hunyomiKorean", "relatedWords", "exampleSentence", "radicalsBreakdown"
          ]
        }
      };

      try {
        return await callGeminiJSON(prompt, systemInstruction, schema);
      } catch (parseErr) {
        console.error("Failed to fetch or parse single batch JSON response.", parseErr);
        return [];
      }
    });

    const parsedBatches = await Promise.all(promises);

    // Merge, deduplicate, and save to database
    const newGeneratedCards: any[] = [];
    const seenKanji = new Set<string>();

    for (const batch of parsedBatches) {
      if (Array.isArray(batch)) {
        for (const item of batch) {
          if (item && item.kanji && !seenKanji.has(item.kanji) && !excludedList.includes(item.kanji)) {
            if (item.hunyomi) {
              item.hunyomi = item.hunyomi.replace(/\./g, "");
            }
            seenKanji.add(item.kanji);
            newGeneratedCards.push(item);
          }
        }
      }
    }

    // Cache newly generated kanji cards to DB for future review lookups
    if (db && newGeneratedCards.length > 0) {
      try {
        const ops = newGeneratedCards.map((c: any) => ({
          updateOne: {
            filter: { kanji: c.kanji },
            update: { $set: c },
            upsert: true
          }
        }));
        await db.collection("kanjis").bulkWrite(ops);
        console.log(`[DB Sync] Cached ${newGeneratedCards.length} kanji cards to DB on generation.`);
      } catch (cacheErr) {
        console.error("Failed to cache kanji cards to DB:", cacheErr);
      }
    }

    const mergedData = [...cachedKanjis, ...newGeneratedCards];

    if (mergedData.length === 0) {
      return res.json({ success: false, errorMsg: "한자를 생성하지 못했습니다. 다시 시도해 주세요." });
    }

    res.json({ success: true, source: newGeneratedCards.length > 0 ? "gemini_parallel" : "mongodb_cache", data: mergedData });
  } catch (err) {
    console.error("Gemini API generation error:", err);
    res.json({ success: false, errorMsg: `한자 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to generate Vocabulary List
app.post("/api/vocab/generate", async (req, res) => {
  const { count, level, excludeVocab } = req.body;
  const numCount = parseInt(count, 10) || 5;
  const targetLevel = level || "all";
  const excludedList = Array.isArray(excludeVocab) ? excludeVocab : [];

  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;
  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  try {
    let cachedVocabs: any[] = [];
    if (db) {
      const query: any = {};
      if (targetLevel !== "all") {
        query.jlptLevel = targetLevel;
      }
      if (excludedList.length > 0) {
        query.word = { $nin: excludedList };
      }
      try {
        cachedVocabs = await db.collection("vocabs").find(query).toArray();
      } catch (err) {
        console.error("Failed to fetch cached vocabs from MongoDB:", err);
      }
    }

    // Check if we have enough matching vocab in DB with corresponding quiz questions
    let selectedVocabs: any[] = [];
    let selectedQuizzes: any[] = [];
    let hasAllQuizzes = false;

    if (cachedVocabs.length >= numCount) {
      // Shuffle and take numCount
      const shuffled = cachedVocabs.sort(() => 0.5 - Math.random());
      selectedVocabs = shuffled.slice(0, numCount);

      const vocabWords = selectedVocabs.map(item => item.word);
      try {
        selectedQuizzes = await db.collection("vocab_quizzes").find({ targetWord: { $in: vocabWords } }).toArray();
        hasAllQuizzes = selectedVocabs.every(v => selectedQuizzes.some(q => q.targetWord === v.word));
      } catch (err) {
        console.error("Failed to fetch cached vocab quizzes:", err);
      }
    }

    if (hasAllQuizzes && selectedVocabs.length >= numCount) {
      // Re-index quiz questions for selection
      const formattedQuiz = selectedQuizzes.map((q, idx) => {
        const associatedItem = selectedVocabs.find(item => item.word === q.targetWord);
        return {
          ...q,
          id: idx + 1,
          vocabItem: associatedItem
        };
      });
      console.log(`[Vocab Gen] Served ${numCount} cards & quizzes instantly from MongoDB cache.`);
      return res.json({ success: true, source: "mongodb_cache", data: selectedVocabs, quiz: formattedQuiz });
    }

    // Otherwise, we need to generate the difference
    const missingCount = numCount - selectedVocabs.length;

    // Fetch all vocab words currently in DB to exclude them from AI generation
    let allDbVocabs: string[] = [];
    if (db) {
      try {
        const dbVocabs = await db.collection("vocabs").find({}, { projection: { word: 1 } }).toArray();
        allDbVocabs = dbVocabs.map((item: any) => item.word);
      } catch (err) {
        console.error("Failed to fetch all DB vocabs for exclusion:", err);
      }
    }
    const fullExcludedList = Array.from(new Set([...excludedList, ...allDbVocabs]));

    const batchSizes: number[] = [];
    let remaining = missingCount;
    while (remaining > 0) {
      const size = Math.min(remaining, 5);
      batchSizes.push(size);
      remaining -= size;
    }

    const batchInstructions = [
      "Focus on common daily life verbs and adjectives (e.g. 食べる, 行く, 楽しい).",
      "Focus on nouns related to objects, places, or jobs (e.g. 教室, 銀行, 会社員).",
      "Focus on abstract vocabulary, emotions, or social concepts (e.g. 感謝, 경제, 협력).",
      "Focus on vocabulary related to movement, direction, or time (e.g. 準備, 週末)."
    ];

    const promises = batchSizes.map(async (size, idx) => {
      const focusHint = batchInstructions[idx % batchInstructions.length];
      const prompt = `
        Create a list of exactly ${size} Japanese vocabulary (단어) learning cards for a Korean speaker studying Japanese, AND a corresponding set of exactly ${size} multiple-choice quiz questions to test them.
        Target JLPT difficulty level filter: ${targetLevel === "all" ? "A high quality balanced mix of useful JLPT levels from N5 to N1" : `Strictly JLPT ${targetLevel}`} level characters.
        
        Focus hint for this specific small batch of ${size} words (which MUST be followed to ensure word diversity): ${focusHint}
        
        CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
        - **Radical Breakdown Accuracy**: For each Kanji in \`kanjiBreakdown\`, deconstruct it into its actual visual components. If a part is not a standard Kanji, do NOT map it to an incorrect character (e.g., do NOT map the right side of '拝' to '미'). Describe it directly as a shape (e.g., "양손을 맞잡은 모양").
        - **Mnemonic Consistency**: The mnemonic story for each Kanji must be strictly consistent with its components. Do not mention unrelated characters or meanings (e.g., for '換', use '扌' and '奐'; do NOT mention '황새 황').
        - **Pictorial Explanations**: Describe ancient pictographs or non-standard symbols as visual shapes representing objects or actions rather than forcing a modern character match.

        CRITICAL CONSTRAINTS:
        1. Strictly ensure all generated words contain at least one Kanji (한자) character (e.g., 食べる, 勉強, 銀行). Words containing only Hiragana or Katakana (e.g., 하는, くる, 카메라) are strictly forbidden.
        2. Ensure all generated words are globally unique.
        3. ABSOLUTELY EXCLUDE the following list of Japanese words (which the user has already mastered): ${JSON.stringify(fullExcludedList)}. Do not include any of these words in the response.
        4. CRITICAL QUESTION QUALITY CONSTRAINT:
           - In the "quiz" array, NEVER include the target Japanese Kanji character, its constituent Kanji characters, or the Japanese word anywhere inside the "questionText" or "questionSentence"!
           - For 'kanji_match' type: The questionText MUST follow this exact format: '한국어 뜻이 "[meaning]"인 알맞은 일본어 단어 표기(한자)는 무엇일까요?'. For example, if the word is "教室" (meaning "교실"), the questionText MUST be: '한국어 뜻이 "교실"인 알맞은 일본어 단어 표기(한자)는 무엇일까요?'. Do NOT ask about its constituent kanjis (e.g. '가르칠 교', '집 실') or show their characters, as this exposes the spelling of the answer.
           - Ensure the questionText only describes the target in terms of its Korean meaning, Hiragana/pronunciation, or grammar, without showing the actual Japanese Kanji/word character in the question itself.
        
        For the "data" array:
        - Generate exactly ${size} vocabulary cards (with id, word, hiragana, pronunciation, meaning, jlptLevel, kanjiBreakdown, exampleSentence).
        - Under exampleSentence, provide "japanese", "hiragana", "pronunciation", "meaning". It should be a natural sentence.
        
        For the "quiz" array:
        - Generate exactly ${size} multiple-choice questions (one corresponding to each generated vocabulary card).
        - Distribute different question types: 'meaning', 'reading', 'kanji_match', and 'blank_fill'.
        - CRITICAL RULE FOR "blank_fill" TYPE:
          - Use the generated exampleSentence but replace the target word with "__blank__". For example, if the sentence is "私は毎日新聞를読みます。" and the word is "読む", the questionSentence must be "저는 매일 신문을 __blank__。".
          - The 4 choices MUST be conjugated in the exact same grammatical form to fit the sentence context.
          - The correctIndex is the 0-based index of the correct conjugated choice.
          - The questionText should be: "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?"
        - For 'meaning' type: The questionText asks for the Korean meaning of the Japanese word. Choices are Korean meanings.
        - For 'reading' type: The questionText asks for the pronunciation/reading of the Japanese word. Choices are readings in Hiragana with pronunciation.
        - For 'kanji_match' type: The questionText asks for the correct Japanese word spelling based on its Korean meaning. Choices are base Japanese words.
        
        Make sure to return absolutely valid JSON following the provided responseSchema precisely.
      `;

      const systemInstruction = "You are an expert Japanese and Kanji professor specializing in visual mnemonics, associations, and helping Korean learners master Japanese words and characters.";
      const schema = {
        type: Type.OBJECT,
        properties: {
          data: {
            type: Type.ARRAY,
            description: "List of Japanese vocabulary study cards",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique alphabetic id" },
                word: { type: Type.STRING, description: "The Japanese word containing Kanji" },
                hiragana: { type: Type.STRING, description: "Hiragana reading of the word" },
                pronunciation: { type: Type.STRING, description: "Korean pronunciation phonetics of the word" },
                meaning: { type: Type.STRING, description: "Korean meaning" },
                jlptLevel: { type: Type.STRING, description: "The JLPT level (e.g., N5, N4, N3, N2, N1)" },
                kanjiBreakdown: VOCAB_KANJI_BREAKDOWN_SCHEMA,
                exampleSentence: EXAMPLE_SENTENCE_SCHEMA
              },
              required: [
                "id", "word", "hiragana", "pronunciation", "meaning", "jlptLevel",
                "kanjiBreakdown", "exampleSentence"
              ]
            }
          },
          quiz: QUIZ_SCHEMA
        },
        required: ["data", "quiz"]
      };

      try {
        return await callGeminiJSON(prompt, systemInstruction, schema);
      } catch (parseErr) {
        console.error("Failed to fetch or parse single vocab batch JSON response.", parseErr);
        return { data: [], quiz: [] };
      }
    });

    const parsedBatches = await Promise.all(promises);

    const newGeneratedVocabs: any[] = [];
    const newGeneratedQuizzes: any[] = [];
    const seenWords = new Set<string>();

    for (const batch of parsedBatches) {
      if (batch && Array.isArray(batch.data)) {
        for (const item of batch.data) {
          if (item && item.word && !seenWords.has(item.word) && !excludedList.includes(item.word)) {
            seenWords.add(item.word);
            newGeneratedVocabs.push(item);
          }
        }
      }
      if (batch && Array.isArray(batch.quiz)) {
        for (const q of batch.quiz) {
          newGeneratedQuizzes.push(q);
        }
      }
    }

    // Filter new quizzes to only keep those whose target words were actually kept
    const keptQuizzes = newGeneratedQuizzes.filter(q => seenWords.has(q.targetWord));



    const mergedData = [...selectedVocabs, ...newGeneratedVocabs];
    let mergedQuiz = [...selectedQuizzes, ...keptQuizzes];

    // Filter quiz to only contain questions for words that were actually kept
    mergedQuiz = mergedQuiz.filter(q => seenWords.has(q.targetWord));

    // Re-index quiz questions
    mergedQuiz = mergedQuiz.map((q, idx) => {
      const associatedItem = mergedData.find(item => item.word === q.targetWord);
      return {
        ...q,
        id: idx + 1,
        vocabItem: associatedItem
      };
    });

    if (mergedData.length === 0) {
      return res.json({ success: false, errorMsg: "일본어 단어를 생성하지 못했습니다. 다시 시도해 주세요." });
    }

    // Cache newly generated vocab cards and quizzes to DB immediately
    if (db && newGeneratedVocabs.length > 0) {
      try {
        const vocabOps = newGeneratedVocabs.map((c: any) => ({
          updateOne: {
            filter: { word: c.word },
            update: { $set: c },
            upsert: true
          }
        }));
        await db.collection("vocabs").bulkWrite(vocabOps);
        console.log(`[DB Sync] Cached ${newGeneratedVocabs.length} vocab cards to DB on generation.`);

        if (keptQuizzes.length > 0) {
          const quizOps = keptQuizzes.map((q: any) => ({
            updateOne: {
              filter: { targetWord: q.targetWord, type: q.type },
              update: { $set: q },
              upsert: true
            }
          }));
          await db.collection("vocab_quizzes").bulkWrite(quizOps);
          console.log(`[DB Sync] Cached ${keptQuizzes.length} vocab quizzes to DB on generation.`);
        }
      } catch (cacheErr) {
        console.error("Failed to cache vocab data to DB:", cacheErr);
      }
    }

    res.json({ success: true, source: "gemini_parallel", data: mergedData, quiz: mergedQuiz });
  } catch (err) {
    console.error("Gemini API vocab generation error:", err);
    res.json({ success: false, errorMsg: `일본어 단어 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});

app.post("/api/jlpt/generate", async (req, res) => {
  const { level: targetLevel, count: numQuestions } = req.body;
  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;
  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  try {
    const batchSizes: number[] = [];
    let remaining = numQuestions;
    while (remaining > 0) {
      const size = Math.min(remaining, 5);
      batchSizes.push(size);
      remaining -= size;
    }

    const jlptBatchFocus = [
      "Focus primarily on 'reading' and 'writing' style questions.",
      "Focus primarily on 'meaning' and 'context_fit' style blanks-filling questions.",
      "Focus on highly practical everyday verbs and vocabulary.",
      "Focus on action-oriented expressions and common conversational vocabulary."
    ];

    const promises = batchSizes.map(async (size, idx) => {
      const focusHint = jlptBatchFocus[idx % jlptBatchFocus.length];
      const prompt = `
        Create exactly ${size} realistic Japanese JLPT exam questions (객관식 기출 및 고빈도 모의고사 형식) for JLPT ${targetLevel} level.
        Each question targets Korean speakers studying Japanese.
        Focus on vocabulary, kanji reading, meaning, and kanji writing that frequently appear in real JLPT exam sessions.

        Focus hint for this specific small batch of ${size} questions (which MUST be followed to ensure question diversity): ${focusHint}

        TYPES OF QUESTIONS TO GENERATE:
        - "reading": Testing target word Kanji reading (요미가나 고르기).
        - "writing": Testing correct Kanji writing for a target Japanese spelling (한자 표기 고르기).
        - "meaning": Testing correct Korean meaning of a specific target Japanese word (뜻 고르기).
        - "context_fit": A blanks-filling grammatical/vocabulary test (문맥 규정 - 알맞은 단어 고르기). For example, "お酒를 飲んで__blank__はいけません" with choices like ["あばれて (暴れて)", "さわいで (騒いで)", "おこって (怒って)", "おどろいて (驚いて)"]. Wrap the blanks with "__blank__" inside "questionSentence".
        
        For each question, provide:
        - "id": a unique string identifier
        - "type": One of: "reading", "writing", "meaning", "context_fit".
        - "level": "${targetLevel}"
        - "questionSentence": A complete, natural Japanese sentence containing the target word under study, e.g. "昨日はいい__天気__でした。" format (wrap target tests with double underscores like '__target__') or "お酒를 飲んで__blank__はいけません。" (for context_fit, use '__blank__').
        - "targetWord": The specific target word being tested (e.g., "天気" or "暴れて").
        - "questionText": The question instruction in Korean, e.g. "빈칸의 __targetWord__의 올바른 뜻/독음/표기를 고르세요." or "문맥상 빈칸에 들어갈 가장 알맞은 단어를 고르세요."
        - "choices": Exactly 4 plausible Japanese options (with reading in parenthesis, e.g., 'てん기 (텐키)').
        - "correctIndex": The 0-based index of the correct answer (from 0 to 3).
        - "translation": High-quality Korean translation of the questionSentence.
        - "explanation": Brief, clear explanation in Korean (strictly maximum 2 concise sentences, under 40 Korean words), explaining why the correct answer is right and why other options are wrong.

        To prevent response chunk truncation on high question counts, KEEP ALL TRANSLATIONS AND EXPLANATIONS VERY CONCISE.
        Make sure to return absolutely valid JSON following the provided responseSchema precisely.
      `;

      const systemInstruction = "You are an expert Japanese professor specializing in creating highly accurate JLPT mock exam questions tailored for Korean learners.";
      const schema = {
        type: Type.ARRAY,
        description: "List of JLPT exam questions",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique string id" },
            type: { type: Type.STRING, description: "One of: reading, writing, meaning, context_fit" },
            level: { type: Type.STRING, description: "JLPT Level (N5, N4, N3, N2, N1)" },
            questionSentence: { type: Type.STRING, description: "Japanese sentence containing the bolded __target__ word or __blank__" },
            targetWord: { type: Type.STRING, description: "The target word tested" },
            questionText: { type: Type.STRING, description: "Exam question text in Korean" },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 4 choices"
            },
            correctIndex: { type: Type.INTEGER, description: "0-based correct answer index" },
            translation: { type: Type.STRING, description: "Korean translation" },
            explanation: { type: Type.STRING, description: "Highly concise Korean explanation (strictly maximum 2 brief sentences, under 40 Korean words)" }
          },
          required: [
            "id", "type", "level", "questionSentence", "targetWord", "questionText",
            "choices", "correctIndex", "translation", "explanation"
          ]
        }
      };

      try {
        return await callGeminiJSON(prompt, systemInstruction, schema);
      } catch (parseErr) {
        console.error("Failed to fetch or parse single batch JLPT question JSON response.", parseErr);
        return [];
      }
    });

    const parsedBatches = await Promise.all(promises);

    const mergedData: any[] = [];
    const seenSentences = new Set<string>();

    for (const batch of parsedBatches) {
      if (Array.isArray(batch)) {
        for (const item of batch) {
          if (item && item.questionSentence && !seenSentences.has(item.questionSentence)) {
            seenSentences.add(item.questionSentence);
            mergedData.push(item);
          }
        }
      }
    }

    if (mergedData.length === 0) {
      return res.json({ success: false, errorMsg: "JLPT 문제를 생성하지 못했습니다. 다시 시도해 주세요." });
    }
    res.json({ success: true, source: "gemini_parallel", data: mergedData });
  } catch (err) {
    console.error("Gemini API JLPT generation error:", err);
    res.json({ success: false, errorMsg: `JLPT 문제 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});


// Password encryption helper functions (Salt + PBKDF2)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === checkHash;
  } catch (err) {
    return false;
  }
}

// POST Endpoint for User Registration
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.json({ success: false, errorMsg: "아이디와 비밀번호를 모두 입력해 주세요." });
  }

  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const existingUser = await db.collection("users").findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.json({ success: false, errorMsg: "이미 존재하는 아이디입니다." });
    }

    const hashedPassword = hashPassword(password.trim());
    await db.collection("users").insertOne({
      username: normalizedUsername,
      displayName: username.trim(),
      password: hashedPassword,
      createdAt: new Date()
    });

    res.json({ success: true, user: { username: username.trim() } });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.json({ success: false, errorMsg: `회원가입 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint for User Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.json({ success: false, errorMsg: "아이디와 비밀번호를 모두 입력해 주세요." });
  }

  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await db.collection("users").findOne({ username: normalizedUsername });
    if (!user || !verifyPassword(password.trim(), user.password)) {
      return res.json({ success: false, errorMsg: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    res.json({ success: true, user: { username: user.displayName } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.json({ success: false, errorMsg: `로그인 중 오류가 발생했습니다: ${err.message}` });
  }
});

// GET Endpoint to fetch user progress
app.get("/api/progress/get", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.json({ success: false, errorMsg: "사용자 정보가 필요합니다." });
  }

  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = String(username).trim().toLowerCase();
    const progress = await db.collection("progress").findOne({ username: normalizedUsername });
    res.json({
      success: true,
      masteredKanjis: progress?.masteredKanjis || [],
      masteredVocabs: progress?.masteredVocabs || []
    });
  } catch (err: any) {
    console.error("Get progress error:", err);
    res.json({ success: false, errorMsg: `진행률을 가져오는 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to save user progress
app.post("/api/progress/save", async (req, res) => {
  const { username, type, items, cardDetails, quizDetails } = req.body;
  if (!username || !type || !Array.isArray(items)) {
    return res.json({ success: false, errorMsg: "올바르지 않은 요청 데이터입니다." });
  }

  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "masteredKanjis" : "masteredVocabs";

    // 1. Save mastered item IDs to user progress
    await db.collection("progress").updateOne(
      { username: normalizedUsername },
      { $addToSet: { [field]: { $each: items } } },
      { upsert: true }
    );

    // 2. Save full card details to global collection only when user successfully masters them (only for vocab cards, as kanji cards don't use global DB cache)
    if (Array.isArray(cardDetails) && cardDetails.length > 0 && type === "vocab") {
      const ops = cardDetails.map((c: any) => ({
        updateOne: {
          filter: { word: c.word },
          update: { $set: c },
          upsert: true
        }
      }));
      await db.collection("vocabs").bulkWrite(ops);
      console.log(`[DB Sync] Upserted ${cardDetails.length} vocab details to DB on master.`);

      if (Array.isArray(quizDetails) && quizDetails.length > 0) {
        const quizOps = quizDetails.map((q: any) => ({
          updateOne: {
            filter: { targetWord: q.targetWord, type: q.type },
            update: { $set: q },
            upsert: true
          }
        }));
        await db.collection("vocab_quizzes").bulkWrite(quizOps);
        console.log(`[DB Sync] Upserted ${quizDetails.length} quiz details to DB on master.`);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Save progress error:", err);
    res.json({ success: false, errorMsg: `진행률 저장 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to reset user progress
app.post("/api/progress/reset", async (req, res) => {
  const { username, type } = req.body;
  if (!username || !type) {
    return res.json({ success: false, errorMsg: "올바르지 않은 요청 데이터입니다." });
  }

  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "masteredKanjis" : "masteredVocabs";

    await db.collection("progress").updateOne(
      { username: normalizedUsername },
      { $set: { [field]: [] } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err: any) {
    console.error("Reset progress error:", err);
    res.json({ success: false, errorMsg: `진행률 초기화 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to fetch review cards
app.post("/api/progress/review", async (req, res) => {
  const { username, type } = req.body;

  if (!username || !type) {
    return res.json({ success: false, errorMsg: "올바르지 않은 요청 데이터입니다." });
  }

  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db.collection("progress").findOne({ username: normalizedUsername });
    const list: string[] = type === "kanji"
      ? (progress?.masteredKanjis || [])
      : (progress?.masteredVocabs || []);

    if (list.length === 0) {
      return res.json({ success: true, data: [], quiz: [], message: "복습할 단어가 아직 없습니다!" });
    }

    // Shuffle and pick all items
    const selectedKeys = [...list].sort(() => 0.5 - Math.random());

    if (type === "kanji") {
      // Try DB cache first for kanji review
      let cachedCards: any[] = [];
      try {
        cachedCards = await db.collection("kanjis").find({ kanji: { $in: selectedKeys } }).toArray();
      } catch (err) {
        console.error("Failed to fetch cached kanjis from DB:", err);
      }

      const cachedKanjiSet = new Set(cachedCards.map((c: any) => c.kanji));
      const missingKeys = selectedKeys.filter(k => !cachedKanjiSet.has(k));

      let generatedCards: any[] = [];
      if (missingKeys.length > 0) {
        console.log(`[Kanji Review] ${cachedCards.length} from DB cache, ${missingKeys.length} need Gemini generation.`);
        const prompt = `
          Create exactly ${missingKeys.length} Japanese Kanji (한자) learning cards for a Korean speaker studying Japanese.
          Specifically, generate cards for the following characters: ${JSON.stringify(missingKeys)}.
          
          For each Kanji character, provide concise, creative, and easy-to-remember Korean mnemonics/association stories ("mnemonic" - 외우는 방법).
          To prevent truncation and ensure snappy responses, keep all mnemonics and explanations very brief (maximum 2 concise sentences each).
          
          The properties for each card:
          - "id", "kanji" (must match one of the requested characters), "strokeCount", "jlptLevel", "grade", "mnemonic", "meaning", "onyomi", "onyomiKorean", "hunyomi", "hunyomiKorean", "radicalsBreakdown", "relatedWords" (exactly 3), "exampleSentence".
          
          CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
          - **Radical Breakdown Accuracy**: Deconstruct the Kanji into its actual visual components. If a part is not a standard Kanji, do NOT map it to an incorrect character (e.g., do NOT map the right side of '拝' to '未'). Describe it directly as a shape (e.g., component: "丰", meaning: "양손을 맞잡은 모양").
          - **Mnemonic Consistency**: The mnemonic story must be strictly consistent with the components in \`radicalsBreakdown\`. Do not mention unrelated characters or meanings (e.g., for '換', use '扌' and '奐'; do NOT mention '황새 황').
          - **Pictorial Explanations**: Describe ancient pictographs or non-standard symbols as visual shapes representing objects or actions rather than forcing a modern character match.

          Make sure to return absolutely valid JSON following the provided responseSchema precisely.
        `;

        try {
          const systemInstruction = "You are an expert Japanese and Kanji language professor who specializes in visual mnemonics, associations, and helping Korean learners master Japanese characters with minimal effort.";
          const schema = {
            type: Type.ARRAY,
            description: "List of Kanji learning cards",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique alphabetic id" },
                kanji: { type: Type.STRING, description: "The single Kanji character" },
                strokeCount: { type: Type.INTEGER, description: "Stroke count as an integer" },
                jlptLevel: { type: Type.STRING, description: "The JLPT level (e.g., N5, N4, N3, N2, N1)" },
                grade: { type: Type.STRING, description: "School grade or level (e.g., 초등 1학년, 상용 한자)" },
                mnemonic: { type: Type.STRING, description: "An intuitive visual association storyboard in Korean (strictly maximum 2 brief sentences, under 40 Korean words)" },
                meaning: { type: Type.STRING, description: "Korean meaning and Hanja reading Name (e.g., 볼 견)" },
                onyomi: { type: Type.STRING, description: "Main Onyomi readings in Hiragana split by comma" },
                onyomiKorean: { type: Type.STRING, description: "Main Onyomi Korean pronunciations split by comma" },
                hunyomi: { type: Type.STRING, description: "Main Hunyomi readings in Hiragana split by comma" },
                hunyomiKorean: { type: Type.STRING, description: "Main Hunyomi Korean pronunciations split by comma" },
                radicalsBreakdown: KANJI_BREAKDOWN_SCHEMA,
                relatedWords: RELATED_WORDS_SCHEMA,
                exampleSentence: EXAMPLE_SENTENCE_SCHEMA
              },
              required: [
                "id", "kanji", "strokeCount", "jlptLevel", "grade", "mnemonic", "meaning",
                "onyomi", "onyomiKorean", "hunyomi", "hunyomiKorean", "relatedWords", "exampleSentence", "radicalsBreakdown"
              ]
            }
          };

          try {
            generatedCards = await callGeminiJSON(prompt, systemInstruction, schema);
            // Cache newly generated kanji cards to DB
            if (generatedCards.length > 0) {
              const ops = generatedCards.map((c: any) => {
                if (c.hunyomi) c.hunyomi = c.hunyomi.replace(/\./g, "");
                return {
                  updateOne: {
                    filter: { kanji: c.kanji },
                    update: { $set: c },
                    upsert: true
                  }
                };
              });
              await db.collection("kanjis").bulkWrite(ops);
              console.log(`[DB Sync] Cached ${generatedCards.length} review kanji cards to DB.`);
            }
          } catch (parseErr) {
            console.error("Failed to parse review kanjis:", parseErr);
          }
        } catch (geminiErr) {
          console.error("Gemini API error during kanji review:", geminiErr);
        }
      } else {
        console.log(`[Kanji Review] All ${selectedKeys.length} kanji served from DB cache.`);
      }

      // Merge cached + generated cards, ordered by selectedKeys
      const allCards = [...cachedCards, ...generatedCards];
      const orderedCards = selectedKeys.map(k => allCards.find((c: any) => c.kanji === k)).filter(Boolean);

      if (orderedCards.length === 0) {
        return res.json({ success: false, errorMsg: "복습용 한자 카드를 불러오는 데 실패했습니다." });
      }
      res.json({ success: true, source: missingKeys.length > 0 ? "gemini_with_cache" : "mongodb_cache", data: orderedCards });
    } else {
      // Vocab review: DB-first with Gemini fallback for missing items
      let cards: any[] = [];
      let quizzes: any[] = [];
      try {
        cards = await db.collection("vocabs").find({ word: { $in: selectedKeys } }).toArray();
        quizzes = await db.collection("vocab_quizzes").find({ targetWord: { $in: selectedKeys } }).toArray();
      } catch (err) {
        console.error("Failed to fetch cached vocab review data:", err);
      }

      const cachedWordSet = new Set(cards.map((c: any) => c.word));
      const cachedQuizWordSet = new Set(quizzes.map((q: any) => q.targetWord));
      const missingWords = selectedKeys.filter(w => !cachedWordSet.has(w) || !cachedQuizWordSet.has(w));

      let generatedVocabs: any[] = [];
      let generatedQuizzes: any[] = [];

      if (missingWords.length > 0) {
        console.log(`[Vocab Review] ${cards.length} cards from DB cache, ${missingWords.length} need Gemini generation.`);
        try {
          const prompt = `
            Create a list of exactly ${missingWords.length} Japanese vocabulary (단어) learning cards for a Korean speaker studying Japanese, AND a corresponding set of exactly ${missingWords.length} multiple-choice quiz questions to test them.
            Specifically, generate cards for the following words: ${JSON.stringify(missingWords)}.
            
            CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
            - **Radical Breakdown Accuracy**: For each Kanji in \`kanjiBreakdown\`, deconstruct it into its actual visual components.
            - **Mnemonic Consistency**: The mnemonic story for each Kanji must be strictly consistent with its components.
            - **Pictorial Explanations**: Describe ancient pictographs or non-standard symbols as visual shapes.

            CRITICAL CONSTRAINTS:
            1. All generated words must contain at least one Kanji character.
            2. Each word in the response must match one of the requested words.
            3. CRITICAL QUESTION QUALITY CONSTRAINT:
               - In the "quiz" array, NEVER include the target Japanese Kanji character, its constituent Kanji characters, or the Japanese word anywhere inside the "questionText" or "questionSentence"!
               - For 'kanji_match' type: The questionText MUST follow this exact format: '한국어 뜻이 "[meaning]"인 알맞은 일본어 단어 표기(한자)는 무엇일까요?'. Do NOT ask about its constituent kanjis or show their characters, as this exposes the spelling of the answer.
               - Instead, ask for the Korean meaning/definition/reading in Korean without showing any Japanese characters.
            
            For the "data" array:
            - Generate vocabulary cards (with id, word, hiragana, pronunciation, meaning, jlptLevel, kanjiBreakdown, exampleSentence).
            
            For the "quiz" array:
            - Generate multiple-choice questions (one per vocabulary card).
            - Distribute different question types: 'meaning', 'reading', 'kanji_match', and 'blank_fill'.
            - CRITICAL RULE FOR "blank_fill" TYPE:
              - Use the generated exampleSentence but replace the target word with "__blank__".
              - The 4 choices MUST be conjugated in the exact same grammatical form.
            
            Make sure to return absolutely valid JSON following the provided responseSchema precisely.
          `;

          const systemInstruction = "You are an expert Japanese and Kanji professor specializing in visual mnemonics, associations, and helping Korean learners master Japanese words and characters.";
          const schema = {
            type: Type.OBJECT,
            properties: {
              data: {
                type: Type.ARRAY,
                description: "List of Japanese vocabulary study cards",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique alphabetic id" },
                    word: { type: Type.STRING, description: "The Japanese word containing Kanji" },
                    hiragana: { type: Type.STRING, description: "Hiragana reading of the word" },
                    pronunciation: { type: Type.STRING, description: "Korean pronunciation phonetics" },
                    meaning: { type: Type.STRING, description: "Korean meaning" },
                    jlptLevel: { type: Type.STRING, description: "The JLPT level" },
                    kanjiBreakdown: VOCAB_KANJI_BREAKDOWN_SCHEMA,
                    exampleSentence: EXAMPLE_SENTENCE_SCHEMA
                  },
                  required: ["id", "word", "hiragana", "pronunciation", "meaning", "jlptLevel", "kanjiBreakdown", "exampleSentence"]
                }
              },
              quiz: QUIZ_SCHEMA
            },
            required: ["data", "quiz"]
          };

          try {
            const parsed = await callGeminiJSON(prompt, systemInstruction, schema);
            generatedVocabs = parsed.data || [];
            generatedQuizzes = parsed.quiz || [];

            // Cache newly generated vocab cards and quizzes to DB
            if (generatedVocabs.length > 0) {
              const vocabOps = generatedVocabs.map((c: any) => ({
                updateOne: {
                  filter: { word: c.word },
                  update: { $set: c },
                  upsert: true
                }
              }));
              await db.collection("vocabs").bulkWrite(vocabOps);
              console.log(`[DB Sync] Cached ${generatedVocabs.length} review vocab cards to DB.`);
            }
            if (generatedQuizzes.length > 0) {
              const quizOps = generatedQuizzes.map((q: any) => ({
                updateOne: {
                  filter: { targetWord: q.targetWord, type: q.type },
                  update: { $set: q },
                  upsert: true
                }
              }));
              await db.collection("vocab_quizzes").bulkWrite(quizOps);
              console.log(`[DB Sync] Cached ${generatedQuizzes.length} review vocab quizzes to DB.`);
            }
          } catch (parseErr) {
            console.error("Failed to parse review vocabs from Gemini:", parseErr);
          }
        } catch (geminiErr) {
          console.error("Gemini API error during vocab review:", geminiErr);
        }
      } else {
        console.log(`[Vocab Review] All ${selectedKeys.length} vocabs served from DB cache.`);
      }

      // Merge all cards and quizzes
      const allCards = [...cards, ...generatedVocabs];
      const allQuizzes = [...quizzes, ...generatedQuizzes];

      const orderedCards = selectedKeys.map(w => allCards.find((c: any) => c.word === w)).filter(Boolean);
      const orderedQuizzes = selectedKeys.map((w, idx) => {
        const q = allQuizzes.find((item: any) => item.targetWord === w);
        if (!q) return null;
        const associatedItem = orderedCards.find((c: any) => c.word === w);
        return {
          ...q,
          id: idx + 1,
          vocabItem: associatedItem
        };
      }).filter(Boolean);

      res.json({ success: true, source: missingWords.length > 0 ? "gemini_with_cache" : "mongodb_cache", data: orderedCards, quiz: orderedQuizzes });
    }
  } catch (err: any) {
    console.error("Review fetching error:", err);
    res.json({ success: false, errorMsg: `복습 단어를 가져오는 중 오류가 발생했습니다: ${err.message}` });
  }
});

// ==========================================
// YOUTUBE NEWS STUDY ENDPOINTS (DYNAMIC)
// ==========================================

const getRandomNewsQuery = () => {
  const queries = [
    "TBS NEWS DIG shorts",
    "ANNnewsCH shorts",
    "FNNプライムオンライン shorts",
    "日テレNEWS shorts",
    "読売テレビニュース shorts"
  ];
  return queries[Math.floor(Math.random() * queries.length)];
};

app.get("/api/news/random", async (req, res) => {
  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;
  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  try {
    let selectedVideo = null;
    let transcriptData = null;
    let subtitles = [];

    // 1. YouTube 검색을 통해 무작위 비디오 선정 및 자막 추출
    let retryCount = 0;
    while (retryCount < 5) {
      try {
        const query = getRandomNewsQuery();
        console.log(`[News Gen] Searching YouTube for: ${query}`);
        const r = await yts(query);
        const videos = r.videos;

        if (videos.length > 0) {
          // Shuffle videos and check a maximum of 5 to prevent long loading times (fail fast)
          const shuffled = videos.sort(() => 0.5 - Math.random()).slice(0, 5);
          for (let v of shuffled) {
            try {
              const t = await YoutubeTranscript.fetchTranscript(v.videoId, { lang: 'ja' });
              if (t && t.length > 0) {
                selectedVideo = v;
                transcriptData = t;
                console.log(`[News Gen] Selected video ${v.videoId} with transcript.`);
                break;
              }
            } catch (transcriptErr) {
              // No transcript or video is blocked, try next video
            }
          }
        }
        if (selectedVideo) break;
      } catch (searchErr) {
        console.error("YouTube search error:", searchErr);
      }
      retryCount++;
    }

    if (!selectedVideo || !transcriptData) {
      return res.json({ success: false, errorMsg: "시청 가능한 유튜브 뉴스 영상을 찾는 데 실패했습니다. 잠시 후 다시 시도해 주세요." });
    }

    // 2. 자막 데이터 변환 (NewsStudy.tsx 규격)
    subtitles = transcriptData.map((t: any) => ({
      start: t.offset / 1000,
      duration: t.duration / 1000,
      japanese: t.text,
      hiragana: "", // 동적 로드 시번역 생략 (성능 최적화)
      korean: ""
    }));

    // 3. MongoDB 캐시가 있는 경우 조회
    if (db) {
      try {
        const cached = await db.collection("news_lessons").findOne({ id: selectedVideo.videoId });
        if (cached) {
          console.log(`[News Gen] Served news lesson ${selectedVideo.videoId} from MongoDB cache.`);
          return res.json({ success: true, source: "mongodb_cache", data: cached });
        }
      } catch (err) {
        console.error("Failed to fetch cached news lesson from MongoDB:", err);
      }
    }

    // 4. Gemini API를 이용해 대본으로부터 중요 어휘 카드 및 연계 퀴즈 생성
    const transcriptText = subtitles.map((s: any) => `[${s.start.toFixed(1)}s - ${parseFloat((s.start + s.duration).toFixed(1))}s] ${s.japanese}`).join("\n");
    const prompt = `
      You are processing a raw YouTube auto-generated transcript for a Japanese news video. The transcript is broken into unnatural, very short chunks.
      Your tasks:
      1. Merge the raw transcript lines into natural, complete Japanese sentences.
      2. For each merged sentence, calculate the 'start' time (the start time of the first chunk in the sentence) and 'duration' (the difference between the end time of the last chunk and the start time).
      3. For each merged sentence, break it into meaningful word/phrase chunks separated by " / ". Then provide MATCHING Korean Hangul pronunciation and Korean translation for each chunk, also separated by " / ".
         Example:
         japanese: "過去最大規模で / 行われましたが、"
         pronunciation: "카코사이다이키보데 / 오코나와레마시타가,"
         korean: "과거 최대 규모로 / 실시되었으나,"
         The number of " / " segments in japanese, pronunciation, and korean MUST be identical.
      4. Create a list of exactly 5 Japanese vocabulary (단어) study cards for a Korean speaker studying Japanese, based on the provided news transcript.
      5. Create exactly 5 corresponding multiple-choice quiz questions to test the learner on these specific 5 vocabulary words.

      News Title: ${selectedVideo.title}
      Raw Transcript:
      ${transcriptText}

      CRITICAL CONSTRAINTS:
      - 'processedSubtitles': MUST contain the entire video transcript merged into natural sentence units. Provide 'start' and 'duration' as numbers (seconds). Use " / " to delimit word/phrase chunks within each field (japanese, pronunciation, korean). The chunk count MUST match across all three fields.
      - 'vocabItems': Extract exactly 5 words from the transcript. Each word MUST contain at least one Kanji. Keep definitions/mnemonics concise (max 2 sentences in Korean).
      - ALL pronunciation fields MUST be Korean Hangul (e.g. "카코", "니혼"). NEVER use English/Romaji.
      - 'vocabItems.exampleSentence.japanese': MUST be an ACTUAL sentence copied verbatim from the merged processedSubtitles (without the / delimiters). Wrap the vocabulary word with '__' on both sides.
      - 'quizzes': Create exactly 5 questions of type 'reading' or 'meaning'.
        * 'meaning' type: questionText MUST include the target word, e.g. "다음 단어 '韓国軍'의 올바른 뜻은 무엇입니까?". Choices are 4 Korean meanings.
        * 'reading' type: questionText MUST include the target word, e.g. "다음 단어 '緊張'의 올바른 한국어 발음은 무엇입니까?". Choices are 4 Korean Hangul pronunciations (NOT hiragana).
      - TRANSLATION ACCURACY IS CRITICAL: Ensure natural Korean translations and correct pronunciation transcriptions.
      
      Make sure to return absolutely valid JSON following the provided responseSchema precisely.
    `;

    console.log(`[News Gen] Calling Gemini API for video ${selectedVideo.videoId}...`);
    const systemInstruction = "You are an expert Japanese professor specializing in creating high-quality language learning cards (with Korean mnemonics and Kanji breakdowns) and contextual multiple-choice questions from news articles.";
    const schema = {
      type: Type.OBJECT,
      properties: {
        processedSubtitles: {
          type: Type.ARRAY,
          description: "The merged and translated transcript sentences.",
          items: {
            type: Type.OBJECT,
            properties: {
              start: { type: Type.NUMBER },
              duration: { type: Type.NUMBER },
              japanese: { type: Type.STRING },
              hiragana: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              korean: { type: Type.STRING }
            },
            required: ["start", "duration", "japanese", "hiragana", "pronunciation", "korean"]
          }
        },
        vocabItems: {
          type: Type.ARRAY,
          description: "Array of exactly 5 vocabulary items extracted from the news",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              word: { type: Type.STRING },
              hiragana: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              meaning: { type: Type.STRING },
              jlptLevel: { type: Type.STRING },
              kanjiBreakdown: VOCAB_KANJI_BREAKDOWN_SCHEMA,
              exampleSentence: EXAMPLE_SENTENCE_SCHEMA
            },
            required: ["id", "word", "hiragana", "pronunciation", "meaning", "jlptLevel", "kanjiBreakdown", "exampleSentence"]
          }
        },
        quizzes: {
          type: Type.ARRAY,
          description: "Array of exactly 5 direct vocabulary quiz questions (reading or meaning)",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              type: { type: Type.STRING }, // meaning or reading only
              targetWord: { type: Type.STRING },
              questionText: { type: Type.STRING },
              choices: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "type", "targetWord", "questionText", "choices", "correctIndex", "explanation"]
          }
        }
      },
      required: ["processedSubtitles", "vocabItems", "quizzes"]
    };

    let parsed: any = {};
    try {
      parsed = await callGeminiJSON(prompt, systemInstruction, schema);
    } catch (parseErr) {
      console.error("Failed to fetch or parse news JSON response.", parseErr);
    }

    // 5. 결과 구조화
    const newsLessonData = {
      id: selectedVideo.videoId,
      title: selectedVideo.title,
      videoUrl: selectedVideo.url,
      subtitles: parsed.processedSubtitles || subtitles,
      vocabItems: parsed.vocabItems || [],
      quizzes: parsed.quizzes || []
    };

    // 6. MongoDB에 저장 (캐시)
    if (db && newsLessonData.vocabItems.length > 0) {
      try {
        await db.collection("news_lessons").updateOne(
          { id: selectedVideo.videoId },
          { $set: newsLessonData },
          { upsert: true }
        );
        console.log(`[News Gen] Saved news lesson ${selectedVideo.videoId} to MongoDB.`);
      } catch (cacheErr) {
        console.error("Failed to cache news lesson to DB:", cacheErr);
      }
    }

    res.json({ success: true, source: "gemini_generation", data: newsLessonData });
  } catch (err: any) {
    console.error("News lesson generation error:", err);
    res.json({ success: false, errorMsg: `뉴스 학습 자료 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});



// Configure Vite or Serve static built content
async function startServer() {
  // Connect to MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      const client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db("nihongo_gakushu");
      console.log("Connected to MongoDB Atlas successfully.");
    } catch (dbErr) {
      console.error("Failed to connect to MongoDB Atlas:", dbErr);
    }
  } else {
    console.warn("MONGODB_URI is not configured in .env. Running without DB caching.");
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

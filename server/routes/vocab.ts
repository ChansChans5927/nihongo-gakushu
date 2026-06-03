import express from "express";
import { getDB } from "../db.ts";
import { callGeminiJSON, VOCAB_KANJI_BREAKDOWN_SCHEMA, EXAMPLE_SENTENCE_SCHEMA, QUIZ_SCHEMA } from "../services/gemini.ts";
import { Type } from "@google/genai";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { count, level, excludeVocab, forceGenerate } = req.body;
  const numCount = parseInt(count, 10) || 5;
  const targetLevel = level || "all";
  const excludedList = Array.isArray(excludeVocab) ? excludeVocab : [];

  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;
  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  const db = getDB();

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

    let selectedVocabs: any[] = [];
    let selectedQuizzes: any[] = [];
    let hasAllQuizzes = false;

    if (cachedVocabs.length >= numCount) {
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

    if (!forceGenerate && hasAllQuizzes && selectedVocabs.length >= numCount) {
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

    const missingCount = numCount - selectedVocabs.length;

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
        Create exactly ${size} Japanese vocabulary study cards and a corresponding set of exactly ${size} multiple-choice quizzes for Korean speakers.
        Target JLPT difficulty level filter: ${targetLevel === "all" ? "A high quality balanced mix of useful JLPT levels from N5 to N1" : `Strictly JLPT ${targetLevel}`}.
        
        Focus hint for this specific small batch of ${size} words (MUST follow for diversity): ${focusHint}
        
        CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
        - Radical Breakdown Accuracy: For each Kanji, deconstruct into its actual visual components. If not a standard Kanji, describe it directly as a shape (e.g., "양손을 맞잡은 모양"). NEVER map to incorrect characters.
        - Mnemonic Consistency: The mnemonic story MUST be strictly consistent with its components.
        - Pictorial Explanations: Describe ancient pictographs/symbols as visual shapes instead of forcing a modern character match.

        CRITICAL CONSTRAINTS:
        1. Every generated word MUST contain at least one Kanji (e.g., 食べる, 銀行). Hiragana/Katakana-only words are STRICTLY FORBIDDEN.
        2. Ensure all generated words are globally unique.
        3. ABSOLUTELY EXCLUDE these words (already mastered): ${JSON.stringify(fullExcludedList)}.
        4. CRITICAL QUESTION QUALITY:
           - NEVER include the target Japanese word or its constituent Kanji in 'questionText' or 'questionSentence'!
           - 'kanji_match': Format 'questionText' EXACTLY as '한국어 뜻이 "[meaning]"인 알맞은 일본어 단어 표기(한자)는 무엇일까요?'. NEVER expose the constituent Kanji meanings in the question.
        
        For the "data" array:
        - Generate exactly ${size} vocabulary cards.
        - 'exampleSentence' MUST be a natural sentence.
        
        For the "quiz" array:
        - Generate exactly ${size} quizzes. Distribute types: 'meaning', 'reading', 'kanji_match', and 'blank_fill'.
        - 'blank_fill': Replace the target word in 'exampleSentence' with "__blank__". Format 'questionText' EXACTLY as "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?". Choices MUST match grammatical context.
        - 'meaning': Format 'questionText' EXACTLY as "다음 단어의 올바른 한국어 뜻은 무엇입니까?". Choices MUST be Korean meanings.
        - 'reading': Format 'questionText' EXACTLY as "다음 단어의 올바른 일본어 발음은 무엇입니까?". Choices MUST be STRICTLY Hiragana ONLY (NO Romaji, NO Korean).
        - 'kanji_match': Choices MUST be base Japanese words.
        
        Return absolutely valid JSON matching the responseSchema precisely.
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
          if (item && item.word && !seenWords.has(item.word) && !excludedList.includes(item.word) && !allDbVocabs.includes(item.word)) {
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

    const keptQuizzes = newGeneratedQuizzes.filter(q => seenWords.has(q.targetWord));

    if (db && newGeneratedVocabs.length > 0) {
      try {
        const ops = newGeneratedVocabs.map((c: any) => ({
          updateOne: { filter: { word: c.word }, update: { $set: c }, upsert: true }
        }));
        await db.collection("vocabs").bulkWrite(ops);
        console.log(`[DB Sync] Cached ${newGeneratedVocabs.length} vocab cards to DB on generation.`);
      } catch (cacheErr) {
        console.error("Failed to cache vocab cards to DB:", cacheErr);
      }
    }

    if (db && keptQuizzes.length > 0) {
      try {
        const quizOps = keptQuizzes.map((q: any) => ({
          updateOne: { filter: { targetWord: q.targetWord, type: q.type }, update: { $set: q }, upsert: true }
        }));
        await db.collection("vocab_quizzes").bulkWrite(quizOps);
        console.log(`[DB Sync] Cached ${keptQuizzes.length} vocab quizzes to DB on generation.`);
      } catch (cacheErr) {
        console.error("Failed to cache vocab quizzes to DB:", cacheErr);
      }
    }
    const mergedData = [...selectedVocabs, ...newGeneratedVocabs];
    let mergedQuiz = [...selectedQuizzes, ...keptQuizzes];

    mergedQuiz = mergedQuiz.filter(q => seenWords.has(q.targetWord));

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

    res.json({ success: true, source: "gemini_parallel", data: mergedData, quiz: mergedQuiz });
  } catch (err: any) {
    console.error("Gemini API vocab generation error:", err);
    res.json({ success: false, errorMsg: `일본어 단어 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});

export default router;

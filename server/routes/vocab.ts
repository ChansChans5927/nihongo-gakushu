import express from "express";
import { getDB } from "../db.ts";
import { callGeminiJSON, VOCAB_KANJI_BREAKDOWN_SCHEMA, EXAMPLE_SENTENCE_SCHEMA, QUIZ_SCHEMA } from "../services/gemini.ts";
import { Type } from "@google/genai";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { count, level, excludeVocab } = req.body;
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

    if (hasAllQuizzes && selectedVocabs.length >= numCount) {
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
        - For 'reading' type: The questionText asks for the pronunciation/reading of the Japanese word. Choices MUST be strictly ONLY Hiragana (e.g., 'かんしゃ'). NEVER include English Romaji or Korean pronunciation in parentheses.
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

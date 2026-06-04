import express from "express";
import { getDB } from "../db.ts";
import { callGeminiJSON, KANJI_BREAKDOWN_SCHEMA, RELATED_WORDS_SCHEMA, EXAMPLE_SENTENCE_SCHEMA } from "../services/gemini.ts";
import { Type } from "@google/genai";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { count, level, excludeKanji, forceGenerate } = req.body;
  const numCount = parseInt(count, 10) || 5;
  const targetLevel = level || "all";
  const excludedList = Array.isArray(excludeKanji) ? excludeKanji : [];

  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;

  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  const db = getDB();

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

    if (!forceGenerate && cachedKanjis.length >= numCount) {
      const shuffled = cachedKanjis.sort(() => 0.5 - Math.random());
      const selectedKanjis = shuffled.slice(0, numCount);
      console.log(`[Kanji Gen] Served ${numCount} cards instantly from MongoDB cache.`);
      return res.json({ success: true, source: "mongodb_cache", data: selectedKanjis });
    }

    const missingCount = forceGenerate ? numCount : Math.max(0, numCount - cachedKanjis.length);

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
        Create exactly ${size} Japanese Kanji learning cards for a Korean speaker.
        Target JLPT difficulty level filter: ${targetLevel === "all" ? "A high quality balanced mix of useful JLPT levels from N5 to N1" : `Strictly JLPT ${targetLevel}`}.
        
        Focus hint for this specific small batch of ${size} characters (MUST follow for diversity): ${focusHint}
        
        - Keep all mnemonics and explanations very brief (max 2 concise Korean sentences) to ensure snappy responses.
        
        CRITICAL CONSTRAINTS:
        - Strictly ensure all generated Kanji are globally unique.
        - ABSOLUTELY EXCLUDE these Kanji characters (already mastered): ${JSON.stringify(fullExcludedList)}.
        
        CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
        - Radical Breakdown Accuracy: Deconstruct the Kanji into its actual visual components. If not a standard Kanji, describe it directly as a shape (e.g., component: "丰", meaning: "양손을 맞잡은 모양"). NEVER map to incorrect characters.
        - Mnemonic Consistency: The mnemonic story MUST be strictly consistent with the components in 'radicalsBreakdown'.
        - Pictorial Explanations: Describe ancient pictographs/symbols as visual shapes instead of forcing a modern character match.

        FORMATTING RULES:
        - "mnemonic": Create extremely intuitive visual association explanations in Korean (max 1-2 short sentences).
        - "meaning": Format EXACTLY as "뜻 음" (e.g., "볼 견").
        - "onyomi" & "hunyomi": MUST be in Hiragana ONLY.
        - "onyomiKorean" & "hunyomiKorean": MUST be Korean pronunciations ONLY.
        - "radicalsBreakdown": Provide constituent components. For each component, provide "component", "meaning" (in Korean), and "mnemonic" (under 1 sentence, max 15 Korean words).
        - "relatedWords": Exactly 3 practical words containing the Kanji.
        - "exampleSentence": 1 natural sentence utilizing the Kanji.

        Return absolutely valid JSON matching the responseSchema precisely.
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

    const newGeneratedCards: any[] = [];
    const seenKanji = new Set<string>();

    for (const batch of parsedBatches) {
      if (Array.isArray(batch)) {
        for (const item of batch) {
          if (item && item.kanji && !seenKanji.has(item.kanji) && !excludedList.includes(item.kanji) && !allDbKanjis.includes(item.kanji)) {
            if (item.hunyomi) {
              item.hunyomi = item.hunyomi.replace(/\./g, "");
            }
            seenKanji.add(item.kanji);
            newGeneratedCards.push(item);
          }
        }
      }
    }

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
  } catch (err: any) {
    console.error("Gemini API generation error:", err);
    res.json({ success: false, errorMsg: `한자 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});

export default router;

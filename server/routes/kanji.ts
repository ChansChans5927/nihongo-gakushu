import express from "express";
import { getDB } from "../db.ts";
import { callGeminiJSON, KANJI_BREAKDOWN_SCHEMA, RELATED_WORDS_SCHEMA, EXAMPLE_SENTENCE_SCHEMA } from "../services/gemini.ts";
import { Type } from "@google/genai";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { count, level, excludeKanji, forceGenerate, targetKanjis } = req.body;
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
    const hasTargets = Array.isArray(targetKanjis) && targetKanjis.length > 0;

    if (!hasTargets && db) {
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

    if (!hasTargets && !forceGenerate && cachedKanjis.length >= numCount) {
      const shuffled = cachedKanjis.sort(() => 0.5 - Math.random());
      // kanji 기준으로 중복 제거: 같은 한자가 한 세트에 2번 이상 출제되지 않도록 필터링
      const seenKanjis = new Set<string>();
      const deduplicated = shuffled.filter((k: any) => {
        if (seenKanjis.has(k.kanji)) return false;
        seenKanjis.add(k.kanji);
        return true;
      });
      const selectedKanjis = deduplicated.slice(0, numCount);
      console.log(`[Kanji Gen] Served ${selectedKanjis.length} cards instantly from MongoDB cache.`);
      return res.json({ success: true, source: "mongodb_cache", data: selectedKanjis });
    }

    let allDbKanjis: string[] = [];
    if (db) {
      try {
        const dbKanjis = await db.collection("kanjis").find({}, { projection: { kanji: 1 } }).toArray();
        allDbKanjis = dbKanjis.map((item: any) => item.kanji);
      } catch (err) {
        console.error("Failed to fetch all DB kanjis:", err);
      }
    }

    let dynamicTargets: string[] = [];
    if (!hasTargets && db) {
      const masterPath = path.join(process.cwd(), "server", "data", "kanji_master.json");
      if (fs.existsSync(masterPath)) {
        try {
          const masterKanjiData = JSON.parse(fs.readFileSync(masterPath, "utf8"));
          const levelKanjis: string[] = targetLevel === "all"
            ? Object.values(masterKanjiData).flat() as string[]
            : (masterKanjiData[targetLevel] || []);

          const existingKanjis = new Set(allDbKanjis);
          const missingMasterKanjis = levelKanjis.filter(k => !existingKanjis.has(k) && !excludedList.includes(k));

          const countToSelect = forceGenerate ? numCount : Math.max(0, numCount - cachedKanjis.length);
          if (countToSelect > 0) {
            let selected = missingMasterKanjis.sort(() => 0.5 - Math.random()).slice(0, countToSelect);
            if (selected.length < countToSelect) {
              const fallbackPool = levelKanjis.filter(k => !selected.includes(k) && !excludedList.includes(k));
              const extra = fallbackPool.sort(() => 0.5 - Math.random()).slice(0, countToSelect - selected.length);
              selected = [...selected, ...extra];
            }
            dynamicTargets = selected;
          }
        } catch (masterErr) {
          console.error("Failed to dynamically select target kanjis from master file:", masterErr);
        }
      }
    }

    const finalTargetKanjis = hasTargets ? targetKanjis : dynamicTargets;
    const finalHasTargets = finalTargetKanjis.length > 0;

    const missingCount = finalHasTargets 
      ? finalTargetKanjis.length 
      : (forceGenerate ? numCount : Math.max(0, numCount - cachedKanjis.length));

    const fullExcludedList = Array.from(new Set([...excludedList, ...allDbKanjis]));

    const targetBatches: string[][] = [];
    const batchSizes: number[] = [];

    if (finalHasTargets) {
      for (let i = 0; i < finalTargetKanjis.length; i += 5) {
        targetBatches.push(finalTargetKanjis.slice(i, i + 5));
      }
    } else {
      let remaining = missingCount;
      while (remaining > 0) {
        const size = Math.min(remaining, 5);
        batchSizes.push(size);
        remaining -= size;
      }
    }

    const batchInstructions = [
      "Focus primarily on common action verbs or everyday item noun words (e.g., 食べる, 行く, 本).",
      "Focus primarily on active words, movement, or basic adjectives and descriptors.",
      "Focus primarily on abstract nouns, relations, timing, or situational words.",
      "Focus primarily on feelings, natural elements, workspace items, or social words."
    ];

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

    const systemInstruction = "You are an expert Japanese and Kanji language professor who specializes in visual mnemonics, associations, and helping Korean learners master Japanese characters with minimal effort.";

    const promises = finalHasTargets
      ? targetBatches.map(async (batch, idx) => {
          const focusHint = batchInstructions[idx % batchInstructions.length];
          const prompt = `
            Create Japanese Kanji learning cards for a Korean speaker.
            Specifically, you MUST create cards for exactly these ${batch.length} Kanji characters: ${JSON.stringify(batch)}.
            Ensure you detect the correct JLPT level for each character (N5, N4, N3, N2, or N1) and fill it in 'jlptLevel'.
            
            Focus hint (apply to components context if relevant): ${focusHint}
            
            - Keep all mnemonics and explanations very brief (max 2 concise Korean sentences) to ensure snappy responses.
            
            CRITICAL CONSTRAINTS:
            - Only create cards for the requested Kanjis: ${JSON.stringify(batch)}.
            - Strictly ensure all generated Kanji are globally unique.
            
            CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
            - Radical Breakdown Accuracy: Deconstruct the Kanji into its actual visual components. If not a standard Kanji, describe it directly as a shape (e.g., component: "丰", meaning: "양손을 맞잡은 모양"). NEVER map to incorrect characters.
            - Mnemonic Consistency: The mnemonic story MUST be strictly consistent with the components in 'radicalsBreakdown'.
            - Pictorial Explanations: Describe ancient pictographs/symbols as visual shapes instead of forcing a modern character match.

            FORMATTING RULES:
            - "mnemonic": Create extremely intuitive visual association explanations in Korean (max 1-2 short sentences).
            - "meaning": Format EXACTLY as "뜻 음" (e.g., "볼 견").
            - "onyomi" & "hunyomi": MUST be in Hiragana ONLY.
            - "onyomiKorean" & "hunyomiKorean": MUST be Korean pronunciations ONLY. Represent Japanese 'つ' (tsu) strictly as '쯔' (e.g., 쯔, 쯔레테, 마쯔) and NEVER as '츠'. All characters MUST be 100% Hangul.
            - "radicalsBreakdown": Provide constituent components. For each component, provide "component", "meaning" (in Korean), and "mnemonic" (under 1 sentence, max 15 Korean words).
            - "relatedWords": Exactly 3 practical words containing the Kanji. The Korean pronunciation for these words MUST represent Japanese 'つ' (tsu) strictly as '쯔' and contain no English/romaji or Japanese characters.
            - "exampleSentence": 1 natural sentence utilizing the Kanji. The 'japanese' field MUST NOT contain any Korean characters or particles. The 'pronunciation' field MUST be 100% Hangul and represent 'つ' strictly as '쯔'.


            Return absolutely valid JSON matching the responseSchema precisely.
          `;
          try {
            return await callGeminiJSON(prompt, systemInstruction, schema);
          } catch (parseErr) {
            console.error(`Failed to generate custom batch for ${JSON.stringify(batch)}`, parseErr);
            return [];
          }
        })
      : batchSizes.map(async (size, idx) => {
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
            - "onyomiKorean" & "hunyomiKorean": MUST be Korean pronunciations ONLY. Represent Japanese 'つ' (tsu) strictly as '쯔' (e.g., 쯔, 쯔레테, 마쯔) and NEVER as '츠'. All characters MUST be 100% Hangul.
            - "radicalsBreakdown": Provide constituent components. For each component, provide "component", "meaning" (in Korean), and "mnemonic" (under 1 sentence, max 15 Korean words).
            - "relatedWords": Exactly 3 practical words containing the Kanji. The Korean pronunciation for these words MUST represent Japanese 'つ' (tsu) strictly as '쯔' and contain no English/romaji or Japanese characters.
            - "exampleSentence": 1 natural sentence utilizing the Kanji. The 'japanese' field MUST NOT contain any Korean characters or particles. The 'pronunciation' field MUST be 100% Hangul and represent 'つ' strictly as '쯔'.

    
            Return absolutely valid JSON matching the responseSchema precisely.
          `;
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
          if (item && item.kanji && !seenKanji.has(item.kanji) && !excludedList.includes(item.kanji) && (finalTargetKanjis.includes(item.kanji) || !allDbKanjis.includes(item.kanji))) {
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

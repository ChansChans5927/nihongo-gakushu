import express from "express";
import { callGeminiJSON } from "../services/gemini.ts";
import { Type } from "@google/genai";

const router = express.Router();

router.post("/generate", async (req, res) => {
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
        - "choices": Exactly 4 plausible Japanese options. STRICTLY Japanese characters only (e.g., 'てんき' or '天気'). NEVER include English Romaji or Korean pronunciation in parentheses.
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

    res.json({ success: true, source: "gemini_parallel", data: mergedData });
  } catch (err: any) {
    console.error("Gemini API JLPT generation error:", err);
    res.json({ success: false, errorMsg: `JLPT 문제 생성 중 오류가 발생했습니다: ${err.message}` });
  }
});

export default router;

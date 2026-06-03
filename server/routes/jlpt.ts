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
        Create exactly ${size} realistic Japanese JLPT exam questions for JLPT ${targetLevel} level.
        Target audience: Korean speakers studying Japanese.
        Focus on vocabulary, kanji reading, meaning, and kanji writing.

        Focus hint for this specific small batch of ${size} questions (MUST follow for diversity): ${focusHint}

        TYPES OF QUESTIONS TO GENERATE:
        - "reading": Test Kanji reading.
        - "writing": Test correct Kanji writing.
        - "meaning": Test correct Korean meaning.
        - "context_fit": Fill-in-the-blank vocabulary test. Replace the target word with "__blank__".

        FORMATTING RULES:
        - "id": unique string.
        - "type": "reading", "writing", "meaning", or "context_fit".
        - "level": "${targetLevel}".
        - "questionSentence": A natural Japanese sentence. For context_fit, use "__blank__". Otherwise wrap the target word like "__targetWord__".
        - "targetWord": The target word tested.
        - "questionText": MUST be in Korean. For reading/writing/meaning: format exactly as "빈칸의 [targetWord]의 올바른 뜻/독음/표기를 고르세요.". For context_fit: "문맥상 빈칸에 들어갈 가장 알맞은 단어를 고르세요."
        - "choices": Exactly 4 options. STRICTLY Japanese characters ONLY (NO Romaji, NO Korean).
        - "correctIndex": 0-based integer.
        - "translation": Concise Korean translation.
        - "explanation": Very brief Korean explanation (max 2 sentences, under 40 words).

        Return absolutely valid JSON matching the responseSchema precisely.
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

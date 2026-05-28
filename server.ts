import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Initialize Gemini Client (Vertex AI mode to utilize Google Cloud Credits)
const ai = new GoogleGenAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION || "us-central1",
  vertexai: true,
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
    const batchSizes: number[] = [];
    let remaining = numCount;
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
        - ABSOLUTELY EXCLUDE the following list of Kanji characters (which the user has already mastered): ${JSON.stringify(excludedList)}. Do not include any of these characters in the response.
        
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Japanese and Kanji language professor who specializes in visual mnemonics, associations, and helping Korean learners master Japanese characters with minimal effort.",
          responseMimeType: "application/json",
          responseSchema: {
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
                radicalsBreakdown: {
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
                },
                relatedWords: {
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
                },
                exampleSentence: {
                  type: Type.OBJECT,
                  description: "One natural educational Japanese sentence",
                  properties: {
                    japanese: { type: Type.STRING, description: "Japanese sentence" },
                    hiragana: { type: Type.STRING, description: "Hiragana layout" },
                    pronunciation: { type: Type.STRING, description: "Korean pronunciation" },
                    meaning: { type: Type.STRING, description: "Korean translation" }
                  },
                  required: ["japanese", "hiragana", "pronunciation", "meaning"]
                }
              },
              required: [
                "id", "kanji", "strokeCount", "jlptLevel", "grade", "mnemonic", "meaning",
                "onyomi", "onyomiKorean", "hunyomi", "hunyomiKorean", "relatedWords", "exampleSentence", "radicalsBreakdown"
              ]
            }
          }
        }
      });

      const bodyText = response.text || "[]";
      try {
        return JSON.parse(bodyText.trim());
      } catch (parseErr) {
        console.error("Failed to parse single batch JSON response. Body text:", bodyText);
        return [];
      }
    });

    const parsedBatches = await Promise.all(promises);

    // Merge, deduplicate, and fill fallback if needed
    const mergedData: any[] = [];
    const seenKanji = new Set<string>();

    for (const batch of parsedBatches) {
      if (Array.isArray(batch)) {
        for (const item of batch) {
          if (item && item.kanji && !seenKanji.has(item.kanji) && !excludedList.includes(item.kanji)) {
            seenKanji.add(item.kanji);
            mergedData.push(item);
          }
        }
      }
    }

    if (mergedData.length === 0) {
      return res.json({ success: false, errorMsg: "한자를 생성하지 못했습니다. 다시 시도해 주세요." });
    }
    res.json({ success: true, source: "gemini_parallel", data: mergedData });
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
    const batchSizes: number[] = [];
    let remaining = numCount;
    while (remaining > 0) {
      const size = Math.min(remaining, 5);
      batchSizes.push(size);
      remaining -= size;
    }

    const batchInstructions = [
      "Focus on common daily life verbs and adjectives (e.g. 食べる, 行く, 楽しい).",
      "Focus on nouns related to objects, places, or jobs (e.g. 教室, 銀行, 会社員).",
      "Focus on abstract vocabulary, emotions, or social concepts (e.g. 感謝, 経済, 協力).",
      "Focus on vocabulary related to movement, direction, or time (e.g. 準備, 週末)."
    ];

    const promises = batchSizes.map(async (size, idx) => {
      const focusHint = batchInstructions[idx % batchInstructions.length];
      const prompt = `
        Create a list of exactly ${size} Japanese vocabulary (단어) learning cards for a Korean speaker studying Japanese, AND a corresponding set of exactly ${size} multiple-choice quiz questions to test them.
        Target JLPT difficulty level filter: ${targetLevel === "all" ? "A high quality balanced mix of useful JLPT levels from N5 to N1" : `Strictly JLPT ${targetLevel}`} level characters.
        
        Focus hint for this specific small batch of ${size} words (which MUST be followed to ensure word diversity): ${focusHint}
        
        CRITICAL KANJI BREAKDOWN & MNEMONIC ACCURACY RULES:
        - **Mnemonic & Component Consistency**: For each Kanji in \`kanjiBreakdown\`, ensure the mnemonic story matches its actual components. Do not mention unrelated characters (e.g., for '換', do NOT mention '황새 황').
        - **No Inaccurate Mappings**: If a Kanji contains non-standard components (e.g., the right side of '拝'), describe the component's shape/meaning (e.g., "양손을 맞잡은 모양") instead of mapping it to an incorrect standard character (e.g., '未').

        CRITICAL CONSTRAINTS:
        1. Strictly ensure all generated words contain at least one Kanji (한자) character (e.g., 食べる, 勉強, 銀行). Words containing only Hiragana or Katakana (e.g., 하는, くる, 카메라) are strictly forbidden.
        2. Ensure all generated words are globally unique.
        3. ABSOLUTELY EXCLUDE the following list of Japanese words (which the user has already mastered): ${JSON.stringify(excludedList)}. Do not include any of these words in the response.
        4. CRITICAL QUESTION QUALITY CONSTRAINT:
           - In the "quiz" array, NEVER include the target Japanese Kanji character or Japanese word directly inside the "questionText" for 'kanji_match' or 'blank_fill' types!
           - For example, if the target word is "広い" containing Kanji "広", do NOT ask "다음 한자 '広'가 포함된 단어는 무엇일까요?". This is too easy and exposes the answer.
           - Instead, ask for the Korean meaning/definition/reading in Korean: "한국어 뜻이 '넓다'인 알맞은 일본어 단어 표기(한자)는 무엇일까요?" or "훈음이 '넓을 광'인 한자가 포함된 일본어 단어는 무엇일까요?".
           - Ensure the questionText only describes the target in terms of its Korean meaning, Hiragana/pronunciation pronunciation, or grammar, without showing the actual Japanese Kanji/word character in the question itself.
        
        For the "data" array:
        - Generate exactly ${size} vocabulary cards (with id, word, hiragana, pronunciation, meaning, jlptLevel, kanjiBreakdown, exampleSentence).
        - Under exampleSentence, provide "japanese", "hiragana", "pronunciation", "meaning". It should be a natural sentence.
        
        For the "quiz" array:
        - Generate exactly ${size} multiple-choice questions (one corresponding to each generated vocabulary card).
        - Distribute different question types: 'meaning', 'reading', 'kanji_match', and 'blank_fill'.
        - CRITICAL RULE FOR "blank_fill" TYPE:
          - Use the generated exampleSentence but replace the target word with "__blank__". For example, if the sentence is "私は毎日新聞を読みます。" and the word is "読む", the questionSentence must be "私は毎日新聞を__blank__。".
          - The 4 choices MUST be conjugated in the exact same grammatical form to fit the sentence context (e.g., if the sentence is '新聞を__blank__。', choices should be '読みます', '買います', '飲みます', '走ります'). This tests if the user can choose the correct verb conjugation for the context!
          - The correctIndex is the 0-based index of the correct conjugated choice (e.g. '読みます').
          - The questionText should be: "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?"
        - For 'meaning' type: The questionText asks for the Korean meaning of the Japanese word. Choices are Korean meanings.
        - For 'reading' type: The questionText asks for the pronunciation/reading of the Japanese word. Choices are readings in Hiragana with pronunciation.
        - For 'kanji_match' type: The questionText asks for the correct Japanese word spelling based on its Korean meaning. Choices are base Japanese words.
        
        Make sure to return absolutely valid JSON following the provided responseSchema precisely.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Japanese and Kanji professor specializing in visual mnemonics, associations, and helping Korean learners master Japanese words and characters.",
          responseMimeType: "application/json",
          responseSchema: {
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
                    kanjiBreakdown: {
                      type: Type.ARRAY,
                      description: "Array breakdown of Kanjis contained in this word",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          kanji: { type: Type.STRING, description: "Single Kanji character" },
                          meaning: { type: Type.STRING, description: "Korean Hanja name, e.g. 통할 통" },
                          mnemonic: { type: Type.STRING, description: "Korean mnemonic visual association storyline, under 2 sentences" }
                        },
                        required: ["kanji", "meaning", "mnemonic"]
                      }
                    },
                    exampleSentence: {
                      type: Type.OBJECT,
                      description: "One natural educational Japanese sentence",
                      properties: {
                        japanese: { type: Type.STRING, description: "Japanese sentence" },
                        hiragana: { type: Type.STRING, description: "Hiragana layout" },
                        pronunciation: { type: Type.STRING, description: "Korean pronunciation" },
                        meaning: { type: Type.STRING, description: "Korean translation" }
                      },
                      required: ["japanese", "hiragana", "pronunciation", "meaning"]
                    }
                  },
                  required: [
                    "id", "word", "hiragana", "pronunciation", "meaning", "jlptLevel",
                    "kanjiBreakdown", "exampleSentence"
                  ]
                }
              },
              quiz: {
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
              }
            },
            required: ["data", "quiz"]
          }
        }
      });

      const bodyText = response.text || "{}";
      try {
        return JSON.parse(bodyText.trim());
      } catch (parseErr) {
        console.error("Failed to parse single vocab batch JSON response. Body text:", bodyText);
        return { data: [], quiz: [] };
      }
    });

    const parsedBatches = await Promise.all(promises);

    const mergedData: any[] = [];
    let mergedQuiz: any[] = [];
    const seenWords = new Set<string>();

    for (const batch of parsedBatches) {
      if (batch && Array.isArray(batch.data)) {
        for (const item of batch.data) {
          if (item && item.word && !seenWords.has(item.word) && !excludedList.includes(item.word)) {
            seenWords.add(item.word);
            mergedData.push(item);
          }
        }
      }
      if (batch && Array.isArray(batch.quiz)) {
        for (const q of batch.quiz) {
          mergedQuiz.push(q);
        }
      }
    }

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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Japanese professor specializing in creating highly accurate JLPT mock exam questions tailored for Korean learners.",
          responseMimeType: "application/json",
          responseSchema: {
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
          }
        }
      });

      const bodyText = response.text || "[]";
      try {
        return JSON.parse(bodyText.trim());
      } catch (parseErr) {
        console.error("Failed to parse single batch JLPT question JSON response. Body text:", bodyText);
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


// Configure Vite or Serve static built content
async function startServer() {
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

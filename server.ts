import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// A high-quality predefined fallback list of Japanese Kanji elements in case the API key is not yet set or encounters an issue.
const FALLBACK_KANJI = [
  {
    id: "fb_1",
    kanji: "見",
    strokeCount: 7,
    jlptLevel: "N4",
    grade: "초등 1학년",
    meaning: "볼 견",
    mnemonic: "눈(目) 아래에 사람(儿)의 서 있는 다리가 결합된 모습으로, 사람이 직접 눈을 뜨고 사물을 쳐다보고 있으니 '볼 견'입니다.",
    onyomi: "けん",
    onyomiKorean: "켄",
    hunyomi: "み.る",
    hunyomiKorean: "미루",
    radicalsBreakdown: [
      {
            "component": "目",
            "meaning": "눈 목",
            "mnemonic": "눈동자의 중심과 눈꺼풀 모양을 상형화한 글자입니다."
      },
      {
            "component": "儿",
            "meaning": "어진사람 인 / 걷는사람 인",
            "mnemonic": "사람이 서서 두 발로 힘차게 땅을 딛고 서 있는 다리를 묘사한 글자입니다."
      }
],
    relatedWords: [
      { word: "見学", hiragana: "けんがく", pronunciation: "켄가쿠", meaning: "견학" },
      { word: "発見", hiragana: "はっけん", pronunciation: "핫켄", meaning: "발견" },
      { word: "見解", hiragana: "けんかい", pronunciation: "켄카이", meaning: "견해" }
    ],
    exampleSentence: {
      japanese: "森で新しい花を発見しました。",
      hiragana: "もりで あたらしい はな을 はっけんしました。",
      pronunciation: "모리데 아타라시이 하나오 핫켄시마시타.",
      meaning: "숲에서 새로운 꽃을 발견했습니다."
    }
  },
  {
    id: "fb_2",
    kanji: "示",
    strokeCount: 5,
    jlptLevel: "N2",
    grade: "초등 5학년",
    meaning: "보일 시",
    mnemonic: "제단(二) 위에 신에게 제물을 올리는 모습(小)을 형상화한 자로, 신에게 영혼과 신성한 징조를 드러내어 보여준다고 하여 '보일 시' 또는 '가르킬 시'가 되었습니다.",
    onyomi: "じ / し",
    onyomiKorean: "지 / 시",
    hunyomi: "しめ.す",
    hunyomiKorean: "시메스",
    radicalsBreakdown: [
      {
            "component": "二",
            "meaning": "두 이 / 제단",
            "mnemonic": "두 개의 선으로 하늘과 땅, 또는 신성한 제단 상단을 뜻합니다."
      },
      {
            "component": "小",
            "meaning": "적을 소 / 흘러내릴 소",
            "mnemonic": "제단 중심선 아래로 제물의 신성한 피가 뚝뚝 떨어지는 기운을 형상화했습니다."
      }
],
    relatedWords: [
      { word: "指示", hiragana: "しじ", pronunciation: "시지", meaning: "지시" },
      { word: "暗示", hiragana: "あんじ", pronunciation: "안지", meaning: "암시" },
      { word: "提示", hiragana: "ていじ", pronunciation: "테이지", meaning: "제시" }
    ],
    exampleSentence: {
      japanese: "先生의 指示에 したがってください。",
      hiragana: "せんせいの しじ에 したがってください。",
      pronunciation: "센세이노 시지니 시타갓테쿠다사이.",
      meaning: "선생님의 지시에 따라주세요."
    }
  },
  {
    id: "fb_3",
    kanji: "日",
    strokeCount: 4,
    jlptLevel: "N5",
    grade: "초등 1학년",
    meaning: "날 일 / 해 일",
    mnemonic: "하늘에 둥글게 떠 있는 해와 그 가운데에 흑점이 있는 모양을 본뜬 부수로 해, 날짜, 하루를 뜻하는 '날 일'이 되었습니다.",
    onyomi: "にち / じつ",
    onyomiKorean: "니치 / 지츠",
    hunyomi: "ひ / び / か",
    hunyomiKorean: "히 / 비 / 카",
    radicalsBreakdown: [
      {
            "component": "日",
            "meaning": "해 일 / 날 일",
            "mnemonic": "둥근 태양과 중심의 활기찬 태양 흑점을 그려놓은 상형문자입니다."
      }
],
    relatedWords: [
      { word: "日記", hiragana: "にっき", pronunciation: "닛키", meaning: "일기" },
      { word: "祝日", hiragana: "しゅくじつ", pronunciation: "슈쿠지츠", meaning: "축일 (공휴일)" },
      { word: "毎日", hiragana: "まいにち", pronunciation: "마이니치", meaning: "매일" }
    ],
    exampleSentence: {
      japanese: "毎日日本語の日記を書きます。",
      hiragana: "まいにち にほんごの にっきを かきます。",
      pronunciation: "마이니치 니혼고노 닛키오 카키마스.",
      meaning: "매일 일본어 일기를 씁니다."
    }
  },
  {
    id: "fb_4",
    kanji: "木",
    strokeCount: 4,
    jlptLevel: "N5",
    grade: "초등 1학년",
    meaning: "나무 목",
    mnemonic: "뿌리가 땅에 박혀 있고 가지가 양쪽으로 넓게 뻗쳐 있는 울창한 한 그루 나무의 모양을 그대로 본떠서 만든 상형문자 '나무 목'입니다.",
    onyomi: "もく / ぼく",
    onyomiKorean: "모쿠 / 보쿠",
    hunyomi: "き / こ",
    hunyomiKorean: "키 / 코",
    radicalsBreakdown: [
      {
            "component": "木",
            "meaning": "나무 목",
            "mnemonic": "가운데 우뚝 선 줄기, 양옆으로 뻗은 나뭇가지, 아래로 파고든 뿌리를 묘사한 대표 상형문자입니다."
      }
],
    relatedWords: [
      { word: "木曜", hiragana: "もくよう", pronunciation: "모쿠요우", meaning: "목요일" },
      { word: "大木", hiragana: "たいぼく", pronunciation: "타이보쿠", meaning: "대목 (큰 나무)" },
      { word: "木の下", hiragana: "きの下", pronunciation: "きのした", meaning: "나무 아래" }
    ],
    exampleSentence: {
      japanese: "大きな木の下で休みましょう。",
      hiragana: "おおきな きのしたで やすみましょう。",
      pronunciation: "오오키나 키노시타데 야스미마쇼우.",
      meaning: "큰 나무 아래에서 쉽시다."
    }
  },
  {
    id: "fb_5",
    kanji: "水",
    strokeCount: 4,
    jlptLevel: "N5",
    grade: "초등 1학년",
    meaning: "물 수",
    mnemonic: "골짜기 한가운데를 세차게 가르며 굽이쳐 흘러내리는 시냇물 주변의 물방울들이 튀어 흩어지는 역동적인 물길의 형상으로 '물 수'입니다.",
    onyomi: "すい",
    onyomiKorean: "스이",
    hunyomi: "みず",
    hunyomiKorean: "미즈",
    radicalsBreakdown: [
      {
            "component": "水",
            "meaning": "물 수",
            "mnemonic": "가운데 흐르는 주 강줄기의 양옆에 수많은 물방울이 요동치며 떨어지는 기세를 본떴습니다."
      }
],
    relatedWords: [
      { word: "水泳", hiragana: "すいえい", pronunciation: "스이에이", meaning: "수영" },
      { word: "水道", hiragana: "すいdoう", pronunciation: "스이도우", meaning: "수도" },
      { word: "冷たい水", hiragana: "つめたいみず", pronunciation: "츠메타이 미즈", meaning: "차가운 물" }
    ],
    exampleSentence: {
      japanese: "冷たい水を一杯ください。",
      hiragana: "つめたい みず를 いっぱい ください。",
      pronunciation: "츠메타이 미즈오 잇파이 쿠다사이.",
      meaning: "차가운 물을 한 잔 주세요."
    }
  }
];

// POST Endpoint to generate Kanji List
app.post("/api/kanji/generate", async (req, res) => {
  const { count, level, excludeKanji } = req.body;
  const numCount = parseInt(count, 10) || 5;
  const targetLevel = level || "all";
  const excludedList = Array.isArray(excludeKanji) ? excludeKanji : [];

  // Check if API key is empty
  const hasApiKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" ? false : true;

  if (!hasApiKey) {
    console.log("No valid API key found. Returning high quality predefined subset of fallback Kanji list with exclusion.");
    let availableFallback = FALLBACK_KANJI.filter(item => !excludedList.includes(item.kanji));
    if (availableFallback.length === 0) {
      availableFallback = FALLBACK_KANJI;
    }

    const result = [];
    for (let i = 0; i < numCount; i++) {
      const idx = i % availableFallback.length;
      result.push({
        ...availableFallback[idx],
        id: `fb_fallback_${i}_${idx}`
      });
    }
    return res.json({ success: true, isMerged: true, source: "fallback", data: result });
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
        
        The prompt matches the book design style:
        - "mnemonic" (외우는 방법): Create extremely intuitive, vivid, and memorable visual association explanations in Korean, but KEEP IT VERY CONCISE (maximum 1-2 short sentences). Describe the components, like "눈(目)으로 사람(儿)이 하는 것은 보는 것이니 볼 견".
        - "meaning": The Korean Hanja definition, format: "뜻 음" (e.g. "볼 견", "날 일", "말할 왈", "보일 시").
        - "onyomi" is the Japanese 音(음독) in Hiragana, "onyomiKorean" is its Korean pronunciation (e.g. "けん" -> "켄").
        - "hunyomi" is the Japanese 訓(훈독) in Hiragana, "hunyomiKorean" is its Korean pronunciation (e.g. "미.る" -> "미루").
        - "radicalsBreakdown": Provide an array of constituent components or radicals that form this Kanji. For each component, provide its single character ("component"), its Korean meaning ("meaning", e.g., "눈 목"), and a very brief Korean mnemonic visual association storyline ("mnemonic", e.g., "눈(目)은 사람의 눈모습을 세워서 본뜬 모양") strictly under 1 sentence (maximum 15 words) to help study.
        - Provide exactly 3 high-quality, practical "relatedWords" in Japanese containing the main Kanji. Their pronunciation and meaning should represent common usage (e.g. 발견 - はっけん, 핫켄 - 발견).
        - Provide 1 natural "exampleSentence" utilizing one of the main readings or words.

        Make sure to return absolutely valid JSON following the provided responseSchema precisely.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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

    // Fill with fallback if we did not get enough unique characters
    if (mergedData.length < numCount) {
      console.log(`Parallel generator yielded ${mergedData.length} unique kanjis out of ${numCount}. Packing with fallback...`);
      const needed = numCount - mergedData.length;
      let availableFallback = FALLBACK_KANJI.filter(item => !seenKanji.has(item.kanji) && !excludedList.includes(item.kanji));
      if (availableFallback.length === 0) {
        availableFallback = FALLBACK_KANJI;
      }
      for (let i = 0; i < needed; i++) {
        const idx = i % availableFallback.length;
        const fallbackItem = availableFallback[idx];
        seenKanji.add(fallbackItem.kanji);
        mergedData.push({
          ...fallbackItem,
          id: `fb_fill_${Date.now()}_${i}_${idx}`
        });
      }
    }

    const finalData = mergedData.slice(0, numCount);
    res.json({ success: true, source: "gemini_parallel", data: finalData });

  } catch (err: any) {
    console.error("Gemini API generation error:", err);
    // Secure fallback delivery with excludeKanji filtering
    let availableFallback = FALLBACK_KANJI.filter(item => !excludedList.includes(item.kanji));
    if (availableFallback.length === 0) {
      availableFallback = FALLBACK_KANJI;
    }
    const result = [];
    for (let i = 0; i < numCount; i++) {
      const idx = i % availableFallback.length;
      result.push({
        ...availableFallback[idx],
        id: `fb_error_${i}_${idx}`
      });
    }
    res.json({ success: true, isMerged: true, source: "fallback_on_error", data: result, errorMsg: err.message });
  }
});

const FALLBACK_JLPT_QUESTIONS = [
  {
    id: "jlpt_fb_1",
    type: "reading",
    level: "N5",
    questionSentence: "昨日はとてもいい__天気__でした。",
    targetWord: "天気",
    questionText: "__天気__의 올바른 요미가나(읽는 법)를 고르세요.",
    choices: ["てんき (텐키)", "でんき (덴키)", "げんき (겐키)", "てんち (텐치)"],
    correctIndex: 0,
    translation: "어제는 매우 좋은 날씨였습니다.",
    explanation: "내용 해설: 天(하늘 천)은 てん, 気(기운 기)는 き로 읽어서 '날씨'라는 뜻을 이룹니다."
  },
  {
    id: "jlpt_fb_2",
    type: "writing",
    level: "N5",
    questionSentence: "わたしの__ともだ치__은 친절합니다.",
    targetWord: "ともだち",
    questionText: "친절한 친구 뜻의 __ともだち__에 들어갈 올바른 한자(漢字)를 고르세요.",
    choices: ["朋友", "人達", "友達", "供達"],
    correctIndex: 2,
    translation: "내 친구는 친절합니다.",
    explanation: "내용 해설: '친구'는 일본어 友達(ともだち)로 적습니다. 友(벗 우)와 達(통달할 달)이 결합된 표현입니다."
  },
  {
    id: "jlpt_fb_3",
    type: "meaning",
    level: "N5",
    questionSentence: "毎日__日記__を書きます。",
    targetWord: "日記",
    questionText: "밑줄 친 __日記 (にっき)__의 한자어 해석으로 가장 알맞은 것은?",
    choices: ["매일", "일기", "공책", "기록"],
    correctIndex: 1,
    translation: "매일 일기를 씁니다.",
    explanation: "내용 해설: 日(날 일)과 記(기록할 기)가 합쳐져 '일기(日記)'를 뜻하며, 발음은 [にっき](닛키)입니다."
  },
  {
    id: "jlpt_fb_4",
    type: "reading",
    level: "N4",
    questionSentence: "この道は__危ない__ですから気をつけてください。",
    targetWord: "危ない",
    questionText: "__危ない__의 올바른 요미가나를 고르세요.",
    choices: ["くらい", "あぶない", "きたない", "あぶい"],
    correctIndex: 1,
    translation: "이 길은 위험하니까 조심하세요.",
    explanation: "내용 해설: 危険(きけん)의 '危(위태할 위)' 자로, 훈독 형용사 'あぶない'는 위험하다를 뜻합니다."
  },
  {
    id: "jlpt_fb_5",
    type: "writing",
    level: "N4",
    questionSentence: "日曜日は部屋を__そうじ__します。",
    targetWord: "そうじ",
    questionText: "__そうじ__의 올바른 한자(漢字)를 고르세요.",
    choices: ["掃除", "宗時", "総治", "送迎"],
    correctIndex: 0,
    translation: "일요일에는 방을 청소합니다.",
    explanation: "내용 해설: 掃除(そうじ, 청소)는 쓸어낼 '掃(쓸 소)'와 덜어낼 '除(덜 제)'를 뜻합니다."
  },
  {
    id: "jlpt_fb_6",
    type: "reading",
    level: "N3",
    questionSentence: "環境問題を__解決__するために努力しましょう。",
    targetWord: "解決",
    questionText: "__解決__의 올바른 요미가나를 고르세요.",
    choices: ["かいせつ", "かいけつ", "こうけつ", "えいけつ"],
    correctIndex: 1,
    translation: "환경 문제를 해결하기 위해 노력합시다.",
    explanation: "내용 해설: 解決(かいけつ)는 '해결'을 의미합니다. 解(풀 해)는 かい, 決(결단할 결)은 けつ로 읽습니다."
  },
  {
    id: "jlpt_fb_7",
    type: "meaning",
    level: "N3",
    questionSentence: "台風で電車が__遅延__しています。",
    targetWord: "遅延",
    questionText: "밑줄 친 __遅延 (ちえん)__의 뜻으로 가장 적합한 단어를 고르세요.",
    choices: ["취소", "지연 (늦어짐)", "운행 정지", "만원 혼잡"],
    correctIndex: 1,
    translation: "태풍으로 전차가 지연되고 있습니다.",
    explanation: "내용 해설: 遅延(ちえん)은 지연(늦어짐)을 뜻합니다. 遅(늦을 지)는 ち, 延(끌 연)은 えん으로 읽습니다."
  }
];

app.post("/api/jlpt/generate", async (req, res) => {
  const { level: targetLevel, count: numQuestions } = req.body;
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
        model: "gemini-3.5-flash",
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

    if (mergedData.length < numQuestions) {
      console.log(`Parallel generator yielded ${mergedData.length} unique JLPT questions out of ${numQuestions}. Packing with fallback...`);
      const needed = numQuestions - mergedData.length;
      const filtered = FALLBACK_JLPT_QUESTIONS.filter(q => q.level === targetLevel && !seenSentences.has(q.questionSentence));
      const pool = filtered.length > 0 ? filtered : FALLBACK_JLPT_QUESTIONS;
      for (let i = 0; i < needed; i++) {
        const idx = i % pool.length;
        mergedData.push({
          ...pool[idx],
          id: `fb_fill_jlpt_${Date.now()}_${i}_${idx}`
        });
      }
    }

    const finalData = mergedData.slice(0, numQuestions);
    res.json({ success: true, source: "gemini_parallel", data: finalData });

  } catch (err: any) {
    console.error("Gemini API JLPT generation error:", err);
    const filtered = FALLBACK_JLPT_QUESTIONS.filter(q => q.level === targetLevel);
    const result = filtered.length > 0 ? filtered.slice(0, numQuestions) : FALLBACK_JLPT_QUESTIONS.slice(0, numQuestions);
    res.json({ success: true, source: "fallback_on_error", data: result, errorMsg: err.message });
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

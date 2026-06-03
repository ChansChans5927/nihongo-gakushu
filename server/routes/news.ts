import express from "express";
import yts from "yt-search";
import { YoutubeTranscript } from "youtube-transcript";
import { getDB } from "../db.ts";
import { callGeminiJSON, VOCAB_KANJI_BREAKDOWN_SCHEMA, EXAMPLE_SENTENCE_SCHEMA } from "../services/gemini.ts";
import { Type } from "@google/genai";

const router = express.Router();

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

router.get("/random", async (req, res) => {
  const hasProject = !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === "YOUR_GCP_PROJECT_ID" ? false : true;
  if (!hasProject) {
    return res.json({ success: false, errorMsg: "구글 클라우드 프로젝트 ID가 구성되지 않았습니다. .env 파일에 GCP_PROJECT_ID를 설정해 주세요." });
  }

  const db = getDB();

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
      hiragana: "",
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
              type: { type: Type.STRING },
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

    const newsLessonData = {
      id: selectedVideo.videoId,
      title: selectedVideo.title,
      videoUrl: selectedVideo.url,
      subtitles: parsed.processedSubtitles || subtitles,
      vocabItems: parsed.vocabItems || [],
      quizzes: parsed.quizzes || []
    };

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

export default router;

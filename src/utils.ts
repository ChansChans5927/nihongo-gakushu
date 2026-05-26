import { KanjiItem, Question } from "./types";

// Level-specific fallback distractors (N5 to N1) to prevent "flimsy/easy" quizzes
const LEVEL_DECOYS: Record<string, {
  meanings: string[];
  readings: string[];
  kanjis: string[];
  wordMeanings: string[];
}> = {
  N5: {
    meanings: ["날 일", "나무 목", "물 수", "불 화", "흙 토", "달 월", "뫼 산", "시내 천", "사람 인", "한 일", "두 이", "석 삼", "빌 공", "하늘 천"],
    readings: ["にち (니치)", "もく (모쿠)", "すい (스이)", "か (카)", "げつ (게츠)", "じん (진)", "こう (코우)", "てん (텐)", "さん (산)", "いち (이치)"],
    kanjis: ["日", "木", "水", "火", "土", "月", "山", "川", "人", "一", "二", "三", "空", "天"],
    wordMeanings: ["매일", "나무 아래", "공휴일", "화요일", "화산", "매월", "산책", "인기", "하늘", "바람"]
  },
  N4: {
    meanings: ["모일 회", "인간 세", "일 사", "빛 색", "갈 거", "올 래", "들을 청", "말씀 설", "책 책", "글 자"],
    readings: ["かい (かい)", "せい (세이)", "じ (지)", "しょく (쇼쿠)", "きょ (쿄)", "らい (라이)", "せい (세이)", "せつ (세츠)", "さく (사쿠)", "じ (지)"],
    kanjis: ["会", "世", "事", "色", "去", "来", "聞", "説", "書", "字", "駅", "病", "院", "社"],
    wordMeanings: ["회사", "사회", "사건", "설명", "독서", "입원", "퇴원", "역전", "소설", "신문"]
  },
  N3: {
    meanings: ["다스릴 치", "경제 경", "건널 제", "지날 과", "약속 약", "결정 결", "변할 변", "법 법", "뜻 의", "생각할 사"],
    readings: ["ち (치)", "けい (케이)", "さい (사이)", "か (카)", "やく (야쿠)", "けつ (케츠)", "へん (헨)", "ほう (호우)", "い (이)", "し (시)"],
    kanjis: ["治", "経", "済", "過", "約", "결", "변", "법", "意", "思", "政", "官", "科", "術"],
    wordMeanings: ["정치", "경제", "결과", "원인", "과거", "미래", "회의", "의사", "법률", "기술"]
  },
  N2: {
    meanings: ["경계할 경", "위험할 위", "험할 험", "재앙 재", "해할 해", "의지할 의", "부탁할 뢰", "풍부할 풍", "슬기로울 현", "어리석을 우"],
    readings: ["けい (케이)", "き (키)", "けん (켄)", "さい (사이)", "がい (가이)", "い (이)", "らい (라이)", "ほう (호우)", "けん (켄)", "구 (구)"],
    kanjis: ["警", "危", "険", "災", "害", "依", "頼", "豊", "賢", "愚", "震", "障", "暴", "騒", "怒"],
    wordMeanings: ["경비", "위험", "재해", "피해", "의뢰", "풍부", "현명", "어리석음", "장애", "대책"]
  },
  N1: {
    meanings: ["옹호할 옹", "면할 면", "얽힐 구", "탄핵할 탄", "찾을 자", "으뜸 패", "간곡할 간", "말씀 담", "징벌할 징", "추천할 천"],
    readings: ["よう (요우)", "めん (멘)", "きゅう (큐)", "だん (단)", "し (시)", "は (하)", "こん (콘)", "다ん (단)", "ちょう (쵸우)", "せん (센)"],
    kanjis: ["擁", "免", "糾", "弾", "諮", "覇", "懇", "談", "懲", "薦", "罷", "覇", "凝", "縮", "擬"],
    wordMeanings: ["옹호", "파면", "규탄", "자문", "패권", "간담", "징계", "추천", "부정", "모방"]
  }
};

/**
 * Dynamically generates multiple choice questions based on the selected Kanji list.
 * This guarantees questions are customized to exactly what the user studied.
 */
export function generateQuiz(kanjiList: KanjiItem[]): Question[] {
  const questions: Question[] = [];
  
  kanjiList.forEach((item, index) => {
    // Dynamically distribute different question structures:
    // 0: Hanja Meaning ("뜻과 음 맞추기")
    // 1: Onyomi/Reading ("음독/훈독 읽기 맞추기")
    // 2: Related Word Meaning ("관련 단어 뜻 맞추기")
    // 3: Match Kanji from meaning ("뜻/음 보고 한자 맞추기")
    const typeIndex = index % 4;
    let type: 'meaning' | 'reading' | 'word_meaning' | 'kanji_match' = 'meaning';
    
    if (typeIndex === 1) type = 'reading';
    else if (typeIndex === 2) type = 'word_meaning';
    else if (typeIndex === 3) type = 'kanji_match';

    let questionText = "";
    let choices: string[] = [];
    let correctValue = "";

    // Resolve level decoy fallback pool based on target Kanji's JLPT level
    const levelKey = (item.jlptLevel && LEVEL_DECOYS[item.jlptLevel]) ? item.jlptLevel : "N3";
    const levelDecoy = LEVEL_DECOYS[levelKey];

    if (type === 'meaning') {
      questionText = `한자 '${item.kanji}'의 올바른 한국어 뜻과 음은 무엇일까요?`;
      correctValue = item.meaning;

      const decoys = kanjiList
        .filter((k) => k.kanji !== item.kanji)
        .map((k) => k.meaning);
      choices = shuffle([correctValue, ...getDistinctValues(decoys, 3, correctValue, levelDecoy.meanings)]);
    } else if (type === 'reading') {
      questionText = `한자 '${item.kanji}'의 올바른 소리(음독) 표기와 한국어 발음은 무엇일까요?`;
      correctValue = `${item.onyomi} (한국어 발음: ${item.onyomiKorean})`;

      const decoys = kanjiList
        .filter((k) => k.kanji !== item.kanji)
        .map((k) => `${k.onyomi} (한국어 발음: ${k.onyomiKorean})`);
      choices = shuffle([correctValue, ...getDistinctValues(decoys, 3, correctValue, levelDecoy.readings)]);
    } else if (type === 'word_meaning') {
      // Use first available related word
      const rWord = item.relatedWords[0] || { word: "見학", meaning: "견학", hiragana: "けん가く" };
      questionText = `단어 '${rWord.word}' (${rWord.hiragana})의 올바른 한국어 뜻은 무엇일까요?`;
      correctValue = rWord.meaning;

      const decoys = kanjiList
        .filter((k) => k.kanji !== item.kanji)
        .map((k) => k.relatedWords[0]?.meaning || k.meaning);
      choices = shuffle([correctValue, ...getDistinctValues(decoys, 3, correctValue, levelDecoy.wordMeanings)]);
    } else {
      questionText = `한국어 뜻과 음이 '${item.meaning}'인 알맞은 일본어 한자는 무엇일까요?`;
      correctValue = item.kanji;

      const decoys = kanjiList
        .filter((k) => k.kanji !== item.kanji)
        .map((k) => k.kanji);
      choices = shuffle([correctValue, ...getDistinctValues(decoys, 3, correctValue, levelDecoy.kanjis)]);
    }

    const correctIndex = choices.indexOf(correctValue);

    questions.push({
      id: index + 1,
      type,
      kanjiItem: item,
      questionText,
      choices,
      correctIndex
    });
  });

  return questions;
}

function getDistinctValues(arr: string[], count: number, exceptValue: string, fallbackPool: string[]): string[] {
  const uniques = Array.from(new Set(arr)).filter((v) => v && v !== exceptValue);
  const shuffled = uniques.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  // Fill in if there aren't enough unique alternative answers from the quiz list
  let fallbackIndex = 0;
  const shuffledFallbackPool = [...fallbackPool].sort(() => 0.5 - Math.random());
  while (selected.length < count && fallbackIndex < shuffledFallbackPool.length) {
    const fallback = shuffledFallbackPool[fallbackIndex++];
    if (!selected.includes(fallback) && fallback !== exceptValue) {
      selected.push(fallback);
    }
  }
  
  // Last resort fillers
  while (selected.length < count) {
    selected.push(`임의보기 ${selected.length + 1}`);
  }

  return selected;
}

function shuffle(array: string[]): string[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

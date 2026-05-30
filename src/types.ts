export interface RelatedWord {
  word: string;          // e.g. "見学"
  hiragana: string;      // e.g. "けん가く"
  pronunciation: string; // e.g. "켄가쿠"
  meaning: string;       // e.g. "견학"
}

export interface RadicalPart {
  component: string;     // e.g. "衣(礻)"
  meaning: string;       // e.g. "옷 의 (부수, 모양이 변형됨)"
  mnemonic?: string;     // Image association mnemonic / story for this sub-character
  onyomi?: string;       // Japanese Onyomi
  onyomiKorean?: string; // Korean spelling for Onyomi
  hunyomi?: string;      // Japanese Hunyomi
  hunyomiKorean?: string; // Korean spelling for Hunyomi
}

export interface KanjiItem {
  id: string;            // unique identifier
  kanji: string;         // Chinese character (e.g. "見")
  strokeCount: number;   // Number of strokes (e.g. 7)
  jlptLevel: string;     // e.g. "N5" | "N4" | "N3" | "N2" | "N1"
  grade: string;         // e.g. "초등 1학년" 
  mnemonic: string;      // Easy association mnemonics storyboard
  meaning: string;       // Korean translation of the character (e.g. "볼 견")

  // Onyomi (Chinese Reading)
  onyomi: string;        // Hiragana (e.g. "けん")
  onyomiKorean: string;  // Korean sound (e.g. "켄")

  // Hunyomi (Japanese Reading)
  hunyomi: string;       // Hiragana (e.g. "み.る")
  hunyomiKorean: string; // Korean sound (e.g. "미루")

  relatedWords: RelatedWord[];
  radicalsBreakdown?: RadicalPart[]; // Explanation of building block components or radicals in Kanji

  exampleSentence: {
    japanese: string;      // Japanese (e.g. "新しい発見がありました。")
    hiragana: string;      // Kanji written in Hiragana (e.g. "あたらしい はっけん가 ありました。")
    pronunciation: string;  // Korean phonetics (e.g. "아타라시이 핫켄가 아리마시타.")
    meaning: string;       // Korean translation (e.g. "새로운 발견이 있었습니다.")
  };
}

export interface Question {
  id: number;
  type: 'meaning' | 'reading' | 'word_meaning' | 'kanji_match' | 'blank_fill';
  kanjiItem?: KanjiItem;
  vocabItem?: VocabItem;
  questionText: string;
  choices: string[];
  correctIndex: number;
  questionSentence?: string;
  explanation?: string;
}

export interface KanjiMnemonicBreakdown {
  kanji: string;
  meaning: string;
  mnemonic: string;
}

export interface VocabItem {
  id: string;
  word: string;
  hiragana: string;
  pronunciation: string;
  meaning: string;
  jlptLevel: string;
  kanjiBreakdown: KanjiMnemonicBreakdown[];
  exampleSentence: {
    japanese: string;
    hiragana: string;
    pronunciation: string;
    meaning: string;
  };
}

export interface JlptQuestion {
  id: string;
  type: 'reading' | 'writing' | 'meaning' | 'context_fit'; // reading: 한자 읽기, writing: 올바른 한자 고르기, meaning: 올바른 어휘 뜻, context_fit: 알맞은 어휘 빈칸 채우기
  level: string; // N5, N4, N3, N2, N1
  questionSentence: string;
  targetWord: string;
  questionText: string;
  choices: string[];
  correctIndex: number;
  translation: string;
  explanation: string;
}

export interface UserSession {
  username: string;
}

export interface SubtitleLine {
  start: number;         // 시작 시간 (초 단위)
  duration: number;      // 지속 시간 (초 단위)
  japanese: string;      // 일본어 자막
  hiragana?: string;     // 히라가나 자막 (독음 지원)
  pronunciation?: string; // 한국어 독음 (한글 발음 지원)
  korean: string;        // 한국어 번역 자막
}

export interface NewsLesson {
  id: string;            // 유튜브 비디오 ID
  title: string;         // 뉴스 영상 제목
  videoUrl: string;      // 유튜브 비디오 URL
  subtitles: SubtitleLine[]; // 전체 자막 목록
  vocabItems: VocabItem[];   // 뉴스 분석을 통해 추출한 중요 어휘들 (기존 VocabItem 재사용)
  quizzes: Question[];   // 중요 어휘 학습 이후 풀이할 객관식 퀴즈들 (기존 Question 재사용)
}



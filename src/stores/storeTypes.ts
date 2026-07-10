/**
 * 전역 스토어 슬라이스 타입 정의
 * - 모든 슬라이스 인터페이스를 한 곳에 정의하여 순환 의존성(Circular Dependency)을 방지합니다.
 * - 각 슬라이스 파일은 이 파일에서 StudyState를 import하여 StateCreator 제네릭에 사용합니다.
 */
import { KanjiItem, VocabItem, Question, JlptQuestion } from "../types";

// ─────────────────────────────────────────────
// 1. 한자 학습 슬라이스 인터페이스
// ─────────────────────────────────────────────
export interface KanjiSlice {
  kanjiCount: number;                                              // 공부할 한자 개수
  kanjiList: KanjiItem[];                                          // 현재 로딩된 한자 카드 목록
  currentKanjiIndex: number;                                       // 현재 카드 인덱스

  setKanjiCount: (count: number) => void;                          // 한자 개수 설정
  startKanjiStudy: (isReviewOverride?: boolean, targetItem?: string, level?: string) => Promise<void>;  // 한자 학습 시작 (신규/복습/딥링크)
  saveMasteredKanji: (list: string[], newlyLearned?: string[]) => Promise<void>;  // 외운 한자 서버 저장
  handleResetMastery: () => Promise<void>;                         // 한자 암기 초기화
}

// ─────────────────────────────────────────────
// 2. 단어 학습 슬라이스 인터페이스
// ─────────────────────────────────────────────
export interface VocabSlice {
  vocabCount: number;                                              // 공부할 단어 개수
  vocabList: VocabItem[];                                          // 현재 로딩된 단어 카드 목록
  currentVocabIndex: number;                                       // 현재 카드 인덱스
  vocabQuestions: Question[];                                      // 서버에서 받은 단어 퀴즈

  setVocabCount: (count: number) => void;                          // 단어 개수 설정
  startVocabStudy: (isReviewOverride?: boolean, targetItem?: string, level?: string) => Promise<void>;  // 단어 학습 시작 (신규/복습/딥링크)
  saveMasteredVocab: (list: string[], newlyLearned?: string[]) => Promise<void>;  // 외운 단어 서버 저장
  handleResetVocabMastery: () => Promise<void>;                    // 단어 암기 초기화
}

// ─────────────────────────────────────────────
// 3. JLPT 모의고사 슬라이스 인터페이스
// ─────────────────────────────────────────────
export interface JlptSlice {
  jlptCount: number;                                               // 출제 문항 개수
  selectedJlptLevel: string;                                       // 선택된 JLPT 레벨 (N5~N1)
  jlptQuestions: JlptQuestion[];                                   // JLPT 문제 배열
  currentJlptIndex: number;                                        // 현재 문제 인덱스
  jlptAnswers: { [questionId: string]: number };                   // 유저 답안 맵
  isJlptGraded: boolean;                                           // 채점 완료 여부
  isJlptLoading: boolean;                                          // 로딩 중 여부
  jlptErrorMsg: string | null;                                     // 에러 메시지

  setJlptCount: (count: number) => void;                           // 문항 개수 설정
  setSelectedJlptLevel: (level: string) => void;                   // JLPT 레벨 설정
  startJlptQuiz: () => Promise<void>;                              // JLPT 퀴즈 시작
  handleSelectJlptAnswer: (choiceIndex: number) => void;           // JLPT 답 선택
  handleNextJlptQuestion: () => void;                              // 다음 JLPT 문제
  handlePrevJlptQuestion: () => void;                              // 이전 JLPT 문제
  handleGradeJlptQuiz: () => Promise<void>;                        // JLPT 채점
  handleGoHomeJlpt: () => Promise<void>;                           // JLPT 화면에서 홈으로
}



// ─────────────────────────────────────────────
// 5. 유저 진행도·북마크·포인트·테마 공통 슬라이스
// ─────────────────────────────────────────────
export interface ProgressSlice {
  masteredKanji: string[];                                         // 외운 한자 목록
  masteredVocab: string[];                                         // 외운 단어 목록
  bookmarkedKanjis: string[];                                      // 한자 북마크
  bookmarkedVocabs: string[];                                      // 단어 북마크
  points: number;                                                  // 유저 포인트
  unlockedThemes: string[];                                        // 해금된 테마 목록
  currentTheme: string;                                            // 현재 적용 테마
  studyLogs: { [date: string]: number };                            // 일별 학습 기록 (YYYY-MM-DD -> 수량)
  claimedWeeklyRewards: string[];                                  // 수령 완료한 주간 보상 (월요일 날짜 문자열)
  claimedMilestones: string[];                                     // 수령 완료한 마일스톤 ("15", "30", "100")

  setCurrentTheme: (theme: string) => void;                        // 테마 설정
  setUnlockedThemes: (themes: string[]) => void;                   // 해금 테마 설정
  setPoints: (points: number) => void;                             // 포인트 설정
  fetchUserProgress: (username: string) => Promise<void>;          // 서버에서 진행도 불러오기
  resetProgressState: () => void;                                  // 진행도 전체 초기화
  handleToggleBookmark: (type: "kanji" | "vocab", item: string) => Promise<void>; // 북마크 토글
  claimWeeklyReward: (weekStart: string) => Promise<boolean>;      // 주간 완주 보상 수령
  claimMilestoneReward: (milestone: string) => Promise<boolean>;   // 누적 마일스톤 보상 수령
}

// ─────────────────────────────────────────────
// 6. 공용 오케스트레이션 슬라이스 인터페이스
//    (여러 도메인에 걸쳐 동작하는 화면 전환·퀴즈 공용 상태)
// ─────────────────────────────────────────────
export interface SharedSlice {
  phase: 'config' | 'studying' | 'testing' | 'result' | 'settings' | 'jlpt' | 'shop' | 'bookmarks';
  studyMode: 'kanji' | 'vocab' | 'bookmark-kanji' | 'bookmark-vocab';           // 한자/단어/북마크 모드
  difficulty: string;                                              // 공통 난이도 (JLPT 레벨)
  questions: Question[];                                           // 한자·단어 퀴즈 공용 문제 배열
  currentQuestionIndex: number;                                    // 현재 퀴즈 문제 인덱스
  userAnswers: { [questionId: number]: number };                   // 퀴즈 유저 답안
  isGraded: boolean;                                               // 퀴즈 채점 완료 여부
  isLoading: boolean;                                              // 한자·단어 공통 로딩
  errorMsg: string | null;                                         // 한자·단어 공통 에러
  apiSource: 'gemini' | 'openai' | 'fallback' | 'mongodb_cache';                                  // 사용할 AI API 소스

  setPhase: (phase: SharedSlice['phase']) => void;                 // 화면 페이즈 설정
  setStudyMode: (mode: SharedSlice['studyMode']) => void;          // 학습 모드 설정
  setDifficulty: (diff: string) => void;                           // 난이도 설정
  handleSelectAnswer: (choiceIndex: number) => void;               // 공용 퀴즈 답안 선택
  handleNextStudy: () => void;                                     // 학습 화면에서 다음 카드로
  handlePrevStudy: () => void;                                     // 학습 화면에서 이전 카드로
  handleNextQuestion: () => void;                                  // 공용 퀴즈 다음 문제로
  handlePrevQuestion: () => void;                                  // 공용 퀴즈 이전 문제로
  handleGradeQuiz: () => Promise<void>;                            // 공용 퀴즈 채점
  handleGoHome: () => void;                                        // 메인 화면으로 돌아가기
  startBookmarkQuiz: (type: 'kanji' | 'vocab', items: any[]) => void; // 북마크 전용 퀴즈 시작
}

// ─────────────────────────────────────────────
// 전체 합성 스토어 타입 (모든 슬라이스의 합집합)
// ─────────────────────────────────────────────
export type StudyState = KanjiSlice & VocabSlice & JlptSlice & ProgressSlice & SharedSlice;

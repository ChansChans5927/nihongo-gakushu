import { create } from 'zustand';
import { KanjiItem, Question, JlptQuestion, VocabItem, UserSession, NewsLesson } from '../types';

export type PhaseType = 'config' | 'studying' | 'testing' | 'result' | 'news-study' | 'settings' | 'jlpt' | 'shop' | 'bookmarks';
export type StudyModeType = 'kanji' | 'vocab';

type Updater<T> = T | ((prev: T) => T);

interface AppState {
  // App Phase States
  phase: PhaseType;
  setPhase: (phase: Updater<PhaseType>) => void;

  // Configuration Settings
  kanjiCount: number;
  setKanjiCount: (count: Updater<number>) => void;
  difficulty: string;
  setDifficulty: (level: Updater<string>) => void;
  jlptCount: number;
  setJlptCount: (count: Updater<number>) => void;

  // Quiz and Study lists
  kanjiList: KanjiItem[];
  setKanjiList: (list: Updater<KanjiItem[]>) => void;
  currentKanjiIndex: number;
  setCurrentKanjiIndex: (index: Updater<number>) => void;

  // Testing States
  questions: Question[];
  setQuestions: (questions: Updater<Question[]>) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: Updater<number>) => void;
  userAnswers: { [questionId: number]: number };
  setUserAnswers: (answers: Updater<{ [questionId: number]: number }>) => void;
  isGraded: boolean;
  setIsGraded: (graded: Updater<boolean>) => void;

  // Mastered Kanji List
  masteredKanji: string[];
  setMasteredKanji: (kanji: Updater<string[]>) => void;

  // Study Mode State
  studyMode: StudyModeType;
  setStudyMode: (mode: Updater<StudyModeType>) => void;

  // Economy & Theme States
  points: number;
  setPoints: (points: Updater<number>) => void;
  unlockedThemes: string[];
  setUnlockedThemes: (themes: Updater<string[]>) => void;
  currentTheme: string;
  setCurrentTheme: (theme: Updater<string>) => void;

  // Vocab States
  vocabCount: number;
  setVocabCount: (count: Updater<number>) => void;
  vocabList: VocabItem[];
  setVocabList: (list: Updater<VocabItem[]>) => void;
  currentVocabIndex: number;
  setCurrentVocabIndex: (index: Updater<number>) => void;
  masteredVocab: string[];
  setMasteredVocab: (vocab: Updater<string[]>) => void;
  vocabQuestions: Question[];
  setVocabQuestions: (questions: Updater<Question[]>) => void;

  // Bookmark States
  bookmarkedKanjis: string[];
  setBookmarkedKanjis: (kanjis: Updater<string[]>) => void;
  bookmarkedVocabs: string[];
  setBookmarkedVocabs: (vocabs: Updater<string[]>) => void;

  // JLPT Past Exam Subsystem States
  selectedJlptLevel: string;
  setSelectedJlptLevel: (level: Updater<string>) => void;
  jlptQuestions: JlptQuestion[];
  setJlptQuestions: (questions: Updater<JlptQuestion[]>) => void;
  currentJlptIndex: number;
  setCurrentJlptIndex: (index: Updater<number>) => void;
  jlptAnswers: { [questionId: string]: number };
  setJlptAnswers: (answers: Updater<{ [questionId: string]: number }>) => void;
  isJlptGraded: boolean;
  setIsJlptGraded: (graded: Updater<boolean>) => void;
  isJlptLoading: boolean;
  setIsJlptLoading: (loading: Updater<boolean>) => void;
  jlptErrorMsg: string | null;
  setJlptErrorMsg: (msg: Updater<string | null>) => void;

  // News Study States
  newsLesson: NewsLesson | null;
  setNewsLesson: (lesson: Updater<NewsLesson | null>) => void;
  isNewsLoading: boolean;
  setIsNewsLoading: (loading: Updater<boolean>) => void;
  newsErrorMsg: string | null;
  setNewsErrorMsg: (msg: Updater<string | null>) => void;

  // Loading & Error boundary states
  isLoading: boolean;
  setIsLoading: (loading: Updater<boolean>) => void;
  errorMsg: string | null;
  setErrorMsg: (msg: Updater<string | null>) => void;
  apiSource: string;
  setApiSource: (source: Updater<string>) => void;

  // User Authentication & Review States
  currentUser: UserSession | null;
  setCurrentUser: (user: Updater<UserSession | null>) => void;
  isReviewMode: boolean;
  setIsReviewMode: (review: Updater<boolean>) => void;

  // Complex Actions
  resetQuizState: () => void;
  resetJlptState: () => void;
}

export const useAppState = create<AppState>((set) => ({
  // Initial States
  phase: 'config',
  kanjiCount: 5,
  difficulty: 'all',
  jlptCount: 5,
  kanjiList: [],
  currentKanjiIndex: 0,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  isGraded: false,
  masteredKanji: [],
  studyMode: 'kanji',
  points: 0,
  unlockedThemes: ['default'],
  currentTheme: 'default',
  vocabCount: 5,
  vocabList: [],
  currentVocabIndex: 0,
  masteredVocab: [],
  vocabQuestions: [],
  bookmarkedKanjis: [],
  bookmarkedVocabs: [],
  selectedJlptLevel: 'N5',
  jlptQuestions: [],
  currentJlptIndex: 0,
  jlptAnswers: {},
  isJlptGraded: false,
  isJlptLoading: false,
  jlptErrorMsg: null,
  newsLesson: null,
  isNewsLoading: false,
  newsErrorMsg: null,
  isLoading: false,
  errorMsg: null,
  apiSource: 'gemini',
  currentUser: null,
  isReviewMode: false,

  // Setters
  setPhase: (val) => set((state) => ({ phase: typeof val === 'function' ? (val as any)(state.phase) : val })),
  setKanjiCount: (val) => set((state) => ({ kanjiCount: typeof val === 'function' ? (val as any)(state.kanjiCount) : val })),
  setDifficulty: (val) => set((state) => ({ difficulty: typeof val === 'function' ? (val as any)(state.difficulty) : val })),
  setJlptCount: (val) => set((state) => ({ jlptCount: typeof val === 'function' ? (val as any)(state.jlptCount) : val })),
  setKanjiList: (val) => set((state) => ({ kanjiList: typeof val === 'function' ? (val as any)(state.kanjiList) : val })),
  setCurrentKanjiIndex: (val) => set((state) => ({ currentKanjiIndex: typeof val === 'function' ? (val as any)(state.currentKanjiIndex) : val })),
  setQuestions: (val) => set((state) => ({ questions: typeof val === 'function' ? (val as any)(state.questions) : val })),
  setCurrentQuestionIndex: (val) => set((state) => ({ currentQuestionIndex: typeof val === 'function' ? (val as any)(state.currentQuestionIndex) : val })),
  setUserAnswers: (val) => set((state) => ({ userAnswers: typeof val === 'function' ? (val as any)(state.userAnswers) : val })),
  setIsGraded: (val) => set((state) => ({ isGraded: typeof val === 'function' ? (val as any)(state.isGraded) : val })),
  setMasteredKanji: (val) => set((state) => ({ masteredKanji: typeof val === 'function' ? (val as any)(state.masteredKanji) : val })),
  setStudyMode: (val) => set((state) => ({ studyMode: typeof val === 'function' ? (val as any)(state.studyMode) : val })),
  setPoints: (val) => set((state) => ({ points: typeof val === 'function' ? (val as any)(state.points) : val })),
  setUnlockedThemes: (val) => set((state) => ({ unlockedThemes: typeof val === 'function' ? (val as any)(state.unlockedThemes) : val })),
  setCurrentTheme: (val) => set((state) => ({ currentTheme: typeof val === 'function' ? (val as any)(state.currentTheme) : val })),
  setVocabCount: (val) => set((state) => ({ vocabCount: typeof val === 'function' ? (val as any)(state.vocabCount) : val })),
  setVocabList: (val) => set((state) => ({ vocabList: typeof val === 'function' ? (val as any)(state.vocabList) : val })),
  setCurrentVocabIndex: (val) => set((state) => ({ currentVocabIndex: typeof val === 'function' ? (val as any)(state.currentVocabIndex) : val })),
  setMasteredVocab: (val) => set((state) => ({ masteredVocab: typeof val === 'function' ? (val as any)(state.masteredVocab) : val })),
  setVocabQuestions: (val) => set((state) => ({ vocabQuestions: typeof val === 'function' ? (val as any)(state.vocabQuestions) : val })),
  setBookmarkedKanjis: (val) => set((state) => ({ bookmarkedKanjis: typeof val === 'function' ? (val as any)(state.bookmarkedKanjis) : val })),
  setBookmarkedVocabs: (val) => set((state) => ({ bookmarkedVocabs: typeof val === 'function' ? (val as any)(state.bookmarkedVocabs) : val })),
  setSelectedJlptLevel: (val) => set((state) => ({ selectedJlptLevel: typeof val === 'function' ? (val as any)(state.selectedJlptLevel) : val })),
  setJlptQuestions: (val) => set((state) => ({ jlptQuestions: typeof val === 'function' ? (val as any)(state.jlptQuestions) : val })),
  setCurrentJlptIndex: (val) => set((state) => ({ currentJlptIndex: typeof val === 'function' ? (val as any)(state.currentJlptIndex) : val })),
  setJlptAnswers: (val) => set((state) => ({ jlptAnswers: typeof val === 'function' ? (val as any)(state.jlptAnswers) : val })),
  setIsJlptGraded: (val) => set((state) => ({ isJlptGraded: typeof val === 'function' ? (val as any)(state.isJlptGraded) : val })),
  setIsJlptLoading: (val) => set((state) => ({ isJlptLoading: typeof val === 'function' ? (val as any)(state.isJlptLoading) : val })),
  setJlptErrorMsg: (val) => set((state) => ({ jlptErrorMsg: typeof val === 'function' ? (val as any)(state.jlptErrorMsg) : val })),
  setNewsLesson: (val) => set((state) => ({ newsLesson: typeof val === 'function' ? (val as any)(state.newsLesson) : val })),
  setIsNewsLoading: (val) => set((state) => ({ isNewsLoading: typeof val === 'function' ? (val as any)(state.isNewsLoading) : val })),
  setNewsErrorMsg: (val) => set((state) => ({ newsErrorMsg: typeof val === 'function' ? (val as any)(state.newsErrorMsg) : val })),
  setIsLoading: (val) => set((state) => ({ isLoading: typeof val === 'function' ? (val as any)(state.isLoading) : val })),
  setErrorMsg: (val) => set((state) => ({ errorMsg: typeof val === 'function' ? (val as any)(state.errorMsg) : val })),
  setApiSource: (val) => set((state) => ({ apiSource: typeof val === 'function' ? (val as any)(state.apiSource) : val })),
  setCurrentUser: (val) => set((state) => ({ currentUser: typeof val === 'function' ? (val as any)(state.currentUser) : val })),
  setIsReviewMode: (val) => set((state) => ({ isReviewMode: typeof val === 'function' ? (val as any)(state.isReviewMode) : val })),

  // Complex Actions
  resetQuizState: () => set({
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    isGraded: false,
    vocabQuestions: [],
    errorMsg: null,
  }),
  resetJlptState: () => set({
    jlptQuestions: [],
    currentJlptIndex: 0,
    jlptAnswers: {},
    isJlptGraded: false,
    jlptErrorMsg: null,
  })
}));

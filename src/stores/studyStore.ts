import { create } from "zustand";
import { KanjiItem, VocabItem, Question, JlptQuestion, NewsLesson } from "../types";
import { generateQuiz, generateVocabQuiz } from "../utils";
import { useAuthStore } from "./authStore";

interface StudyState {
  phase: 'config' | 'studying' | 'testing' | 'result' | 'news-study' | 'settings' | 'jlpt' | 'shop' | 'bookmarks';
  kanjiCount: number;
  difficulty: string;
  jlptCount: number;
  kanjiList: KanjiItem[];
  currentKanjiIndex: number;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [questionId: number]: number };
  isGraded: boolean;
  masteredKanji: string[];
  studyMode: 'kanji' | 'vocab';
  points: number;
  unlockedThemes: string[];
  currentTheme: string;
  vocabCount: number;
  vocabList: VocabItem[];
  currentVocabIndex: number;
  masteredVocab: string[];
  vocabQuestions: Question[];
  bookmarkedKanjis: string[];
  bookmarkedVocabs: string[];
  selectedJlptLevel: string;
  jlptQuestions: JlptQuestion[];
  currentJlptIndex: number;
  jlptAnswers: { [questionId: string]: number };
  isJlptGraded: boolean;
  isJlptLoading: boolean;
  jlptErrorMsg: string | null;
  newsLesson: NewsLesson | null;
  isNewsLoading: boolean;
  newsErrorMsg: string | null;
  isLoading: boolean;
  errorMsg: string | null;
  apiSource: string;

  // Setters
  setPhase: (phase: StudyState['phase']) => void;
  setKanjiCount: (count: number) => void;
  setDifficulty: (difficulty: string) => void;
  setJlptCount: (count: number) => void;
  setVocabCount: (count: number) => void;
  setSelectedJlptLevel: (level: string) => void;
  setCurrentTheme: (theme: string) => void;
  setUnlockedThemes: (themes: string[]) => void;
  setPoints: (points: number) => void;
  setStudyMode: (mode: StudyState['studyMode']) => void;
  
  // Actions
  fetchUserProgress: (username: string) => Promise<void>;
  resetProgressState: () => void;
  saveMasteredKanji: (list: string[], newlyLearned?: string[]) => Promise<void>;
  handleResetMastery: () => Promise<void>;
  saveMasteredVocab: (list: string[], newlyLearned?: string[]) => Promise<void>;
  handleResetVocabMastery: () => Promise<void>;
  handleToggleBookmark: (type: "kanji" | "vocab", item: string) => Promise<void>;
  startKanjiStudy: (isReviewOverride?: boolean) => Promise<void>;
  startVocabStudy: (isReviewOverride?: boolean) => Promise<void>;
  startJlptQuiz: () => Promise<void>;
  startNewsStudy: () => Promise<void>;
  handleSelectAnswer: (choiceIndex: number) => void;
  handleNextStudy: () => void;
  handlePrevStudy: () => void;
  handleNextQuestion: () => void;
  handlePrevQuestion: () => void;
  handleGradeQuiz: () => Promise<void>;
  handleSelectJlptAnswer: (choiceIndex: number) => void;
  handleNextJlptQuestion: () => void;
  handlePrevJlptQuestion: () => void;
  handleGradeJlptQuiz: () => Promise<void>;
  handleGoHomeJlpt: () => void;
  handleGoHome: () => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
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
  unlockedThemes: ["default"],
  currentTheme: "default",
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

  // Setters
  setPhase: (phase) => set({ phase }),
  setKanjiCount: (kanjiCount) => set({ kanjiCount }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setJlptCount: (jlptCount) => set({ jlptCount }),
  setVocabCount: (vocabCount) => set({ vocabCount }),
  setSelectedJlptLevel: (selectedJlptLevel) => set({ selectedJlptLevel }),
  setCurrentTheme: (currentTheme) => set({ currentTheme }),
  setUnlockedThemes: (unlockedThemes) => set({ unlockedThemes }),
  setPoints: (points) => set({ points }),
  setStudyMode: (studyMode) => set({ studyMode }),

  fetchUserProgress: async (username: string) => {
    try {
      const response = await fetch(`/api/progress/get?username=${encodeURIComponent(username)}`);
      const resData = await response.json();
      if (resData.success) {
        set({
          masteredKanji: resData.masteredKanjis || [],
          masteredVocab: resData.masteredVocabs || [],
          bookmarkedKanjis: resData.bookmarkedKanjis || [],
          bookmarkedVocabs: resData.bookmarkedVocabs || [],
          points: resData.points || 0,
          unlockedThemes: resData.unlockedThemes || ["default"],
          currentTheme: resData.currentTheme || "default"
        });

        // Sync local storage data if user previously worked offline/without account
        const localKanji = localStorage.getItem("mastered_kanji");
        const localVocab = localStorage.getItem("mastered_vocab");
        let syncKanjis: string[] = [];
        let syncVocabs: string[] = [];

        if (localKanji) {
          try {
            const parsed = JSON.parse(localKanji);
            syncKanjis = parsed.filter((item: string) => !(resData.masteredKanjis || []).includes(item));
          } catch (e) { }
          localStorage.removeItem("mastered_kanji");
        }
        if (localVocab) {
          try {
            const parsed = JSON.parse(localVocab);
            syncVocabs = parsed.filter((item: string) => !(resData.masteredVocabs || []).includes(item));
          } catch (e) { }
          localStorage.removeItem("mastered_vocab");
        }

        if (syncKanjis.length > 0) {
          await fetch("/api/progress/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, type: "kanji", items: syncKanjis })
          });
          set({ masteredKanji: Array.from(new Set([...get().masteredKanji, ...syncKanjis])) });
        }
        if (syncVocabs.length > 0) {
          await fetch("/api/progress/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, type: "vocab", items: syncVocabs })
          });
          set({ masteredVocab: Array.from(new Set([...get().masteredVocab, ...syncVocabs])) });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user progress from DB:", err);
    }
  },

  resetProgressState: () => {
    set({
      masteredKanji: [],
      masteredVocab: [],
      bookmarkedKanjis: [],
      bookmarkedVocabs: [],
      points: 0,
      unlockedThemes: ["default"],
      currentTheme: "default"
    });
  },

  saveMasteredKanji: async (list: string[], newlyLearned: string[] = []) => {
    set({ masteredKanji: list });
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;
    if (currentUser && newlyLearned.length > 0) {
      try {
        const masteredDetails = get().kanjiList.filter(item => newlyLearned.includes(item.kanji));
        await fetch("/api/progress/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "kanji",
            items: newlyLearned,
            cardDetails: masteredDetails
          })
        });
      } catch (err) {
        console.error("Failed to save mastered kanji to DB:", err);
      }
    }
  },

  handleResetMastery: async () => {
    if (window.confirm("외운 한자 내역을 전부 초기화하고 처음부터 다시 공부하시겠습니까?")) {
      set({ masteredKanji: [] });
      const authStore = useAuthStore.getState();
      const currentUser = authStore.currentUser;
      if (currentUser) {
        try {
          await fetch("/api/progress/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser.username, type: "kanji" })
          });
        } catch (err) {
          console.error("Failed to reset progress in DB:", err);
        }
      }
    }
  },

  saveMasteredVocab: async (list: string[], newlyLearned: string[] = []) => {
    set({ masteredVocab: list });
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;
    if (currentUser && newlyLearned.length > 0) {
      try {
        const masteredDetails = get().vocabList.filter(item => newlyLearned.includes(item.word));
        const masteredQuizzes = get().vocabQuestions.filter(q => newlyLearned.includes(q.targetWord || ""));
        await fetch("/api/progress/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "vocab",
            items: newlyLearned,
            cardDetails: masteredDetails,
            quizDetails: masteredQuizzes
          })
        });
      } catch (err) {
        console.error("Failed to save mastered vocab to DB:", err);
      }
    }
  },

  handleResetVocabMastery: async () => {
    if (window.confirm("외운 단어 내역을 전부 초기화하고 처음부터 다시 공부하시겠습니까?")) {
      set({ masteredVocab: [] });
      const authStore = useAuthStore.getState();
      const currentUser = authStore.currentUser;
      if (currentUser) {
        try {
          await fetch("/api/progress/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser.username, type: "vocab" })
          });
        } catch (err) {
          console.error("Failed to reset progress in DB:", err);
        }
      }
    }
  },

  handleToggleBookmark: async (type: "kanji" | "vocab", item: string) => {
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;
    if (!currentUser) return;
    try {
      const response = await fetch("/api/progress/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, item })
      });
      const resData = await response.json();
      if (resData.success) {
        if (type === "kanji") {
          set({
            bookmarkedKanjis: get().bookmarkedKanjis.includes(item)
              ? get().bookmarkedKanjis.filter(k => k !== item)
              : [...get().bookmarkedKanjis, item]
          });
        } else {
          set({
            bookmarkedVocabs: get().bookmarkedVocabs.includes(item)
              ? get().bookmarkedVocabs.filter(v => v !== item)
              : [...get().bookmarkedVocabs, item]
          });
        }
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  },

  startKanjiStudy: async (isReviewOverride?: boolean) => {
    const authStore = useAuthStore.getState();
    const isReview = typeof isReviewOverride === 'boolean' ? isReviewOverride : authStore.isReviewMode;
    const currentUser = authStore.currentUser;

    set({
      isLoading: true,
      errorMsg: null,
      currentKanjiIndex: 0,
      currentQuestionIndex: 0,
      userAnswers: {},
      isGraded: false,
      studyMode: 'kanji'
    });
    authStore.setIsReviewMode(isReview);

    try {
      let response;
      if (isReview) {
        if (!currentUser) {
          throw new Error("로그인이 필요한 서비스입니다.");
        }
        response = await fetch("/api/progress/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "kanji"
          })
        });
      } else {
        response = await fetch("/api/kanji/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count: get().kanjiCount,
            level: get().difficulty,
            excludeKanji: get().masteredKanji
          }),
        });
      }

      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        set({
          kanjiList: resData.data,
          apiSource: resData.source || "mongodb_cache",
          phase: 'studying'
        });
      } else {
        throw new Error(resData.errorMsg || resData.message || "한자를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load kanji sets:", err);
      set({ errorMsg: err.message || "서버 통신에 오류가 발생했거나 한자 데이터를 받아오지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      set({ isLoading: false });
    }
  },

  startVocabStudy: async (isReviewOverride?: boolean) => {
    const authStore = useAuthStore.getState();
    const isReview = typeof isReviewOverride === 'boolean' ? isReviewOverride : authStore.isReviewMode;
    const currentUser = authStore.currentUser;

    set({
      isLoading: true,
      errorMsg: null,
      currentVocabIndex: 0,
      currentQuestionIndex: 0,
      userAnswers: {},
      isGraded: false,
      studyMode: 'vocab'
    });
    authStore.setIsReviewMode(isReview);

    try {
      let response;
      if (isReview) {
        if (!currentUser) {
          throw new Error("로그인이 필요한 서비스입니다.");
        }
        response = await fetch("/api/progress/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "vocab"
          })
        });
      } else {
        response = await fetch("/api/vocab/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count: get().vocabCount,
            level: get().difficulty,
            excludeVocab: get().masteredVocab
          }),
        });
      }

      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        set({
          vocabList: resData.data,
          vocabQuestions: resData.quiz || [],
          apiSource: resData.source || "mongodb_cache",
          phase: 'studying'
        });
      } else {
        throw new Error(resData.errorMsg || resData.message || "단어를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load vocab sets:", err);
      set({ errorMsg: err.message || "서버 통신에 오류가 발생했거나 단어 데이터를 받아오지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      set({ isLoading: false });
    }
  },

  startJlptQuiz: async () => {
    set({
      isJlptLoading: true,
      jlptErrorMsg: null,
      currentJlptIndex: 0,
      jlptAnswers: {},
      isJlptGraded: false
    });

    try {
      const response = await fetch("/api/jlpt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: get().selectedJlptLevel, count: get().jlptCount }),
      });
      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        const uniqueQs = resData.data.map((q: any, index: number) => ({ ...q, id: `jlpt_${index}` }));
        set({
          jlptQuestions: uniqueQs,
          phase: 'jlpt'
        });
      } else {
        throw new Error(resData.errorMsg || "JLPT 기출문제를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load JLPT questions:", err);
      set({ jlptErrorMsg: err.message || "JLPT 기출문제를 가져오는 도중 연결 오류가 발생했습니다. 다시 시도해 주세요." });
    } finally {
      set({ isJlptLoading: false });
    }
  },

  startNewsStudy: async () => {
    set({
      isNewsLoading: true,
      newsErrorMsg: null
    });

    try {
      const response = await fetch("/api/news/random");
      const resData = await response.json();

      if (resData.success && resData.data) {
        set({
          newsLesson: resData.data,
          phase: 'news-study'
        });
      } else {
        throw new Error(resData.errorMsg || "뉴스 정보를 불러오지 못했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load news lesson:", err);
      set({ newsErrorMsg: err.message || "서버 통신에 오류가 발생했거나 뉴스 데이터를 받아오지 못했습니다." });
    } finally {
      set({ isNewsLoading: false });
    }
  },

  handleSelectAnswer: (choiceIndex: number) => {
    if (get().isGraded) return;
    const currentQuestion = get().questions[get().currentQuestionIndex];
    set({
      userAnswers: {
        ...get().userAnswers,
        [currentQuestion.id]: choiceIndex
      }
    });
  },

  handleNextStudy: () => {
    if (get().studyMode === 'vocab') {
      if (get().currentVocabIndex < get().vocabList.length - 1) {
        set({ currentVocabIndex: get().currentVocabIndex + 1 });
      } else {
        const nextQuestions = get().vocabQuestions.length > 0 ? get().vocabQuestions : generateVocabQuiz(get().vocabList);
        set({
          questions: nextQuestions,
          userAnswers: {},
          currentQuestionIndex: 0,
          isGraded: false,
          phase: 'testing'
        });
      }
    } else {
      if (get().currentKanjiIndex < get().kanjiList.length - 1) {
        set({ currentKanjiIndex: get().currentKanjiIndex + 1 });
      } else {
        const generatedQuiz = generateQuiz(get().kanjiList);
        set({
          questions: generatedQuiz,
          userAnswers: {},
          currentQuestionIndex: 0,
          isGraded: false,
          phase: 'testing'
        });
      }
    }
  },

  handlePrevStudy: () => {
    if (get().studyMode === 'vocab') {
      if (get().currentVocabIndex > 0) {
        set({ currentVocabIndex: get().currentVocabIndex - 1 });
      }
    } else {
      if (get().currentKanjiIndex > 0) {
        set({ currentKanjiIndex: get().currentKanjiIndex - 1 });
      }
    }
  },

  handleNextQuestion: () => {
    if (get().currentQuestionIndex < get().questions.length - 1) {
      set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
    }
  },

  handlePrevQuestion: () => {
    if (get().currentQuestionIndex > 0) {
      set({ currentQuestionIndex: get().currentQuestionIndex - 1 });
    }
  },

  handleGradeQuiz: async () => {
    const unansweredCount = get().questions.length - Object.keys(get().userAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 이대로 채점하시겠습니까?`)) {
        return;
      }
    }
    set({
      isGraded: true,
      phase: 'result'
    });

    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;

    if (get().studyMode === 'vocab') {
      const correctVocabList = get().questions
        .filter(q => get().userAnswers[q.id] === q.correctIndex && q.vocabItem)
        .map(q => q.vocabItem!.word as string);
      const correctCount = correctVocabList.length;
      if (correctCount > 0 && currentUser) {
        try {
          await fetch("/api/progress/addPoints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points: correctCount * 10 })
          });
          await get().fetchUserProgress(currentUser.username);
        } catch (err) {
          console.error(err);
        }
      }
      const finishedVocab = Array.from(new Set<string>(correctVocabList));
      const updated = Array.from(new Set<string>([...get().masteredVocab, ...finishedVocab]));
      await get().saveMasteredVocab(updated, finishedVocab);
    } else {
      const correctKanjiList = get().questions
        .filter(q => get().userAnswers[q.id] === q.correctIndex && q.kanjiItem)
        .map(q => q.kanjiItem!.kanji as string);
      const correctCount = correctKanjiList.length;
      if (correctCount > 0 && currentUser) {
        try {
          await fetch("/api/progress/addPoints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points: correctCount * 10 })
          });
          await get().fetchUserProgress(currentUser.username);
        } catch (err) {
          console.error(err);
        }
      }
      const finishedKanjis = Array.from(new Set<string>(correctKanjiList));
      const updated = Array.from(new Set<string>([...get().masteredKanji, ...finishedKanjis]));
      await get().saveMasteredKanji(updated, finishedKanjis);
    }
  },

  handleSelectJlptAnswer: (choiceIndex: number) => {
    if (get().isJlptGraded) return;
    const currentQ = get().jlptQuestions[get().currentJlptIndex];
    set({
      jlptAnswers: {
        ...get().jlptAnswers,
        [currentQ.id]: choiceIndex
      }
    });
  },

  handleNextJlptQuestion: () => {
    if (get().currentJlptIndex < get().jlptQuestions.length - 1) {
      set({ currentJlptIndex: get().currentJlptIndex + 1 });
    }
  },

  handlePrevJlptQuestion: () => {
    if (get().currentJlptIndex > 0) {
      set({ currentJlptIndex: get().currentJlptIndex - 1 });
    }
  },

  handleGradeJlptQuiz: async () => {
    const unansweredCount = get().jlptQuestions.length - Object.keys(get().jlptAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 이대로 채점하시겠습니까?`)) {
        return;
      }
    }
    const correctCount = get().jlptQuestions.filter(q => get().jlptAnswers[q.id] === q.correctIndex).length;
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;

    if (correctCount > 0 && currentUser) {
      try {
        await fetch("/api/progress/addPoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: correctCount * 10 })
        });
        await get().fetchUserProgress(currentUser.username);
      } catch (err) {
        console.error(err);
      }
    }
    set({ isJlptGraded: true });
  },

  handleGoHomeJlpt: () => {
    if (!get().isJlptGraded && get().phase === 'jlpt') {
      if (!window.confirm("학습을 중단하고 메인 화면으로 돌아가시겠습니까?")) {
        return;
      }
    }
    set({
      phase: 'config',
      isJlptGraded: false,
      jlptQuestions: [],
      jlptAnswers: {},
      jlptErrorMsg: null
    });
  },

  handleGoHome: () => {
    const p = get().phase;
    if (p === 'studying' || p === 'testing' || p === 'news-study') {
      if (!window.confirm("학습을 중단하고 메인 화면으로 돌아가시겠습니까?")) {
        return;
      }
    }
    if (!get().isJlptGraded && p === 'jlpt') {
      if (!window.confirm("학습을 중단하고 메인 화면으로 돌아가시겠습니까?")) {
        return;
      }
    }

    set({
      phase: 'config',
      kanjiList: [],
      vocabList: [],
      questions: [],
      newsLesson: null,
      newsErrorMsg: null,
      isJlptGraded: false,
      jlptQuestions: [],
      jlptAnswers: {},
      jlptErrorMsg: null
    });
  }
}));

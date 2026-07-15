/**
 * 전역 스토어 — 슬라이스 합성 오케스트레이터
 *
 * 도메인별 슬라이스 5개를 하나의 Zustand 스토어로 합성(compose)하고,
 * 여러 슬라이스에 걸쳐 동작하는 공용 오케스트레이션 상태와 액션을 직접 관리합니다.
 *
 * 슬라이스 구성:
 *   - kanjiSlice:    한자 학습 (startKanjiStudy, saveMasteredKanji 등)
 *   - vocabSlice:    단어 학습 (startVocabStudy, saveMasteredVocab 등)
 *   - jlptSlice:     JLPT 모의고사 (startJlptQuiz, handleGradeJlptQuiz 등)
 *   - progressSlice: 유저 진행도·북마크·포인트·테마 (fetchUserProgress, handleToggleBookmark 등)
 *
 * 공용 오케스트레이션 (이 파일):
 *   - phase 전환, studyMode 분기, 퀴즈 공용 상태, handleGoHome 등
 */
import { create } from "zustand";
import { StudyState } from "./storeTypes";
import { generateQuiz, generateVocabQuiz } from "../utils";
import { useAuthStore } from "./authStore";
import { useConfirmStore } from "./confirmStore";

// 도메인별 슬라이스 import
import { createKanjiSlice } from "./slices/kanjiSlice";
import { createVocabSlice } from "./slices/vocabSlice";
import { createJlptSlice } from "./slices/jlptSlice";
import { createProgressSlice } from "./slices/progressSlice";

export const useStudyStore = create<StudyState>()((...args) => {
  const [set, get] = args;

  return {
    // ─── 도메인별 슬라이스 합성 ───
    ...createKanjiSlice(...args),
    ...createVocabSlice(...args),
    ...createJlptSlice(...args),
    ...createProgressSlice(...args),

    // ─── 공용 오케스트레이션 초기 상태 ───
    phase: 'config',
    studyMode: 'kanji',
    difficulty: 'all',
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    isGraded: false,
    isLoading: false,
    errorMsg: null,
    apiSource: 'gemini',
    quizAttemptId: null,

    // ─── 공용 Setter ───
    setPhase: (phase) => set({ phase }),
    setStudyMode: (studyMode) => set({ studyMode }),
    setDifficulty: (difficulty) => set({ difficulty }),

    // ─── 퀴즈 답 선택 (채점 후에는 변경 불가) ───
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

    // ─── 다음 카드로 이동 (한자/단어 분기 → 마지막 카드이면 퀴즈 시작) ───
    handleNextStudy: async () => {
      if (get().studyMode === 'vocab') {
        if (get().currentVocabIndex < get().vocabList.length - 1) {
          set({ currentVocabIndex: get().currentVocabIndex + 1 });
        } else {
          set({ isLoading: true, errorMsg: null });
          try {
            const activity = useAuthStore.getState().isReviewMode
              ? "vocab_review"
              : "vocab_quiz";
            const response = await fetch("/api/progress/quiz/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                activity,
                itemKeys: get().vocabList.map((item) => item.word),
              }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
              throw new Error(data.errorMsg || "단어 퀴즈를 시작할 수 없습니다.");
            }
            set({
              questions: data.questions,
              quizAttemptId: data.attemptId,
              userAnswers: {},
              currentQuestionIndex: 0,
              isGraded: false,
              phase: 'testing'
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : "단어 퀴즈를 시작할 수 없습니다.";
            set({ errorMsg: message });
            await useConfirmStore.getState().showAlert(message);
          } finally {
            set({ isLoading: false });
          }
        }
      } else {
        if (get().currentKanjiIndex < get().kanjiList.length - 1) {
          set({ currentKanjiIndex: get().currentKanjiIndex + 1 });
        } else {
          set({ isLoading: true, errorMsg: null });
          try {
            const activity = useAuthStore.getState().isReviewMode
              ? "kanji_review"
              : "kanji_quiz";
            const response = await fetch("/api/progress/quiz/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                activity,
                itemKeys: get().kanjiList.map((item) => item.kanji),
              }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
              throw new Error(data.errorMsg || "한자 퀴즈를 시작할 수 없습니다.");
            }
            set({
              questions: data.questions,
              quizAttemptId: data.attemptId,
              userAnswers: {},
              currentQuestionIndex: 0,
              isGraded: false,
              phase: 'testing'
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : "한자 퀴즈를 시작할 수 없습니다.";
            set({ errorMsg: message });
            await useConfirmStore.getState().showAlert(message);
          } finally {
            set({ isLoading: false });
          }
        }
      }
    },

    // ─── 이전 카드로 이동 (한자/단어 분기) ───
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

    // ─── 북마크 전용 퀴즈 시작 ───
    startBookmarkQuiz: (type: 'kanji' | 'vocab', items: any[]) => {
      const nextQuestions = type === 'kanji' ? generateQuiz(items) : generateVocabQuiz(items);
      set({
        studyMode: type === 'kanji' ? 'bookmark-kanji' : 'bookmark-vocab',
        questions: nextQuestions,
        userAnswers: {},
        currentQuestionIndex: 0,
        isGraded: false,
        quizAttemptId: null,
        phase: 'testing'
      });
    },

    // ─── 다음 퀴즈 문제 ───
    handleNextQuestion: () => {
      if (get().currentQuestionIndex < get().questions.length - 1) {
        set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
      }
    },

    // ─── 이전 퀴즈 문제 ───
    handlePrevQuestion: () => {
      if (get().currentQuestionIndex > 0) {
        set({ currentQuestionIndex: get().currentQuestionIndex - 1 });
      }
    },

    // ─── 퀴즈 채점 (한자/단어 분기 → 정답 항목 외운 목록에 추가 + 포인트 적립) ───
    handleGradeQuiz: async () => {
      const unansweredCount = get().questions.length - Object.keys(get().userAnswers).length;
      if (unansweredCount > 0) {
        const confirmed = await useConfirmStore.getState().showConfirm(`아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 이대로 채점하시겠습니까?`);
        if (!confirmed) {
          return;
        }
      }
      const mode = get().studyMode;
      if (mode.startsWith('bookmark')) {
        // 북마크 테스트는 연습용이므로 포인트나 외운 목록 추가를 하지 않습니다.
        set({ isGraded: true, phase: 'result' });
        return;
      }

      const currentUser = useAuthStore.getState().currentUser;
      const attemptId = get().quizAttemptId;
      if (!currentUser || !attemptId) {
        await useConfirmStore.getState().showAlert("유효한 퀴즈 시도를 찾을 수 없습니다. 다시 시작해 주세요.");
        return;
      }

      set({ isLoading: true });
      try {
        const response = await fetch("/api/progress/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, answers: get().userAnswers }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.errorMsg || "퀴즈 채점에 실패했습니다.");
        }
        set({
          questions: data.questions,
          isGraded: true,
          phase: 'result',
        });
        await get().fetchUserProgress(currentUser.username);
      } catch (err) {
        console.error("Failed to submit quiz attempt:", err);
        const message = err instanceof Error ? err.message : "알 수 없는 오류입니다.";
        await useConfirmStore.getState().showAlert(`퀴즈 채점에 실패했습니다. (${message})`);
      } finally {
        set({ isLoading: false });
      }
    },

    // ─── 홈으로 돌아가기 (학습 중이면 확인 다이얼로그, 상태 초기화) ───
    handleGoHome: async () => {
      const p = get().phase;
      if (p === 'studying' || p === 'testing') {
        const confirmed = await useConfirmStore.getState().showConfirm("학습을 중단하고 메인 화면으로 돌아가시겠습니까?");
        if (!confirmed) {
          return;
        }
      }
      if (!get().isJlptGraded && p === 'jlpt') {
        const confirmed = await useConfirmStore.getState().showConfirm("학습을 중단하고 메인 화면으로 돌아가시겠습니까?");
        if (!confirmed) {
          return;
        }
      }

      set({
        phase: 'config',
        kanjiList: [],
        vocabList: [],
        questions: [],
        quizAttemptId: null,
        isJlptGraded: false,
        jlptQuestions: [],
        jlptAnswers: {},
        jlptErrorMsg: null
      });
    }
  };
});

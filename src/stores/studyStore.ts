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
 *   - newsSlice:     뉴스 학습 (startNewsStudy)
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
import { createNewsSlice } from "./slices/newsSlice";
import { createProgressSlice } from "./slices/progressSlice";

export const useStudyStore = create<StudyState>()((...args) => {
  const [set, get] = args;

  return {
    // ─── 도메인별 슬라이스 합성 ───
    ...createKanjiSlice(...args),
    ...createVocabSlice(...args),
    ...createJlptSlice(...args),
    ...createNewsSlice(...args),
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
    handleNextStudy: () => {
      if (get().studyMode === 'vocab') {
        if (get().currentVocabIndex < get().vocabList.length - 1) {
          set({ currentVocabIndex: get().currentVocabIndex + 1 });
        } else {
          // 마지막 단어 카드 → 퀴즈 단계로 전환
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
          // 마지막 한자 카드 → 퀴즈 단계로 전환
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
      set({
        isGraded: true,
        phase: 'result'
      });

      const authStore = useAuthStore.getState();
      const currentUser = authStore.currentUser;

      if (get().studyMode === 'vocab') {
        // 단어 퀴즈 채점: 정답 단어들을 외운 목록에 추가
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
        // 한자 퀴즈 채점: 정답 한자들을 외운 목록에 추가
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

    // ─── 홈으로 돌아가기 (학습 중이면 확인 다이얼로그, 상태 초기화) ───
    handleGoHome: async () => {
      const p = get().phase;
      if (p === 'studying' || p === 'testing' || p === 'news-study') {
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
        newsLesson: null,
        newsErrorMsg: null,
        isJlptGraded: false,
        jlptQuestions: [],
        jlptAnswers: {},
        jlptErrorMsg: null
      });
    }
  };
});

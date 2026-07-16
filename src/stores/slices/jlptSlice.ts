/**
 * JLPT 모의고사 슬라이스
 * - JLPT 모의 테스트 생성(API 호출), 답 선택, 문제 탐색, 채점, 홈 복귀 액션을 담당합니다.
 * - 채점 시 맞힌 문제 수만큼 포인트를 적립합니다.
 */
import { StateCreator } from "zustand";
import { StudyState, JlptSlice } from "../storeTypes";
import { useAuthStore } from "../authStore";
import { useConfirmStore } from "../confirmStore";

export const createJlptSlice: StateCreator<StudyState, [], [], JlptSlice> = (set, get) => ({
  // ── 초기 상태 ──
  jlptCount: 5,
  selectedJlptLevel: 'N5',
  jlptQuestions: [],
  currentJlptIndex: 0,
  jlptAnswers: {},
  isJlptGraded: false,
  isJlptLoading: false,
  jlptErrorMsg: null,
  jlptAttemptId: null,

  // ── Setter ──
  setJlptCount: (jlptCount) => set({ jlptCount }),
  setSelectedJlptLevel: (selectedJlptLevel) => set({ selectedJlptLevel }),

  // JLPT 모의 테스트 시작 (서버에서 문제 데이터 로딩)
  startJlptQuiz: async () => {
    set({
      isJlptLoading: true,
      jlptErrorMsg: null,
      currentJlptIndex: 0,
      jlptAnswers: {},
      isJlptGraded: false,
      jlptAttemptId: null,
    });

    try {
      const response = await fetch("/api/jlpt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: get().selectedJlptLevel, count: get().jlptCount }),
      });
      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        const attemptResponse = await fetch("/api/progress/quiz/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity: "jlpt_quiz",
            level: get().selectedJlptLevel,
            count: get().jlptCount,
          }),
        });
        const attemptData = await attemptResponse.json();
        if (!attemptResponse.ok || !attemptData.success) {
          throw new Error(attemptData.errorMsg || "JLPT 퀴즈 시도를 만들 수 없습니다.");
        }
        set({
          jlptQuestions: attemptData.questions,
          jlptAttemptId: attemptData.attemptId,
          phase: 'jlpt'
        });
      } else {
        throw new Error(resData.errorMsg || "JLPT 모의 테스트를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load JLPT questions:", err);
      set({ jlptErrorMsg: err.message || "JLPT 모의 테스트를 가져오는 도중 연결 오류가 발생했습니다. 다시 시도해 주세요." });
    } finally {
      set({ isJlptLoading: false });
    }
  },

  // JLPT 답 선택 (채점 완료 후에는 변경 불가)
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

  // 다음 JLPT 문제로 이동
  handleNextJlptQuestion: () => {
    if (get().currentJlptIndex < get().jlptQuestions.length - 1) {
      set({ currentJlptIndex: get().currentJlptIndex + 1 });
    }
  },

  // 이전 JLPT 문제로 이동
  handlePrevJlptQuestion: () => {
    if (get().currentJlptIndex > 0) {
      set({ currentJlptIndex: get().currentJlptIndex - 1 });
    }
  },

  // JLPT 채점 (미답 문제 확인 → 채점 → 포인트 적립)
  handleGradeJlptQuiz: async () => {
    const unansweredCount = get().jlptQuestions.length - Object.keys(get().jlptAnswers).length;
    if (unansweredCount > 0) {
      const confirmed = await useConfirmStore.getState().showConfirm(`아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 이대로 채점하시겠습니까?`);
      if (!confirmed) {
        return;
      }
    }
    const currentUser = useAuthStore.getState().currentUser;
    const attemptId = get().jlptAttemptId;
    if (!currentUser || !attemptId) {
      await useConfirmStore.getState().showAlert("유효한 JLPT 퀴즈 시도를 찾을 수 없습니다.");
      return;
    }

    set({ isJlptLoading: true });
    try {
      const response = await fetch("/api/progress/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: get().jlptAnswers }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.errorMsg || "JLPT 채점에 실패했습니다.");
      }
      set({
        jlptQuestions: data.questions,
        isJlptGraded: true,
      });
      await get().fetchUserProgress(currentUser.username);
    } catch (err) {
      console.error("Failed to submit JLPT quiz attempt:", err);
      const message = err instanceof Error ? err.message : "알 수 없는 오류입니다.";
      await useConfirmStore.getState().showAlert(`JLPT 채점에 실패했습니다. (${message})`);
    } finally {
      set({ isJlptLoading: false });
    }
  },

  // JLPT 화면에서 홈으로 복귀 (채점 전이면 확인 다이얼로그 표시)
  handleGoHomeJlpt: async () => {
    if (!get().isJlptGraded && get().phase === 'jlpt') {
      const confirmed = await useConfirmStore.getState().showConfirm("학습을 중단하고 메인 화면으로 돌아가시겠습니까?");
      if (!confirmed) {
        return;
      }
    }
    set({
      phase: 'config',
      isJlptGraded: false,
      jlptQuestions: [],
      jlptAttemptId: null,
      jlptAnswers: {},
      jlptErrorMsg: null
    });
  }
});

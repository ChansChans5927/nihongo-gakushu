/**
 * JLPT 모의고사 슬라이스
 * - JLPT 기출문제 생성(API 호출), 답 선택, 문제 탐색, 채점, 홈 복귀 액션을 담당합니다.
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

  // ── Setter ──
  setJlptCount: (jlptCount) => set({ jlptCount }),
  setSelectedJlptLevel: (selectedJlptLevel) => set({ selectedJlptLevel }),

  // JLPT 기출문제 시작 (서버에서 문제 데이터 로딩)
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
        // 각 문제에 고유 ID 부여
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
    const correctCount = get().jlptQuestions.filter(q => get().jlptAnswers[q.id] === q.correctIndex).length;
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;

    // 맞힌 문제당 10포인트 적립
    if (correctCount > 0 && currentUser) {
      try {
        await fetch("/api/progress/addPoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            points: correctCount * 10,
            date: new Date().toLocaleDateString('sv')
          })
        });
        await get().fetchUserProgress(currentUser.username);
      } catch (err) {
        console.error(err);
      }
    }
    set({ isJlptGraded: true });
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
      jlptAnswers: {},
      jlptErrorMsg: null
    });
  }
});

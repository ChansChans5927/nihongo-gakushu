/**
 * 단어 학습 슬라이스
 * - 단어 카드 생성(API 호출), 학습 시작, 외운 단어 저장/초기화 액션을 담당합니다.
 * - startVocabStudy는 신규 학습/복습 모드를 분기하여 서버에 요청합니다.
 */
import { StateCreator } from "zustand";
import { StudyState, VocabSlice } from "../storeTypes";
import { useAuthStore } from "../authStore";
import { useConfirmStore } from "../confirmStore";

export const createVocabSlice: StateCreator<StudyState, [], [], VocabSlice> = (
  set,
  get,
) => ({
  // ── 초기 상태 ──
  vocabCount: 5,
  vocabList: [],
  currentVocabIndex: 0,
  vocabQuestions: [],

  // ── Setter ──
  setVocabCount: (vocabCount) => set({ vocabCount }),

  // 단어 학습 시작 (신규 학습 또는 복습 모드)
  startVocabStudy: async (
    isReviewOverride?: boolean,
    targetItem?: string,
    level?: string,
  ) => {
    const authStore = useAuthStore.getState();
    const isReview =
      typeof isReviewOverride === "boolean"
        ? isReviewOverride
        : authStore.isReviewMode;
    const currentUser = authStore.currentUser;

    // 공용 상태 초기화
    set({
      isLoading: true,
      errorMsg: null,
      currentVocabIndex: 0,
      currentQuestionIndex: 0,
      userAnswers: {},
      isGraded: false,
      studyMode: "vocab",
    });
    authStore.setIsReviewMode(isReview);

    try {
      let response;
      if (isReview) {
        // 복습 모드: 이전에 외운 단어들을 다시 불러오기
        if (!currentUser) {
          throw new Error("로그인이 필요한 서비스입니다.");
        }
        response = await fetch("/api/progress/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "vocab",
          }),
        });
      } else {
        // 신규 학습 모드: AI가 생성한 새 단어 카드 요청
        const requestBody: any = {
          count: get().vocabCount,
          level: level || get().difficulty,
          excludeVocab: get().masteredVocab,
        };
        if (targetItem) {
          requestBody.deepLinkTarget = {
            word: targetItem,
            level: level || get().difficulty,
          };
        }

        response = await fetch("/api/vocab/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      }

      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        set({
          vocabList: resData.data,
          vocabQuestions: resData.quiz || [],
          apiSource: resData.source || "mongodb_cache",
          phase: "studying",
        });
      } else {
        throw new Error(
          resData.errorMsg ||
            resData.message ||
            "단어를 불러오는 데 실패했습니다.",
        );
      }
    } catch (err: any) {
      console.error("Failed to load vocab sets:", err);
      set({
        errorMsg:
          err.message ||
          "서버 통신에 오류가 발생했거나 단어 데이터를 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // 외운 단어 내역 전체 초기화 (확인 다이얼로그 포함)
  handleResetVocabMastery: async () => {
    const confirmed = await useConfirmStore
      .getState()
      .showConfirm(
        "외운 단어 내역을 전부 초기화하고 처음부터 다시 공부하시겠습니까?",
      );
    if (confirmed) {
      set({ masteredVocab: [] });
      const authStore = useAuthStore.getState();
      const currentUser = authStore.currentUser;
      if (currentUser) {
        try {
          await fetch("/api/progress/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: currentUser.username,
              type: "vocab",
            }),
          });
        } catch (err) {
          console.error("Failed to reset progress in DB:", err);
        }
      }
    }
  },
});

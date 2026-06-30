/**
 * 한자 학습 슬라이스
 * - 한자 카드 생성(API 호출), 학습 시작, 외운 한자 저장/초기화 액션을 담당합니다.
 * - startKanjiStudy는 신규 학습/복습 모드를 분기하여 서버에 요청합니다.
 */
import { StateCreator } from "zustand";
import { StudyState, KanjiSlice } from "../storeTypes";
import { useAuthStore } from "../authStore";
import { useConfirmStore } from "../confirmStore";

export const createKanjiSlice: StateCreator<StudyState, [], [], KanjiSlice> = (set, get) => ({
  // ── 초기 상태 ──
  kanjiCount: 5,
  kanjiList: [],
  currentKanjiIndex: 0,

  // ── Setter ──
  setKanjiCount: (kanjiCount) => set({ kanjiCount }),

  // 한자 학습 시작 (신규 학습 또는 복습 모드)
  startKanjiStudy: async (isReviewOverride?: boolean) => {
    const authStore = useAuthStore.getState();
    const isReview = typeof isReviewOverride === 'boolean' ? isReviewOverride : authStore.isReviewMode;
    const currentUser = authStore.currentUser;

    // 공용 상태 초기화 (SharedSlice 영역이지만 set으로 교차 설정 가능)
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
        // 복습 모드: 이전에 외운 한자들을 다시 불러오기
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
        // 신규 학습 모드: AI가 생성한 새 한자 카드 요청
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

  // 외운 한자 목록을 서버에 저장
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

  // 외운 한자 내역 전체 초기화 (확인 다이얼로그 포함)
  handleResetMastery: async () => {
    const confirmed = await useConfirmStore.getState().showConfirm("외운 한자 내역을 전부 초기화하고 처음부터 다시 공부하시겠습니까?");
    if (confirmed) {
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
  }
});

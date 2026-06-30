/**
 * 뉴스 학습 슬라이스
 * - 랜덤 뉴스 레슨 데이터를 서버에서 불러오는 단일 액션을 담당합니다.
 */
import { StateCreator } from "zustand";
import { StudyState, NewsSlice } from "../storeTypes";

export const createNewsSlice: StateCreator<StudyState, [], [], NewsSlice> = (set) => ({
  // ── 초기 상태 ──
  newsLesson: null,
  isNewsLoading: false,
  newsErrorMsg: null,

  // 랜덤 뉴스 학습 시작 (서버에서 뉴스 레슨 데이터 로딩)
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
  }
});

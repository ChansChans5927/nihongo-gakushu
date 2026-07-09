/**
 * 유저 진행도·북마크·포인트·테마 공통 슬라이스
 * - 서버에서 유저 진행 상태를 불러오고 저장하는 공통 액션을 담당합니다.
 * - 로컬스토리지 → 서버 동기화(마이그레이션) 로직도 여기에 포함됩니다.
 */
import { StateCreator } from "zustand";
import { StudyState, ProgressSlice } from "../storeTypes";
import { useAuthStore } from "../authStore";

export const createProgressSlice: StateCreator<StudyState, [], [], ProgressSlice> = (set, get) => ({
  // ── 초기 상태 ──
  masteredKanji: [],
  masteredVocab: [],
  bookmarkedKanjis: [],
  bookmarkedVocabs: [],
  points: 0,
  unlockedThemes: ["default"],
  currentTheme: "default",
  studyLogs: {},
  claimedWeeklyRewards: [],
  claimedMilestones: [],

  // ── Setter ──
  setCurrentTheme: (currentTheme) => set({ currentTheme }),
  setUnlockedThemes: (unlockedThemes) => set({ unlockedThemes }),
  setPoints: (points) => set({ points }),

  // 서버에서 유저 진행도 불러오기 + 로컬스토리지 데이터 동기화
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
          currentTheme: resData.currentTheme || "default",
          studyLogs: resData.studyLogs || {},
          claimedWeeklyRewards: resData.claimedWeeklyRewards || [],
          claimedMilestones: resData.claimedMilestones || []
        });

        // 로그인 전에 로컬스토리지에 저장했던 오프라인 데이터를 서버로 병합
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

        // 미동기화 로컬 데이터가 있으면 서버에 전송
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

  // 로그아웃 시 모든 진행 상태 초기화
  resetProgressState: () => {
    set({
      masteredKanji: [],
      masteredVocab: [],
      bookmarkedKanjis: [],
      bookmarkedVocabs: [],
      points: 0,
      unlockedThemes: ["default"],
      currentTheme: "default",
      studyLogs: {},
      claimedWeeklyRewards: [],
      claimedMilestones: []
    });
  },

  // 북마크 토글 (한자/단어 공용)
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

  // 주간 완주 보상 수령
  claimWeeklyReward: async (weekStart: string) => {
    try {
      const response = await fetch("/api/progress/claimWeekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart })
      });
      const resData = await response.json();
      if (resData.success) {
        set({
          points: get().points + resData.pointsAdded,
          claimedWeeklyRewards: [...get().claimedWeeklyRewards, weekStart]
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to claim weekly reward:", err);
      return false;
    }
  },

  // 누적 마일스톤 보상 수령
  claimMilestoneReward: async (milestone: string) => {
    try {
      const response = await fetch("/api/progress/claimMilestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone })
      });
      const resData = await response.json();
      if (resData.success) {
        const unlocked = resData.themeUnlocked
          ? Array.from(new Set([...get().unlockedThemes, resData.themeUnlocked]))
          : get().unlockedThemes;
        set({
          points: get().points + resData.pointsAdded,
          claimedMilestones: [...get().claimedMilestones, milestone],
          unlockedThemes: unlocked
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to claim milestone reward:", err);
      return false;
    }
  }
});

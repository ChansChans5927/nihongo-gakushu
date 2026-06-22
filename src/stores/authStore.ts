import { create } from "zustand";
import { UserSession } from "../types";

interface AuthState {
  currentUser: UserSession | null;
  isReviewMode: boolean;
  setCurrentUser: (user: UserSession | null) => void;
  setIsReviewMode: (mode: boolean) => void;
  loadSession: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isReviewMode: false,
  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },
  setIsReviewMode: (mode) => set({ isReviewMode: mode }),
  loadSession: () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        set({ currentUser: JSON.parse(savedUser) });
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  },
  logout: () => {
    set({ currentUser: null, isReviewMode: false });
    localStorage.removeItem("user");
    localStorage.removeItem("nihongo_token");
  },
}));

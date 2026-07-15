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
    const token = localStorage.getItem("nihongo_token");
    set({ currentUser: null, isReviewMode: false });
    localStorage.removeItem("user");
    localStorage.removeItem("nihongo_token");
    if (token && /^[A-Za-z0-9\-_=\.]+$/.test(token)) {
      void fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => {
        console.warn("Failed to revoke server session:", error);
      });
    }
  },
}));

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";

  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      authModalTab: "login",

      setAuth: (user: User, token: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
        }
        set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
      },

      updateUser: (updatedData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedData } });
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      openAuthModal: (tab: "login" | "register" = "login") =>
        set({ isAuthModalOpen: true, authModalTab: tab }),

      closeAuthModal: () => set({ isAuthModalOpen: false }),
    }),
    {
      name: "ecom_auth_storage_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

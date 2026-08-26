"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AdminAuthState {
  adminUser: User | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  setAdminAuth: (user: User, token: string) => void;
  updateAdminUser: (updatedFields: Partial<User>) => void;
  logoutAdmin: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      adminToken: null,
      isAdminAuthenticated: false,

      setAdminAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("aether_admin_token", token);
          localStorage.setItem("aether_admin_user", JSON.stringify(user));
        }
        set({
          adminUser: user,
          adminToken: token,
          isAdminAuthenticated: true,
        });
      },

      updateAdminUser: (updatedFields) => {
        const currentUser = get().adminUser;
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedFields };
        if (typeof window !== "undefined") {
          localStorage.setItem("aether_admin_user", JSON.stringify(updatedUser));
        }
        set({ adminUser: updatedUser });
      },

      logoutAdmin: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("aether_admin_token");
          localStorage.removeItem("aether_admin_user");
        }
        set({
          adminUser: null,
          adminToken: null,
          isAdminAuthenticated: false,
        });
      },
    }),
    {
      name: "aether_admin_auth",
    }
  )
);

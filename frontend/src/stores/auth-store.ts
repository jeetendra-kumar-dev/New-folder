"use client";

import { create } from "zustand";
import type { AuthSession, AuthTokens, User } from "@/types/api";

const accessTokenKey = "pocketpilot.accessToken";
const refreshTokenKey = "pocketpilot.refreshToken";
const userKey = "pocketpilot.user";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  updateTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined" || get().hydrated) return;

    const accessToken = window.localStorage.getItem(accessTokenKey);
    const refreshToken = window.localStorage.getItem(refreshTokenKey);
    const userJson = window.localStorage.getItem(userKey);
    const user = userJson ? (JSON.parse(userJson) as User) : null;

    set({ accessToken, refreshToken, user, hydrated: true });
  },
  setSession: ({ user, tokens }) => {
    window.localStorage.setItem(accessTokenKey, tokens.accessToken);
    window.localStorage.setItem(refreshTokenKey, tokens.refreshToken);
    window.localStorage.setItem(userKey, JSON.stringify(user));
    setCookie("auth-token", tokens.accessToken, 60 * 60 * 24 * 7);
    set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, hydrated: true });
  },
  updateTokens: (tokens) => {
    window.localStorage.setItem(accessTokenKey, tokens.accessToken);
    window.localStorage.setItem(refreshTokenKey, tokens.refreshToken);
    setCookie("auth-token", tokens.accessToken, 60 * 60 * 24 * 7);
    set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  },
  clearSession: () => {
    window.localStorage.removeItem(accessTokenKey);
    window.localStorage.removeItem(refreshTokenKey);
    window.localStorage.removeItem(userKey);
    clearCookie("auth-token");
    set({ user: null, accessToken: null, refreshToken: null, hydrated: true });
  },
}));

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(accessTokenKey);
}

export function getStoredRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(refreshTokenKey);
}

"use client";

import { getStoredAccessToken, getStoredRefreshToken, useAuthStore } from "@/stores/auth-store";
import type { ApiEnvelope, AuthSession, AuthTokens } from "@/types/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type ApiOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}

async function refreshTokens() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const session = await parseResponse<AuthSession>(response);
  useAuthStore.getState().setSession(session);
  return session.tokens;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, retry = true, headers, body, ...requestOptions } = options;
  const accessToken = getStoredAccessToken();

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body,
  });

  if (response.status === 401 && auth && retry) {
    try {
      const tokens: AuthTokens = await refreshTokens();
      const retryResponse = await fetch(`${apiBaseUrl}${path}`, {
        ...requestOptions,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
          ...headers,
        },
        body,
      });
      return parseResponse<T>(retryResponse);
    } catch (error) {
      useAuthStore.getState().clearSession();
      throw error;
    }
  }

  return parseResponse<T>(response);
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}

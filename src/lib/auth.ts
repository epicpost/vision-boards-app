import { API_BASE_URL } from "@/lib/post-templates";

export const AUTH_SESSION_CHANGED_EVENT = "epicpost-auth-session-changed";
export const AUTH_REQUIRED_EVENT = "epicpost-auth-required";
const ACCESS_TOKEN_KEY = "epicpost_access_token";
const REFRESH_TOKEN_KEY = "epicpost_refresh_token";
const USER_KEY = "epicpost_user";

interface SuccessResponse {
  success?: boolean;
  message?: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

interface AuthSessionResponse {
  data: AuthSession;
}

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getErrorMessage(payload: ApiErrorResponse) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(". ");
  }

  return null;
}

export async function requestMagicLink(email: string): Promise<SuccessResponse> {
  const response = await fetch(new URL("/api/v1/auth/magic-link", API_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim() }),
  });

  const payload = (await response.json().catch(() => ({}))) as SuccessResponse & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ?? `Magic link request failed with ${response.status}`,
    );
  }

  return payload;
}

export async function confirmMagicLink(token: string, email: string): Promise<AuthSessionResponse> {
  const url = new URL("/api/v1/auth/magic-link/confirm", API_BASE_URL);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email.trim());

  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as AuthSessionResponse &
    ApiErrorResponse;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ?? `Magic link confirmation failed with ${response.status}`,
    );
  }

  return payload;
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function hasAuthSession() {
  if (typeof window === "undefined") return false;

  return Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  const storedUser = window.localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as UserProfile;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function requestAuthDialog() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
}

export function expireAuthSession() {
  clearAuthSession();
  requestAuthDialog();
}

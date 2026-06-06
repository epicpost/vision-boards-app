import { API_BASE_URL } from "@/lib/post-templates";

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
  window.localStorage.setItem("epicpost_access_token", session.access_token);
  window.localStorage.setItem("epicpost_refresh_token", session.refresh_token);
  window.localStorage.setItem("epicpost_user", JSON.stringify(session.user));
}

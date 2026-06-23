import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

// Current-user profile, backed by `/api/v1/me/*` (the `UserProfile` model
// server-side). Includes the avatar upload used by the Edit profile screen.

export interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email: string;
  about?: string | null;
  avatar_url?: string | null;
  language_id?: string | null;
  visibility: "public" | "private";
  user_plan: "free" | "paid";
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateInput {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  about?: string | null;
}

interface ProfileResponse {
  data: UserProfile;
}

interface ApiErrorResponse {
  error?: { code?: string; message?: string };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

function getApiErrorMessage(payload: ApiErrorResponse) {
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

function requireToken(action: string): string {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error(`Sign in to ${action}.`);
  }
  return token;
}

async function throwApiError(response: Response, fallback: string): Promise<never> {
  const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (payload.error?.code === "TOKEN_EXPIRED") {
    expireAuthSession();
  }
  throw new Error(getApiErrorMessage(payload) ?? fallback);
}

export async function getMyProfile(): Promise<UserProfile> {
  const token = requireToken("view your profile");
  const response = await fetch(new URL("/api/v1/me/profile", API_BASE_URL), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) await throwApiError(response, "Failed to load your profile.");
  const payload = (await response.json()) as ProfileResponse;
  return payload.data;
}

export async function updateMyProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  const token = requireToken("update your profile");
  const response = await fetch(new URL("/api/v1/me/profile", API_BASE_URL), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) await throwApiError(response, "Failed to update your profile.");
  const payload = (await response.json()) as ProfileResponse;
  return payload.data;
}

export async function uploadAvatar(blob: Blob): Promise<UserProfile> {
  const token = requireToken("change your photo");
  const form = new FormData();
  form.append("file", blob, "avatar.png");
  const response = await fetch(new URL("/api/v1/me/avatar", API_BASE_URL), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) await throwApiError(response, "Failed to upload your photo.");
  const payload = (await response.json()) as ProfileResponse;
  return payload.data;
}

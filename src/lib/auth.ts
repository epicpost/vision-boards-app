import { API_BASE_URL } from "@/lib/post-templates";

interface SuccessResponse {
  success?: boolean;
  message?: string | null;
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

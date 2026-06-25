import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
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

function isTokenExpiredError(payload: ApiErrorResponse) {
  return payload.error?.code === "TOKEN_EXPIRED";
}

export async function shareTemplateByEmail(templateId: string, email: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to share templates.");
  }

  const response = await fetch(
    new URL(
      `/api/v1/post-templates/${encodeURIComponent(templateId)}/share/email`,
      API_BASE_URL,
    ),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    },
  );
  const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;

  if (!response.ok) {
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(getApiErrorMessage(payload) ?? `Share request failed with ${response.status}`);
  }
}

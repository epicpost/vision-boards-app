import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL, type PostTemplateFeedResponse } from "@/lib/post-templates";

export interface LikeState {
  success: boolean;
  is_liked: boolean;
  likes_count: number;
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

export const likedTemplatesQueryKey = () => ["liked-templates", { limit: 50 }] as const;

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

async function throwApiError(response: Response, fallback: string): Promise<never> {
  const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (payload.error?.code === "TOKEN_EXPIRED") {
    expireAuthSession();
  }

  throw new Error(getApiErrorMessage(payload) ?? `${fallback} failed with ${response.status}`);
}

async function setLike(postTemplateId: string, liked: boolean): Promise<LikeState> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to like templates.");
  }

  const url = new URL(
    `/api/v1/post-templates/${encodeURIComponent(postTemplateId)}/like`,
    API_BASE_URL,
  );

  const response = await fetch(url, {
    method: liked ? "POST" : "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, liked ? "Like request" : "Unlike request");
  }

  return response.json() as Promise<LikeState>;
}

export function likeTemplate(postTemplateId: string): Promise<LikeState> {
  return setLike(postTemplateId, true);
}

export function unlikeTemplate(postTemplateId: string): Promise<LikeState> {
  return setLike(postTemplateId, false);
}

export async function fetchLikedTemplates(): Promise<PostTemplateFeedResponse> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view your likes.");
  }

  const url = new URL("/api/v1/me/likes", API_BASE_URL);
  url.searchParams.set("limit", "50");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Likes request");
  }

  return response.json() as Promise<PostTemplateFeedResponse>;
}

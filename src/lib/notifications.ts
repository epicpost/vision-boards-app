import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

export type NotificationType = "post_template" | "search";

export interface Notification {
  id: string;
  title: string;
  type: NotificationType;
  img_preview: string | null;
  created_at: string;
  is_seen: boolean;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
  };
}

export interface UnreadCountResponse {
  data: {
    count: number;
  };
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

export const notificationsQueryKey = ["notifications", { limit: 50 }] as const;
export const unreadNotificationsQueryKey = ["notifications", "unread-count"] as const;

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

async function notificationRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view notifications.");
  }

  const response = await fetch(new URL(path, API_BASE_URL), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorResponse;

  if (!response.ok) {
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(
      getApiErrorMessage(payload) ?? `Notifications request failed with ${response.status}`,
    );
  }

  return payload;
}

export function fetchNotifications(): Promise<NotificationsResponse> {
  const url = new URL("/api/v1/me/notifications", API_BASE_URL);
  url.searchParams.set("limit", "50");

  return notificationRequest<NotificationsResponse>(`${url.pathname}${url.search}`);
}

export function fetchUnreadNotificationCount(): Promise<UnreadCountResponse> {
  return notificationRequest<UnreadCountResponse>("/api/v1/me/notifications/unread-count");
}

export function markNotificationSeen(notificationId: string) {
  return notificationRequest<{ success: boolean; message?: string | null }>(
    `/api/v1/me/notifications/${notificationId}/seen`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsSeen() {
  return notificationRequest<{ success: boolean; message?: string | null }>(
    "/api/v1/me/notifications/seen",
    { method: "PATCH" },
  );
}

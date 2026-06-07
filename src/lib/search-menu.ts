import { expireAuthSession, getAccessToken, hasAuthSession, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

export interface SearchMenuItem {
  id: string;
  label: string;
  thumb: string;
}

export interface SearchMenuSection {
  key: string;
  title: string;
  /** Whether items in this section can be removed from search history. */
  deletable: boolean;
  items: SearchMenuItem[];
}

export interface SearchMenuResponse {
  sections: SearchMenuSection[];
}

interface RawRecentItem {
  id: string;
  query: string;
  img_preview?: string | null;
  created_at?: string;
}

interface RawSuggestionItem {
  id: string;
  query: string;
  img_preview?: string | null;
}

interface SearchMenuApiResponse {
  data?: {
    recent?: RawRecentItem[];
    ideas?: RawSuggestionItem[];
    popular?: RawSuggestionItem[];
  };
  error?: { code?: string; message?: string };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

function getApiErrorMessage(payload: SearchMenuApiResponse) {
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

function isTokenExpiredError(payload: SearchMenuApiResponse) {
  return payload.error?.code === "TOKEN_EXPIRED";
}

function normalizeItem(raw: RawRecentItem | RawSuggestionItem): SearchMenuItem {
  return {
    id: String(raw.id),
    label: raw.query,
    thumb: raw.img_preview ?? "",
  };
}

export const searchMenuQueryKey = ["search", "menu"] as const;

const SEARCH_MENU_CACHE_KEY = "epicpost.search-menu";

export function readCachedSearchMenu(): SearchMenuResponse | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(SEARCH_MENU_CACHE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.sections)) return undefined;

    return parsed as SearchMenuResponse;
  } catch {
    return undefined;
  }
}

export function writeCachedSearchMenu(data: SearchMenuResponse): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SEARCH_MENU_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota / serialization errors — the cache is a best-effort optimization.
  }
}

export function clearCachedSearchMenu(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEARCH_MENU_CACHE_KEY);
}

export async function fetchSearchMenu(): Promise<SearchMenuResponse> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to see search suggestions.");
  }

  const response = await fetch(new URL("/api/v1/search/menu", API_BASE_URL), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as SearchMenuApiResponse;

  if (!response.ok) {
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(
      getApiErrorMessage(payload) ?? `Search menu request failed with ${response.status}`,
    );
  }

  const data = payload.data ?? {};

  const result: SearchMenuResponse = {
    sections: [
      {
        key: "recent",
        title: "Recent searches",
        deletable: true,
        items: (data.recent ?? []).map(normalizeItem),
      },
      {
        key: "ideas",
        title: "Ideas for you",
        deletable: false,
        items: (data.ideas ?? []).map(normalizeItem),
      },
      {
        key: "popular",
        title: "Popular on EpicPost",
        deletable: false,
        items: (data.popular ?? []).map(normalizeItem),
      },
    ].filter((section) => section.items.length > 0),
  };

  // Persist the freshest menu so the next app open / search can render instantly.
  writeCachedSearchMenu(result);

  return result;
}

/**
 * Fetch the search menu in the background for signed-in users without ever
 * prompting the sign-in dialog. Used to warm the cache on app open.
 */
export async function prefetchSearchMenu(): Promise<SearchMenuResponse | undefined> {
  if (!hasAuthSession()) return undefined;

  try {
    return await fetchSearchMenu();
  } catch {
    // Background warm-up is best-effort; ignore failures.
    return undefined;
  }
}

export async function recordSearch(query: string, imgPreview?: string | null): Promise<void> {
  const token = getAccessToken();
  // Recording history is best-effort and only applies to signed-in users.
  if (!token) return;

  const response = await fetch(new URL("/api/v1/search/recent", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, img_preview: imgPreview ?? null }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as SearchMenuApiResponse;
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(
      getApiErrorMessage(payload) ?? `Record search request failed with ${response.status}`,
    );
  }
}

export async function deleteSearchHistoryItem(id: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to manage your search history.");
  }

  const response = await fetch(
    new URL(`/api/v1/search/recent/${encodeURIComponent(id)}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as SearchMenuApiResponse;
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(
      getApiErrorMessage(payload) ?? `Delete search history request failed with ${response.status}`,
    );
  }
}

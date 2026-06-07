import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

export interface SearchMenuItem {
  label: string;
  thumb: string;
}

export interface SearchMenuSection {
  key: string;
  title: string;
  items: SearchMenuItem[];
}

export interface SearchMenuResponse {
  sections: SearchMenuSection[];
}

type RawItem =
  | string
  | {
      query?: string | null;
      label?: string | null;
      text?: string | null;
      title?: string | null;
      name?: string | null;
      thumb?: string | null;
      img_preview?: string | null;
      image?: string | null;
      url?: string | null;
      preview?: string | null;
    };

interface RawSection {
  key?: string | null;
  id?: string | null;
  title?: string | null;
  label?: string | null;
  name?: string | null;
  items?: RawItem[];
}

interface SearchMenuApiResponse {
  data?: { sections?: RawSection[] } | RawSection[];
  sections?: RawSection[];
  recent_searches?: RawItem[];
  ideas_for_you?: RawItem[];
  popular?: RawItem[];
  error?: { code?: string; message?: string };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

const FALLBACK_TITLES: Record<string, string> = {
  recent_searches: "Recent searches",
  ideas_for_you: "Ideas for you",
  popular: "Popular on EpicPost",
};

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

function normalizeItem(raw: RawItem): SearchMenuItem | null {
  if (typeof raw === "string") {
    return raw ? { label: raw, thumb: "" } : null;
  }

  const label = raw.query ?? raw.label ?? raw.text ?? raw.title ?? raw.name;
  if (!label) return null;

  const thumb = raw.thumb ?? raw.img_preview ?? raw.image ?? raw.url ?? raw.preview ?? "";

  return { label, thumb: thumb ?? "" };
}

function normalizeSection(raw: RawSection, fallbackKey?: string): SearchMenuSection | null {
  const key = raw.key ?? raw.id ?? fallbackKey ?? raw.title ?? raw.label ?? raw.name ?? "";
  const items = (raw.items ?? [])
    .map(normalizeItem)
    .filter((item): item is SearchMenuItem => Boolean(item));

  if (items.length === 0) return null;

  const title =
    raw.title ?? raw.label ?? raw.name ?? (fallbackKey ? FALLBACK_TITLES[fallbackKey] : undefined);
  if (!title) return null;

  return { key: String(key) || title, title, items };
}

function normalizeResponse(payload: SearchMenuApiResponse): SearchMenuResponse {
  const data = payload.data;
  const rawSections =
    payload.sections ??
    (Array.isArray(data) ? data : data?.sections) ??
    undefined;

  if (rawSections) {
    return {
      sections: rawSections
        .map((section) => normalizeSection(section))
        .filter((section): section is SearchMenuSection => Boolean(section)),
    };
  }

  // Flat shape: top-level keyed item arrays.
  const sections: SearchMenuSection[] = [];
  for (const key of ["recent_searches", "ideas_for_you", "popular"] as const) {
    const items = payload[key];
    if (Array.isArray(items)) {
      const section = normalizeSection({ items }, key);
      if (section) sections.push(section);
    }
  }

  return { sections };
}

export const searchMenuQueryKey = ["search", "menu"] as const;

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

  return normalizeResponse(payload);
}

import { API_BASE_URL } from "@/lib/post-templates";

// Font catalog — the selectable typefaces for the Brand Kit, served from the
// backend `fonts` table (reference data, like countries). Each font has a stable
// `id`; brand kits store `font_id` so a typeface can be passed by id to the
// render pipeline. `family` is the CSS font-family name and `provider` says
// where the webfont loads from (Google Fonts today).

export type FontCategory = "sans-serif" | "serif" | "display" | "monospace" | "handwriting";

export interface Font {
  id: string;
  family: string;
  category: FontCategory;
  provider: string;
  fallback: string;
}

export const fontsQueryKey = () => ["fonts"] as const;

// The catalog rarely changes, so we persist it to localStorage and only hit the
// network when the cached copy is missing or older than the TTL. Combined with
// React Query's in-memory cache, the fonts are effectively fetched once and
// reused across sessions/tabs for a week.
const FONTS_CACHE_KEY = "epicpost.fonts.v1";
export const FONTS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface FontsCache {
  fetchedAt: number;
  fonts: Font[];
}

export function readCachedFonts(): Font[] | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(FONTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FontsCache;
    if (!parsed?.fonts?.length || typeof parsed.fetchedAt !== "number") return null;
    if (Date.now() - parsed.fetchedAt > FONTS_CACHE_TTL_MS) return null;
    return parsed.fonts;
  } catch {
    return null;
  }
}

function writeCachedFonts(fonts: Font[]) {
  if (typeof localStorage === "undefined") return;
  try {
    const payload: FontsCache = { fetchedAt: Date.now(), fonts };
    localStorage.setItem(FONTS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / serialization errors — the cache is best-effort.
  }
}

export async function fetchFonts(): Promise<Font[]> {
  const cached = readCachedFonts();
  if (cached) return cached;

  const response = await fetch(new URL("/api/v1/fonts", API_BASE_URL));

  if (!response.ok) {
    throw new Error(`Fonts request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { data: Font[] };
  writeCachedFonts(payload.data);
  return payload.data;
}

// ── webfont loading ──────────────────────────────────────────────────────────
// Load every catalog family once so the picker (and previews) render in their
// own typeface. Built from the fetched catalog rather than a hardcoded list.

const GOOGLE_FONTS_LINK_ID = "brand-kit-google-fonts";

export function ensureFontsLoaded(fonts: Font[]) {
  if (typeof document === "undefined" || fonts.length === 0) return;
  const google = fonts.filter((font) => font.provider === "google");
  if (google.length === 0) return;

  const families = google
    .map((font) => `family=${font.family.trim().replace(/\s+/g, "+")}`)
    .join("&");
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

  const existing = document.getElementById(GOOGLE_FONTS_LINK_ID) as HTMLLinkElement | null;
  if (existing) {
    if (existing.href !== href) existing.href = href;
    return;
  }
  const link = document.createElement("link");
  link.id = GOOGLE_FONTS_LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

// The CSS `font-family` value for a font, including its generic fallback.
export function fontFamilyStack(font: Font): string {
  return `'${font.family}', ${font.fallback}`;
}

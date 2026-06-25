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
// Load only the families that are actively previewed. The catalog can contain
// thousands of Google Fonts families, so loading all of them would create a huge
// stylesheet request and slow down the Brand Kit picker.

const REMOTE_FONTS_LINK_ATTR = "data-brand-kit-remote-fonts";
const loadedFontScopes = new Map<string, Font[]>();

export function ensureFontsLoaded(fonts: Font[], scope = "default") {
  if (typeof document === "undefined") return;
  loadedFontScopes.set(scope, fonts);

  const unique = new Map<string, Font>();
  for (const scopedFonts of loadedFontScopes.values()) {
    for (const font of scopedFonts) {
      if (font.provider === "google") {
        unique.set(font.family.trim().toLowerCase(), font);
      }
    }
  }
  const remoteFonts = Array.from(unique.values()).filter((font) =>
    ["google", "bunny", "fontshare"].includes(font.provider),
  );
  const existing = Array.from(
    document.querySelectorAll<HTMLLinkElement>(`link[${REMOTE_FONTS_LINK_ATTR}]`),
  );
  if (remoteFonts.length === 0) {
    existing.forEach((link) => link.remove());
    return;
  }

  const hrefs = new Set(remoteFonts.map((font) => fontStylesheetHref(font)));
  for (const link of existing) {
    if (!hrefs.has(link.href)) link.remove();
    hrefs.delete(link.href);
  }
  for (const href of hrefs) {
    const link = document.createElement("link");
    link.setAttribute(REMOTE_FONTS_LINK_ATTR, "true");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

function fontStylesheetHref(font: Font): string {
  const provider = font.provider.toLowerCase();
  const family = font.family.trim();
  if (provider === "fontshare") {
    const slug = family.toLowerCase().replace(/\s+/g, "-");
    return `https://api.fontshare.com/v2/css?f[]=${slug}@300,400,500,600,700&display=swap`;
  }
  const spec = family.replace(/\s+/g, "+");
  if (provider === "bunny") {
    return `https://fonts.bunny.net/css?family=${spec}&display=swap`;
  }
  return `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
}

// The CSS `font-family` value for a font, including its generic fallback.
export function fontFamilyStack(font: Font): string {
  return `'${font.family}', ${font.fallback}`;
}

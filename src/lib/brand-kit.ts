import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

// Brand Kit (a.k.a. brand profile / brand DNA) — name, palette, fonts, logo,
// gallery, one-liner and values that future generations align to. Backed by
// `/api/v1/me/brand-profiles` (the model is `BrandProfile` server-side).

export interface BrandImage {
  asset_id: string;
  url: string;
  preview_url?: string | null;
  thumbnail_url?: string | null;
}

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  colors: Record<string, string>;
  font_family: string | null;
  secondary_font_family: string | null;
  logo_asset_id: string | null;
  logo_url: string | null;
  logo_preview_url: string | null;
  image_asset_ids: string[];
  images: BrandImage[];
  one_liner: string | null;
  brand_values: string[];
  tone_of_voice: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandKitInput {
  name: string;
  colors: Record<string, string>;
  font_family?: string | null;
  secondary_font_family?: string | null;
  logo_asset_id?: string | null;
  image_asset_ids?: string[];
  one_liner?: string | null;
  brand_values?: string[];
  tone_of_voice?: string | null;
  website_url?: string | null;
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
  throw new Error(getApiErrorMessage(payload) ?? `${fallback} failed with ${response.status}`);
}

// ── colors <-> palette mapping ───────────────────────────────────────────────
// The UI edits an ordered list of hex strings; the backend stores a `colors`
// dict whose first three keys keep their generation-relevant roles.

const PALETTE_ROLES = ["primary", "secondary", "accent"] as const;

export function paletteToColors(palette: string[]): Record<string, string> {
  const colors: Record<string, string> = {};
  palette
    .map((hex) => hex.trim())
    .filter(Boolean)
    .forEach((hex, i) => {
      const key = i < PALETTE_ROLES.length ? PALETTE_ROLES[i] : `color_${i + 1}`;
      colors[key] = hex;
    });
  return colors;
}

export function colorsToPalette(colors: Record<string, string> | null | undefined): string[] {
  if (!colors) return [];
  const palette: string[] = [];
  for (const role of PALETTE_ROLES) {
    if (colors[role]) palette.push(colors[role]);
  }
  Object.keys(colors)
    .filter((key) => /^color_\d+$/.test(key))
    .sort((a, b) => Number(a.split("_")[1]) - Number(b.split("_")[1]))
    .forEach((key) => palette.push(colors[key]));
  return palette;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const brandKitsQueryKey = () => ["brand-kits"] as const;

export async function fetchBrandKits(): Promise<BrandKit[]> {
  const token = requireToken("view your brand kits");

  const url = new URL("/api/v1/me/brand-profiles", API_BASE_URL);
  url.searchParams.set("limit", "50");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await throwApiError(response, "Brand kits request");
  }

  const payload = (await response.json()) as { data: BrandKit[] };
  return payload.data;
}

export async function createBrandKit(input: BrandKitInput): Promise<BrandKit> {
  const token = requireToken("create a brand kit");

  const response = await fetch(new URL("/api/v1/me/brand-profiles", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await throwApiError(response, "Create brand kit");
  }

  const payload = (await response.json()) as { data: BrandKit };
  return payload.data;
}

export async function updateBrandKit(id: string, input: Partial<BrandKitInput>): Promise<BrandKit> {
  const token = requireToken("update your brand kit");

  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}`, API_BASE_URL), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await throwApiError(response, "Update brand kit");
  }

  const payload = (await response.json()) as { data: BrandKit };
  return payload.data;
}

export async function deleteBrandKit(id: string): Promise<void> {
  const token = requireToken("delete a brand kit");

  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}`, API_BASE_URL), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await throwApiError(response, "Delete brand kit");
  }
}

// ── logo + gallery image uploads (profile-scoped, stored on S3) ───────────────
// These hit the brand-kit endpoints, which fan a single upload out into S3
// renditions (logo: original.png + preview.webp; image: original.jpg +
// preview/thumbnail.webp) and return the updated profile.

export async function uploadBrandLogo(id: string, file: File): Promise<BrandKit> {
  const token = requireToken("upload a logo");

  const body = new FormData();
  body.append("file", file);

  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}/logo`, API_BASE_URL), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!response.ok) {
    await throwApiError(response, "Logo upload");
  }

  const payload = (await response.json()) as { data: BrandKit };
  return payload.data;
}

export async function removeBrandLogo(id: string): Promise<BrandKit> {
  const token = requireToken("remove the logo");

  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}/logo`, API_BASE_URL), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await throwApiError(response, "Remove logo");
  }

  const payload = (await response.json()) as { data: BrandKit };
  return payload.data;
}

export async function uploadBrandImage(id: string, file: File): Promise<BrandKit> {
  const token = requireToken("upload an image");

  const body = new FormData();
  body.append("file", file);

  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}/images`, API_BASE_URL), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!response.ok) {
    await throwApiError(response, "Image upload");
  }

  const payload = (await response.json()) as { data: BrandKit };
  return payload.data;
}

export async function removeBrandImage(id: string, assetId: string): Promise<BrandKit> {
  const token = requireToken("remove an image");

  const response = await fetch(
    new URL(`/api/v1/me/brand-profiles/${id}/images/${assetId}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    await throwApiError(response, "Remove image");
  }

  const payload = (await response.json()) as { data: BrandKit };
  return payload.data;
}

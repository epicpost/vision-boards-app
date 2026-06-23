import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";

// ── asset ingestion (multipart browser uploads) ──────────────────────────────

export interface IngestedAsset {
  asset_id: string;
  url: string;
  mime_type: string;
  filename: string;
  width: number;
  height: number;
  size_bytes: number;
  status: "uploaded" | "processing" | "failed";
}

// ── generation results (remix + polling) ─────────────────────────────────────

export interface GenerationOutputAsset {
  asset_id: string;
  url: string;
  format: string | null;
  width: number | null;
  height: number | null;
}

export type GenerationStatus = "queued" | "processing" | "completed" | "failed";

export interface GenerationResult {
  generation_id: string;
  template_id: string;
  status: GenerationStatus;
  mode: string;
  aspect_ratio: string | null;
  assets: GenerationOutputAsset[];
  caption: string | null;
  warnings: string[];
  error: string | null;
  created_at: string;
}

export interface RemixGenerationItem {
  generation_id: string;
  template_id: string;
  template_title: string;
  status: GenerationStatus;
  aspect_ratio: string | null;
  assets: GenerationOutputAsset[];
  caption: string | null;
  error: string | null;
  created_at: string;
}

export interface RemixGenerationResponse {
  data: RemixGenerationItem[];
  pagination: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
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

export const remixesQueryKey = () => ["remixes", { limit: 50 }] as const;

export async function fetchRemixes({
  cursor,
  limit = 50,
}: {
  cursor?: string;
  limit?: number;
} = {}): Promise<RemixGenerationResponse> {
  const token = requireToken("view your remixes");

  const url = new URL("/api/v1/generations/remixes", API_BASE_URL);
  url.searchParams.set("limit", String(limit));
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await throwApiError(response, "Remixes request");
  }

  return response.json() as Promise<RemixGenerationResponse>;
}

export async function deleteRemix(generationId: string): Promise<void> {
  const token = requireToken("delete this remix");

  const response = await fetch(
    new URL(`/api/v1/generations/${encodeURIComponent(generationId)}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    await throwApiError(response, "Delete remix");
  }
}

export async function uploadAssetFiles(files: File[]): Promise<IngestedAsset[]> {
  const token = requireToken("upload images");

  const form = new FormData();
  files.forEach((file) => form.append("files", file, file.name));

  const response = await fetch(new URL("/api/v1/me/assets/upload", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    await throwApiError(response, "Image upload");
  }

  const payload = (await response.json()) as { assets: IngestedAsset[] };
  return payload.assets;
}

export interface RemixParams {
  templateId: string;
  assetIds: string[];
  caption?: string;
  aspectRatio?: string;
}

export async function remixTemplate(params: RemixParams): Promise<GenerationResult> {
  const token = requireToken("remix templates");

  const response = await fetch(new URL("/api/v1/generations/remix", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: params.templateId,
      asset_ids: params.assetIds,
      caption: params.caption || null,
      aspect_ratio: params.aspectRatio || null,
    }),
  });

  if (!response.ok) {
    await throwApiError(response, "Remix request");
  }

  return response.json() as Promise<GenerationResult>;
}

export interface RemixUploadParams {
  templateId: string;
  files: File[];
  caption?: string;
  aspectRatio?: string;
}

export async function remixTemplateUpload(params: RemixUploadParams): Promise<GenerationResult> {
  const token = requireToken("remix templates");

  const form = new FormData();
  form.append("template_id", params.templateId);
  if (params.caption) form.append("caption", params.caption);
  if (params.aspectRatio) form.append("aspect_ratio", params.aspectRatio);
  params.files.forEach((file) => form.append("images", file, file.name));

  const response = await fetch(new URL("/api/v1/generations/remix-upload", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    await throwApiError(response, "Remix request");
  }

  return response.json() as Promise<GenerationResult>;
}

export async function fetchGenerationResult(generationId: string): Promise<GenerationResult> {
  const token = requireToken("view generations");

  const response = await fetch(
    new URL(`/api/v1/generations/${encodeURIComponent(generationId)}`, API_BASE_URL),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    await throwApiError(response, "Generation status request");
  }

  return response.json() as Promise<GenerationResult>;
}

// Most remixes render inline and come back `completed`; queued/processing ones
// (future background workers) are polled until they settle or the wait expires.
export async function waitForGeneration(
  initial: GenerationResult,
  { intervalMs = 1500, timeoutMs = 90_000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<GenerationResult> {
  let result = initial;
  const deadline = Date.now() + timeoutMs;

  while (result.status === "queued" || result.status === "processing") {
    if (Date.now() >= deadline) {
      throw new Error("The remix is taking longer than expected. Please try again.");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    result = await fetchGenerationResult(result.generation_id);
  }

  return result;
}

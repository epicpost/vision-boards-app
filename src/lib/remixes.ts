import { expireAuthSession, getAccessToken, getAuthUser, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/post-templates";
import type { RemixEditorAsset, RemixEditorState } from "@/lib/remix-editor";
import {
  deleteLocalRemix,
  fetchLocalRemix,
  isLocalRemixId,
  listLocalRemixes,
  updateLocalRemix,
} from "@/lib/local-remixes";

// Per-user scope for the local remix store — mirrors `draftScopeId()` in
// use-editor-draft.ts so a local remix's ownership follows the signed-in user.
function remixScopeId(): string {
  return getAuthUser()?.id ?? "anon";
}

// Client for the DB-backed remix endpoints (api `remixes` module). A remix
// stores the editor's layer state in `custom_inputs` and its uploaded images as
// attached assets, so the editor can reload a saved remix and keep editing it.

export interface RemixDetail {
  remix_id: string;
  post_template_id: string;
  is_public: boolean;
  created_at: string;
  state: RemixEditorState;
  assets: RemixEditorAsset[];
}

export interface RemixSummary {
  remix_id: string;
  post_template_id: string;
  template_title: string;
  created_at: string;
  thumbnail_url: string | null;
  caption: string | null;
}

export const savedRemixesQueryKey = () => ["saved-remixes"] as const;

interface ApiErrorResponse {
  error?: { code?: string; message?: string };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

function apiErrorMessage(payload: ApiErrorResponse): string | null {
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
  if (payload.error?.code === "TOKEN_EXPIRED") expireAuthSession();
  throw new Error(apiErrorMessage(payload) ?? `${fallback} failed with ${response.status}`);
}

export async function createRemix(
  templateId: string,
  {
    assetIds,
    state,
    thumbnailAssetId,
  }: {
    assetIds: string[];
    state: RemixEditorState;
    thumbnailAssetId?: string;
  },
): Promise<{ remixId: string }> {
  const token = requireToken("save your remix");
  const response = await fetch(
    new URL(`/api/v1/post-templates/${encodeURIComponent(templateId)}/remixes`, API_BASE_URL),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        asset_ids: assetIds,
        custom_inputs: state,
        // The client renders the creative locally, so it also supplies the
        // composed thumbnail (an uploaded asset) for the remixes list. Omitted
        // when the render/upload failed — the save must still succeed.
        thumbnail_asset_id: thumbnailAssetId ?? null,
      }),
    },
  );
  if (!response.ok) await throwApiError(response, "Create remix");
  const body = (await response.json()) as { data: { remix_id: string } };
  return { remixId: body.data.remix_id };
}

// The user's saved remixes for the Remixes grid (each opens in the editor).
// Merges the backend's list with local (no-backend-row) remixes, newest first.
export async function fetchSavedRemixes(): Promise<RemixSummary[]> {
  const token = requireToken("view your remixes");
  const scopeId = remixScopeId();
  const [backend, local] = await Promise.all([
    (async () => {
      const response = await fetch(new URL("/api/v1/remixes", API_BASE_URL), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) await throwApiError(response, "Load remixes");
      const body = (await response.json()) as { data: RemixSummary[] };
      return body.data;
    })(),
    listLocalRemixes({ data: { scopeId } }),
  ]);
  return [...local, ...backend].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function fetchRemix(remixId: string): Promise<RemixDetail> {
  const token = requireToken("open your remix");
  if (isLocalRemixId(remixId)) {
    const detail = await fetchLocalRemix({ data: { remixId, scopeId: remixScopeId() } });
    if (!detail) throw new Error("Remix not found.");
    return detail;
  }
  const response = await fetch(
    new URL(`/api/v1/remixes/${encodeURIComponent(remixId)}`, API_BASE_URL),
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) await throwApiError(response, "Load remix");
  return response.json() as Promise<RemixDetail>;
}

export async function deleteSavedRemix(remixId: string): Promise<void> {
  const token = requireToken("delete this remix");
  if (isLocalRemixId(remixId)) {
    await deleteLocalRemix({ data: { remixId, scopeId: remixScopeId() } });
    return;
  }
  const response = await fetch(
    new URL(`/api/v1/remixes/${encodeURIComponent(remixId)}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) await throwApiError(response, "Delete remix");
}

// Autosave: replaces the remix's editor state. Pass `assetIds` only when the
// attached images changed (e.g. the user replaced a photo), so the server
// re-syncs the attachments; omit it to leave them untouched.
export async function updateRemix(
  remixId: string,
  {
    state,
    assetIds,
    thumbnailAssetId,
    thumbnailUrl,
  }: {
    state: RemixEditorState;
    assetIds?: string[];
    thumbnailAssetId?: string;
    thumbnailUrl?: string;
  },
): Promise<RemixDetail> {
  const token = requireToken("save your remix");
  if (isLocalRemixId(remixId)) {
    return updateLocalRemix({
      data: { remixId, scopeId: remixScopeId(), state, thumbnailUrl: thumbnailUrl ?? null },
    });
  }
  const response = await fetch(
    new URL(`/api/v1/remixes/${encodeURIComponent(remixId)}`, API_BASE_URL),
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        state,
        asset_ids: assetIds ?? null,
        // Refreshes the remixes-list thumbnail to match the just-saved edit.
        // Omitted (null) when the local render/upload failed this cycle.
        thumbnail_asset_id: thumbnailAssetId ?? null,
      }),
    },
  );
  if (!response.ok) await throwApiError(response, "Save remix");
  return response.json() as Promise<RemixDetail>;
}

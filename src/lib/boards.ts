import { expireAuthSession, getAccessToken, requestAuthDialog } from "@/lib/auth";
import { API_BASE_URL, type TemplateMediaType } from "@/lib/post-templates";

export interface BoardPreviewAsset {
  id: string;
  url: string;
  type: TemplateMediaType | null;
  order: number;
}

export interface Board {
  id: string;
  name: string;
  template_count: number;
  is_secret: boolean;
  is_archived: boolean;
  updated_at: string | null;
  preview_assets: BoardPreviewAsset[];
  is_top_choice: boolean;
}

interface RawBoard {
  id?: string | number;
  name?: string;
  title?: string;
  template_count?: number;
  post_templates_count?: number;
  pin_count?: number;
  pins_count?: number;
  is_secret?: boolean;
  secret?: boolean;
  is_archived?: boolean;
  archived?: boolean;
  is_top_choice?: boolean;
  updated_at?: string | null;
  created_at?: string | null;
  preview_assets?: RawBoardAsset[];
  previews?: RawBoardAsset[];
  thumbs?: RawBoardAsset[];
  pins?: Array<RawBoardAsset & { preview?: string | null; img_preview?: string | null }>;
  last_template_previews?: string[];
  visibility?: "public" | "secret";
}

type RawBoardAsset = string | RawBoardAssetObject;

interface RawBoardAssetObject {
  id?: string | number;
  url?: string | null;
  preview?: string | null;
  img_preview?: string | null;
  type?: TemplateMediaType | null;
  order?: number;
}

export interface BoardsResponse {
  data: Board[];
  pagination?: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
  };
}

type BoardsApiResponse =
  | { data?: RawBoard[]; boards?: RawBoard[]; pagination?: BoardsResponse["pagination"] }
  | RawBoard[]
  | ApiErrorResponse;

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: Array<{ msg?: string }> | string;
  message?: string;
}

export const boardsQueryKey = (suggestFor?: string) =>
  ["boards", { limit: 50, suggestFor: suggestFor ?? null }] as const;

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

function normalizeAsset(asset: RawBoardAsset, index: number): BoardPreviewAsset | null {
  if (typeof asset === "string") {
    return {
      id: `${asset}-${index}`,
      url: asset,
      type: "image",
      order: index,
    };
  }

  const url = asset.url ?? asset.preview ?? asset.img_preview;
  if (!url) return null;

  return {
    id: String(asset.id ?? `${url}-${index}`),
    url,
    type: asset.type ?? "image",
    order: asset.order ?? index,
  };
}

function normalizeBoard(board: RawBoard): Board {
  const rawAssets =
    board.preview_assets ??
    board.previews ??
    board.thumbs ??
    board.pins ??
    board.last_template_previews ??
    [];

  return {
    id: String(board.id ?? board.name ?? board.title ?? crypto.randomUUID()),
    name: board.name ?? board.title ?? "Untitled board",
    template_count:
      board.post_templates_count ??
      board.template_count ??
      board.pin_count ??
      board.pins_count ??
      board.last_template_previews?.length ??
      0,
    is_secret: board.is_secret ?? board.secret ?? board.visibility === "secret",
    is_archived: board.is_archived ?? board.archived ?? false,
    is_top_choice: board.is_top_choice ?? false,
    updated_at: board.updated_at ?? board.created_at ?? null,
    preview_assets: rawAssets
      .map((asset, index) => normalizeAsset(asset, index))
      .filter((asset): asset is BoardPreviewAsset => Boolean(asset))
      .sort((a, b) => a.order - b.order),
  };
}

export async function fetchBoards(suggestFor?: string): Promise<BoardsResponse> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view your boards.");
  }

  const url = new URL("/api/v1/me/boards", API_BASE_URL);
  url.searchParams.set("view", "short");
  url.searchParams.set("limit", "50");
  if (suggestFor) {
    // Ask the API to flag boards relevant to this template as "Top choices".
    url.searchParams.set("suggest_for", suggestFor);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as BoardsApiResponse;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse;
    if (isTokenExpiredError(errorPayload)) {
      expireAuthSession();
    }

    throw new Error(
      getApiErrorMessage(errorPayload) ?? `Boards request failed with ${response.status}`,
    );
  }

  const data = Array.isArray(payload)
    ? payload
    : ((payload as { data?: RawBoard[]; boards?: RawBoard[] }).data ??
      (payload as { boards?: RawBoard[] }).boards ??
      []);

  return {
    data: data.map(normalizeBoard),
    pagination: Array.isArray(payload)
      ? undefined
      : (payload as { pagination?: BoardsResponse["pagination"] }).pagination,
  };
}

export async function saveTemplateToBoard(postTemplateId: string, boardId: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to save templates.");
  }

  const url = new URL(
    `/api/v1/post-templates/${encodeURIComponent(postTemplateId)}/save`,
    API_BASE_URL,
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ board_id: boardId }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(getApiErrorMessage(payload) ?? `Save request failed with ${response.status}`);
  }
}

export async function unsaveTemplateFromBoard(
  postTemplateId: string,
  boardId: string,
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to manage saved templates.");
  }

  const url = new URL(
    `/api/v1/post-templates/${encodeURIComponent(postTemplateId)}/save`,
    API_BASE_URL,
  );

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ board_id: boardId }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }

    throw new Error(getApiErrorMessage(payload) ?? `Unsave request failed with ${response.status}`);
  }
}

export async function fetchBoardFeedCategories(): Promise<string[]> {
  const token = getAccessToken();
  if (!token) return [];

  const response = await fetchBoards();
  return response.data.map((board) => board.name);
}

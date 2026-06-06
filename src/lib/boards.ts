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
  pin_count: number;
  is_secret: boolean;
  is_archived: boolean;
  updated_at: string | null;
  preview_assets: BoardPreviewAsset[];
}

interface RawBoard {
  id?: string | number;
  name?: string;
  title?: string;
  pin_count?: number;
  pins_count?: number;
  post_templates_count?: number;
  is_secret?: boolean;
  secret?: boolean;
  is_archived?: boolean;
  archived?: boolean;
  updated_at?: string | null;
  created_at?: string | null;
  preview_assets?: RawBoardAsset[];
  previews?: RawBoardAsset[];
  thumbs?: RawBoardAsset[];
  pins?: Array<RawBoardAsset & { preview?: string | null; img_preview?: string | null }>;
  posts_count?: number;
}

interface RawBoardAsset {
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

export const boardsQueryKey = ["boards", { limit: 50 }] as const;

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
  const rawAssets = board.preview_assets ?? board.previews ?? board.thumbs ?? board.pins ?? [];

  return {
    id: String(board.id ?? board.name ?? board.title ?? crypto.randomUUID()),
    name: board.name ?? board.title ?? "Untitled board",
    pin_count:
      board.pin_count ?? board.pins_count ?? board.post_templates_count ?? board.posts_count ?? 0,
    is_secret: board.is_secret ?? board.secret ?? false,
    is_archived: board.is_archived ?? board.archived ?? false,
    updated_at: board.updated_at ?? board.created_at ?? null,
    preview_assets: rawAssets
      .map((asset, index) => normalizeAsset(asset, index))
      .filter((asset): asset is BoardPreviewAsset => Boolean(asset))
      .sort((a, b) => a.order - b.order),
  };
}

export async function fetchBoards(): Promise<BoardsResponse> {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view your boards.");
  }

  const url = new URL("/api/v1/me/boards/short", API_BASE_URL);
  url.searchParams.set("limit", "50");

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

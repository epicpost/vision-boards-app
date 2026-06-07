import { getAccessToken } from "@/lib/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://epicapi.epicpost.app";

export type TemplateMediaType = "image" | "video";

export interface TemplateAsset {
  id: string;
  url: string;
  type: TemplateMediaType;
  order: number;
  width: number | null;
  height: number | null;
}

export interface TemplateComment {
  id: string;
  comment: string;
  user_id: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface PostTemplate {
  id: string;
  title: string;
  preview: string | null;
  preview_type: TemplateMediaType | null;
  preview_width: number | null;
  preview_height: number | null;
  likes_count: number;
  is_saved: boolean;
  is_remixed: boolean;
  assets: TemplateAsset[];
  board_id: string | null;
  board_name: string | null;
  remix_id: string | null;
  description: string | null;
  tags: string[];
  comments: TemplateComment[];
  created_at: string;
  updated_at: string;
}

export interface PostTemplateFeedResponse {
  data: PostTemplate[];
  pagination: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
  };
}

export interface PostTemplateFeedParams {
  search?: string;
  board?: string;
}

export const postTemplatesQueryKey = ({ search, board }: PostTemplateFeedParams = {}) =>
  [
    "post-templates",
    { limit: 20, search: search?.trim() || undefined, board: board || undefined },
  ] as const;

export function getTemplateMedia(template: PostTemplate): {
  url: string | null;
  type: TemplateMediaType | null;
  width: number | null;
  height: number | null;
} {
  if (template.preview) {
    return {
      url: template.preview,
      type: template.preview_type,
      width: template.preview_width,
      height: template.preview_height,
    };
  }

  const firstAsset = [...template.assets].sort((a, b) => a.order - b.order)[0];
  return firstAsset
    ? {
        url: firstAsset.url,
        type: firstAsset.type,
        width: firstAsset.width,
        height: firstAsset.height,
      }
    : { url: null, type: null, width: null, height: null };
}

export async function fetchPostTemplates(
  params: PostTemplateFeedParams = {},
): Promise<PostTemplateFeedResponse> {
  const url = new URL("/api/v1/post-templates", API_BASE_URL);
  url.searchParams.set("limit", "20");

  const normalizedSearch = params.search?.trim();
  if (params.board) {
    url.searchParams.set("board", params.board);
  } else if (normalizedSearch) {
    url.searchParams.set("search", normalizedSearch);
  }

  // Optional auth: when signed in, send the access token so the feed includes
  // per-user state (is_saved / board_id / board_name / remix_id).
  const token = getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Post templates request failed with ${response.status}`);
  }

  return response.json() as Promise<PostTemplateFeedResponse>;
}

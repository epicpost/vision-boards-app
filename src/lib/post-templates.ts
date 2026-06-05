export const API_BASE_URL = "https://api-r3px.onrender.com";

export type TemplateMediaType = "image" | "video";

export interface TemplateAsset {
  id: string;
  url: string;
  type: TemplateMediaType;
  order: number;
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
  likes_count: number;
  is_saved: boolean;
  is_remixed: boolean;
  assets: TemplateAsset[];
  board_id: string | null;
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

export const postTemplatesQueryKey = (search?: string) =>
  ["post-templates", { limit: 20, search: search?.trim() || undefined }] as const;

export function getTemplateMedia(template: PostTemplate): {
  url: string | null;
  type: TemplateMediaType | null;
} {
  if (template.preview) {
    return { url: template.preview, type: template.preview_type };
  }

  const firstAsset = [...template.assets].sort((a, b) => a.order - b.order)[0];
  return firstAsset ? { url: firstAsset.url, type: firstAsset.type } : { url: null, type: null };
}

export async function fetchPostTemplates(search?: string): Promise<PostTemplateFeedResponse> {
  const url = new URL("/api/v1/post-templates", API_BASE_URL);
  url.searchParams.set("limit", "20");

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    url.searchParams.set("search", normalizedSearch);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Post templates request failed with ${response.status}`);
  }

  return response.json() as Promise<PostTemplateFeedResponse>;
}

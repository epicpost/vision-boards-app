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

// ── Generation contract (returned in full by the feed and the detail endpoint) ──
// These describe exactly what a template needs as input and what it produces,
// so the detail page can surface required/optional requirements, asset & text
// counts, video clips, output ratios and file formats.

export type AssetRequirementType = "image" | "video" | "audio" | "logo" | "document" | "text";

export interface AssetRequirement {
  key: string;
  type: AssetRequirementType;
  required: boolean;
  min_count: number;
  max_count: number;
  accepted_mime_types: string[];
  preferred_aspect_ratios: string[];
  min_width: number | null;
  min_height: number | null;
  allow_crop: boolean;
  allow_background_extend: boolean;
  allow_background_removal: boolean;
  transparent_preferred: boolean;
  description: string | null;
}

export interface TextRequirement {
  key: string;
  label: string;
  required: boolean;
  max_chars: number | null;
  recommended_chars: number | null;
  visible_on_asset: boolean;
  ai_can_generate: boolean;
  ai_can_rewrite: boolean;
  allowed_values: string[];
  description: string | null;
}

export interface InputRequirements {
  assets: AssetRequirement[];
  text_requirements: TextRequirement[];
  text_density: "none" | "low" | "medium" | "high";
  text_overflow_strategy: "shrink" | "wrap" | "truncate" | "reject";
}

export interface ResolutionPreset {
  aspect_ratio: string;
  width: number;
  height: number;
}

export interface ImageOutputSpec {
  supported_aspect_ratios: string[];
  default_aspect_ratio: string;
  supported_formats: string[];
  default_format: string;
  resolution_presets: ResolutionPreset[];
  has_safe_area: boolean;
  has_transparent_background: boolean;
  contains_text_overlay: boolean;
  contains_branding_slot: boolean;
}

export interface VideoOutputSpec {
  supported_aspect_ratios: string[];
  default_aspect_ratio: string;
  duration_min_seconds: number;
  duration_max_seconds: number;
  default_duration_seconds: number;
  fps: number;
  supported_formats: string[];
  default_format: string;
  has_captions: boolean;
  has_music_slot: boolean;
  has_voiceover_slot: boolean;
  loopable: boolean;
}

export interface VideoRequirements {
  clips_min: number;
  clips_max: number;
  default_clips: number;
  clip_duration_min_seconds: number;
  clip_duration_max_seconds: number;
  requires_audio: boolean;
  supports_music: boolean;
  supports_voiceover: boolean;
  supports_subtitles: boolean;
  scene_roles: string[];
}

export interface CarouselRequirements {
  slides_min: number;
  slides_max: number;
  default_slides: number;
  assets_per_slide_min: number;
  assets_per_slide_max: number;
  requires_cover_slide: boolean;
  requires_cta_slide: boolean;
  slide_roles: string[];
  allow_slide_reorder: boolean;
  allow_slide_count_change: boolean;
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
  // Generation contract — present on the feed and detail responses. Optional so
  // older cached entries (or partial fixtures) still type-check.
  template_type?: string;
  template_subtype?: string | null;
  aspect_ratio?: string | null;
  slide_count?: number | null;
  input_image_count?: number | null;
  render_engine?: string;
  render_mode?: string;
  input_requirements?: InputRequirements;
  output_spec?: ImageOutputSpec | null;
  video_output_spec?: VideoOutputSpec | null;
  video_requirements?: VideoRequirements | null;
  carousel_requirements?: CarouselRequirements | null;
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

export const postTemplateQueryKey = (id: string) => ["post-template", id] as const;

export async function fetchPostTemplate(id: string): Promise<PostTemplate> {
  const url = new URL(`/api/v1/post-templates/${id}`, API_BASE_URL);

  // Optional auth: signed-in callers also get per-user state (is_saved / board).
  const token = getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Post template request failed with ${response.status}`);
  }

  return response.json() as Promise<PostTemplate>;
}

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

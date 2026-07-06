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

export interface TemplateCapabilities {
  supports_ai_generation: boolean;
  supports_remix: boolean;
  supports_asset_replacement: boolean;
  supports_text_rewrite: boolean;
  supports_brand_adaptation: boolean;
  supports_aspect_ratio_conversion: boolean;
  supports_language_adaptation: boolean;
  supports_batch_generation: boolean;
  supports_variants: boolean;
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
  is_liked?: boolean;
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
  capabilities?: TemplateCapabilities;
  input_requirements?: InputRequirements;
  output_spec?: ImageOutputSpec | null;
  video_output_spec?: VideoOutputSpec | null;
  video_requirements?: VideoRequirements | null;
  carousel_requirements?: CarouselRequirements | null;
  agent_hints?: AgentHints;
}

export interface CaptionColorOption {
  label: string;
  value: string;
}

// The subset of agent_hints the composer reads. `render_defaults` carries the
// HTML render config — including the default caption colour the engine uses when
// none is passed and the `caption_color_options` palette the UI offers as
// preselected colour cards.
export interface AgentHints {
  render_template?: string | null;
  render_defaults?: {
    caption_color?: string;
    caption_color_options?: CaptionColorOption[];
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
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
  cursor?: string;
}

export const postTemplatesQueryKey = ({ search, board }: PostTemplateFeedParams = {}) =>
  [
    "post-templates",
    { limit: 20, search: search?.trim() || undefined, board: board || undefined },
  ] as const;

export const postTemplateQueryKey = (id: string) => ["post-template", id] as const;

const OPEN_SPACE_LIVING_ROOM_ID = "11000000-0000-0000-0000-000000000050";

const LOCAL_POST_TEMPLATES: PostTemplate[] = [
  {
    id: OPEN_SPACE_LIVING_ROOM_ID,
    title: "Open Space Living Room",
    preview: "/templates/shared/bd99b4086a779e897c606c7a58c7c06c.jpg",
    preview_type: "image",
    preview_width: 736,
    preview_height: 1308,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${OPEN_SPACE_LIVING_ROOM_ID}-preview`,
        url: "/templates/shared/bd99b4086a779e897c606c7a58c7c06c.jpg",
        type: "image",
        order: 0,
        width: 736,
        height: 1308,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      "An interior collage with a full-height living room backdrop, optional framed inset detail image, required headline and optional logo lockup.",
    tags: ["interior", "living room", "real estate", "architecture", "collage"],
    comments: [],
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
    template_type: "image",
    template_subtype: "interior_collage",
    aspect_ratio: "736 / 1308",
    slide_count: 1,
    input_image_count: 2,
    render_engine: "client",
    render_mode: "editor",
    capabilities: {
      supports_ai_generation: false,
      supports_remix: true,
      supports_asset_replacement: true,
      supports_text_rewrite: true,
      supports_brand_adaptation: true,
      supports_aspect_ratio_conversion: false,
      supports_language_adaptation: true,
      supports_batch_generation: false,
      supports_variants: false,
    },
    input_requirements: {
      assets: [
        {
          key: "living_room_images",
          type: "image",
          required: true,
          min_count: 1,
          max_count: 2,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["4:5", "1:1", "3:4"],
          min_width: 736,
          min_height: 920,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description:
            "One required living room or interior image. Add a second image to replace the framed inset detail.",
        },
        {
          key: "logo",
          type: "logo",
          required: false,
          min_count: 0,
          max_count: 1,
          accepted_mime_types: ["image/png", "image/svg+xml", "image/webp"],
          preferred_aspect_ratios: ["1:1", "4:3", "3:1"],
          min_width: 128,
          min_height: 128,
          allow_crop: false,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: true,
          description: "Optional logo placed in the top lockup.",
        },
      ],
      text_requirements: [
        {
          key: "headline",
          label: "Headline",
          required: true,
          max_chars: 44,
          recommended_chars: 24,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required headline. Default: "OPEN SPACE LIVING ROOM".',
        },
      ],
      text_density: "low",
      text_overflow_strategy: "wrap",
    },
    output_spec: {
      supported_aspect_ratios: ["736 / 1308"],
      default_aspect_ratio: "736 / 1308",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "736 / 1308", width: 736, height: 1308 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: true,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:open-space",
      render_defaults: {
        caption_color: "#ffffff",
        caption_color_options: [
          { label: "White", value: "#ffffff" },
          { label: "Concrete", value: "#aaa49c" },
          { label: "Charcoal", value: "#202020" },
          { label: "Forest", value: "#263f32" },
        ],
      },
    },
  },
];

function localTemplateMatches(template: PostTemplate, search?: string): boolean {
  const needle = search?.trim().toLowerCase();
  if (!needle) return true;
  return [template.title, template.description, ...template.tags]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(needle));
}

export function localPostTemplatesForParams(params: PostTemplateFeedParams = {}): PostTemplate[] {
  if (params.board || params.cursor) return [];
  return LOCAL_POST_TEMPLATES.filter((template) => localTemplateMatches(template, params.search));
}

function mergeLocalTemplates(
  response: PostTemplateFeedResponse,
  params: PostTemplateFeedParams,
): PostTemplateFeedResponse {
  const existing = new Set(response.data.map((template) => template.id));
  const local = localPostTemplatesForParams(params).filter(
    (template) => !existing.has(template.id),
  );
  if (local.length === 0) return response;
  return {
    ...response,
    data: [...local, ...response.data],
  };
}

export async function fetchPostTemplate(id: string): Promise<PostTemplate> {
  const local = LOCAL_POST_TEMPLATES.find((template) => template.id === id);
  if (local) return local;

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
  if (params.cursor) {
    url.searchParams.set("cursor", params.cursor);
  }

  // Optional auth: when signed in, send the access token so the feed includes
  // per-user state (is_saved / board_id / board_name / remix_id).
  const token = getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const local = localPostTemplatesForParams(params);
    if (local.length > 0) {
      return {
        data: local,
        pagination: { limit: 20, next_cursor: null, has_more: false },
      };
    }
    throw new Error(`Post templates request failed with ${response.status}`);
  }

  const payload = (await response.json()) as PostTemplateFeedResponse;
  return mergeLocalTemplates(payload, params);
}

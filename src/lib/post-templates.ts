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
const BEAUTY_COLLECTION_ID = "11000000-0000-0000-0000-000000000056";
const FASHION_ICONS_ID = "11000000-0000-0000-0000-000000000052";
const SHOWCASE_DROP_ID = "11000000-0000-0000-0000-000000000053";
const SHOWCASE_SALE_ID = "11000000-0000-0000-0000-000000000054";
const SHOWCASE_LOOKBOOK_ID = "11000000-0000-0000-0000-000000000055";
const SUMMER_MOOD_ID = "11000000-0000-0000-0000-000000000057";
const BREAKING_NEWS_ID = "11000000-0000-0000-0000-000000000058";

const LOCAL_POST_TEMPLATES: PostTemplate[] = [
  {
    id: BREAKING_NEWS_ID,
    title: "Breaking News",
    preview: "/templates/shared/53c6a231711063dc41ed8a5cd2e9c08a.jpg",
    preview_type: "image",
    preview_width: 1080,
    preview_height: 1350,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${BREAKING_NEWS_ID}-preview`,
        url: "/templates/shared/53c6a231711063dc41ed8a5cd2e9c08a.jpg",
        type: "image",
        order: 0,
        width: 1080,
        height: 1350,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      "A breaking-news social post with a required red label, bold title/caption, rounded image and bottom-right logo slot.",
    tags: ["news", "breaking", "headline", "media", "social post"],
    comments: [],
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z",
    template_type: "image",
    template_subtype: "breaking_news_post",
    aspect_ratio: "1080 / 1350",
    slide_count: 1,
    input_image_count: 1,
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
          key: "story_image",
          type: "image",
          required: true,
          min_count: 1,
          max_count: 1,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["6:5", "4:3", "16:9", "1:1"],
          min_width: 720,
          min_height: 540,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description: "One required news image placed inside the rounded photo frame.",
        },
        {
          key: "logo",
          type: "logo",
          required: true,
          min_count: 1,
          max_count: 1,
          accepted_mime_types: ["image/png", "image/svg+xml", "image/webp", "image/jpeg"],
          preferred_aspect_ratios: ["2:1", "3:1", "1:1"],
          min_width: 96,
          min_height: 48,
          allow_crop: false,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: true,
          description: "Required publisher or brand logo shown in the bottom-right corner.",
        },
      ],
      text_requirements: [
        {
          key: "title_caption",
          label: "Title / caption",
          required: true,
          max_chars: 100,
          recommended_chars: 68,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description:
            'Required bold headline. Default: "TRUMP SAYS MEMORANDUM OF UNDERSTANDING WITH IRAN \'IS OVER\'".',
        },
        {
          key: "breaking_label",
          label: "Breaking label",
          required: true,
          max_chars: 18,
          recommended_chars: 8,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required red-badge label. Default: "BREAKING".',
        },
      ],
      text_density: "medium",
      text_overflow_strategy: "wrap",
    },
    output_spec: {
      supported_aspect_ratios: ["1080 / 1350"],
      default_aspect_ratio: "1080 / 1350",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "1080 / 1350", width: 1080, height: 1350 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: true,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:breaking-news",
      render_defaults: {
        caption_color: "#0d111b",
        caption_color_options: [
          { label: "Ink", value: "#0d111b" },
          { label: "White", value: "#ffffff" },
          { label: "Breaking red", value: "#cc0001" },
          { label: "Logo grey", value: "#777777" },
        ],
      },
    },
  },
  {
    id: BEAUTY_COLLECTION_ID,
    title: "Beauty Collection",
    preview: "/templates/shared/e876c2ccf4cffd6d1513713ce8f2e7f5.jpg",
    preview_type: "image",
    preview_width: 736,
    preview_height: 1104,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${BEAUTY_COLLECTION_ID}-preview`,
        url: "/templates/shared/e876c2ccf4cffd6d1513713ce8f2e7f5.jpg",
        type: "image",
        order: 0,
        width: 736,
        height: 1104,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      'A beauty editorial poster with a rounded portrait cutout, optional "BEAUTY 2025" label, required "New Collection" headline and optional "U & ME" footer wordmark.',
    tags: ["beauty", "fashion", "collection", "editorial", "poster", "brand"],
    comments: [],
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z",
    template_type: "image",
    template_subtype: "beauty_collection_poster",
    aspect_ratio: "736 / 1104",
    slide_count: 1,
    input_image_count: 1,
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
          key: "portrait_photo",
          type: "image",
          required: true,
          min_count: 1,
          max_count: 1,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["2:3", "3:4", "4:5"],
          min_width: 736,
          min_height: 920,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description:
            "One portrait, beauty or campaign image revealed through the rounded cutouts.",
        },
      ],
      text_requirements: [
        {
          key: "headline",
          label: "New Collection",
          required: true,
          max_chars: 32,
          recommended_chars: 14,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required headline. Default: "New\\nCollection".',
        },
        {
          key: "season_label",
          label: "BEAUTY 2025",
          required: false,
          max_chars: 24,
          recommended_chars: 11,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional top label. Default: "BEAUTY 2025".',
        },
        {
          key: "footer_wordmark",
          label: "U & ME",
          required: false,
          max_chars: 24,
          recommended_chars: 6,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional footer wordmark. Default: "U & ME".',
        },
      ],
      text_density: "low",
      text_overflow_strategy: "wrap",
    },
    output_spec: {
      supported_aspect_ratios: ["736 / 1104"],
      default_aspect_ratio: "736 / 1104",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "736 / 1104", width: 736, height: 1104 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: false,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:beauty-collection",
      render_defaults: {
        caption_color: "#111111",
        caption_color_options: [
          { label: "Black", value: "#111111" },
          { label: "Fern", value: "#314c2f" },
          { label: "Merlot", value: "#8a1824" },
          { label: "Warm brown", value: "#7a4d35" },
        ],
      },
    },
  },
  {
    id: FASHION_ICONS_ID,
    title: "Everyday Icons",
    preview: "/templates/shared/5f0141e800d6ae18b904a5f4a4aefe2a.jpg",
    preview_type: "image",
    preview_width: 736,
    preview_height: 1034,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${FASHION_ICONS_ID}-preview`,
        url: "/templates/shared/5f0141e800d6ae18b904a5f4a4aefe2a.jpg",
        type: "image",
        order: 0,
        width: 736,
        height: 1034,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      "A six-image fashion editorial collage with a required EVERYDAY ICONS title and two optional small copy blocks for seasonal product storytelling.",
    tags: ["fashion", "editorial", "leather jacket", "collage", "lookbook"],
    comments: [],
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
    template_type: "image",
    template_subtype: "fashion_collage",
    aspect_ratio: "736 / 1034",
    slide_count: 1,
    input_image_count: 6,
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
          key: "fashion_images",
          type: "image",
          required: true,
          min_count: 6,
          max_count: 6,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["2:3", "3:4", "1:1", "4:5"],
          min_width: 512,
          min_height: 512,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description:
            "Six fashion, product-detail, or lookbook images placed into the collage cells.",
        },
      ],
      text_requirements: [
        {
          key: "headline",
          label: "Title",
          required: true,
          max_chars: 32,
          recommended_chars: 14,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required title. Default: "EVERYDAY ICONS".',
        },
        {
          key: "left_copy",
          label: "Left copy",
          required: false,
          max_chars: 80,
          recommended_chars: 52,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description:
            'Optional small copy. Default: "THE LEATHER JACKET: YOUR GO-TO PIECE THIS WINTER."',
        },
        {
          key: "right_copy",
          label: "Right copy",
          required: false,
          max_chars: 120,
          recommended_chars: 92,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: "Optional small copy about the everyday leather jacket uniform.",
        },
      ],
      text_density: "medium",
      text_overflow_strategy: "wrap",
    },
    output_spec: {
      supported_aspect_ratios: ["736 / 1034"],
      default_aspect_ratio: "736 / 1034",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "736 / 1034", width: 736, height: 1034 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: false,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:fashion-icons",
      render_defaults: {
        caption_color: "#000000",
        caption_color_options: [
          { label: "Black", value: "#000000" },
          { label: "Leather", value: "#2a1710" },
          { label: "Camel", value: "#b58b62" },
          { label: "Warm grey", value: "#8a8177" },
        ],
      },
    },
  },
  {
    id: SHOWCASE_DROP_ID,
    title: "Cozy Drop Grid",
    preview: "/templates/shared/1a0141e800d6ae18b904a5f4a4aefe1a.jpg",
    preview_type: "image",
    preview_width: 736,
    preview_height: 920,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${SHOWCASE_DROP_ID}-preview`,
        url: "/templates/shared/1a0141e800d6ae18b904a5f4a4aefe1a.jpg",
        type: "image",
        order: 0,
        width: 736,
        height: 920,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      "An eight-photo 3×3 grid with a centre drop-announcement panel: an optional eyebrow, a required brand headline, a required call to action and a required URL.",
    tags: ["fashion", "apparel", "drop", "collage", "grid", "ecommerce"],
    comments: [],
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
    template_type: "image",
    template_subtype: "product_drop_grid",
    aspect_ratio: "736 / 920",
    slide_count: 1,
    input_image_count: 8,
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
          key: "drop_photos",
          type: "image",
          required: true,
          min_count: 8,
          max_count: 8,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["4:5", "3:4", "1:1"],
          min_width: 512,
          min_height: 512,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description: "Eight product or lookbook photos, one per grid cell.",
        },
      ],
      text_requirements: [
        {
          key: "eyebrow",
          label: "Tagline",
          required: false,
          max_chars: 24,
          recommended_chars: 12,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional small tagline above the headline. Default: "DROP COZY".',
        },
        {
          key: "header",
          label: "Brand headline",
          required: true,
          max_chars: 20,
          recommended_chars: 10,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required, wide-tracked centre headline. Default: "MADE ME".',
        },
        {
          key: "cta",
          label: "Call to action",
          required: true,
          max_chars: 24,
          recommended_chars: 14,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required call to action. Default: "SHOP ONLINE".',
        },
        {
          key: "description",
          label: "Website",
          required: true,
          max_chars: 40,
          recommended_chars: 26,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description:
            'Required URL set under the call to action. Default: "www.mademeclothing.com.br".',
        },
      ],
      text_density: "low",
      text_overflow_strategy: "truncate",
    },
    output_spec: {
      supported_aspect_ratios: ["736 / 920"],
      default_aspect_ratio: "736 / 920",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "736 / 920", width: 736, height: 920 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: false,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:showcase-drop",
      render_defaults: {
        caption_color: "#3f3f3d",
        caption_color_options: [
          { label: "Charcoal", value: "#3f3f3d" },
          { label: "White", value: "#ffffff" },
          { label: "Taupe", value: "#8a8074" },
          { label: "Black", value: "#000000" },
        ],
      },
    },
  },
  {
    id: SHOWCASE_SALE_ID,
    title: "Sitewide Sale Grid",
    preview: "/templates/shared/2b0141e800d6ae18b904a5f4a4aefe2b.jpg",
    preview_type: "image",
    preview_width: 1000,
    preview_height: 1500,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${SHOWCASE_SALE_ID}-preview`,
        url: "/templates/shared/2b0141e800d6ae18b904a5f4a4aefe2b.jpg",
        type: "image",
        order: 0,
        width: 1000,
        height: 1500,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      "An eight-photo 3×3 grid with a centre sitewide-sale panel: an optional serif wordmark, a required limited-time line, a required bold sale headline and two optional fine-print lines.",
    tags: ["fashion", "sale", "promotion", "collage", "grid", "ecommerce"],
    comments: [],
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
    template_type: "image",
    template_subtype: "sitewide_sale_grid",
    aspect_ratio: "1000 / 1500",
    slide_count: 1,
    input_image_count: 8,
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
          key: "sale_photos",
          type: "image",
          required: true,
          min_count: 8,
          max_count: 8,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["2:3", "3:4", "4:5"],
          min_width: 512,
          min_height: 512,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description: "Eight product or lookbook photos, one per grid cell.",
        },
      ],
      text_requirements: [
        {
          key: "eyebrow",
          label: "Wordmark",
          required: false,
          max_chars: 24,
          recommended_chars: 10,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional brand wordmark above the sale copy. Default: "SHONAJOY".',
        },
        {
          key: "description",
          label: "Eyebrow line",
          required: true,
          max_chars: 30,
          recommended_chars: 18,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required line above the sale headline. Default: "Limited Time Only".',
        },
        {
          key: "header",
          label: "Sale headline",
          required: true,
          max_chars: 40,
          recommended_chars: 22,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required bold headline, wraps to fit. Default: "30% OFF SITEWIDE SALE".',
        },
        {
          key: "cta",
          label: "Exclusion line",
          required: false,
          max_chars: 30,
          recommended_chars: 20,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional exclusion line. Default: "Excludes Signatures".',
        },
        {
          key: "finePrint",
          label: "Fine print",
          required: false,
          max_chars: 20,
          recommended_chars: 12,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional legal fine print. Default: "T&Cs Apply".',
        },
      ],
      text_density: "medium",
      text_overflow_strategy: "wrap",
    },
    output_spec: {
      supported_aspect_ratios: ["1000 / 1500"],
      default_aspect_ratio: "1000 / 1500",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "1000 / 1500", width: 1000, height: 1500 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: false,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:showcase-sale",
      render_defaults: {
        caption_color: "#161616",
        caption_color_options: [
          { label: "Black", value: "#000000" },
          { label: "White", value: "#ffffff" },
          { label: "Rust red", value: "#a4351f" },
          { label: "Denim", value: "#2b3038" },
        ],
      },
    },
  },
  {
    id: SHOWCASE_LOOKBOOK_ID,
    title: "Mid Year Lookbook Grid",
    preview: "/templates/shared/3c0141e800d6ae18b904a5f4a4aefe3c.jpg",
    preview_type: "image",
    preview_width: 1000,
    preview_height: 1500,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${SHOWCASE_LOOKBOOK_ID}-preview`,
        url: "/templates/shared/3c0141e800d6ae18b904a5f4a4aefe3c.jpg",
        type: "image",
        order: 0,
        width: 1000,
        height: 1500,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      'An eight-photo 3×3 lookbook grid with a centre sale panel: an optional fine-print line, a required italic headline, a required sub-headline and a required wordmark. Every photo is automatically numbered "Look 1" through "Look 8" — a fixed label, not an editable field.',
    tags: ["fashion", "lookbook", "sale", "collage", "grid", "ecommerce"],
    comments: [],
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
    template_type: "image",
    template_subtype: "lookbook_sale_grid",
    aspect_ratio: "1000 / 1500",
    slide_count: 1,
    input_image_count: 8,
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
          key: "lookbook_photos",
          type: "image",
          required: true,
          min_count: 8,
          max_count: 8,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["2:3", "3:4", "4:5"],
          min_width: 512,
          min_height: 512,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description: 'Eight numbered lookbook photos ("Look 1"–"Look 8"), one per grid cell.',
        },
      ],
      text_requirements: [
        {
          key: "eyebrow",
          label: "Fine print",
          required: false,
          max_chars: 24,
          recommended_chars: 14,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Optional fine print above the headline. Default: "+ T&C\'S Apply".',
        },
        {
          key: "header",
          label: "Headline",
          required: true,
          max_chars: 24,
          recommended_chars: 16,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required italic serif headline. Default: "Up to 60% off™".',
        },
        {
          key: "description",
          label: "Sub-headline",
          required: true,
          max_chars: 24,
          recommended_chars: 14,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required sub-headline under the headline. Default: "Mid Year Sale".',
        },
        {
          key: "cta",
          label: "Wordmark",
          required: true,
          max_chars: 20,
          recommended_chars: 8,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: 'Required brand wordmark at the base of the panel. Default: "MESHKI".',
        },
      ],
      text_density: "low",
      text_overflow_strategy: "truncate",
    },
    output_spec: {
      supported_aspect_ratios: ["1000 / 1500"],
      default_aspect_ratio: "1000 / 1500",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "1000 / 1500", width: 1000, height: 1500 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: false,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:showcase-lookbook",
      render_defaults: {
        caption_color: "#1a1a1a",
        caption_color_options: [
          { label: "Black", value: "#000000" },
          { label: "White", value: "#ffffff" },
          { label: "Crimson", value: "#7a1f1f" },
          { label: "Burgundy", value: "#5c2430" },
        ],
      },
    },
  },
  {
    id: SUMMER_MOOD_ID,
    title: "Summer Mood",
    preview: "/templates/shared/12c6a594683063dc41ed8a5cd2e9c08a.jpg",
    preview_type: "image",
    preview_width: 900,
    preview_height: 1600,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: `${SUMMER_MOOD_ID}-preview`,
        url: "/templates/shared/12c6a594683063dc41ed8a5cd2e9c08a.jpg",
        type: "image",
        order: 0,
        width: 900,
        height: 1600,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description:
      'A four-image pool collage story with one required "summer mood" caption repeated along three diagonal white strips.',
    tags: ["summer", "pool", "mood", "collage", "story", "travel"],
    comments: [],
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z",
    template_type: "image",
    template_subtype: "summer_mood_collage",
    aspect_ratio: "900 / 1600",
    slide_count: 1,
    input_image_count: 4,
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
          key: "pool_collage_images",
          type: "image",
          required: true,
          min_count: 4,
          max_count: 4,
          accepted_mime_types: ["image/jpeg", "image/png", "image/webp"],
          preferred_aspect_ratios: ["9:16", "4:5", "3:4", "1:1"],
          min_width: 512,
          min_height: 512,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description:
            "Four required pool, summer, travel, or lifestyle images placed into the collage panels.",
        },
      ],
      text_requirements: [
        {
          key: "headline",
          label: "Mood text",
          required: true,
          max_chars: 32,
          recommended_chars: 12,
          visible_on_asset: true,
          ai_can_generate: true,
          ai_can_rewrite: true,
          allowed_values: [],
          description:
            'Required mood text. Default: "summer mood". It repeats along the diagonal bands.',
        },
      ],
      text_density: "medium",
      text_overflow_strategy: "truncate",
    },
    output_spec: {
      supported_aspect_ratios: ["900 / 1600"],
      default_aspect_ratio: "900 / 1600",
      supported_formats: ["png", "jpeg", "webp"],
      default_format: "png",
      resolution_presets: [{ aspect_ratio: "900 / 1600", width: 900, height: 1600 }],
      has_safe_area: true,
      has_transparent_background: false,
      contains_text_overlay: true,
      contains_branding_slot: false,
    },
    video_output_spec: null,
    video_requirements: null,
    carousel_requirements: null,
    agent_hints: {
      render_template: "client:summer-mood",
      render_defaults: {
        caption_color: "#000000",
        caption_color_options: [
          { label: "Black", value: "#000000" },
          { label: "White", value: "#ffffff" },
          { label: "Pool", value: "#17a99a" },
          { label: "Tomato", value: "#d94b2b" },
        ],
      },
    },
  },
  {
    id: OPEN_SPACE_LIVING_ROOM_ID,
    title: "Open Space Living Room",
    preview: "/templates/shared/open-space-living-room-preview.jpg",
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
        url: "/templates/shared/open-space-living-room-preview.jpg",
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

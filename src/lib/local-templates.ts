// Locally-defined templates surfaced in the feed alongside the API's.
//
// The backend feed (`fetchPostTemplates`) is the source of truth for most pins,
// but a handful of templates are rendered entirely client-side by the remix
// editor (see `remix-editor.ts`). This module lets those appear in the "All"
// grid and open their own detail page without a backend row — the feed merges
// them in, and the detail route resolves them here when the id matches.

import type { PostTemplate } from "@/lib/post-templates";

// Travel Inspiration Pin — the verticals editor template. Preview art lives at
// public/templates/shared/Travel Inspiration Pin.jpg (736 x 981).
const TRAVEL_INSPIRATION_PIN: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000032",
  title: "Travel Inspiration Pin",
  preview: "/templates/shared/Travel%20Inspiration%20Pin.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 981,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "travel-pin-cover",
      url: "/templates/shared/Travel%20Inspiration%20Pin.jpg",
      type: "image",
      order: 0,
      width: 736,
      height: 981,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "A vertical photo-strip collage with an optional title spread one letter per strip. Reusable for 2–7 images; the text can sit at any vertical position with your own fonts, colours, and shadow.",
  tags: ["travel", "collage", "vertical", "pin"],
  comments: [],
  created_at: "2026-07-03T00:00:00.000Z",
  updated_at: "2026-07-03T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "3 / 4",
  input_image_count: 2,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // Surfaces the composer's optional Fonts/Colors cards for this template: a
  // (non-required) caption requirement makes `requiresText` true, and the
  // title-colour palette mirrors TRAVEL_PIN's palette in remix-editor.ts so a
  // picked swatch matches what the editor itself offers.
  input_requirements: {
    // Mirrors VERTICALS_LAYOUT.min/maxStrips in remix-editor.ts — the editor
    // supports 2-7 photo strips, so the composer's upload requirement should
    // match instead of falling back to the fixed `input_image_count`.
    assets: [
      {
        key: "photos",
        type: "image",
        required: true,
        min_count: 2,
        max_count: 7,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: [],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description: "2-7 full-height vertical photo strips.",
      },
    ],
    text_requirements: [
      {
        key: "title",
        label: "Title",
        required: false,
        max_chars: 24,
        recommended_chars: 8,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "One word spread across the photo strips.",
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#e9c33c",
      caption_color_options: [
        { label: "Gold", value: "#e9c33c" },
        { label: "Paper", value: "#ffffff" },
        { label: "Coral", value: "#e8542a" },
        { label: "Sea", value: "#1f6f6b" },
        { label: "Ink", value: "#141414" },
      ],
    },
  },
};

// Soulkin Split Pin — the split-editorial editor template. Preview art lives at
// public/templates/shared/Soulkin Split Pin.jpg (736 x 920).
const SOULKIN_SPLIT_PIN: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000033",
  title: "Soulkin Split Pin",
  preview: "/templates/shared/Soulkin%20Split%20Pin.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 920,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "soulkin-split-cover",
      url: "/templates/shared/Soulkin%20Split%20Pin.jpg",
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
    "A split editorial pin: a paper panel beside a full-height photo, with a giant headline knocked out of the paper to reveal the photo behind it, plus a small body block. The headline and body are your own text.",
  tags: ["editorial", "split", "typography", "pin", "minimal"],
  comments: [],
  created_at: "2026-07-03T00:00:00.000Z",
  updated_at: "2026-07-03T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "4 / 5",
  input_image_count: 1,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
};

// Sunday Sliced Type — the sliced-type editor template. Preview art lives at
// public/templates/shared/sunday.jpg (674 x 898).
const SUNDAY_SLICED_POSTER: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000034",
  title: "Sunday Sliced Type",
  preview: "/templates/shared/sunday.jpg",
  preview_type: "image",
  preview_width: 674,
  preview_height: 898,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "sunday-sliced-cover",
      url: "/templates/shared/sunday.jpg",
      type: "image",
      order: 0,
      width: 674,
      height: 898,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "A sliced-type poster: your caption set one giant letter per row, each filled with its own horizontal slice of a single photo, with an optional date, quote and year. Bring your own photo, caption and fonts.",
  tags: ["typography", "editorial", "poster", "sliced", "minimal"],
  comments: [],
  created_at: "2026-07-03T00:00:00.000Z",
  updated_at: "2026-07-03T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "3 / 4",
  input_image_count: 1,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // A required caption drives the composer's Fonts/Colors cards (optional font
  // family); one required photo fills the sliced letters. The optional date,
  // quote and year are edited in the editor, not the composer.
  input_requirements: {
    assets: [
      {
        key: "photo",
        type: "image",
        required: true,
        min_count: 1,
        max_count: 1,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: [],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description: "The photo sliced across the caption's letters.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Caption",
        required: true,
        max_chars: 16,
        recommended_chars: 6,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The word set in giant sliced letters (uppercased).",
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#33302b",
      caption_color_options: [
        { label: "Ink", value: "#33302b" },
        { label: "Paper", value: "#f3ece4" },
        { label: "Forest", value: "#3f5d3a" },
        { label: "Clay", value: "#a5714e" },
        { label: "Black", value: "#141414" },
      ],
    },
  },
};

// This or That Poll — the MA&partners split-comparison story poll. Preview art
// lives at public/templates/shared/ma_4.jpg (1170 x 2010).
const DUEL_THIS_OR_THAT: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000035",
  title: "This or That Poll",
  preview: "/templates/shared/ma_4.jpg",
  preview_type: "image",
  preview_width: 1170,
  preview_height: 2010,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "duel-cover",
      url: "/templates/shared/ma_4.jpg",
      type: "image",
      order: 0,
      width: 1170,
      height: 2010,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "A this-or-that story poll: two vertical photos side by side, a stacked serif caption over them, and a poll card with two option rows. Bring two photos and your own caption; the Left/Right options and brand wordmark are optional and fully editable.",
  tags: ["poll", "story", "comparison", "this or that", "split", "vertical"],
  comments: [],
  created_at: "2026-07-03T00:00:00.000Z",
  updated_at: "2026-07-03T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "9 / 16",
  input_image_count: 2,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // Two required vertical photos fill the split; a required caption drives the
  // composer's Fonts/Colors cards (optional font family). The optional Left/Right
  // options and the wordmark are edited in the editor, not the composer.
  input_requirements: {
    assets: [
      {
        key: "photos",
        type: "image",
        required: true,
        min_count: 2,
        max_count: 2,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: [],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description: "Two vertical photos, shown side by side (left and right).",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Caption",
        required: true,
        max_chars: 24,
        recommended_chars: 12,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: 'The stacked headline, e.g. "this or that" (lowercase by default).',
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#ffffff",
      caption_color_options: [
        { label: "Paper", value: "#ffffff" },
        { label: "Ink", value: "#1c1a17" },
        { label: "Sand", value: "#e7ddd0" },
        { label: "Olive", value: "#5c5a3a" },
        { label: "Clay", value: "#a5714e" },
      ],
    },
  },
};

// Local templates, newest first — prepended to the feed's "All" list.
export const LOCAL_TEMPLATES: PostTemplate[] = [
  DUEL_THIS_OR_THAT,
  SUNDAY_SLICED_POSTER,
  SOULKIN_SPLIT_PIN,
  TRAVEL_INSPIRATION_PIN,
];

const LOCAL_TEMPLATES_BY_ID = new Map(LOCAL_TEMPLATES.map((template) => [template.id, template]));

export function getLocalTemplate(id: string): PostTemplate | null {
  return LOCAL_TEMPLATES_BY_ID.get(id) ?? null;
}

// The local templates that match a plain-text search (title / description /
// tags). Empty query returns all of them; a board filter returns none (local
// templates aren't in any board).
export function localTemplatesForFeed(params: { search?: string; board?: string }): PostTemplate[] {
  if (params.board) return [];
  const query = params.search?.trim().toLowerCase();
  if (!query) return LOCAL_TEMPLATES;
  return LOCAL_TEMPLATES.filter((template) => {
    const haystack = [template.title, template.description ?? "", ...template.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

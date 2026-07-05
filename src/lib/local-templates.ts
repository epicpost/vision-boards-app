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

// City Text Mask — the SAN FRANCISCO poster. Preview art lives at
// public/templates/shared/f2cb6d0c961e8d61a6940e642fc153ea.jpg (736 x 1308).
const CITYMASK_SAN_FRANCISCO: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000037",
  title: "City Text Mask",
  preview: "/templates/shared/f2cb6d0c961e8d61a6940e642fc153ea.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 1308,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "citymask-cover",
      url: "/templates/shared/f2cb6d0c961e8d61a6940e642fc153ea.jpg",
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
    "A city text-mask poster: your photo revealed only through a giant city name that auto-fits and wraps to fill the frame (everything else black), with an optional country label and flag. Bring your own photo, city caption and font.",
  tags: ["typography", "poster", "text mask", "travel", "city"],
  comments: [],
  created_at: "2026-07-03T00:00:00.000Z",
  updated_at: "2026-07-03T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 1308",
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
  // A required city caption drives the composer's Fonts/Colors cards (optional
  // font family); one required photo shows through the letters. The optional
  // country label + flag are edited in the editor, not the composer.
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
        description: "The photo revealed through the city name's letters.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "City",
        required: true,
        max_chars: 20,
        recommended_chars: 12,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The city name set in giant masked letters (uppercased).",
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#ffffff",
      caption_color_options: [
        { label: "White", value: "#ffffff" },
        { label: "Black", value: "#000000" },
        { label: "Ink", value: "#14161a" },
        { label: "Slate", value: "#3a3f45" },
        { label: "Stone", value: "#8a8577" },
      ],
    },
  },
};

// Self Portrait — the SELF split-portrait poster. Preview art lives at
// public/templates/shared/6be50eaad3f63ade68ede1c1bb8a2781.jpg (736 x 1062).
const SELF_PORTRAIT: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000038",
  title: "Self Portrait",
  preview: "/templates/shared/6be50eaad3f63ade68ede1c1bb8a2781.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 1062,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "self-cover",
      url: "/templates/shared/6be50eaad3f63ade68ede1c1bb8a2781.jpg",
      type: "image",
      order: 0,
      width: 736,
      height: 1062,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "A split-portrait poster: your photo fills the left half, and your caption is set as one giant letter per row on the right — each letter a window revealing the same photo. Bring your own photo, caption and font.",
  tags: ["typography", "editorial", "poster", "portrait", "minimal"],
  comments: [],
  created_at: "2026-07-04T00:00:00.000Z",
  updated_at: "2026-07-04T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 1062",
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
  // A required caption drives the composer's Fonts card (optional brand font
  // family); one required photo shows through the left panel and the letters.
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
        description: "The photo revealed through the left panel and the caption's letters.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Caption",
        required: true,
        max_chars: 10,
        recommended_chars: 4,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The word set as giant stacked letters, one per row (uppercased).",
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#000000",
      caption_color_options: [
        { label: "Black", value: "#000000" },
        { label: "White", value: "#ffffff" },
        { label: "Ink", value: "#14161a" },
        { label: "Slate", value: "#3a3f45" },
        { label: "Stone", value: "#8a8577" },
      ],
    },
  },
};

// Statement Portrait — the "BE AWESOME BE COOL" split poster. Preview art
// lives at public/templates/shared/e1715f36feb27ef64348c7d8534f1693.jpg
// (548 x 761).
const STATEMENT_PORTRAIT: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000044",
  title: "Statement Portrait",
  preview: "/templates/shared/e1715f36feb27ef64348c7d8534f1693.jpg",
  preview_type: "image",
  preview_width: 548,
  preview_height: 761,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "statement-cover",
      url: "/templates/shared/e1715f36feb27ef64348c7d8534f1693.jpg",
      type: "image",
      order: 0,
      width: 548,
      height: 761,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "A split-portrait statement poster: your photo fills the left half, and a bold word-wrapped caption on the right reveals the same photo through its letters, with an optional small tagline + underline. Bring your own photo, caption and font.",
  tags: ["typography", "editorial", "poster", "portrait", "fashion", "women's style"],
  comments: [],
  created_at: "2026-07-04T00:00:00.000Z",
  updated_at: "2026-07-04T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "548 / 761",
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
  // A required caption drives the composer's Fonts/Colors cards (optional
  // brand font family); one required photo shows through the left panel and
  // the wrapped caption. The optional tagline + underline are edited in the
  // editor, not the composer.
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
        description: "The photo revealed through the left panel and the caption's letters.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Caption",
        required: true,
        max_chars: 40,
        recommended_chars: 18,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description:
          'The bold statement, word-wrapped across the letters (uppercased), e.g. "Be awesome be cool".',
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#000000",
      caption_color_options: [
        { label: "Black", value: "#000000" },
        { label: "White", value: "#ffffff" },
        { label: "Ink", value: "#14161a" },
        { label: "Slate", value: "#3a3f45" },
        { label: "Stone", value: "#8a8577" },
      ],
    },
  },
};

// Mono Grid series — three 3×3 grid collage templates sharing the "grid"
// layout, with different cell assignments per variant (see GRID_VARIANTS in
// remix-editor.ts). Preview art lives at public/templates/shared/*.jpg
// (1200 × 1500 each).
function gridPostTemplate(options: {
  id: string;
  title: string;
  preview: string;
  coverId: string;
  description: string;
  maxPhotos: number;
}): PostTemplate {
  return {
    id: options.id,
    title: options.title,
    preview: options.preview,
    preview_type: "image",
    preview_width: 1200,
    preview_height: 1500,
    likes_count: 0,
    is_saved: false,
    is_liked: false,
    is_remixed: false,
    assets: [
      {
        id: options.coverId,
        url: options.preview,
        type: "image",
        order: 0,
        width: 1200,
        height: 1500,
      },
    ],
    board_id: null,
    board_name: null,
    remix_id: null,
    description: options.description,
    tags: ["grid", "collage", "moodboard", "monochrome", "fashion", "editorial"],
    comments: [],
    created_at: "2026-07-04T00:00:00.000Z",
    updated_at: "2026-07-04T00:00:00.000Z",
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
    // A required background photo plus optional cell photos (mapped to image
    // layers in order); the optional caption drives the composer's
    // Fonts/Colors cards for brand font + colour.
    input_requirements: {
      assets: [
        {
          key: "photos",
          type: "image",
          required: true,
          min_count: 1,
          max_count: options.maxPhotos,
          accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
          preferred_aspect_ratios: [],
          min_width: null,
          min_height: null,
          allow_crop: true,
          allow_background_extend: false,
          allow_background_removal: false,
          transparent_preferred: false,
          description:
            "The first photo fills the whole background; up to 3 more fill small grid cells.",
        },
      ],
      text_requirements: [
        {
          key: "caption",
          label: "Caption",
          required: false,
          max_chars: 60,
          recommended_chars: 30,
          visible_on_asset: true,
          ai_can_generate: false,
          ai_can_rewrite: true,
          allowed_values: [],
          description: "The caption block over the grid (line breaks kept).",
        },
      ],
      text_density: "low",
      text_overflow_strategy: "shrink",
    },
    agent_hints: {
      render_defaults: {
        caption_color: "#ffffff",
        caption_color_options: [
          { label: "White", value: "#ffffff" },
          { label: "Black", value: "#000000" },
          { label: "Ink", value: "#1c1a17" },
          { label: "Stone", value: "#8a8577" },
          { label: "Sand", value: "#e7ddd0" },
        ],
      },
    },
  };
}

const GRID_MONO = gridPostTemplate({
  id: "11000000-0000-0000-0000-000000000039",
  title: "Mono Grid",
  preview: "/templates/shared/bcf6e7a2c8a44fa240cf74c7e7b67c1b.jpg",
  coverId: "grid-mono-cover",
  description:
    "A 3×3 grid collage: one background photo split by thin grid lines, two small photos down the right column, a caption dead centre and a rotated side title top-left. Photos, texts, brand font, colours and logo are all swappable.",
  maxPhotos: 3,
});

const GRID_STATEMENT = gridPostTemplate({
  id: "11000000-0000-0000-0000-000000000040",
  title: "Statement Grid",
  preview: "/templates/shared/04fb829beb067b56fa590f0e7f181405.jpg",
  coverId: "grid-statement-cover",
  description:
    "A 3×3 grid collage: one background photo split by thin grid lines, three corner photos, a caption bottom-right and a rotated side title mid-left. Photos, texts, brand font, colours and logo are all swappable.",
  maxPhotos: 4,
});

const GRID_CONTRAST = gridPostTemplate({
  id: "11000000-0000-0000-0000-000000000041",
  title: "Contrast Grid",
  preview: "/templates/shared/9f37f293fe1570b4525396063be0a34e.jpg",
  coverId: "grid-contrast-cover",
  description:
    "A 3×3 grid collage: one background photo split by thin grid lines, three staggered cell photos and a rotated side title bottom-left (plus an optional centre caption). Photos, texts, brand font, colours and logo are all swappable.",
  maxPhotos: 4,
});

// New Drop — the tilted Polaroid-card "product drop" poster. Preview art lives
// at public/templates/shared/b89ab8d1b7f6cdbdfac67e1b84549e7d.jpg (736 × 1308).
const DROP_NEW_DROP: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000042",
  title: "New Drop",
  preview: "/templates/shared/b89ab8d1b7f6cdbdfac67e1b84549e7d.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 1308,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "drop-cover",
      url: "/templates/shared/b89ab8d1b7f6cdbdfac67e1b84549e7d.jpg",
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
    'A product-drop poster: your photo pinned in a tilted Polaroid-style card between two giant headline words, with a hand-written caption underneath. Bring your own photo, caption and font; optional brand/category corner labels and a "discover more" pill footer.',
  tags: ["fashion", "product drop", "poster", "polaroid", "announcement"],
  comments: [],
  created_at: "2026-07-04T00:00:00.000Z",
  updated_at: "2026-07-04T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 1308",
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
  // A required caption drives the composer's Fonts/Colors cards (optional
  // brand font family); one required photo fills the Polaroid card. The
  // optional corner labels and pill handle are edited in the editor, not
  // the composer.
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
        description: "The photo pinned in the tilted Polaroid-style card.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Caption",
        required: true,
        max_chars: 24,
        recommended_chars: 14,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The hand-written caption set in the card's caption strip.",
      },
    ],
    text_density: "low",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#5a0f14",
      caption_color_options: [
        { label: "Maroon", value: "#5a0f14" },
        { label: "Black", value: "#000000" },
        { label: "White", value: "#ffffff" },
        { label: "Ink", value: "#14161a" },
        { label: "Red", value: "#c92222" },
      ],
    },
  },
};

// Woven Calm — the textile-brand editorial poster. Preview art lives at
// public/templates/shared/b60f85f998182a3089460acd4f8af839.jpg (736 x 920).
const WOVEN_CALM: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000043",
  title: "Woven Calm",
  preview: "/templates/shared/b60f85f998182a3089460acd4f8af839.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 920,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "woven-cover",
      url: "/templates/shared/b60f85f998182a3089460acd4f8af839.jpg",
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
    "A calm textile-brand editorial poster: a tall photo panel on the left, with a large serif title and a small grey body paragraph stacked on the right over a warm stone background. Bring your own photo and copy; optional brand font for the title and an optional brand background colour.",
  tags: ["editorial", "minimal", "textile", "poster", "brand"],
  comments: [],
  created_at: "2026-07-04T00:00:00.000Z",
  updated_at: "2026-07-04T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 920",
  input_image_count: 1,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: true,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // A required caption (the serif title) drives the composer's Fonts card
  // (optional brand font family); an optional body paragraph carries the
  // supporting copy. One required photo fills the left panel. The stone
  // background is optional and honours a brand colour when one is supplied.
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
        description: "The photo shown in the tall left panel.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Title",
        required: true,
        max_chars: 24,
        recommended_chars: 10,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The large serif headline (word-wrapped over two lines).",
      },
      {
        key: "body",
        label: "Body",
        required: false,
        max_chars: 220,
        recommended_chars: 160,
        visible_on_asset: true,
        ai_can_generate: true,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The small supporting paragraph beneath the title.",
      },
    ],
    text_density: "medium",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#5b5954",
      caption_color_options: [
        { label: "Taupe", value: "#5b5954" },
        { label: "Ink", value: "#14161a" },
        { label: "Stone", value: "#8a8577" },
        { label: "Black", value: "#000000" },
        { label: "White", value: "#ffffff" },
      ],
      background_color: "#e8e3dd",
      background_color_options: [
        { label: "Stone", value: "#e8e3dd" },
        { label: "Sand", value: "#e3dccf" },
        { label: "Mist", value: "#e2e4e1" },
        { label: "Ivory", value: "#f4f1ea" },
        { label: "Clay", value: "#d8cabb" },
      ],
    },
  },
};

// Studio Brief — the "Residential" agency-brief poster. Preview art lives at
// public/templates/shared/835ae6f846127c33b5e08dc12611e29f.jpg (1080 x 1350).
const STUDIO_BRIEF: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000045",
  title: "Studio Brief",
  preview: "/templates/shared/835ae6f846127c33b5e08dc12611e29f.jpg",
  preview_type: "image",
  preview_width: 1080,
  preview_height: 1350,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "brief-cover",
      url: "/templates/shared/835ae6f846127c33b5e08dc12611e29f.jpg",
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
    "An agency-brief poster: a white paper panel with a bullet-and-rule marker, a bold serif category caption and a short mission paragraph, beside a full-bleed photo. Bring your own photo, category and mission copy; optional brand font for the caption and an optional brand background colour.",
  tags: ["editorial", "brief", "minimal", "poster", "brand"],
  comments: [],
  created_at: "2026-07-04T00:00:00.000Z",
  updated_at: "2026-07-04T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "1080 / 1350",
  input_image_count: 1,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: true,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // A required caption (the serif category label) drives the composer's Fonts
  // card (optional brand font family); an optional mission paragraph carries
  // the supporting copy. One required photo fills the right panel. The paper
  // background is optional and honours a brand colour when one is supplied.
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
        description: "The photo shown in the full-bleed right panel.",
      },
    ],
    text_requirements: [
      {
        key: "caption",
        label: "Category",
        required: true,
        max_chars: 20,
        recommended_chars: 11,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: 'The bold serif category caption (e.g. "Residential").',
      },
      {
        key: "body",
        label: "Mission",
        required: false,
        max_chars: 220,
        recommended_chars: 150,
        visible_on_asset: true,
        ai_can_generate: true,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "The short mission paragraph beneath the category caption.",
      },
    ],
    text_density: "medium",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#000000",
      caption_color_options: [
        { label: "Black", value: "#000000" },
        { label: "Ink", value: "#14161a" },
        { label: "Slate", value: "#3a3f45" },
        { label: "Stone", value: "#8a8577" },
        { label: "White", value: "#ffffff" },
      ],
      background_color: "#ffffff",
      background_color_options: [
        { label: "White", value: "#ffffff" },
        { label: "Ivory", value: "#f4f1ea" },
        { label: "Sand", value: "#e3dccf" },
        { label: "Mist", value: "#e2e4e1" },
        { label: "Stone", value: "#e8e3dd" },
      ],
    },
  },
};

// Residence Mosaic — an 11-photo masonry interior-design moodboard. Preview
// art lives at public/templates/shared/1d9692aee1d1536bad55a52a4003aaac.jpg
// (736 x 1313): 3 uneven columns (narrow / wide / narrow) split by a hairline
// gutter, the wide centre column stacking 3 taller photos against 4 shorter
// ones down each side. No text at all — every cell is a required,
// independently replaceable photo.
const RESIDENCE_MOSAIC: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000046",
  title: "Residence Mosaic",
  preview: "/templates/shared/1d9692aee1d1536bad55a52a4003aaac.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 1313,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "mosaic-cover",
      url: "/templates/shared/1d9692aee1d1536bad55a52a4003aaac.jpg",
      type: "image",
      order: 0,
      width: 736,
      height: 1313,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "An 11-photo masonry moodboard: 3 uneven columns (narrow / wide / narrow) split by a hairline gutter, the wide centre column stacking 3 taller photos against 4 shorter ones down each side. No text — every photo is required and independently replaceable. Perfect for interior-design, real-estate or lifestyle galleries.",
  tags: ["moodboard", "mosaic", "grid", "collage", "interior", "minimal", "gallery"],
  comments: [],
  created_at: "2026-07-04T00:00:00.000Z",
  updated_at: "2026-07-04T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 1313",
  input_image_count: 11,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: false,
    supports_brand_adaptation: false,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // 11 required photos, one per mosaic cell, in reading order (each row
  // left-to-right, top-to-bottom): the top row, then the upper-middle row,
  // then the lower-middle row (side columns only — the centre column's
  // middle photo is taller and spans that gap), then the bottom row. No
  // text requirements — this template has no caption at all.
  input_requirements: {
    assets: [
      {
        key: "photos",
        type: "image",
        required: true,
        min_count: 11,
        max_count: 11,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: [],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description:
          "Eleven photos, one per mosaic cell, in reading order (each row left-to-right, top-to-bottom); the centre column's 3 photos are taller than the side columns' 4.",
      },
    ],
    text_requirements: [],
    text_density: "none",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      background_color: "#ffffff",
      background_color_options: [
        { label: "White", value: "#ffffff" },
        { label: "Ink", value: "#1c1a17" },
        { label: "Stone", value: "#8a8577" },
        { label: "Sand", value: "#e7ddd0" },
        { label: "Black", value: "#000000" },
      ],
    },
  },
};

// Coastal Mosaic — a 13-photo masonry Mediterranean-home moodboard. Preview
// art lives at public/templates/shared/078de9478ab62f259139da7a07aa7f60.jpg
// (736 x 1313): 3 uneven columns split by a thin white gutter, each column
// breaking into a different number of cells (4 / 4 / 5) below the two shared
// top rows. No text at all — every cell is a required, independently
// replaceable photo.
const COASTAL_MOSAIC: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000047",
  title: "Coastal Mosaic",
  preview: "/templates/shared/078de9478ab62f259139da7a07aa7f60.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 1313,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "coastal-mosaic-cover",
      url: "/templates/shared/078de9478ab62f259139da7a07aa7f60.jpg",
      type: "image",
      order: 0,
      width: 736,
      height: 1313,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "A 13-photo masonry moodboard: 3 uneven columns split by a thin white gutter, each column breaking into a different number of cells (4 / 4 / 5). No text — every photo is required and independently replaceable. Perfect for coastal, travel or interior-design galleries.",
  tags: ["moodboard", "mosaic", "grid", "collage", "coastal", "travel", "minimal", "gallery"],
  comments: [],
  created_at: "2026-07-05T00:00:00.000Z",
  updated_at: "2026-07-05T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 1313",
  input_image_count: 13,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: false,
    supports_brand_adaptation: false,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // 13 required photos, one per mosaic cell, in reading order: the two shared
  // top rows across all three columns, then each column's remaining cells
  // (the centre and right columns run taller/deeper than the left). No text
  // requirements — this template has no caption at all.
  input_requirements: {
    assets: [
      {
        key: "photos",
        type: "image",
        required: true,
        min_count: 13,
        max_count: 13,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: [],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description:
          "Thirteen photos, one per mosaic cell, in reading order; the columns break into 4 / 4 / 5 cells so the tall photos land in the centre and right columns.",
      },
    ],
    text_requirements: [],
    text_density: "none",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      background_color: "#ffffff",
      background_color_options: [
        { label: "White", value: "#ffffff" },
        { label: "Ink", value: "#1c1a17" },
        { label: "Stone", value: "#8a8577" },
        { label: "Sand", value: "#e7ddd0" },
        { label: "Black", value: "#000000" },
      ],
    },
  },
};

// Stone Villa Mosaic — an 11-photo masonry Mediterranean-villa moodboard.
// Preview art lives at public/templates/shared/12b150466df1b894b3016580977e5ed4.jpg
// (736 x 1313): 3 uneven columns, full-bleed to the canvas edges, split by a
// hairline gutter; the wide centre column's middle photo spans two row
// heights. No text at all — every cell is a required, independently
// replaceable photo.
const STONE_VILLA_MOSAIC: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000048",
  title: "Stone Villa Mosaic",
  preview: "/templates/shared/12b150466df1b894b3016580977e5ed4.jpg",
  preview_type: "image",
  preview_width: 736,
  preview_height: 1313,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "stone-villa-mosaic-cover",
      url: "/templates/shared/12b150466df1b894b3016580977e5ed4.jpg",
      type: "image",
      order: 0,
      width: 736,
      height: 1313,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    "An 11-photo masonry moodboard: 3 uneven columns, full-bleed to the edges, split by a hairline gutter, with the wide centre column's middle photo spanning two row heights. No text — every photo is required and independently replaceable. Perfect for interior-design, real-estate or travel galleries.",
  tags: ["moodboard", "mosaic", "grid", "collage", "interior", "villa", "minimal", "gallery"],
  comments: [],
  created_at: "2026-07-05T00:00:00.000Z",
  updated_at: "2026-07-05T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "736 / 1313",
  input_image_count: 11,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: false,
    supports_brand_adaptation: false,
    supports_aspect_ratio_conversion: false,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  // 11 required photos, one per mosaic cell, in reading order (each row
  // left-to-right, top-to-bottom); the 5th photo is the tall centre cell
  // spanning two row heights. No text requirements — this template has no
  // caption at all.
  input_requirements: {
    assets: [
      {
        key: "photos",
        type: "image",
        required: true,
        min_count: 11,
        max_count: 11,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: [],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description:
          "Eleven photos, one per mosaic cell, in reading order (left-to-right, top-to-bottom); the 5th photo is the tall centre cell spanning two row heights.",
      },
    ],
    text_requirements: [],
    text_density: "none",
    text_overflow_strategy: "shrink",
  },
  agent_hints: {
    render_defaults: {
      background_color: "#ffffff",
      background_color_options: [
        { label: "White", value: "#ffffff" },
        { label: "Ink", value: "#1c1a17" },
        { label: "Stone", value: "#8a8577" },
        { label: "Sand", value: "#e7ddd0" },
        { label: "Black", value: "#000000" },
      ],
    },
  },
};

// Business Edition — the Pinterest-style "This or that?" comparison pin.
// Preview art lives at
// public/templates/shared/71244d4475e68bda4dc6ebed33162ec7.jpg (1200 x 1500).
const BUSINESS_EDITION_THIS_OR_THAT: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000049",
  title: "Business Edition",
  preview: "/templates/shared/71244d4475e68bda4dc6ebed33162ec7.jpg",
  preview_type: "image",
  preview_width: 1200,
  preview_height: 1500,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "business-edition-cover",
      url: "/templates/shared/71244d4475e68bda4dc6ebed33162ec7.jpg",
      type: "image",
      order: 0,
      width: 1200,
      height: 1500,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    'A "This or that?" comparison pin with two overlapping rounded photos, optional BUSINESS / EDITION labels, optional handle and optional bottom caption. Supports 4:5, 1:1 and Instagram Stories exports; brand colors can tint the background, labels and copy.',
  tags: ["this or that", "comparison", "business", "ceo", "pinterest", "collage"],
  comments: [],
  created_at: "2026-07-05T00:00:00.000Z",
  updated_at: "2026-07-05T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "4 / 5",
  input_image_count: 2,
  capabilities: {
    supports_ai_generation: false,
    supports_remix: true,
    supports_asset_replacement: true,
    supports_text_rewrite: true,
    supports_brand_adaptation: true,
    supports_aspect_ratio_conversion: true,
    supports_language_adaptation: false,
    supports_batch_generation: false,
    supports_variants: true,
  },
  input_requirements: {
    assets: [
      {
        key: "photos",
        type: "image",
        required: true,
        min_count: 2,
        max_count: 2,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: ["4:5", "1:1", "9:16"],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description:
          "Two photos: the first fills the left image, the second fills the right image.",
      },
    ],
    text_requirements: [
      {
        key: "business_label",
        label: "Business",
        required: false,
        max_chars: 18,
        recommended_chars: 8,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: 'Optional top label, e.g. "BUSINESS".',
      },
      {
        key: "edition_label",
        label: "Edition",
        required: false,
        max_chars: 18,
        recommended_chars: 7,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: 'Optional lower label, e.g. "EDITION".',
      },
      {
        key: "city_overview",
        label: "Bottom caption",
        required: false,
        max_chars: 70,
        recommended_chars: 38,
        visible_on_asset: true,
        ai_can_generate: true,
        ai_can_rewrite: true,
        allowed_values: [],
        description: 'Optional bottom caption, e.g. "Because every CEO has their own vibe."',
      },
      {
        key: "handle",
        label: "Handle",
        required: false,
        max_chars: 30,
        recommended_chars: 14,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: false,
        allowed_values: [],
        description: 'Optional handle, e.g. "@ITSKIARAWEBB".',
      },
    ],
    text_density: "medium",
    text_overflow_strategy: "shrink",
  },
  output_spec: {
    supported_aspect_ratios: ["4:5", "1:1", "9:16"],
    default_aspect_ratio: "4:5",
    supported_formats: ["png", "jpeg", "webp"],
    default_format: "png",
    resolution_presets: [
      { aspect_ratio: "4:5", width: 1080, height: 1350 },
      { aspect_ratio: "1:1", width: 1080, height: 1080 },
      { aspect_ratio: "9:16", width: 1080, height: 1920 },
    ],
    has_safe_area: false,
    has_transparent_background: false,
    contains_text_overlay: true,
    contains_branding_slot: true,
  },
  agent_hints: {
    render_defaults: {
      caption_color_options: [
        { label: "Ink", value: "#444444" },
        { label: "Charcoal", value: "#2f2f2f" },
        { label: "Black", value: "#141414" },
        { label: "Olive", value: "#5c5a3a" },
        { label: "Clay", value: "#a5714e" },
      ],
    },
  },
};

// Olivia Testimonial — a square testimonial card with a circular avatar.
// Preview art lives at
// public/templates/shared/e79728152d6c58ad0ef70e013df666ac.jpg (1200 x 1200).
const OLIVIA_TESTIMONIAL: PostTemplate = {
  id: "11000000-0000-0000-0000-000000000050",
  title: "Olivia Testimonial",
  preview: "/templates/shared/e79728152d6c58ad0ef70e013df666ac.jpg",
  preview_type: "image",
  preview_width: 1200,
  preview_height: 1200,
  likes_count: 0,
  is_saved: false,
  is_liked: false,
  is_remixed: false,
  assets: [
    {
      id: "olivia-testimonial-cover",
      url: "/templates/shared/e79728152d6c58ad0ef70e013df666ac.jpg",
      type: "image",
      order: 0,
      width: 1200,
      height: 1200,
    },
  ],
  board_id: null,
  board_name: null,
  remix_id: null,
  description:
    'A square testimonial card with one circular avatar, five stars, an optional review paragraph, a required author line and the required line "Because every CEO has their own vibe." Brand font and colour selections apply to the text.',
  tags: ["testimonial", "review", "avatar", "restaurant", "social proof", "square"],
  comments: [],
  created_at: "2026-07-05T00:00:00.000Z",
  updated_at: "2026-07-05T00:00:00.000Z",
  template_type: "image",
  aspect_ratio: "1 / 1",
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
  input_requirements: {
    assets: [
      {
        key: "avatar",
        type: "image",
        required: true,
        min_count: 1,
        max_count: 1,
        accepted_mime_types: ["image/png", "image/jpeg", "image/webp"],
        preferred_aspect_ratios: ["1:1"],
        min_width: null,
        min_height: null,
        allow_crop: true,
        allow_background_extend: false,
        allow_background_removal: false,
        transparent_preferred: false,
        description: "One avatar photo for the circular portrait and blurred background.",
      },
    ],
    text_requirements: [
      {
        key: "headline",
        label: "CEO line",
        required: true,
        max_chars: 80,
        recommended_chars: 38,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: true,
        allowed_values: [],
        description: "Because every CEO has their own vibe.",
      },
      {
        key: "city_overview",
        label: "Testimonial",
        required: false,
        max_chars: 220,
        recommended_chars: 160,
        visible_on_asset: true,
        ai_can_generate: true,
        ai_can_rewrite: true,
        allowed_values: [],
        description:
          "Everything was very good and tasty! The food is interesting and non-standard, so you want to try everything! Cozy place, good service, good wine list and very tasty! Thank you!",
      },
      {
        key: "author",
        label: "Author",
        required: true,
        max_chars: 30,
        recommended_chars: 9,
        visible_on_asset: true,
        ai_can_generate: false,
        ai_can_rewrite: false,
        allowed_values: [],
        description: "Olivia W.",
      },
    ],
    text_density: "medium",
    text_overflow_strategy: "shrink",
  },
  output_spec: {
    supported_aspect_ratios: ["4:5", "1:1", "9:16"],
    default_aspect_ratio: "1:1",
    supported_formats: ["png", "jpeg", "webp"],
    default_format: "png",
    resolution_presets: [
      { aspect_ratio: "4:5", width: 1080, height: 1350 },
      { aspect_ratio: "1:1", width: 1200, height: 1200 },
      { aspect_ratio: "9:16", width: 1080, height: 1920 },
    ],
    has_safe_area: false,
    has_transparent_background: false,
    contains_text_overlay: true,
    contains_branding_slot: false,
  },
  agent_hints: {
    render_defaults: {
      caption_color: "#665748",
      caption_color_options: [
        { label: "Coffee", value: "#665748" },
        { label: "Taupe", value: "#b08b68" },
        { label: "Mocha", value: "#4f4439" },
        { label: "Cream", value: "#fffdf8" },
        { label: "Ink", value: "#1c1a17" },
      ],
    },
  },
};

// Local templates, newest first — prepended to the feed's "All" list.
export const LOCAL_TEMPLATES: PostTemplate[] = [
  OLIVIA_TESTIMONIAL,
  BUSINESS_EDITION_THIS_OR_THAT,
  STONE_VILLA_MOSAIC,
  COASTAL_MOSAIC,
  RESIDENCE_MOSAIC,
  STUDIO_BRIEF,
  WOVEN_CALM,
  DROP_NEW_DROP,
  GRID_MONO,
  GRID_STATEMENT,
  GRID_CONTRAST,
  STATEMENT_PORTRAIT,
  SELF_PORTRAIT,
  CITYMASK_SAN_FRANCISCO,
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

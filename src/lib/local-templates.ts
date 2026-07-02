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
  input_image_count: 5,
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

// Local templates, newest first — prepended to the feed's "All" list.
export const LOCAL_TEMPLATES: PostTemplate[] = [TRAVEL_INSPIRATION_PIN];

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

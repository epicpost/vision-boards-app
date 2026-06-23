// Remix / template editor — MVP static config.
//
// After a successful remix, a user can open this template's *layered* creative
// in the editor (`/editor/$templateId`) and tweak the header, colours, fonts,
// product image, CTA and logo — mirroring Google Pomelli's "Edit creative"
// panel. There is no editor API yet, so the editable layers for each supported
// template are described by the static map below, keyed by template id.
//
// Only the two ids wired up for the MVP have config; everything else falls back
// to an "editor not available" state on the page.

export type LayerKind = "image" | "header" | "description" | "cta" | "logo";

export interface EditorFont {
  id: string;
  label: string;
  // CSS font-family stack (the primary family is a Google font we lazy-load).
  family: string;
  weight: number;
}

export interface EditorColor {
  label: string;
  value: string;
}

interface BaseLayer {
  id: LayerKind;
  label: string;
  visible: boolean;
  // Whether the section can be toggled off the creative (the eye toggle).
  hideable: boolean;
}

export interface ImageLayer extends BaseLayer {
  id: "image";
  src: string;
}

export interface TextLayer extends BaseLayer {
  id: "header" | "description" | "cta";
  text: string;
  // For header/description this is the text colour; for the CTA it's the
  // button's background colour (label colour is derived for contrast).
  color: string;
  fontId: string;
  uppercase: boolean;
  // Quick AI-style rewrite options cycled by the sparkle button.
  suggestions: string[];
}

export interface LogoLayer extends BaseLayer {
  id: "logo";
  src: string;
}

export type EditorLayer = ImageLayer | TextLayer | LogoLayer;

export interface RemixEditorTemplate {
  id: string;
  title: string;
  // CSS aspect-ratio string, e.g. "4 / 5".
  aspectRatio: string;
  // Canvas background fill (solid colour for the MVP).
  background: string;
  palette: EditorColor[];
  // Layers in the order the edit panel lists them.
  layers: EditorLayer[];
}

// One shared typeface catalog backs every template's font picker. Each family
// is a Google font we load on demand via `editorFontsHref()`.
export const EDITOR_FONTS: EditorFont[] = [
  { id: "anton", label: "Anton", family: "'Anton', sans-serif", weight: 400 },
  { id: "archivo", label: "Archivo", family: "'Archivo Black', sans-serif", weight: 400 },
  { id: "bebas", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", weight: 600 },
  { id: "poppins", label: "Poppins", family: "'Poppins', sans-serif", weight: 600 },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", weight: 700 },
  { id: "playfair", label: "Playfair Display", family: "'Playfair Display', serif", weight: 700 },
];

export function fontById(id: string): EditorFont {
  return EDITOR_FONTS.find((font) => font.id === id) ?? EDITOR_FONTS[0];
}

// The <link> href that loads every catalog family (display swap) so previews and
// the picker render in the real typeface.
export function editorFontsHref(): string {
  const families = [
    "Anton",
    "Archivo Black",
    "Bebas Neue",
    "Oswald:wght@400;600",
    "Poppins:wght@400;600;700",
    "Montserrat:wght@400;600;700",
    "Playfair Display:wght@400;600;700",
  ]
    .map((family) => `family=${family.trim().replace(/\s+/g, "+")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// Pick black or white text for contrast against a solid background colour.
export function readableTextColor(hex: string): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  if (full.length !== 6) return "#ffffff";
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Relative luminance (sRGB) — bright backgrounds get dark text.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#141414" : "#ffffff";
}

const TEMPLATE_28: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000028",
  title: "Upgrade to Chickpea",
  aspectRatio: "4 / 5",
  background: "#1f7a5e",
  palette: [
    { label: "Coral", value: "#e8542a" },
    { label: "Teal", value: "#1f7a5e" },
    { label: "Mist", value: "#c9c9c9" },
    { label: "Ink", value: "#141414" },
    { label: "Paper", value: "#ffffff" },
  ],
  layers: [
    {
      id: "image",
      label: "Image",
      visible: true,
      hideable: true,
      src: "/templates/shared/Supermercado.jpg",
    },
    {
      id: "header",
      label: "Header",
      visible: true,
      hideable: true,
      text: "Upgrade to chickpea",
      color: "#ffffff",
      fontId: "anton",
      uppercase: true,
      suggestions: [
        "Upgrade to chickpea",
        "Pasta, but better",
        "More protein, same comfort",
        "Real food, real fuel",
      ],
    },
    {
      id: "description",
      label: "Description",
      visible: true,
      hideable: true,
      text: "20g protein · 13g fiber · made from chickpeas",
      color: "#eafff6",
      fontId: "poppins",
      uppercase: false,
      suggestions: [
        "20g protein · 13g fiber · made from chickpeas",
        "Half the carbs of regular pasta",
        "Plant-based goodness in every bite",
      ],
    },
    {
      id: "cta",
      label: "Call to action",
      visible: true,
      hideable: true,
      text: "Learn more",
      color: "#e8542a",
      fontId: "poppins",
      uppercase: false,
      suggestions: ["Learn more", "Shop now", "Try the swap", "Find in store"],
    },
    {
      id: "logo",
      label: "Logo",
      visible: false,
      hideable: true,
      src: "/transparent-logo.png",
    },
  ],
};

const TEMPLATE_205: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000205",
  title: "Explore the Wild",
  aspectRatio: "4 / 5",
  background: "#13303a",
  palette: [
    { label: "Amber", value: "#f2a93b" },
    { label: "Coral", value: "#ef5d4c" },
    { label: "Cream", value: "#f5ecd9" },
    { label: "Deep", value: "#13303a" },
    { label: "Paper", value: "#ffffff" },
  ],
  layers: [
    {
      id: "image",
      label: "Image",
      visible: true,
      hideable: true,
      src: "/templates/shared/Bali photo.jpg",
    },
    {
      id: "header",
      label: "Header",
      visible: true,
      hideable: true,
      text: "Explore the wild",
      color: "#f5ecd9",
      fontId: "playfair",
      uppercase: false,
      suggestions: [
        "Explore the wild",
        "Find your next escape",
        "Adventure is calling",
        "Go where the map ends",
      ],
    },
    {
      id: "description",
      label: "Description",
      visible: true,
      hideable: true,
      text: "Hand-picked escapes for the curious traveller.",
      color: "#f5ecd9",
      fontId: "montserrat",
      uppercase: false,
      suggestions: [
        "Hand-picked escapes for the curious traveller.",
        "Small groups. Big horizons.",
        "Trips designed to be remembered.",
      ],
    },
    {
      id: "cta",
      label: "Call to action",
      visible: true,
      hideable: true,
      text: "Book now",
      color: "#f2a93b",
      fontId: "montserrat",
      uppercase: false,
      suggestions: ["Book now", "Plan your trip", "See dates", "Reserve a spot"],
    },
    {
      id: "logo",
      label: "Logo",
      visible: false,
      hideable: true,
      src: "/transparent-logo.png",
    },
  ],
};

const REMIX_EDITOR_TEMPLATES: Record<string, RemixEditorTemplate> = {
  [TEMPLATE_28.id]: TEMPLATE_28,
  [TEMPLATE_205.id]: TEMPLATE_205,
};

export function getRemixEditorTemplate(id: string): RemixEditorTemplate | null {
  return REMIX_EDITOR_TEMPLATES[id] ?? null;
}

export function hasRemixEditorTemplate(id: string): boolean {
  return id in REMIX_EDITOR_TEMPLATES;
}

// Deep clone so editor state never mutates the shared static config.
export function cloneLayers(template: RemixEditorTemplate): EditorLayer[] {
  return template.layers.map((layer) => ({ ...layer }));
}

// ── Shared canvas geometry ───────────────────────────────────────────────────
// Layout is expressed as fractions of the canvas (0–1) so the live DOM preview
// and the PNG export position every layer identically.

export const LAYOUT = {
  padX: 0.08,
  logo: { x: 0.08, y: 0.06, w: 0.22, h: 0.09 },
  header: { top: 0.12, size: 0.092, lineHeight: 1.06, weight: 800 },
  description: { top: 0.34, size: 0.033, lineHeight: 1.3, weight: 500 },
  cta: { top: 0.43, height: 0.07, size: 0.032, padX: 0.05, weight: 600 },
  image: { top: 0.53, bottom: 0.95 },
} as const;

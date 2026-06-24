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
  // Unique within a template. For single-slot poster templates this equals the
  // layer's `kind`; moodboard templates have several "image" layers, so they use
  // distinct ids (photo-1, photo-2, …) while sharing the "image" kind.
  id: string;
  // What the layer is — drives which controls and renderer the editor uses.
  kind: LayerKind;
  label: string;
  visible: boolean;
  // Whether the section can be toggled off the creative (the eye toggle).
  hideable: boolean;
}

// How an image is positioned *within* its frame. The frame (band / image box)
// stays put; these four numbers move/zoom/rotate the photo inside it so the user
// can choose which part shows. Absent === identity (the template default crop).
export interface ImageTransform {
  // Pan, as a fraction of the frame's width/height (0 = centered).
  offsetX: number;
  offsetY: number;
  // Zoom multiplier on top of the base cover/contain fit (1 = default fit).
  scale: number;
  // Rotation in degrees.
  rotation: number;
}

export interface ImageLayer extends BaseLayer {
  kind: "image";
  src: string;
  transform?: ImageTransform;
}

export interface TextLayer extends BaseLayer {
  kind: "header" | "description" | "cta";
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
  kind: "logo";
  src: string;
}

export type EditorLayer = ImageLayer | TextLayer | LogoLayer;

// The download formats a template's renderer can produce. Mirrors the
// post-template `output_spec.supported_formats` contract; kept static for the MVP
// so each template can advertise a different set.
export type ExportFormat = "png" | "jpeg" | "webp";

export interface ExportFormatMeta {
  id: ExportFormat;
  label: string;
  mime: string;
  extension: string;
  // Lossy formats take a 0–1 quality; PNG ignores it.
  quality?: number;
}

export const EXPORT_FORMATS: Record<ExportFormat, ExportFormatMeta> = {
  png: { id: "png", label: "PNG", mime: "image/png", extension: "png" },
  jpeg: { id: "jpeg", label: "JPEG", mime: "image/jpeg", extension: "jpg", quality: 0.92 },
  webp: { id: "webp", label: "WebP", mime: "image/webp", extension: "webp", quality: 0.92 },
};

// How a template's canvas is composed. "poster" is the single product-shot
// layout (header / description / CTA over one image); "moodboard" is a
// full-bleed vertical stack of photo bands with a city title overlaid.
export type TemplateLayout = "poster" | "moodboard";

export interface RemixEditorTemplate {
  id: string;
  title: string;
  layout: TemplateLayout;
  // CSS aspect-ratio string, e.g. "4 / 5".
  aspectRatio: string;
  // Canvas background fill (solid colour for the MVP).
  background: string;
  palette: EditorColor[];
  // Download formats this template supports (first is the default).
  formats: ExportFormat[];
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

// Perceived brightness (0–1) of a hex colour.
export function colorLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  if (full.length !== 6) return 1;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Pick black or white text for contrast against a solid background colour.
export function readableTextColor(hex: string): string {
  return colorLuminance(hex) > 0.6 ? "#141414" : "#ffffff";
}

// Whether a colour is too light to read as text on a light (near-white) surface
// like the edit panel — used to keep the font-picker label legible.
export function isLightColor(hex: string): boolean {
  return colorLuminance(hex) > 0.62;
}

// Barcelona "City Mood Board" — a full-bleed vertical stack of three city
// photos with the city name set large across the middle band. Each band is an
// independently replaceable photo; the title is live, editable text.
const TEMPLATE_28: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000028",
  title: "City Mood Board",
  layout: "moodboard",
  aspectRatio: "9 / 16",
  background: "#0e1413",
  palette: [
    { label: "Paper", value: "#ffffff" },
    { label: "Sand", value: "#f5ecd9" },
    { label: "Coral", value: "#e8542a" },
    { label: "Sky", value: "#1f7a5e" },
    { label: "Ink", value: "#141414" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "photo-1",
      kind: "image",
      label: "Top photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-skyline.jpg",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Middle photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/Beach Quotes.jpg",
    },
    {
      id: "photo-3",
      kind: "image",
      label: "Bottom photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "City name",
      visible: true,
      hideable: true,
      text: "Barcelona",
      color: "#ffffff",
      fontId: "anton",
      uppercase: true,
      suggestions: ["Barcelona", "Lisbon", "Tokyo", "New York", "Marrakech"],
    },
  ],
};

const TEMPLATE_205: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000205",
  title: "Explore the Wild",
  layout: "poster",
  aspectRatio: "4 / 5",
  background: "#13303a",
  palette: [
    { label: "Amber", value: "#f2a93b" },
    { label: "Coral", value: "#ef5d4c" },
    { label: "Cream", value: "#f5ecd9" },
    { label: "Deep", value: "#13303a" },
    { label: "Paper", value: "#ffffff" },
  ],
  formats: ["png", "jpeg"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Image",
      visible: true,
      hideable: true,
      src: "/templates/shared/Bali photo.jpg",
    },
    {
      id: "header",
      kind: "header",
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
      kind: "description",
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
      kind: "cta",
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
      kind: "logo",
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

// Deep clone so editor state never mutates the shared static config. The image
// `transform` is cloned too, so undo snapshots and the live state never share
// the same mutable object.
export function cloneLayers(template: RemixEditorTemplate): EditorLayer[] {
  return template.layers.map((layer) =>
    layer.kind === "image"
      ? { ...layer, transform: layer.transform ? { ...layer.transform } : undefined }
      : { ...layer },
  );
}

// Identity transform — the template's default crop with no pan/zoom/rotation.
export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
};

// The effective transform for an image layer (identity when unset).
export function imageTransform(layer: ImageLayer): ImageTransform {
  return layer.transform ?? DEFAULT_IMAGE_TRANSFORM;
}

// The CSS `transform` value for an in-frame image. Shared by the live preview and
// the canvas export so both position the photo identically. CSS applies this
// right-to-left (rotate → scale → pan), so the pan is screen-aligned regardless
// of rotation. Pair with `transform-origin: center`.
export function transformCss(t: ImageTransform): string {
  return `translate(${t.offsetX * 100}%, ${t.offsetY * 100}%) scale(${t.scale}) rotate(${t.rotation}deg)`;
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

// ── Moodboard geometry ───────────────────────────────────────────────────────
// Photos fill the canvas as equal, edge-to-edge horizontal bands; the city
// title is centred over the middle band. `padX` keeps long titles off the edges.
export const MOODBOARD_LAYOUT = {
  bands: 3,
  title: { centerY: 0.5, size: 0.135, lineHeight: 1, weight: 800, padX: 0.04 },
} as const;

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

export type LayerKind = "image" | "header" | "description" | "cta" | "eyebrow" | "logo";

export interface EditorFont {
  id: string;
  label: string;
  // CSS font-family stack (the primary family is a Google font we lazy-load).
  family: string;
  // The font's default weight (used when a layer has no explicit weight).
  weight: number;
  // Weights this family actually ships, in ascending order. Display fonts like
  // Anton ship a single weight, so the weight control only offers what's here —
  // this keeps the canvas export (which can't faux-bold) matching the preview.
  weights: number[];
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
  // The persisted UserAsset id when this layer is filled by an uploaded image
  // (vs. the template's default photo). The remix stores this — not the bytes —
  // and the editor resolves it back to a URL on load. Absent === template default.
  assetId?: string;
  // The hosted URL for `assetId` at the time it was attached. Backend remixes
  // re-resolve this server-side from `assetId` on load; legacy local remixes
  // keep it on the layer itself so `assetsFromLayers` can rebuild their asset
  // list from saved layer state.
  assetUrl?: string;
}

export type TextAlign = "left" | "center" | "right";

export interface TextLayer extends BaseLayer {
  kind: "header" | "description" | "cta" | "eyebrow";
  text: string;
  // For header/description this is the text colour; for the CTA it's the
  // button's background colour (label colour is derived for contrast).
  color: string;
  fontId: string;
  uppercase: boolean;
  // Quick AI-style rewrite options cycled by the sparkle button.
  suggestions: string[];
  // Optional style overrides. Absent === the template/LAYOUT default, so existing
  // remixes look unchanged until the user edits them. Resolved via `resolveTextStyle`.
  sizeScale?: number; // multiplier on the layout default font size (1 = default)
  weight?: number; // font weight, snapped to one the chosen font actually ships
  letterSpacing?: number; // tracking, in em (0 = default)
  align?: TextAlign; // default "center"
  shadow?: boolean; // drop shadow behind the text
  // Vertical anchor of the text block, as a fraction of the canvas height
  // (0 = top, 0.5 = center, 1 = bottom). Only layouts with a free-floating
  // title (verticals) expose a control for it; absent === the layout default.
  posY?: number;
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
// full-bleed vertical stack of photo bands with a city title overlaid; "porto"
// reproduces the measured Porto travel poster reference; "relax" is a stack of
// rounded photo panels (with gaps) and a caption + subcaption over the middle
// panel, mirroring the `template_relax.v2.html` render engine template;
// "open-space" is a one-photo interior collage with a full-height backdrop,
// framed inset image, headline and optional top logo lockup;
// "mosaic" is an 11-photo masonry moodboard grid (3 uneven columns, one tall
// centre cell), with no text layers at all.
export type TemplateLayout =
  | "poster"
  | "moodboard"
  | "porto"
  | "relax"
  | "cover"
  | "verticals"
  | "split"
  | "editorial"
  | "collage"
  | "sliced"
  | "duel"
  | "business-choice"
  | "testimonial"
  | "testimonial-arc"
  | "postcard"
  | "citymask"
  | "self"
  | "grid"
  | "drop"
  | "woven"
  | "statement"
  | "brief"
  | "open-space"
  | "mosaic";

export interface RemixEditorTemplate {
  id: string;
  title: string;
  layout: TemplateLayout;
  // CSS aspect-ratio string, e.g. "4 / 5".
  aspectRatio: string;
  aspectRatioOptions?: EditorAspectRatioOption[];
  // Canvas background fill (solid colour for the MVP).
  background: string;
  palette: EditorColor[];
  // Download formats this template supports (first is the default).
  formats: ExportFormat[];
  // Layers in the order the edit panel lists them.
  layers: EditorLayer[];
}

export interface EditorAspectRatioOption {
  id: string;
  label: string;
  aspectRatio: string;
}

// One shared typeface catalog backs every template's font picker. Each family
// is a Google font we load on demand via `editorFontsHref()`.
export const EDITOR_FONTS: EditorFont[] = [
  { id: "anton", label: "Anton", family: "'Anton', sans-serif", weight: 400, weights: [400] },
  {
    id: "archivo",
    label: "Archivo",
    family: "'Archivo Black', sans-serif",
    weight: 400,
    weights: [400],
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    family: "'Bebas Neue', sans-serif",
    weight: 400,
    weights: [400],
  },
  {
    id: "oswald",
    label: "Oswald",
    family: "'Oswald', sans-serif",
    weight: 600,
    weights: [300, 400, 500, 600, 700],
  },
  {
    id: "poppins",
    label: "Poppins",
    family: "'Poppins', sans-serif",
    weight: 600,
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: "'Montserrat', sans-serif",
    weight: 700,
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "playfair",
    label: "Playfair Display",
    family: "'Playfair Display', serif",
    weight: 700,
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: "alexbrush",
    label: "Alex Brush",
    family: "'Alex Brush', cursive",
    weight: 400,
    weights: [400],
  },
  {
    id: "quicksand",
    label: "Quicksand",
    family: "'Quicksand', sans-serif",
    weight: 400,
    weights: [400, 500, 600, 700],
  },
];

// Brand fonts injected at runtime (e.g. a brand-kit primary font applied when a
// remix is composed with the Fonts card attached). They live outside the static
// catalog because they vary per user/brand, but `fontById` resolves them so the
// preview and canvas export render the real family — not the catalog fallback.
const BRAND_FONTS = new Map<string, EditorFont>();

// Standard weight set requested for a brand font (Google serves the subset it
// actually ships; missing weights fall back at load time).
const BRAND_FONT_WEIGHTS = [400, 500, 600, 700];

// Editor-font id for a brand family, e.g. "brand:Martian Mono". Casing is
// preserved so the family (and its Google Fonts URL) can be reconstructed from
// the id alone when a saved remix is reopened in a fresh editor session.
const BRAND_FONT_PREFIX = "brand:";
export function brandFontId(family: string): string {
  return `${BRAND_FONT_PREFIX}${family.trim()}`;
}

// The brand family encoded in a brand font id, or null for a catalog id. Lets a
// freshly-loaded editor re-register the brand font from a layer's fontId.
export function brandFamilyFromId(id: string): string | null {
  return id.startsWith(BRAND_FONT_PREFIX) ? id.slice(BRAND_FONT_PREFIX.length) : null;
}

// Register a brand family as an editor font and lazy-load it, returning its id
// so text layers can point at it. Idempotent per family.
export function registerBrandFont(family: string): string {
  const clean = family.trim();
  const id = brandFontId(clean);
  if (!BRAND_FONTS.has(id)) {
    BRAND_FONTS.set(id, {
      id,
      label: clean,
      family: `'${clean}', 'Helvetica Neue', Arial, sans-serif`,
      weight: 600,
      weights: BRAND_FONT_WEIGHTS,
    });
  }
  // Inject the Google Fonts stylesheet once so previews render the real family.
  // The canvas export gates on `document.fonts.load`, which this stylesheet feeds.
  if (typeof document !== "undefined") {
    const font = BRAND_FONTS.get(id);
    // Warm every weight so the first weight change on the brand font doesn't blink.
    // Must run after the stylesheet parses (see preloadEditorFonts), so warm on
    // the link's load event; if the link already exists, the CSS is ready now.
    const warm = () => {
      if (font) preloadEditorFonts([font]);
    };
    const linkId = `remix-editor-font-${id}`;
    const existing = document.getElementById(linkId);
    if (existing) {
      warm();
    } else {
      const name = clean.replace(/\s+/g, "+");
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${name}:wght@${BRAND_FONT_WEIGHTS.join(
        ";",
      )}&display=swap`;
      link.addEventListener("load", warm, { once: true });
      document.head.appendChild(link);
    }
  }
  return id;
}

// Registered brand fonts, newest first — prepended to the font picker so the
// brand family is selectable (and shown as current) alongside the catalog.
export function brandEditorFonts(): EditorFont[] {
  return [...BRAND_FONTS.values()];
}

export function fontById(id: string): EditorFont {
  return EDITOR_FONTS.find((font) => font.id === id) ?? BRAND_FONTS.get(id) ?? EDITOR_FONTS[0];
}

// The Google Fonts family name (the quoted primary of the CSS stack).
function googleFamilyName(font: EditorFont): string {
  return font.family.match(/'([^']+)'/)?.[1] ?? font.label;
}

// Snap a desired weight to the nearest one the font actually ships, so the
// preview (which can faux-bold) and the canvas export (which can't) agree.
export function nearestWeight(font: EditorFont, target: number): number {
  return font.weights.reduce((best, w) =>
    Math.abs(w - target) < Math.abs(best - target) ? w : best,
  );
}

// The <link> href that loads every catalog family (display swap) so previews and
// the picker render in the real typeface, including every weight the font ships.
export function editorFontsHref(): string {
  const families = EDITOR_FONTS.map((font) => {
    const name = googleFamilyName(font).trim().replace(/\s+/g, "+");
    return `family=${name}:wght@${font.weights.join(";")}`;
  }).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// Eagerly fetch every weight of the given fonts into the FontFaceSet so the first
// weight change doesn't trigger a fetch-and-swap (the "blink"). `display=swap`
// only downloads a weight on first use, so without this the first Bold/Regular
// click flashes while that weight loads; warming them up front makes it instant.
export function preloadEditorFonts(fonts: readonly EditorFont[] = EDITOR_FONTS): void {
  if (typeof document === "undefined" || !document.fonts) return;
  for (const font of fonts) {
    const name = googleFamilyName(font);
    for (const weight of font.weights) {
      // Fire-and-forget: resolves once the weight file is cached.
      document.fonts.load(`${weight} 16px "${name}"`).catch(() => undefined);
    }
  }
}

// Drop-shadow behind text. Expressed in em for CSS so it scales with font size;
// the canvas export derives px offsets/blur from the same ratios.
export const TEXT_SHADOW_CSS = "0 0.04em 0.25em rgba(0,0,0,0.35)";
export const TEXT_SHADOW = { color: "rgba(0,0,0,0.35)", offsetYRatio: 0.04, blurRatio: 0.25 };

export interface ResolvedTextStyle {
  sizeScale: number;
  weight: number;
  letterSpacing: number;
  align: TextAlign;
  shadow: boolean;
  posY: number;
}

// The effective style for a text layer: explicit overrides, else sensible
// defaults. Weight is always snapped to one the chosen font ships. The default
// weight matches the LAYOUT/MOODBOARD defaults by layer kind (header/title 800,
// description 500, cta 600).
export function resolveTextStyle(layer: TextLayer): ResolvedTextStyle {
  const font = fontById(layer.fontId);
  const baseWeight =
    layer.kind === "description"
      ? 500
      : layer.kind === "cta"
        ? 600
        : layer.kind === "eyebrow"
          ? 400
          : 800;
  return {
    sizeScale: layer.sizeScale ?? 1,
    weight: nearestWeight(font, layer.weight ?? baseWeight),
    letterSpacing: layer.letterSpacing ?? 0,
    align: layer.align ?? "center",
    shadow: layer.shadow ?? false,
    posY: layer.posY ?? 0.5,
  };
}

// Human labels for the catalog weights shown in the weight picker.
export const WEIGHT_LABELS: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extrabold",
  900: "Black",
};

// The quoted primary family of a CSS stack (e.g. "'Anton'"), used for measuring
// and for `FontFaceSet.check` (which only tells the truth when given a single,
// specific family — a stack including "sans-serif" always reports loaded).
function fontPrimary(font: EditorFont): string {
  return font.family.split(",")[0].trim();
}

let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx;
}

// When the user switches a text layer's font, return the `sizeScale` that keeps
// the rendered text the same width — so its proportion to the layout is
// preserved and a wider face doesn't overflow the frame. Width scales linearly
// with font size for a given face, so the new scale is just the current scale
// times the old/new single-line width ratio (measured at a reference size).
//
// Async because the target face (a specific family + weight) may not be loaded
// yet — Google fonts load per-weight on demand. Resolves to the layer's current
// scale unchanged whenever it can't measure reliably (no DOM, empty text, or a
// face that fails to load), so it is never a wrong guess — only a no-op fallback.
export async function sizeScaleForFontChange(layer: TextLayer, newFontId: string): Promise<number> {
  const current = resolveTextStyle(layer);
  const ctx = getMeasureCtx();
  const display = (layer.uppercase ? layer.text.toUpperCase() : layer.text).trim();
  if (!ctx || !display || typeof document === "undefined" || !("fonts" in document)) {
    return current.sizeScale;
  }
  const oldFont = fontById(layer.fontId);
  const newFont = fontById(newFontId);
  const newWeight = resolveTextStyle({ ...layer, fontId: newFontId }).weight;
  const oldFace = `${current.weight} 100px ${fontPrimary(oldFont)}`;
  const newFace = `${newWeight} 100px ${fontPrimary(newFont)}`;
  try {
    await Promise.all([document.fonts.load(oldFace), document.fonts.load(newFace)]);
  } catch {
    // Fall through — measure with whatever is available.
  }
  if (!document.fonts.check(oldFace) || !document.fonts.check(newFace)) {
    return current.sizeScale;
  }
  ctx.font = `${current.weight} 100px ${oldFont.family}`;
  const widthOld = ctx.measureText(display).width;
  ctx.font = `${newWeight} 100px ${newFont.family}`;
  const widthNew = ctx.measureText(display).width;
  if (!widthOld || !widthNew) return current.sizeScale;
  // Keep within the size slider's range so the control stays consistent.
  return Math.min(2, Math.max(0.5, current.sizeScale * (widthOld / widthNew)));
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
      shadow: true,
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

const PORTO_POSTER: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000031",
  title: "Porto Travel Poster",
  layout: "porto",
  aspectRatio: "9 / 16",
  background: "#f4efea",
  palette: [
    { label: "Paper", value: "#f4efea" },
    { label: "Ink", value: "#29292b" },
    { label: "Mist", value: "#8f8586" },
    { label: "Port Wine", value: "#7b3048" },
    { label: "Sunset", value: "#d86d5b" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Porto image",
      visible: true,
      hideable: false,
      src: "/templates/shared/porto-poster.jpg",
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Country",
      visible: true,
      hideable: false,
      text: "Portugal",
      color: "#29292b",
      fontId: "montserrat",
      uppercase: true,
      suggestions: ["Portugal", "Spain", "Italy", "France", "Greece"],
    },
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: true,
      hideable: false,
      text: "Porto",
      color: "#29292b",
      fontId: "anton",
      uppercase: false,
      suggestions: ["Porto", "Lisbon", "Madeira", "Barcelona", "Valencia"],
    },
    {
      id: "description",
      kind: "description",
      label: "City overview",
      visible: true,
      hideable: false,
      text: "Porto is the second largest city in Portugal and is famous for the fortified wine (port) produced in the region.",
      color: "#8f8586",
      fontId: "montserrat",
      uppercase: false,
      suggestions: [
        "Porto is the second largest city in Portugal and is famous for the fortified wine (port) produced in the region.",
        "A riverside city of tiled facades, bridges, golden rooftops, and port wine cellars.",
        "A northern Portuguese city shaped by the Douro, historic streets, and sunset viewpoints.",
      ],
    },
  ],
};

// Relax Sea Photo Trio — a stack of rounded photo panels (with soft gaps on a
// paper background) and a caption + subcaption set over the middle panel. Mirrors
// the `template_relax.v2.html` render engine template (id ...015).
const RELAX_TRIO: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000015",
  title: "Relax Sea Photo Trio",
  layout: "relax",
  aspectRatio: "9 / 16",
  background: "#ece9e2",
  palette: [
    { label: "Ink", value: "#1c1c1c" },
    { label: "Paper", value: "#ffffff" },
    { label: "Cream", value: "#f5e9d4" },
    { label: "Sea", value: "#1f6f6b" },
    { label: "Sand", value: "#c9b79c" },
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
      label: "Caption",
      visible: true,
      hideable: true,
      text: "Seaside",
      color: "#1c1c1c",
      fontId: "poppins",
      uppercase: true,
      weight: 700,
      align: "left",
      suggestions: ["Seaside", "Slow days", "Salt air", "Low tide", "Escape"],
    },
    {
      id: "description",
      kind: "description",
      label: "Subcaption",
      visible: true,
      hideable: true,
      text: "let the tide carry\nthe noise away",
      color: "#1c1c1c",
      fontId: "poppins",
      uppercase: false,
      weight: 500,
      letterSpacing: 0.22,
      align: "left",
      suggestions: [
        "let the tide carry\nthe noise away",
        "somewhere the days\nrun a little slower",
        "breathe in, breathe out,\nrepeat",
      ],
    },
  ],
};

// FRANKOF "How to build a timeless interior" — slide 9 of the FRANKOF editorial
// carousel (id ...0109). A single full-bleed photo with a large uppercase
// headline bottom-left, mirroring `template_frankof.v2.html`'s `.s9` layout. The
// first editable slide of the server-rendered FRANKOF series.
const FRANKOF_TIMELESS: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000109",
  title: "How to Build a Timeless Interior",
  layout: "cover",
  aspectRatio: "4 / 5",
  background: "#1d1b19",
  palette: [
    { label: "Paper", value: "#fdfcfa" },
    { label: "Cream", value: "#f5e9d4" },
    { label: "Ink", value: "#111111" },
    { label: "Sunset", value: "#ff5a3c" },
    { label: "Sky", value: "#3c7dff" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-09.png",
    },
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "How to build\na timeless\ninterior",
      color: "#fdfcfa",
      fontId: "montserrat",
      uppercase: true,
      weight: 600,
      align: "left",
      shadow: true,
      suggestions: [
        "How to build\na timeless\ninterior",
        "Signature\nstyle",
        "Design\nfor living",
        "Interior\ntrends",
      ],
    },
  ],
};

// The full-bleed FRANKOF slides share slide 9's palette (paper white on a dark
// canvas, with warm/cool accents), so the caption reads on any photo.
const FRANKOF_COVER_PALETTE: EditorColor[] = [
  { label: "Paper", value: "#fdfcfa" },
  { label: "Cream", value: "#f5e9d4" },
  { label: "Ink", value: "#111111" },
  { label: "Sunset", value: "#ff5a3c" },
  { label: "Sky", value: "#3c7dff" },
];

// FRANKOF "Interior feature" — slide 2 of the editorial carousel (id ...0102). A
// full-bleed interior photo with a white headline bottom-left over a soft bottom
// scrim, mirroring `template_frankof.v2.html`'s `.s2`. Reuses the `cover` renderer
// with slide-2 geometry (see COVER_VARIANTS).
const FRANKOF_INTERIOR: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000102",
  title: "Interior Feature",
  layout: "cover",
  aspectRatio: "4 / 5",
  background: "#1d1b19",
  palette: FRANKOF_COVER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-02.png",
    },
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Rooms that\ntell a story",
      color: "#fdfcfa",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      shadow: true,
      suggestions: [
        "Rooms that\ntell a story",
        "Live with\nintention",
        "Quiet\nluxury",
        "Made to\nlast",
      ],
    },
  ],
};

// FRANKOF "Editorial cover" — slide 4 (id ...0104). Full-bleed photo with a white
// headline and subtitle top-left over a top scrim, mirroring `.s4`. Reuses the
// `cover` renderer with slide-4 geometry (top anchor + subtitle; see
// COVER_VARIANTS) and adds a `description` layer for the subtitle.
const FRANKOF_STATEMENT: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000104",
  title: "Editorial Cover",
  layout: "cover",
  aspectRatio: "4 / 5",
  background: "#1d1b19",
  palette: FRANKOF_COVER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-04.png",
    },
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Design\nthat lasts",
      color: "#fdfcfa",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      shadow: true,
      suggestions: [
        "Design\nthat lasts",
        "Form meets\nfeeling",
        "The art of\nthe everyday",
        "Considered\nby design",
      ],
    },
    {
      id: "description",
      kind: "description",
      label: "Subtitle",
      visible: true,
      hideable: true,
      text: "Considered pieces for calm, characterful rooms.",
      color: "#fdfcfa",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "left",
      shadow: true,
      suggestions: [
        "Considered pieces for calm, characterful rooms.",
        "Where craft and comfort meet.",
        "Timeless materials, honest making.",
      ],
    },
  ],
};

// The paper FRANKOF slides (1, 6, 8) share an editorial ink-on-paper palette.
const FRANKOF_PAPER_PALETTE: EditorColor[] = [
  { label: "Ink", value: "#1d1b19" },
  { label: "Paper", value: "#f5f2ec" },
  { label: "Navy", value: "#1d3c63" },
  { label: "Sunset", value: "#ff5a3c" },
  { label: "Grey", value: "#6f6c66" },
];

// FRANKOF "Concept" — slide 1 (id ...0101). Paper background, uppercase headline
// top, a product photo centred on the paper (contain), and a footer caption +
// arrow. Mirrors `template_frankof.v2.html`'s `.s1`.
const FRANKOF_CONCEPT: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000101",
  title: "Concept Intro",
  layout: "editorial",
  aspectRatio: "4 / 5",
  background: "#f5f2ec",
  palette: FRANKOF_PAPER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Our\nconcept",
      color: "#1d1b19",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      suggestions: ["Our\nconcept", "The\nidea", "Where it\nbegins", "Our\nstory"],
    },
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-01.png",
    },
    {
      id: "description",
      kind: "description",
      label: "Caption",
      visible: true,
      hideable: true,
      text: "FRANKOF — 2026 collection",
      color: "#6f6c66",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "left",
      suggestions: ["FRANKOF — 2026 collection", "Designed in-house", "Made to be lived in"],
    },
  ],
};

// FRANKOF "Showcase" — slide 6 (id ...0106). Paper background, uppercase headline
// top, a large photo filling the rest of the frame (cover). No footer. Mirrors
// `.s6`.
const FRANKOF_SHOWCASE: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000106",
  title: "Full-Frame Showcase",
  layout: "editorial",
  aspectRatio: "4 / 5",
  background: "#f5f2ec",
  palette: FRANKOF_PAPER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Beauty\nor comfort?",
      color: "#1d1b19",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      suggestions: [
        "Beauty\nor comfort?",
        "Why not\nboth?",
        "Form and\nfunction",
        "Made for\nliving",
      ],
    },
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-06.png",
    },
  ],
};

// FRANKOF "Feature" — slide 8 (id ...0108). Paper background, uppercase headline
// top, a framed photo (cover), and a footer body caption + arrow. Mirrors `.s8`.
const FRANKOF_FEATURE: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000108",
  title: "Feature Story",
  layout: "editorial",
  aspectRatio: "4 / 5",
  background: "#f5f2ec",
  palette: FRANKOF_PAPER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Your\nfavorite\nstyle",
      color: "#1d1b19",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      suggestions: ["Your\nfavorite\nstyle", "Find your\nfit", "Signature\npieces", "The\nfeature"],
    },
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-08.png",
    },
    {
      id: "description",
      kind: "description",
      label: "Caption",
      visible: true,
      hideable: true,
      text: "A closer look at the pieces our community keeps coming back to.",
      color: "#6f6c66",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "left",
      suggestions: [
        "A closer look at the pieces our community keeps coming back to.",
        "The details that make the difference.",
        "Styled for real, everyday rooms.",
      ],
    },
  ],
};

// FRANKOF "Reviews" — slide 3 (id ...0103). Paper background, a headline beside a
// small thumbnail, then a wide photo over a two-photo pair. Mirrors `.s3`.
const FRANKOF_REVIEWS: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000103",
  title: "Reviews Grid",
  layout: "collage",
  aspectRatio: "4 / 5",
  background: "#f5f2ec",
  palette: FRANKOF_PAPER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "What people\nare saying",
      color: "#1d1b19",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      suggestions: [
        "What people\nare saying",
        "Loved by\nour community",
        "Real homes,\nreal reviews",
        "In your\nwords",
      ],
    },
    {
      id: "photo-1",
      kind: "image",
      label: "Thumbnail",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-03.png",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Wide photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-06.png",
    },
    {
      id: "photo-3",
      kind: "image",
      label: "Photo 3",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-02.png",
    },
    {
      id: "photo-4",
      kind: "image",
      label: "Photo 4",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-04.png",
    },
  ],
};

// FRANKOF "Design for life" — slide 5 (id ...0105). Headline + brand wordmark, a
// body paragraph beside a product card, then a two-photo pair. Mirrors `.s5`.
const FRANKOF_DESIGN: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000105",
  title: "Design Story",
  layout: "collage",
  aspectRatio: "4 / 5",
  background: "#f5f2ec",
  palette: FRANKOF_PAPER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Designed\nfor life",
      color: "#1d1b19",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      suggestions: ["Designed\nfor life", "Built to\nlast", "Made with\ncare", "Our\nphilosophy"],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Brand",
      visible: true,
      hideable: true,
      text: "FRANKOF",
      color: "#1d1b19",
      fontId: "poppins",
      uppercase: true,
      weight: 500,
      letterSpacing: 0.06,
      align: "right",
      suggestions: ["FRANKOF", "STUDIO", "MAISON"],
    },
    {
      id: "description",
      kind: "description",
      label: "Body",
      visible: true,
      hideable: true,
      text: "We design furniture to be lived with — honest materials, quiet forms, and details that last for years.",
      color: "#5e5b56",
      fontId: "poppins",
      uppercase: false,
      weight: 300,
      align: "left",
      suggestions: [
        "We design furniture to be lived with — honest materials, quiet forms, and details that last for years.",
        "Every piece starts with how you actually live, then works back to form.",
        "Considered, comfortable, and made to age well.",
      ],
    },
    {
      id: "photo-1",
      kind: "image",
      label: "Card photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-05.png",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Photo 2",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-01.png",
    },
    {
      id: "photo-3",
      kind: "image",
      label: "Photo 3",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-08.png",
    },
    // Optional brand logo — off by default; when shown it replaces the wordmark
    // in the top-right slot. The composer's Logo card fills this from the brand kit.
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

// FRANKOF "Trends" — slide 7 (id ...0107). Headline + brand wordmark, a subtitle,
// then an asymmetric two-photo pair (a tall photo and a shorter one). Mirrors `.s7`.
const FRANKOF_TRENDS: RemixEditorTemplate = {
  id: "13000000-0000-0000-0000-000000000107",
  title: "Trends Feature",
  layout: "collage",
  aspectRatio: "4 / 5",
  background: "#f5f2ec",
  palette: FRANKOF_PAPER_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "This season's\ntrends",
      color: "#1d1b19",
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      align: "left",
      suggestions: ["This season's\ntrends", "What's\nnext", "The new\nneutrals", "Trending\nnow"],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Brand",
      visible: true,
      hideable: true,
      text: "FRANKOF",
      color: "#1d1b19",
      fontId: "poppins",
      uppercase: true,
      weight: 500,
      letterSpacing: 0.06,
      align: "right",
      suggestions: ["FRANKOF", "STUDIO", "MAISON"],
    },
    {
      id: "description",
      kind: "description",
      label: "Subtitle",
      visible: true,
      hideable: true,
      text: "The shapes, tones and textures shaping interiors this year.",
      color: "#5e5b56",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "left",
      suggestions: [
        "The shapes, tones and textures shaping interiors this year.",
        "Soft curves, warm neutrals, and natural materials.",
        "What our design team is watching right now.",
      ],
    },
    {
      id: "photo-1",
      kind: "image",
      label: "Tall photo",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-07.png",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Photo 2",
      visible: true,
      hideable: false,
      src: "/templates/frankof-collection/slide-02.png",
    },
  ],
};

// Travel Inspiration Pin — 2–7 full-height vertical photo strips side by side,
// with an optional title whose letters spread evenly across the poster width
// (one letter landing roughly per strip, as in the reference pin). The title can
// sit at any vertical position via the layer's `posY`. Strips are dynamic: the
// editor can add/remove photo layers within VERTICALS_LAYOUT.min/maxStrips and
// the preview/export derive the strip count from the image layer count.
const TRAVEL_PIN: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000032",
  title: "Travel Inspiration Pin",
  layout: "verticals",
  aspectRatio: "3 / 4",
  background: "#101311",
  palette: [
    { label: "Gold", value: "#e9c33c" },
    { label: "Paper", value: "#ffffff" },
    { label: "Coral", value: "#e8542a" },
    { label: "Sea", value: "#1f6f6b" },
    { label: "Ink", value: "#141414" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "photo-1",
      kind: "image",
      label: "Photo 1",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Photo 2",
      visible: true,
      hideable: false,
      src: "/templates/shared/Beach Quotes.jpg",
    },
    {
      id: "photo-3",
      kind: "image",
      label: "Photo 3",
      visible: true,
      hideable: false,
      src: "/templates/shared/Bali photo.jpg",
    },
    {
      id: "photo-4",
      kind: "image",
      label: "Photo 4",
      visible: true,
      hideable: false,
      src: "/templates/shared/porto-poster.jpg",
    },
    {
      id: "photo-5",
      kind: "image",
      label: "Photo 5",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-skyline.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Title",
      visible: true,
      hideable: true,
      text: "Costa",
      color: "#e9c33c",
      fontId: "playfair",
      uppercase: true,
      weight: 500,
      shadow: false,
      posY: 0.5,
      suggestions: ["Costa", "Rica", "Wild", "Coast", "Aloha"],
    },
  ],
};

// SOULKIN "split editorial" pin — a paper panel on the left and a full-height
// photo on the right, with a giant uppercase headline whose letters are knocked
// out of the paper to reveal the same photo behind them (so letters spanning
// into the photo area read continuous with it), plus a small dark body block
// bottom-left. Both texts are user inputs. Mirrors the reference pin.
const SOULKIN_SPLIT: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000033",
  title: "Soulkin Split Pin",
  layout: "split",
  aspectRatio: "4 / 5",
  background: "#ece4d6",
  palette: [
    { label: "Paper", value: "#ece4d6" },
    { label: "Ink", value: "#1c1a17" },
    { label: "Sand", value: "#d8cbb3" },
    { label: "Olive", value: "#5c5a3a" },
    { label: "Clay", value: "#a5714e" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: true,
      text: "Soulkin",
      // Colour is the fallback used when the photo can't fill the letters.
      color: "#1c1a17",
      fontId: "archivo",
      uppercase: true,
      suggestions: ["Soulkin", "Retreat", "Wander", "Escape", "Haven"],
    },
    {
      id: "description",
      kind: "description",
      label: "Body",
      visible: true,
      hideable: true,
      text: "Aravali Hills, Gurugram\nThe Third Place,\nReimagined For\nModern Souls.",
      color: "#1c1a17",
      fontId: "montserrat",
      uppercase: false,
      weight: 500,
      align: "left",
      suggestions: [
        "Aravali Hills, Gurugram\nThe Third Place,\nReimagined For\nModern Souls.",
        "A quiet retreat\nwhere the city\nfinally exhales.",
        "Designed for slow\nmornings and\nlong horizons.",
      ],
    },
  ],
};

// SUNDAY "sliced type" poster — a paper canvas with a giant word (the caption)
// set one big letter per horizontal band, each letter filled with its own
// horizontal slice of a single photo so the picture reads continuous down the
// word, with a hairline paper gap between bands. A right-hand column carries an
// optional date, quote and year. Mirrors public/templates/shared/sunday.jpg.
const SUNDAY_POSTER: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000034",
  title: "Sunday Sliced Type",
  layout: "sliced",
  aspectRatio: "3 / 4",
  background: "#f3ece4",
  palette: [
    { label: "Paper", value: "#f3ece4" },
    { label: "Ink", value: "#33302b" },
    { label: "Forest", value: "#3f5d3a" },
    { label: "Clay", value: "#a5714e" },
    { label: "Black", value: "#141414" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg",
    },
    // Optional full-bleed background image behind everything — off by default
    // (the paper shows through). Changeable/replaceable in the editor.
    {
      id: "background",
      kind: "image",
      label: "Background image",
      visible: false,
      hideable: true,
      src: "",
    },
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: true,
      hideable: false,
      text: "Sunday",
      // Fallback colour used when the photo can't fill the letters.
      color: "#33302b",
      fontId: "archivo",
      uppercase: true,
      suggestions: ["Sunday", "Monday", "Friday", "Escape", "Slow"],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Date",
      visible: true,
      hideable: true,
      text: "3 May",
      color: "#33302b",
      fontId: "playfair",
      uppercase: true,
      weight: 400,
      suggestions: ["3 May", "1 Jan", "24 Dec", "14 Feb"],
    },
    {
      id: "description",
      kind: "description",
      label: "Quote",
      visible: true,
      hideable: true,
      text: "Make each day your masterpiece.\n— John Wooden",
      color: "#33302b",
      fontId: "playfair",
      uppercase: false,
      weight: 400,
      suggestions: [
        "Make each day your masterpiece.\n— John Wooden",
        "Almost everything will work again\nif you unplug it.",
        "The quieter you become,\nthe more you can hear.",
      ],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Year",
      visible: true,
      hideable: true,
      text: "2026",
      color: "#33302b",
      fontId: "playfair",
      uppercase: false,
      weight: 400,
      suggestions: ["2026", "2025", "2027"],
    },
  ],
};

// MA&partners "this or that" — an Instagram-story comparison poll: two vertical
// photos butted side by side, a stacked serif caption ("this / or / that") over
// them, an optional white poll card with two option rows ("Left" / "Right") and
// an optional brand wordmark footer. Both photos are required user inputs; the
// caption is the required text; the two poll options and the wordmark are
// optional (editable, toggleable). Mirrors public/templates/shared/ma_*.jpg.
const DUEL_THIS_OR_THAT: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000035",
  title: "This or That Poll",
  layout: "duel",
  aspectRatio: "9 / 16",
  background: "#e7ddd0",
  palette: [
    { label: "Paper", value: "#ffffff" },
    { label: "Ink", value: "#1c1a17" },
    { label: "Sand", value: "#e7ddd0" },
    { label: "Olive", value: "#5c5a3a" },
    { label: "Clay", value: "#a5714e" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "photo-1",
      kind: "image",
      label: "Left photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Right photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/Bali photo.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: true,
      hideable: false,
      text: "this or that",
      color: "#ffffff",
      fontId: "playfair",
      // Lowercase by default (the "this or that" look); the uppercase toggle
      // still flips it to caps when the user wants.
      uppercase: false,
      weight: 600,
      shadow: false,
      posY: 0.22,
      suggestions: ["this or that", "left or right", "yes or no", "hot or cold"],
    },
    {
      id: "option-left",
      kind: "eyebrow",
      label: "Left option",
      visible: true,
      hideable: true,
      text: "Left",
      color: "#1a1a1a",
      fontId: "montserrat",
      uppercase: false,
      weight: 700,
      suggestions: ["Left", "This", "Option A", "Yes"],
    },
    {
      id: "option-right",
      kind: "cta",
      label: "Right option",
      visible: true,
      hideable: true,
      text: "Right",
      color: "#1a1a1a",
      fontId: "montserrat",
      uppercase: false,
      weight: 700,
      suggestions: ["Right", "That", "Option B", "No"],
    },
    {
      id: "description",
      kind: "description",
      label: "Wordmark",
      visible: true,
      hideable: true,
      text: "MA&partners",
      color: "#ffffff",
      fontId: "playfair",
      uppercase: false,
      weight: 500,
      suggestions: ["MA&partners", "@yourbrand", "Studio Name", "Vote now"],
    },
  ],
};

// Business Edition — a Pinterest-style "This or that?" comparison pin. Two
// overlapping rounded photos sit under a fixed mixed-type headline, with
// optional handle, BUSINESS / EDITION pill labels and a bottom caption. The
// default preview is measured from
// public/templates/shared/71244d4475e68bda4dc6ebed33162ec7.jpg.
const BUSINESS_CHOICE_THIS_OR_THAT: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000049",
  title: "Business Edition",
  layout: "business-choice",
  aspectRatio: "4 / 5",
  aspectRatioOptions: [
    { id: "portrait", label: "4:5", aspectRatio: "4 / 5" },
    { id: "square", label: "1:1", aspectRatio: "1 / 1" },
    { id: "story", label: "Story", aspectRatio: "9 / 16" },
  ],
  background: "#f0f0e6",
  palette: [
    { label: "Ink", value: "#444444" },
    { label: "Charcoal", value: "#2f2f2f" },
    { label: "Black", value: "#141414" },
    { label: "Olive", value: "#5c5a3a" },
    { label: "Clay", value: "#a5714e" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "photo-1",
      kind: "image",
      label: "Left photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/this-or-that-business-source.jpg",
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Right photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/this-or-that-edition-source.jpg",
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Handle",
      visible: true,
      hideable: true,
      text: "@ITSKIARAWEBB",
      color: "#333333",
      fontId: "poppins",
      uppercase: true,
      weight: 500,
      suggestions: ["@ITSKIARAWEBB", "@YOURBRAND", "@FOUNDERLIFE", "@CEOCLUB"],
    },
    {
      id: "header",
      kind: "header",
      label: "Business label",
      visible: true,
      hideable: true,
      text: "BUSINESS",
      color: "#444444",
      fontId: "montserrat",
      uppercase: true,
      weight: 800,
      letterSpacing: 0.04,
      suggestions: ["BUSINESS", "FOUNDER", "CEO", "BRAND"],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Edition label",
      visible: true,
      hideable: true,
      text: "EDITION",
      color: "#444444",
      fontId: "montserrat",
      uppercase: true,
      weight: 800,
      letterSpacing: 0.04,
      suggestions: ["EDITION", "MOOD", "VIBE", "LIFE"],
    },
    {
      id: "description",
      kind: "description",
      label: "Bottom caption",
      visible: true,
      hideable: true,
      text: "Because every CEO has their own vibe.",
      color: "#333333",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "center",
      suggestions: [
        "Because every CEO has their own vibe.",
        "Because every founder has their own flow.",
        "Pick the CEO vibe that feels like you.",
      ],
    },
  ],
};

// Olivia Testimonial — a square customer quote card with one avatar image, an
// optional testimonial paragraph, a required author line and an optional CEO
// vibe line kept available for brand/copy variants. Preview art lives at
// public/templates/shared/e79728152d6c58ad0ef70e013df666ac.jpg.
const OLIVIA_TESTIMONIAL: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000050",
  title: "Olivia Testimonial",
  layout: "testimonial",
  aspectRatio: "1 / 1",
  aspectRatioOptions: [
    { id: "square", label: "1:1", aspectRatio: "1 / 1" },
    { id: "portrait", label: "4:5", aspectRatio: "4 / 5" },
    { id: "story", label: "Story", aspectRatio: "9 / 16" },
  ],
  background: "#d4aa82",
  palette: [
    { label: "Coffee", value: "#665748" },
    { label: "Taupe", value: "#b08b68" },
    { label: "Mocha", value: "#4f4439" },
    { label: "Cream", value: "#fffdf8" },
    { label: "Ink", value: "#1c1a17" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Avatar",
      visible: true,
      hideable: false,
      src: "/templates/shared/testimonial-avatar-olivia-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "CEO line",
      visible: false,
      hideable: true,
      text: "Because every CEO has their own vibe.",
      color: "#665748",
      fontId: "quicksand",
      uppercase: false,
      weight: 600,
      align: "center",
      suggestions: [
        "Because every CEO has their own vibe.",
        "Because every founder has their own rhythm.",
        "Because every leader brings a different energy.",
      ],
    },
    {
      id: "description",
      kind: "description",
      label: "Testimonial",
      visible: true,
      hideable: true,
      text: "Everything was very good and tasty!\nThe food is interesting and non-\nstandard, so you want to try\neverything! Cozy place, good service,\ngood wine list and very tasty! Thank\nyou!",
      color: "#665748",
      fontId: "quicksand",
      uppercase: false,
      weight: 400,
      align: "center",
      letterSpacing: 0.06,
      suggestions: [
        "Everything was very good and tasty!\nThe food is interesting and non-standard, so you want to try everything! Cozy place, good service, good wine list and very tasty! Thank you!",
        "Beautiful experience from start to finish. Cozy, thoughtful and genuinely memorable.",
        "A warm place with wonderful service, great wine and food worth coming back for.",
      ],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Author",
      visible: true,
      hideable: false,
      text: "Olivia W.",
      color: "#665748",
      fontId: "quicksand",
      uppercase: false,
      weight: 700,
      align: "center",
      suggestions: ["Olivia W.", "Avery M.", "Mia K.", "Sophia R."],
    },
  ],
};

// Claudia Testimonial — a story-format testimonial card with a required avatar,
// arced TESTIMONIAL title, required review copy, optional author/handle/website
// text and a required five-star badge. Preview art lives at
// public/templates/shared/3fc57d97907421c80d7eb8db4e560c9d.jpg.
const CLAUDIA_TESTIMONIAL: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000051",
  title: "Claudia Testimonial",
  layout: "testimonial-arc",
  aspectRatio: "843 / 1500",
  aspectRatioOptions: [
    { id: "story", label: "Story", aspectRatio: "843 / 1500" },
    { id: "portrait", label: "4:5", aspectRatio: "4 / 5" },
    { id: "square", label: "1:1", aspectRatio: "1 / 1" },
  ],
  background: "#bda797",
  palette: [
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#111111" },
    { label: "Taupe", value: "#ad9a83" },
    { label: "Warm Stone", value: "#bda797" },
    { label: "Muted", value: "#777777" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Avatar",
      visible: true,
      hideable: false,
      src: "/templates/shared/testimonial-arc-avatar-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Arc title",
      visible: true,
      hideable: false,
      text: "TESTIMONIAL",
      color: "#ffffff",
      fontId: "playfair",
      uppercase: true,
      weight: 500,
      letterSpacing: 0.08,
      suggestions: ["TESTIMONIAL", "KIND WORDS", "CLIENT LOVE", "REVIEW"],
    },
    {
      id: "description",
      kind: "description",
      label: "Testimonial",
      visible: true,
      hideable: false,
      text: "Thank you very much! An amazing job\nthat exceeded all my expectations! I am\nvery glad that I trusted you!",
      color: "#111111",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "center",
      suggestions: [
        "Thank you very much! An amazing job that exceeded all my expectations! I am very glad that I trusted you!",
        "A beautiful result, thoughtful service, and an experience I would happily recommend.",
        "The work was polished, careful, and better than I imagined. Thank you so much!",
      ],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Author",
      visible: true,
      hideable: true,
      text: "- Claudia Alves -",
      color: "#111111",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "center",
      suggestions: ["- Claudia Alves -", "Claudia Alves.", "- Olivia W. -", "- Sofia Martins -"],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Handle",
      visible: true,
      hideable: true,
      text: "@reallygreatsite",
      color: "#777777",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "center",
      suggestions: ["@reallygreatsite", "@yourbrand", "@clientname", ""],
    },
    {
      id: "website",
      kind: "eyebrow",
      label: "Website",
      visible: true,
      hideable: true,
      text: "www.reallygreatsite.com",
      color: "#ffffff",
      fontId: "poppins",
      uppercase: false,
      weight: 400,
      align: "center",
      suggestions: ["www.reallygreatsite.com", "www.yourbrand.com", "yourbrand.com", ""],
    },
  ],
};

// City "postcard" poster — a full-bleed travel photo with a giant condensed city
// name stacked one letter per line down the right edge (white, difference-blended
// over the photo so it inverts the picture: light letters over dark areas, dark
// letters over light ones), a rotated subtitle in the paper left gutter and a
// country label bottom-right. One required photo, a required city caption; the
// subtitle and country are optional. Mirrors
// public/templates/shared/26bf922044a5d6b1d6fd11eb539dd481.jpg (LONDON / England).
const POSTCARD_LONDON: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000036",
  title: "City Postcard",
  layout: "postcard",
  aspectRatio: "735 / 1067",
  background: "#f4f2ec",
  palette: [
    { label: "Paper", value: "#f4f2ec" },
    { label: "Ink", value: "#14161a" },
    { label: "White", value: "#ffffff" },
    { label: "Slate", value: "#3a3f45" },
    { label: "Stone", value: "#8a8577" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "City",
      visible: true,
      hideable: false,
      text: "London",
      // White by default so the difference blend inverts the photo behind each
      // letter (light letters over dark photo, dark letters over light photo).
      color: "#ffffff",
      fontId: "anton",
      uppercase: true,
      weight: 400,
      suggestions: ["London", "Paris", "Tokyo", "New York", "Rome"],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Subtitle",
      visible: true,
      hideable: true,
      text: "St. Pauls Cathedral",
      color: "#14161a",
      fontId: "oswald",
      uppercase: true,
      weight: 600,
      letterSpacing: 0.16,
      suggestions: ["St. Pauls Cathedral", "The Eiffel Tower", "Shibuya Crossing", "Central Park"],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Country",
      visible: true,
      hideable: true,
      text: "England",
      color: "#14161a",
      fontId: "oswald",
      uppercase: true,
      weight: 700,
      letterSpacing: 0.3,
      suggestions: ["England", "France", "Japan", "USA", "Italy"],
    },
  ],
};

// City "text-mask" poster — a full-bleed photo revealed only through a giant
// uppercase city name that is auto-fit and word-wrapped to fill most of the
// frame (long words break across lines, e.g. SAN / FRAN / CISCO); everything
// outside the letters is solid black. An optional right-aligned country label
// and a small flag sit in the upper right. One required photo, a required city
// caption (brand font supported); the country label is optional. Mirrors
// public/templates/shared/f2cb6d0c961e8d61a6940e642fc153ea.jpg (SAN FRANCISCO).
const CITYMASK_SAN_FRANCISCO: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000037",
  title: "City Text Mask",
  layout: "citymask",
  aspectRatio: "736 / 1308",
  background: "#000000",
  palette: [
    { label: "Black", value: "#000000" },
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#14161a" },
    { label: "Slate", value: "#3a3f45" },
    { label: "Stone", value: "#8a8577" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-skyline.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "City",
      visible: true,
      hideable: false,
      text: "San Francisco",
      // Colour is unused (the photo shows through the letters), but a value is
      // kept so the no-photo fallback still paints legible letters.
      color: "#ffffff",
      fontId: "archivo",
      uppercase: true,
      weight: 400,
      suggestions: ["San Francisco", "Los Angeles", "New York", "Chicago", "Miami"],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Country",
      visible: true,
      hideable: true,
      text: "United States of America",
      color: "#ffffff",
      fontId: "oswald",
      uppercase: true,
      weight: 700,
      letterSpacing: 0.06,
      suggestions: ["United States of America", "United Kingdom", "France", "Japan", "Italy"],
    },
  ],
};

// Self split-portrait poster. Preview art lives at
// public/templates/shared/6be50eaad3f63ade68ede1c1bb8a2781.jpg (736 x 1062). The
// default photo is that same reference so the untouched editor reproduces it.
const SELF_PORTRAIT: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000038",
  title: "Self Portrait",
  layout: "self",
  aspectRatio: "736 / 1062",
  background: "#ffffff",
  palette: [
    { label: "Black", value: "#000000" },
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#14161a" },
    { label: "Slate", value: "#3a3f45" },
    { label: "Stone", value: "#8a8577" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      // A clean portrait (the composed reference healed so the letters reveal
      // continuous photo rather than the baked-in white margins).
      src: "/templates/shared/self-portrait-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: true,
      hideable: false,
      text: "SELF",
      // Colour is unused when a photo is present (it shows through the letters),
      // but a value is kept so the no-photo fallback still paints legible letters.
      color: "#000000",
      fontId: "archivo",
      uppercase: true,
      weight: 400,
      suggestions: ["SELF", "SOLO", "MUSE", "MOOD", "RAW"],
    },
  ],
};

// Mono Grid series — a full-bleed background photo split into a 3×3 grid by
// thin lines (2 vertical + 2 horizontal, drawn in the canvas background
// colour), with up to 3 small cell photos placed on fixed cells, an optional
// caption block (headline + hashtag), an optional rotated side text block
// (title + hashtag reading bottom-to-top) and an optional brand logo. Which
// cells the photos/texts occupy varies per template via `GRID_VARIANTS`.
// Mirrors public/templates/shared/{bcf6…, 04fb…, 9f37…}.jpg (1200 × 1500).
const GRID_PALETTE: EditorColor[] = [
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Ink", value: "#1c1a17" },
  { label: "Stone", value: "#8a8577" },
  { label: "Sand", value: "#e7ddd0" },
];

// Shared non-image layers for a grid template (per-template text defaults).
function gridTextLayers(defaults: {
  caption: string;
  captionVisible?: boolean;
  captionColor: string;
  tag: string;
  sideTitle: string;
  sideColor: string;
  sideTag: string;
}): EditorLayer[] {
  return [
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: defaults.captionVisible ?? true,
      hideable: true,
      text: defaults.caption,
      color: defaults.captionColor,
      fontId: "montserrat",
      uppercase: true,
      weight: 800,
      suggestions: [
        "Bold patterns,\ntimeless vibes.",
        "Statement hat",
        "Less, but better.",
        "Made to be seen.",
      ],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Caption tag",
      visible: defaults.captionVisible ?? true,
      hideable: true,
      text: defaults.tag,
      color: defaults.captionColor,
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      letterSpacing: 0.06,
      suggestions: ["#blackandwhitemood", "#timelessfashion", "#monochromemagic", "#chicandbold"],
    },
    {
      id: "description",
      kind: "description",
      label: "Side title",
      visible: true,
      hideable: true,
      text: defaults.sideTitle,
      color: defaults.sideColor,
      fontId: "montserrat",
      uppercase: true,
      weight: 800,
      suggestions: ["Elegance in every", "Soft & strong", "Black & white", "Quiet luxury"],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Side tag",
      visible: true,
      hideable: true,
      text: defaults.sideTag,
      color: defaults.sideColor,
      fontId: "montserrat",
      uppercase: true,
      weight: 500,
      letterSpacing: 0.06,
      suggestions: ["#monochromemagic", "#chicandbold", "contrast", "#editorialmood"],
    },
    {
      id: "logo",
      kind: "logo",
      label: "Logo",
      visible: false,
      hideable: true,
      src: "/transparent-logo.png",
    },
  ];
}

function gridCellLayer(index: number, src: string): EditorLayer {
  return {
    id: `cell-${index + 1}`,
    kind: "image",
    label: `Cell photo ${index + 1}`,
    visible: true,
    hideable: true,
    src,
  };
}

const GRID_MONO: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000039",
  title: "Mono Grid",
  layout: "grid",
  aspectRatio: "4 / 5",
  background: "#ffffff",
  palette: GRID_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "background",
      kind: "image",
      label: "Background photo",
      visible: true,
      hideable: false,
      // A clean stock photo (not the composed reference, whose baked-in
      // captions and cells would double up under the live layers).
      src: "/templates/shared/barcelona-park.jpg",
    },
    gridCellLayer(0, "/templates/shared/Bali photo.jpg"),
    gridCellLayer(1, "/templates/shared/Beach Quotes.jpg"),
    ...gridTextLayers({
      caption: "Bold patterns,\ntimeless vibes.",
      captionColor: "#ffffff",
      tag: "#blackandwhitemood",
      sideTitle: "Elegance in every",
      sideColor: "#ffffff",
      sideTag: "#monochromemagic",
    }),
  ],
};

const GRID_STATEMENT: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000040",
  title: "Statement Grid",
  layout: "grid",
  aspectRatio: "4 / 5",
  background: "#ffffff",
  palette: GRID_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "background",
      kind: "image",
      label: "Background photo",
      visible: true,
      hideable: false,
      // Clean photo — the composed reference has baked-in captions.
      src: "/templates/shared/Bali photo.jpg",
    },
    gridCellLayer(0, "/templates/shared/Beach Quotes.jpg"),
    gridCellLayer(1, "/templates/shared/Sunflower.jpg"),
    gridCellLayer(2, "/templates/shared/barcelona-skyline.jpg"),
    ...gridTextLayers({
      caption: "Statement hat",
      captionColor: "#ffffff",
      tag: "#timelessfashion",
      sideTitle: "Soft & strong",
      sideColor: "#1c1a17",
      sideTag: "#chicandbold",
    }),
  ],
};

const GRID_CONTRAST: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000041",
  title: "Contrast Grid",
  layout: "grid",
  aspectRatio: "4 / 5",
  background: "#ffffff",
  palette: GRID_PALETTE,
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "background",
      kind: "image",
      label: "Background photo",
      visible: true,
      hideable: false,
      // Clean photo — the composed reference has baked-in captions.
      src: "/templates/shared/barcelona-skyline.jpg",
    },
    gridCellLayer(0, "/templates/shared/barcelona-park.jpg"),
    gridCellLayer(1, "/templates/shared/Bali photo.jpg"),
    gridCellLayer(2, "/templates/shared/Beach Quotes.jpg"),
    ...gridTextLayers({
      // The reference has no centre caption — hidden by default, one tap away.
      caption: "Knit season",
      captionVisible: false,
      captionColor: "#1c1a17",
      tag: "#cozyknits",
      sideTitle: "Black & white",
      // White for legibility over the default photo; the reference's ink is
      // one palette tap away.
      sideColor: "#ffffff",
      sideTag: "contrast",
    }),
  ],
};

// "New Drop" poster — a tilted Polaroid-style photo card (white border + drop
// shadow) pinned between two giant fixed headline words ("NEW" behind its top
// edge, "DROP" behind its bottom), a hand-written caption set in the card's
// caption strip, optional small brand/category labels in the top corners and
// an optional "DISCOVER MORE AT @handle" pill footer. One required photo, a
// required caption (script font, brand font supported); the corner labels and
// the footer pill are optional. Mirrors
// public/templates/shared/b89ab8d1b7f6cdbdfac67e1b84549e7d.jpg (736 × 1308).
const DROP_NEW_DROP: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000042",
  title: "New Drop",
  layout: "drop",
  aspectRatio: "736 / 1308",
  background: "#c92222",
  palette: [
    { label: "Red", value: "#c92222" },
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
    { label: "Maroon", value: "#5a0f14" },
    { label: "Ink", value: "#14161a" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/drop-portrait-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: true,
      hideable: false,
      text: "women's style",
      color: "#5a0f14",
      fontId: "alexbrush",
      uppercase: false,
      weight: 400,
      suggestions: ["women's style", "new season", "street ready", "night out"],
    },
    {
      id: "eyebrow",
      kind: "eyebrow",
      label: "Brand label",
      visible: true,
      hideable: true,
      text: "SMARTOONS",
      color: "#ffffff",
      fontId: "oswald",
      uppercase: true,
      weight: 600,
      letterSpacing: 0.14,
      suggestions: ["SMARTOONS", "YOUR BRAND", "STUDIO"],
    },
    {
      id: "description",
      kind: "description",
      label: "Category label",
      visible: true,
      hideable: true,
      text: "FASHION",
      color: "#ffffff",
      fontId: "oswald",
      uppercase: true,
      weight: 600,
      letterSpacing: 0.14,
      suggestions: ["FASHION", "BEAUTY", "STREETWEAR", "ACCESSORIES"],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Handle",
      visible: true,
      hideable: true,
      // The handle sits inside the pill's white fill, so its default is dark
      // (not white like the other labels, which sit directly on the red bg).
      text: "@SMARTOONS_TIKTOK",
      color: "#5a0f14",
      fontId: "montserrat",
      uppercase: true,
      weight: 700,
      suggestions: ["@SMARTOONS_TIKTOK", "@YOURBRAND", "@SHOP_NOW"],
    },
  ],
};

// Woven Calm — the textile-brand editorial poster. Preview art lives at
// public/templates/shared/b60f85f998182a3089460acd4f8af839.jpg (736 x 920): a
// warm stone canvas with a tall photo panel on the left, a large serif title and
// a small grey body paragraph stacked on the right. The default photo is the
// panel cropped from that reference, so the untouched editor reproduces it.
const WOVEN_CALM: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000043",
  title: "Woven Calm",
  layout: "woven",
  aspectRatio: "736 / 920",
  background: "#e8e3dd",
  palette: [
    { label: "Stone", value: "#e8e3dd" },
    { label: "Sand", value: "#e3dccf" },
    { label: "Mist", value: "#e2e4e1" },
    { label: "Ivory", value: "#f4f1ea" },
    { label: "Clay", value: "#d8cabb" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      // The left panel cropped from the reference so the default matches it.
      src: "/templates/shared/woven-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Title",
      visible: true,
      hideable: false,
      // The big serif headline (word-wrapped). Brand adaptation can swap the
      // face for a brand family; the serif Playfair Display is the default.
      text: "WOVEN CALM",
      color: "#5b5954",
      fontId: "playfair",
      uppercase: true,
      weight: 500,
      suggestions: ["WOVEN CALM", "QUIET TEXTURE", "SOFT LIGHT", "STILL FORM"],
    },
    {
      id: "description",
      kind: "description",
      label: "Body",
      visible: true,
      hideable: true,
      text: "Серия визуальных сцен, созданных для\nпрезентации текстильного продукта.\nПроект соединяет эстетику бренда и\nфункциональный минимализм в спокойной палитре\nсвета и фактур.",
      color: "#ada197",
      fontId: "montserrat",
      uppercase: false,
      weight: 400,
      suggestions: [],
    },
  ],
};

// Statement Portrait — the "BE AWESOME BE COOL" split poster. Preview art lives
// at public/templates/shared/e1715f36feb27ef64348c7d8534f1693.jpg (548 x 761):
// a photo panel on the left and a giant word-wrapped statement on the right,
// each line revealing the same continuous photo, with a small optional tracked
// tagline + underline. The default photo is that reference healed (the white
// gaps between/around the letters clamp-filled from the nearest real pixel) so
// a caption edit reveals continuous photo instead of the baked-in letter edges
// — see self-portrait-source.jpg for the same trick.
const STATEMENT_PORTRAIT: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000044",
  title: "Statement Portrait",
  layout: "statement",
  aspectRatio: "548 / 761",
  background: "#ffffff",
  palette: [
    { label: "Black", value: "#000000" },
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#14161a" },
    { label: "Slate", value: "#3a3f45" },
    { label: "Stone", value: "#8a8577" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      // The reference healed so the letters reveal continuous photo rather
      // than the baked-in white gaps (see comment above).
      src: "/templates/shared/statement-split-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Caption",
      visible: true,
      hideable: false,
      text: "BE AWESOME BE COOL",
      // Colour is unused when a photo is present (it shows through the
      // letters), but a value is kept so the no-photo fallback still paints
      // legible letters.
      color: "#000000",
      fontId: "archivo",
      uppercase: true,
      weight: 400,
      suggestions: [
        "BE AWESOME BE COOL",
        "STAY WILD AND FREE",
        "DRESSED TO IMPRESS",
        "OWN YOUR STYLE",
      ],
    },
    {
      id: "cta",
      kind: "cta",
      label: "Tagline",
      visible: true,
      hideable: true,
      text: "Your presents",
      color: "#000000",
      fontId: "oswald",
      uppercase: true,
      weight: 700,
      letterSpacing: 0.08,
      suggestions: ["Your presents", "New collection", "Now available", "Shop the look"],
    },
  ],
};

// Studio Brief — the "Residential" agency-brief poster. Preview art lives at
// public/templates/shared/835ae6f846127c33b5e08dc12611e29f.jpg (1080 x 1350): a
// white paper panel on the left carrying a bullet-and-rule marker, a bold serif
// category caption and a short mission paragraph, beside a full-bleed photo on
// the right. The default photo is that reference's own right-hand panel, so the
// untouched editor reproduces it.
const STUDIO_BRIEF: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000045",
  title: "Studio Brief",
  layout: "brief",
  aspectRatio: "4 / 5",
  background: "#ffffff",
  palette: [
    { label: "Black", value: "#000000" },
    { label: "Ink", value: "#14161a" },
    { label: "Slate", value: "#3a3f45" },
    { label: "Stone", value: "#8a8577" },
    { label: "White", value: "#ffffff" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Photo",
      visible: true,
      hideable: false,
      // The reference's own right-hand panel so the default matches it.
      src: "/templates/shared/brief-residential-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Category",
      visible: true,
      hideable: false,
      text: "Residential",
      color: "#000000",
      fontId: "playfair",
      uppercase: false,
      weight: 700,
      align: "left",
      suggestions: ["Residential", "Commercial", "Hospitality", "Workspace", "Retail"],
    },
    {
      id: "description",
      kind: "description",
      label: "Mission",
      visible: true,
      hideable: true,
      text: "Our mission is to transform your vision into reality by providing bespoke residential interior design services in the vibrant city of Dubai.",
      color: "#000000",
      fontId: "quicksand",
      uppercase: false,
      weight: 400,
      align: "left",
      suggestions: [
        "Our mission is to transform your vision into reality by providing bespoke residential interior design services in the vibrant city of Dubai.",
        "We craft considered spaces that balance comfort, light and material honesty for modern city living.",
        "From concept to handover, our studio delivers tailored interiors that reflect how you actually live.",
      ],
    },
  ],
};

// Residence Mosaic — the 11-photo interior-design moodboard. Preview art lives
// at public/templates/shared/1d9692aee1d1536bad55a52a4003aaac.jpg (736 ×
// 1313): 3 uneven masonry columns (narrow / wide / narrow) with the wide
// centre column's 3 cells taller than the side columns' 4, split by a thin
// white gutter. No text — every cell is a required photo, independently
// replaceable, and each default photo is that reference's own cell so the
// untouched editor reproduces it exactly.
const RESIDENCE_MOSAIC: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000046",
  title: "Residence Mosaic",
  layout: "mosaic",
  aspectRatio: "736 / 1313",
  background: "#ffffff",
  palette: [
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#1c1a17" },
    { label: "Stone", value: "#8a8577" },
    { label: "Sand", value: "#e7ddd0" },
    { label: "Black", value: "#000000" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "cell-1",
      kind: "image",
      label: "Photo 1",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-01-palm-desert.jpg",
    },
    {
      id: "cell-2",
      kind: "image",
      label: "Photo 2",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-02-modern-exterior.jpg",
    },
    {
      id: "cell-3",
      kind: "image",
      label: "Photo 3",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-03-window-nook.jpg",
    },
    {
      id: "cell-4",
      kind: "image",
      label: "Photo 4",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-04-dune-cushions.jpg",
    },
    {
      id: "cell-5",
      kind: "image",
      label: "Photo 5",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-05-seaview-lounge.jpg",
    },
    {
      id: "cell-6",
      kind: "image",
      label: "Photo 6",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-06-minimal-corner.jpg",
    },
    {
      id: "cell-7",
      kind: "image",
      label: "Photo 7",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-07-gallery-console.jpg",
    },
    {
      id: "cell-8",
      kind: "image",
      label: "Photo 8",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-08-fireplace-nook.jpg",
    },
    {
      id: "cell-9",
      kind: "image",
      label: "Photo 9",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-09-wood-corner-plant.jpg",
    },
    {
      id: "cell-10",
      kind: "image",
      label: "Photo 10",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-10-bright-living-room.jpg",
    },
    {
      id: "cell-11",
      kind: "image",
      label: "Photo 11",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-residence-11-skyline-patio.jpg",
    },
  ],
};

// Coastal Mosaic — the 13-photo Mediterranean-home moodboard. Preview art
// lives at public/templates/shared/078de9478ab62f259139da7a07aa7f60.jpg (736 ×
// 1313): 3 uneven columns split by a thin white gutter, each column breaking
// into a different number of cells (4 / 4 / 5) below the two shared top rows.
// No text — every cell is a required photo, independently replaceable, and
// each default photo is that reference's own cell so the untouched editor
// reproduces it exactly (see the "…047" entry in MOSAIC_VARIANTS).
const COASTAL_MOSAIC: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000047",
  title: "Coastal Mosaic",
  layout: "mosaic",
  aspectRatio: "736 / 1313",
  background: "#ffffff",
  palette: [
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#1c1a17" },
    { label: "Stone", value: "#8a8577" },
    { label: "Sand", value: "#e7ddd0" },
    { label: "Black", value: "#000000" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "cell-1",
      kind: "image",
      label: "Photo 1",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-01-hillside-town.jpg",
    },
    {
      id: "cell-2",
      kind: "image",
      label: "Photo 2",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-02-archway-window.jpg",
    },
    {
      id: "cell-3",
      kind: "image",
      label: "Photo 3",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-03-woven-fans.jpg",
    },
    {
      id: "cell-4",
      kind: "image",
      label: "Photo 4",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-04-cliffside-pool.jpg",
    },
    {
      id: "cell-5",
      kind: "image",
      label: "Photo 5",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-05-terrace-lounge.jpg",
    },
    {
      id: "cell-6",
      kind: "image",
      label: "Photo 6",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-06-rocky-coast.jpg",
    },
    {
      id: "cell-7",
      kind: "image",
      label: "Photo 7",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-07-woven-baskets.jpg",
    },
    {
      id: "cell-8",
      kind: "image",
      label: "Photo 8",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-08-linen-bed.jpg",
    },
    {
      id: "cell-9",
      kind: "image",
      label: "Photo 9",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-09-twine-spool.jpg",
    },
    {
      id: "cell-10",
      kind: "image",
      label: "Photo 10",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-10-plaster-niche.jpg",
    },
    {
      id: "cell-11",
      kind: "image",
      label: "Photo 11",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-11-clifftop-tower.jpg",
    },
    {
      id: "cell-12",
      kind: "image",
      label: "Photo 12",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-12-bedroom-view.jpg",
    },
    {
      id: "cell-13",
      kind: "image",
      label: "Photo 13",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-coastal-13-beamed-bedroom.jpg",
    },
  ],
};

// Stone Villa Mosaic — the 11-photo Mediterranean-villa moodboard. Preview art
// lives at public/templates/shared/12b150466df1b894b3016580977e5ed4.jpg (736 ×
// 1313): 3 uneven masonry columns (narrow / wide / medium), full-bleed to the
// canvas edges, split by a hairline gutter; the wide centre column's middle
// cell spans two row-heights. No text — every cell is a required photo,
// independently replaceable, and each default photo is that reference's own
// cell so the untouched editor reproduces it exactly (see the "…048" entry in
// MOSAIC_VARIANTS).
const STONE_VILLA_MOSAIC: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000048",
  title: "Stone Villa Mosaic",
  layout: "mosaic",
  aspectRatio: "736 / 1313",
  background: "#ffffff",
  palette: [
    { label: "White", value: "#ffffff" },
    { label: "Ink", value: "#1c1a17" },
    { label: "Stone", value: "#8a8577" },
    { label: "Sand", value: "#e7ddd0" },
    { label: "Black", value: "#000000" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "cell-1",
      kind: "image",
      label: "Photo 1",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-01-stone-cabinet.jpg",
    },
    {
      id: "cell-2",
      kind: "image",
      label: "Photo 2",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-02-terracotta-sofa.jpg",
    },
    {
      id: "cell-3",
      kind: "image",
      label: "Photo 3",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-03-patio-olive.jpg",
    },
    {
      id: "cell-4",
      kind: "image",
      label: "Photo 4",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-04-kitchen-ceiling.jpg",
    },
    {
      id: "cell-5",
      kind: "image",
      label: "Photo 5",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-05-staircase-tall.jpg",
    },
    {
      id: "cell-6",
      kind: "image",
      label: "Photo 6",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-06-gallery-wall.jpg",
    },
    {
      id: "cell-7",
      kind: "image",
      label: "Photo 7",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-07-office-masks.jpg",
    },
    {
      id: "cell-8",
      kind: "image",
      label: "Photo 8",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-08-living-room.jpg",
    },
    {
      id: "cell-9",
      kind: "image",
      label: "Photo 9",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-09-glass-door.jpg",
    },
    {
      id: "cell-10",
      kind: "image",
      label: "Photo 10",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-10-tree-branch.jpg",
    },
    {
      id: "cell-11",
      kind: "image",
      label: "Photo 11",
      visible: true,
      hideable: false,
      src: "/templates/shared/mosaic-villa-11-bedroom.jpg",
    },
  ],
};

// Open Space Living Room — a one-photo interior-design collage. Preview art
// lives at public/templates/shared/bd99b4086a779e897c606c7a58c7c06c.jpg
// (736 x 1308): a pale left wash, the same required photo cover-fit as a
// full-height right backdrop, a white framed inset of that photo, and a top
// headline/mark. The editable source image is cropped from the reference's
// inset so the default render recreates the composition without baked-in text.
const OPEN_SPACE_LIVING_ROOM: RemixEditorTemplate = {
  id: "11000000-0000-0000-0000-000000000050",
  title: "Open Space Living Room",
  layout: "open-space",
  aspectRatio: "736 / 1308",
  background: "#efeeee",
  palette: [
    { label: "White", value: "#ffffff" },
    { label: "Warm white", value: "#efeeee" },
    { label: "Concrete", value: "#aaa49c" },
    { label: "Charcoal", value: "#202020" },
    { label: "Forest", value: "#263f32" },
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Backdrop photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/open-space-living-room-source.jpg",
    },
    {
      id: "detail",
      kind: "image",
      label: "Inset photo",
      visible: false,
      hideable: true,
      src: "/templates/shared/open-space-living-room-source.jpg",
    },
    {
      id: "header",
      kind: "header",
      label: "Headline",
      visible: true,
      hideable: false,
      text: "OPEN SPACE\nLIVING ROOM",
      color: "#ffffff",
      fontId: "montserrat",
      uppercase: true,
      weight: 800,
      align: "center",
      letterSpacing: 0.11,
      suggestions: [
        "OPEN SPACE\nLIVING ROOM",
        "MODERN LOFT\nLIVING ROOM",
        "BRIGHT SPACE\nINTERIOR DESIGN",
        "SOFT LIGHT\nLIVING ROOM",
      ],
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

export const OPEN_SPACE_SOURCE_SRC = "/templates/shared/open-space-living-room-source.jpg";

const REMIX_EDITOR_TEMPLATES: Record<string, RemixEditorTemplate> = {
  [TEMPLATE_28.id]: TEMPLATE_28,
  [TEMPLATE_205.id]: TEMPLATE_205,
  [PORTO_POSTER.id]: PORTO_POSTER,
  [RELAX_TRIO.id]: RELAX_TRIO,
  [FRANKOF_TIMELESS.id]: FRANKOF_TIMELESS,
  [FRANKOF_INTERIOR.id]: FRANKOF_INTERIOR,
  [FRANKOF_STATEMENT.id]: FRANKOF_STATEMENT,
  [FRANKOF_CONCEPT.id]: FRANKOF_CONCEPT,
  [FRANKOF_SHOWCASE.id]: FRANKOF_SHOWCASE,
  [FRANKOF_FEATURE.id]: FRANKOF_FEATURE,
  [FRANKOF_REVIEWS.id]: FRANKOF_REVIEWS,
  [FRANKOF_DESIGN.id]: FRANKOF_DESIGN,
  [FRANKOF_TRENDS.id]: FRANKOF_TRENDS,
  [TRAVEL_PIN.id]: TRAVEL_PIN,
  [SOULKIN_SPLIT.id]: SOULKIN_SPLIT,
  [SUNDAY_POSTER.id]: SUNDAY_POSTER,
  [DUEL_THIS_OR_THAT.id]: DUEL_THIS_OR_THAT,
  [BUSINESS_CHOICE_THIS_OR_THAT.id]: BUSINESS_CHOICE_THIS_OR_THAT,
  [OLIVIA_TESTIMONIAL.id]: OLIVIA_TESTIMONIAL,
  [CLAUDIA_TESTIMONIAL.id]: CLAUDIA_TESTIMONIAL,
  [POSTCARD_LONDON.id]: POSTCARD_LONDON,
  [CITYMASK_SAN_FRANCISCO.id]: CITYMASK_SAN_FRANCISCO,
  [SELF_PORTRAIT.id]: SELF_PORTRAIT,
  [GRID_MONO.id]: GRID_MONO,
  [GRID_STATEMENT.id]: GRID_STATEMENT,
  [GRID_CONTRAST.id]: GRID_CONTRAST,
  [DROP_NEW_DROP.id]: DROP_NEW_DROP,
  [WOVEN_CALM.id]: WOVEN_CALM,
  [STATEMENT_PORTRAIT.id]: STATEMENT_PORTRAIT,
  [STUDIO_BRIEF.id]: STUDIO_BRIEF,
  [RESIDENCE_MOSAIC.id]: RESIDENCE_MOSAIC,
  [COASTAL_MOSAIC.id]: COASTAL_MOSAIC,
  [STONE_VILLA_MOSAIC.id]: STONE_VILLA_MOSAIC,
  [OPEN_SPACE_LIVING_ROOM.id]: OPEN_SPACE_LIVING_ROOM,
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

// Deep-clone a working layer set (not a template), preserving image transforms.
// Used to snapshot the editor's baseline for "reset" without aliasing state.
export function dupLayers(layers: EditorLayer[]): EditorLayer[] {
  return layers.map((layer) =>
    layer.kind === "image"
      ? { ...layer, transform: layer.transform ? { ...layer.transform } : undefined }
      : { ...layer },
  );
}

// ── remix persistence (DB-backed editor state) ───────────────────────────────
// A remix stores the editor's layer state in `custom_inputs` and its uploaded
// images as attached assets. These helpers convert between the saved remix and
// the editor's working layers. Defined here (not in lib/remixes.ts) so the
// dependency points one way — lib/remixes.ts imports these types.

export interface RemixEditorAsset {
  asset_id: string;
  url: string;
  order: number;
}

export interface RemixEditorState {
  version?: number;
  caption?: string;
  city_overview?: string;
  aspect_ratio?: string;
  layers?: EditorLayer[];
}

// Persistable image src: keep only a local template-default path. Uploaded /
// remote / blob / data srcs are reconstructed from `assetId` on load, so image
// bytes never land in the remix JSON.
function persistableImageSrc(layer: ImageLayer): string {
  return layer.src.startsWith("/") ? layer.src : "";
}

// Strip heavy/ephemeral image srcs before persisting (keeps assetId, transform,
// text, colours, fonts). Deep-clones so the saved snapshot can't alias state.
export function serializeRemixLayers(layers: EditorLayer[]): EditorLayer[] {
  return layers.map((layer) =>
    layer.kind === "image"
      ? {
          ...layer,
          src: persistableImageSrc(layer),
          transform: layer.transform ? { ...layer.transform } : undefined,
        }
      : { ...layer },
  );
}

// The ordered UserAsset ids backing the image layers — the remix's `asset_ids`.
export function assetIdsFromLayers(layers: EditorLayer[]): string[] {
  return layers
    .filter((layer): layer is ImageLayer => layer.kind === "image" && Boolean(layer.assetId))
    .map((layer) => layer.assetId as string);
}

// The `RemixEditorAsset[]` backing the image layers, rebuilt purely from what's
// on each layer (assetId + assetUrl). Used to reconstruct a local (no-backend-
// row) remix's attachment list straight from its persisted state, mirroring
// what a real backend remix's `assets` field carries.
export function assetsFromLayers(layers: EditorLayer[]): RemixEditorAsset[] {
  return layers
    .filter(
      (layer): layer is ImageLayer =>
        layer.kind === "image" && Boolean(layer.assetId && layer.assetUrl),
    )
    .map((layer, order) => ({
      asset_id: layer.assetId as string,
      url: layer.assetUrl as string,
      order,
    }));
}

// Build the editor state to persist for a remix. Caption/overview default to the
// current header/description text so the remix card + agents have a flat caption.
export function remixStateFromLayers(
  layers: EditorLayer[],
  extras?: { caption?: string; cityOverview?: string; aspectRatio?: string },
): RemixEditorState {
  const header = layers.find((layer) => layer.kind === "header") as TextLayer | undefined;
  const description = layers.find((layer) => layer.kind === "description") as TextLayer | undefined;
  return {
    version: 1,
    caption: extras?.caption ?? header?.text,
    city_overview: extras?.cityOverview ?? description?.text,
    aspect_ratio: extras?.aspectRatio,
    layers: serializeRemixLayers(layers),
  };
}

// Merge in any template layers missing from a persisted layer set (draft or
// remix) — e.g. the Porto country eyebrow added after some remixes were saved —
// inserted at their template position so older saves still show and can edit
// them. Rendering keys off layer id, so position only affects control order.
export function backfillTemplateLayers(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
): EditorLayer[] {
  const presentIds = new Set(layers.map((layer) => layer.id));
  const missing = cloneLayers(template).filter(
    (layer) =>
      !presentIds.has(layer.id) &&
      // Verticals strips are user-add/removable, so a saved set with fewer
      // photos than the template is intentional — don't resurrect them.
      !(template.layout === "verticals" && layer.kind === "image"),
  );
  if (missing.length === 0) return layers;
  const templateOrder = template.layers.map((layer) => layer.id);
  const rank = (id: string) => {
    const index = templateOrder.indexOf(id);
    // Layers not in the template (shouldn't happen) keep their relative order at
    // the end rather than jumping to the front.
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return [...layers, ...missing].sort((a, b) => rank(a.id) - rank(b.id));
}

// Reconstruct the editor's working layers for a saved remix: prefer the saved
// layer set (re-resolving each image src from its attached asset), else seed the
// template defaults with the remix's caption/overview + attached images in order.
// Image srcs returned here may be cross-origin; callers should pass them through
// `resolveCleanImageSrc` before export.
export function layersFromRemix(
  template: RemixEditorTemplate,
  remix: { state?: RemixEditorState | null; assets: RemixEditorAsset[] },
): EditorLayer[] {
  const assetUrlById = new Map(remix.assets.map((asset) => [asset.asset_id, asset.url]));
  const saved = remix.state?.layers;

  if (saved && saved.length > 0) {
    const restored = saved.map((layer) => {
      if (layer.kind !== "image") return { ...layer };
      const resolved = layer.assetId ? assetUrlById.get(layer.assetId) : undefined;
      return {
        ...layer,
        transform: layer.transform ? { ...layer.transform } : undefined,
        src: resolved ?? layer.src,
      };
    });
    return backfillTemplateLayers(template, restored);
  }

  const orderedAssets = [...remix.assets].sort((a, b) => a.order - b.order);
  let imageCursor = 0;
  return cloneLayers(template).map((layer) => {
    if (layer.kind === "image") {
      const asset = orderedAssets[imageCursor++];
      return asset ? { ...layer, assetId: asset.asset_id, src: asset.url } : layer;
    }
    if (layer.kind === "header" && remix.state?.caption?.trim()) {
      return { ...layer, text: remix.state.caption.trim() };
    }
    if (layer.kind === "description" && remix.state?.city_overview?.trim()) {
      return { ...layer, text: remix.state.city_overview.trim() };
    }
    return layer;
  });
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

// ── Relax trio geometry ──────────────────────────────────────────────────────
// Rounded photo panels stacked with a soft gap; caption + subcaption ride the
// middle panel, left-aligned. All fractions are of the canvas *width* so they
// match the render engine's CSS pixels at the 1080px reference (gap: 26px,
// radius: 38px). The preview/export convert the gap to a height fraction.
export const RELAX_LAYOUT = {
  gap: 26 / 1080,
  radius: 38 / 1080,
  caption: {
    left: 68 / 1080,
    maxWidth: 0.46,
    headline: { size: 60 / 1080, lineHeight: 1 },
    sub: { size: 21 / 1080, lineHeight: 1.5, gap: 16 / 1080 },
  },
} as const;

// ── FRANKOF cover geometry ───────────────────────────────────────────────────
// Full-bleed photo with a large uppercase headline (and optional subtitle) over a
// scrim, mirroring template_frankof.v2.html's full-bleed slides (2, 4, 9). The
// text block is anchored to one edge (`edge`, fraction of height) — bottom for
// slides 2/9, top for slide 4 — so it grows away from that edge. `padX`/`padRight`
// and font sizes are fractions of the canvas *width* to match the CSS pixels at
// the 1080px reference. The preview and export share this so both position
// identically. Geometry differs per slide, so templates resolve theirs via
// `coverGeometry(template.id)`, falling back to the slide-9 default below.
export interface CoverGeometry {
  padX: number;
  padRight: number;
  // Which edge the text block hugs; it expands toward the opposite edge.
  anchor: "top" | "bottom";
  // Distance of the block from the anchored edge, as a fraction of height.
  edge: number;
  headline: { size: number; lineHeight: number };
  // Optional subtitle rendered below the headline (slide 4).
  subtitle?: { size: number; lineHeight: number; gap: number; maxWidth: number };
  // Vertical (180deg) scrim so the text stays legible over any photo. `from`/`to`
  // are gradient positions (fraction of height, ascending) and the opacities are
  // that gradient's endpoints. A bottom scrim darkens downward
  // (fromOpacity 0 → toOpacity); a top scrim darkens upward (fromOpacity → 0).
  scrim: { color: string; from: number; to: number; fromOpacity: number; toOpacity: number };
}

// Slide 9 — the default cover geometry (full-bleed photo, headline bottom-left).
export const COVER_LAYOUT: CoverGeometry = {
  padX: 88 / 1080,
  padRight: 110 / 1080,
  anchor: "bottom",
  edge: 104 / 1350,
  headline: { size: 80 / 1080, lineHeight: 0.96 },
  scrim: { color: "15, 14, 12", from: 0.4, to: 1, fromOpacity: 0, toOpacity: 0.7 },
};

// Per-slide overrides. Slides 2 and 4 reuse the cover renderer with their own
// geometry from template_frankof.v2.html's `.s2` / `.s4`.
export const COVER_VARIANTS: Record<string, CoverGeometry> = {
  // Slide 2 — full-bleed interior, white headline bottom-left (font 70px, a
  // lighter, higher-starting scrim than slide 9).
  "13000000-0000-0000-0000-000000000102": {
    padX: 88 / 1080,
    padRight: 120 / 1080,
    anchor: "bottom",
    edge: 110 / 1350,
    headline: { size: 70 / 1080, lineHeight: 1.04 },
    scrim: { color: "15, 14, 12", from: 0.45, to: 1, fromOpacity: 0, toOpacity: 0.62 },
  },
  // Slide 4 — full-bleed photo, white headline + subtitle top-left over a top
  // scrim that fades out by ~46% height.
  "13000000-0000-0000-0000-000000000104": {
    padX: 88 / 1080,
    padRight: 140 / 1080,
    anchor: "top",
    edge: 96 / 1350,
    headline: { size: 66 / 1080, lineHeight: 1.04 },
    subtitle: { size: 30 / 1080, lineHeight: 1.5, gap: 28 / 1080, maxWidth: 560 / 1080 },
    scrim: { color: "15, 14, 12", from: 0, to: 0.46, fromOpacity: 0.5, toOpacity: 0 },
  },
};

export function coverGeometry(templateId: string): CoverGeometry {
  return COVER_VARIANTS[templateId] ?? COVER_LAYOUT;
}

// ── FRANKOF editorial paper geometry ─────────────────────────────────────────
// The paper-background slides that stack, top to bottom: an uppercase headline,
// a flexible photo (fills the remaining space, `contain` for the product shot or
// `cover` for a full frame), and an optional footer (a caption + a decorative
// arrow disc). Mirrors `template_frankof.v2.html`'s `.s1` (concept), `.s6`
// (showcase) and `.s8` (feature). Horizontal measures and font sizes are
// fractions of the canvas *width*; vertical paddings/gaps are fractions of
// *height* (the 1080×1350 reference). The preview lays this out with flexbox and
// the export computes the same boxes so the download matches. Templates resolve
// their geometry via `editorialGeometry(template.id)`.
export interface EditorialGeometry {
  padX: number;
  padTop: number;
  padBottom: number;
  headline: { size: number; lineHeight: number; gap: number };
  // `bleed` extends the photo to the canvas' left/right/bottom edges (only the
  // headline keeps the side padding), as in slide 6's full-frame `.big`.
  media: { fit: "cover" | "contain"; gapBottom: number; bleed?: boolean };
  // Optional bottom row: a caption (the `description` layer) on the left and a
  // decorative arrow disc on the right. `maxWidth` bounds the caption (width
  // fraction); `arrow` toggles the disc.
  footer?: { size: number; lineHeight: number; maxWidth: number; arrow: boolean };
}

// The decorative arrow disc's diameter as a fraction of the canvas width (96px at
// the 1080 reference) — shared by the preview and export.
export const EDITORIAL_ARROW = 96 / 1080;

export const EDITORIAL_VARIANTS: Record<string, EditorialGeometry> = {
  // Slide 1 — concept: headline top, product centred on paper (contain), footer
  // caption + arrow.
  "13000000-0000-0000-0000-000000000101": {
    padX: 88 / 1080,
    padTop: 100 / 1350,
    padBottom: 92 / 1350,
    headline: { size: 70 / 1080, lineHeight: 1.04, gap: 30 / 1350 },
    media: { fit: "contain", gapBottom: 36 / 1350 },
    footer: { size: 27 / 1080, lineHeight: 1.3, maxWidth: 640 / 1080, arrow: true },
  },
  // Slide 6 — showcase: headline top, large photo fills to the bottom edge (cover,
  // no footer).
  "13000000-0000-0000-0000-000000000106": {
    padX: 88 / 1080,
    padTop: 104 / 1350,
    padBottom: 0,
    headline: { size: 70 / 1080, lineHeight: 1.04, gap: 56 / 1350 },
    media: { fit: "cover", gapBottom: 0, bleed: true },
  },
  // Slide 8 — feature: headline top, framed photo (cover), footer caption + arrow.
  "13000000-0000-0000-0000-000000000108": {
    padX: 88 / 1080,
    padTop: 100 / 1350,
    padBottom: 92 / 1350,
    headline: { size: 70 / 1080, lineHeight: 1.04, gap: 40 / 1350 },
    media: { fit: "cover", gapBottom: 40 / 1350 },
    footer: { size: 27 / 1080, lineHeight: 1.6, maxWidth: 640 / 1080, arrow: true },
  },
};

export function editorialGeometry(templateId: string): EditorialGeometry {
  return (
    EDITORIAL_VARIANTS[templateId] ?? EDITORIAL_VARIANTS["13000000-0000-0000-0000-000000000101"]
  );
}

// ── FRANKOF collage geometry ─────────────────────────────────────────────────
// The paper multi-photo slides: slide 3 (reviews — headline + thumb, then a wide
// photo over a two-photo pair), slide 5 (design-for-life — headline + wordmark,
// body + product card, then a two-photo pair) and slide 7 (trends — headline +
// wordmark, subtitle, then an asymmetric two-photo pair). Mirrors
// `template_frankof.v2.html`'s `.s3`/`.s5`/`.s7`. Every measure is a fraction of
// the canvas *width* (each CSS pixel is absolute at the 1080 reference, so
// px/1080 works for both the width-based `cqi` preview units and the export's
// pixel width). `fr` values are unitless grid ratios. The preview lays these out
// with fl/grid boxes and the export computes the same boxes.
export const COLLAGE_LAYOUT = {
  padX: 88 / 1080,
  gap: 24 / 1080,
  // The brand wordmark (an editable `eyebrow` layer) sits top-right on slides 5/7.
  wordmark: { size: 32 / 1080, tracking: 0.06, lineHeight: 1 },
  // An optional brand logo image occupies the same top-right slot as the wordmark
  // (and takes precedence over it when shown). Contained within this box, right-aligned.
  logo: { height: 52 / 1080, maxWidth: 240 / 1080 },
  s3: {
    padTop: 96 / 1080,
    padBottom: 88 / 1080,
    headline: 62 / 1080,
    headGap: 40 / 1080,
    thumbW: 300 / 1080,
    thumbH: 214 / 1080,
    gridTop: 42 / 1080,
    rows: [1.18, 1] as const, // top (wide) : bottom (pair)
    pairCols: [1, 1.25] as const,
  },
  s5: {
    padTop: 96 / 1080,
    padBottom: 88 / 1080,
    headline: 60 / 1080,
    headGap: 30 / 1080,
    midTop: 40 / 1080,
    midGap: 44 / 1080,
    body: { size: 28 / 1080, maxWidth: 540 / 1080, lineHeight: 1.6 },
    card: { w: 250 / 1080, h: 320 / 1080 },
    pairTop: 44 / 1080,
  },
  s7: {
    padTop: 100 / 1080,
    padBottom: 88 / 1080,
    headline: 64 / 1080,
    headGap: 30 / 1080,
    sub: { size: 30 / 1080, lineHeight: 1.5, top: 30 / 1080 },
    pairTop: 46 / 1080,
    cols: [1.62, 1] as const,
    secondHeight: 0.58, // right photo is 58% height, top-aligned
  },
} as const;

// Which collage slide a template renders (3, 5 or 7), from its id suffix.
export function collageSlide(templateId: string): 3 | 5 | 7 {
  if (templateId.endsWith("0105")) return 5;
  if (templateId.endsWith("0107")) return 7;
  return 3;
}

// ── Verticals geometry ───────────────────────────────────────────────────────
// Full-height photo strips of equal width; the title's letters are placed one
// per strip, each centred on its strip — so the number of letters tracks the
// number of images and a 5-letter word on 5 strips lands a letter on each,
// matching the Travel Inspiration Pin reference. `size` is a fraction of the
// canvas width. Letters beyond the strip count are dropped (the intended use is
// one letter per strip); shorter words simply leave the trailing strips
// letter-free.
export const VERTICALS_LAYOUT = {
  minStrips: 2,
  maxStrips: 7,
  title: { size: 0.1, lineHeight: 1 },
} as const;

// The title characters (whitespace collapsed to single spaces), used to place
// one glyph per strip in both the preview and the export.
export function verticalsTitleChars(text: string): string[] {
  return Array.from(text.replace(/\s+/g, " ").trim());
}

// ── Split editorial geometry ─────────────────────────────────────────────────
// A paper panel on the left and a full-height photo on the right (boundary at
// `splitX`, fraction of width). The giant headline is knocked out of the paper
// to reveal the photo behind it; its box is wide enough that big letters wrap a
// few per line (like the reference SOULKIN → SO / UL / KIN). The body block sits
// bottom-left over the paper. All fractions are of the canvas *width* except the
// vertical anchors (`top`/`bottom`), which are fractions of height.
export const SPLIT_LAYOUT = {
  splitX: 0.43,
  headline: { x: 0.055, top: 0.08, width: 0.46, size: 0.21, lineHeight: 1.12 },
  body: { x: 0.075, bottom: 0.06, width: 0.34, size: 0.03, lineHeight: 1.4 },
} as const;

// The split headline's base size (`SPLIT_LAYOUT.headline.size`) is tuned for the
// template's default face (Archivo Black). When a *different* font is applied —
// e.g. an optional brand font from the composer's Fonts card — its glyph widths
// differ, so at the same size a narrow face looks small and a wide one overflows
// the paper panel (wrapping one letter per line). This auto-fits the headline to
// the chosen font: it measures the (uppercased) text with both faces and scales
// the base size by their width ratio, keeping the same few-characters-per-line
// rhythm across fonts. Then applies the user's size override and clamps to a sane
// band. `canvasWidth` is the render width (pass 100 to get a `cqi` value for the
// DOM preview; the pixel width otherwise). Falls back to the plain base size when
// it can't measure (no DOM, empty text, or the font isn't loaded yet), so it is
// never a wrong guess — only a no-op.
const SPLIT_HEADLINE_BASE_FONT = "archivo";
export function splitHeadlineFontSize(header: TextLayer, canvasWidth: number): number {
  const style = resolveTextStyle(header);
  const base = SPLIT_LAYOUT.headline.size * canvasWidth;
  const fallback = base * style.sizeScale;
  if (header.fontId === SPLIT_HEADLINE_BASE_FONT) return fallback;

  const label = (header.uppercase ? header.text.toUpperCase() : header.text)
    .replace(/\s+/g, " ")
    .trim();
  const ctx = getMeasureCtx();
  if (!ctx || !label) return fallback;

  const baseFont = fontById(SPLIT_HEADLINE_BASE_FONT);
  const newFont = fontById(header.fontId);
  const ref = 100;
  ctx.letterSpacing = `${style.letterSpacing}em`;
  ctx.font = `${nearestWeight(baseFont, header.weight ?? 800)} ${ref}px ${baseFont.family}`;
  const widthBase = ctx.measureText(label).width;
  ctx.font = `${style.weight} ${ref}px ${newFont.family}`;
  const widthNew = ctx.measureText(label).width;
  ctx.letterSpacing = "0px"; // reset the shared measuring context
  if (!widthBase || !widthNew) return fallback;

  const scaled = base * (widthBase / widthNew) * style.sizeScale;
  // Keep within a sane band of the base so an extreme face can't blow up or vanish.
  return Math.min(base * 1.8 * style.sizeScale, Math.max(base * 0.6 * style.sizeScale, scaled));
}

// Measured from public/templates/shared/porto-poster.jpg (736 x 1308) and
// expressed as canvas fractions so the DOM preview and export share the same
// geometry.
export const PORTO_LAYOUT = {
  card: { x: 50 / 736, y: 231 / 1308, w: 654 / 736, h: 844 / 1308 },
  photo: { x: 106 / 736, y: 353 / 1308, w: 541 / 736, h: 686 / 1308 },
  // The white band painted over the top of the photo. Taller than the raw
  // reference so the visible square starts lower and the width-filled caption
  // overlaps it less (its lower part lands on this white band, not the photo).
  headlineCover: { x: 106 / 736, y: 353 / 1308, w: 541 / 736, h: 180 / 1308 },
  eyebrow: { x: 98 / 736, y: 271 / 1308, size: 32 / 1080 },
  overview: { x: 415 / 736, y: 256 / 1308, w: 229 / 736, size: 18 / 1080, lineHeight: 1.18 },
  // The caption hangs from `y` (its top sits just below the eyebrow/overview
  // row) and grows downward, so a tall width-filled word drops its lower part
  // over the photo top — matching the Porto reference. See PortoPreview / export.
  headline: { x: 98 / 736, y: 351 / 1308, w: 560 / 736, size: 208 / 1080, lineHeight: 0.82 },
} as const;

// The Porto caption's letter tracking (em). Shared by the SVG preview and the
// canvas export so the measured width used to size the caption matches what's
// actually drawn.
export const PORTO_CAPTION_TRACKING = -0.035;

// Porto card interior layout — mirrored by `PortoPreview` (flexbox) and
// `exportPorto` (canvas) so the download matches the editor. The card holds three
// full-width rows: (1) eyebrow left + overview right, (2) the city name knocked
// out of a white band that reveals the photo behind it, (3) the square photo.
// Paddings/gaps are fractions of the poster *width* (the preview uses cqi = % of
// width); `nameBand`/`nameOverlap` are multiples of the fitted name font size.
export const PORTO_CARD = {
  padX: 56 / 736, // side padding → inner width equals the photo width
  padTop: 40 / 1308 / (9 / 16), // card top → eyebrow, expressed width-relative
  padBottom: 36 / 1308 / (9 / 16), // photo bottom → card bottom, width-relative
  rowGap: 0.025, // gap between the header row and the name band
  overviewMaxWidth: 0.46, // overview column width, fraction of the inner width
  nameFill: 1, // the city name spans the full inner width
  nameBand: 0.8, // white name-band height, as a multiple of the name font size
  nameOverlap: 0.02, // name baseline drop into the square, multiple of font size
} as const;

// The caption spans the poster's inner image width, so short words like "Porto"
// fill the frame at a large size while long ones shrink to fit — instead of a
// single hardcoded size that only looked right for one word. We measure the
// label (with the caption's real font + tracking) and return the px font-size
// whose rendered width equals the headline box, then apply the user's size
// slider and clamp to a sane range. `canvasWidth` is the render width (1080 for
// the SVG preview's viewBox; the export's pixel width otherwise). Falls back to
// the layout default when it can't measure (no DOM, empty text, or unloaded
// font), so it is never a wrong guess — only a no-op fallback.
export function portoCaptionFontSize(caption: TextLayer, canvasWidth: number): number {
  const font = fontById(caption.fontId);
  const style = resolveTextStyle(caption);
  const label = (caption.uppercase ? caption.text.toUpperCase() : caption.text).trim();
  const target = PORTO_LAYOUT.headline.w * canvasWidth;
  const fallback = PORTO_LAYOUT.headline.size * canvasWidth;

  const ctx = getMeasureCtx();
  let fitted = fallback;
  if (ctx && label && target > 0) {
    const ref = 100;
    ctx.font = `${style.weight} ${ref}px ${font.family}`;
    ctx.letterSpacing = `${PORTO_CAPTION_TRACKING}em`;
    const width = ctx.measureText(label).width;
    ctx.letterSpacing = "0px"; // reset the shared measuring context
    if (width > 0) fitted = (target / width) * ref;
  }

  const size = fitted * style.sizeScale;
  // Keep within a reasonable band relative to the canvas (a 1–2 char word
  // shouldn't explode; a very long one shouldn't vanish).
  return Math.min(0.5 * canvasWidth, Math.max(0.07 * canvasWidth, size));
}

// ── Sliced-type geometry ─────────────────────────────────────────────────────
// The SUNDAY poster: a single photo fills the left column as a solid block that
// transitions, on its right edge, into a giant word (the caption) set one big
// letter per horizontal band. The photo runs continuous from the left margin
// up to and including each letter — the letter's counters (holes) and the paper
// to its right are what carve the letterform out of the picture — so the image
// reads as one sliced photograph, not isolated photo-filled letters. Bands are
// separated by a hairline paper gap. A right-hand column carries the date
// (stacked characters), a wrapped quote and the year (stacked characters).
// Measured from public/templates/shared/sunday.jpg (674 × 898) and expressed as
// canvas fractions so the SVG preview and the canvas export share the geometry.
export const SLICED_LAYOUT = {
  // The letter/photo box (left column). Photo cover-fits this box; the caption
  // letters are right-aligned to its right edge and the block fills the rest.
  box: { x: 50 / 674, top: 67 / 898, bottom: 829 / 898, width: 0.72 },
  // Each letter's width as a multiple of its band height — the letters sit on
  // the right of the box at roughly this aspect (the photo block fills the space
  // to their left), matching the reference proportions.
  letterAspect: 1.32,
  // Paper hairline between letter bands, as a fraction of height (≈2px at the
  // 1440px export height, matching the reference's 1–2px separators).
  gap: 2 / 1440,
  // Archivo Black cap-height / em — the fallback letter fit used only when a
  // browser can't report glyph ink metrics (letters are clipped to their band).
  capRatio: 0.72,
  // Right-hand text column.
  right: {
    // Right-aligned anchor for the quote / stacked-character blocks.
    edge: 619 / 674,
    center: 596 / 674,
    date: { top: 74 / 898, size: 0.032, lineHeight: 1.32 },
    quote: { centerY: 582 / 898, size: 0.034, lineHeight: 1.42, width: 0.16 },
    year: { bottom: 823 / 898, size: 0.032, lineHeight: 1.32 },
  },
} as const;

// The caption characters that become letter bands (whitespace dropped), used to
// place one glyph per band in both the preview and the export. The slice count
// equals the character count.
export function slicedChars(text: string): string[] {
  return Array.from((text ?? "").replace(/\s+/g, "").trim());
}

export interface SlicedBand {
  y: number;
  h: number;
}

export interface SlicedGeometry {
  x: number;
  top: number;
  w: number;
  boxH: number;
  gap: number;
  bandH: number;
  bands: SlicedBand[];
}

// The measured ink box of a single glyph at a 100px reference size — used to
// stretch each sliced letter so its ink exactly fills its band (full slice
// width AND height, as in the reference), regardless of the chosen font family.
// `left`/`ascent` are offsets from the draw origin (alphabetic baseline, x=0)
// to the ink box's left/top edge. Returns null when it can't measure (no DOM,
// a whitespace glyph, or a browser without actualBoundingBox metrics) — the
// caller falls back to an approximate cap-height fit.
export interface SlicedGlyphMetrics {
  refSize: number;
  inkW: number;
  inkH: number;
  left: number;
  ascent: number;
}

export function slicedGlyphMetrics(
  char: string,
  fontId: string,
  weight: number,
): SlicedGlyphMetrics | null {
  const ctx = getMeasureCtx();
  if (!ctx || !char.trim()) return null;
  const font = fontById(fontId);
  const refSize = 100;
  ctx.font = `${weight} ${refSize}px ${font.family}`;
  const m = ctx.measureText(char);
  if (
    m.actualBoundingBoxLeft === undefined ||
    m.actualBoundingBoxRight === undefined ||
    m.actualBoundingBoxAscent === undefined ||
    m.actualBoundingBoxDescent === undefined
  ) {
    return null;
  }
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  if (inkW <= 0 || inkH <= 0) return null;
  return { refSize, inkW, inkH, left: m.actualBoundingBoxLeft, ascent: m.actualBoundingBoxAscent };
}

// The letter-box and per-band rectangles for `count` characters, in the target
// canvas units (`width`/`height` in px, or 100/`100/ratio` for a cqi/viewBox
// preview). Shared by the SVG preview and the canvas export so both slice the
// photo identically.
export function slicedGeometry(count: number, width: number, height: number): SlicedGeometry {
  const x = SLICED_LAYOUT.box.x * width;
  const top = SLICED_LAYOUT.box.top * height;
  const w = SLICED_LAYOUT.box.width * width;
  const boxH = (SLICED_LAYOUT.box.bottom - SLICED_LAYOUT.box.top) * height;
  const n = Math.max(count, 1);
  const gap = SLICED_LAYOUT.gap * height;
  const bandH = (boxH - gap * (n - 1)) / n;
  const bands = Array.from({ length: n }, (_, i) => ({ y: top + i * (bandH + gap), h: bandH }));
  return { x, top, w, boxH, gap, bandH, bands };
}

// ── This-or-That (duel) geometry ─────────────────────────────────────────────
// Two full-height vertical photos butted along `splitX` (fraction of width). A
// stacked serif caption sits at the header's `posY`; each word is its own line
// and short connector words (≤2 chars, e.g. "or") render smaller — reproducing
// the "this / or / that" rhythm. A white poll card (one rounded row per visible
// option) floats over the photos, and an optional brand wordmark hugs the
// bottom. Horizontal measures and font sizes are fractions of the canvas
// *width*; vertical anchors are fractions of *height*. Shared by the DOM preview
// (DuelPreview) and the canvas export (exportDuel) so both position identically.
export const DUEL_LAYOUT = {
  splitX: 0.5,
  headline: { size: 0.17, lineHeight: 0.98, connectorScale: 0.52, padX: 0.06 },
  poll: {
    centerY: 0.7, // vertical center of the card (fraction of height)
    width: 0.82, // card width (fraction of width)
    padX: 0.03, // card inner horizontal padding
    padY: 0.028, // card inner vertical padding
    radius: 0.055, // card corner radius
    rowHeight: 0.11, // each option row height
    rowGap: 0.02, // gap between rows
    rowRadius: 0.032, // row corner radius
    rowPadX: 0.038, // label inset within a row
    labelSize: 0.04, // option label font size
    cardColor: "#ffffff",
    rowColor: "#efefef",
  },
  wordmark: { bottom: 0.05, size: 0.05, lineHeight: 1 },
} as const;

// A caption word is a "connector" (rendered smaller on its own line, like "or"
// between "this" and "that") when it's very short. Punctuation is ignored.
export function duelIsConnector(word: string): boolean {
  return word.replace(/[^\p{L}]/gu, "").length <= 2;
}

// The caption split into words (whitespace collapsed), each flagged as a
// connector. One word per line in both the preview and the export.
export function duelCaptionWords(text: string): { word: string; connector: boolean }[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => ({ word, connector: duelIsConnector(word) }));
}

// The caption's display case. Lowercase by default (the signature look); the
// header's uppercase toggle flips it to caps.
export function duelDisplayCase(text: string, uppercase: boolean): string {
  return uppercase ? text.toUpperCase() : text.toLowerCase();
}

// The visible poll option layers (left then right), in row order. An empty list
// means the poll card is hidden entirely.
export function duelVisibleOptions(layers: EditorLayer[]): TextLayer[] {
  return (["option-left", "option-right"] as const)
    .map((id) => layers.find((layer) => layer.id === id))
    .filter((layer): layer is TextLayer =>
      Boolean(layer && layer.visible && layer.kind !== "image" && layer.kind !== "logo"),
    );
}

export interface DuelPollGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
  rows: { y: number; h: number }[];
}

// The poll card rectangle and its per-row rectangles for `count` visible
// options, in target canvas units (px, or 100 / 100·ratio for a cqi/viewBox
// preview). Returns null when there are no visible options. Shared by the
// preview and export so the card lands identically in both.
export function duelPollGeometry(
  count: number,
  width: number,
  height: number,
): DuelPollGeometry | null {
  if (count <= 0) return null;
  const p = DUEL_LAYOUT.poll;
  const w = p.width * width;
  const rowH = p.rowHeight * width;
  const gap = p.rowGap * width;
  const padX = p.padX * width;
  const padY = p.padY * width;
  const innerH = count * rowH + (count - 1) * gap;
  const h = innerH + 2 * padY;
  const x = (width - w) / 2;
  const y = p.centerY * height - h / 2;
  const rows = Array.from({ length: count }, (_, i) => ({
    y: y + padY + i * (rowH + gap),
    h: rowH,
  }));
  return { x, y, w, h, rows };
}

// ── Business Edition "This or that?" geometry ───────────────────────────────
// Measured from the 1200 × 1500 reference image. A cream canvas carries a
// fixed mixed-type headline, two overlapping rounded photo panels, two optional
// rounded pill labels and optional small text at top/bottom. Horizontal
// measures and type sizes are fractions of canvas width; vertical measures are
// fractions of canvas height unless noted.
export const BUSINESS_CHOICE_LAYOUT = {
  colors: {
    defaultText: "#444444",
    quietText: "#333333",
    pillFill: "#fff9ba",
    pillBorder: "#4b4b46",
  },
  headline: {
    thisText: "This",
    orText: "or",
    thatText: "that?",
    thisFont: "anton",
    orFont: "poppins",
    thatFont: "playfair",
    thisLeft: 68 / 1200,
    thisTop: 185 / 1500,
    thisSize: 0.245,
    orLeft: 565 / 1200,
    orTop: 289 / 1500,
    orSize: 0.055,
    thatLeft: 600 / 1200,
    thatTop: 190 / 1500,
    thatSize: 0.205,
  },
  handle: {
    centerX: 0.5,
    top: 77 / 1500,
    size: 0.024,
    lineHeight: 1,
  },
  photos: [
    {
      id: "photo-1",
      x: 79 / 1200,
      y: 557 / 1500,
      w: 491 / 1200,
      h: 523 / 1500,
      radius: 12 / 1200,
    },
    {
      id: "photo-2",
      x: 596 / 1200,
      y: 682 / 1500,
      w: 524 / 1200,
      h: 539 / 1500,
      radius: 12 / 1200,
    },
  ],
  pills: {
    business: {
      x: 511 / 1200,
      y: 582 / 1500,
      w: 421 / 1200,
      h: 76 / 1500,
    },
    edition: {
      x: 224 / 1200,
      y: 1114 / 1500,
      w: 422 / 1200,
      h: 76 / 1500,
    },
    radius: 17 / 1200,
    border: 2.5 / 1200,
    labelSize: 0.027,
  },
  bottom: {
    centerX: 0.5,
    top: 1387 / 1500,
    width: 0.72,
    size: 0.03,
    lineHeight: 1.1,
  },
} as const;

function numericAspectRatio(aspectRatio: string): number {
  const [w, h] = aspectRatio.split("/").map((part) => Number(part.trim()));
  if (!w || !h) return 4 / 5;
  return w / h;
}

export function businessChoiceGeometry(aspectRatio: string) {
  const baseRatio = 4 / 5;
  const targetRatio = numericAspectRatio(aspectRatio);
  const baseHeight = 1 / baseRatio;
  const targetHeight = 1 / targetRatio;
  const fitToHeight = targetRatio > baseRatio;
  const scale = fitToHeight ? targetHeight / baseHeight : 1;
  const xOffset = fitToHeight ? (1 - scale) / 2 : 0;
  const yOffset = fitToHeight ? 0 : (targetHeight - baseHeight * scale) / 2;

  const x = (value: number) => xOffset + value * scale;
  const w = (value: number) => value * scale;
  const y = (value: number) => (yOffset + value * baseHeight * scale) / targetHeight;
  const h = (value: number) => (value * baseHeight * scale) / targetHeight;
  const s = (value: number) => value * scale;

  return {
    sizeScale: scale,
    headline: {
      thisLeft: x(BUSINESS_CHOICE_LAYOUT.headline.thisLeft),
      thisTop: y(BUSINESS_CHOICE_LAYOUT.headline.thisTop),
      thisSize: s(BUSINESS_CHOICE_LAYOUT.headline.thisSize),
      orLeft: x(BUSINESS_CHOICE_LAYOUT.headline.orLeft),
      orTop: y(BUSINESS_CHOICE_LAYOUT.headline.orTop),
      orSize: s(BUSINESS_CHOICE_LAYOUT.headline.orSize),
      thatLeft: x(BUSINESS_CHOICE_LAYOUT.headline.thatLeft),
      thatTop: y(BUSINESS_CHOICE_LAYOUT.headline.thatTop),
      thatSize: s(BUSINESS_CHOICE_LAYOUT.headline.thatSize),
    },
    handle: {
      centerX: x(BUSINESS_CHOICE_LAYOUT.handle.centerX),
      top: y(BUSINESS_CHOICE_LAYOUT.handle.top),
      size: s(BUSINESS_CHOICE_LAYOUT.handle.size),
    },
    photos: BUSINESS_CHOICE_LAYOUT.photos.map((photo) => ({
      id: photo.id,
      x: x(photo.x),
      y: y(photo.y),
      w: w(photo.w),
      h: h(photo.h),
      radius: s(photo.radius),
    })),
    pills: {
      business: {
        x: x(BUSINESS_CHOICE_LAYOUT.pills.business.x),
        y: y(BUSINESS_CHOICE_LAYOUT.pills.business.y),
        w: w(BUSINESS_CHOICE_LAYOUT.pills.business.w),
        h: h(BUSINESS_CHOICE_LAYOUT.pills.business.h),
      },
      edition: {
        x: x(BUSINESS_CHOICE_LAYOUT.pills.edition.x),
        y: y(BUSINESS_CHOICE_LAYOUT.pills.edition.y),
        w: w(BUSINESS_CHOICE_LAYOUT.pills.edition.w),
        h: h(BUSINESS_CHOICE_LAYOUT.pills.edition.h),
      },
      radius: s(BUSINESS_CHOICE_LAYOUT.pills.radius),
      border: s(BUSINESS_CHOICE_LAYOUT.pills.border),
      labelSize: s(BUSINESS_CHOICE_LAYOUT.pills.labelSize),
    },
    bottom: {
      centerX: x(BUSINESS_CHOICE_LAYOUT.bottom.centerX),
      top: y(BUSINESS_CHOICE_LAYOUT.bottom.top),
      width: w(BUSINESS_CHOICE_LAYOUT.bottom.width),
      size: s(BUSINESS_CHOICE_LAYOUT.bottom.size),
    },
  };
}

function sameHexColor(a: string | undefined, b: string): boolean {
  const normalize = (value: string | undefined) => value?.trim().toLowerCase();
  return normalize(a) === normalize(b);
}

export function businessChoiceAccent(layers: EditorLayer[]): string | null {
  const business = layers.find((layer): layer is TextLayer => layer.id === "header");
  if (!business || sameHexColor(business.color, BUSINESS_CHOICE_LAYOUT.colors.defaultText)) {
    return null;
  }
  return business.color;
}

export function businessChoiceBackground(
  template: Pick<RemixEditorTemplate, "background">,
  layers: EditorLayer[],
): string {
  return businessChoiceAccent(layers) ?? template.background;
}

export function businessChoicePillFill(layers: EditorLayer[]): string {
  return businessChoiceAccent(layers) ?? BUSINESS_CHOICE_LAYOUT.colors.pillFill;
}

export function businessChoicePillTextColor(layers: EditorLayer[]): string {
  const accent = businessChoiceAccent(layers);
  return accent ? readableTextColor(accent) : BUSINESS_CHOICE_LAYOUT.colors.defaultText;
}

export function businessChoiceHeadlineFontIds(layers: EditorLayer[]): {
  thisFontId: string;
  orFontId: string;
  thatFontId: string;
} {
  const business = layers.find((layer): layer is TextLayer => layer.id === "header");
  const customFontId =
    business && business.fontId !== "montserrat" && business.fontId.trim() ? business.fontId : null;
  return {
    thisFontId: customFontId ?? BUSINESS_CHOICE_LAYOUT.headline.thisFont,
    orFontId: customFontId ?? BUSINESS_CHOICE_LAYOUT.headline.orFont,
    thatFontId: customFontId ?? BUSINESS_CHOICE_LAYOUT.headline.thatFont,
  };
}

// ── Olivia Testimonial geometry ──────────────────────────────────────────────
// Measured from the 1200 × 1200 reference. The avatar image doubles as a blurred
// full-canvas backdrop and the circular portrait clipped above the white card.
export const TESTIMONIAL_LAYOUT = {
  colors: {
    card: "#fffdf9",
    text: "#665748",
    star: "#b08b68",
    glow: "rgba(255,255,255,0.34)",
    warmWash: "rgba(224,174,126,0.44)",
    shadow: "rgba(58,43,31,0.24)",
  },
  backdrop: {
    blur: 28 / 1200,
    scale: 1.2,
  },
  card: {
    x: 200 / 1200,
    y: 313 / 1200,
    w: 800 / 1200,
    h: 643 / 1200,
    radius: 54 / 1200,
    shadowBlur: 30 / 1200,
    shadowY: 26 / 1200,
  },
  avatar: {
    centerX: 0.5,
    top: 218 / 1200,
    size: 200 / 1200,
  },
  header: {
    centerX: 0.5,
    top: 423 / 1200,
    width: 0.66,
    size: 0.026,
    lineHeight: 1.18,
  },
  stars: {
    centerX: 0.5,
    centerY: 476 / 1200,
    size: 0.043,
    gap: 0.06,
  },
  testimonial: {
    centerX: 0.5,
    top: 535 / 1200,
    width: 0.67,
    size: 0.032,
    lineHeight: 1.52,
  },
  author: {
    centerX: 0.5,
    top: 881 / 1200,
    width: 0.6,
    size: 0.036,
    lineHeight: 1.05,
  },
} as const;

export function testimonialGeometry(aspectRatio: string) {
  const baseRatio = 1;
  const targetRatio = numericAspectRatio(aspectRatio);
  const baseHeight = 1 / baseRatio;
  const targetHeight = 1 / targetRatio;
  const fitToHeight = targetRatio > baseRatio;
  const scale = fitToHeight ? targetHeight / baseHeight : 1;
  const xOffset = fitToHeight ? (1 - scale) / 2 : 0;
  const yOffset = fitToHeight ? 0 : (targetHeight - baseHeight * scale) / 2;

  const x = (value: number) => xOffset + value * scale;
  const w = (value: number) => value * scale;
  const y = (value: number) => (yOffset + value * baseHeight * scale) / targetHeight;
  const h = (value: number) => (value * baseHeight * scale) / targetHeight;
  const s = (value: number) => value * scale;

  return {
    sizeScale: scale,
    card: {
      x: x(TESTIMONIAL_LAYOUT.card.x),
      y: y(TESTIMONIAL_LAYOUT.card.y),
      w: w(TESTIMONIAL_LAYOUT.card.w),
      h: h(TESTIMONIAL_LAYOUT.card.h),
      radius: s(TESTIMONIAL_LAYOUT.card.radius),
      shadowBlur: s(TESTIMONIAL_LAYOUT.card.shadowBlur),
      shadowY: s(TESTIMONIAL_LAYOUT.card.shadowY),
    },
    avatar: {
      centerX: x(TESTIMONIAL_LAYOUT.avatar.centerX),
      top: y(TESTIMONIAL_LAYOUT.avatar.top),
      size: s(TESTIMONIAL_LAYOUT.avatar.size),
    },
    header: {
      centerX: x(TESTIMONIAL_LAYOUT.header.centerX),
      top: y(TESTIMONIAL_LAYOUT.header.top),
      width: w(TESTIMONIAL_LAYOUT.header.width),
      size: s(TESTIMONIAL_LAYOUT.header.size),
    },
    stars: {
      centerX: x(TESTIMONIAL_LAYOUT.stars.centerX),
      centerY: y(TESTIMONIAL_LAYOUT.stars.centerY),
      size: s(TESTIMONIAL_LAYOUT.stars.size),
      gap: s(TESTIMONIAL_LAYOUT.stars.gap),
    },
    testimonial: {
      centerX: x(TESTIMONIAL_LAYOUT.testimonial.centerX),
      top: y(TESTIMONIAL_LAYOUT.testimonial.top),
      width: w(TESTIMONIAL_LAYOUT.testimonial.width),
      size: s(TESTIMONIAL_LAYOUT.testimonial.size),
    },
    author: {
      centerX: x(TESTIMONIAL_LAYOUT.author.centerX),
      top: y(TESTIMONIAL_LAYOUT.author.top),
      width: w(TESTIMONIAL_LAYOUT.author.width),
      size: s(TESTIMONIAL_LAYOUT.author.size),
    },
  };
}

// ── Claudia arced testimonial geometry ──────────────────────────────────────
// Measured from the 843 × 1500 reference. The whole design is preserved as a
// centered story poster when exporting to wider ratios such as 4:5 or 1:1.
export const TESTIMONIAL_ARC_LAYOUT = {
  base: {
    width: 843,
    height: 1500,
  },
  colors: {
    background: "#bda797",
    wash: "rgba(183,154,132,0.46)",
    card: "#ffffff",
    cardShadow: "rgba(94,76,61,0.11)",
    pillBorder: "#ad9a83",
    star: "#000000",
  },
  backdrop: {
    blur: 28 / 843,
    scale: 3.1,
    opacity: 0.28,
  },
  arc: {
    centerX: 0.5,
    centerY: 578 / 1500,
    radius: 260 / 843,
    size: 63 / 843,
    stepDeg: 10.4,
    lineHeight: 1,
  },
  avatar: {
    centerX: 0.5,
    top: 505 / 1500,
    size: 176 / 843,
    radius: 34 / 843,
  },
  card: {
    x: 126 / 843,
    y: 594 / 1500,
    w: 591 / 843,
    h: 474 / 1500,
    radius: 36 / 843,
  },
  sparkle: {
    fill: "#ffffff",
    shapes: [
      { x: 495 / 843, y: 482 / 1500, size: 42 / 843 },
      { x: 555 / 843, y: 492 / 1500, size: 17 / 843 },
      { x: 557 / 843, y: 558 / 1500, size: 30 / 843 },
      { x: 612 / 843, y: 575 / 1500, size: 22 / 843 },
    ],
  },
  testimonial: {
    centerX: 0.5,
    top: 750 / 1500,
    width: 520 / 843,
    size: 27 / 843,
    lineHeight: 1.32,
  },
  author: {
    centerX: 0.5,
    top: 902 / 1500,
    width: 480 / 843,
    size: 38 / 843,
    lineHeight: 1.08,
  },
  handle: {
    centerX: 0.5,
    top: 960 / 1500,
    width: 400 / 843,
    size: 19 / 843,
    lineHeight: 1.1,
  },
  stars: {
    centerX: 0.5,
    centerY: 1061 / 1500,
    pillW: 264 / 843,
    pillH: 68 / 1500,
    border: 3 / 843,
    size: 31 / 843,
    gap: 42 / 843,
  },
  website: {
    centerX: 0.5,
    top: 1234 / 1500,
    width: 0.78,
    size: 30 / 843,
    lineHeight: 1.08,
  },
} as const;

export function testimonialArcChars(text: string): string[] {
  return text.replace(/\s+/g, "").split("");
}

export function testimonialArcGeometry(aspectRatio: string) {
  const baseRatio = TESTIMONIAL_ARC_LAYOUT.base.width / TESTIMONIAL_ARC_LAYOUT.base.height;
  const targetRatio = numericAspectRatio(aspectRatio);
  const baseHeight = 1 / baseRatio;
  const targetHeight = 1 / targetRatio;
  const fitToHeight = targetRatio > baseRatio;
  const scale = fitToHeight ? targetHeight / baseHeight : 1;
  const xOffset = fitToHeight ? (1 - scale) / 2 : 0;
  const yOffset = fitToHeight ? 0 : (targetHeight - baseHeight * scale) / 2;

  const x = (value: number) => xOffset + value * scale;
  const w = (value: number) => value * scale;
  const y = (value: number) => (yOffset + value * baseHeight * scale) / targetHeight;
  const h = (value: number) => (value * baseHeight * scale) / targetHeight;
  const s = (value: number) => value * scale;

  return {
    sizeScale: scale,
    arc: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.arc.centerX),
      centerY: y(TESTIMONIAL_ARC_LAYOUT.arc.centerY),
      radius: s(TESTIMONIAL_ARC_LAYOUT.arc.radius),
      size: s(TESTIMONIAL_ARC_LAYOUT.arc.size),
      stepDeg: TESTIMONIAL_ARC_LAYOUT.arc.stepDeg,
    },
    avatar: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.avatar.centerX),
      top: y(TESTIMONIAL_ARC_LAYOUT.avatar.top),
      size: s(TESTIMONIAL_ARC_LAYOUT.avatar.size),
      radius: s(TESTIMONIAL_ARC_LAYOUT.avatar.radius),
    },
    card: {
      x: x(TESTIMONIAL_ARC_LAYOUT.card.x),
      y: y(TESTIMONIAL_ARC_LAYOUT.card.y),
      w: w(TESTIMONIAL_ARC_LAYOUT.card.w),
      h: h(TESTIMONIAL_ARC_LAYOUT.card.h),
      radius: s(TESTIMONIAL_ARC_LAYOUT.card.radius),
    },
    sparkles: TESTIMONIAL_ARC_LAYOUT.sparkle.shapes.map((shape) => ({
      x: x(shape.x),
      y: y(shape.y),
      size: s(shape.size),
    })),
    testimonial: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.testimonial.centerX),
      top: y(TESTIMONIAL_ARC_LAYOUT.testimonial.top),
      width: w(TESTIMONIAL_ARC_LAYOUT.testimonial.width),
      size: s(TESTIMONIAL_ARC_LAYOUT.testimonial.size),
    },
    author: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.author.centerX),
      top: y(TESTIMONIAL_ARC_LAYOUT.author.top),
      width: w(TESTIMONIAL_ARC_LAYOUT.author.width),
      size: s(TESTIMONIAL_ARC_LAYOUT.author.size),
    },
    handle: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.handle.centerX),
      top: y(TESTIMONIAL_ARC_LAYOUT.handle.top),
      width: w(TESTIMONIAL_ARC_LAYOUT.handle.width),
      size: s(TESTIMONIAL_ARC_LAYOUT.handle.size),
    },
    stars: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.stars.centerX),
      centerY: y(TESTIMONIAL_ARC_LAYOUT.stars.centerY),
      pillW: w(TESTIMONIAL_ARC_LAYOUT.stars.pillW),
      pillH: h(TESTIMONIAL_ARC_LAYOUT.stars.pillH),
      border: s(TESTIMONIAL_ARC_LAYOUT.stars.border),
      size: s(TESTIMONIAL_ARC_LAYOUT.stars.size),
      gap: s(TESTIMONIAL_ARC_LAYOUT.stars.gap),
    },
    website: {
      centerX: x(TESTIMONIAL_ARC_LAYOUT.website.centerX),
      top: y(TESTIMONIAL_ARC_LAYOUT.website.top),
      width: w(TESTIMONIAL_ARC_LAYOUT.website.width),
      size: s(TESTIMONIAL_ARC_LAYOUT.website.size),
    },
  };
}

// ── Postcard (city poster) geometry ──────────────────────────────────────────
// A full-bleed photo (paper shows only in the left gutter and bottom footer),
// the city name set one letter per cell stacked down a right-hand column (each
// glyph stretched to fill its cell, white, difference-blended over the photo so
// it inverts the picture beneath), a rotated subtitle reading up the left gutter
// and a tracked country label bottom-right. Horizontal measures and font sizes
// are fractions of the canvas *width*; vertical anchors are fractions of
// *height*. Shared by the DOM preview (PostcardPreview) and the canvas export
// (exportPostcard). Measured from the 735 × 1067 LONDON reference.
export const POSTCARD_LAYOUT = {
  // Photo frame — bleeds to the top and right; paper shows in the left gutter
  // (x < left) and the bottom footer (y > bottom).
  photo: { left: 0.052, top: 0, right: 1, bottom: 0.95 },
  // Rotated subtitle in the left gutter (reads bottom-to-top, i.e. rotate(-90));
  // anchored at its centre so any length stays centred in the upper-left gutter.
  subtitle: { centerX: 0.032, centerY: 0.2, size: 0.028, tracking: 0.16 },
  // Giant stacked city name on the right. Each letter fills its cell; cells run
  // from `top` to `bottom` of the height, right-aligned between `left`/`right`.
  title: { left: 0.6, right: 0.965, top: 0.018, bottom: 0.9, gap: 2 / 1067, capRatio: 0.72 },
  // Country label — ink on the paper footer, right-aligned to the title's edge.
  country: { right: 0.965, baseline: 0.978, size: 0.034, tracking: 0.3 },
} as const;

// The caption characters that become stacked title cells (whitespace dropped).
// One glyph per cell in both the preview and the export.
export function postcardTitleChars(text: string): string[] {
  return Array.from((text ?? "").replace(/\s+/g, "").trim());
}

export interface PostcardTitleGeometry {
  left: number;
  right: number;
  w: number;
  top: number;
  gap: number;
  cellH: number;
  cells: { y: number; h: number }[];
}

// The title column and its per-letter cell rectangles for `count` characters, in
// target canvas units (px, or 100 / 100·ratio for a cqi/viewBox preview). Shared
// by the preview and export so both stack the letters identically.
export function postcardTitleGeometry(
  count: number,
  width: number,
  height: number,
): PostcardTitleGeometry {
  const left = POSTCARD_LAYOUT.title.left * width;
  const right = POSTCARD_LAYOUT.title.right * width;
  const w = right - left;
  const top = POSTCARD_LAYOUT.title.top * height;
  const span = (POSTCARD_LAYOUT.title.bottom - POSTCARD_LAYOUT.title.top) * height;
  const n = Math.max(count, 1);
  const gap = POSTCARD_LAYOUT.title.gap * height;
  const cellH = (span - gap * (n - 1)) / n;
  const cells = Array.from({ length: n }, (_, i) => ({ y: top + i * (cellH + gap), h: cellH }));
  return { left, right, w, top, gap, cellH, cells };
}

// ── City text-mask geometry ──────────────────────────────────────────────────
// A giant uppercase city name that is auto-fit and word-wrapped to fill the text
// box, then used as a mask over a full-bleed photo (the photo shows only through
// the letters, everything else is black). A small right-aligned country label +
// flag sit in the upper right. Horizontal measures, font sizes and the flag size
// are fractions of the canvas *width*; vertical anchors are fractions of
// *height*. Shared by the DOM preview (CityMaskPreview) and the canvas export
// (exportCityMask). Measured from the 736 × 1308 SAN FRANCISCO reference.
export const CITYMASK_LAYOUT = {
  // The text box the wrapped city name is fit into (fills most of the frame).
  title: { left: 0.035, right: 0.955, top: 0.13, bottom: 0.8, lineHeight: 0.9, capRatio: 0.72 },
  // Country label — bold condensed, right-aligned, upper right.
  label: {
    right: 0.94,
    top: 0.285,
    size: 0.032,
    lineHeight: 1.12,
    maxWidth: 0.28,
    tracking: 0.06,
    gap: 0.03,
  },
  // Small flag beneath the label (US 1.9:1 proportions), right-aligned.
  flag: { width: 0.12, aspect: 1.9 },
} as const;

// Splits a single word that's too wide for the column across the fewest
// possible lines (char by char), choosing whichever cut points make those
// lines the most even width — not just the greedy max-fill per line. Greedy
// max-fill always crams in as many characters as fit, which for a name like
// FRANCISCO can land on a lopsided FRANC / ISCO (FRANC noticeably wider than
// ISCO) purely because FRANC still fits, when the evenly-split FRAN / CISCO
// reads better and is just as valid. Cut-point combinations for a city name
// are few enough to brute-force; `cap` bounds the search for pathological
// inputs (falls back to the greedy split if exceeded).
function splitWordBalanced(
  word: string,
  measure: (s: string) => number,
  maxW: number,
  cap = 20000,
): string[] {
  const chars = Array.from(word);
  const n = chars.length;

  const greedyChunks: string[] = [];
  {
    let chunk = "";
    for (const ch of chars) {
      const next = chunk + ch;
      if (chunk && measure(next) > maxW) {
        greedyChunks.push(chunk);
        chunk = ch;
      } else {
        chunk = next;
      }
    }
    if (chunk) greedyChunks.push(chunk);
  }
  const k = greedyChunks.length;
  if (k <= 1) return greedyChunks;

  let best: string[] = greedyChunks;
  let bestRatio = -Infinity;
  let tries = 0;
  const cuts: number[] = [];
  const consider = () => {
    const points = [0, ...cuts, n];
    const chunks: string[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      chunks.push(chars.slice(points[i], points[i + 1]).join(""));
    }
    const widths = chunks.map((c) => measure(c));
    if (widths.some((w) => w > maxW)) return;
    const widest = Math.max(...widths);
    const ratio = Math.min(...widths) / widest;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = chunks;
    }
  };
  const recurse = (start: number, remaining: number): boolean => {
    if (++tries > cap) return false;
    if (remaining === 0) {
      consider();
      return true;
    }
    for (let i = start; i <= n - 1 - remaining; i++) {
      cuts.push(i + 1);
      if (!recurse(i + 1, remaining - 1)) {
        cuts.pop();
        return false;
      }
      cuts.pop();
    }
    return true;
  };
  recurse(0, k - 1);
  return best;
}

// Greedy word wrap that also breaks a single word too wide for the column
// across lines, so a long city like FRANCISCO becomes FRAN / CISCO.
// `measure` returns a string's width at font-size 1 (resolution independent);
// `maxW` is the column width in the same units as the caller's font size.
function wrapMaskedWord(text: string, measure: (s: string) => number, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur) {
      lines.push(cur);
      cur = "";
    }
  };
  for (const word of words) {
    const candidate = cur ? `${cur} ${word}` : word;
    if (measure(candidate) <= maxW) {
      cur = candidate;
      continue;
    }
    flush();
    if (measure(word) <= maxW) {
      cur = word;
      continue;
    }
    // The word alone is wider than the column — split it across lines.
    const chunks = splitWordBalanced(word, measure, maxW);
    lines.push(...chunks.slice(0, -1));
    cur = chunks[chunks.length - 1] ?? "";
  }
  flush();
  return lines.length ? lines : [text];
}

export interface CityMaskLine {
  text: string;
  // Baseline offset from the block top, in unscaled units (before `scaleY`).
  baseline: number;
}

export interface CityMaskGeometry {
  fontSize: number;
  left: number;
  // Top of the text block (px). The lines are drawn under a
  // `translate(0, top) scale(1, scaleY)` transform so the caption stretches
  // vertically to fill the box while its letters keep their width.
  top: number;
  scaleY: number;
  lines: CityMaskLine[];
}

// The fitted font size and per-line baselines for the wrapped city name, in the
// target canvas units (px, or 100 / 100·ratio for a viewBox preview). The size
// is binary-searched so the wrapped lines fill the box height without any line
// overflowing the column width. Shared by the preview and export so both wrap
// and stack the caption identically. Falls back to a single centred line when
// glyph measurement is unavailable (no DOM).
export function cityMaskGeometry(
  text: string,
  fontId: string,
  weight: number,
  width: number,
  height: number,
): CityMaskGeometry {
  const L = CITYMASK_LAYOUT.title;
  const left = L.left * width;
  const boxW = (L.right - L.left) * width;
  const top = L.top * height;
  const boxH = (L.bottom - L.top) * height;
  const clean = (text ?? "").trim();
  const ctx = getMeasureCtx();
  const font = fontById(fontId);
  if (!ctx || !clean) {
    const fontSize = clean ? boxH * 0.5 : 0;
    return {
      fontSize,
      left,
      top,
      scaleY: 1,
      lines: clean ? [{ text: clean, baseline: boxH / 2 + fontSize * (L.capRatio / 2) }] : [],
    };
  }
  // Measure at a 100px reference; width scales linearly with font size, so
  // `measure` gives width per 1px of font size.
  ctx.font = `${weight} 100px ${font.family}`;
  const measure = (s: string) => ctx.measureText(s).width / 100;

  // Scan candidate font sizes. At each size the caption is greedily wrapped to
  // fit the column; a layout is feasible when it also fits the box height. We
  // pick the highest-scoring feasible layout: score favours a bigger font, but
  // penalises breaking a word into more pieces than necessary and orphan lines
  // far shorter than the rest. So SAN FRANCISCO settles on SAN / FRAN / CISCO
  // (one break in FRANCISCO, and `splitWordBalanced` picks that even break
  // over a lopsided SAN / FRANC / ISCO) rather than a slightly bigger SAN /
  // FRA / NCIS / CO (two breaks) or SAN / FRAN / CISC / O (a lonely trailing
  // letter). Balance is a hard threshold rather than a continuous reward,
  // because a continuous term over-values a perfectly even but more heavily
  // split layout (e.g. SAN / FRA / NCI / SCO) over a less-split, near-even one.
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  let bestSize = 8;
  let bestLines = [clean];
  let bestScore = -Infinity;
  const steps = 140;
  for (let i = 1; i <= steps; i++) {
    const size = (boxH * i) / steps;
    const lines = wrapMaskedWord(clean, measure, boxW / size);
    const needed = lines.length * size * L.lineHeight;
    if (needed > boxH) continue;
    const widths = lines.map((ln) => measure(ln) * size);
    const widest = Math.max(...widths);
    if (widest > boxW + 1) continue;
    const shortest = Math.min(...widths);
    const balanced = lines.length === 1 || shortest / widest >= 0.42;
    const extraSplits = Math.max(0, lines.length - wordCount);
    const score = (size * (balanced ? 1 : 0.55)) / (1 + 0.5 * extraSplits);
    if (score > bestScore) {
      bestScore = score;
      bestSize = size;
      bestLines = lines;
    }
  }
  // Fill the column width exactly with the widest line, then stretch the whole
  // block vertically to fill the box height (letters keep their width but grow
  // taller — as in the reference, where the letters are noticeably elongated).
  const widest = bestLines.reduce((max, ln) => Math.max(max, measure(ln)), 0);
  const fontSize = widest > 0 ? Math.min(boxW / widest, bestSize * 3) : bestSize;
  const slot = fontSize * L.lineHeight;
  const naturalH = bestLines.length * slot;
  const scaleY = naturalH > 0 ? Math.max(0.9, Math.min(boxH / naturalH, 1.6)) : 1;
  const blockH = naturalH * scaleY;
  const blockTop = top + Math.max(0, (boxH - blockH) / 2);
  const lines = bestLines.map((ln, i) => ({
    text: ln,
    baseline: i * slot + fontSize * L.capRatio,
  }));
  return { fontSize, left, top: blockTop, scaleY, lines };
}

// The country label wrapped to its column (greedy word wrap, no mid-word breaks).
// Shared so the preview and export stack the label identically.
export function cityMaskLabelLines(
  text: string,
  fontId: string,
  weight: number,
  width: number,
): string[] {
  const clean = (text ?? "").trim();
  if (!clean) return [];
  const ctx = getMeasureCtx();
  if (!ctx) return [clean];
  const font = fontById(fontId);
  const size = CITYMASK_LAYOUT.label.size * width;
  ctx.font = `${weight} ${size}px ${font.family}`;
  const maxW = CITYMASK_LAYOUT.label.maxWidth * width;
  const words = clean.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const candidate = `${cur} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxW) {
      cur = candidate;
    } else {
      lines.push(cur);
      cur = words[i];
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [clean];
}

// Shared geometry for the "self" split-portrait poster: a full-bleed photo on
// the left half, and the caption set as one giant letter per row on the right —
// each letter a fixed-width cell (stretched to fill it) that acts as a window
// revealing the same full-frame photo. Fractions of width/height so the DOM
// preview (SelfPreview) and the canvas export (exportSelf) agree at any
// resolution. Measured from the 736 × 1062 reference: letters occupy a fixed
// column x≈371..503 (all letters the same width), cap-height ≈ 202px, baseline
// pitch ≈ 237px, block vertically centred, with a thin white divider before the
// photo panel (≈368px).
export const SELF_LAYOUT = {
  // Right edge of the left photo panel — a hair left of the letters, leaving the
  // thin white divider seen in the reference.
  photoRight: 368 / 736,
  letters: {
    left: 371 / 736, // left edge of the fixed-width letter column
    right: 503 / 736, // right edge of the column (every letter stretched to fill)
    top: 74 / 1062, // vertical box the centred stack fits into
    bottom: 988 / 1062,
    lineHeight: 237 / 202, // baseline pitch ÷ cap height
    capRatio: 0.72, // fallback cap-height ÷ em when ink metrics are unavailable
    maxCap: 0.24, // clamp so a 1–2 letter caption doesn't grow absurdly tall
  },
} as const;

// The caption characters that become stacked letters (whitespace dropped). The
// row count equals the character count.
export function selfChars(text: string): string[] {
  return Array.from((text ?? "").replace(/\s+/g, "").trim());
}

export interface SelfCell {
  char: string;
  // Top of the letter's cap box (px, in target units); its ink is stretched to
  // fill [left .. left+cellW] × [top .. top+cap].
  top: number;
}

export interface SelfGeometry {
  left: number;
  cellW: number;
  cap: number;
  fontSize: number; // fallback size when a glyph can't be ink-measured
  photoRight: number;
  cells: SelfCell[];
}

// The fixed letter column and per-letter cap boxes for the stacked caption, in
// the target canvas units (px, or 100 / 100·ratio for a viewBox preview). Cap
// height is chosen so the N letters fill the vertical box (centred). Each glyph
// is later stretched (via ink metrics) to fill its full cell width and height,
// so every letter reads the same width — as in the reference. Shared by the
// preview and export so both stack the letters identically.
export function selfGeometry(
  chars: string[],
  _fontId: string,
  _weight: number,
  width: number,
  height: number,
): SelfGeometry {
  const L = SELF_LAYOUT.letters;
  const left = L.left * width;
  const cellW = (L.right - L.left) * width;
  const photoRight = SELF_LAYOUT.photoRight * width;
  const n = chars.length;
  if (!n) return { left, cellW, cap: 0, fontSize: 0, photoRight, cells: [] };

  const boxTop = L.top * height;
  const boxH = (L.bottom - L.top) * height;

  // Cap height from the vertical fit: N letters at pitch = cap · lineHeight fill
  // the box; the last baseline lands at the box bottom. Clamped so a very short
  // caption doesn't stretch a single letter across the whole frame.
  const cap = Math.min(boxH / ((n - 1) * L.lineHeight + 1), L.maxCap * height);
  const pitch = cap * L.lineHeight;
  const blockH = (n - 1) * pitch + cap;
  const blockTop = boxTop + Math.max(0, (boxH - blockH) / 2);
  const cells = chars.map((char, i) => ({ char, top: blockTop + i * pitch }));
  return { left, cellW, cap, fontSize: cap / L.capRatio, photoRight, cells };
}

// ── Statement portrait geometry ──────────────────────────────────────────────
// Like "self" (a full-bleed photo on the left half, the caption revealing the
// same photo on the right) but the caption is a multi-word statement that's
// word-wrapped and auto-fit — reusing the citymask wrap/scoring machinery
// (`wrapMaskedWord`) instead of self's one-letter-per-row stack — plus an
// optional small tracked tagline with an underline, sitting beside the shorter
// wrapped rows. Fractions of width/height so the DOM preview (StatementPreview)
// and the canvas export (exportStatement) agree at any resolution. Measured
// from the 548 × 761 reference: a thin white gap separates the photo panel
// (x ≤ ~0.494) from the wrapped caption column (x ≈ 0.505..0.995).
export const STATEMENT_LAYOUT = {
  photoRight: 0.494,
  title: {
    left: 0.505,
    right: 0.995,
    top: 0.096,
    bottom: 0.858,
    lineHeight: 0.92,
    capRatio: 0.72,
  },
  // Small tracked tagline (e.g. "Your presents") beside the caption, with a
  // hairline underline beneath it that overshoots the text a touch either
  // side. `left`/`top` are only the fallback position (no caption to anchor
  // to) — normally it's positioned dynamically via `statementTagAnchor`.
  tag: {
    left: 0.759,
    top: 0.511,
    size: 0.03,
    lineHeight: 1.15,
    maxWidth: 0.2,
    tracking: 0.08,
    underlineGap: 0.013,
    underlineWeight: 0.006,
    underlineExtendLeft: 0.013,
    underlineExtendRight: 0.033,
  },
} as const;

export interface StatementLine {
  text: string;
  // Baseline offset from the block top, in unscaled units (before `scaleY`).
  baseline: number;
  // Rendered width at `fontSize`, in target canvas units.
  width: number;
}

export interface StatementGeometry {
  fontSize: number;
  left: number;
  // Top of the text block (px). The lines are drawn under a
  // `translate(0, top) scale(1, scaleY)` transform so the caption stretches
  // vertically to fill the box while its letters keep their width.
  top: number;
  scaleY: number;
  photoRight: number;
  lines: StatementLine[];
}

// The fitted font size and per-line baselines for the word-wrapped statement,
// in the target canvas units (px, or 100 / 100·ratio for a viewBox preview).
// Mirrors `cityMaskGeometry`'s auto-fit + wrap scoring, just confined to the
// narrower right-hand column (the left half is the photo panel). Shared by the
// preview and export so both wrap and stack the caption identically. Falls
// back to a single centred line when glyph measurement is unavailable (no DOM).
export function statementGeometry(
  text: string,
  fontId: string,
  weight: number,
  width: number,
  height: number,
): StatementGeometry {
  const L = STATEMENT_LAYOUT.title;
  const left = L.left * width;
  const boxW = (L.right - L.left) * width;
  const top = L.top * height;
  const boxH = (L.bottom - L.top) * height;
  const photoRight = STATEMENT_LAYOUT.photoRight * width;
  const clean = (text ?? "").trim();
  const ctx = getMeasureCtx();
  const font = fontById(fontId);
  if (!ctx || !clean) {
    const fontSize = clean ? boxH * 0.3 : 0;
    return {
      fontSize,
      left,
      top,
      scaleY: 1,
      photoRight,
      lines: clean
        ? [{ text: clean, baseline: boxH / 2 + fontSize * (L.capRatio / 2), width: boxW }]
        : [],
    };
  }
  // Measure at a 100px reference; width scales linearly with font size, so
  // `measure` gives width per 1px of font size.
  ctx.font = `${weight} 100px ${font.family}`;
  const measure = (s: string) => ctx.measureText(s).width / 100;

  // Scan candidate font sizes exactly like `cityMaskGeometry`: at each size the
  // caption is greedily wrapped (breaking an overlong word across lines) to fit
  // the column, and the highest-scoring feasible size wins — favouring a bigger
  // font, but penalising extra word-breaks and lopsided lines. This is what
  // settles "BE AWESOME BE COOL" into BE / AWE / SOME / BE / CO / OL rather than
  // a smaller, unsplit BE / AWESOME / BE / COOL.
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  let bestSize = 8;
  let bestLines = [clean];
  let bestScore = -Infinity;
  const steps = 140;
  for (let i = 1; i <= steps; i++) {
    const size = (boxH * i) / steps;
    const lines = wrapMaskedWord(clean, measure, boxW / size);
    const needed = lines.length * size * L.lineHeight;
    if (needed > boxH) continue;
    const widths = lines.map((ln) => measure(ln) * size);
    const widest = Math.max(...widths);
    if (widest > boxW + 1) continue;
    const shortest = Math.min(...widths);
    const balanced = lines.length === 1 || shortest / widest >= 0.42;
    const extraSplits = Math.max(0, lines.length - wordCount);
    const score = (size * (balanced ? 1 : 0.55)) / (1 + 0.5 * extraSplits);
    if (score > bestScore) {
      bestScore = score;
      bestSize = size;
      bestLines = lines;
    }
  }
  // Fill the column width exactly with the widest line, then stretch the whole
  // block vertically to fill the box height.
  const widest = bestLines.reduce((max, ln) => Math.max(max, measure(ln)), 0);
  const fontSize = widest > 0 ? Math.min(boxW / widest, bestSize * 3) : bestSize;
  const slot = fontSize * L.lineHeight;
  const naturalH = bestLines.length * slot;
  const scaleY = naturalH > 0 ? Math.max(0.9, Math.min(boxH / naturalH, 1.6)) : 1;
  const blockH = naturalH * scaleY;
  const blockTop = top + Math.max(0, (boxH - blockH) / 2);
  const lines = bestLines.map((ln, i) => ({
    text: ln,
    baseline: i * slot + fontSize * L.capRatio,
    width: measure(ln) * fontSize,
  }));
  return { fontSize, left, top: blockTop, scaleY, photoRight, lines };
}

// Where the optional tagline sits: vertically centred beside whichever wrapped
// line has the most spare room (the shortest line — excluding the very first
// and last rows when there are more than two, so it nests in the middle of the
// stack rather than crowding the top/bottom edge). This is what puts "Your
// presents" beside the short "BE" row rather than the wide "SOME"/"COOL" rows,
// however many lines the caption happens to wrap into. Returns null when
// there's no caption to anchor to (the caller falls back to a fixed position).
export function statementTagAnchor(
  geo: StatementGeometry,
  width: number,
): { x: number; centerY: number } | null {
  if (!geo.lines.length) return null;
  const n = geo.lines.length;
  const indices =
    n > 2 ? Array.from({ length: n - 2 }, (_, i) => i + 1) : geo.lines.map((_, i) => i);
  const bestIndex = indices.reduce((best, i) =>
    geo.lines[i].width < geo.lines[best].width ? i : best,
  );
  const line = geo.lines[bestIndex];
  const centerY =
    geo.top + (line.baseline - geo.fontSize * STATEMENT_LAYOUT.title.capRatio * 0.5) * geo.scaleY;
  const x = geo.left + line.width + 0.025 * width;
  return { x, centerY };
}

// The optional tagline (e.g. "Your presents") wrapped to its column (greedy
// word wrap, no mid-word breaks). Shared so the preview and export stack it
// identically.
export function statementTagLines(
  text: string,
  fontId: string,
  weight: number,
  width: number,
  tracking: number = STATEMENT_LAYOUT.tag.tracking,
): string[] {
  const clean = (text ?? "").trim();
  if (!clean) return [];
  const ctx = getMeasureCtx();
  if (!ctx) return [clean];
  const font = fontById(fontId);
  const size = STATEMENT_LAYOUT.tag.size * width;
  ctx.font = `${weight} ${size}px ${font.family}`;
  // Letter-spacing widens the rendered text, so it has to factor into the wrap
  // measurement too — otherwise "Your presents" can measure as fitting one
  // line here but visibly overflow once the tracked CSS/canvas text renders.
  ctx.letterSpacing = `${tracking}em`;
  const maxW = STATEMENT_LAYOUT.tag.maxWidth * width;
  const words = clean.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const candidate = `${cur} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxW) {
      cur = candidate;
    } else {
      lines.push(cur);
      cur = words[i];
    }
  }
  if (cur) lines.push(cur);
  ctx.letterSpacing = "0px";
  return lines.length ? lines : [clean];
}

// ── Mono Grid geometry ───────────────────────────────────────────────────────
// A full-bleed background photo split into a 3×3 grid by thin lines drawn in
// the canvas background colour, up to 3 small photos each filling one cell, a
// caption block (headline + hashtag) centred in one cell, a rotated side text
// block (title + hashtag, reading bottom-to-top) centred in another, and an
// optional bottom-centred brand logo. Font sizes and the line thickness are
// fractions of the canvas *width*. Shared by the DOM preview (GridPreview) and
// the canvas export (exportGrid). Measured from the 1200 × 1500 references.
export const GRID_LAYOUT = {
  // Grid line thickness — the 2px hairlines of the 1200px references.
  line: 2 / 1200,
  caption: { size: 0.03, tagSize: 0.018, lineHeight: 1.35, gap: 0.02 },
  side: { size: 0.03, tagSize: 0.018, lineHeight: 1.35, gap: 0.02 },
  logo: { height: 0.05, maxWidth: 0.24, bottom: 0.025 },
} as const;

// A 3×3 grid cell address (column / row, 0-based, top-left origin).
export interface GridCell {
  c: 0 | 1 | 2;
  r: 0 | 1 | 2;
}

// Which cells a grid template fills: `photos[i]` hosts the `cell-{i+1}` image
// layer, `caption` hosts the headline + hashtag block and `side` the rotated
// title + hashtag block.
export interface GridVariant {
  photos: GridCell[];
  caption: GridCell;
  side: GridCell;
}

export const GRID_VARIANTS: Record<string, GridVariant> = {
  // Mono Grid (bcf6…): photos down the right, caption dead centre, side text
  // in the top-left cell.
  "11000000-0000-0000-0000-000000000039": {
    photos: [
      { c: 2, r: 0 },
      { c: 2, r: 2 },
    ],
    caption: { c: 1, r: 1 },
    side: { c: 0, r: 0 },
  },
  // Statement Grid (04fb…): photos in three corners, caption bottom-right,
  // side text mid-left.
  "11000000-0000-0000-0000-000000000040": {
    photos: [
      { c: 0, r: 0 },
      { c: 2, r: 0 },
      { c: 0, r: 2 },
    ],
    caption: { c: 2, r: 2 },
    side: { c: 0, r: 1 },
  },
  // Contrast Grid (9f37…): photos staggered right/left, caption centre
  // (hidden by default), side text bottom-left.
  "11000000-0000-0000-0000-000000000041": {
    photos: [
      { c: 2, r: 0 },
      { c: 0, r: 1 },
      { c: 2, r: 2 },
    ],
    caption: { c: 1, r: 1 },
    side: { c: 0, r: 2 },
  },
};

const GRID_DEFAULT_VARIANT: GridVariant = GRID_VARIANTS["11000000-0000-0000-0000-000000000039"];

export function gridVariant(templateId: string): GridVariant {
  return GRID_VARIANTS[templateId] ?? GRID_DEFAULT_VARIANT;
}

// The rectangle of a grid cell in target canvas units (px, or 100 / 100·ratio
// for a cqi/percent preview). Exact thirds — the hairlines are drawn centred on
// the cell edges, over the photos.
export function gridCellRect(
  cell: GridCell,
  width: number,
  height: number,
): { x: number; y: number; w: number; h: number } {
  const w = width / 3;
  const h = height / 3;
  return { x: cell.c * w, y: cell.r * h, w, h };
}

// The caption/side-title text split into display lines (manual line breaks).
export function gridTextLines(text: string, uppercase: boolean): string[] {
  return (uppercase ? text.toUpperCase() : text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// ── "New Drop" geometry ──────────────────────────────────────────────────────
// A tilted Polaroid-style photo card sits between two giant fixed headline
// words ("NEW" behind its top edge, "DROP" behind its bottom); the required
// photo cover-fits the card's photo window, and the required caption is set in
// script type in the card's caption strip below it. Optional brand/category
// labels sit in the top corners and an optional pill footer ("DISCOVER MORE AT
// @handle") sits at the bottom. Horizontal measures and font sizes are
// fractions of the canvas *width*; vertical anchors are fractions of *height*.
// Shared by the DOM preview (DropPreview) and the canvas export (exportDrop).
// Measured from the 736 × 1308 reference
// (public/templates/shared/b89ab8d1b7f6cdbdfac67e1b84549e7d.jpg).
export const DROP_LAYOUT = {
  // The card's un-rotated rect, rotated `rotation` degrees clockwise about its
  // own centre so it reads as tossed slightly askew.
  rotation: 2.2,
  card: {
    left: 0.181,
    right: 0.789,
    top: 0.214,
    bottom: 0.766,
    // Drop shadow cast by the tilted card, expressed as canvas-width fractions
    // so the DOM preview (CSS box-shadow) and canvas export (shadowBlur/Offset)
    // agree.
    shadow: { blur: 0.05, offsetX: 0.012, offsetY: 0.03, color: "rgba(0,0,0,0.45)" },
  },
  // The photo window inside the card (inset from the card's white border).
  photo: { left: 0.223, right: 0.747, top: 0.238, bottom: 0.661 },
  // The script caption, centred in the strip between the photo and the card's
  // bottom edge. `targetWidth` is the width the caption is fit to (a fraction
  // of the card's width); size is clamped to a sane band around it.
  caption: { targetWidth: 0.78, size: 0.1, minSize: 0.045, maxSize: 0.14 },
  // The giant fixed headline words. Not user-editable — the card's top/bottom
  // edges are drawn over their middle, leaving only a sliver of each visible.
  words: {
    font: "anton",
    size: 0.34,
    top: { text: "NEW", centerY: 0.148 },
    bottom: { text: "DROP", centerY: 0.832 },
  },
  // Small tracked-caps brand (left) / category (right) labels, top corners.
  corners: { centerY: 0.049, pad: 0.064, size: 0.0225, tracking: 0.14 },
  // The footer pill: a stroked capsule holding the fixed "DISCOVER MORE AT"
  // label, and — flush to its right — a smaller white filled pill holding the
  // editable handle. Widths are computed from the measured text so any handle
  // length centres correctly; see `dropPillMetrics`.
  pill: {
    centerY: 0.938,
    height: 0.05,
    padX: 0.034,
    gap: 0.022,
    inset: 0,
    stroke: 0.0016,
    labelSize: 0.024,
    ctaSize: 0.025,
    labelTracking: 0.02,
  },
} as const;

// The caption's fitted font size (px at `cardWidth`, the card's rendered
// width): measures the (cased) text and scales the layout's base size so it
// fills `caption.targetWidth` of the card, clamped to a sane band — the same
// "measure, then scale" approach as `portoCaptionFontSize`. Falls back to the
// plain base size when it can't measure (no DOM, empty text, or an unloaded
// font), so it is never a wrong guess — only a no-op fallback.
export function dropCaptionFontSize(caption: TextLayer, cardWidth: number): number {
  const style = resolveTextStyle(caption);
  const base = DROP_LAYOUT.caption.size * cardWidth;
  const fallback = Math.min(
    DROP_LAYOUT.caption.maxSize * cardWidth,
    Math.max(DROP_LAYOUT.caption.minSize * cardWidth, base * style.sizeScale),
  );
  const label = (caption.uppercase ? caption.text.toUpperCase() : caption.text).trim();
  const ctx = getMeasureCtx();
  if (!ctx || !label) return fallback;

  const font = fontById(caption.fontId);
  const ref = 100;
  ctx.font = `${style.weight} ${ref}px ${font.family}`;
  const width = ctx.measureText(label).width;
  if (!width) return fallback;

  const target = DROP_LAYOUT.caption.targetWidth * cardWidth;
  const fitted = (target / width) * ref * style.sizeScale;
  return Math.min(
    DROP_LAYOUT.caption.maxSize * cardWidth,
    Math.max(DROP_LAYOUT.caption.minSize * cardWidth, fitted),
  );
}

// ---------------------------------------------------------------------------
// Woven Calm — a textile-brand editorial poster (see WOVEN_CALM). A warm stone
// canvas holds a tall photo panel on the left, and on the right a large serif
// title (word-wrapped) stacked over a small grey body paragraph (word-wrapped).
// All positions are fractions of the 736 × 920 reference so the DOM preview
// (WovenPreview) and the canvas export (exportWoven) agree at any resolution.
// Measured from the reference: photo panel x≈117..339 y≈179..823; the text
// column starts at x≈378 and wraps at x≈633 (≈255px wide); the title caps are
// ≈51px tall with a ≈78px baseline pitch, first baseline ≈408; the body is
// ≈14px with a ≈16px line pitch, first baseline ≈537.
export const WOVEN_LAYOUT = {
  photo: { left: 117 / 736, right: 339 / 736, top: 179 / 920, bottom: 823 / 920 },
  // Left edge of the text column and the width words wrap within. Wide enough
  // that the reference's hard-wrapped body lines never re-wrap (so the layout is
  // reproduced exactly regardless of the body face's metrics), yet narrow enough
  // that the two-word title still breaks onto two lines.
  col: { left: 378 / 736, width: 320 / 736 },
  title: {
    cap: 51 / 920, // uppercase cap height
    capRatio: 0.72, // cap height ÷ em for the serif face (Playfair ≈ 0.72)
    lineHeight: 78 / 51, // baseline pitch ÷ cap height
    firstBaseline: 408 / 920, // baseline of the first title line
  },
  body: {
    size: 10.5 / 920, // font size
    lineHeight: 16 / 920, // baseline pitch
    gap: 51 / 920, // gap between the last title baseline and the first body baseline
  },
} as const;

// Word-wrap `text` into lines no wider than `maxWidth`, measuring with the given
// face. Explicit newlines are honoured as hard paragraph breaks (each paragraph
// wrapped on its own); long single words are kept whole (they simply overflow,
// as CSS would). Shared so the preview and export wrap identically.
export function wovenWrap(
  text: string,
  fontId: string,
  weight: number,
  sizePx: number,
  maxWidth: number,
): string[] {
  const clean = (text ?? "").replace(/\r\n?/g, "\n").trim();
  if (!clean) return [];
  const ctx = getMeasureCtx();
  const paragraphs = clean.split("\n").map((p) => p.trim());
  if (!ctx) return paragraphs.filter(Boolean);
  ctx.font = `${weight} ${sizePx}px ${fontById(fontId).family}`;
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${cur} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) cur = candidate;
      else {
        lines.push(cur);
        cur = words[i];
      }
    }
    lines.push(cur);
  }
  return lines;
}

export interface WovenLine {
  text: string;
  baseline: number; // alphabetic baseline y, in target units
}

export interface WovenGeometry {
  photo: { x: number; y: number; w: number; h: number };
  colLeft: number;
  colWidth: number;
  titleFontSize: number;
  bodyFontSize: number;
  titleLines: WovenLine[];
  bodyLines: WovenLine[];
}

// Resolve the photo panel plus the positioned title and body lines for the woven
// poster, in the target canvas units (px, or the preview viewBox units). The
// body block flows directly beneath the (variable-height) title block, so a
// longer/shorter title reflows the body rather than overlapping it.
export function wovenGeometry(
  titleText: string,
  titleFontId: string,
  titleWeight: number,
  titleUppercase: boolean,
  bodyText: string,
  bodyFontId: string,
  bodyWeight: number,
  width: number,
  height: number,
): WovenGeometry {
  const L = WOVEN_LAYOUT;
  const colLeft = L.col.left * width;
  const colWidth = L.col.width * width;
  const photo = {
    x: L.photo.left * width,
    y: L.photo.top * height,
    w: (L.photo.right - L.photo.left) * width,
    h: (L.photo.bottom - L.photo.top) * height,
  };

  const titleFontSize = (L.title.cap * height) / L.title.capRatio;
  const titlePitch = L.title.cap * height * L.title.lineHeight;
  const bodyFontSize = L.body.size * height;
  const bodyPitch = L.body.lineHeight * height;

  // Wrap at a fixed canonical resolution (not the target one) so the preview and
  // the export agree on line breaks: sub-pixel font hinting makes measureText
  // slightly non-linear across sizes, so a shared basis keeps them in step.
  // Positions below still scale to the actual width/height.
  const CANON = 1000;
  const canonHeight = (CANON * height) / width;
  const mColWidth = L.col.width * CANON;
  const mTitleSize = (L.title.cap * canonHeight) / L.title.capRatio;
  const mBodySize = L.body.size * canonHeight;

  const titleRaw = titleUppercase ? (titleText ?? "").toUpperCase() : (titleText ?? "");
  const titleWords = wovenWrap(titleRaw, titleFontId, titleWeight, mTitleSize, mColWidth);
  const firstBaseline = L.title.firstBaseline * height;
  const titleLines: WovenLine[] = titleWords.map((text, i) => ({
    text,
    baseline: firstBaseline + i * titlePitch,
  }));

  const lastTitleBaseline = titleLines.length
    ? titleLines[titleLines.length - 1].baseline
    : firstBaseline - titlePitch;
  const bodyStart = lastTitleBaseline + L.body.gap * height;
  const bodyWords = wovenWrap(bodyText, bodyFontId, bodyWeight, mBodySize, mColWidth);
  const bodyLines: WovenLine[] = bodyWords.map((text, i) => ({
    text,
    baseline: bodyStart + i * bodyPitch,
  }));

  return { photo, colLeft, colWidth, titleFontSize, bodyFontSize, titleLines, bodyLines };
}

// ---------------------------------------------------------------------------
// Studio Brief — the "Residential" agency-brief poster (see STUDIO_BRIEF). A
// white paper panel on the left carries a bullet-and-rule marker, a bold serif
// category caption and a mission paragraph beneath it; a full-bleed photo fills
// the right panel. All positions are fractions of the 1080 × 1350 reference so
// the DOM preview (BriefPreview) and the canvas export (exportBrief) agree at
// any resolution. Measured from the reference: the paper/photo split sits at
// x≈602/1080; the marker (rule + dot) is centred at x≈82, y≈650; the text
// column starts at x≈110; the caption caps are ≈52px tall with a first
// baseline ≈671; the body is a ≈30px line pitch with a first baseline ≈732.
export const BRIEF_LAYOUT = {
  splitX: 602 / 1080,
  marker: { y: 650 / 1350, centerX: 82 / 1080, dotRadius: 14.5 / 1080, lineWidth: 2 / 1080 },
  // Left edge of the text column and the width words wrap within.
  col: { left: 110 / 1080, width: 450 / 1080 },
  title: {
    cap: 52 / 1350, // ascender-to-baseline height (measured on "Residential")
    capRatio: 0.797, // that height ÷ em for Playfair Display Bold (measured, mixed-case)
    lineHeight: 1.25, // baseline pitch ÷ cap height
    firstBaseline: 671 / 1350, // baseline of the first caption line
  },
  body: {
    size: 26 / 1350, // font size (kept a touch under the measured cap so the
    // paragraph still wraps at the reference's 4 lines within the column)
    lineHeight: 30 / 1350, // baseline pitch
    gap: 61 / 1350, // gap between the last caption baseline and the first body baseline
  },
} as const;

export interface BriefGeometry {
  photo: { x: number; y: number; w: number; h: number };
  marker: { x1: number; x2: number; y: number; lineWidth: number; dotX: number; dotR: number };
  colLeft: number;
  colWidth: number;
  titleFontSize: number;
  bodyFontSize: number;
  titleLines: WovenLine[];
  bodyLines: WovenLine[];
}

// Resolve the photo panel, the bullet-and-rule marker, and the positioned
// caption + body lines for the Studio Brief poster, in the target canvas units
// (px, or the preview viewBox units). The body block flows directly beneath
// the (variable-height) caption block, so a longer/shorter caption reflows the
// body rather than overlapping it.
export function briefGeometry(
  titleText: string,
  titleFontId: string,
  titleWeight: number,
  titleUppercase: boolean,
  bodyText: string,
  bodyFontId: string,
  bodyWeight: number,
  width: number,
  height: number,
): BriefGeometry {
  const L = BRIEF_LAYOUT;
  const colLeft = L.col.left * width;
  const colWidth = L.col.width * width;
  const photo = {
    x: L.splitX * width,
    y: 0,
    w: (1 - L.splitX) * width,
    h: height,
  };
  const dotX = L.marker.centerX * width;
  const dotR = L.marker.dotRadius * width;
  const marker = {
    x1: 0,
    x2: dotX - dotR,
    y: L.marker.y * height,
    lineWidth: L.marker.lineWidth * width,
    dotX,
    dotR,
  };

  const titleFontSize = (L.title.cap * height) / L.title.capRatio;
  const titlePitch = L.title.cap * height * L.title.lineHeight;
  const bodyFontSize = L.body.size * height;
  const bodyPitch = L.body.lineHeight * height;

  const titleRaw = titleUppercase ? (titleText ?? "").toUpperCase() : (titleText ?? "");
  const titleWords = wovenWrap(titleRaw, titleFontId, titleWeight, titleFontSize, colWidth);
  const firstBaseline = L.title.firstBaseline * height;
  const titleLines: WovenLine[] = titleWords.map((text, i) => ({
    text,
    baseline: firstBaseline + i * titlePitch,
  }));

  const lastTitleBaseline = titleLines.length
    ? titleLines[titleLines.length - 1].baseline
    : firstBaseline - titlePitch;
  const bodyStart = lastTitleBaseline + L.body.gap * height;
  const bodyWords = wovenWrap(bodyText, bodyFontId, bodyWeight, bodyFontSize, colWidth);
  const bodyLines: WovenLine[] = bodyWords.map((text, i) => ({
    text,
    baseline: bodyStart + i * bodyPitch,
  }));

  return { photo, marker, colLeft, colWidth, titleFontSize, bodyFontSize, titleLines, bodyLines };
}

// ---------------------------------------------------------------------------
// Open Space Living Room — the one-photo interior collage. All geometry is
// measured from public/templates/shared/bd99b4086a779e897c606c7a58c7c06c.jpg
// (736 x 1308), then scaled to the target canvas. The same photo layer is drawn
// twice: cover-fit as the full-height right backdrop and cover-fit in the white
// inset frame.
export const OPEN_SPACE_LAYOUT = {
  backdrop: { x: 184 / 736, y: 0, w: 552 / 736, h: 1 },
  leftWash: { x: 0, y: 0, w: 184 / 736, h: 1 },
  frame: { x: 29 / 736, y: 360 / 1308, w: 489 / 736, h: 589 / 1308 },
  inset: { x: 60 / 736, y: 388 / 1308, w: 428 / 736, h: 532 / 1308 },
  headline: {
    centerX: 387 / 736,
    firstBaseline: 302 / 1308,
    secondBaseline: 351 / 1308,
    firstSize: 33 / 736,
    secondSize: 35 / 736,
    firstTracking: 0.16,
    secondTracking: 0.095,
    firstWeight: 300,
  },
  lockup: {
    centerX: 329 / 736,
  },
  uploadedLogo: { x: 289 / 736, y: 41 / 1308, w: 82 / 736, h: 82 / 1308 },
} as const;

export interface OpenSpaceGeometry {
  backdrop: { x: number; y: number; w: number; h: number };
  leftWash: { x: number; y: number; w: number; h: number };
  frame: { x: number; y: number; w: number; h: number };
  inset: { x: number; y: number; w: number; h: number };
  headline: {
    centerX: number;
    firstBaseline: number;
    secondBaseline: number;
    firstSize: number;
    secondSize: number;
  };
  lockup: {
    centerX: number;
  };
  uploadedLogo: { x: number; y: number; w: number; h: number };
}

export function openSpaceGeometry(width: number, height: number): OpenSpaceGeometry {
  const L = OPEN_SPACE_LAYOUT;
  const rect = (r: { x: number; y: number; w: number; h: number }) => ({
    x: r.x * width,
    y: r.y * height,
    w: r.w * width,
    h: r.h * height,
  });
  return {
    backdrop: rect(L.backdrop),
    leftWash: rect(L.leftWash),
    frame: rect(L.frame),
    inset: rect(L.inset),
    headline: {
      centerX: L.headline.centerX * width,
      firstBaseline: L.headline.firstBaseline * height,
      secondBaseline: L.headline.secondBaseline * height,
      firstSize: L.headline.firstSize * width,
      secondSize: L.headline.secondSize * width,
    },
    lockup: {
      centerX: L.lockup.centerX * width,
    },
    uploadedLogo: rect(L.uploadedLogo),
  };
}

// ---------------------------------------------------------------------------
// Mosaic moodboards — masonry photo grids with no text at all, every cell a
// required, independently replaceable photo. Each variant is keyed by template
// id and lists its cells as fractional rects (photo content only, gutters and
// outer margin excluded) in `cell-{i+1}` layer order; the untouched editor
// reproduces the reference exactly because each default photo is that cell's
// own crop and the cell cover-fits the same rect. Shared by the DOM preview
// (MosaicPreview) and the canvas export (exportMosaic).
export interface MosaicRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MOSAIC_VARIANTS: Record<string, readonly MosaicRect[]> = {
  // Residence Mosaic (11 cells) — 3 uneven columns (narrow / wide / narrow)
  // inset from the canvas edges by an outer margin, split by a wider internal
  // gutter; the wide centre column stacks 3 taller cells while each side
  // column stacks 4 shorter ones (its row breaks don't line up). Measured off
  // public/templates/shared/1d9692aee1d1536bad55a52a4003aaac.jpg (736 × 1313).
  "11000000-0000-0000-0000-000000000046": [
    { x: 19 / 736, y: 0 / 1313, w: 183 / 736, h: 349 / 1313 }, // cell-1: top-left
    { x: 217 / 736, y: 0 / 1313, w: 297 / 736, h: 296 / 1313 }, // cell-2: top-centre
    { x: 528 / 736, y: 0 / 1313, w: 187 / 736, h: 349 / 1313 }, // cell-3: top-right
    { x: 19 / 736, y: 363 / 1313, w: 183 / 736, h: 286 / 1313 }, // cell-4: mid-left (upper)
    { x: 217 / 736, y: 311 / 1313, w: 297 / 736, h: 401 / 1313 }, // cell-5: mid-centre
    { x: 528 / 736, y: 363 / 1313, w: 187 / 736, h: 286 / 1313 }, // cell-6: mid-right (upper)
    { x: 19 / 736, y: 663 / 1313, w: 183 / 736, h: 274 / 1313 }, // cell-7: mid-left (lower)
    { x: 528 / 736, y: 663 / 1313, w: 187 / 736, h: 274 / 1313 }, // cell-8: mid-right (lower)
    { x: 19 / 736, y: 951 / 1313, w: 183 / 736, h: 362 / 1313 }, // cell-9: bottom-left
    { x: 217 / 736, y: 727 / 1313, w: 297 / 736, h: 586 / 1313 }, // cell-10: bottom-centre, tall
    { x: 528 / 736, y: 951 / 1313, w: 187 / 736, h: 362 / 1313 }, // cell-11: bottom-right
  ],
  // Coastal Mosaic (13 cells) — 3 uneven columns (wide-ish / wide / medium)
  // split by a thin white gutter, each column breaking into a different number
  // of cells (4 / 4 / 5) below the two shared top rows; the centre column's
  // 3rd cell and the right column's stack are the tall ones. Measured off
  // public/templates/shared/078de9478ab62f259139da7a07aa7f60.jpg (736 × 1313).
  "11000000-0000-0000-0000-000000000047": [
    { x: 16 / 736, y: 7 / 1313, w: 225 / 736, h: 263 / 1313 }, // cell-1: col1 row1
    { x: 248 / 736, y: 7 / 1313, w: 252 / 736, h: 262 / 1313 }, // cell-2: col2 row1
    { x: 508 / 736, y: 6 / 1313, w: 210 / 736, h: 264 / 1313 }, // cell-3: col3 row1
    { x: 16 / 736, y: 278 / 1313, w: 225 / 736, h: 218 / 1313 }, // cell-4: col1 row2
    { x: 248 / 736, y: 277 / 1313, w: 252 / 736, h: 219 / 1313 }, // cell-5: col2 row2
    { x: 508 / 736, y: 278 / 1313, w: 210 / 736, h: 218 / 1313 }, // cell-6: col3 row2
    { x: 16 / 736, y: 505 / 1313, w: 225 / 736, h: 399 / 1313 }, // cell-7: col1 row3
    { x: 248 / 736, y: 504 / 1313, w: 252 / 736, h: 541 / 1313 }, // cell-8: col2 row3 (tall)
    { x: 508 / 736, y: 504 / 1313, w: 210 / 736, h: 200 / 1313 }, // cell-9: col3 row3
    { x: 508 / 736, y: 714 / 1313, w: 210 / 736, h: 331 / 1313 }, // cell-10: col3 row4
    { x: 16 / 736, y: 912 / 1313, w: 225 / 736, h: 391 / 1313 }, // cell-11: col1 row4
    { x: 248 / 736, y: 1054 / 1313, w: 252 / 736, h: 248 / 1313 }, // cell-12: col2 row4
    { x: 508 / 736, y: 1054 / 1313, w: 210 / 736, h: 248 / 1313 }, // cell-13: col3 row5
  ],
  // Stone Villa Mosaic (11 cells) — 3 uneven columns (narrow / wide / medium),
  // full-bleed to the canvas edges, split by a hairline gutter; the wide
  // centre column's middle cell spans two row-heights. Measured off
  // public/templates/shared/12b150466df1b894b3016580977e5ed4.jpg (736 × 1313).
  "11000000-0000-0000-0000-000000000048": [
    { x: 0 / 736, y: 0 / 1313, w: 202.5 / 736, h: 345.5 / 1313 }, // cell-1: top-left
    { x: 206.5 / 736, y: 0 / 1313, w: 305 / 736, h: 345.5 / 1313 }, // cell-2: top-centre
    { x: 515.5 / 736, y: 0 / 1313, w: 220.5 / 736, h: 345.5 / 1313 }, // cell-3: top-right
    { x: 0 / 736, y: 349.5 / 1313, w: 202.5 / 736, h: 296 / 1313 }, // cell-4: mid-left (upper)
    { x: 206.5 / 736, y: 349.5 / 1313, w: 305 / 736, h: 605 / 1313 }, // cell-5: centre, tall (spans 2 rows)
    { x: 515.5 / 736, y: 349.5 / 1313, w: 220.5 / 736, h: 296 / 1313 }, // cell-6: mid-right (upper)
    { x: 0 / 736, y: 649.5 / 1313, w: 202.5 / 736, h: 305 / 1313 }, // cell-7: mid-left (lower)
    { x: 515.5 / 736, y: 649.5 / 1313, w: 220.5 / 736, h: 305 / 1313 }, // cell-8: mid-right (lower)
    { x: 0 / 736, y: 958.5 / 1313, w: 202.5 / 736, h: 354.5 / 1313 }, // cell-9: bottom-left
    { x: 206.5 / 736, y: 958.5 / 1313, w: 305 / 736, h: 354.5 / 1313 }, // cell-10: bottom-centre
    { x: 515.5 / 736, y: 958.5 / 1313, w: 220.5 / 736, h: 354.5 / 1313 }, // cell-11: bottom-right
  ],
};

const MOSAIC_DEFAULT_CELLS = MOSAIC_VARIANTS["11000000-0000-0000-0000-000000000046"];

// The mosaic cell rects for a template id (falls back to the 11-cell default).
export function mosaicCells(templateId: string): readonly MosaicRect[] {
  return MOSAIC_VARIANTS[templateId] ?? MOSAIC_DEFAULT_CELLS;
}

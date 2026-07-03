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
  // The hosted URL for `assetId` at the time it was attached. Backend-remix
  // templates re-resolve this server-side from `assetId` on load; local
  // templates (no backend row — see lib/local-templates.ts) have nowhere to
  // resolve it, so it rides along on the layer itself and round-trips through
  // `serializeRemixLayers`/persisted state, letting `assetsFromLayers` rebuild
  // the remix's asset list purely from the saved layers.
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
// panel, mirroring the `template_relax.v2.html` render engine template.
export type TemplateLayout =
  | "poster"
  | "moodboard"
  | "porto"
  | "relax"
  | "cover"
  | "verticals"
  | "split";

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

const REMIX_EDITOR_TEMPLATES: Record<string, RemixEditorTemplate> = {
  [TEMPLATE_28.id]: TEMPLATE_28,
  [TEMPLATE_205.id]: TEMPLATE_205,
  [PORTO_POSTER.id]: PORTO_POSTER,
  [RELAX_TRIO.id]: RELAX_TRIO,
  [FRANKOF_TIMELESS.id]: FRANKOF_TIMELESS,
  [TRAVEL_PIN.id]: TRAVEL_PIN,
  [SOULKIN_SPLIT.id]: SOULKIN_SPLIT,
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
  extras?: { caption?: string; cityOverview?: string },
): RemixEditorState {
  const header = layers.find((layer) => layer.kind === "header") as TextLayer | undefined;
  const description = layers.find((layer) => layer.kind === "description") as TextLayer | undefined;
  return {
    version: 1,
    caption: extras?.caption ?? header?.text,
    city_overview: extras?.cityOverview ?? description?.text,
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
// Full-bleed photo with a large uppercase headline bottom-left, over a bottom
// scrim. Fractions of the canvas *width* (padX/right/size) match the render
// engine's CSS pixels at the 1080px reference (template_frankof.v2.html slide 9:
// left 88px, right 110px, font-size 80px); `bottom` is a fraction of height
// (104/1350). The preview and export share these so both position identically.
export const COVER_LAYOUT = {
  padX: 88 / 1080,
  padRight: 110 / 1080,
  headline: { size: 80 / 1080, lineHeight: 0.96, bottom: 104 / 1350 },
  // Bottom scrim: a transparent-to-dark gradient so the headline stays legible on
  // any photo. `start` is where the darkening begins (fraction of height).
  scrim: { start: 0.4, color: "15, 14, 12", opacity: 0.7 },
} as const;

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
  headline: { x: 0.055, top: 0.055, width: 0.36, size: 0.19, lineHeight: 0.92 },
  body: { x: 0.075, bottom: 0.06, width: 0.34, size: 0.03, lineHeight: 1.4 },
} as const;

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

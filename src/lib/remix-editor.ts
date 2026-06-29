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
}

export type TextAlign = "left" | "center" | "right";

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
  // Optional style overrides. Absent === the template/LAYOUT default, so existing
  // remixes look unchanged until the user edits them. Resolved via `resolveTextStyle`.
  sizeScale?: number; // multiplier on the layout default font size (1 = default)
  weight?: number; // font weight, snapped to one the chosen font actually ships
  letterSpacing?: number; // tracking, in em (0 = default)
  align?: TextAlign; // default "center"
  shadow?: boolean; // drop shadow behind the text
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
// reproduces the measured Porto travel poster reference.
export type TemplateLayout = "poster" | "moodboard" | "porto";

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

export function fontById(id: string): EditorFont {
  return EDITOR_FONTS.find((font) => font.id === id) ?? EDITOR_FONTS[0];
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
}

// The effective style for a text layer: explicit overrides, else sensible
// defaults. Weight is always snapped to one the chosen font ships. The default
// weight matches the LAYOUT/MOODBOARD defaults by layer kind (header/title 800,
// description 500, cta 600).
export function resolveTextStyle(layer: TextLayer): ResolvedTextStyle {
  const font = fontById(layer.fontId);
  const baseWeight = layer.kind === "description" ? 500 : layer.kind === "cta" ? 600 : 800;
  return {
    sizeScale: layer.sizeScale ?? 1,
    weight: nearestWeight(font, layer.weight ?? baseWeight),
    letterSpacing: layer.letterSpacing ?? 0,
    align: layer.align ?? "center",
    shadow: layer.shadow ?? false,
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

const REMIX_EDITOR_TEMPLATES: Record<string, RemixEditorTemplate> = {
  [TEMPLATE_28.id]: TEMPLATE_28,
  [TEMPLATE_205.id]: TEMPLATE_205,
  [PORTO_POSTER.id]: PORTO_POSTER,
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
    return saved.map((layer) => {
      if (layer.kind !== "image") return { ...layer };
      const resolved = layer.assetId ? assetUrlById.get(layer.assetId) : undefined;
      return {
        ...layer,
        transform: layer.transform ? { ...layer.transform } : undefined,
        src: resolved ?? layer.src,
      };
    });
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

// Measured from public/templates/shared/porto-poster.jpg (736 x 1308) and
// expressed as canvas fractions so the DOM preview and export share the same
// geometry.
export const PORTO_LAYOUT = {
  card: { x: 50 / 736, y: 231 / 1308, w: 654 / 736, h: 844 / 1308 },
  photo: { x: 106 / 736, y: 353 / 1308, w: 541 / 736, h: 686 / 1308 },
  headlineCover: { x: 106 / 736, y: 353 / 1308, w: 541 / 736, h: 116 / 1308 },
  eyebrow: { x: 98 / 736, y: 271 / 1308, size: 32 / 1080 },
  overview: { x: 415 / 736, y: 256 / 1308, w: 229 / 736, size: 18 / 1080, lineHeight: 1.18 },
  headline: { x: 98 / 736, y: 351 / 1308, w: 560 / 736, size: 208 / 1080, lineHeight: 0.82 },
} as const;

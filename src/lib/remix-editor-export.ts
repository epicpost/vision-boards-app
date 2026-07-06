// Rasterize the editor's creative to a PNG using the same fractional geometry
// (`LAYOUT`) the live DOM preview uses, so the download matches what's on screen.

import {
  coverGeometry,
  editorialGeometry,
  EDITORIAL_ARROW,
  COLLAGE_LAYOUT,
  collageSlide,
  DEFAULT_IMAGE_TRANSFORM,
  EXPORT_FORMATS,
  LAYOUT,
  MOODBOARD_LAYOUT,
  RELAX_LAYOUT,
  SPLIT_LAYOUT,
  SLICED_LAYOUT,
  slicedChars,
  slicedGeometry,
  slicedGlyphMetrics,
  type SlicedGeometry,
  VERTICALS_LAYOUT,
  verticalsTitleChars,
  DUEL_LAYOUT,
  BUSINESS_CHOICE_LAYOUT,
  businessChoiceBackground,
  businessChoiceGeometry,
  businessChoiceHeadlineFit,
  businessChoiceHeadlineFontIds,
  businessChoicePillFill,
  businessChoicePillTextColor,
  TESTIMONIAL_LAYOUT,
  TESTIMONIAL_ARC_LAYOUT,
  testimonialArcChars,
  testimonialArcGeometry,
  testimonialGeometry,
  duelCaptionWords,
  duelDisplayCase,
  duelVisibleOptions,
  duelPollGeometry,
  POSTCARD_LAYOUT,
  postcardTitleChars,
  postcardTitleGeometry,
  CITYMASK_LAYOUT,
  cityMaskGeometry,
  cityMaskLabelLines,
  selfChars,
  selfGeometry,
  STATEMENT_LAYOUT,
  statementGeometry,
  statementTagAnchor,
  statementTagLines,
  wovenGeometry,
  briefGeometry,
  INTERIOR_INSPIRATION_LAYOUT,
  interiorInspirationGeometry,
  fashionIconsGeometry,
  showcaseGeometry,
  showcaseVariant,
  showcaseLookLabel,
  OPEN_SPACE_LAYOUT,
  openSpaceGeometry,
  GRID_LAYOUT,
  gridVariant,
  gridCellRect,
  gridTextLines,
  mosaicCells,
  DROP_LAYOUT,
  dropCaptionFontSize,
  PORTO_CAPTION_TRACKING,
  PORTO_CARD,
  PORTO_LAYOUT,
  TEXT_SHADOW,
  fontById,
  imageTransform,
  readableTextColor,
  resolveTextStyle,
  splitHeadlineFontSize,
  type EditorLayer,
  type ExportFormat,
  type ImageTransform,
  type RemixEditorTemplate,
  type ResolvedTextStyle,
  type TextLayer,
} from "@/lib/remix-editor";
import { resolveCleanImageSrc } from "@/lib/image-proxy";

// Thrown when one or more photos couldn't be loaded into the canvas. The caller
// catches this to warn the user instead of downloading a partial/black export.
export class ExportImageError extends Error {
  constructor(public readonly failedCount: number) {
    super(`Couldn't load ${failedCount} photo${failedCount === 1 ? "" : "s"} for export.`);
    this.name = "ExportImageError";
  }
}

function parseRatio(aspectRatio: string): number {
  const [w, h] = aspectRatio.split("/").map((part) => Number(part.trim()));
  if (!w || !h) return 0.8;
  return w / h;
}

function primaryFamily(stack: string): string {
  return stack.split(",")[0]?.trim() ?? stack;
}

// Horizontal draw anchor (paired with ctx.textAlign = align) within a padded box.
function alignX(align: ResolvedTextStyle["align"], leftPx: number, rightPx: number): number {
  if (align === "left") return leftPx;
  if (align === "right") return rightPx;
  return (leftPx + rightPx) / 2;
}

// Apply (or clear) the text drop shadow for a given font size on the context.
function applyTextShadow(ctx: CanvasRenderingContext2D, on: boolean, sizePx: number) {
  if (!on) return;
  ctx.shadowColor = TEXT_SHADOW.color;
  ctx.shadowBlur = sizePx * TEXT_SHADOW.blurRatio;
  ctx.shadowOffsetY = sizePx * TEXT_SHADOW.offsetYRatio;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  // Resolve to a canvas-safe src regardless of how the layer's src got here
  // (initial load, draft restore, AI refine, replace). `data:`/`blob:`/
  // same-origin pass through untouched; cross-origin http(s) is proxied to a
  // `data:` URL. Without this, a raw S3 URL (no CORS header) fails to load with
  // `crossOrigin="anonymous"` and the band silently drops from the export.
  const clean = await resolveCleanImageSrc(src);
  return new Promise((resolve, reject) => {
    const image = new Image();
    // Only remote URLs need the CORS opt-in; data:/blob: must not set it.
    if (!clean.startsWith("data:") && !clean.startsWith("blob:")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = clean;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

// Draw an image scaled+rotated+panned around the box centre, reproducing the CSS
// `transformCss` order (rotate → scale → pan) so the export matches the preview.
// `baseScale` is the fit scale (cover or contain) computed by the caller.
function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  baseScale: number,
  transform: ImageTransform,
) {
  const scale = baseScale * transform.scale;
  const dw = image.width * scale;
  const dh = image.height * scale;
  const cx = box.x + box.w / 2 + transform.offsetX * box.w;
  const cy = box.y + box.h / 2 + transform.offsetY * box.h;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

// Cover-fit an image into a box (crop to fill), clipped to the box bounds.
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  transform: ImageTransform = DEFAULT_IMAGE_TRANSFORM,
) {
  const baseScale = Math.max(box.w / image.width, box.h / image.height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  drawTransformedImage(ctx, image, box, baseScale, transform);
  ctx.restore();
}

function drawRoundedImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  radius: number,
  transform: ImageTransform = DEFAULT_IMAGE_TRANSFORM,
) {
  const baseScale = Math.max(box.w / image.width, box.h / image.height);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, radius);
  ctx.clip();
  drawTransformedImage(ctx, image, box, baseScale, transform);
  ctx.restore();
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  radius = 0,
  align: "center" | "left" = "center",
  transform: ImageTransform = DEFAULT_IMAGE_TRANSFORM,
) {
  const baseScale = Math.min(box.w / image.width, box.h / image.height);
  // Left-aligned, untransformed images (the logo) keep the simple fast path.
  if (align === "left" && transform === DEFAULT_IMAGE_TRANSFORM) {
    const dw = image.width * baseScale;
    const dh = image.height * baseScale;
    const dx = box.x;
    const dy = box.y + (box.h - dh) / 2;
    ctx.drawImage(image, dx, dy, dw, dh);
    return;
  }
  ctx.save();
  ctx.beginPath();
  if (radius > 0) ctx.roundRect(box.x, box.y, box.w, box.h, radius);
  else ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  drawTransformedImage(ctx, image, box, baseScale, transform);
  ctx.restore();
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ExportFormat): Promise<Blob> {
  const meta = EXPORT_FORMATS[format];
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the creative."));
      },
      meta.mime,
      meta.quality,
    );
  });
}

// Rasterize a moodboard creative: equal full-bleed photo bands with the city
// title centred over the middle band — mirroring `MoodboardPreview`.
async function exportMoodboard(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Order matters: `layers` keeps the template order, so band index = position.
  const photoLayers = layers.filter((layer) => layer.kind === "image");
  const bandHeight = height / Math.max(photoLayers.length, 1);
  let failedBands = 0;
  for (let index = 0; index < photoLayers.length; index++) {
    const layer = photoLayers[index];
    if (!layer.visible || layer.kind !== "image") continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(
        ctx,
        img,
        {
          x: 0,
          y: index * bandHeight,
          w: width,
          h: bandHeight,
        },
        imageTransform(layer),
      );
    } catch {
      // Track the drop instead of silently shipping a partial (or all-black)
      // export — the caller surfaces this rather than downloading a broken file.
      failedBands += 1;
    }
  }
  if (failedBands > 0) {
    throw new ExportImageError(failedBands);
  }

  const header = layers.find(
    (layer): layer is TextLayer => layer.kind === "header" && layer.visible,
  );
  if (header && header.text.trim()) {
    const font = fontById(header.fontId);
    const style = resolveTextStyle(header);
    const padX = MOODBOARD_LAYOUT.title.padX;
    const size = MOODBOARD_LAYOUT.title.size * style.sizeScale * width;
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts
        .load(`${style.weight} ${size}px ${primaryFamily(font.family)}`)
        .catch(() => undefined);
    }
    const text = header.uppercase ? header.text.toUpperCase() : header.text;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const lines = wrapLines(ctx, text, (1 - 2 * padX) * width);
    const lineHeight = size * MOODBOARD_LAYOUT.title.lineHeight;
    const totalHeight = lines.length * lineHeight;
    const startY = MOODBOARD_LAYOUT.title.centerY * height - totalHeight / 2 + lineHeight / 2;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = header.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "middle";
    const x = alignX(style.align, padX * width, (1 - padX) * width);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight);
    });
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a verticals creative: equal full-height photo strips side by side,
// with the title's characters spread evenly across the padded width at the
// layer's vertical position — mirroring `VerticalsPreview`.
async function exportVerticals(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Order matters: `layers` keeps the panel order, so strip index = position.
  const photoLayers = layers.filter((layer) => layer.kind === "image");
  const stripCount = Math.max(photoLayers.length, 1);
  const stripWidth = width / stripCount;
  let failedStrips = 0;
  for (let index = 0; index < photoLayers.length; index++) {
    const layer = photoLayers[index];
    if (!layer.visible || layer.kind !== "image") continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(
        ctx,
        img,
        { x: index * stripWidth, y: 0, w: stripWidth, h: height },
        imageTransform(layer),
      );
    } catch {
      failedStrips += 1;
    }
  }
  if (failedStrips > 0) {
    throw new ExportImageError(failedStrips);
  }

  const header = layers.find(
    (layer): layer is TextLayer => layer.kind === "header" && layer.visible,
  );
  if (header && header.text.trim()) {
    const font = fontById(header.fontId);
    const style = resolveTextStyle(header);
    const size = VERTICALS_LAYOUT.title.size * style.sizeScale * width;
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts
        .load(`${style.weight} ${size}px ${primaryFamily(font.family)}`)
        .catch(() => undefined);
    }
    const raw = header.uppercase ? header.text.toUpperCase() : header.text;
    // One glyph per strip: character i is centred on strip i, so the letter
    // count tracks the image count — matching the preview. Extra letters past
    // the strip count are dropped.
    const chars = verticalsTitleChars(raw).slice(0, stripCount);
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = header.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const y = style.posY * height;
    chars.forEach((char, index) => {
      if (char.trim()) ctx.fillText(char, (index + 0.5) * stripWidth, y);
    });
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a This-or-That poll: two full-height photos butted along the split,
// a stacked serif caption over them, an optional white poll card (one rounded row
// per visible option) and an optional brand wordmark footer — mirroring
// `DuelPreview`.
async function exportDuel(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Two photos side by side. Panel order = layer order (photo-1 left, photo-2 right).
  const photoLayers = layers
    .filter((layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image")
    .slice(0, 2);
  const splitX = DUEL_LAYOUT.splitX * width;
  const boxes = [
    { x: 0, y: 0, w: splitX, h: height },
    { x: splitX, y: 0, w: width - splitX, h: height },
  ];
  let failed = 0;
  for (let index = 0; index < photoLayers.length; index++) {
    const layer = photoLayers[index];
    if (!layer.visible) continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(ctx, img, boxes[index], imageTransform(layer));
    } catch {
      failed += 1;
    }
  }
  if (failed > 0) throw new ExportImageError(failed);

  // Preload the webfonts used by the text layers.
  const header = layers.find((layer): layer is TextLayer => layer.id === "header");
  const wordmark = layers.find((layer): layer is TextLayer => layer.id === "description");
  const options = duelVisibleOptions(layers);
  const textLayers = [header, wordmark, ...options].filter((layer): layer is TextLayer =>
    Boolean(layer && layer.visible && layer.text.trim()),
  );
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) => {
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // Stacked serif caption: one word per line, connectors smaller, block centred
  // vertically on the header's posY.
  if (header?.visible && header.text.trim()) {
    const font = fontById(header.fontId);
    const style = resolveTextStyle(header);
    const baseSize = DUEL_LAYOUT.headline.size * style.sizeScale * width;
    const words = duelCaptionWords(duelDisplayCase(header.text, header.uppercase));
    const lines = words.map((entry) => ({
      text: entry.word,
      size: entry.connector ? baseSize * DUEL_LAYOUT.headline.connectorScale : baseSize,
    }));
    const boxHeights = lines.map((line) => line.size * DUEL_LAYOUT.headline.lineHeight);
    const totalH = boxHeights.reduce((sum, value) => sum + value, 0);
    ctx.save();
    ctx.fillStyle = header.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = `${style.letterSpacing}em`;
    let y = style.posY * height - totalH / 2;
    lines.forEach((line, index) => {
      ctx.font = `${style.weight} ${line.size}px ${font.family}`;
      applyTextShadow(ctx, style.shadow, line.size);
      ctx.fillText(line.text, width / 2, y + boxHeights[index] / 2);
      y += boxHeights[index];
    });
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  // Poll card + option rows.
  const geo = duelPollGeometry(options.length, width, height);
  if (geo) {
    const padX = DUEL_LAYOUT.poll.padX * width;
    ctx.save();
    ctx.fillStyle = DUEL_LAYOUT.poll.cardColor;
    ctx.beginPath();
    ctx.roundRect(geo.x, geo.y, geo.w, geo.h, DUEL_LAYOUT.poll.radius * width);
    ctx.fill();
    options.forEach((option, index) => {
      const row = geo.rows[index];
      const rowX = geo.x + padX;
      const rowW = geo.w - 2 * padX;
      ctx.fillStyle = DUEL_LAYOUT.poll.rowColor;
      ctx.beginPath();
      ctx.roundRect(rowX, row.y, rowW, row.h, DUEL_LAYOUT.poll.rowRadius * width);
      ctx.fill();

      const font = fontById(option.fontId);
      const style = resolveTextStyle(option);
      const size = DUEL_LAYOUT.poll.labelSize * style.sizeScale * width;
      ctx.font = `${style.weight} ${size}px ${font.family}`;
      ctx.letterSpacing = `${style.letterSpacing}em`;
      ctx.fillStyle = option.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const label = option.uppercase ? option.text.toUpperCase() : option.text;
      ctx.fillText(label, rowX + DUEL_LAYOUT.poll.rowPadX * width, row.y + row.h / 2);
      ctx.letterSpacing = "0px";
    });
    ctx.restore();
  }

  // Brand wordmark footer (bottom-centred).
  if (wordmark?.visible && wordmark.text.trim()) {
    const font = fontById(wordmark.fontId);
    const style = resolveTextStyle(wordmark);
    const size = DUEL_LAYOUT.wordmark.size * style.sizeScale * width;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = wordmark.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const label = wordmark.uppercase ? wordmark.text.toUpperCase() : wordmark.text;
    ctx.fillText(label, width / 2, height - DUEL_LAYOUT.wordmark.bottom * height);
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

function fittedSingleLineSize(
  ctx: CanvasRenderingContext2D,
  label: string,
  font: string,
  baseSize: number,
  maxWidth: number,
  minSize: number,
): number {
  ctx.font = font.replace("{size}", `${baseSize}`);
  const measured = ctx.measureText(label).width;
  if (!measured || measured <= maxWidth) return baseSize;
  return Math.max(minSize, baseSize * (maxWidth / measured));
}

// Rasterize the Business Edition "This or that?" pin: fixed mixed-type
// headline, two rounded photos, optional handle/pill labels/bottom caption.
// Mirrors `BusinessChoicePreview`.
async function exportBusinessChoice(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photos = layers
    .filter((layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image")
    .slice(0, 2);
  const handle = byId<TextLayer>("eyebrow");
  const business = byId<TextLayer>("header");
  const edition = byId<TextLayer>("cta");
  const bottom = byId<TextLayer>("description");
  const headlineFonts = businessChoiceHeadlineFontIds(layers);
  const geometry = businessChoiceGeometry(template.aspectRatio);

  const textLayers = [handle, business, edition, bottom].filter((layer): layer is TextLayer =>
    Boolean(layer && layer.visible && layer.text.trim()),
  );
  const headlineFontIds = [
    headlineFonts.thisFontId,
    headlineFonts.orFontId,
    headlineFonts.thatFontId,
  ];
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all([
      ...textLayers.map((layer) =>
        document.fonts
          .load(
            `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
          )
          .catch(() => undefined),
      ),
      ...headlineFontIds.map((fontId) =>
        document.fonts
          .load(`400 100px ${primaryFamily(fontById(fontId).family)}`)
          .catch(() => undefined),
      ),
    ]).catch(() => undefined);
  }

  ctx.fillStyle = businessChoiceBackground(template, layers);
  ctx.fillRect(0, 0, width, height);

  const H = geometry.headline;
  const headlineColor = business?.color ?? BUSINESS_CHOICE_LAYOUT.colors.defaultText;
  // When a custom (e.g. brand-kit) font replaces the default Anton/Poppins/
  // italic-Playfair mix, its glyph widths can differ enough to overflow the
  // layout's fixed per-word slots — rescale each word to the reference's
  // proportion so the three never overlap.
  const headlineFit = businessChoiceHeadlineFit(headlineFonts);
  ctx.save();
  ctx.fillStyle = headlineColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.letterSpacing = "0px";
  ctx.font = `400 ${H.thisSize * width * headlineFit.thisScale}px ${fontById(headlineFonts.thisFontId).family}`;
  ctx.fillText(BUSINESS_CHOICE_LAYOUT.headline.thisText, H.thisLeft * width, H.thisTop * height);
  ctx.font = `400 ${H.orSize * width * headlineFit.orScale}px ${fontById(headlineFonts.orFontId).family}`;
  ctx.fillText(BUSINESS_CHOICE_LAYOUT.headline.orText, H.orLeft * width, H.orTop * height);
  ctx.font = `italic 400 ${H.thatSize * width * headlineFit.thatScale}px ${fontById(headlineFonts.thatFontId).family}`;
  ctx.fillText(BUSINESS_CHOICE_LAYOUT.headline.thatText, H.thatLeft * width, H.thatTop * height);
  ctx.restore();

  let failed = 0;
  for (let index = 0; index < photos.length; index++) {
    const layer = photos[index];
    if (!layer.visible) continue;
    const boxConfig = geometry.photos[index];
    if (!boxConfig) continue;
    const box = {
      x: boxConfig.x * width,
      y: boxConfig.y * height,
      w: boxConfig.w * width,
      h: boxConfig.h * height,
    };
    try {
      const img = await loadImage(layer.src);
      drawRoundedImageCover(ctx, img, box, boxConfig.radius * width, imageTransform(layer));
    } catch {
      failed += 1;
    }
  }
  if (failed > 0) throw new ExportImageError(failed);

  if (handle?.visible && handle.text.trim()) {
    const style = resolveTextStyle(handle);
    const font = fontById(handle.fontId);
    const label = handle.uppercase ? handle.text.toUpperCase() : handle.text;
    const size = geometry.handle.size * style.sizeScale * width;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = handle.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, geometry.handle.centerX * width, geometry.handle.top * height);
    ctx.restore();
  }

  const drawPill = (layer: TextLayer | undefined, boxConfig: typeof geometry.pills.business) => {
    if (!layer?.visible || !layer.text.trim()) return;
    const style = resolveTextStyle(layer);
    const font = fontById(layer.fontId);
    const label = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    const x = boxConfig.x * width;
    const y = boxConfig.y * height;
    const w = boxConfig.w * width;
    const h = boxConfig.h * height;
    const radius = geometry.pills.radius * width;
    const border = geometry.pills.border * width;

    ctx.save();
    ctx.fillStyle = businessChoicePillFill(layers);
    ctx.strokeStyle = BUSINESS_CHOICE_LAYOUT.colors.pillBorder;
    ctx.lineWidth = border;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.stroke();

    const baseSize = geometry.pills.labelSize * style.sizeScale * width;
    const templateFont = `${style.weight} {size}px ${font.family}`;
    const size = fittedSingleLineSize(ctx, label, templateFont, baseSize, w * 0.76, width * 0.014);
    ctx.font = templateFont.replace("{size}", `${size}`);
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = businessChoicePillTextColor(layers);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.restore();
  };
  drawPill(business, geometry.pills.business);
  drawPill(edition, geometry.pills.edition);

  if (bottom?.visible && bottom.text.trim()) {
    const style = resolveTextStyle(bottom);
    const font = fontById(bottom.fontId);
    const label = bottom.uppercase ? bottom.text.toUpperCase() : bottom.text;
    const baseSize = geometry.bottom.size * style.sizeScale * width;
    const templateFont = `italic ${style.weight} {size}px ${font.family}`;
    const size = fittedSingleLineSize(
      ctx,
      label,
      templateFont,
      baseSize,
      geometry.bottom.width * width,
      width * 0.018,
    );
    ctx.save();
    ctx.font = templateFont.replace("{size}", `${size}`);
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = bottom.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, geometry.bottom.centerX * width, geometry.bottom.top * height);
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

function testimonialWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  return text
    .split(/\n/)
    .flatMap((line) => (line.trim() ? wrapLines(ctx, line.trim(), maxWidth) : [""]));
}

function fittedMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontTemplate: string,
  baseSize: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number,
  minSize: number,
): { size: number; lines: string[] } {
  let size = baseSize;
  let lines: string[] = [];
  while (size > minSize) {
    ctx.font = fontTemplate.replace("{size}", `${size}`);
    lines = testimonialWrappedLines(ctx, text, maxWidth);
    if (lines.length * size * lineHeight <= maxHeight) break;
    size -= 1;
  }
  ctx.font = fontTemplate.replace("{size}", `${size}`);
  return { size, lines: testimonialWrappedLines(ctx, text, maxWidth) };
}

// Rasterize the Olivia testimonial card: blurred avatar background, floating
// white card, circular avatar, five stars, optional review and author text.
// Mirrors `TestimonialPreview`.
async function exportTestimonial(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const imageLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = byId<TextLayer>("header");
  const testimonial = byId<TextLayer>("description");
  const author = byId<TextLayer>("cta");
  const geometry = testimonialGeometry(template.aspectRatio);
  const textLayers = [header, testimonial, author].filter((layer): layer is TextLayer =>
    Boolean(layer && layer.visible && layer.text.trim()),
  );

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) =>
        document.fonts
          .load(
            `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
          )
          .catch(() => undefined),
      ),
    ).catch(() => undefined);
  }

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  if (imageLayer?.visible) {
    try {
      const img = await loadImage(imageLayer.src);
      ctx.save();
      ctx.filter = `blur(${TESTIMONIAL_LAYOUT.backdrop.blur * width}px)`;
      ctx.globalAlpha = 0.86;
      const overflow = ((TESTIMONIAL_LAYOUT.backdrop.scale - 1) / 2) * width;
      drawImageCover(ctx, img, {
        x: -overflow,
        y: -overflow,
        w: width + overflow * 2,
        h: height + overflow * 2,
      });
      ctx.restore();
    } catch {
      throw new ExportImageError(1);
    }
  }

  const glowA = ctx.createRadialGradient(
    width * 0.24,
    height * 0.16,
    0,
    width * 0.24,
    height * 0.16,
    width * 0.3,
  );
  glowA.addColorStop(0, "rgba(255,255,255,0.62)");
  glowA.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  const glowB = ctx.createRadialGradient(
    width * 0.73,
    height * 0.71,
    0,
    width * 0.73,
    height * 0.71,
    width * 0.33,
  );
  glowB.addColorStop(0, "rgba(255,255,255,0.5)");
  glowB.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = TESTIMONIAL_LAYOUT.colors.warmWash;
  ctx.fillRect(0, 0, width, height);

  const card = {
    x: geometry.card.x * width,
    y: geometry.card.y * height,
    w: geometry.card.w * width,
    h: geometry.card.h * height,
  };
  ctx.save();
  ctx.shadowColor = TESTIMONIAL_LAYOUT.colors.shadow;
  ctx.shadowBlur = geometry.card.shadowBlur * width;
  ctx.shadowOffsetY = geometry.card.shadowY * width;
  ctx.fillStyle = TESTIMONIAL_LAYOUT.colors.card;
  ctx.beginPath();
  ctx.roundRect(card.x, card.y, card.w, card.h, geometry.card.radius * width);
  ctx.fill();
  ctx.restore();

  if (imageLayer?.visible) {
    try {
      const img = await loadImage(imageLayer.src);
      const size = geometry.avatar.size * width;
      drawRoundedImageCover(
        ctx,
        img,
        {
          x: geometry.avatar.centerX * width - size / 2,
          y: geometry.avatar.top * height,
          w: size,
          h: size,
        },
        size / 2,
        imageTransform(imageLayer),
      );
    } catch {
      throw new ExportImageError(1);
    }
  }

  const drawTextBlock = (
    layer: TextLayer | undefined,
    box: { centerX: number; top: number; width: number; size: number },
    options: { lineHeight: number; italic?: boolean; maxHeight: number },
  ) => {
    if (!layer?.visible || !layer.text.trim()) return;
    const style = resolveTextStyle(layer);
    const font = fontById(layer.fontId);
    const label = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    const baseSize = box.size * style.sizeScale * width;
    const fontTemplate = `${options.italic ? "italic " : ""}${style.weight} {size}px ${font.family}`;
    const { size, lines } = fittedMultilineText(
      ctx,
      label,
      fontTemplate,
      baseSize,
      box.width * width,
      options.maxHeight * height,
      options.lineHeight,
      width * 0.014,
    );
    ctx.save();
    ctx.font = fontTemplate.replace("{size}", `${size}`);
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const linePx = size * options.lineHeight;
    lines.forEach((line, index) => {
      ctx.fillText(line, box.centerX * width, box.top * height + index * linePx);
    });
    ctx.restore();
  };

  drawTextBlock(header, geometry.header, {
    lineHeight: TESTIMONIAL_LAYOUT.header.lineHeight,
    maxHeight: 0.06,
  });

  ctx.save();
  ctx.fillStyle = author?.color ?? TESTIMONIAL_LAYOUT.colors.star;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${geometry.stars.size * width}px ${fontById("quicksand").family}`;
  for (let i = 0; i < 5; i++) {
    ctx.fillText(
      "★",
      geometry.stars.centerX * width + (i - 2) * geometry.stars.gap * width,
      geometry.stars.centerY * height,
    );
  }
  ctx.restore();

  drawTextBlock(testimonial, geometry.testimonial, {
    italic: true,
    lineHeight: TESTIMONIAL_LAYOUT.testimonial.lineHeight,
    maxHeight: Math.max(0.12, geometry.author.top - geometry.testimonial.top - 0.035),
  });
  drawTextBlock(author, geometry.author, {
    lineHeight: TESTIMONIAL_LAYOUT.author.lineHeight,
    maxHeight: 0.08,
  });

  return canvasToBlob(canvas, format);
}

function drawTestimonialArcTitle(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer | undefined,
  geometry: ReturnType<typeof testimonialArcGeometry>,
  width: number,
  height: number,
) {
  if (!layer?.visible || !layer.text.trim()) return;
  const style = resolveTextStyle(layer);
  const font = fontById(layer.fontId);
  const chars = testimonialArcChars(layer.uppercase ? layer.text.toUpperCase() : layer.text);
  if (!chars.length) return;
  const mid = (chars.length - 1) / 2;
  const size = geometry.arc.size * style.sizeScale * width;

  ctx.save();
  ctx.fillStyle = layer.color;
  ctx.font = `${style.weight} ${size}px ${font.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  chars.forEach((char, index) => {
    const angle = (index - mid) * geometry.arc.stepDeg;
    const radians = (angle * Math.PI) / 180;
    const x = geometry.arc.centerX * width + Math.sin(radians) * geometry.arc.radius * width;
    const y = geometry.arc.centerY * height - Math.cos(radians) * geometry.arc.radius * width;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

function drawTestimonialArcSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const outer = size / 2;
  const inner = size * 0.13;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? outer : inner;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// Rasterize the Claudia arced testimonial story. Mirrors
// `TestimonialArcPreview`.
async function exportTestimonialArc(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const imageLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const title = byId<TextLayer>("header");
  const testimonial = byId<TextLayer>("description");
  const author = byId<TextLayer>("cta");
  const handle = byId<TextLayer>("eyebrow");
  const website = byId<TextLayer>("website");
  const geometry = testimonialArcGeometry(template.aspectRatio);
  const textLayers = [title, testimonial, author, handle, website].filter(
    (layer): layer is TextLayer => Boolean(layer && layer.visible && layer.text.trim()),
  );

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all([
      ...textLayers.map((layer) =>
        document.fonts
          .load(
            `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
          )
          .catch(() => undefined),
      ),
      document.fonts
        .load(`700 64px ${primaryFamily(fontById("poppins").family)}`)
        .catch(() => undefined),
    ]).catch(() => undefined);
  }

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  if (imageLayer?.visible) {
    try {
      const img = await loadImage(imageLayer.src);
      ctx.save();
      ctx.filter = `blur(${TESTIMONIAL_ARC_LAYOUT.backdrop.blur * width}px)`;
      ctx.globalAlpha = TESTIMONIAL_ARC_LAYOUT.backdrop.opacity;
      const overflow = ((TESTIMONIAL_ARC_LAYOUT.backdrop.scale - 1) / 2) * width;
      drawImageCover(ctx, img, {
        x: -overflow,
        y: -overflow,
        w: width + overflow * 2,
        h: height + overflow * 2,
      });
      ctx.restore();
    } catch {
      throw new ExportImageError(1);
    }
  }

  ctx.fillStyle = "rgba(189,167,151,0.78)";
  ctx.fillRect(0, 0, width, height);
  const shade = ctx.createLinearGradient(0, 0, width, 0);
  shade.addColorStop(0, "rgba(244,238,226,0.24)");
  shade.addColorStop(0.3, "rgba(244,238,226,0)");
  shade.addColorStop(1, "rgba(126,105,91,0.14)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  drawTestimonialArcTitle(ctx, title, geometry, width, height);

  ctx.save();
  ctx.fillStyle = TESTIMONIAL_ARC_LAYOUT.colors.card;
  ctx.shadowColor = TESTIMONIAL_ARC_LAYOUT.colors.cardShadow;
  ctx.shadowBlur = 0.03 * width;
  ctx.shadowOffsetY = 0.012 * width;
  ctx.beginPath();
  ctx.roundRect(
    geometry.card.x * width,
    geometry.card.y * height,
    geometry.card.w * width,
    geometry.card.h * height,
    geometry.card.radius * width,
  );
  ctx.fill();
  ctx.restore();

  if (imageLayer?.visible) {
    try {
      const img = await loadImage(imageLayer.src);
      const size = geometry.avatar.size * width;
      drawRoundedImageCover(
        ctx,
        img,
        {
          x: geometry.avatar.centerX * width - size / 2,
          y: geometry.avatar.top * height,
          w: size,
          h: size,
        },
        geometry.avatar.radius * width,
        imageTransform(imageLayer),
      );
    } catch {
      throw new ExportImageError(1);
    }
  }

  ctx.save();
  ctx.fillStyle = TESTIMONIAL_ARC_LAYOUT.sparkle.fill;
  geometry.sparkles.forEach((sparkle) => {
    drawTestimonialArcSparkle(ctx, sparkle.x * width, sparkle.y * height, sparkle.size * width);
  });
  ctx.restore();

  const drawTextBlock = (
    layer: TextLayer | undefined,
    box: { centerX: number; top: number; width: number; size: number },
    options: { lineHeight: number; maxHeight: number },
  ) => {
    if (!layer?.visible || !layer.text.trim()) return;
    const style = resolveTextStyle(layer);
    const font = fontById(layer.fontId);
    const label = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    const baseSize = box.size * style.sizeScale * width;
    const fontTemplate = `${style.weight} {size}px ${font.family}`;
    const { size, lines } = fittedMultilineText(
      ctx,
      label,
      fontTemplate,
      baseSize,
      box.width * width,
      options.maxHeight * height,
      options.lineHeight,
      width * 0.012,
    );
    ctx.save();
    ctx.font = fontTemplate.replace("{size}", `${size}`);
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const linePx = size * options.lineHeight;
    lines.forEach((line, index) => {
      ctx.fillText(line, box.centerX * width, box.top * height + index * linePx);
    });
    ctx.restore();
  };

  drawTextBlock(testimonial, geometry.testimonial, {
    lineHeight: TESTIMONIAL_ARC_LAYOUT.testimonial.lineHeight,
    maxHeight: 0.12,
  });
  drawTextBlock(author, geometry.author, {
    lineHeight: TESTIMONIAL_ARC_LAYOUT.author.lineHeight,
    maxHeight: 0.055,
  });
  drawTextBlock(handle, geometry.handle, {
    lineHeight: TESTIMONIAL_ARC_LAYOUT.handle.lineHeight,
    maxHeight: 0.035,
  });

  const pill = {
    x: (geometry.stars.centerX - geometry.stars.pillW / 2) * width,
    y: (geometry.stars.centerY - geometry.stars.pillH / 2) * height,
    w: geometry.stars.pillW * width,
    h: geometry.stars.pillH * height,
  };
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = TESTIMONIAL_ARC_LAYOUT.colors.pillBorder;
  ctx.lineWidth = geometry.stars.border * width;
  ctx.beginPath();
  ctx.roundRect(pill.x, pill.y, pill.w, pill.h, pill.h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = TESTIMONIAL_ARC_LAYOUT.colors.star;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${geometry.stars.size * width}px ${fontById("poppins").family}`;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillText(
      "★",
      geometry.stars.centerX * width + (i - 2) * geometry.stars.gap * width,
      geometry.stars.centerY * height,
    );
  }
  ctx.restore();

  drawTextBlock(website, geometry.website, {
    lineHeight: TESTIMONIAL_ARC_LAYOUT.website.lineHeight,
    maxHeight: 0.045,
  });

  return canvasToBlob(canvas, format);
}

// Rasterize a city postcard: a full-bleed photo, the city name stacked one
// glyph per cell down the right column (each stretched to fill its cell and
// difference-blended over the photo so it inverts the picture beneath), a
// rotated subtitle up the left gutter and a tracked country label bottom-right.
// Mirrors `PostcardPreview`.
async function exportPostcard(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const city = byId<TextLayer>("header");
  const subtitle = byId<TextLayer>("eyebrow");
  const country = byId<TextLayer>("cta");

  // Paper canvas.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Full-bleed photo into its frame (paper shows in the gutter and footer).
  const p = POSTCARD_LAYOUT.photo;
  const photoBox = {
    x: p.left * width,
    y: p.top * height,
    w: (p.right - p.left) * width,
    h: (p.bottom - p.top) * height,
  };
  if (photoLayer?.visible && photoLayer.src) {
    try {
      const img = await loadImage(photoLayer.src);
      drawImageCover(ctx, img, photoBox, imageTransform(photoLayer));
    } catch {
      throw new ExportImageError(1);
    }
  }

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [city, subtitle, country].map((layer) => {
        if (!layer?.visible || !layer.text.trim()) return Promise.resolve();
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // Giant stacked city name — one glyph per cell, each stretched to fill its
  // cell, drawn white and difference-blended over the photo so it inverts the
  // picture (light letters over dark areas, dark letters over light ones).
  if (city?.visible && city.text.trim()) {
    const font = fontById(city.fontId);
    const style = resolveTextStyle(city);
    const label = city.uppercase ? city.text.toUpperCase() : city.text;
    const chars = postcardTitleChars(label);
    if (chars.length) {
      const geo = postcardTitleGeometry(chars.length, width, height);
      const fallbackSize = geo.cellH / POSTCARD_LAYOUT.title.capRatio;
      ctx.save();
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = city.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      chars.forEach((ch, index) => {
        const cell = geo.cells[index];
        const met = slicedGlyphMetrics(ch, city.fontId, style.weight);
        ctx.save();
        ctx.beginPath();
        ctx.rect(geo.left, cell.y, geo.w, cell.h);
        ctx.clip();
        if (met) {
          // Stretch the glyph's ink box to fill the whole cell (full width and
          // height), so every letter reads as one solid block down the column.
          ctx.translate(geo.left, cell.y);
          ctx.scale(geo.w / met.inkW, cell.h / met.inkH);
          ctx.font = `${style.weight} ${met.refSize}px ${font.family}`;
          ctx.fillText(ch, met.left, met.ascent);
        } else {
          // Approximate cap-height fit when ink metrics are unavailable.
          ctx.font = `${style.weight} ${fallbackSize}px ${font.family}`;
          const natural = ctx.measureText(ch).width || 1;
          const baseline = cell.y + (cell.h + fallbackSize * POSTCARD_LAYOUT.title.capRatio) / 2;
          ctx.translate(geo.left, baseline);
          ctx.scale(geo.w / natural, 1);
          ctx.fillText(ch, 0, 0);
        }
        ctx.restore();
      });
      ctx.restore();
    }
  }

  // Rotated subtitle up the left gutter (reads bottom-to-top).
  if (subtitle?.visible && subtitle.text.trim()) {
    const font = fontById(subtitle.fontId);
    const style = resolveTextStyle(subtitle);
    const size = POSTCARD_LAYOUT.subtitle.size * style.sizeScale * width;
    const label = subtitle.uppercase ? subtitle.text.toUpperCase() : subtitle.text;
    ctx.save();
    ctx.translate(
      POSTCARD_LAYOUT.subtitle.centerX * width,
      POSTCARD_LAYOUT.subtitle.centerY * height,
    );
    ctx.rotate(-Math.PI / 2);
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing || POSTCARD_LAYOUT.subtitle.tracking}em`;
    ctx.fillStyle = subtitle.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0);
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  // Country label — ink on the paper footer, right-aligned to the title edge.
  if (country?.visible && country.text.trim()) {
    const font = fontById(country.fontId);
    const style = resolveTextStyle(country);
    const size = POSTCARD_LAYOUT.country.size * style.sizeScale * width;
    const label = country.uppercase ? country.text.toUpperCase() : country.text;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing || POSTCARD_LAYOUT.country.tracking}em`;
    ctx.fillStyle = country.color;
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      label,
      POSTCARD_LAYOUT.country.right * width,
      POSTCARD_LAYOUT.country.baseline * height,
    );
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

// Draw a small US flag into the box (white field, 13 red/white stripes, a blue
// canton with a grid of white stars). Shared spec with the DOM preview's SVG.
function drawUsFlag(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
) {
  const { x, y, w, h } = box;
  const stripeH = h / 13;
  ctx.save();
  ctx.fillStyle = "#f4f4f2";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#b7332f";
  for (let i = 0; i < 13; i += 2) {
    ctx.fillRect(x, y + i * stripeH, w, stripeH);
  }
  const cantonW = w * 0.4;
  const cantonH = stripeH * 7;
  ctx.fillStyle = "#1c2a5e";
  ctx.fillRect(x, y, cantonW, cantonH);
  // Star grid: 5 columns × 4 rows of small dots inside the canton.
  ctx.fillStyle = "#f4f4f2";
  const cols = 5;
  const rows = 4;
  const r = Math.max(cantonW / 22, 0.5);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = x + ((col + 0.5) / cols) * cantonW;
      const sy = y + ((row + 0.5) / rows) * cantonH;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Rasterize a city text-mask poster: a full-bleed photo revealed only through a
// giant word-wrapped city name (everything else black), with an optional
// right-aligned country label and flag in the upper right. Mirrors
// `CityMaskPreview`.
async function exportCityMask(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const city = byId<TextLayer>("header");
  const country = byId<TextLayer>("cta");

  // Solid black canvas — the photo only shows through the letters.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  let photo: HTMLImageElement | null = null;
  if (photoLayer?.visible && photoLayer.src) {
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
  }
  const photoTransform = photoLayer ? imageTransform(photoLayer) : DEFAULT_IMAGE_TRANSFORM;

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [city, country].map((layer) => {
        if (!layer?.visible || !layer.text.trim()) return Promise.resolve();
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // Giant word-wrapped city name, used to mask the full-bleed photo.
  if (city?.visible && city.text.trim()) {
    const font = fontById(city.fontId);
    const style = resolveTextStyle(city);
    const label = city.uppercase ? city.text.toUpperCase() : city.text;
    const geo = cityMaskGeometry(label, city.fontId, style.weight, width, height);
    if (geo.lines.length && geo.fontSize > 0) {
      const paintText = (target: CanvasRenderingContext2D) => {
        target.save();
        // Stretch the block vertically to fill the box (letters keep their width).
        target.translate(0, geo.top);
        target.scale(1, geo.scaleY);
        target.font = `${style.weight} ${geo.fontSize}px ${font.family}`;
        target.textAlign = "left";
        target.textBaseline = "alphabetic";
        geo.lines.forEach((line) => target.fillText(line.text, geo.left, line.baseline));
        target.restore();
      };
      if (photo) {
        // Paint the letters into a mask, keep the photo only where they are, then
        // composite the masked photo over the black canvas.
        const mask = document.createElement("canvas");
        mask.width = width;
        mask.height = height;
        const maskCtx = mask.getContext("2d");
        if (maskCtx) {
          maskCtx.fillStyle = "#000";
          paintText(maskCtx);
          maskCtx.globalCompositeOperation = "source-in";
          drawImageCover(maskCtx, photo, { x: 0, y: 0, w: width, h: height }, photoTransform);
          ctx.drawImage(mask, 0, 0);
        }
      } else {
        ctx.save();
        ctx.fillStyle = city.color;
        paintText(ctx);
        ctx.restore();
      }
    }
  }

  // Country label + flag, upper right.
  if (country?.visible && country.text.trim()) {
    const font = fontById(country.fontId);
    const style = resolveTextStyle(country);
    const label = country.uppercase ? country.text.toUpperCase() : country.text;
    const lines = cityMaskLabelLines(label, country.fontId, style.weight, width);
    const size = CITYMASK_LAYOUT.label.size * style.sizeScale * width;
    const slot = size * CITYMASK_LAYOUT.label.lineHeight;
    const rightX = CITYMASK_LAYOUT.label.right * width;
    const topY = CITYMASK_LAYOUT.label.top * height;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing || CITYMASK_LAYOUT.label.tracking}em`;
    ctx.fillStyle = country.color;
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    lines.forEach((line, i) => ctx.fillText(line, rightX, topY + i * slot + size * 0.8));
    ctx.letterSpacing = "0px";
    ctx.restore();

    // Flag beneath the label, right-aligned to the same edge.
    const flagW = CITYMASK_LAYOUT.flag.width * width;
    const flagH = flagW / CITYMASK_LAYOUT.flag.aspect;
    const flagY = topY + lines.length * slot + CITYMASK_LAYOUT.label.gap * height;
    drawUsFlag(ctx, { x: rightX - flagW, y: flagY, w: flagW, h: flagH });
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a self split-portrait poster: a full-bleed photo on the left half
// and the caption set as one giant letter per row on the right, each letter a
// window revealing the same full-frame photo (everything else white). Mirrors
// `SelfPreview`.
async function exportSelf(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = byId<TextLayer>("header");

  // White canvas — the photo shows through the left panel and the letters.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  let photo: HTMLImageElement | null = null;
  if (photoLayer?.visible && photoLayer.src) {
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
  }
  const photoTransform = photoLayer ? imageTransform(photoLayer) : DEFAULT_IMAGE_TRANSFORM;

  if (typeof document !== "undefined" && document.fonts && header?.visible && header.text.trim()) {
    const font = fontById(header.fontId);
    await document.fonts
      .load(`${resolveTextStyle(header).weight} 100px ${primaryFamily(font.family)}`)
      .catch(() => undefined);
  }

  const chars = header?.visible
    ? selfChars(header.uppercase ? header.text.toUpperCase() : header.text)
    : [];
  const style = header ? resolveTextStyle(header) : null;
  const geo =
    header && style ? selfGeometry(chars, header.fontId, style.weight, width, height) : null;

  // Paint the left photo panel plus the stacked letters onto `target`. Each
  // glyph's ink box is stretched (scaleX/scaleY) to fill its fixed-width cell,
  // so every letter reads the same width as in the reference.
  const paintRegions = (target: CanvasRenderingContext2D) => {
    target.fillRect(0, 0, geo ? geo.photoRight : width * 0.5, height);
    if (geo && header && style && geo.cap > 0) {
      const font = fontById(header.fontId);
      target.textAlign = "left";
      target.textBaseline = "alphabetic";
      geo.cells.forEach((cell) => {
        target.save();
        const met = slicedGlyphMetrics(cell.char, header.fontId, style.weight);
        if (met) {
          target.translate(geo.left, cell.top);
          target.scale(geo.cellW / met.inkW, geo.cap / met.inkH);
          target.font = `${style.weight} ${met.refSize}px ${font.family}`;
          target.fillText(cell.char, met.left, met.ascent);
        } else {
          // Approximate cap-height fit when ink metrics are unavailable.
          target.font = `${style.weight} ${geo.fontSize}px ${font.family}`;
          const natural = target.measureText(cell.char).width || 1;
          target.translate(geo.left, cell.top + geo.cap);
          target.scale(geo.cellW / natural, 1);
          target.fillText(cell.char, 0, 0);
        }
        target.restore();
      });
    }
  };

  if (photo) {
    // Paint the panel + letters into a mask, keep the (grayscale) photo only
    // where they are, then composite that over the white canvas.
    const mask = document.createElement("canvas");
    mask.width = width;
    mask.height = height;
    const maskCtx = mask.getContext("2d");
    if (maskCtx) {
      maskCtx.fillStyle = "#000";
      paintRegions(maskCtx);
      maskCtx.globalCompositeOperation = "source-in";
      maskCtx.filter = "grayscale(1)";
      drawImageCover(maskCtx, photo, { x: 0, y: 0, w: width, h: height }, photoTransform);
      ctx.drawImage(mask, 0, 0);
    }
  } else if (header) {
    ctx.save();
    ctx.fillStyle = header.color;
    paintRegions(ctx);
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a Statement Portrait poster: a full-bleed photo on the left half
// and a giant word-wrapped statement on the right, each line revealing the
// same continuous photo (everything else white), plus an optional small
// tracked tagline + underline beside it. Mirrors `StatementPreview`.
async function exportStatement(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = byId<TextLayer>("header");
  const tag = byId<TextLayer>("cta");

  // White canvas — the photo shows through the left panel and the caption.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  let photo: HTMLImageElement | null = null;
  if (photoLayer?.visible && photoLayer.src) {
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
  }
  const photoTransform = photoLayer ? imageTransform(photoLayer) : DEFAULT_IMAGE_TRANSFORM;

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header, tag].map((layer) => {
        if (!layer?.visible || !layer.text.trim()) return Promise.resolve();
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  const style = header ? resolveTextStyle(header) : null;
  const label = header ? (header.uppercase ? header.text.toUpperCase() : header.text) : "";
  const geo =
    header?.visible && style
      ? statementGeometry(label, header.fontId, style.weight, width, height)
      : null;

  // Paint the left photo panel plus the word-wrapped caption onto `target`.
  const paintRegions = (target: CanvasRenderingContext2D) => {
    target.fillRect(0, 0, geo ? geo.photoRight : width * STATEMENT_LAYOUT.photoRight, height);
    if (geo && header && style && geo.lines.length && geo.fontSize > 0) {
      const font = fontById(header.fontId);
      target.save();
      target.translate(0, geo.top);
      target.scale(1, geo.scaleY);
      target.font = `${style.weight} ${geo.fontSize}px ${font.family}`;
      target.textAlign = "left";
      target.textBaseline = "alphabetic";
      geo.lines.forEach((line) => target.fillText(line.text, geo.left, line.baseline));
      target.restore();
    }
  };

  if (photo) {
    // Paint the panel + caption into a mask, keep the photo only where they
    // are, then composite that over the white canvas.
    const mask = document.createElement("canvas");
    mask.width = width;
    mask.height = height;
    const maskCtx = mask.getContext("2d");
    if (maskCtx) {
      maskCtx.fillStyle = "#000";
      paintRegions(maskCtx);
      maskCtx.globalCompositeOperation = "source-in";
      drawImageCover(maskCtx, photo, { x: 0, y: 0, w: width, h: height }, photoTransform);
      ctx.drawImage(mask, 0, 0);
    }
  } else if (header) {
    ctx.save();
    ctx.fillStyle = header.color;
    paintRegions(ctx);
    ctx.restore();
  }

  // Optional tagline + underline, plain ink over the white canvas (not masked
  // by the photo) — sits beside the shorter wrapped rows.
  if (tag?.visible && tag.text.trim()) {
    const T = STATEMENT_LAYOUT.tag;
    const font = fontById(tag.fontId);
    const tagStyle = resolveTextStyle(tag);
    const label = tag.uppercase ? tag.text.toUpperCase() : tag.text;
    const lines = statementTagLines(
      label,
      tag.fontId,
      tagStyle.weight,
      width,
      tagStyle.letterSpacing || T.tracking,
    );
    const size = T.size * tagStyle.sizeScale * width;
    const slot = size * T.lineHeight;
    // Nest beside whichever wrapped caption row has the most spare room; fall
    // back to the fixed corner position when there's no caption to anchor to.
    const anchor = geo ? statementTagAnchor(geo, width) : null;
    const blockH = lines.length * slot;
    const x = anchor ? anchor.x : T.left * width;
    const topY = anchor ? anchor.centerY - blockH / 2 : T.top * height;

    ctx.save();
    ctx.font = `${tagStyle.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${tagStyle.letterSpacing || T.tracking}em`;
    ctx.fillStyle = tag.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    let widest = 0;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, topY + i * slot + size * 0.85);
      widest = Math.max(widest, ctx.measureText(line).width);
    });
    ctx.letterSpacing = "0px";
    ctx.restore();

    // Underline beneath the last line, overshooting the text a touch either side.
    const underlineY = topY + lines.length * slot + T.underlineGap * width;
    ctx.fillStyle = tag.color;
    ctx.fillRect(
      x - T.underlineExtendLeft * width,
      underlineY,
      widest + (T.underlineExtendLeft + T.underlineExtendRight) * width,
      T.underlineWeight * width,
    );
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a Woven Calm poster: a warm stone canvas with a tall photo panel on
// the left, and on the right a large serif title (word-wrapped) stacked over a
// small grey body paragraph (word-wrapped). Mirrors `WovenPreview`.
async function exportWoven(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = byId<TextLayer>("header");
  const body = byId<TextLayer>("description");

  // Warm stone canvas (or the chosen brand background).
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Ensure both faces are loaded before we measure/wrap and paint.
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header, body]
        .filter((layer): layer is TextLayer => Boolean(layer?.visible && layer.text.trim()))
        .map((layer) =>
          document.fonts
            .load(
              `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
            )
            .catch(() => undefined),
        ),
    );
  }

  const headerStyle = header ? resolveTextStyle(header) : null;
  const bodyStyle = body ? resolveTextStyle(body) : null;
  const geo = wovenGeometry(
    header?.visible ? header.text : "",
    header?.fontId ?? "playfair",
    headerStyle?.weight ?? 500,
    header?.uppercase ?? true,
    body?.visible ? body.text : "",
    body?.fontId ?? "montserrat",
    bodyStyle?.weight ?? 400,
    width,
    height,
  );

  // Photo panel on the left.
  if (photoLayer?.visible && photoLayer.src) {
    let photo: HTMLImageElement;
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
    drawImageCover(ctx, photo, geo.photo, imageTransform(photoLayer));
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (header?.visible && headerStyle) {
    ctx.fillStyle = header.color;
    ctx.font = `${headerStyle.weight} ${geo.titleFontSize}px ${fontById(header.fontId).family}`;
    for (const line of geo.titleLines) {
      ctx.fillText(line.text, geo.colLeft, line.baseline);
    }
  }

  if (body?.visible && bodyStyle) {
    ctx.fillStyle = body.color;
    ctx.font = `${bodyStyle.weight} ${geo.bodyFontSize}px ${fontById(body.fontId).family}`;
    for (const line of geo.bodyLines) {
      ctx.fillText(line.text, geo.colLeft, line.baseline);
    }
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a Studio Brief poster: a white paper panel on the left carrying a
// bullet-and-rule marker, a bold serif category caption and a mission
// paragraph, beside a full-bleed photo in its own box on the right. Mirrors
// `BriefPreview`.
async function exportBrief(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = byId<TextLayer>("header");
  const body = byId<TextLayer>("description");

  // Paper canvas (or the chosen brand background).
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Ensure both faces are loaded before we measure/wrap and paint.
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header, body]
        .filter((layer): layer is TextLayer => Boolean(layer?.visible && layer.text.trim()))
        .map((layer) =>
          document.fonts
            .load(
              `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
            )
            .catch(() => undefined),
        ),
    );
  }

  const headerStyle = header ? resolveTextStyle(header) : null;
  const bodyStyle = body ? resolveTextStyle(body) : null;
  const geo = briefGeometry(
    header?.visible ? header.text : "",
    header?.fontId ?? "playfair",
    headerStyle?.weight ?? 700,
    header?.uppercase ?? false,
    body?.visible ? body.text : "",
    body?.fontId ?? "quicksand",
    bodyStyle?.weight ?? 400,
    width,
    height,
  );

  // Full-bleed photo in its own box on the right.
  if (photoLayer?.visible && photoLayer.src) {
    let photo: HTMLImageElement;
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
    drawImageCover(ctx, photo, geo.photo, imageTransform(photoLayer));
  }

  // Bullet-and-rule marker, tinted with the caption's colour.
  ctx.save();
  ctx.fillStyle = header?.color ?? "#000000";
  ctx.fillRect(
    geo.marker.x1,
    geo.marker.y - geo.marker.lineWidth / 2,
    geo.marker.x2 - geo.marker.x1,
    geo.marker.lineWidth,
  );
  ctx.beginPath();
  ctx.arc(geo.marker.dotX, geo.marker.y, geo.marker.dotR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (header?.visible && headerStyle) {
    ctx.fillStyle = header.color;
    ctx.font = `${headerStyle.weight} ${geo.titleFontSize}px ${fontById(header.fontId).family}`;
    for (const line of geo.titleLines) {
      ctx.fillText(line.text, geo.colLeft, line.baseline);
    }
  }

  if (body?.visible && bodyStyle) {
    ctx.fillStyle = body.color;
    ctx.font = `${bodyStyle.weight} ${geo.bodyFontSize}px ${fontById(body.fontId).family}`;
    for (const line of geo.bodyLines) {
      ctx.fillText(line.text, geo.colLeft, line.baseline);
    }
  }

  return canvasToBlob(canvas, format);
}

// Rasterize the Open Space Living Room template: one required image is drawn as
// a right-side full-height backdrop and again in the white inset frame, with
// the required headline and optional logo mark above. Mirrors `OpenSpacePreview`.
async function exportOpenSpace(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const detailLayer = byId<Extract<EditorLayer, { kind: "image" }>>("detail");
  const header = byId<TextLayer>("header");
  const logo = byId<Extract<EditorLayer, { kind: "logo" }>>("logo");

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header]
        .filter((layer): layer is TextLayer => Boolean(layer?.visible && layer.text.trim()))
        .map((layer) =>
          document.fonts
            .load(
              `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
            )
            .catch(() => undefined),
        ),
    );
  }

  const geo = openSpaceGeometry(width, height);
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  if (photoLayer?.visible && photoLayer.src) {
    let photo: HTMLImageElement;
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
    drawImageCover(ctx, photo, geo.backdrop);
    ctx.fillStyle = template.background;
    ctx.fillRect(geo.leftWash.x, geo.leftWash.y, geo.leftWash.w, geo.leftWash.h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(geo.frame.x, geo.frame.y, geo.frame.w, geo.frame.h);
    const insetLayer = detailLayer?.visible && detailLayer.src ? detailLayer : photoLayer;
    const insetPhoto =
      insetLayer === photoLayer ? photo : await loadImage(insetLayer.src).catch(() => photo);
    drawImageCover(ctx, insetPhoto, geo.inset, imageTransform(insetLayer));
  }

  const headlineStyle = header ? resolveTextStyle(header) : null;
  if (header?.visible && headlineStyle) {
    const rawLines = header.text
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const first = rawLines[0] ?? "";
    const second = rawLines.slice(1).join(" ");
    ctx.save();
    ctx.fillStyle = header.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const family = fontById(header.fontId).family;
    if (first) {
      ctx.font = `${OPEN_SPACE_LAYOUT.headline.firstWeight} ${geo.headline.firstSize * headlineStyle.sizeScale}px ${family}`;
      ctx.letterSpacing = `${OPEN_SPACE_LAYOUT.headline.firstTracking}em`;
      ctx.fillText(
        header.uppercase ? first.toUpperCase() : first,
        geo.headline.centerX,
        geo.headline.firstBaseline,
      );
    }
    if (second) {
      ctx.font = `${headlineStyle.weight} ${geo.headline.secondSize * headlineStyle.sizeScale}px ${family}`;
      ctx.letterSpacing = `${OPEN_SPACE_LAYOUT.headline.secondTracking}em`;
      ctx.fillText(
        header.uppercase ? second.toUpperCase() : second,
        geo.headline.centerX,
        geo.headline.secondBaseline,
      );
    }
    ctx.restore();
  }

  if (logo?.visible && logo.src) {
    try {
      const logoImage = await loadImage(logo.src);
      drawImageContain(ctx, logoImage, geo.uploadedLogo);
    } catch {
      // Optional logo: skip if it cannot be loaded.
    }
  }

  return canvasToBlob(canvas, format);
}

// Rasterize the Interior Inspiration pin: a blurred full-bleed background, a
// rounded white frame with optional second inset photo, required headline and
// handle, plus optional script subtitle. Mirrors `InteriorInspirationPreview`.
async function exportInteriorInspiration(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const detailLayer = byId<Extract<EditorLayer, { kind: "image" }>>("detail");
  const subtitle = byId<TextLayer>("description");
  const header = byId<TextLayer>("header");
  const handle = byId<TextLayer>("cta");
  const insetLayer = detailLayer?.visible && detailLayer.src ? detailLayer : photoLayer;
  const usesBakedDefaultText = Boolean(
    insetLayer?.src.endsWith("/interior-inspiration-source.jpg") &&
    !insetLayer.assetId &&
    !insetLayer.assetUrl,
  );
  const textLayers = [subtitle, header, handle].filter((layer): layer is TextLayer =>
    Boolean(layer?.visible && layer.text.trim()),
  );

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) =>
        document.fonts
          .load(
            `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
          )
          .catch(() => undefined),
      ),
    ).catch(() => undefined);
  }

  const geo = interiorInspirationGeometry(width, height);
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  if (photoLayer?.visible && photoLayer.src) {
    let photo: HTMLImageElement;
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }

    ctx.save();
    ctx.filter = `blur(${geo.blur}px)`;
    const bleed = geo.blur * 3;
    drawImageCover(
      ctx,
      photo,
      { x: -bleed, y: -bleed, w: width + bleed * 2, h: height + bleed * 2 },
      {
        ...imageTransform(photoLayer),
        scale: imageTransform(photoLayer).scale * geo.backdropScale,
      },
    );
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(geo.tab.x, geo.tab.y, geo.tab.w, geo.tab.h, geo.tab.radius);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(geo.frame.x, geo.frame.y, geo.frame.w, geo.frame.h, geo.frame.radius);
    ctx.fill();

    const insetPhoto =
      insetLayer === photoLayer ? photo : await loadImage(insetLayer.src).catch(() => photo);
    drawRoundedImageCover(ctx, insetPhoto, geo.inset, geo.inset.radius, imageTransform(insetLayer));
  }

  const drawText = (
    layer: TextLayer | undefined,
    options: {
      x: number;
      y: number;
      size: number;
      textAlign: CanvasTextAlign;
      tracking?: number;
      skipDefaultBakedText?: boolean;
    },
  ) => {
    if (!layer?.visible || !layer.text.trim()) return;
    if (
      options.skipDefaultBakedText &&
      usesBakedDefaultText &&
      layer.color.toLowerCase() === "#ffffff" &&
      ((layer.id === "description" &&
        layer.text === "interior design" &&
        layer.fontId === "alexbrush") ||
        (layer.id === "header" && layer.text === "/inspiration/" && layer.fontId === "playfair"))
    ) {
      return;
    }
    const style = resolveTextStyle(layer);
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    ctx.save();
    ctx.fillStyle = layer.color;
    ctx.textAlign = options.textAlign;
    ctx.textBaseline = "alphabetic";
    ctx.font = `${style.weight} ${options.size * style.sizeScale}px ${fontById(layer.fontId).family}`;
    ctx.letterSpacing = `${options.tracking ?? style.letterSpacing}em`;
    applyTextShadow(ctx, Boolean(style.shadow), options.size * style.sizeScale);
    ctx.fillText(text, options.x, options.y);
    ctx.restore();
  };

  drawText(subtitle, {
    x: geo.subtitle.centerX,
    y: geo.subtitle.baseline,
    size: geo.subtitle.size,
    textAlign: "center",
    tracking: INTERIOR_INSPIRATION_LAYOUT.subtitle.tracking,
    skipDefaultBakedText: true,
  });
  drawText(header, {
    x: geo.headline.centerX,
    y: geo.headline.baseline,
    size: geo.headline.size,
    textAlign: "center",
    tracking: INTERIOR_INSPIRATION_LAYOUT.headline.tracking,
    skipDefaultBakedText: true,
  });
  drawText(handle, {
    x: geo.handle.x,
    y: geo.handle.baseline,
    size: geo.handle.size,
    textAlign: "left",
  });

  return canvasToBlob(canvas, format);
}

// Trace a rounded rectangle path (used to clip each relax photo panel).
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, rr);
    return;
  }
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Rasterize a relax trio: rounded photo panels stacked with a soft gap, and a
// caption + subcaption over the middle panel (left-aligned) — mirrors
// `RelaxPreview` and `template_relax.v2.html`.
async function exportRelax(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const photoLayers = layers.filter((layer) => layer.kind === "image");
  const n = Math.max(photoLayers.length, 1);
  const gap = RELAX_LAYOUT.gap * width;
  const radius = RELAX_LAYOUT.radius * width;
  const panelH = (height - (n - 1) * gap) / n;
  let failedBands = 0;
  for (let index = 0; index < photoLayers.length; index++) {
    const layer = photoLayers[index];
    if (!layer.visible || layer.kind !== "image") continue;
    const box = { x: 0, y: index * (panelH + gap), w: width, h: panelH };
    try {
      const img = await loadImage(layer.src);
      ctx.save();
      roundRectPath(ctx, box.x, box.y, box.w, box.h, radius);
      ctx.clip();
      drawImageCover(ctx, img, box, imageTransform(layer));
      ctx.restore();
    } catch {
      failedBands += 1;
    }
  }
  if (failedBands > 0) {
    throw new ExportImageError(failedBands);
  }

  // Caption + subcaption over the middle panel, left-aligned and vertically
  // centred on the panel — matching the preview's block.
  const header = layers.find(
    (layer): layer is TextLayer => layer.kind === "header" && layer.visible,
  );
  const description = layers.find(
    (layer): layer is TextLayer => layer.kind === "description" && layer.visible,
  );

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header, description].map((layer) => {
        if (!layer || !layer.text.trim()) return Promise.resolve();
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    );
  }

  const mid = Math.floor((n - 1) / 2);
  const centerY = mid * (panelH + gap) + panelH / 2;
  const leftX = RELAX_LAYOUT.caption.left * width;
  const maxW = RELAX_LAYOUT.caption.maxWidth * width;

  type Block = {
    lines: string[];
    size: number;
    lineHeight: number;
    style: ResolvedTextStyle;
    layer: TextLayer;
    topGap: number;
  };
  const blocks: Block[] = [];

  const addBlock = (layer: TextLayer, sizeFrac: number, lineHeightMul: number) => {
    if (!layer.text.trim()) return;
    const font = fontById(layer.fontId);
    const style = resolveTextStyle(layer);
    const size = sizeFrac * style.sizeScale * width;
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    // Honour explicit line breaks (the subcaption uses them), wrapping each.
    const lines = text
      .split("\n")
      .flatMap((para) => (para.trim() === "" ? [""] : wrapLines(ctx, para, maxW)));
    ctx.restore();
    blocks.push({
      lines,
      size,
      lineHeight: size * lineHeightMul,
      style,
      layer,
      topGap: blocks.length ? RELAX_LAYOUT.caption.sub.gap * width : 0,
    });
  };

  if (header)
    addBlock(header, RELAX_LAYOUT.caption.headline.size, RELAX_LAYOUT.caption.headline.lineHeight);
  if (description)
    addBlock(description, RELAX_LAYOUT.caption.sub.size, RELAX_LAYOUT.caption.sub.lineHeight);

  const totalH = blocks.reduce(
    (sum, block) => sum + block.topGap + block.lines.length * block.lineHeight,
    0,
  );
  let cursorY = centerY - totalH / 2;
  for (const block of blocks) {
    cursorY += block.topGap;
    const font = fontById(block.layer.fontId);
    ctx.save();
    ctx.font = `${block.style.weight} ${block.size}px ${font.family}`;
    ctx.letterSpacing = `${block.style.letterSpacing}em`;
    applyTextShadow(ctx, block.style.shadow, block.size);
    ctx.fillStyle = block.layer.color;
    ctx.textAlign = block.style.align;
    ctx.textBaseline = "top";
    const x = alignX(block.style.align, leftX, leftX + maxW);
    block.lines.forEach((line, index) => {
      ctx.fillText(line, x, cursorY + index * block.lineHeight);
    });
    ctx.restore();
    cursorY += block.lines.length * block.lineHeight;
  }

  return canvasToBlob(canvas, format);
}

function drawTextImageFill(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  text: string,
  textBox: { x: number; y: number; w: number; h: number },
  imageBox: { x: number; y: number; w: number; h: number },
  font: string,
  colorFallback: string,
  transform: ImageTransform,
) {
  const mask = document.createElement("canvas");
  mask.width = ctx.canvas.width;
  mask.height = ctx.canvas.height;
  const maskCtx = mask.getContext("2d");
  if (!maskCtx) return;

  maskCtx.save();
  maskCtx.font = font;
  maskCtx.letterSpacing = `${PORTO_CAPTION_TRACKING}em`;
  maskCtx.fillStyle = colorFallback;
  maskCtx.textAlign = "left";
  // `textBox.y` is the name's alphabetic baseline (pinned to the white band's
  // bottom), matching the preview's bottom-attached name.
  maskCtx.textBaseline = "alphabetic";
  maskCtx.fillText(text, textBox.x, textBox.y);
  maskCtx.globalCompositeOperation = "source-in";
  drawImageCover(maskCtx, image, imageBox, transform);
  maskCtx.restore();

  ctx.drawImage(mask, 0, 0);
}

// Break text to fit `maxWidth` character-by-character (honouring explicit
// newlines) — used for the split headline, which is often a single long word
// (e.g. "SOULKIN") that must stack a few big letters per line.
function wrapChars(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const chars = Array.from(para);
    let line = "";
    for (const ch of chars) {
      const candidate = line + ch;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        out.push(line);
        line = ch;
      } else {
        line = candidate;
      }
    }
    out.push(line);
  }
  return out;
}

// Rasterize a split editorial pin: a paper panel on the left, a full-height photo
// on the right, a giant headline knocked out of the paper to reveal the photo,
// and a small dark body block bottom-left — mirroring `SplitPreview`.
async function exportSplit(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const imageLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = byId<TextLayer>("header");
  const description = byId<TextLayer>("description");

  let image: HTMLImageElement | null = null;
  if (imageLayer?.visible) {
    try {
      image = await loadImage(imageLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
  }
  const transform = imageLayer ? imageTransform(imageLayer) : DEFAULT_IMAGE_TRANSFORM;
  const fullBox = { x: 0, y: 0, w: width, h: height };

  // Photo cover-fit to the *full* canvas, then paper painted over the left panel
  // — so the right side shows the photo and the headline letters (also filled
  // with the full-canvas photo) read continuous with it across the boundary.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  if (image) {
    drawImageCover(ctx, image, fullBox, transform);
  }
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, SPLIT_LAYOUT.splitX * width, height);

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header, description].map((layer) => {
        if (!layer?.visible || !layer.text.trim()) return Promise.resolve();
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // Headline — knocked out of the paper to reveal the same photo, cover-fit to
  // the *full* canvas so letters spanning into the photo area read continuous.
  if (header?.visible && header.text.trim()) {
    const font = fontById(header.fontId);
    const style = resolveTextStyle(header);
    // Auto-fit the headline to the chosen font (e.g. an applied brand font) so it
    // fills the paper panel with the same rhythm regardless of face.
    const size = splitHeadlineFontSize(header, width);
    const lineHeight = size * SPLIT_LAYOUT.headline.lineHeight;
    const x = SPLIT_LAYOUT.headline.x * width;
    const top = SPLIT_LAYOUT.headline.top * height;
    const raw = header.uppercase ? header.text.toUpperCase() : header.text;

    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const lines = wrapChars(ctx, raw, SPLIT_LAYOUT.headline.width * width);
    ctx.restore();

    const paint = (target: CanvasRenderingContext2D) => {
      target.font = `${style.weight} ${size}px ${font.family}`;
      target.letterSpacing = `${style.letterSpacing}em`;
      target.textAlign = "left";
      target.textBaseline = "top";
      lines.forEach((line, index) => target.fillText(line, x, top + index * lineHeight));
    };

    if (image) {
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const maskCtx = mask.getContext("2d");
      if (maskCtx) {
        maskCtx.fillStyle = header.color;
        paint(maskCtx);
        maskCtx.globalCompositeOperation = "source-in";
        drawImageCover(maskCtx, image, fullBox, transform);
        ctx.drawImage(mask, 0, 0);
      }
    } else {
      ctx.save();
      ctx.fillStyle = header.color;
      paint(ctx);
      ctx.restore();
    }
    ctx.letterSpacing = "0px";
  }

  // Body — small dark block anchored bottom-left over the paper.
  if (description?.visible && description.text.trim()) {
    const font = fontById(description.fontId);
    const style = resolveTextStyle(description);
    const size = SPLIT_LAYOUT.body.size * style.sizeScale * width;
    const lineHeight = size * SPLIT_LAYOUT.body.lineHeight;
    const x = SPLIT_LAYOUT.body.x * width;
    const raw = description.uppercase ? description.text.toUpperCase() : description.text;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const lines = raw
      .split("\n")
      .flatMap((para) =>
        para.trim() === "" ? [""] : wrapLines(ctx, para, SPLIT_LAYOUT.body.width * width),
      );
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = description.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    const bottomY = height - SPLIT_LAYOUT.body.bottom * height;
    const startY = bottomY - (lines.length - 1) * lineHeight;
    lines.forEach((line, index) => ctx.fillText(line, x, startY + index * lineHeight));
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

// Extend the mask leftward from each glyph, following the glyph's left contour
// per row (fill from the box's left margin up to the leftmost ink of each row),
// so the photo block runs continuous into the letter with no paper notch on
// slanted letters (A, V, Y). Reads the already-painted glyph alpha, so it must
// run before the photo is composited in. Counters stay paper (they sit to the
// right of the leftmost ink, so they're never filled).
function slicedLeftContourFill(ctx: CanvasRenderingContext2D, geo: SlicedGeometry) {
  const { width: cw, height: ch } = ctx.canvas;
  const x0 = Math.max(0, Math.floor(geo.x));
  const x1 = Math.min(cw, Math.ceil(geo.x + geo.w));
  const w = x1 - x0;
  if (w <= 0) return;
  for (const band of geo.bands) {
    const y0 = Math.max(0, Math.floor(band.y));
    const y1 = Math.min(ch, Math.ceil(band.y + band.h));
    if (y1 <= y0) continue;
    const img = ctx.getImageData(x0, y0, w, y1 - y0);
    const data = img.data;
    for (let ry = 0; ry < y1 - y0; ry++) {
      const rowOff = ry * w;
      let leftInk = -1;
      for (let rx = 0; rx < w; rx++) {
        if (data[(rowOff + rx) * 4 + 3] > 10) {
          leftInk = rx;
          break;
        }
      }
      for (let rx = 0; rx < leftInk; rx++) {
        const idx = (rowOff + rx) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, x0, y0);
  }
}

// Draw the sliced photo-filled caption onto `ctx` (sized to `geo`'s canvas): a
// solid photo block on the left that transitions, along each glyph's contour,
// into one big letter per band. Shared by the canvas export and the editor
// preview so both render identically. With no photo, paints solid-colour letters
// (no block).
export function drawSlicedLetters(
  ctx: CanvasRenderingContext2D,
  opts: {
    chars: string[];
    geo: SlicedGeometry;
    fontId: string;
    weight: number;
    photo: HTMLImageElement | null;
    photoTransform: ImageTransform;
    color: string;
  },
) {
  const { chars, geo, fontId, weight, photo, photoTransform, color } = opts;
  if (chars.length === 0) return;
  const font = fontById(fontId);
  const cw = ctx.canvas.width;
  const chh = ctx.canvas.height;
  const fontSize = geo.bandH / SLICED_LAYOUT.capRatio;

  const mask = document.createElement("canvas");
  mask.width = cw;
  mask.height = chh;
  const m = mask.getContext("2d");
  if (!m) return;

  m.fillStyle = "#000";
  m.textAlign = "left";
  m.textBaseline = "alphabetic";
  chars.forEach((ch, index) => {
    const band = geo.bands[index];
    m.save();
    m.beginPath();
    m.rect(geo.x, band.y, geo.w, band.h);
    m.clip();
    const met = slicedGlyphMetrics(ch, fontId, weight);
    if (met) {
      // Letter sized to fill the band height, near its natural aspect, and
      // right-aligned to the box edge; the photo block fills the space to its left.
      const scaleY = band.h / met.inkH;
      const glyphW = Math.min(band.h * SLICED_LAYOUT.letterAspect, geo.w);
      const scaleX = glyphW / met.inkW;
      const originX = geo.x + geo.w - glyphW;
      m.translate(originX, band.y);
      m.scale(scaleX, scaleY);
      m.font = `${weight} ${met.refSize}px ${font.family}`;
      m.fillText(ch, met.left, met.ascent);
    } else {
      // Approximate cap-height fit when ink metrics are unavailable.
      m.font = `${weight} ${fontSize}px ${font.family}`;
      const natural = m.measureText(ch).width || 1;
      const baseline = band.y + (band.h + fontSize * SLICED_LAYOUT.capRatio) / 2;
      m.translate(geo.x, baseline);
      m.scale(geo.w / natural, 1);
      m.fillText(ch, 0, 0);
    }
    m.restore();
  });

  if (photo) {
    slicedLeftContourFill(m, geo);
    m.globalCompositeOperation = "source-in";
    drawImageCover(m, photo, { x: geo.x, y: geo.top, w: geo.w, h: geo.boxH }, photoTransform);
  } else {
    m.globalCompositeOperation = "source-in";
    m.fillStyle = color;
    m.fillRect(0, 0, cw, chh);
  }
  ctx.drawImage(mask, 0, 0);
}

// Rasterize the SUNDAY "sliced type" poster: a solid photo block on the left that
// transitions into a giant caption (one big letter per band), plus an optional
// right-hand date / quote / year — mirroring `SlicedPreview`.
async function exportSliced(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const background = byId<Extract<EditorLayer, { kind: "image" }>>("background");
  const caption = byId<TextLayer>("header");
  const date = byId<TextLayer>("eyebrow");
  const quote = byId<TextLayer>("description");
  const year = byId<TextLayer>("cta");

  // Paper canvas.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Optional full-bleed background image behind everything.
  if (background?.visible && background.src) {
    try {
      const bg = await loadImage(background.src);
      drawImageCover(ctx, bg, { x: 0, y: 0, w: width, h: height }, imageTransform(background));
    } catch {
      throw new ExportImageError(1);
    }
  }

  // The required sliced photo.
  let photo: HTMLImageElement | null = null;
  if (photoLayer?.visible && photoLayer.src) {
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
  }
  const photoTransform = photoLayer ? imageTransform(photoLayer) : DEFAULT_IMAGE_TRANSFORM;

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [caption, date, quote, year].map((layer) => {
        if (!layer?.visible || !layer.text.trim()) return Promise.resolve();
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // Sliced caption. Each character is a band; the photo cover-fits the whole
  // letter box so the bands read as one continuous, sliced picture.
  if (caption?.visible && caption.text.trim()) {
    const style = resolveTextStyle(caption);
    const label = caption.uppercase ? caption.text.toUpperCase() : caption.text;
    const chars = slicedChars(label);
    if (chars.length) {
      const geo = slicedGeometry(chars.length, width, height);
      drawSlicedLetters(ctx, {
        chars,
        geo,
        fontId: caption.fontId,
        weight: style.weight,
        photo,
        photoTransform,
        color: caption.color,
      });
    }
  }

  // ── Right-hand column ──────────────────────────────────────────────────────
  const centerX = SLICED_LAYOUT.right.center * width;
  const rightEdge = SLICED_LAYOUT.right.edge * width;

  // A stacked-character block (date / year): one character per line, centred on
  // the right column. `anchor` pins the block's top or bottom edge.
  const drawStacked = (
    layer: TextLayer | undefined,
    spec: { size: number; lineHeight: number },
    edgeY: number,
    anchor: "top" | "bottom",
  ) => {
    if (!layer?.visible || !layer.text.trim()) return;
    const font = fontById(layer.fontId);
    const style = resolveTextStyle(layer);
    const size = spec.size * style.sizeScale * width;
    const step = size * spec.lineHeight;
    const raw = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    const chars = Array.from(raw.replace(/\s+/g, ""));
    if (!chars.length) return;
    const topY = anchor === "top" ? edgeY : edgeY - (chars.length - 1) * step;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    chars.forEach((ch, index) => ctx.fillText(ch, centerX, topY + index * step));
    ctx.restore();
  };

  drawStacked(date, SLICED_LAYOUT.right.date, SLICED_LAYOUT.right.date.top * height, "top");
  drawStacked(year, SLICED_LAYOUT.right.year, SLICED_LAYOUT.right.year.bottom * height, "bottom");

  // The quote — a wrapped, italic serif block, right-aligned and vertically
  // centred in the right column.
  if (quote?.visible && quote.text.trim()) {
    const font = fontById(quote.fontId);
    const style = resolveTextStyle(quote);
    const size = SLICED_LAYOUT.right.quote.size * style.sizeScale * width;
    const step = size * SLICED_LAYOUT.right.quote.lineHeight;
    ctx.save();
    ctx.font = `italic ${style.weight} ${size}px ${font.family}`;
    const raw = quote.uppercase ? quote.text.toUpperCase() : quote.text;
    const lines = raw
      .split("\n")
      .flatMap((para) =>
        para.trim() === "" ? [""] : wrapLines(ctx, para, SLICED_LAYOUT.right.quote.width * width),
      );
    const totalH = (lines.length - 1) * step;
    const topY = SLICED_LAYOUT.right.quote.centerY * height - totalH / 2;
    ctx.fillStyle = quote.color;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    lines.forEach((line, index) => ctx.fillText(line, rightEdge, topY + index * step));
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

async function exportPorto(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const imageLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const eyebrow = byId<TextLayer>("eyebrow");
  const caption = byId<TextLayer>("header");
  const overview = byId<TextLayer>("description");
  const image = imageLayer ? await loadImage(imageLayer.src) : null;
  const transform = imageLayer ? imageTransform(imageLayer) : DEFAULT_IMAGE_TRANSFORM;

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, width, height);

  // Full-bleed backdrop (a copy of the photo behind the card).
  if (image) {
    drawImageCover(ctx, image, { x: 0, y: 0, w: width, h: height });
  }

  // White poster card.
  const card = {
    x: PORTO_LAYOUT.card.x * width,
    y: PORTO_LAYOUT.card.y * height,
    w: PORTO_LAYOUT.card.w * width,
    h: PORTO_LAYOUT.card.h * height,
  };
  ctx.fillStyle = template.background;
  ctx.fillRect(card.x, card.y, card.w, card.h);

  // Interior content box (paddings are fractions of width — cqi in the preview).
  const padX = PORTO_CARD.padX * width;
  const innerX = card.x + padX;
  const innerW = card.w - 2 * padX;
  const rowTop = card.y + PORTO_CARD.padTop * width;

  if (typeof document !== "undefined" && document.fonts) {
    const capFont = caption ? fontById(caption.fontId) : null;
    const eyebrowFont = eyebrow ? fontById(eyebrow.fontId) : null;
    await Promise.all([
      document.fonts.load(
        `${eyebrow ? resolveTextStyle(eyebrow).weight : 400} ${PORTO_LAYOUT.eyebrow.size * width}px ${
          eyebrowFont ? primaryFamily(eyebrowFont.family) : "'Montserrat'"
        }`,
      ),
      overview
        ? document.fonts.load(
            `${resolveTextStyle(overview).weight} ${PORTO_LAYOUT.overview.size * width}px ${primaryFamily(fontById(overview.fontId).family)}`,
          )
        : Promise.resolve(),
      capFont
        ? document.fonts.load(
            `${resolveTextStyle(caption!).weight} 100px ${primaryFamily(capFont.family)}`,
          )
        : Promise.resolve(),
    ]).catch(() => undefined);
  }

  // Row 1 — eyebrow (left) + overview (right). Track the row's height so the
  // image wrapper starts below it (like the flex layout).
  const eyebrowSize = PORTO_LAYOUT.eyebrow.size * width;
  let rowH = 0;
  if (eyebrow?.visible !== false && eyebrow?.text.trim()) {
    const font = fontById(eyebrow.fontId);
    const style = resolveTextStyle(eyebrow);
    const label = eyebrow.uppercase ? eyebrow.text.toUpperCase() : eyebrow.text;
    ctx.save();
    ctx.fillStyle = eyebrow.color;
    ctx.font = `${style.weight} ${eyebrowSize}px ${font.family}`;
    ctx.letterSpacing = "0.025em";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, innerX, rowTop);
    ctx.letterSpacing = "0px";
    ctx.restore();
    rowH = eyebrowSize;
  }
  if (overview?.visible !== false && overview?.text.trim()) {
    ctx.save();
    const font = fontById(overview.fontId);
    const style = resolveTextStyle(overview);
    const size = PORTO_LAYOUT.overview.size * style.sizeScale * width;
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.fillStyle = overview.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const colW = PORTO_CARD.overviewMaxWidth * innerW;
    const lines = wrapLines(ctx, overview.text, colW);
    const lineHeight = size * PORTO_LAYOUT.overview.lineHeight;
    const colX = innerX + innerW - colW; // fixed right-hand column, text left-aligned
    lines.slice(0, 6).forEach((line, index) => {
      ctx.fillText(line, colX, rowTop + index * lineHeight);
    });
    ctx.letterSpacing = "0px";
    ctx.restore();
    rowH = Math.max(rowH, lines.length * lineHeight);
  }

  // Rows 2 + 3 — the image wrapper (below the header row + gap) holds the square;
  // the name is a white band knocked out to reveal that same image.
  const wrapperTop = rowTop + rowH + PORTO_CARD.rowGap * width;
  const wrapperBottom = card.y + card.h - PORTO_CARD.padBottom * width;
  const wrapper = { x: innerX, y: wrapperTop, w: innerW, h: wrapperBottom - wrapperTop };

  if (image && imageLayer?.visible !== false) {
    drawImageCover(ctx, image, wrapper, transform);
  }

  if (image && caption?.visible !== false && caption?.text.trim()) {
    const label = caption.uppercase ? caption.text.toUpperCase() : caption.text;
    const font = fontById(caption.fontId);
    const style = resolveTextStyle(caption);
    // Fit the name to the inner width (font-agnostic), then derive the band from
    // the font's real metrics — ink top at the wrapper top (no clipping), flush
    // left with the square (side-bearing shift).
    const measure = document.createElement("canvas").getContext("2d");
    let nameSize = PORTO_LAYOUT.headline.size * width;
    let ascent = nameSize * 0.72;
    let leftBearing = 0;
    if (measure) {
      const ref = 100;
      measure.font = `${style.weight} ${ref}px ${font.family}`;
      measure.letterSpacing = `${PORTO_CAPTION_TRACKING}em`;
      const m = measure.measureText(label);
      if (m.width > 0) {
        nameSize = ((innerW * PORTO_CARD.nameFill) / m.width) * ref * style.sizeScale;
        const k = nameSize / ref;
        ascent = m.actualBoundingBoxAscent * k;
        leftBearing = m.actualBoundingBoxLeft * k;
      }
    }
    const baseline = wrapperTop + ascent;
    const bandH = Math.max(0, ascent - nameSize * PORTO_CARD.nameOverlap);

    // Paint the white band over the image top, then draw the name filled with the
    // same image (cover-fit to the wrapper) so it reads continuous with the square.
    // Overscan top/left/right by 2px so no subpixel sliver of the photo peeks out.
    ctx.fillStyle = template.background;
    ctx.fillRect(wrapper.x - 2, wrapper.y - 2, wrapper.w + 4, bandH + 2);
    drawTextImageFill(
      ctx,
      image,
      label,
      { x: innerX + leftBearing, y: baseline, w: innerW, h: nameSize },
      wrapper,
      `${style.weight} ${nameSize}px ${font.family}`,
      caption.color,
      transform,
    );
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a FRANKOF cover (full-bleed slides 2, 4, 9): one full-bleed photo, a
// scrim, and a large uppercase headline (plus an optional subtitle) anchored to
// the top or bottom — mirrors `CoverPreview` and `template_frankof.v2.html`'s
// `.s2`/`.s4`/`.s9`. Geometry is resolved per template via `coverGeometry`.
async function exportCover(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const geom = coverGeometry(template.id);
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const imageLayer = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  if (imageLayer?.visible) {
    try {
      const img = await loadImage(imageLayer.src);
      drawImageCover(ctx, img, { x: 0, y: 0, w: width, h: height }, imageTransform(imageLayer));
    } catch {
      throw new ExportImageError(1);
    }
  }

  // Scrim — a two-stop vertical gradient so the text stays legible.
  const scrim = ctx.createLinearGradient(0, 0, 0, height);
  scrim.addColorStop(geom.scrim.from, `rgba(${geom.scrim.color},${geom.scrim.fromOpacity})`);
  scrim.addColorStop(geom.scrim.to, `rgba(${geom.scrim.color},${geom.scrim.toOpacity})`);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, width, height);

  const leftX = geom.padX * width;
  const maxW = (1 - geom.padX - geom.padRight) * width;

  const header = layers.find(
    (layer): layer is TextLayer => layer.kind === "header" && layer.visible,
  );
  const description = layers.find(
    (layer): layer is TextLayer => layer.kind === "description" && layer.visible,
  );

  // Lay the block out top-down, then anchor it to the requested edge. Each entry
  // carries its own font/colour/size so the headline and subtitle draw alike.
  type Line = {
    text: string;
    size: number;
    lineHeight: number;
    style: ResolvedTextStyle;
    layer: TextLayer;
  };
  const blocks: {
    layer: TextLayer;
    size: number;
    lineHeight: number;
    maxWidth: number;
    gap: number;
  }[] = [];
  if (header && header.text.trim()) {
    blocks.push({
      layer: header,
      size: geom.headline.size * resolveTextStyle(header).sizeScale * width,
      lineHeight: geom.headline.lineHeight,
      maxWidth: maxW,
      gap: 0,
    });
  }
  if (geom.subtitle && description && description.text.trim()) {
    blocks.push({
      layer: description,
      size: geom.subtitle.size * resolveTextStyle(description).sizeScale * width,
      lineHeight: geom.subtitle.lineHeight,
      maxWidth: geom.subtitle.maxWidth * width,
      gap: geom.subtitle.gap * width,
    });
  }
  if (blocks.length === 0) {
    return canvasToBlob(canvas, format);
  }

  // Make sure each block's face is ready before we measure/wrap it.
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      blocks.map((block) =>
        document.fonts
          .load(
            `${resolveTextStyle(block.layer).weight} ${block.size}px ${primaryFamily(fontById(block.layer.fontId).family)}`,
          )
          .catch(() => undefined),
      ),
    );
  }

  const lines: (Line & { gap: number })[] = [];
  for (const block of blocks) {
    const style = resolveTextStyle(block.layer);
    const text = block.layer.uppercase ? block.layer.text.toUpperCase() : block.layer.text;
    ctx.save();
    ctx.font = `${style.weight} ${block.size}px ${fontById(block.layer.fontId).family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const wrapped = text
      .split("\n")
      .flatMap((para) => (para.trim() === "" ? [""] : wrapLines(ctx, para, block.maxWidth)));
    ctx.restore();
    wrapped.forEach((line, index) => {
      lines.push({
        text: line,
        size: block.size,
        lineHeight: block.lineHeight,
        style,
        layer: block.layer,
        gap: index === 0 ? block.gap : 0,
      });
    });
  }

  const totalH = lines.reduce((sum, line) => sum + line.gap + line.size * line.lineHeight, 0);
  const startY =
    geom.anchor === "bottom" ? height - geom.edge * height - totalH : geom.edge * height;

  let y = startY;
  ctx.textBaseline = "top";
  for (const line of lines) {
    y += line.gap;
    ctx.save();
    ctx.font = `${line.style.weight} ${line.size}px ${fontById(line.layer.fontId).family}`;
    ctx.letterSpacing = `${line.style.letterSpacing}em`;
    applyTextShadow(ctx, line.style.shadow, line.size);
    ctx.fillStyle = line.layer.color;
    ctx.textAlign = line.style.align;
    const x = alignX(line.style.align, leftX, leftX + maxW);
    ctx.fillText(line.text, x, y);
    ctx.restore();
    y += line.size * line.lineHeight;
  }

  return canvasToBlob(canvas, format);
}

// The decorative arrow disc (ringed circle + right-arrow) used on the editorial
// footer slides. Mirrors `ArrowDisc` in the preview. `size` is the diameter.
function drawEditorialArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  canvasWidth: number,
) {
  const radius = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = (1.5 / 1080) * canvasWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Arrow glyph, mapped from the 24×24 viewBox to ~40% of the disc.
  const glyph = size * 0.4;
  const scale = glyph / 24;
  const px = (x: number) => cx + (x - 12) * scale;
  const py = (y: number) => cy + (y - 12) * scale;
  ctx.lineWidth = 1.6 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(px(4), py(12));
  ctx.lineTo(px(20), py(12));
  ctx.moveTo(px(13.5), py(5.5));
  ctx.lineTo(px(20), py(12));
  ctx.lineTo(px(13.5), py(18.5));
  ctx.stroke();
  ctx.restore();
}

// Rasterize a FRANKOF editorial paper slide (1, 6, 8): an uppercase headline on
// top, a flexible photo (contain/cover), and an optional footer caption + arrow —
// mirrors `EditorialPreview` and `template_frankof.v2.html`'s `.s1`/`.s6`/`.s8`.
async function exportEditorial(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const geom = editorialGeometry(template.id);
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const contentX = geom.padX * width;
  const contentW = width - 2 * geom.padX * width;
  const padTopPx = geom.padTop * height;
  const padBottomPx = geom.padBottom * height;

  const header = layers.find(
    (layer): layer is TextLayer => layer.kind === "header" && layer.visible,
  );
  const description = layers.find(
    (layer): layer is TextLayer => layer.kind === "description" && layer.visible,
  );

  // Make sure the faces are ready before we measure/wrap text.
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [header, description].map((layer) => {
        if (!layer || !layer.text.trim()) return undefined;
        const style = resolveTextStyle(layer);
        const size =
          (layer.kind === "header"
            ? geom.headline.size
            : (geom.footer?.size ?? geom.headline.size)) *
          style.sizeScale *
          width;
        return document.fonts
          .load(`${style.weight} ${size}px ${primaryFamily(fontById(layer.fontId).family)}`)
          .catch(() => undefined);
      }),
    );
  }

  // Wrap a text layer into drawable lines at a given size/max width.
  const layoutText = (layer: TextLayer, size: number, maxWidth: number) => {
    const style = resolveTextStyle(layer);
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${fontById(layer.fontId).family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const lines = text
      .split("\n")
      .flatMap((para) => (para.trim() === "" ? [""] : wrapLines(ctx, para, maxWidth)));
    ctx.restore();
    return { style, lines };
  };

  // Headline (top).
  let mediaTop = padTopPx;
  if (header && header.text.trim()) {
    const style = resolveTextStyle(header);
    const size = geom.headline.size * style.sizeScale * width;
    const { lines } = layoutText(header, size, contentW);
    const lineHeight = size * geom.headline.lineHeight;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${fontById(header.fontId).family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = header.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "top";
    const x = alignX(style.align, contentX, contentX + contentW);
    lines.forEach((line, index) => ctx.fillText(line, x, padTopPx + index * lineHeight));
    ctx.restore();
    mediaTop = padTopPx + lines.length * lineHeight + geom.headline.gap * height;
  }

  // Footer band (caption + arrow), measured so the media can fill the gap above.
  const arrowSize = EDITORIAL_ARROW * width;
  const hasFooter = Boolean(
    geom.footer && ((description && description.text.trim()) || geom.footer.arrow),
  );
  let footerTop = height - padBottomPx;
  let footerHeight = 0;
  let captionLines: string[] = [];
  let captionSize = 0;
  let captionLineHeight = 0;
  let captionStyle: ResolvedTextStyle | null = null;
  if (hasFooter && geom.footer) {
    if (description && description.text.trim()) {
      captionSize = geom.footer.size * resolveTextStyle(description).sizeScale * width;
      const laid = layoutText(description, captionSize, geom.footer.maxWidth * width);
      captionStyle = laid.style;
      captionLines = laid.lines;
      captionLineHeight = captionSize * geom.footer.lineHeight;
    }
    const captionH = captionLines.length * captionLineHeight;
    footerHeight = Math.max(captionH, geom.footer.arrow ? arrowSize : 0);
    footerTop = height - padBottomPx - footerHeight;
  }

  const bleed = geom.media.bleed ?? false;
  const mediaBottom = hasFooter
    ? footerTop - geom.media.gapBottom * height
    : bleed
      ? height
      : height - padBottomPx;

  // Photo (fills the space between the headline and the footer). A `bleed` photo
  // ignores the side padding and runs to the canvas edges (slide 6).
  const imageLayer = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  if (imageLayer?.visible && mediaBottom > mediaTop) {
    const box = bleed
      ? { x: 0, y: mediaTop, w: width, h: mediaBottom - mediaTop }
      : { x: contentX, y: mediaTop, w: contentW, h: mediaBottom - mediaTop };
    try {
      const img = await loadImage(imageLayer.src);
      if (geom.media.fit === "contain") {
        drawImageContain(ctx, img, box, 0, "center", imageTransform(imageLayer));
      } else {
        drawImageCover(ctx, img, box, imageTransform(imageLayer));
      }
    } catch {
      throw new ExportImageError(1);
    }
  }

  // Footer caption + arrow, vertically centred in the footer band.
  if (hasFooter && geom.footer) {
    if (captionLines.length && captionStyle) {
      const captionH = captionLines.length * captionLineHeight;
      const captionTop = footerTop + (footerHeight - captionH) / 2;
      ctx.save();
      ctx.font = `${captionStyle.weight} ${captionSize}px ${fontById(description!.fontId).family}`;
      ctx.letterSpacing = `${captionStyle.letterSpacing}em`;
      ctx.fillStyle = description!.color;
      ctx.textAlign = captionStyle.align;
      ctx.textBaseline = "top";
      const capMaxW = geom.footer.maxWidth * width;
      const x = alignX(captionStyle.align, contentX, contentX + capMaxW);
      captionLines.forEach((line, index) =>
        ctx.fillText(line, x, captionTop + index * captionLineHeight),
      );
      ctx.restore();
    }
    if (geom.footer.arrow) {
      const cx = contentX + contentW - arrowSize / 2;
      const cy = footerTop + footerHeight / 2;
      drawEditorialArrow(ctx, cx, cy, arrowSize, header?.color ?? "#1d1b19", width);
    }
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a FRANKOF collage paper slide (3, 5, 7): a headline (with an optional
// brand wordmark and body/subtitle) over a multi-photo grid — mirrors
// `CollagePreview` and `template_frankof.v2.html`'s `.s3`/`.s5`/`.s7`.
async function exportCollage(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const slide = collageSlide(template.id);
  const L = COLLAGE_LAYOUT;
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const f = (v: number) => v * width;
  const contentX = f(L.padX);
  const contentW = width - 2 * f(L.padX);
  const gap = f(L.gap);

  const photos = layers.filter(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const header = layers.find(
    (layer): layer is TextLayer =>
      layer.kind === "header" && layer.visible && layer.text.trim() !== "",
  );
  const brand = layers.find(
    (layer): layer is TextLayer =>
      layer.kind === "eyebrow" && layer.visible && layer.text.trim() !== "",
  );
  const description = layers.find(
    (layer): layer is TextLayer =>
      layer.kind === "description" && layer.visible && layer.text.trim() !== "",
  );

  // Per-slide headline / body font sizes (px).
  const headlineSize =
    slide === 5 ? f(L.s5.headline) : slide === 7 ? f(L.s7.headline) : f(L.s3.headline);
  const bodySize = slide === 5 ? f(L.s5.body.size) : slide === 7 ? f(L.s7.sub.size) : 0;
  const wordmarkSize = f(L.wordmark.size);

  // Preload the faces before measuring/wrapping text.
  if (typeof document !== "undefined" && document.fonts) {
    const faces: [TextLayer | undefined, number][] = [
      [header, headlineSize],
      [brand, wordmarkSize],
      [description, bodySize],
    ];
    await Promise.all(
      faces.map(([layer, size]) => {
        if (!layer) return undefined;
        const style = resolveTextStyle(layer);
        return document.fonts
          .load(`${style.weight} ${size}px ${primaryFamily(fontById(layer.fontId).family)}`)
          .catch(() => undefined);
      }),
    );
  }

  const textLines = (layer: TextLayer, sizePx: number, maxW: number) => {
    const style = resolveTextStyle(layer);
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    ctx.save();
    ctx.font = `${style.weight} ${sizePx}px ${fontById(layer.fontId).family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const lines = text
      .split("\n")
      .flatMap((para) => (para.trim() === "" ? [""] : wrapLines(ctx, para, maxW)));
    ctx.restore();
    return { style, lines };
  };
  const drawText = (
    layer: TextLayer,
    sizePx: number,
    lineHeightMul: number,
    x: number,
    y: number,
    maxW: number,
  ) => {
    const { style, lines } = textLines(layer, sizePx, maxW);
    ctx.save();
    ctx.font = `${style.weight} ${sizePx}px ${fontById(layer.fontId).family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "top";
    const lineHeight = sizePx * lineHeightMul;
    const ax = alignX(style.align, x, x + maxW);
    lines.forEach((line, index) => ctx.fillText(line, ax, y + index * lineHeight));
    ctx.restore();
    return lines.length * lineHeight;
  };
  const measureH = (layer: TextLayer, sizePx: number, lineHeightMul: number, maxW: number) =>
    textLines(layer, sizePx, maxW).lines.length * sizePx * lineHeightMul;
  const measureW = (layer: TextLayer, sizePx: number, maxW: number) => {
    const { style, lines } = textLines(layer, sizePx, maxW);
    ctx.save();
    ctx.font = `${style.weight} ${sizePx}px ${fontById(layer.fontId).family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const w = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
    ctx.restore();
    return w;
  };
  const drawPhoto = async (
    layer: Extract<EditorLayer, { kind: "image" }> | undefined,
    box: { x: number; y: number; w: number; h: number },
  ) => {
    if (!layer?.visible || box.h <= 0 || box.w <= 0) return;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(ctx, img, box, imageTransform(layer));
    } catch {
      throw new ExportImageError(1);
    }
  };

  // Draw the top-right brand slot (slides 5/7): the logo if shown, else the
  // wordmark. Returns the drawn width/height so the headline can be sized to fit
  // beside it. Contained + right-aligned, mirroring `HeaderRight` in the preview.
  const logoLayer = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "logo" }> =>
      layer.kind === "logo" && layer.visible && Boolean(layer.src),
  );
  const drawBrandRight = async (padTop: number): Promise<{ rightW: number; rightH: number }> => {
    if (logoLayer) {
      let img: HTMLImageElement;
      try {
        img = await loadImage(logoLayer.src);
      } catch {
        throw new ExportImageError(1);
      }
      const maxH = f(L.logo.height);
      const maxW = f(L.logo.maxWidth);
      let dispH = maxH;
      let dispW = img.width * (maxH / img.height);
      if (dispW > maxW) {
        dispH *= maxW / dispW;
        dispW = maxW;
      }
      ctx.drawImage(img, contentX + contentW - dispW, padTop, dispW, dispH);
      return { rightW: dispW, rightH: dispH };
    }
    if (brand) {
      drawText(brand, wordmarkSize, L.wordmark.lineHeight, contentX, padTop, contentW);
      return {
        rightW: measureW(brand, wordmarkSize, contentW),
        rightH: measureH(brand, wordmarkSize, L.wordmark.lineHeight, contentW),
      };
    }
    return { rightW: 0, rightH: 0 };
  };

  if (slide === 5) {
    const s = L.s5;
    const padTop = f(s.padTop);
    const padBottom = f(s.padBottom);
    const { rightW, rightH } = await drawBrandRight(padTop);
    const headMaxW = contentW - (rightW ? rightW + f(s.headGap) : 0);
    const headlineH = header ? drawText(header, headlineSize, 1.04, contentX, padTop, headMaxW) : 0;
    const headerH = Math.max(headlineH, rightH);

    const midY = padTop + headerH + f(s.midTop);
    const cardW = f(s.card.w);
    const cardH = f(s.card.h);
    await drawPhoto(photos[0], { x: contentX + contentW - cardW, y: midY, w: cardW, h: cardH });
    const bodyMaxW = Math.min(f(s.body.maxWidth), contentW - cardW - f(s.midGap));
    const bodyH = description
      ? drawText(description, bodySize, s.body.lineHeight, contentX, midY, bodyMaxW)
      : 0;
    const midH = Math.max(bodyH, cardH);

    const pairY = midY + midH + f(s.pairTop);
    const pairH = height - padBottom - pairY;
    const colW = (contentW - gap) / 2;
    await drawPhoto(photos[1], { x: contentX, y: pairY, w: colW, h: pairH });
    await drawPhoto(photos[2], { x: contentX + colW + gap, y: pairY, w: colW, h: pairH });
    return canvasToBlob(canvas, format);
  }

  if (slide === 7) {
    const s = L.s7;
    const padTop = f(s.padTop);
    const padBottom = f(s.padBottom);
    const { rightW, rightH } = await drawBrandRight(padTop);
    const headMaxW = contentW - (rightW ? rightW + f(s.headGap) : 0);
    const headlineH = header ? drawText(header, headlineSize, 1.04, contentX, padTop, headMaxW) : 0;
    const headerH = Math.max(headlineH, rightH);

    const subY = padTop + headerH + f(s.sub.top);
    const subH = description
      ? drawText(description, bodySize, s.sub.lineHeight, contentX, subY, contentW)
      : 0;

    const pairY = subY + subH + f(s.pairTop);
    const pairH = height - padBottom - pairY;
    const colSum = s.cols[0] + s.cols[1];
    const colW = contentW - gap;
    const colA = (colW * s.cols[0]) / colSum;
    const colB = (colW * s.cols[1]) / colSum;
    await drawPhoto(photos[0], { x: contentX, y: pairY, w: colA, h: pairH });
    await drawPhoto(photos[1], {
      x: contentX + colA + gap,
      y: pairY,
      w: colB,
      h: pairH * s.secondHeight,
    });
    return canvasToBlob(canvas, format);
  }

  // slide 3 — reviews
  const s = L.s3;
  const padTop = f(s.padTop);
  const padBottom = f(s.padBottom);
  const thumbW = f(s.thumbW);
  const thumbH = f(s.thumbH);
  const headMaxW = contentW - thumbW - f(s.headGap);
  const headlineH = header ? drawText(header, headlineSize, 1.04, contentX, padTop, headMaxW) : 0;
  await drawPhoto(photos[0], { x: contentX + contentW - thumbW, y: padTop, w: thumbW, h: thumbH });
  const headerH = Math.max(headlineH, thumbH);

  const gridTop = padTop + headerH + f(s.gridTop);
  const gridH = height - padBottom - gridTop;
  const rowSum = s.rows[0] + s.rows[1];
  const rowTopH = ((gridH - gap) * s.rows[0]) / rowSum;
  const rowBotH = ((gridH - gap) * s.rows[1]) / rowSum;
  await drawPhoto(photos[1], { x: contentX, y: gridTop, w: contentW, h: rowTopH });

  const pairY = gridTop + rowTopH + gap;
  const colSum = s.pairCols[0] + s.pairCols[1];
  const colW = contentW - gap;
  const colA = (colW * s.pairCols[0]) / colSum;
  const colB = (colW * s.pairCols[1]) / colSum;
  await drawPhoto(photos[2], { x: contentX, y: pairY, w: colA, h: rowBotH });
  await drawPhoto(photos[3], { x: contentX + colA + gap, y: pairY, w: colB, h: rowBotH });
  return canvasToBlob(canvas, format);
}

// Rasterize a Mono Grid creative: a full-bleed background photo split into a
// 3×3 grid by thin lines in the canvas background colour, up to 3 cell photos,
// a caption block, a rotated side text block and an optional bottom-centred
// logo — mirroring `GridPreview`.
async function exportGrid(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);
  const variant = gridVariant(template.id);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  // Background photo, then each visible cell photo into its variant cell.
  const background = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "background",
  );
  let failed = 0;
  if (background?.visible && background.src) {
    try {
      const img = await loadImage(background.src);
      drawImageCover(ctx, img, { x: 0, y: 0, w: width, h: height }, imageTransform(background));
    } catch {
      failed += 1;
    }
  }
  for (let index = 0; index < variant.photos.length; index++) {
    const layer = layers.find(
      (candidate): candidate is Extract<EditorLayer, { kind: "image" }> =>
        candidate.id === `cell-${index + 1}` && candidate.kind === "image",
    );
    if (!layer?.visible || !layer.src) continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(
        ctx,
        img,
        gridCellRect(variant.photos[index], width, height),
        imageTransform(layer),
      );
    } catch {
      failed += 1;
    }
  }
  if (failed > 0) throw new ExportImageError(failed);

  // Grid hairlines (2 vertical + 2 horizontal), centred on the cell edges.
  const line = Math.max(1, GRID_LAYOUT.line * width);
  ctx.fillStyle = template.background;
  for (const i of [1, 2]) {
    ctx.fillRect((i * width) / 3 - line / 2, 0, line, height);
    ctx.fillRect(0, (i * height) / 3 - line / 2, width, line);
  }

  // Preload the webfonts used by the visible text layers.
  const header = layers.find((layer): layer is TextLayer => layer.id === "header");
  const tag = layers.find((layer): layer is TextLayer => layer.id === "eyebrow");
  const sideTitle = layers.find((layer): layer is TextLayer => layer.id === "description");
  const sideTag = layers.find((layer): layer is TextLayer => layer.id === "cta");
  const textLayers = [header, tag, sideTitle, sideTag].filter((layer): layer is TextLayer =>
    Boolean(layer && layer.visible && layer.text.trim()),
  );
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) => {
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // A caption-style block (headline lines + smaller hashtag) centred at (cx, cy).
  const drawBlock = (
    title: TextLayer | undefined,
    tagLayer: TextLayer | undefined,
    cx: number,
    cy: number,
    sizes: { size: number; tagSize: number; lineHeight: number; gap: number },
  ) => {
    const titleLines =
      title?.visible && title.text.trim() ? gridTextLines(title.text, title.uppercase) : [];
    const tagText =
      tagLayer?.visible && tagLayer.text.trim()
        ? tagLayer.uppercase
          ? tagLayer.text.toUpperCase()
          : tagLayer.text
        : "";
    if (!titleLines.length && !tagText) return;
    const titleStyle = title ? resolveTextStyle(title) : null;
    const tagStyle = tagLayer ? resolveTextStyle(tagLayer) : null;
    const titleSize = sizes.size * (titleStyle?.sizeScale ?? 1) * width;
    const tagSize = sizes.tagSize * (tagStyle?.sizeScale ?? 1) * width;
    const titleH = titleLines.length * titleSize * sizes.lineHeight;
    const tagH = tagText ? tagSize * sizes.lineHeight : 0;
    const gap = titleLines.length && tagText ? sizes.gap * width : 0;
    let y = cy - (titleH + gap + tagH) / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (title && titleStyle && titleLines.length) {
      const font = fontById(title.fontId);
      ctx.save();
      ctx.font = `${titleStyle.weight} ${titleSize}px ${font.family}`;
      ctx.letterSpacing = `${titleStyle.letterSpacing}em`;
      applyTextShadow(ctx, titleStyle.shadow, titleSize);
      ctx.fillStyle = title.color;
      for (const lineText of titleLines) {
        ctx.fillText(lineText, cx, y + (titleSize * sizes.lineHeight) / 2);
        y += titleSize * sizes.lineHeight;
      }
      ctx.restore();
    } else {
      y += titleH;
    }
    y += gap;
    if (tagLayer && tagStyle && tagText) {
      const font = fontById(tagLayer.fontId);
      ctx.save();
      ctx.font = `${tagStyle.weight} ${tagSize}px ${font.family}`;
      ctx.letterSpacing = `${tagStyle.letterSpacing}em`;
      applyTextShadow(ctx, tagStyle.shadow, tagSize);
      ctx.fillStyle = tagLayer.color;
      ctx.fillText(tagText, cx, y + tagH / 2);
      ctx.restore();
    }
  };

  // Caption block, centred in its cell.
  const captionRect = gridCellRect(variant.caption, width, height);
  drawBlock(
    header,
    tag,
    captionRect.x + captionRect.w / 2,
    captionRect.y + captionRect.h / 2,
    GRID_LAYOUT.caption,
  );

  // Side block — same stack, rotated -90° around its cell centre so it reads
  // bottom-to-top with the hashtag to the right of the title.
  const sideRect = gridCellRect(variant.side, width, height);
  ctx.save();
  ctx.translate(sideRect.x + sideRect.w / 2, sideRect.y + sideRect.h / 2);
  ctx.rotate(-Math.PI / 2);
  drawBlock(sideTitle, sideTag, 0, 0, GRID_LAYOUT.side);
  ctx.restore();

  // Bottom-centred brand logo.
  const logo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "logo" }> =>
      layer.kind === "logo" && layer.visible && Boolean(layer.src),
  );
  if (logo) {
    try {
      const img = await loadImage(logo.src);
      const maxH = GRID_LAYOUT.logo.height * width;
      const maxW = GRID_LAYOUT.logo.maxWidth * width;
      const scale = Math.min(maxH / img.height, maxW / img.width);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (width - dw) / 2, height - GRID_LAYOUT.logo.bottom * height - dh, dw, dh);
    } catch {
      // A missing logo shouldn't block the export — the creative is complete
      // without it.
    }
  }

  return canvasToBlob(canvas, format);
}

// Rasterize the Everyday Icons fashion collage: six required images in a fixed
// white grid, with a required title and two optional small copy blocks. Mirrors
// `FashionIconsPreview`.
async function exportFashionIcons(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;
  const textLayers = ["header", "description", "cta"]
    .map((id) => byId<TextLayer>(id))
    .filter((layer): layer is TextLayer => Boolean(layer?.visible && layer.text.trim()));

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) =>
        document.fonts
          .load(
            `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
          )
          .catch(() => undefined),
      ),
    ).catch(() => undefined);
  }

  const geo = fashionIconsGeometry(width, height);
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  let failed = 0;
  for (let index = 0; index < geo.cells.length; index++) {
    const layer = byId<Extract<EditorLayer, { kind: "image" }>>(`cell-${index + 1}`);
    if (!layer?.visible || !layer.src) continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(ctx, img, geo.cells[index], imageTransform(layer));
    } catch {
      failed += 1;
    }
  }
  if (failed > 0) throw new ExportImageError(failed);

  const drawTextBox = (
    layer: TextLayer | undefined,
    box: { x: number; y: number; w: number; size: number; lineHeight: number },
  ) => {
    if (!layer?.visible || !layer.text.trim()) return;
    const style = resolveTextStyle(layer);
    const fontSize = box.size * style.sizeScale;
    const family = fontById(layer.fontId).family;
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
    ctx.save();
    ctx.fillStyle = layer.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "top";
    ctx.font = `${style.weight} ${fontSize}px ${family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, Boolean(style.shadow), fontSize);

    const x = alignX(style.align, box.x, box.x + box.w);
    const lines = text
      .split(/\n/)
      .flatMap((line) => (line.trim() ? wrapLines(ctx, line.trim(), box.w) : [""]));
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, x, box.y + lineIndex * fontSize * box.lineHeight);
    });
    ctx.restore();
  };

  drawTextBox(byId<TextLayer>("header"), geo.title);
  drawTextBox(byId<TextLayer>("description"), geo.leftCopy);
  drawTextBox(byId<TextLayer>("cta"), geo.rightCopy);

  return canvasToBlob(canvas, format);
}

// Rasterize a showcase grid: eight required `cell-{n}` photos cover-fit their
// SHOWCASE_PHOTO_CELLS rects around a centre panel of stacked live text (drop /
// sale / lookbook — see SHOWCASE_VARIANTS). The lookbook variant also stamps a
// fixed, non-editable "Look {n}" label on every photo cell. Mirrors
// `ShowcasePreview`.
async function exportShowcase(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const byId = <T extends EditorLayer>(id: string) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const geo = showcaseGeometry(template.id, width, height);
  const variant = showcaseVariant(template.id);
  const textLayers = geo.slots
    .map((slot) => byId<TextLayer>(slot.id))
    .filter((layer): layer is TextLayer => Boolean(layer?.visible && layer.text.trim()));

  if (typeof document !== "undefined" && document.fonts) {
    const loads = textLayers.map((layer) =>
      document.fonts
        .load(
          `${resolveTextStyle(layer).weight} 64px ${primaryFamily(fontById(layer.fontId).family)}`,
        )
        .catch(() => undefined),
    );
    if (variant.lookLabels) {
      loads.push(
        document.fonts
          .load(`500 32px ${primaryFamily(fontById(variant.lookLabels.fontId).family)}`)
          .catch(() => undefined),
      );
    }
    await Promise.all(loads).catch(() => undefined);
  }

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = geo.centerFill;
  ctx.fillRect(geo.textCell.x, geo.textCell.y, geo.textCell.w, geo.textCell.h);

  let failed = 0;
  for (let index = 0; index < geo.photos.length; index++) {
    const cell = geo.photos[index];
    const layer = byId<Extract<EditorLayer, { kind: "image" }>>(`cell-${index + 1}`);
    if (!layer?.visible || !layer.src) continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(ctx, img, cell.rect, imageTransform(layer));
    } catch {
      failed += 1;
      continue;
    }
    if (cell.label && geo.lookLabels) {
      ctx.save();
      ctx.fillStyle = geo.lookLabels.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = `500 ${cell.label.size}px ${primaryFamily(fontById(geo.lookLabels.fontId).family)}`;
      ctx.fillText(showcaseLookLabel(index), cell.label.x, cell.label.y);
      ctx.restore();
    }
  }
  if (failed > 0) throw new ExportImageError(failed);

  for (const slot of geo.slots) {
    const layer = byId<TextLayer>(slot.id);
    if (!layer?.visible || !layer.text.trim()) continue;
    const style = resolveTextStyle(layer);
    const fontSize = slot.size * style.sizeScale;
    const family = fontById(layer.fontId).family;
    const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;

    ctx.save();
    ctx.fillStyle = layer.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "middle";
    ctx.font = `${slot.italic ? "italic " : ""}${style.weight} ${fontSize}px ${primaryFamily(family)}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, Boolean(style.shadow), fontSize);

    const lines = slot.wrap ? wrapLines(ctx, text, slot.w) : [text];
    const pitch = fontSize * slot.lineHeight;
    const x = alignX(style.align, slot.x, slot.x + slot.w);
    let y = slot.y - (lines.length * pitch) / 2;
    lines.forEach((line) => {
      ctx.fillText(line, x, y + pitch / 2);
      y += pitch;
    });
    ctx.letterSpacing = "0px";
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

// Rasterize a masonry moodboard: each `cell-{i+1}` image layer cover-fits its
// `mosaicCells(template.id)[i]` rect — no text at all. Mirrors `MosaicPreview`.
async function exportMosaic(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const cells = mosaicCells(template.id);
  let failed = 0;
  for (let index = 0; index < cells.length; index++) {
    const layer = layers.find(
      (candidate): candidate is Extract<EditorLayer, { kind: "image" }> =>
        candidate.id === `cell-${index + 1}` && candidate.kind === "image",
    );
    if (!layer?.visible || !layer.src) continue;
    const cell = cells[index];
    try {
      const img = await loadImage(layer.src);
      drawImageCover(
        ctx,
        img,
        { x: cell.x * width, y: cell.y * height, w: cell.w * width, h: cell.h * height },
        imageTransform(layer),
      );
    } catch {
      failed += 1;
    }
  }
  if (failed > 0) throw new ExportImageError(failed);

  return canvasToBlob(canvas, format);
}

// Rasterize a "New Drop" creative: a tilted Polaroid-style photo card between
// two giant fixed headline words, a script caption in the card's caption
// strip, optional corner labels and an optional footer pill — mirroring
// `DropPreview`.
async function exportDrop(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat,
  width: number,
): Promise<Blob> {
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  const photoLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  const caption = byId<TextLayer>("header");
  const brandLabel = byId<TextLayer>("eyebrow");
  const categoryLabel = byId<TextLayer>("description");
  const cta = byId<TextLayer>("cta");

  let photo: HTMLImageElement | null = null;
  if (photoLayer?.visible && photoLayer.src) {
    try {
      photo = await loadImage(photoLayer.src);
    } catch {
      throw new ExportImageError(1);
    }
  }

  // Preload the webfonts used by the visible text layers, plus the fixed
  // headline and pill-label fonts (not tied to a layer).
  const textLayers = [caption, brandLabel, categoryLabel, cta].filter((layer): layer is TextLayer =>
    Boolean(layer && layer.visible && layer.text.trim()),
  );
  if (typeof document !== "undefined" && document.fonts) {
    const faces = [
      `400 100px ${primaryFamily(fontById(DROP_LAYOUT.words.font).family)}`,
      `700 100px ${primaryFamily(fontById("poppins").family)}`,
      ...textLayers.map(
        (layer) =>
          `${resolveTextStyle(layer).weight} 100px ${primaryFamily(fontById(layer.fontId).family)}`,
      ),
    ];
    await Promise.all(faces.map((face) => document.fonts.load(face).catch(() => undefined)));
  }

  // Giant fixed headline words, drawn first so the card sits on top of them.
  const wordFont = fontById(DROP_LAYOUT.words.font);
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${DROP_LAYOUT.words.size * width}px ${wordFont.family}`;
  ctx.fillText(DROP_LAYOUT.words.top.text, width / 2, DROP_LAYOUT.words.top.centerY * height);
  ctx.fillText(DROP_LAYOUT.words.bottom.text, width / 2, DROP_LAYOUT.words.bottom.centerY * height);
  ctx.restore();

  // The tilted Polaroid card: white card + shadow, the photo window and the
  // script caption in the strip below it, all rotated together about the
  // card's own centre.
  const card = DROP_LAYOUT.card;
  const cardX = card.left * width;
  const cardY = card.top * height;
  const cardW = (card.right - card.left) * width;
  const cardH = (card.bottom - card.top) * height;
  const cx = cardX + cardW / 2;
  const cy = cardY + cardH / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((DROP_LAYOUT.rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  ctx.save();
  ctx.shadowColor = card.shadow.color;
  ctx.shadowBlur = card.shadow.blur * width;
  ctx.shadowOffsetX = card.shadow.offsetX * width;
  ctx.shadowOffsetY = card.shadow.offsetY * width;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.restore();

  const p = DROP_LAYOUT.photo;
  const photoBox = {
    x: p.left * width,
    y: p.top * height,
    w: (p.right - p.left) * width,
    h: (p.bottom - p.top) * height,
  };
  if (photo && photoLayer) drawImageCover(ctx, photo, photoBox, imageTransform(photoLayer));

  if (caption?.visible && caption.text.trim()) {
    const font = fontById(caption.fontId);
    const style = resolveTextStyle(caption);
    const size = dropCaptionFontSize(caption, cardW);
    const label = caption.uppercase ? caption.text.toUpperCase() : caption.text;
    const stripCenterY = (photoBox.y + photoBox.h + (cardY + cardH)) / 2;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = caption.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, stripCenterY);
    ctx.restore();
  }
  ctx.restore(); // end card rotation

  // Top corner brand/category labels — not rotated with the card.
  const c = DROP_LAYOUT.corners;
  const cornerY = c.centerY * height;
  if (brandLabel?.visible && brandLabel.text.trim()) {
    const font = fontById(brandLabel.fontId);
    const style = resolveTextStyle(brandLabel);
    ctx.save();
    ctx.font = `${style.weight} ${c.size * width * style.sizeScale}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing || c.tracking}em`;
    ctx.fillStyle = brandLabel.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      brandLabel.uppercase ? brandLabel.text.toUpperCase() : brandLabel.text,
      c.pad * width,
      cornerY,
    );
    ctx.restore();
  }
  if (categoryLabel?.visible && categoryLabel.text.trim()) {
    const font = fontById(categoryLabel.fontId);
    const style = resolveTextStyle(categoryLabel);
    ctx.save();
    ctx.font = `${style.weight} ${c.size * width * style.sizeScale}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing || c.tracking}em`;
    ctx.fillStyle = categoryLabel.color;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(
      categoryLabel.uppercase ? categoryLabel.text.toUpperCase() : categoryLabel.text,
      width - c.pad * width,
      cornerY,
    );
    ctx.restore();
  }

  // Footer pill: a stroked capsule holding the fixed "DISCOVER MORE AT" label,
  // flush against a smaller filled pill holding the editable handle. Both
  // pills' widths come from the measured text so any handle length centres.
  if (cta?.visible && cta.text.trim()) {
    const pill = DROP_LAYOUT.pill;
    const ctaFont = fontById(cta.fontId);
    const ctaStyle = resolveTextStyle(cta);
    const poppins = fontById("poppins");
    const labelText = "DISCOVER MORE AT";
    const handleText = cta.uppercase ? cta.text.toUpperCase() : cta.text;

    const outerH = pill.height * width;
    const labelSize = pill.labelSize * width;
    const ctaSize = pill.ctaSize * width * ctaStyle.sizeScale;

    ctx.save();
    ctx.font = `700 ${labelSize}px ${poppins.family}`;
    ctx.letterSpacing = `${pill.labelTracking}em`;
    const labelWidth = ctx.measureText(labelText).width;

    ctx.font = `${ctaStyle.weight} ${ctaSize}px ${ctaFont.family}`;
    ctx.letterSpacing = `${ctaStyle.letterSpacing}em`;
    const handleWidth = ctx.measureText(handleText).width;

    const inset = pill.inset * width;
    const innerH = outerH - inset * 2;
    const innerPadX = pill.padX * width;
    const innerW = handleWidth + innerPadX * 2;

    const padX = pill.padX * width;
    const gap = pill.gap * width;
    const outerW = padX + labelWidth + gap + innerW + inset;

    const outerX = (width - outerW) / 2;
    const outerY = pill.centerY * height - outerH / 2;
    const innerX = outerX + outerW - inset - innerW;
    const innerY = outerY + (outerH - innerH) / 2;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, innerH / 2);
    ctx.fill();

    ctx.font = `700 ${labelSize}px ${poppins.family}`;
    ctx.letterSpacing = `${pill.labelTracking}em`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, outerX + padX, outerY + outerH / 2);

    ctx.font = `${ctaStyle.weight} ${ctaSize}px ${ctaFont.family}`;
    ctx.letterSpacing = `${ctaStyle.letterSpacing}em`;
    // Visual knockout: the handle letters reveal the red canvas below the
    // white tab, matching the reference's transparent-text treatment.
    ctx.fillStyle = template.background;
    ctx.textAlign = "center";
    ctx.fillText(handleText, innerX + innerW / 2, innerY + innerH / 2);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = pill.stroke * width;
    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, outerH / 2);
    ctx.stroke();
    ctx.restore();
  }

  return canvasToBlob(canvas, format);
}

export async function exportCreative(
  template: RemixEditorTemplate,
  layers: EditorLayer[],
  format: ExportFormat = "png",
  width = 1080,
): Promise<Blob> {
  if (template.layout === "moodboard") {
    return exportMoodboard(template, layers, format, width);
  }
  if (template.layout === "cover") {
    return exportCover(template, layers, format, width);
  }
  if (template.layout === "porto") {
    return exportPorto(template, layers, format, width);
  }
  if (template.layout === "relax") {
    return exportRelax(template, layers, format, width);
  }
  if (template.layout === "verticals") {
    return exportVerticals(template, layers, format, width);
  }
  if (template.layout === "split") {
    return exportSplit(template, layers, format, width);
  }
  if (template.layout === "sliced") {
    return exportSliced(template, layers, format, width);
  }
  if (template.layout === "editorial") {
    return exportEditorial(template, layers, format, width);
  }
  if (template.layout === "collage") {
    return exportCollage(template, layers, format, width);
  }
  if (template.layout === "duel") {
    return exportDuel(template, layers, format, width);
  }
  if (template.layout === "business-choice") {
    return exportBusinessChoice(template, layers, format, width);
  }
  if (template.layout === "testimonial") {
    const square = template.aspectRatio.replace(/\s/g, "") === "1/1";
    return exportTestimonial(template, layers, format, square && width === 1080 ? 1200 : width);
  }
  if (template.layout === "testimonial-arc") {
    return exportTestimonialArc(template, layers, format, width);
  }
  if (template.layout === "postcard") {
    return exportPostcard(template, layers, format, width);
  }
  if (template.layout === "citymask") {
    return exportCityMask(template, layers, format, width);
  }
  if (template.layout === "self") {
    return exportSelf(template, layers, format, width);
  }
  if (template.layout === "grid") {
    return exportGrid(template, layers, format, width);
  }
  if (template.layout === "drop") {
    return exportDrop(template, layers, format, width);
  }
  if (template.layout === "woven") {
    return exportWoven(template, layers, format, width);
  }
  if (template.layout === "statement") {
    return exportStatement(template, layers, format, width);
  }
  if (template.layout === "brief") {
    return exportBrief(template, layers, format, width);
  }
  if (template.layout === "open-space") {
    return exportOpenSpace(template, layers, format, width);
  }
  if (template.layout === "interior-inspiration") {
    return exportInteriorInspiration(template, layers, format, width);
  }
  if (template.layout === "fashion-icons") {
    return exportFashionIcons(template, layers, format, width);
  }
  if (template.layout === "showcase") {
    return exportShowcase(template, layers, format, width);
  }
  if (template.layout === "mosaic") {
    return exportMosaic(template, layers, format, width);
  }

  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  // Background.
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);

  const byId = <T extends EditorLayer>(id: EditorLayer["id"]) =>
    layers.find((layer) => layer.id === id) as T | undefined;

  // Best-effort: make sure the chosen webfonts are ready before drawing text.
  const textLayers = layers.filter(
    (layer): layer is TextLayer =>
      (layer.id === "header" || layer.id === "description" || layer.id === "cta") && layer.visible,
  );
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) => {
        const font = fontById(layer.fontId);
        return document.fonts
          .load(`${resolveTextStyle(layer).weight} 100px ${primaryFamily(font.family)}`)
          .catch(() => undefined);
      }),
    ).catch(() => undefined);
  }

  // Product image.
  const imageLayer = byId<Extract<EditorLayer, { kind: "image" }>>("image");
  if (imageLayer?.visible) {
    try {
      const img = await loadImage(imageLayer.src);
      drawImageContain(
        ctx,
        img,
        {
          x: LAYOUT.padX * width,
          y: LAYOUT.image.top * height,
          w: (1 - 2 * LAYOUT.padX) * width,
          h: (LAYOUT.image.bottom - LAYOUT.image.top) * height,
        },
        0,
        "center",
        imageTransform(imageLayer),
      );
    } catch {
      // Skip the image rather than failing the whole export.
    }
  }

  // Logo (top-left).
  const logoLayer = byId<Extract<EditorLayer, { kind: "logo" }>>("logo");
  if (logoLayer?.visible) {
    try {
      const logo = await loadImage(logoLayer.src);
      drawImageContain(
        ctx,
        logo,
        {
          x: LAYOUT.logo.x * width,
          y: LAYOUT.logo.y * height,
          w: LAYOUT.logo.w * width,
          h: LAYOUT.logo.h * height,
        },
        0,
        "left",
      );
    } catch {
      // ignore
    }
  }

  // Header.
  const header = byId<TextLayer>("header");
  if (header?.visible && header.text.trim()) {
    const font = fontById(header.fontId);
    const style = resolveTextStyle(header);
    const size = LAYOUT.header.size * style.sizeScale * width;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = header.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "top";
    const text = header.uppercase ? header.text.toUpperCase() : header.text;
    const lines = wrapLines(ctx, text, (1 - 2 * LAYOUT.padX) * width);
    const lineHeight = size * LAYOUT.header.lineHeight;
    const x = alignX(style.align, LAYOUT.padX * width, (1 - LAYOUT.padX) * width);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, LAYOUT.header.top * height + index * lineHeight);
    });
    ctx.restore();
  }

  // Description.
  const description = byId<TextLayer>("description");
  if (description?.visible && description.text.trim()) {
    const font = fontById(description.fontId);
    const style = resolveTextStyle(description);
    const size = LAYOUT.description.size * style.sizeScale * width;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = description.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "top";
    const text = description.uppercase ? description.text.toUpperCase() : description.text;
    const lines = wrapLines(ctx, text, (1 - 2 * LAYOUT.padX) * width);
    const lineHeight = size * LAYOUT.description.lineHeight;
    const x = alignX(style.align, LAYOUT.padX * width, (1 - LAYOUT.padX) * width);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, LAYOUT.description.top * height + index * lineHeight);
    });
    ctx.restore();
  }

  // Call to action (pill button). Alignment positions the pill left/center/right.
  const cta = byId<TextLayer>("cta");
  if (cta?.visible && cta.text.trim()) {
    const font = fontById(cta.fontId);
    const style = resolveTextStyle(cta);
    const size = LAYOUT.cta.size * style.sizeScale * width;
    const label = cta.uppercase ? cta.text.toUpperCase() : cta.text;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    const labelWidth = ctx.measureText(label).width;
    const pillHeight = LAYOUT.cta.height * height;
    const pillWidth = labelWidth + 2 * LAYOUT.cta.padX * width;
    const pillY = LAYOUT.cta.top * height;
    const pillX =
      style.align === "left"
        ? LAYOUT.padX * width
        : style.align === "right"
          ? (1 - LAYOUT.padX) * width - pillWidth
          : (width - pillWidth) / 2;
    ctx.fillStyle = cta.color;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
    ctx.fill();
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = readableTextColor(cta.color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, pillX + pillWidth / 2, pillY + pillHeight / 2 + size * 0.05);
    ctx.restore();
  }

  const meta = EXPORT_FORMATS[format];
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the creative."));
      },
      meta.mime,
      meta.quality,
    );
  });
}

// Rasterize the editor's creative to a PNG using the same fractional geometry
// (`LAYOUT`) the live DOM preview uses, so the download matches what's on screen.

import {
  COVER_LAYOUT,
  DEFAULT_IMAGE_TRANSFORM,
  EXPORT_FORMATS,
  LAYOUT,
  MOODBOARD_LAYOUT,
  RELAX_LAYOUT,
  SPLIT_LAYOUT,
  VERTICALS_LAYOUT,
  verticalsTitleChars,
  PORTO_CAPTION_TRACKING,
  PORTO_CARD,
  PORTO_LAYOUT,
  TEXT_SHADOW,
  fontById,
  imageTransform,
  readableTextColor,
  resolveTextStyle,
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
    super(
      `Couldn't load ${failedCount} photo${failedCount === 1 ? "" : "s"} for export.`,
    );
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

  if (header) addBlock(header, RELAX_LAYOUT.caption.headline.size, RELAX_LAYOUT.caption.headline.lineHeight);
  if (description) addBlock(description, RELAX_LAYOUT.caption.sub.size, RELAX_LAYOUT.caption.sub.lineHeight);

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
    const size = SPLIT_LAYOUT.headline.size * style.sizeScale * width;
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
      .flatMap((para) => (para.trim() === "" ? [""] : wrapLines(ctx, para, SPLIT_LAYOUT.body.width * width)));
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
        ? document.fonts.load(`${resolveTextStyle(caption!).weight} 100px ${primaryFamily(capFont.family)}`)
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

// Rasterize a FRANKOF cover (slide 9): one full-bleed photo, a bottom scrim, and
// a large uppercase headline anchored bottom-left — mirrors `CoverPreview` and
// `template_frankof.v2.html`'s `.s9`.
async function exportCover(
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

  // Bottom scrim — transparent to dark, so the headline stays legible.
  const scrim = ctx.createLinearGradient(0, 0, 0, height);
  scrim.addColorStop(COVER_LAYOUT.scrim.start, `rgba(${COVER_LAYOUT.scrim.color},0)`);
  scrim.addColorStop(1, `rgba(${COVER_LAYOUT.scrim.color},${COVER_LAYOUT.scrim.opacity})`);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, width, height);

  const header = layers.find(
    (layer): layer is TextLayer => layer.kind === "header" && layer.visible,
  );
  if (header && header.text.trim()) {
    const font = fontById(header.fontId);
    const style = resolveTextStyle(header);
    const size = COVER_LAYOUT.headline.size * style.sizeScale * width;
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts
        .load(`${style.weight} ${size}px ${primaryFamily(font.family)}`)
        .catch(() => undefined);
    }
    const text = header.uppercase ? header.text.toUpperCase() : header.text;
    const leftX = COVER_LAYOUT.padX * width;
    const maxW = (1 - COVER_LAYOUT.padX - COVER_LAYOUT.padRight) * width;
    ctx.save();
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.letterSpacing = `${style.letterSpacing}em`;
    // Honour explicit line breaks (the headline uses them), wrapping each line.
    const lines = text
      .split("\n")
      .flatMap((para) => (para.trim() === "" ? [""] : wrapLines(ctx, para, maxW)));
    const lineHeight = size * COVER_LAYOUT.headline.lineHeight;
    const totalH = lines.length * lineHeight;
    // The block's bottom edge sits `bottom` (fraction of height) above the base.
    const bottomY = height - COVER_LAYOUT.headline.bottom * height;
    const startY = bottomY - totalH;
    applyTextShadow(ctx, style.shadow, size);
    ctx.fillStyle = header.color;
    ctx.textAlign = style.align;
    ctx.textBaseline = "top";
    const x = alignX(style.align, leftX, leftX + maxW);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight);
    });
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

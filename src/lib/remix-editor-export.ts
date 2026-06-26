// Rasterize the editor's creative to a PNG using the same fractional geometry
// (`LAYOUT`) the live DOM preview uses, so the download matches what's on screen.

import {
  DEFAULT_IMAGE_TRANSFORM,
  EXPORT_FORMATS,
  LAYOUT,
  MOODBOARD_LAYOUT,
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
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
      // Skip a band rather than failing the whole export.
    }
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
  maskCtx.letterSpacing = "-0.035em";
  maskCtx.fillStyle = colorFallback;
  maskCtx.textAlign = "left";
  maskCtx.textBaseline = "top";
  maskCtx.fillText(text, textBox.x, textBox.y, textBox.w);
  maskCtx.globalCompositeOperation = "source-in";
  drawImageCover(maskCtx, image, imageBox, transform);
  maskCtx.restore();

  ctx.drawImage(mask, 0, 0);
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
  const caption = byId<TextLayer>("header");
  const overview = byId<TextLayer>("description");
  const image = imageLayer ? await loadImage(imageLayer.src) : null;
  const transform = imageLayer ? imageTransform(imageLayer) : DEFAULT_IMAGE_TRANSFORM;

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, width, height);

  if (image) {
    drawImageCover(ctx, image, { x: 0, y: 0, w: width, h: height });
  }

  const card = {
    x: PORTO_LAYOUT.card.x * width,
    y: PORTO_LAYOUT.card.y * height,
    w: PORTO_LAYOUT.card.w * width,
    h: PORTO_LAYOUT.card.h * height,
  };
  const photo = {
    x: PORTO_LAYOUT.photo.x * width,
    y: PORTO_LAYOUT.photo.y * height,
    w: PORTO_LAYOUT.photo.w * width,
    h: PORTO_LAYOUT.photo.h * height,
  };

  ctx.fillStyle = template.background;
  ctx.fillRect(card.x, card.y, card.w, card.h);

  if (image && imageLayer?.visible !== false) {
    drawImageCover(ctx, image, photo, transform);
  }

  ctx.fillStyle = template.background;
  ctx.fillRect(
    PORTO_LAYOUT.headlineCover.x * width,
    PORTO_LAYOUT.headlineCover.y * height,
    PORTO_LAYOUT.headlineCover.w * width,
    PORTO_LAYOUT.headlineCover.h * height,
  );

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all([
      document.fonts.load(`400 ${PORTO_LAYOUT.headline.size * width}px 'Anton'`),
      document.fonts.load(`400 ${PORTO_LAYOUT.overview.size * width}px 'Montserrat'`),
    ]).catch(() => undefined);
  }

  ctx.save();
  ctx.fillStyle = "#29292b";
  ctx.font = `400 ${PORTO_LAYOUT.eyebrow.size * width}px 'Montserrat', sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("PORTUGAL", PORTO_LAYOUT.eyebrow.x * width, PORTO_LAYOUT.eyebrow.y * height);
  ctx.restore();

  if (overview?.visible !== false && overview?.text.trim()) {
    ctx.save();
    const font = fontById(overview.fontId);
    const style = resolveTextStyle(overview);
    const size = PORTO_LAYOUT.overview.size * style.sizeScale * width;
    ctx.font = `${style.weight} ${size}px ${font.family}`;
    ctx.fillStyle = overview.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const lines = wrapLines(ctx, overview.text, PORTO_LAYOUT.overview.w * width);
    const lineHeight = size * PORTO_LAYOUT.overview.lineHeight;
    const x = PORTO_LAYOUT.overview.x * width;
    const y = PORTO_LAYOUT.overview.y * height;
    lines.slice(0, 5).forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    ctx.restore();
  }

  if (image && caption?.visible !== false && caption?.text.trim()) {
    const label = caption.uppercase ? caption.text.toUpperCase() : caption.text;
    const font = fontById(caption.fontId);
    const style = resolveTextStyle(caption);
    const size = PORTO_LAYOUT.headline.size * style.sizeScale * width;
    drawTextImageFill(
      ctx,
      image,
      label,
      {
        x: PORTO_LAYOUT.headline.x * width,
        y: PORTO_LAYOUT.headline.y * height,
        w: PORTO_LAYOUT.headline.w * width,
        h: size,
      },
      photo,
      `${style.weight} ${size}px ${font.family}`,
      caption.color,
      transform,
    );
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
  if (template.layout === "porto") {
    return exportPorto(template, layers, format, width);
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

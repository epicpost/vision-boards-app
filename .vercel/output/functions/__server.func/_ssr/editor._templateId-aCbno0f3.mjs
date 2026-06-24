import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, d as DropdownMenuLabel, c as DropdownMenuItem } from "./dropdown-menu-CqiGz96I.mjs";
import { z as Route$1, c as cn } from "./router-Bd-4THC9.mjs";
import { g as getRemixEditorTemplate, c as cloneLayers, e as editorFontsHref, E as EXPORT_FORMATS, M as MOODBOARD_LAYOUT, f as fontById, L as LAYOUT, r as readableTextColor, i as isLightColor, a as EDITOR_FONTS } from "./remix-editor-xQNVkEye.mjs";
import { A as ArrowLeft, k as LoaderCircle, D as Download, d as ChevronDown, h as ChevronRight, Z as ThumbsUp, _ as ThumbsDown, $ as Flag, a0 as Undo2, a1 as Redo2, a2 as WandSparkles, a3 as SlidersHorizontal, a4 as Eye, a5 as EyeOff, Y as Sparkles } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function parseRatio(aspectRatio) {
  const [w, h] = aspectRatio.split("/").map((part) => Number(part.trim()));
  if (!w || !h) return 0.8;
  return w / h;
}
function primaryFamily(stack) {
  return stack.split(",")[0]?.trim() ?? stack;
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines = [];
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
function drawImageCover(ctx, image, box) {
  const scale = Math.max(box.w / image.width, box.h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  const dx = box.x + (box.w - dw) / 2;
  const dy = box.y + (box.h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.drawImage(image, dx, dy, dw, dh);
  ctx.restore();
}
function drawImageContain(ctx, image, box, radius = 0, align = "center") {
  const scale = Math.min(box.w / image.width, box.h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  const dx = align === "left" ? box.x : box.x + (box.w - dw) / 2;
  const dy = box.y + (box.h - dh) / 2;
  if (radius > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(dx, dy, dw, dh, radius);
    ctx.clip();
    ctx.drawImage(image, dx, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(image, dx, dy, dw, dh);
  }
}
function canvasToBlob(canvas, format) {
  const meta = EXPORT_FORMATS[format];
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the creative."));
      },
      meta.mime,
      meta.quality
    );
  });
}
async function exportMoodboard(template, layers, format, width) {
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
  const bandHeight = height / Math.max(photoLayers.length, 1);
  for (let index = 0; index < photoLayers.length; index++) {
    const layer = photoLayers[index];
    if (!layer.visible || layer.kind !== "image") continue;
    try {
      const img = await loadImage(layer.src);
      drawImageCover(ctx, img, {
        x: 0,
        y: index * bandHeight,
        w: width,
        h: bandHeight
      });
    } catch {
    }
  }
  const header = layers.find(
    (layer) => layer.kind === "header" && layer.visible
  );
  if (header && header.text.trim()) {
    const font = fontById(header.fontId);
    const size = MOODBOARD_LAYOUT.title.size * width;
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.load(`${MOODBOARD_LAYOUT.title.weight} ${size}px ${primaryFamily(font.family)}`).catch(() => void 0);
    }
    const text = header.uppercase ? header.text.toUpperCase() : header.text;
    ctx.font = `${MOODBOARD_LAYOUT.title.weight} ${size}px ${font.family}`;
    const lines = wrapLines(ctx, text, (1 - 2 * MOODBOARD_LAYOUT.title.padX) * width);
    const lineHeight = size * MOODBOARD_LAYOUT.title.lineHeight;
    const totalHeight = lines.length * lineHeight;
    const startY = MOODBOARD_LAYOUT.title.centerY * height - totalHeight / 2 + lineHeight / 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = size * 0.25;
    ctx.shadowOffsetY = size * 0.04;
    ctx.fillStyle = header.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    ctx.restore();
  }
  return canvasToBlob(canvas, format);
}
async function exportCreative(template, layers, format = "png", width = 1080) {
  if (template.layout === "moodboard") {
    return exportMoodboard(template, layers, format, width);
  }
  const ratio = parseRatio(template.aspectRatio);
  const height = Math.round(width / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  const byId = (id) => layers.find((layer) => layer.id === id);
  const textLayers = layers.filter(
    (layer) => (layer.id === "header" || layer.id === "description" || layer.id === "cta") && layer.visible
  );
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      textLayers.map((layer) => {
        const font = fontById(layer.fontId);
        return document.fonts.load(`${font.weight} 100px ${primaryFamily(font.family)}`).catch(() => void 0);
      })
    ).catch(() => void 0);
  }
  const imageLayer = byId("image");
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
          h: (LAYOUT.image.bottom - LAYOUT.image.top) * height
        },
        0.03 * width
      );
    } catch {
    }
  }
  const logoLayer = byId("logo");
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
          h: LAYOUT.logo.h * height
        },
        0,
        "left"
      );
    } catch {
    }
  }
  const header = byId("header");
  if (header?.visible && header.text.trim()) {
    const font = fontById(header.fontId);
    const size = LAYOUT.header.size * width;
    ctx.font = `${LAYOUT.header.weight} ${size}px ${font.family}`;
    ctx.fillStyle = header.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const text = header.uppercase ? header.text.toUpperCase() : header.text;
    const lines = wrapLines(ctx, text, (1 - 2 * LAYOUT.padX) * width);
    const lineHeight = size * LAYOUT.header.lineHeight;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, LAYOUT.header.top * height + index * lineHeight);
    });
  }
  const description = byId("description");
  if (description?.visible && description.text.trim()) {
    const font = fontById(description.fontId);
    const size = LAYOUT.description.size * width;
    ctx.font = `${LAYOUT.description.weight} ${size}px ${font.family}`;
    ctx.fillStyle = description.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const text = description.uppercase ? description.text.toUpperCase() : description.text;
    const lines = wrapLines(ctx, text, (1 - 2 * LAYOUT.padX) * width);
    const lineHeight = size * LAYOUT.description.lineHeight;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, LAYOUT.description.top * height + index * lineHeight);
    });
  }
  const cta = byId("cta");
  if (cta?.visible && cta.text.trim()) {
    const font = fontById(cta.fontId);
    const size = LAYOUT.cta.size * width;
    const label = cta.uppercase ? cta.text.toUpperCase() : cta.text;
    ctx.font = `${LAYOUT.cta.weight} ${size}px ${font.family}`;
    const labelWidth = ctx.measureText(label).width;
    const pillHeight = LAYOUT.cta.height * height;
    const pillWidth = labelWidth + 2 * LAYOUT.cta.padX * width;
    const pillX = (width - pillWidth) / 2;
    const pillY = LAYOUT.cta.top * height;
    ctx.fillStyle = cta.color;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
    ctx.fill();
    ctx.fillStyle = readableTextColor(cta.color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width / 2, pillY + pillHeight / 2 + size * 0.05);
  }
  const meta = EXPORT_FORMATS[format];
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the creative."));
      },
      meta.mime,
      meta.quality
    );
  });
}
function EditorRoute() {
  const {
    templateId
  } = Route$1.useParams();
  const {
    caption
  } = Route$1.useSearch();
  const router = useRouter();
  const template = getRemixEditorTemplate(templateId);
  if (!template) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Editor not available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-md text-sm text-muted-foreground", children: "This template can't be edited yet. The visual editor is currently available for a limited set of templates." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => router.history.back(), className: "rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:brightness-110", children: "Go back" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EditorScreen, { template, initialCaption: caption });
}
function ColorSwatches({
  palette,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2.5", children: palette.map((color) => {
    const active = value.toLowerCase() === color.value.toLowerCase();
    return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", title: color.label, "aria-label": color.label, "aria-pressed": active, onClick: () => onChange(color.value), className: cn("h-9 w-9 rounded-full border transition", active ? "border-transparent ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-black/10 hover:scale-110"), style: {
      backgroundColor: color.value
    } }, color.value);
  }) });
}
function FontDropdown({
  value,
  color,
  onChange
}) {
  const current = fontById(value);
  const labelColor = isLightColor(color) ? void 0 : color;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-[15px] font-semibold text-foreground transition hover:brightness-95", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        fontFamily: current.family,
        color: labelColor
      }, children: current.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "start", className: "max-h-72 w-52 overflow-y-auto", children: EDITOR_FONTS.map((font) => /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onSelect: () => onChange(font.id), className: "cursor-pointer text-base", style: {
      fontFamily: font.family
    }, children: font.label }, font.id)) })
  ] });
}
function DownloadFormatMenu({
  formats,
  align = "end",
  onSelect,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align, className: "w-48", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Download as" }),
      formats.map((format) => {
        const meta = EXPORT_FORMATS[format];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => onSelect(format), className: "cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
          meta.label,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
            ".",
            meta.extension
          ] })
        ] }, format);
      })
    ] })
  ] });
}
function EditorSection({
  title,
  open,
  onToggleOpen,
  hideable,
  visible,
  onToggleVisible,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onToggleOpen, className: "flex flex-1 items-center gap-2 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[15px] font-semibold text-foreground", children: title })
      ] }),
      hideable && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onToggleVisible, "aria-pressed": visible, "aria-label": visible ? `Hide ${title}` : `Show ${title}`, className: "flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:bg-secondary", children: visible ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5 text-muted-foreground" }) })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pb-5", children })
  ] });
}
function CreativePreview({
  template,
  layers
}) {
  const find = (id) => layers.find((layer) => layer.id === id);
  const image = find("image");
  const header = find("header");
  const description = find("description");
  const cta = find("cta");
  const logo = find("logo");
  const pct = (value) => `${value * 100}%`;
  const cqi = (value) => `${value * 100}cqi`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden rounded-[20px] shadow-2xl", style: {
    aspectRatio: template.aspectRatio,
    background: template.background,
    containerType: "inline-size"
  }, children: [
    logo?.visible && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo.src, alt: "", className: "absolute object-contain object-left", style: {
      left: pct(LAYOUT.logo.x),
      top: pct(LAYOUT.logo.y),
      width: pct(LAYOUT.logo.w),
      height: pct(LAYOUT.logo.h)
    } }),
    header?.visible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute text-center", style: {
      left: pct(LAYOUT.padX),
      right: pct(LAYOUT.padX),
      top: pct(LAYOUT.header.top),
      fontFamily: fontById(header.fontId).family,
      fontWeight: LAYOUT.header.weight,
      fontSize: cqi(LAYOUT.header.size),
      lineHeight: LAYOUT.header.lineHeight,
      color: header.color,
      textTransform: header.uppercase ? "uppercase" : "none"
    }, children: header.text }),
    description?.visible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute text-center", style: {
      left: pct(LAYOUT.padX),
      right: pct(LAYOUT.padX),
      top: pct(LAYOUT.description.top),
      fontFamily: fontById(description.fontId).family,
      fontWeight: LAYOUT.description.weight,
      fontSize: cqi(LAYOUT.description.size),
      lineHeight: LAYOUT.description.lineHeight,
      color: description.color,
      textTransform: description.uppercase ? "uppercase" : "none"
    }, children: description.text }),
    cta?.visible && cta.text.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute flex -translate-x-1/2 items-center whitespace-nowrap rounded-full", style: {
      left: "50%",
      top: pct(LAYOUT.cta.top),
      height: pct(LAYOUT.cta.height),
      paddingLeft: cqi(LAYOUT.cta.padX),
      paddingRight: cqi(LAYOUT.cta.padX),
      backgroundColor: cta.color,
      color: readableTextColor(cta.color),
      fontFamily: fontById(cta.fontId).family,
      fontWeight: LAYOUT.cta.weight,
      fontSize: cqi(LAYOUT.cta.size),
      textTransform: cta.uppercase ? "uppercase" : "none"
    }, children: cta.text }),
    image?.visible && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image.src, alt: "", className: "absolute rounded-[12px] object-contain", style: {
      left: pct(LAYOUT.padX),
      right: pct(LAYOUT.padX),
      top: pct(LAYOUT.image.top),
      bottom: pct(1 - LAYOUT.image.bottom),
      width: "auto",
      height: "auto",
      maxWidth: pct(1 - 2 * LAYOUT.padX),
      margin: "0 auto"
    } })
  ] });
}
function MoodboardPreview({
  template,
  layers
}) {
  const photos = layers.filter((layer) => layer.kind === "image");
  const header = layers.find((layer) => layer.kind === "header");
  const bandHeight = 100 / Math.max(photos.length, 1);
  const cqi = (value) => `${value * 100}cqi`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden rounded-[20px] shadow-2xl", style: {
    aspectRatio: template.aspectRatio,
    background: template.background,
    containerType: "inline-size"
  }, children: [
    photos.map((photo, index) => photo.visible ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photo.src, alt: "", className: "absolute left-0 w-full object-cover", style: {
      top: `${index * bandHeight}%`,
      height: `${bandHeight}%`
    } }, photo.id) : null),
    header?.visible && header.text.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -translate-y-1/2 text-center", style: {
      left: `${MOODBOARD_LAYOUT.title.padX * 100}%`,
      right: `${MOODBOARD_LAYOUT.title.padX * 100}%`,
      top: `${MOODBOARD_LAYOUT.title.centerY * 100}%`,
      fontFamily: fontById(header.fontId).family,
      fontWeight: MOODBOARD_LAYOUT.title.weight,
      fontSize: cqi(MOODBOARD_LAYOUT.title.size),
      lineHeight: MOODBOARD_LAYOUT.title.lineHeight,
      color: header.color,
      textTransform: header.uppercase ? "uppercase" : "none",
      textShadow: "0 2px 20px rgba(0,0,0,0.35)"
    }, children: header.text })
  ] });
}
function defaultOpenSections(template) {
  if (template.layout === "moodboard") {
    const open = {};
    template.layers.forEach((layer, index) => {
      open[layer.id] = layer.kind === "header" || index === 0;
    });
    return open;
  }
  return {
    image: true,
    header: true,
    description: false,
    cta: false,
    logo: false
  };
}
function EditorScreen({
  template,
  initialCaption
}) {
  const router = useRouter();
  const [layers, setLayers] = reactExports.useState(() => {
    const cloned = cloneLayers(template);
    if (initialCaption?.trim()) {
      return cloned.map((layer) => layer.kind === "header" ? {
        ...layer,
        text: initialCaption.trim()
      } : layer);
    }
    return cloned;
  });
  const [past, setPast] = reactExports.useState([]);
  const [future, setFuture] = reactExports.useState([]);
  const coalesceRef = reactExports.useRef(null);
  const [openSections, setOpenSections] = reactExports.useState(() => defaultOpenSections(template));
  const [reaction, setReaction] = reactExports.useState(null);
  const [flagged, setFlagged] = reactExports.useState(false);
  const [exporting, setExporting] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const replaceTargetRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "remix-editor-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = editorFontsHref();
    document.head.appendChild(link);
  }, []);
  function apply(next, coalesceKey) {
    const now = Date.now();
    const previousEdit = coalesceRef.current;
    const coalesced = Boolean(coalesceKey) && previousEdit != null && previousEdit.key === coalesceKey && now - previousEdit.time < 1e3;
    if (!coalesced) setPast((prev) => [...prev, layers]);
    coalesceRef.current = coalesceKey ? {
      key: coalesceKey,
      time: now
    } : null;
    setFuture([]);
    setLayers(next);
  }
  function updateLayer(id, patch, coalesceKey) {
    apply(layers.map((layer) => layer.id === id ? {
      ...layer,
      ...patch
    } : layer), coalesceKey);
  }
  function undo() {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([layers, ...future]);
    setLayers(previous);
    coalesceRef.current = null;
  }
  function redo() {
    if (!future.length) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past, layers]);
    setLayers(next);
    coalesceRef.current = null;
  }
  function resetDesign() {
    apply(cloneLayers(template).map((layer) => layer.kind === "header" && initialCaption?.trim() ? {
      ...layer,
      text: initialCaption.trim()
    } : layer));
    setOpenSections(defaultOpenSections(template));
    toast.success("Design reset to the template defaults.");
  }
  function cycleSuggestion(layer) {
    if (layer.suggestions.length === 0) return;
    const index = layer.suggestions.findIndex((option) => option.toLowerCase() === layer.text.trim().toLowerCase());
    const next = layer.suggestions[(index + 1) % layer.suggestions.length];
    updateLayer(layer.id, {
      text: next
    });
  }
  function openReplace(id) {
    replaceTargetRef.current = id;
    fileInputRef.current?.click();
  }
  function handleReplaceFile(file) {
    const id = replaceTargetRef.current;
    if (!id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    updateLayer(id, {
      src: url,
      visible: true
    });
  }
  async function handleDownload(format) {
    try {
      setExporting(true);
      const blob = await exportCreative(template, layers, format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `epicpost-${template.id}.${EXPORT_FORMATS[format].extension}`;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not export the creative. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  const findByKind = (kind) => layers.find((layer) => layer.kind === kind);
  const image = findByKind("image");
  const header = findByKind("header");
  const description = findByKind("description");
  const cta = findByKind("cta");
  const logo = findByKind("logo");
  const photos = layers.filter((layer) => layer.kind === "image");
  const toggleOpen = (id) => setOpenSections((current) => ({
    ...current,
    [id]: !current[id]
  }));
  const toggleVisible = (id) => updateLayer(id, {
    visible: !(layers.find((layer) => layer.id === id)?.visible ?? false)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col bg-background lg:h-screen lg:min-h-0 lg:overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (event) => {
      const file = event.target.files?.[0];
      if (file) handleReplaceFile(file);
      event.target.value = "";
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Back", onClick: () => router.history.back(), className: "flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5", strokeWidth: 2.2 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-base font-bold leading-tight text-foreground", children: template.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Edit creative" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadFormatMenu, { formats: template.formats, align: "end", onSelect: handleDownload, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: exporting, className: "flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60", children: [
        exporting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-5 w-5" }),
        "Download",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-80" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col lg:min-h-0 lg:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-5 bg-[#0e1413] px-4 py-8 lg:min-h-0 lg:overflow-y-auto lg:py-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Previous", disabled: true, className: "flex h-7 w-7 items-center justify-center rounded-full opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 rotate-180" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium tabular-nums", children: "1 / 1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Next", disabled: true, className: "flex h-7 w-7 items-center justify-center rounded-full opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-5 w-px bg-white/15" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Like", "aria-pressed": reaction === "up", onClick: () => setReaction((value) => value === "up" ? null : "up"), className: cn("flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10", reaction === "up" && "text-emerald-400"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Dislike", "aria-pressed": reaction === "down", onClick: () => setReaction((value) => value === "down" ? null : "down"), className: cn("flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10", reaction === "down" && "text-rose-400"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Flag", "aria-pressed": flagged, onClick: () => setFlagged((value) => !value), className: cn("flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10", flagged && "text-amber-400"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-full", template.layout === "moodboard" ? "max-w-[300px]" : "max-w-[360px]"), children: template.layout === "moodboard" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MoodboardPreview, { template, layers }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CreativePreview, { template, layers }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Undo", onClick: undo, disabled: past.length === 0, className: "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Redo", onClick: redo, disabled: future.length === 0, className: "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redo2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: resetDesign, className: "flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-[15px] font-semibold text-white transition hover:bg-white/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-4 w-4" }),
            "Fix design"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadFormatMenu, { formats: template.formats, align: "center", onSelect: handleDownload, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Download", disabled: exporting, className: "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40", children: exporting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-5 w-5" }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-full shrink-0 overflow-y-auto border-t border-border bg-background px-5 pb-12 lg:h-full lg:min-h-0 lg:w-[400px] lg:border-l lg:border-t-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-5 w-5 text-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground", children: "Edit creative" })
        ] }),
        template.layout === "moodboard" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          photos.map((photo) => /* @__PURE__ */ jsxRuntimeExports.jsx(EditorSection, { title: photo.label, open: openSections[photo.id] ?? false, onToggleOpen: () => toggleOpen(photo.id), hideable: photo.hideable, visible: photo.visible, onToggleVisible: () => toggleVisible(photo.id), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photo.src, alt: "", className: "h-full w-full object-cover" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => openReplace(photo.id), className: "inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-4 w-4" }),
              "Replace photo"
            ] })
          ] }) }, photo.id)),
          header && /* @__PURE__ */ jsxRuntimeExports.jsxs(EditorSection, { title: header.label, open: openSections[header.id] ?? true, onToggleOpen: () => toggleOpen(header.id), hideable: header.hideable, visible: header.visible, onToggleVisible: () => toggleVisible(header.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Title text", value: header.text, onChange: (value) => updateLayer(header.id, {
              text: value
            }, "header-text"), onSuggest: () => cycleSuggestion(header) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FontDropdown, { value: header.fontId, color: header.color, onChange: (fontId) => updateLayer(header.id, {
              fontId
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSwatches, { palette: template.palette, value: header.color, onChange: (hex) => updateLayer(header.id, {
              color: hex
            }) }) })
          ] })
        ] }),
        template.layout === "poster" && image && /* @__PURE__ */ jsxRuntimeExports.jsx(EditorSection, { title: "Image", open: openSections.image, onToggleOpen: () => toggleOpen("image"), hideable: image.hideable, visible: image.visible, onToggleVisible: () => toggleVisible("image"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image.src, alt: "", className: "h-full w-full object-cover" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => openReplace("image"), className: "inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-4 w-4" }),
            "Edit image"
          ] })
        ] }) }),
        template.layout === "poster" && header && /* @__PURE__ */ jsxRuntimeExports.jsxs(EditorSection, { title: "Header", open: openSections.header, onToggleOpen: () => toggleOpen("header"), hideable: header.hideable, visible: header.visible, onToggleVisible: () => toggleVisible("header"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Header text", value: header.text, onChange: (value) => updateLayer("header", {
            text: value
          }, "header-text"), onSuggest: () => cycleSuggestion(header) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FontDropdown, { value: header.fontId, color: header.color, onChange: (fontId) => updateLayer("header", {
            fontId
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSwatches, { palette: template.palette, value: header.color, onChange: (hex) => updateLayer("header", {
            color: hex
          }) }) })
        ] }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsxs(EditorSection, { title: "Description", open: openSections.description, onToggleOpen: () => toggleOpen("description"), hideable: description.hideable, visible: description.visible, onToggleVisible: () => toggleVisible("description"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Description text", value: description.text, multiline: true, onChange: (value) => updateLayer("description", {
            text: value
          }, "description-text"), onSuggest: () => cycleSuggestion(description) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FontDropdown, { value: description.fontId, color: description.color, onChange: (fontId) => updateLayer("description", {
            fontId
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSwatches, { palette: template.palette, value: description.color, onChange: (hex) => updateLayer("description", {
            color: hex
          }) }) })
        ] }),
        cta && /* @__PURE__ */ jsxRuntimeExports.jsxs(EditorSection, { title: "Call to action", open: openSections.cta, onToggleOpen: () => toggleOpen("cta"), hideable: cta.hideable, visible: cta.visible, onToggleVisible: () => toggleVisible("cta"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Button label", value: cta.text, onChange: (value) => updateLayer("cta", {
            text: value
          }, "cta-text"), onSuggest: () => cycleSuggestion(cta) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 mt-4 text-[13px] font-medium text-muted-foreground", children: "Button color" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSwatches, { palette: template.palette, value: cta.color, onChange: (hex) => updateLayer("cta", {
            color: hex
          }) })
        ] }),
        logo && /* @__PURE__ */ jsxRuntimeExports.jsxs(EditorSection, { title: "Logo", open: openSections.logo, onToggleOpen: () => toggleOpen("logo"), hideable: logo.hideable, visible: logo.visible, onToggleVisible: () => toggleVisible("logo"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-border bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo.src, alt: "", className: "h-full w-full object-contain p-1.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => openReplace("logo"), className: "inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-4 w-4" }),
              "Replace logo"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[13px] text-muted-foreground", children: "Toggle the eye to show your logo on the creative." })
        ] })
      ] })
    ] })
  ] });
}
function TextField({
  label,
  value,
  onChange,
  onSuggest,
  multiline = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[14px] border border-border bg-secondary/60 px-4 pb-3 pt-2 focus-within:border-foreground/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      multiline ? /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value, rows: 2, onChange: (event) => onChange(event.target.value), className: "min-w-0 flex-1 resize-none bg-transparent text-[15px] text-foreground outline-none" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value, onChange: (event) => onChange(event.target.value), className: "min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Suggest text", onClick: onSuggest, className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) })
    ] })
  ] });
}
export {
  EditorRoute as component
};

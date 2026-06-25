import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CloudOff,
  CloudUpload,
  Download,
  Eye,
  EyeOff,
  Flag,
  FolderInput,
  Globe,
  Instagram,
  Link2,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Type,
  Undo2,
  Wand2,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  cloneLayers,
  DEFAULT_IMAGE_TRANSFORM,
  editorFontsHref,
  EDITOR_FONTS,
  EXPORT_FORMATS,
  fontById,
  getRemixEditorTemplate,
  imageTransform,
  isLightColor,
  LAYOUT,
  MOODBOARD_LAYOUT,
  nearestWeight,
  readableTextColor,
  resolveTextStyle,
  sizeScaleForFontChange,
  TEXT_SHADOW_CSS,
  transformCss,
  WEIGHT_LABELS,
  type EditorColor,
  type EditorLayer,
  type ExportFormat,
  type ImageLayer,
  type ImageTransform,
  type LayerKind,
  type RemixEditorTemplate,
  type TextAlign,
  type TextLayer,
} from "@/lib/remix-editor";
import { exportCreative } from "@/lib/remix-editor-export";
import { useEditorDraft } from "@/lib/use-editor-draft";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/editor/$templateId")({
  validateSearch: (search: Record<string, unknown>): { caption?: string } => ({
    caption: typeof search.caption === "string" ? search.caption : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Edit creative — EpicPost" },
      { name: "description", content: "Fine-tune your remixed creative before you download it." },
    ],
  }),
  component: EditorRoute,
});

function EditorRoute() {
  const { templateId } = Route.useParams();
  const { caption } = Route.useSearch();
  const router = useRouter();
  const template = getRemixEditorTemplate(templateId);

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Editor not available</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This template can't be edited yet. The visual editor is currently available for a limited
          set of templates.
        </p>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:brightness-110"
        >
          Go back
        </button>
      </div>
    );
  }

  return <EditorScreen template={template} initialCaption={caption} />;
}

// ── reusable bits ────────────────────────────────────────────────────────────

function ColorSwatches({
  palette,
  value,
  onChange,
}: {
  palette: EditorColor[];
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {palette.map((color) => {
        const active = value.toLowerCase() === color.value.toLowerCase();
        return (
          <button
            key={color.value}
            type="button"
            title={color.label}
            aria-label={color.label}
            aria-pressed={active}
            onClick={() => onChange(color.value)}
            className={cn(
              "h-9 w-9 rounded-full border transition",
              active
                ? "border-transparent ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "border-black/10 hover:scale-110",
            )}
            style={{ backgroundColor: color.value }}
          />
        );
      })}
    </div>
  );
}

function FontDropdown({
  value,
  color,
  onChange,
}: {
  value: string;
  color: string;
  onChange: (fontId: string) => void;
}) {
  const current = fontById(value);
  // Tint the label with the chosen text colour, but fall back to the panel's
  // foreground when that colour is too light to read on the light pill.
  const labelColor = isLightColor(color) ? undefined : color;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-[15px] font-semibold text-foreground transition hover:brightness-95"
        >
          <span style={{ fontFamily: current.family, color: labelColor }}>{current.label}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-52 overflow-y-auto">
        {EDITOR_FONTS.map((font) => (
          <DropdownMenuItem
            key={font.id}
            onSelect={() => onChange(font.id)}
            className="cursor-pointer text-base"
            style={{ fontFamily: font.family }}
          >
            {font.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DownloadFormatMenu({
  formats,
  align = "end",
  onSelect,
  children,
}: {
  formats: ExportFormat[];
  align?: "start" | "center" | "end";
  onSelect: (format: ExportFormat) => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Download as
        </DropdownMenuLabel>
        {formats.map((format) => {
          const meta = EXPORT_FORMATS[format];
          return (
            <DropdownMenuItem
              key={format}
              onSelect={() => onSelect(format)}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              {meta.label}
              <span className="ml-auto text-xs text-muted-foreground">.{meta.extension}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ShareMenu({
  formats,
  exporting,
  onDownload,
}: {
  formats: ExportFormat[];
  exporting: boolean;
  onDownload: (format: ExportFormat) => void;
}) {
  const [accessOpen, setAccessOpen] = useState(false);
  const [access, setAccess] = useState<"private" | "public">("private");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  const accessLabel =
    access === "private" ? "Only you can access" : "Anyone with the link";

  const actions: { key: string; label: string; icon: React.ReactNode; onClick?: () => void }[] = [
    {
      key: "instagram",
      label: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
    },
    {
      key: "public",
      label: "Public view link",
      icon: <Link2 className="h-5 w-5" />,
      onClick: copyLink,
    },
    {
      key: "schedule",
      label: "Schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      key: "move",
      label: "Move",
      icon: <FolderInput className="h-5 w-5" />,
    },
    {
      key: "phone",
      label: "Send to phone",
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      key: "more",
      label: "See all",
      icon: <MoreHorizontal className="h-5 w-5" />,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90"
        >
          <Share2 className="h-5 w-5" />
          Share
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] rounded-[16px] p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Share design</h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-foreground">
              <BarChart3 className="h-4 w-4" />0 visitors
            </span>
            <button
              type="button"
              aria-label="Share settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* People with access */}
        <p className="mt-4 text-sm font-semibold text-foreground">People with access</p>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Add people"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6b5b54] text-sm font-semibold text-white">
            C
          </span>
          <button
            type="button"
            aria-label="Add people"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Access level */}
        <p className="mt-4 text-sm font-semibold text-foreground">Access level</p>
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setAccessOpen((value) => !value)}
            className="flex w-full items-center gap-3 rounded-xl bg-secondary px-3 py-3 text-left transition hover:brightness-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
              {access === "private" ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </span>
            <span className="flex-1 text-sm font-medium text-foreground">{accessLabel}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {accessOpen && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setAccess("private");
                  setAccessOpen(false);
                }}
                className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-secondary"
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    Only you can access
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Only you can access the design using this link.
                  </span>
                </span>
                {access === "private" && <Check className="h-4 w-4 text-foreground" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccess("public");
                  setAccessOpen(false);
                }}
                className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-secondary"
              >
                <Globe className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    Anyone with the link
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Anyone can access the design using this link. No sign in required.
                  </span>
                </span>
                {access === "public" && <Check className="h-4 w-4 text-foreground" />}
              </button>
            </div>
          )}
        </div>

        {/* Copy link */}
        <button
          type="button"
          onClick={copyLink}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-base font-bold text-primary-foreground transition hover:brightness-90"
        >
          <Link2 className="h-5 w-5" />
          Copy link
        </button>

        <div className="my-4 border-t border-border" />

        {/* Action grid */}
        <div className="grid grid-cols-4 gap-y-4">
          <DownloadFormatMenu formats={formats} align="center" onSelect={onDownload}>
            <button
              type="button"
              disabled={exporting}
              className="flex flex-col items-center gap-1.5 text-center disabled:opacity-60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
                {exporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </span>
              <span className="text-xs font-medium text-foreground">Download</span>
            </button>
          </DownloadFormatMenu>
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
                {action.icon}
              </span>
              <span className="text-xs font-medium leading-tight text-foreground">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EditorSection({
  title,
  open,
  onToggleOpen,
  hideable,
  visible,
  onToggleVisible,
  children,
}: {
  title: string;
  open: boolean;
  onToggleOpen: () => void;
  hideable: boolean;
  visible: boolean;
  onToggleVisible: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between gap-2 py-3.5">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="text-[15px] font-semibold text-foreground">{title}</span>
        </button>
        {hideable && (
          <button
            type="button"
            onClick={onToggleVisible}
            aria-pressed={visible}
            aria-label={visible ? `Hide ${title}` : `Show ${title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
          >
            {visible ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

// ── canvas preview ───────────────────────────────────────────────────────────

// An image positioned inside its frame, draggable to pan. The wrapper is the
// "frame" (absolutely positioned by the caller); an inner clipped <img> carries
// the move/zoom/rotate transform and is cover/contain-fit to the frame. Dragging
// converts the pointer delta to frame-fraction units, so it works at any preview
// scale and on touch.
//
// While dragging we also render the *whole* photo (dimmed, un-clipped) so the
// user can see the parts that fall outside the frame instead of a hard crop. The
// selection border lives in a high-z overlay so it always draws above the photo
// and any text layered over the frame.
function DraggableImage({
  layer,
  fit,
  selected,
  onSelect,
  onPan,
  className,
  style,
}: {
  layer: ImageLayer;
  fit: "cover" | "contain";
  selected: boolean;
  onSelect: () => void;
  onPan: (offsetX: number, offsetY: number) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = imageTransform(layer);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  // Cached images can finish before React's onLoad attaches, so read the natural
  // size on mount too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [layer.src]);

  // Track the frame's pixel size so the photo can be drawn at its true scaled
  // size (the way the canvas export does) rather than object-fit. ResizeObserver
  // keeps it correct when the preview is resized.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The base fit scale (cover/contain) of the photo within the frame.
  function baseScale(nw: number, nh: number, boxW: number, boxH: number): number {
    return fit === "cover" ? Math.max(boxW / nw, boxH / nh) : Math.min(boxW / nw, boxH / nh);
  }

  // The photo drawn at its full scaled size, centred in the frame, then panned
  // and rotated — identical geometry to `drawImageCover`/`drawImageContain` in the
  // export, so panning reveals real image (not the frame background) and the
  // preview matches the download. Falls back to object-fit until measured.
  function photoStyle(): React.CSSProperties {
    if (!box || !natural) {
      return {
        width: "100%",
        height: "100%",
        objectFit: fit,
        transform: transformCss(t),
        transformOrigin: "center",
      };
    }
    const base = baseScale(natural.w, natural.h, box.w, box.h);
    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: natural.w * base * t.scale,
      height: natural.h * base * t.scale,
      maxWidth: "none",
      transform: `translate(-50%, -50%) translate(${t.offsetX * box.w}px, ${t.offsetY * box.h}px) rotate(${t.rotation}deg)`,
    };
  }

  // The furthest the photo can pan (frame fraction) before its edge pulls inside
  // the frame — cover would show a gap, contain would clip out. Stop at the edge.
  function maxOffset(): { x: number; y: number } {
    if (!box || !natural) return { x: Infinity, y: Infinity };
    const base = baseScale(natural.w, natural.h, box.w, box.h);
    const dispW = natural.w * base * t.scale;
    const dispH = natural.h * base * t.scale;
    return {
      x: Math.abs(dispW - box.w) / (2 * box.w),
      y: Math.abs(dispH - box.h) / (2 * box.h),
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    onSelect();
    drag.current = { startX: event.clientX, startY: event.clientY, baseX: t.offsetX, baseY: t.offsetY };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || !box) return;
    const dx = (event.clientX - state.startX) / box.w;
    const dy = (event.clientY - state.startY) / box.h;
    const limit = maxOffset();
    const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));
    onPan(clamp(state.baseX + dx, limit.x), clamp(state.baseY + dy, limit.y));
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const photo = photoStyle();

  return (
    <div
      ref={wrapperRef}
      className={cn("absolute touch-none select-none cursor-grab", className)}
      // Lift the whole frame above its neighbours while dragging so the dimmed
      // overflow shows on top of the other bands.
      style={{ ...style, zIndex: dragging ? 30 : style?.zIndex }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Whole photo, dimmed, un-clipped — only while dragging, so the user sees
          the parts that fall outside the frame instead of a hard crop. */}
      {dragging && box && natural && (
        <img
          src={layer.src}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute opacity-40"
          style={photo}
        />
      )}

      {/* The actual crop the frame keeps. */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={layer.src}
          alt=""
          draggable={false}
          onLoad={(event) =>
            setNatural({
              w: event.currentTarget.naturalWidth,
              h: event.currentTarget.naturalHeight,
            })
          }
          className={cn(box && natural ? "" : "h-full w-full")}
          style={photo}
        />
      </div>

      {/* Selection / drag border — high z so it sits above the photo and any
          text overlaid on the frame. */}
      {(selected || dragging) && (
        <div className="pointer-events-none absolute inset-0 z-50 ring-2 ring-inset ring-destructive" />
      )}
    </div>
  );
}

function CreativePreview({
  template,
  layers,
  selectedId,
  onSelect,
  updateLayer,
}: {
  template: RemixEditorTemplate;
  layers: EditorLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  updateLayer: (id: string, patch: LayerPatch, coalesceKey?: string) => void;
}) {
  const find = <T extends EditorLayer>(id: LayerKind) =>
    layers.find((layer) => layer.id === id) as T | undefined;
  const image = find<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = find<TextLayer>("header");
  const description = find<TextLayer>("description");
  const cta = find<TextLayer>("cta");
  const logo = find<Extract<EditorLayer, { kind: "logo" }>>("logo");

  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;

  const headerStyle = header ? resolveTextStyle(header) : null;
  const descriptionStyle = description ? resolveTextStyle(description) : null;
  const ctaStyle = cta ? resolveTextStyle(cta) : null;

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {logo?.visible && (
        <img
          src={logo.src}
          alt=""
          className="absolute object-contain object-left"
          style={{
            left: pct(LAYOUT.logo.x),
            top: pct(LAYOUT.logo.y),
            width: pct(LAYOUT.logo.w),
            height: pct(LAYOUT.logo.h),
          }}
        />
      )}

      {header?.visible && headerStyle && (
        <div
          className="absolute"
          style={{
            left: pct(LAYOUT.padX),
            right: pct(LAYOUT.padX),
            top: pct(LAYOUT.header.top),
            fontFamily: fontById(header.fontId).family,
            fontWeight: headerStyle.weight,
            fontSize: cqi(LAYOUT.header.size * headerStyle.sizeScale),
            lineHeight: LAYOUT.header.lineHeight,
            letterSpacing: `${headerStyle.letterSpacing}em`,
            textAlign: headerStyle.align,
            color: header.color,
            textTransform: header.uppercase ? "uppercase" : "none",
            textShadow: headerStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {header.text}
        </div>
      )}

      {description?.visible && descriptionStyle && (
        <div
          className="absolute"
          style={{
            left: pct(LAYOUT.padX),
            right: pct(LAYOUT.padX),
            top: pct(LAYOUT.description.top),
            fontFamily: fontById(description.fontId).family,
            fontWeight: descriptionStyle.weight,
            fontSize: cqi(LAYOUT.description.size * descriptionStyle.sizeScale),
            lineHeight: LAYOUT.description.lineHeight,
            letterSpacing: `${descriptionStyle.letterSpacing}em`,
            textAlign: descriptionStyle.align,
            color: description.color,
            textTransform: description.uppercase ? "uppercase" : "none",
            textShadow: descriptionStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {description.text}
        </div>
      )}

      {cta?.visible && ctaStyle && cta.text.trim() && (
        <div
          className="absolute flex items-center whitespace-nowrap rounded-full"
          style={{
            ...(ctaStyle.align === "left"
              ? { left: pct(LAYOUT.padX) }
              : ctaStyle.align === "right"
                ? { right: pct(LAYOUT.padX) }
                : { left: "50%", transform: "translateX(-50%)" }),
            top: pct(LAYOUT.cta.top),
            height: pct(LAYOUT.cta.height),
            paddingLeft: cqi(LAYOUT.cta.padX),
            paddingRight: cqi(LAYOUT.cta.padX),
            backgroundColor: cta.color,
            color: readableTextColor(cta.color),
            fontFamily: fontById(cta.fontId).family,
            fontWeight: ctaStyle.weight,
            fontSize: cqi(LAYOUT.cta.size * ctaStyle.sizeScale),
            letterSpacing: `${ctaStyle.letterSpacing}em`,
            textTransform: cta.uppercase ? "uppercase" : "none",
            textShadow: ctaStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {cta.text}
        </div>
      )}

      {image?.visible && (
        <DraggableImage
          layer={image}
          fit="contain"
          selected={selectedId === image.id}
          onSelect={() => onSelect(image.id)}
          onPan={(offsetX, offsetY) =>
            updateLayer(
              image.id,
              { transform: { ...imageTransform(image), offsetX, offsetY } },
              `pan-${image.id}`,
            )
          }
          style={{
            left: pct(LAYOUT.padX),
            right: pct(LAYOUT.padX),
            top: pct(LAYOUT.image.top),
            bottom: pct(1 - LAYOUT.image.bottom),
          }}
        />
      )}
    </div>
  );
}

// Moodboard preview — equal full-bleed photo bands with the city title centred
// over the middle one. Geometry mirrors `exportMoodboard` so the download
// matches the live preview.
function MoodboardPreview({
  template,
  layers,
  selectedId,
  onSelect,
  updateLayer,
}: {
  template: RemixEditorTemplate;
  layers: EditorLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  updateLayer: (id: string, patch: LayerPatch, coalesceKey?: string) => void;
}) {
  const photos = layers.filter(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const header = layers.find((layer): layer is TextLayer => layer.kind === "header");
  const headerStyle = header ? resolveTextStyle(header) : null;
  const bandHeight = 100 / Math.max(photos.length, 1);
  const cqi = (value: number) => `${value * 100}cqi`;

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {photos.map((photo, index) =>
        photo.visible ? (
          <DraggableImage
            key={photo.id}
            layer={photo}
            fit="cover"
            selected={selectedId === photo.id}
            onSelect={() => onSelect(photo.id)}
            onPan={(offsetX, offsetY) =>
              updateLayer(
                photo.id,
                { transform: { ...imageTransform(photo), offsetX, offsetY } },
                `pan-${photo.id}`,
              )
            }
            className="left-0 w-full"
            style={{ top: `${index * bandHeight}%`, height: `${bandHeight}%` }}
          />
        ) : null,
      )}

      {header?.visible && headerStyle && header.text.trim() && (
        <div
          className="absolute -translate-y-1/2"
          style={{
            left: `${MOODBOARD_LAYOUT.title.padX * 100}%`,
            right: `${MOODBOARD_LAYOUT.title.padX * 100}%`,
            top: `${MOODBOARD_LAYOUT.title.centerY * 100}%`,
            fontFamily: fontById(header.fontId).family,
            fontWeight: headerStyle.weight,
            fontSize: cqi(MOODBOARD_LAYOUT.title.size * headerStyle.sizeScale),
            lineHeight: MOODBOARD_LAYOUT.title.lineHeight,
            letterSpacing: `${headerStyle.letterSpacing}em`,
            textAlign: headerStyle.align,
            color: header.color,
            textTransform: header.uppercase ? "uppercase" : "none",
            textShadow: headerStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {header.text}
        </div>
      )}
    </div>
  );
}

// A compact "Saving… / Saved / Offline" pill reflecting the autosave state.
function SaveStatus({ status }: { status: ReturnType<typeof useEditorDraft>["status"] }) {
  if (status === "loading" || status === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {status === "loading" ? "Loading…" : "Saving…"}
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:inline-flex">
        <Check className="h-3.5 w-3.5" />
        Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="hidden items-center gap-1.5 text-xs font-medium text-rose-600 sm:inline-flex">
        <CloudOff className="h-3.5 w-3.5" />
        Not saved
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
      <CloudUpload className="h-3.5 w-3.5" />
      Autosave on
    </span>
  );
}

// ── editor screen ────────────────────────────────────────────────────────────

type LayerPatch = Partial<{
  label: string;
  visible: boolean;
  hideable: boolean;
  src: string;
  transform: ImageTransform;
  text: string;
  color: string;
  fontId: string;
  uppercase: boolean;
  suggestions: string[];
  sizeScale: number;
  weight: number;
  letterSpacing: number;
  align: TextAlign;
  shadow: boolean;
}>;

// Which edit sections start expanded. Keyed by layer id so moodboard photos
// (which share the "image" kind) each get their own state.
function defaultOpenSections(template: RemixEditorTemplate): Record<string, boolean> {
  if (template.layout === "moodboard") {
    const open: Record<string, boolean> = {};
    template.layers.forEach((layer, index) => {
      open[layer.id] = layer.kind === "header" || index === 0;
    });
    return open;
  }
  return { image: true, header: true, description: false, cta: false, logo: false };
}

function EditorScreen({
  template,
  initialCaption,
}: {
  template: RemixEditorTemplate;
  initialCaption?: string;
}) {
  const router = useRouter();

  const [layers, setLayers] = useState<EditorLayer[]>(() => {
    const cloned = cloneLayers(template);
    if (initialCaption?.trim()) {
      return cloned.map((layer) =>
        layer.kind === "header" ? { ...layer, text: initialCaption.trim() } : layer,
      );
    }
    return cloned;
  });
  const [past, setPast] = useState<EditorLayer[][]>([]);
  const [future, setFuture] = useState<EditorLayer[][]>([]);
  const coalesceRef = useRef<{ key: string; time: number } | null>(null);

  // Autosave every canvas change to the backend, and restore the last saved
  // draft on load. Hydrating replaces the working layers and clears the
  // session's undo/redo history (the restored state is the new baseline).
  const { status: draftStatus } = useEditorDraft(template.id, layers, (saved) => {
    setLayers(saved);
    setPast([]);
    setFuture([]);
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    defaultOpenSections(template),
  );
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const [flagged, setFlagged] = useState(false);
  // Which image is highlighted for editing (drives the preview selection ring).
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<string | null>(null);

  // Load the editor's webfonts once so previews and the picker render correctly.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "remix-editor-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = editorFontsHref();
    document.head.appendChild(link);
  }, []);

  function apply(next: EditorLayer[], coalesceKey?: string) {
    const now = Date.now();
    const previousEdit = coalesceRef.current;
    const coalesced =
      Boolean(coalesceKey) &&
      previousEdit != null &&
      previousEdit.key === coalesceKey &&
      now - previousEdit.time < 1000;
    if (!coalesced) setPast((prev) => [...prev, layers]);
    coalesceRef.current = coalesceKey ? { key: coalesceKey, time: now } : null;
    setFuture([]);
    setLayers(next);
  }

  function updateLayer(id: string, patch: LayerPatch, coalesceKey?: string) {
    apply(
      layers.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as EditorLayer) : layer)),
      coalesceKey,
    );
  }

  // Switching a text layer's font also rescales it so the text keeps the same
  // width (proportion to the layout); both changes land in one undo step. The
  // size fit is async (it may need to load the target font weight first).
  function changeFont(id: string, fontId: string) {
    const layer = layers.find((current) => current.id === id);
    if (layer && (layer.kind === "header" || layer.kind === "description" || layer.kind === "cta")) {
      void sizeScaleForFontChange(layer, fontId).then((sizeScale) =>
        updateLayer(id, { fontId, sizeScale }),
      );
    } else {
      updateLayer(id, { fontId });
    }
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
    apply(
      cloneLayers(template).map((layer) =>
        layer.kind === "header" && initialCaption?.trim()
          ? { ...layer, text: initialCaption.trim() }
          : layer,
      ),
    );
    setOpenSections(defaultOpenSections(template));
    toast.success("Design reset to the template defaults.");
  }

  function cycleSuggestion(layer: TextLayer) {
    if (layer.suggestions.length === 0) return;
    const index = layer.suggestions.findIndex(
      (option) => option.toLowerCase() === layer.text.trim().toLowerCase(),
    );
    const next = layer.suggestions[(index + 1) % layer.suggestions.length];
    updateLayer(layer.id, { text: next });
  }

  function openReplace(id: string) {
    replaceTargetRef.current = id;
    fileInputRef.current?.click();
  }

  function handleReplaceFile(file: File) {
    const id = replaceTargetRef.current;
    if (!id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    updateLayer(id, { src: url, visible: true });
  }

  async function handleDownload(format: ExportFormat) {
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
      toast.error(
        error instanceof Error ? error.message : "Could not export the creative. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  }

  const findByKind = <T extends EditorLayer>(kind: LayerKind) =>
    layers.find((layer) => layer.kind === kind) as T | undefined;
  const image = findByKind<Extract<EditorLayer, { kind: "image" }>>("image");
  const header = findByKind<TextLayer>("header");
  const description = findByKind<TextLayer>("description");
  const cta = findByKind<TextLayer>("cta");
  const logo = findByKind<Extract<EditorLayer, { kind: "logo" }>>("logo");
  const photos = layers.filter(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );

  const toggleOpen = (id: string) =>
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  const isVisible = (id: string) => layers.find((layer) => layer.id === id)?.visible ?? false;
  const toggleVisible = (id: string) =>
    updateLayer(id, { visible: !(layers.find((layer) => layer.id === id)?.visible ?? false) });

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleReplaceFile(file);
          event.target.value = "";
        }}
      />

      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-[16px] text-foreground transition hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight text-foreground">
              {template.title}
            </p>
            <p className="text-xs text-muted-foreground">Edit creative</p>
          </div>
          <SaveStatus status={draftStatus} />
        </div>
        <ShareMenu
          formats={template.formats}
          exporting={exporting}
          onDownload={handleDownload}
        />
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Canvas stage — fixed to the viewport on desktop; scrolls only if the
            preview itself is taller than the stage, never resized by the panel. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-[#0e1413] px-4 py-8 lg:min-h-0 lg:overflow-y-auto lg:py-10">
          {/* Preview toolbar */}
          <div className="flex items-center gap-2 rounded-[16px] border border-white/15 bg-white/5 px-3 py-1.5 text-white/80">
            <button
              type="button"
              aria-label="Previous"
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-[16px] opacity-40"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <span className="text-sm font-medium tabular-nums">1 / 1</span>
            <button
              type="button"
              aria-label="Next"
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-[16px] opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="mx-1 h-5 w-px bg-white/15" />
            <button
              type="button"
              aria-label="Like"
              aria-pressed={reaction === "up"}
              onClick={() => setReaction((value) => (value === "up" ? null : "up"))}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-[16px] transition hover:bg-white/10",
                reaction === "up" && "text-emerald-400",
              )}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Dislike"
              aria-pressed={reaction === "down"}
              onClick={() => setReaction((value) => (value === "down" ? null : "down"))}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-[16px] transition hover:bg-white/10",
                reaction === "down" && "text-rose-400",
              )}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Flag"
              aria-pressed={flagged}
              onClick={() => setFlagged((value) => !value)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-[16px] transition hover:bg-white/10",
                flagged && "text-amber-400",
              )}
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          <div
            className={cn(
              "w-full",
              template.layout === "moodboard" ? "max-w-[300px]" : "max-w-[360px]",
            )}
          >
            {template.layout === "moodboard" ? (
              <MoodboardPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : (
              <CreativePreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Undo"
              onClick={undo}
              disabled={past.length === 0}
              className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Redo"
              onClick={redo}
              disabled={future.length === 0}
              className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Redo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={resetDesign}
              className="flex h-11 items-center gap-2 rounded-[16px] bg-white/10 px-5 text-[15px] font-semibold text-white transition hover:bg-white/20"
            >
              <Wand2 className="h-4 w-4" />
              Fix design
            </button>
            <DownloadFormatMenu formats={template.formats} align="center" onSelect={handleDownload}>
              <button
                type="button"
                aria-label="Download"
                disabled={exporting}
                className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
              >
                {exporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
            </DownloadFormatMenu>
          </div>
        </div>

        {/* Edit panel */}
        <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-background px-5 pb-12 lg:h-full lg:min-h-0 lg:w-[400px] lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 py-5">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Edit creative</h2>
          </div>

          {/* Moodboard: one replaceable photo per band + the city title. */}
          {template.layout === "moodboard" && (
            <>
              {photos.map((photo) => (
                <EditorSection
                  key={photo.id}
                  title={photo.label}
                  open={openSections[photo.id] ?? false}
                  onToggleOpen={() => toggleOpen(photo.id)}
                  hideable={photo.hideable}
                  visible={photo.visible}
                  onToggleVisible={() => toggleVisible(photo.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary">
                      <img src={photo.src} alt="" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => openReplace(photo.id)}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary"
                    >
                      <Wand2 className="h-4 w-4" />
                      Replace photo
                    </button>
                  </div>
                  <ImageControls
                    layer={photo}
                    onChange={(transform, key) => updateLayer(photo.id, { transform }, key)}
                    onReset={() =>
                      updateLayer(photo.id, { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                    }
                  />
                </EditorSection>
              ))}

              {header && (
                <EditorSection
                  title={header.label}
                  open={openSections[header.id] ?? true}
                  onToggleOpen={() => toggleOpen(header.id)}
                  hideable={header.hideable}
                  visible={header.visible}
                  onToggleVisible={() => toggleVisible(header.id)}
                >
                  <TextField
                    label="Title text"
                    value={header.text}
                    onChange={(value) => updateLayer(header.id, { text: value }, "header-text")}
                    onSuggest={() => cycleSuggestion(header)}
                  />
                  <div className="mt-4">
                    <FontDropdown
                      value={header.fontId}
                      color={header.color}
                      onChange={(fontId) => changeFont(header.id, fontId)}
                    />
                  </div>
                  <div className="mt-4">
                    <ColorSwatches
                      palette={template.palette}
                      value={header.color}
                      onChange={(hex) => updateLayer(header.id, { color: hex })}
                    />
                  </div>
                  <TextStyleControls
                    layer={header}
                    onChange={(patch, key) => updateLayer(header.id, patch, key)}
                  />
                </EditorSection>
              )}
            </>
          )}

          {/* Image */}
          {template.layout === "poster" && image && (
            <EditorSection
              title="Image"
              open={openSections.image}
              onToggleOpen={() => toggleOpen("image")}
              hideable={image.hideable}
              visible={image.visible}
              onToggleVisible={() => toggleVisible("image")}
            >
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary">
                  <img src={image.src} alt="" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => openReplace("image")}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary"
                >
                  <Wand2 className="h-4 w-4" />
                  Edit image
                </button>
              </div>
              <ImageControls
                layer={image}
                onChange={(transform, key) => updateLayer("image", { transform }, key)}
                onReset={() => updateLayer("image", { transform: { ...DEFAULT_IMAGE_TRANSFORM } })}
              />
            </EditorSection>
          )}

          {/* Header */}
          {template.layout === "poster" && header && (
            <EditorSection
              title="Header"
              open={openSections.header}
              onToggleOpen={() => toggleOpen("header")}
              hideable={header.hideable}
              visible={header.visible}
              onToggleVisible={() => toggleVisible("header")}
            >
              <TextField
                label="Header text"
                value={header.text}
                onChange={(value) => updateLayer("header", { text: value }, "header-text")}
                onSuggest={() => cycleSuggestion(header)}
              />
              <div className="mt-4">
                <FontDropdown
                  value={header.fontId}
                  color={header.color}
                  onChange={(fontId) => changeFont("header", fontId)}
                />
              </div>
              <div className="mt-4">
                <ColorSwatches
                  palette={template.palette}
                  value={header.color}
                  onChange={(hex) => updateLayer("header", { color: hex })}
                />
              </div>
              <TextStyleControls
                layer={header}
                onChange={(patch, key) => updateLayer("header", patch, key)}
              />
            </EditorSection>
          )}

          {/* Description */}
          {description && (
            <EditorSection
              title="Description"
              open={openSections.description}
              onToggleOpen={() => toggleOpen("description")}
              hideable={description.hideable}
              visible={description.visible}
              onToggleVisible={() => toggleVisible("description")}
            >
              <TextField
                label="Description text"
                value={description.text}
                multiline
                onChange={(value) =>
                  updateLayer("description", { text: value }, "description-text")
                }
                onSuggest={() => cycleSuggestion(description)}
              />
              <div className="mt-4">
                <FontDropdown
                  value={description.fontId}
                  color={description.color}
                  onChange={(fontId) => changeFont("description", fontId)}
                />
              </div>
              <div className="mt-4">
                <ColorSwatches
                  palette={template.palette}
                  value={description.color}
                  onChange={(hex) => updateLayer("description", { color: hex })}
                />
              </div>
              <TextStyleControls
                layer={description}
                onChange={(patch, key) => updateLayer("description", patch, key)}
              />
            </EditorSection>
          )}

          {/* Call to action */}
          {cta && (
            <EditorSection
              title="Call to action"
              open={openSections.cta}
              onToggleOpen={() => toggleOpen("cta")}
              hideable={cta.hideable}
              visible={cta.visible}
              onToggleVisible={() => toggleVisible("cta")}
            >
              <TextField
                label="Button label"
                value={cta.text}
                onChange={(value) => updateLayer("cta", { text: value }, "cta-text")}
                onSuggest={() => cycleSuggestion(cta)}
              />
              <p className="mb-1.5 mt-4 text-[13px] font-medium text-muted-foreground">
                Button color
              </p>
              <ColorSwatches
                palette={template.palette}
                value={cta.color}
                onChange={(hex) => updateLayer("cta", { color: hex })}
              />
              <TextStyleControls
                layer={cta}
                onChange={(patch, key) => updateLayer("cta", patch, key)}
              />
            </EditorSection>
          )}

          {/* Logo */}
          {logo && (
            <EditorSection
              title="Logo"
              open={openSections.logo}
              onToggleOpen={() => toggleOpen("logo")}
              hideable={logo.hideable}
              visible={logo.visible}
              onToggleVisible={() => toggleVisible("logo")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-border bg-secondary">
                  <img src={logo.src} alt="" className="h-full w-full object-contain p-1.5" />
                </div>
                <button
                  type="button"
                  onClick={() => openReplace("logo")}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition hover:bg-secondary"
                >
                  <Wand2 className="h-4 w-4" />
                  Replace logo
                </button>
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Toggle the eye to show your logo on the creative.
              </p>
            </EditorSection>
          )}
        </aside>
      </div>
    </div>
  );
}

// Move/zoom/rotate controls for an image layer: a reposition hint, zoom and
// rotation sliders, and a reset. Panning is done by dragging the image in the
// preview; these cover the rest. Shared by moodboard bands and the poster image.
function ImageControls({
  layer,
  onChange,
  onReset,
}: {
  layer: ImageLayer;
  onChange: (transform: ImageTransform, coalesceKey: string) => void;
  onReset: () => void;
}) {
  const t = imageTransform(layer);
  const isDefault =
    t.offsetX === 0 && t.offsetY === 0 && t.scale === 1 && t.rotation === 0;
  return (
    <div className="mt-4 space-y-4">
      <p className="text-[13px] text-muted-foreground">
        Drag the image in the preview to reposition it.
      </p>
      <div>
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ZoomIn className="h-3.5 w-3.5" />
            Zoom
          </span>
          <span className="tabular-nums">{t.scale.toFixed(2)}×</span>
        </div>
        <Slider
          value={[t.scale]}
          min={0.5}
          max={3}
          step={0.01}
          onValueChange={([value]) => onChange({ ...t, scale: value }, `zoom-${layer.id}`)}
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            Rotation
          </span>
          <span className="tabular-nums">{Math.round(t.rotation)}°</span>
        </div>
        <Slider
          value={[t.rotation]}
          min={-180}
          max={180}
          step={1}
          onValueChange={([value]) => onChange({ ...t, rotation: value }, `rotate-${layer.id}`)}
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        disabled={isDefault}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset position
      </button>
    </div>
  );
}

// Type styling for a text layer: size, weight (limited to the font's weights),
// letter spacing, alignment, drop shadow, and uppercase. Renders below the
// existing font + colour controls in each text section.
function TextStyleControls({
  layer,
  onChange,
}: {
  layer: TextLayer;
  onChange: (patch: LayerPatch, coalesceKey?: string) => void;
}) {
  const font = fontById(layer.fontId);
  const style = resolveTextStyle(layer);
  const alignments: ReadonlyArray<[TextAlign, typeof AlignLeft]> = [
    ["left", AlignLeft],
    ["center", AlignCenter],
    ["right", AlignRight],
  ];
  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Size
          </span>
          <span className="tabular-nums">{Math.round(style.sizeScale * 100)}%</span>
        </div>
        <Slider
          value={[style.sizeScale]}
          min={0.5}
          max={2}
          step={0.01}
          onValueChange={([value]) => onChange({ sizeScale: value }, `size-${layer.id}`)}
        />
      </div>

      {font.weights.length > 1 && (
        <div>
          <p className="mb-2 text-[13px] font-medium text-muted-foreground">Weight</p>
          <div className="flex flex-wrap gap-2">
            {font.weights.map((w) => {
              const active = style.weight === w;
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ weight: w })}
                  style={{ fontWeight: w }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] transition",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:bg-secondary",
                  )}
                >
                  {WEIGHT_LABELS[w] ?? w}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted-foreground">
          <span>Letter spacing</span>
          <span className="tabular-nums">{style.letterSpacing.toFixed(2)}em</span>
        </div>
        <Slider
          value={[style.letterSpacing]}
          min={-0.05}
          max={0.3}
          step={0.01}
          onValueChange={([value]) => onChange({ letterSpacing: value }, `spacing-${layer.id}`)}
        />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-muted-foreground">Alignment</p>
        <div className="inline-flex gap-1 rounded-full border border-border p-1">
          {alignments.map(([value, Icon]) => {
            const active = style.align === value;
            return (
              <button
                key={value}
                type="button"
                aria-label={`Align ${value}`}
                aria-pressed={active}
                onClick={() => onChange({ align: value })}
                className={cn(
                  "flex h-8 w-9 items-center justify-center rounded-full transition",
                  active ? "bg-foreground text-background" : "text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-foreground">Drop shadow</span>
        <Switch checked={style.shadow} onCheckedChange={(value) => onChange({ shadow: value })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-foreground">Uppercase</span>
        <Switch
          checked={layer.uppercase}
          onCheckedChange={(value) => onChange({ uppercase: value })}
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  onSuggest,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSuggest: () => void;
  multiline?: boolean;
}) {
  return (
    <div className="relative rounded-[14px] border border-border bg-secondary/60 px-4 pb-3 pt-2 focus-within:ring-2 focus-within:ring-ring">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            value={value}
            rows={2}
            onChange={(event) => onChange(event.target.value)}
            className="min-w-0 flex-1 resize-none bg-transparent text-[15px] text-foreground outline-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none"
          />
        )}
        <button
          type="button"
          aria-label="Suggest text"
          onClick={onSuggest}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-background"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

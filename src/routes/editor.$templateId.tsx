import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  X,
  CloudOff,
  CloudUpload,
  Download,
  Eye,
  EyeOff,
  Flag,
  Image as ImageIcon,
  FolderInput,
  Globe,
  Instagram,
  Link2,
  Loader2,
  MessageSquareText,
  Mic2,
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
  Send,
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
  dupLayers,
  backfillTemplateLayers,
  brandEditorFonts,
  brandFamilyFromId,
  editorFontsHref,
  EDITOR_FONTS,
  EXPORT_FORMATS,
  fontById,
  preloadEditorFonts,
  registerBrandFont,
  getRemixEditorTemplate,
  imageTransform,
  layersFromRemix,
  isLightColor,
  coverGeometry,
  editorialGeometry,
  EDITORIAL_ARROW,
  COLLAGE_LAYOUT,
  collageSlide,
  LAYOUT,
  MOODBOARD_LAYOUT,
  RELAX_LAYOUT,
  SPLIT_LAYOUT,
  splitHeadlineFontSize,
  SLICED_LAYOUT,
  slicedChars,
  slicedGeometry,
  slicedGlyphMetrics,
  VERTICALS_LAYOUT,
  verticalsTitleChars,
  DUEL_LAYOUT,
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
  GRID_LAYOUT,
  gridVariant,
  gridCellRect,
  gridTextLines,
  PORTO_CAPTION_TRACKING,
  PORTO_CARD,
  PORTO_LAYOUT,
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
import { drawSlicedLetters, exportCreative } from "@/lib/remix-editor-export";
import { useEditorDraft, useRemixDraft } from "@/lib/use-editor-draft";
import { fetchRemix } from "@/lib/remixes";
import { uploadAssetFiles } from "@/lib/generations";
import { resolveCleanImageSrc } from "@/lib/image-proxy";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/editor/$templateId")({
  validateSearch: (search: Record<string, unknown>): { caption?: string; remixId?: string } => ({
    caption: typeof search.caption === "string" ? search.caption : undefined,
    // When present, the editor opens this saved remix (your images + text)
    // instead of the bare template defaults.
    remixId: typeof search.remixId === "string" ? search.remixId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Edit creative — EpicPost" },
      { name: "description", content: "Fine-tune your remixed creative before you download it." },
    ],
  }),
  component: EditorRoute,
});

function EditorUnavailable({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      {children}
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

function EditorRoute() {
  const { templateId } = Route.useParams();
  const { caption, remixId } = Route.useSearch();
  const template = getRemixEditorTemplate(templateId);

  if (!template) {
    return (
      <EditorUnavailable>
        <h1 className="text-2xl font-bold text-foreground">Editor not available</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This template can't be edited yet. The visual editor is currently available for a limited
          set of templates.
        </p>
      </EditorUnavailable>
    );
  }

  // Editing a saved remix: load its state (your images + text) before mounting
  // the editor, so you see the remixed creative — not the template defaults.
  if (remixId) {
    return <RemixEditorLoader template={template} remixId={remixId} />;
  }

  return <EditorScreen template={template} initialCaption={caption} />;
}

// Fetches a remix, rebuilds the editor layers (resolving each image to a
// canvas-clean src), and mounts the editor seeded with them. Shows a
// layout-matching skeleton while loading.
function RemixEditorLoader({
  template,
  remixId,
}: {
  template: RemixEditorTemplate;
  remixId: string;
}) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error" } | { status: "ready"; layers: EditorLayer[] }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    (async () => {
      try {
        const remix = await fetchRemix(remixId);
        const built = layersFromRemix(template, {
          state: remix.state,
          assets: remix.assets,
        });
        // Resolve cross-origin image srcs to data URLs so the canvas export
        // never taints; preview also uses these.
        const layers = await Promise.all(
          built.map(async (layer) =>
            layer.kind === "image" && layer.src
              ? { ...layer, src: await resolveCleanImageSrc(layer.src) }
              : layer,
          ),
        );
        if (!cancelled) setState({ status: "ready", layers });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remixId, template]);

  if (state.status === "loading") return <EditorSkeleton template={template} />;
  if (state.status === "error") {
    return (
      <EditorUnavailable>
        <h1 className="text-2xl font-bold text-foreground">Couldn't open this remix</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn't load this remix. It may have been deleted, or you may need to sign in again.
        </p>
      </EditorUnavailable>
    );
  }
  return <EditorScreen template={template} remixId={remixId} initialLayers={state.layers} />;
}

// Page-specific skeleton mirroring the editor chrome (top bar + chat rail +
// dark canvas stage + edit panel) so the remix load doesn't flash a blank page.
function EditorSkeleton({ template }: { template: RemixEditorTemplate }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[16px] bg-secondary" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-secondary" />
            <div className="h-3 w-20 rounded bg-secondary" />
          </div>
        </div>
        <div className="h-10 w-28 rounded-[16px] bg-secondary" />
      </header>
      <div className="flex flex-1 animate-pulse flex-col lg:min-h-0 lg:flex-row">
        <div className="hidden w-72 shrink-0 border-r border-border p-4 lg:block">
          <div className="h-full w-full rounded-[16px] bg-secondary" />
        </div>
        <div className="flex flex-1 items-center justify-center bg-[#0e1413] px-4 py-10">
          <div
            className="w-full max-w-[300px] overflow-hidden rounded-[18px] bg-white/10"
            style={{ aspectRatio: template.aspectRatio }}
          />
        </div>
        <div className="w-full shrink-0 space-y-3 border-t border-border p-4 lg:w-80 lg:border-l lg:border-t-0">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-12 w-full rounded-[16px] bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
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
          className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-secondary px-4 text-[15px] font-semibold text-foreground transition hover:brightness-110"
        >
          <span style={{ fontFamily: current.family, color: labelColor }}>{current.label}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-52 overflow-y-auto">
        {/* Brand fonts (applied via the composer's Fonts card) list first so the
            brand family stays selectable alongside the shared catalog. */}
        {[...brandEditorFonts(), ...EDITOR_FONTS].map((font) => (
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

  const accessLabel = access === "private" ? "Only you can access" : "Anyone with the link";

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
              {access === "private" ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
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
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-2 px-6 py-5">
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#c7d36f] transition hover:bg-secondary"
          >
            {visible ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function EditorChatPanel({
  open,
  onOpenChange,
  messages,
  draft,
  onDraftChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const canSend = draft.trim().length > 0;

  return (
    <>
      <button
        type="button"
        aria-label="Open chat"
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
        className={cn(
          "fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#222625] text-foreground shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition duration-300 hover:bg-[#2b302f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d36f]",
          open && "pointer-events-none translate-y-3 scale-75 opacity-0",
        )}
      >
        <MessageSquareText className="h-6 w-6" />
      </button>

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed bottom-4 left-4 z-50 w-[min(calc(100vw-2rem),380px)] origin-bottom-left rounded-[32px] bg-[#0e1413] transition duration-300 ease-out lg:bottom-6 lg:left-6 lg:w-[360px]",
          open
            ? "pointer-events-auto translate-x-0 translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-x-4 translate-y-8 scale-90 opacity-0",
        )}
      >
        <div className="flex max-h-[calc(100dvh-2rem)] min-h-[min(600px,calc(100dvh-2rem))] overflow-hidden rounded-[32px] border border-white/5 bg-[#222625] text-foreground shadow-[0_24px_70px_rgba(0,0,0,0.28)] [--background:#222625] [--border:rgba(11,15,15,0.72)] [--foreground:#f0f1ed] [--input:#151819] [--muted-foreground:#a7aba7] [--primary:#c7d36f] [--ring:#c7d36f] [--secondary:#17191b] lg:h-[calc(100dvh-7rem)] lg:max-h-[calc(100dvh-7rem)] lg:min-h-[min(600px,calc(100dvh-7rem))]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 px-6 py-5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-foreground" />
                <h2 className="text-lg font-bold text-foreground">Chat</h2>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col border-t border-border">
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-[15px] font-semibold text-foreground">Chat history</p>
                <span className="rounded-full bg-secondary px-3 py-1 text-[12px] font-semibold text-[#c7d36f]">
                  {messages.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[92%] rounded-[18px] px-4 py-3 text-[14px] leading-5",
                      message.role === "user"
                        ? "ml-auto bg-[#c7d36f] text-[#151819]"
                        : "border border-white/8 bg-secondary text-foreground",
                    )}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="rounded-[28px] border border-white/8 bg-secondary p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:ring-2 focus-within:ring-ring/70">
                <textarea
                  value={draft}
                  rows={3}
                  placeholder="Ask EpicPost..."
                  onChange={(event) => onDraftChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      onSubmit();
                    }
                  }}
                  className="min-h-[76px] w-full resize-none bg-transparent px-1 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-label="Add attachment"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-foreground transition hover:bg-background"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 px-4 text-[14px] font-semibold text-foreground transition hover:bg-background"
                    >
                      Refine
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      aria-label="Voice input"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-foreground transition hover:bg-background"
                    >
                      <Mic2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Send message"
                      disabled={!canSend}
                      onClick={onSubmit}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c7d36f] text-[#151819] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-muted-foreground"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
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
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(
    null,
  );

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
    // Keep the tap from reaching the preview's background deselect handler, so
    // clicking the photo selects it (rather than selecting then immediately
    // clearing).
    event.stopPropagation();
    onSelect();
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: t.offsetX,
      baseY: t.offsetY,
    };
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

// Verticals: equal full-height photo strips side by side, with the title's
// characters spread evenly across the padded width (one flex cell per letter)
// at the layer's vertical position — mirroring `exportVerticals`.
function VerticalsPreview({
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
  const stripCount = Math.max(photos.length, 1);
  const stripWidth = 100 / stripCount;
  const cqi = (value: number) => `${value * 100}cqi`;
  // One glyph per strip: character i lands on strip i, so the letter count
  // tracks the image count. Extra letters past the strip count are dropped.
  const titleChars = header ? verticalsTitleChars(header.text).slice(0, stripCount) : [];

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
            className="top-0 h-full"
            style={{ left: `${index * stripWidth}%`, width: `${stripWidth}%` }}
          />
        ) : null,
      )}

      {header?.visible && headerStyle && header.text.trim() && (
        <div
          className="pointer-events-none absolute -translate-y-1/2"
          style={{
            left: 0,
            right: 0,
            top: `${headerStyle.posY * 100}%`,
            fontFamily: fontById(header.fontId).family,
            fontWeight: headerStyle.weight,
            fontSize: cqi(VERTICALS_LAYOUT.title.size * headerStyle.sizeScale),
            lineHeight: VERTICALS_LAYOUT.title.lineHeight,
            letterSpacing: `${headerStyle.letterSpacing}em`,
            color: header.color,
            textTransform: header.uppercase ? "uppercase" : "none",
            textShadow: headerStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {titleChars.map((char, index) =>
            char.trim() ? (
              <span
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center"
                // Centre the glyph on its strip's midpoint.
                style={{ left: `${(index + 0.5) * stripWidth}%`, top: 0 }}
              >
                {char}
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

// Relax trio: rounded photo panels stacked with a soft gap on a paper
// background, and a caption + subcaption over the middle panel (left-aligned) —
// mirroring `template_relax.v2.html` and `exportRelax`.
function RelaxPreview({
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
  const description = layers.find((layer): layer is TextLayer => layer.kind === "description");
  const headerStyle = header ? resolveTextStyle(header) : null;
  const descStyle = description ? resolveTextStyle(description) : null;

  const n = Math.max(photos.length, 1);
  // aspectRatio is "9 / 16"; ratio = width / height. The CSS gap is a fixed px
  // (fraction of width), so convert it to a fraction of height for vertical layout.
  const [rw, rh] = template.aspectRatio.split("/").map((v) => parseFloat(v.trim()));
  const ratio = rw && rh ? rw / rh : 9 / 16;
  const gapH = RELAX_LAYOUT.gap * ratio; // fraction of height
  const panelH = (1 - (n - 1) * gapH) / n; // fraction of height
  const mid = Math.floor((n - 1) / 2);
  const centerY = mid * (panelH + gapH) + panelH / 2; // fraction of height
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
            style={{
              top: `${index * (panelH + gapH) * 100}%`,
              height: `${panelH * 100}%`,
              borderRadius: cqi(RELAX_LAYOUT.radius),
              overflow: "hidden",
            }}
          />
        ) : null,
      )}

      {(header?.visible || description?.visible) && (
        <div
          className="absolute -translate-y-1/2"
          style={{
            left: cqi(RELAX_LAYOUT.caption.left),
            top: `${centerY * 100}%`,
            maxWidth: cqi(RELAX_LAYOUT.caption.maxWidth),
          }}
        >
          {header?.visible && headerStyle && header.text.trim() && (
            <div
              style={{
                fontFamily: fontById(header.fontId).family,
                fontWeight: headerStyle.weight,
                fontSize: cqi(RELAX_LAYOUT.caption.headline.size * headerStyle.sizeScale),
                lineHeight: RELAX_LAYOUT.caption.headline.lineHeight,
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
          {description?.visible && descStyle && description.text.trim() && (
            <div
              style={{
                marginTop: cqi(RELAX_LAYOUT.caption.sub.gap),
                fontFamily: fontById(description.fontId).family,
                fontWeight: descStyle.weight,
                fontSize: cqi(RELAX_LAYOUT.caption.sub.size * descStyle.sizeScale),
                lineHeight: RELAX_LAYOUT.caption.sub.lineHeight,
                letterSpacing: `${descStyle.letterSpacing}em`,
                textAlign: descStyle.align,
                color: description.color,
                textTransform: description.uppercase ? "uppercase" : "none",
                whiteSpace: "pre-line",
                textShadow: descStyle.shadow ? TEXT_SHADOW_CSS : "none",
              }}
            >
              {description.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// FRANKOF cover (full-bleed slides 2, 4, 9): one full-bleed photo, a scrim, and a
// large uppercase headline (plus an optional subtitle) anchored to the top or
// bottom. Geometry is resolved per template via `coverGeometry`. Mirrors
// `template_frankof.v2.html`'s `.s2`/`.s4`/`.s9` and `exportCover`.
function CoverPreview({
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
  const geom = coverGeometry(template.id);
  const image = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const header = layers.find((layer): layer is TextLayer => layer.kind === "header");
  const description = layers.find((layer): layer is TextLayer => layer.kind === "description");
  const headerStyle = header ? resolveTextStyle(header) : null;
  const descStyle = description ? resolveTextStyle(description) : null;
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
      {image?.visible && (
        <DraggableImage
          layer={image}
          fit="cover"
          selected={selectedId === image.id}
          onSelect={() => onSelect(image.id)}
          onPan={(offsetX, offsetY) =>
            updateLayer(
              image.id,
              { transform: { ...imageTransform(image), offsetX, offsetY } },
              `pan-${image.id}`,
            )
          }
          className="inset-0 h-full w-full"
        />
      )}

      {/* Scrim so the text stays legible over any photo. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${geom.scrim.color},${
            geom.scrim.fromOpacity
          }) ${geom.scrim.from * 100}%, rgba(${geom.scrim.color},${geom.scrim.toOpacity}) ${
            geom.scrim.to * 100
          }%)`,
        }}
      />

      {(header?.visible || description?.visible) && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: cqi(geom.padX),
            right: cqi(geom.padRight),
            [geom.anchor]: `${geom.edge * 100}%`,
          }}
        >
          {header?.visible && headerStyle && header.text.trim() && (
            <div
              style={{
                fontFamily: fontById(header.fontId).family,
                fontWeight: headerStyle.weight,
                fontSize: cqi(geom.headline.size * headerStyle.sizeScale),
                lineHeight: geom.headline.lineHeight,
                letterSpacing: `${headerStyle.letterSpacing}em`,
                textAlign: headerStyle.align,
                color: header.color,
                textTransform: header.uppercase ? "uppercase" : "none",
                whiteSpace: "pre-line",
                textShadow: headerStyle.shadow ? TEXT_SHADOW_CSS : "none",
              }}
            >
              {header.text}
            </div>
          )}
          {geom.subtitle && description?.visible && descStyle && description.text.trim() && (
            <div
              style={{
                marginTop: cqi(geom.subtitle.gap),
                maxWidth: cqi(geom.subtitle.maxWidth),
                fontFamily: fontById(description.fontId).family,
                fontWeight: descStyle.weight,
                fontSize: cqi(geom.subtitle.size * descStyle.sizeScale),
                lineHeight: geom.subtitle.lineHeight,
                letterSpacing: `${descStyle.letterSpacing}em`,
                textAlign: descStyle.align,
                color: description.color,
                textTransform: description.uppercase ? "uppercase" : "none",
                whiteSpace: "pre-line",
                textShadow: descStyle.shadow ? TEXT_SHADOW_CSS : "none",
              }}
            >
              {description.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Split editorial: a paper panel on the left over a full-canvas photo, with the
// headline knocked out of the paper to reveal that photo (letters filled via
// background-clip:text) and a small dark body block bottom-left. Mirrors
// `exportSplit`.
function SplitPreview({
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
  const image = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const header = layers.find((layer): layer is TextLayer => layer.kind === "header");
  const description = layers.find((layer): layer is TextLayer => layer.kind === "description");
  const headerStyle = header ? resolveTextStyle(header) : null;
  const descStyle = description ? resolveTextStyle(description) : null;
  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;
  const showPhotoFill = Boolean(image?.visible && image.src);

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {image?.visible && (
        <DraggableImage
          layer={image}
          fit="cover"
          selected={selectedId === image.id}
          onSelect={() => onSelect(image.id)}
          onPan={(offsetX, offsetY) =>
            updateLayer(
              image.id,
              { transform: { ...imageTransform(image), offsetX, offsetY } },
              `pan-${image.id}`,
            )
          }
          className="inset-0 h-full w-full"
        />
      )}

      {/* Paper panel over the left, covering that part of the photo. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{ width: pct(SPLIT_LAYOUT.splitX), background: template.background }}
      />

      {header?.visible && headerStyle && header.text.trim() && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: pct(SPLIT_LAYOUT.headline.x),
            top: pct(SPLIT_LAYOUT.headline.top),
            width: pct(SPLIT_LAYOUT.headline.width),
            fontFamily: fontById(header.fontId).family,
            fontWeight: headerStyle.weight,
            // Auto-fit the headline to the chosen font (cqi = % of canvas width).
            fontSize: `${splitHeadlineFontSize(header, 100)}cqi`,
            lineHeight: SPLIT_LAYOUT.headline.lineHeight,
            letterSpacing: `${headerStyle.letterSpacing}em`,
            textTransform: header.uppercase ? "uppercase" : "none",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            // Fill the letters with the photo (positioned to cover the full
            // canvas) so they read continuous with the right-hand photo.
            ...(showPhotoFill
              ? {
                  backgroundImage: `url("${image!.src}")`,
                  // The letters preview as a cover-fit crop of the photo; the PNG
                  // export fills them from the full-canvas photo so they line up
                  // seamlessly with the right-hand photo across the boundary.
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }
              : { color: header.color }),
          }}
        >
          {header.text}
        </div>
      )}

      {description?.visible && descStyle && description.text.trim() && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: pct(SPLIT_LAYOUT.body.x),
            bottom: pct(SPLIT_LAYOUT.body.bottom),
            width: pct(SPLIT_LAYOUT.body.width),
            fontFamily: fontById(description.fontId).family,
            fontWeight: descStyle.weight,
            fontSize: cqi(SPLIT_LAYOUT.body.size * descStyle.sizeScale),
            lineHeight: SPLIT_LAYOUT.body.lineHeight,
            letterSpacing: `${descStyle.letterSpacing}em`,
            textAlign: descStyle.align,
            color: description.color,
            textTransform: description.uppercase ? "uppercase" : "none",
            whiteSpace: "pre-line",
            textShadow: descStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {description.text}
        </div>
      )}
    </div>
  );
}

// Sliced-type poster (the SUNDAY template): a solid photo block on the left that
// transitions into a giant caption (one big letter per horizontal band, filled
// with its own slice of the photo), plus an optional right-hand date / quote /
// year. The photo-filled letters are drawn on a canvas via the shared
// `drawSlicedLetters` routine so the preview matches the export exactly; the
// optional background image and right column are DOM layers over/under it.
function SlicedPreview({
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
  const photo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "image",
  );
  const background = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "background",
  );
  const caption = layers.find((layer): layer is TextLayer => layer.id === "header");
  const date = layers.find((layer): layer is TextLayer => layer.id === "eyebrow");
  const quote = layers.find((layer): layer is TextLayer => layer.id === "description");
  const year = layers.find((layer): layer is TextLayer => layer.id === "cta");

  const [rw, rh] = template.aspectRatio.split("/").map((part) => Number(part.trim()));
  const ratio = rw && rh ? rw / rh : 0.75;
  // The letters render on a canvas (same routine as the export), scaled to fill
  // the container. Fixed pixel size at the box aspect so CSS scaling stays crisp.
  const Wv = 1000;
  const Hv = Math.round(Wv / ratio);

  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;

  const captionStyle = caption ? resolveTextStyle(caption) : null;
  const label = caption ? (caption.uppercase ? caption.text.toUpperCase() : caption.text) : "";
  const chars = slicedChars(label);
  const showLetters = Boolean(caption?.visible && chars.length);
  const showPhotoFill = Boolean(photo?.visible && photo.src);

  // Draw the sliced photo-filled caption onto the canvas with the same
  // `drawSlicedLetters` routine the export uses — so the preview matches the
  // download exactly (including the left photo block that follows each glyph's
  // contour). Re-runs when the caption, font, photo or its transform changes;
  // waits for the caption face to load so glyph ink metrics are truthful.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transform = photo ? imageTransform(photo) : DEFAULT_IMAGE_TRANSFORM;
  const captionFace = caption
    ? `${captionStyle?.weight ?? 400} 100px ${fontById(caption.fontId).family.split(",")[0].trim()}`
    : null;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let cancelled = false;
    const paint = (img: HTMLImageElement | null) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!showLetters || !caption || !captionStyle) return;
      drawSlicedLetters(ctx, {
        chars,
        geo: slicedGeometry(chars.length, canvas.width, canvas.height),
        fontId: caption.fontId,
        weight: captionStyle.weight,
        photo: img,
        photoTransform: transform,
        color: caption.color,
      });
    };
    const run = async () => {
      if (captionFace && typeof document !== "undefined" && document.fonts) {
        await document.fonts.load(captionFace).catch(() => undefined);
      }
      if (cancelled) return;
      if (showPhotoFill && photo?.src) {
        const img = new Image();
        img.onload = () => paint(img);
        img.onerror = () => paint(null);
        img.src = photo.src;
      } else {
        paint(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chars.join(""),
    caption?.fontId,
    caption?.color,
    captionStyle?.weight,
    captionFace,
    showLetters,
    showPhotoFill,
    photo?.src,
    transform.offsetX,
    transform.offsetY,
    transform.scale,
    transform.rotation,
    Wv,
    Hv,
  ]);

  // Stacked single-character block (date / year), rendered as pre-line text.
  const stackedText = (layer: TextLayer | undefined) =>
    layer && layer.text.trim()
      ? Array.from(
          (layer.uppercase ? layer.text.toUpperCase() : layer.text).replace(/\s+/g, ""),
        ).join("\n")
      : "";

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {background?.visible && background.src && (
        <img src={background.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {showLetters && (
        <canvas
          ref={canvasRef}
          width={Wv}
          height={Hv}
          className="absolute inset-0 h-full w-full"
          onPointerDown={(event) => {
            event.stopPropagation();
            if (photo) onSelect(photo.id);
          }}
        />
      )}

      {/* Date — stacked characters, top-right. */}
      {date?.visible && date.text.trim() && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 text-center"
          style={{
            left: pct(SLICED_LAYOUT.right.center),
            top: pct(SLICED_LAYOUT.right.date.top),
            fontFamily: fontById(date.fontId).family,
            fontWeight: resolveTextStyle(date).weight,
            fontSize: cqi(SLICED_LAYOUT.right.date.size),
            lineHeight: SLICED_LAYOUT.right.date.lineHeight,
            color: date.color,
            whiteSpace: "pre-line",
          }}
        >
          {stackedText(date)}
        </div>
      )}

      {/* Quote — wrapped italic serif, right-aligned, vertically centred. */}
      {quote?.visible && quote.text.trim() && (
        <div
          className="pointer-events-none absolute -translate-y-1/2 text-right"
          style={{
            right: pct(1 - SLICED_LAYOUT.right.edge),
            top: pct(SLICED_LAYOUT.right.quote.centerY),
            width: cqi(SLICED_LAYOUT.right.quote.width),
            fontFamily: fontById(quote.fontId).family,
            fontStyle: "italic",
            fontWeight: resolveTextStyle(quote).weight,
            fontSize: cqi(SLICED_LAYOUT.right.quote.size),
            lineHeight: SLICED_LAYOUT.right.quote.lineHeight,
            color: quote.color,
            whiteSpace: "pre-line",
          }}
        >
          {quote.text}
        </div>
      )}

      {/* Year — stacked characters, bottom-right. */}
      {year?.visible && year.text.trim() && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 text-center"
          style={{
            left: pct(SLICED_LAYOUT.right.center),
            bottom: pct(1 - SLICED_LAYOUT.right.year.bottom),
            fontFamily: fontById(year.fontId).family,
            fontWeight: resolveTextStyle(year).weight,
            fontSize: cqi(SLICED_LAYOUT.right.year.size),
            lineHeight: SLICED_LAYOUT.right.year.lineHeight,
            color: year.color,
            whiteSpace: "pre-line",
          }}
        >
          {stackedText(year)}
        </div>
      )}
    </div>
  );
}

// The decorative arrow disc used on the editorial footer slides (1, 8). A ringed
// circle with a right-arrow, stroked in `color`. Mirrors `.arrow` in
// `template_frankof.v2.html` and `drawEditorialArrow` in the export.
function ArrowDisc({ color, sizeCqi }: { color: string; sizeCqi: string }) {
  return (
    <div
      className="pointer-events-none flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: sizeCqi,
        height: sizeCqi,
        border: `${1.5 / 1080 * 100}cqi solid ${color}`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: "40%", height: "40%" }}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="12" x2="20" y2="12" />
        <polyline points="13.5 5.5 20 12 13.5 18.5" />
      </svg>
    </div>
  );
}

// This-or-That poll (the MA&partners template): two full-height vertical photos
// butted along the split, a stacked serif caption over them ("this / or / that",
// one word per line with short connectors smaller), an optional white poll card
// with a rounded row per visible option, and an optional brand wordmark footer.
// Mirrors `exportDuel`.
function DuelPreview({
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
  const duelPhotos = layers
    .filter((layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image")
    .slice(0, 2);
  const header = layers.find((layer): layer is TextLayer => layer.id === "header");
  const wordmark = layers.find((layer): layer is TextLayer => layer.id === "description");
  const headerStyle = header ? resolveTextStyle(header) : null;
  const wordmarkStyle = wordmark ? resolveTextStyle(wordmark) : null;
  const options = duelVisibleOptions(layers);
  const cqi = (value: number) => `${value * 100}cqi`;
  const splitPct = DUEL_LAYOUT.splitX * 100;
  const words = header ? duelCaptionWords(duelDisplayCase(header.text, header.uppercase)) : [];
  const headSize = headerStyle ? DUEL_LAYOUT.headline.size * headerStyle.sizeScale : 0;

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {duelPhotos.map((photo, index) =>
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
            className="top-0 h-full"
            style={
              index === 0
                ? { left: 0, width: `${splitPct}%` }
                : { left: `${splitPct}%`, width: `${100 - splitPct}%` }
            }
          />
        ) : null,
      )}

      {/* Stacked serif caption. */}
      {header?.visible && headerStyle && header.text.trim() && (
        <div
          className="pointer-events-none absolute -translate-y-1/2 text-center"
          style={{
            left: 0,
            right: 0,
            top: `${headerStyle.posY * 100}%`,
            fontFamily: fontById(header.fontId).family,
            fontWeight: headerStyle.weight,
            lineHeight: DUEL_LAYOUT.headline.lineHeight,
            letterSpacing: `${headerStyle.letterSpacing}em`,
            color: header.color,
            textShadow: headerStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {words.map((entry, index) => (
            <div
              key={index}
              style={{
                fontSize: cqi(
                  entry.connector ? headSize * DUEL_LAYOUT.headline.connectorScale : headSize,
                ),
              }}
            >
              {entry.word}
            </div>
          ))}
        </div>
      )}

      {/* Poll card — one rounded row per visible option. */}
      {options.length > 0 && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "50%",
            top: `${DUEL_LAYOUT.poll.centerY * 100}%`,
            width: cqi(DUEL_LAYOUT.poll.width),
            background: DUEL_LAYOUT.poll.cardColor,
            borderRadius: cqi(DUEL_LAYOUT.poll.radius),
            padding: `${cqi(DUEL_LAYOUT.poll.padY)} ${cqi(DUEL_LAYOUT.poll.padX)}`,
            display: "flex",
            flexDirection: "column",
            gap: cqi(DUEL_LAYOUT.poll.rowGap),
          }}
        >
          {options.map((option) => {
            const style = resolveTextStyle(option);
            return (
              <div
                key={option.id}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelect(option.id);
                }}
                className="flex items-center"
                style={{
                  height: cqi(DUEL_LAYOUT.poll.rowHeight),
                  paddingLeft: cqi(DUEL_LAYOUT.poll.rowPadX),
                  background: DUEL_LAYOUT.poll.rowColor,
                  borderRadius: cqi(DUEL_LAYOUT.poll.rowRadius),
                  fontFamily: fontById(option.fontId).family,
                  fontWeight: style.weight,
                  fontSize: cqi(DUEL_LAYOUT.poll.labelSize * style.sizeScale),
                  letterSpacing: `${style.letterSpacing}em`,
                  color: option.color,
                  outline:
                    selectedId === option.id ? "2px solid var(--destructive, #ef4444)" : "none",
                  outlineOffset: "1px",
                }}
              >
                {option.uppercase ? option.text.toUpperCase() : option.text}
              </div>
            );
          })}
        </div>
      )}

      {/* Brand wordmark footer. */}
      {wordmark?.visible && wordmarkStyle && wordmark.text.trim() && (
        <div
          className="pointer-events-none absolute text-center"
          style={{
            left: 0,
            right: 0,
            bottom: `${DUEL_LAYOUT.wordmark.bottom * 100}%`,
            fontFamily: fontById(wordmark.fontId).family,
            fontWeight: wordmarkStyle.weight,
            fontSize: cqi(DUEL_LAYOUT.wordmark.size * wordmarkStyle.sizeScale),
            lineHeight: DUEL_LAYOUT.wordmark.lineHeight,
            letterSpacing: `${wordmarkStyle.letterSpacing}em`,
            color: wordmark.color,
            textShadow: wordmarkStyle.shadow ? TEXT_SHADOW_CSS : "none",
          }}
        >
          {wordmark.uppercase ? wordmark.text.toUpperCase() : wordmark.text}
        </div>
      )}
    </div>
  );
}

// City postcard poster (the LONDON template): a full-bleed travel photo, the
// city name stacked one letter per cell down the right column (each glyph
// stretched to fill its cell and difference-blended over the photo so it inverts
// the picture: light letters over dark areas, dark letters over light ones), a
// rotated subtitle up the left gutter and a tracked country label bottom-right.
// Mirrors `exportPostcard`.
function PostcardPreview({
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
  const clipId = useId();
  const photo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "image",
  );
  const city = layers.find((layer): layer is TextLayer => layer.id === "header");
  const subtitle = layers.find((layer): layer is TextLayer => layer.id === "eyebrow");
  const country = layers.find((layer): layer is TextLayer => layer.id === "cta");

  const [rw, rh] = template.aspectRatio.split("/").map((part) => Number(part.trim()));
  const ratio = rw && rh ? rw / rh : 0.6888;
  const Wv = 1000;
  const Hv = Math.round(Wv / ratio);
  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;

  const cityStyle = city ? resolveTextStyle(city) : null;
  const label = city ? (city.uppercase ? city.text.toUpperCase() : city.text) : "";
  const chars = postcardTitleChars(label);
  const showTitle = Boolean(city?.visible && chars.length);
  const cityFont = city ? fontById(city.fontId).family : "sans-serif";
  const geo = postcardTitleGeometry(chars.length || 1, Wv, Hv);
  const p = POSTCARD_LAYOUT.photo;

  // Glyph ink metrics only measure truthfully once the caption's face is loaded;
  // bump a tick when it lands so the letters re-measure and settle.
  const [, setFontTick] = useState(0);
  const cityFace = city
    ? `${cityStyle?.weight ?? 400} 100px ${fontById(city.fontId).family.split(",")[0].trim()}`
    : null;
  useEffect(() => {
    if (!cityFace || typeof document === "undefined" || !document.fonts) return;
    let live = true;
    document.fonts
      .load(cityFace)
      .then(() => {
        if (live) setFontTick((tick) => tick + 1);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [cityFace]);

  // Each glyph is stretched to fill its whole cell (full width and height) so the
  // letters read as solid blocks down the column. When ink metrics are
  // unavailable, fall back to a width-only `textLength` stretch at a cap-height fit.
  const glyphs = chars.map((ch, index) => {
    const cell = geo.cells[index];
    const met = city && cityStyle ? slicedGlyphMetrics(ch, city.fontId, cityStyle.weight) : null;
    if (met) {
      return {
        ch,
        index,
        transform: `translate(${geo.left} ${cell.y}) scale(${geo.w / met.inkW} ${cell.h / met.inkH})`,
        x: met.left,
        y: met.ascent,
        size: met.refSize,
      };
    }
    const size = cell.h / POSTCARD_LAYOUT.title.capRatio;
    const baseline = cell.y + (cell.h + size * POSTCARD_LAYOUT.title.capRatio) / 2;
    return { ch, index, transform: null, x: geo.left, y: baseline, size };
  });

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
        isolation: "isolate",
      }}
    >
      {/* Full-bleed photo into its frame (paper shows in the gutter and footer). */}
      {photo?.visible && photo.src && (
        <DraggableImage
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
          style={{
            left: pct(p.left),
            top: pct(p.top),
            width: pct(p.right - p.left),
            height: pct(p.bottom - p.top),
          }}
        />
      )}

      {/* Giant stacked city name — white, difference-blended over the photo. */}
      {showTitle && cityStyle && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${Wv} ${Hv}`}
          preserveAspectRatio="none"
          style={{ mixBlendMode: "difference" }}
        >
          <defs>
            <clipPath id={clipId}>
              {geo.cells.map((cell, index) => (
                <rect key={index} x={geo.left} y={cell.y} width={geo.w} height={cell.h} />
              ))}
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`} fill={city!.color}>
            {glyphs.map((glyph) => (
              <text
                key={glyph.index}
                x={glyph.x}
                y={glyph.y}
                transform={glyph.transform ?? undefined}
                textLength={glyph.transform ? undefined : geo.w}
                lengthAdjust={glyph.transform ? undefined : "spacingAndGlyphs"}
                textAnchor="start"
                style={{
                  fontFamily: cityFont,
                  fontWeight: cityStyle.weight,
                  fontSize: `${glyph.size}px`,
                }}
              >
                {glyph.ch}
              </text>
            ))}
          </g>
        </svg>
      )}

      {/* Rotated subtitle up the left gutter (reads bottom-to-top). */}
      {subtitle?.visible && subtitle.text.trim() && (
        <div
          className="pointer-events-none absolute whitespace-nowrap"
          style={{
            left: pct(POSTCARD_LAYOUT.subtitle.centerX),
            top: pct(POSTCARD_LAYOUT.subtitle.centerY),
            transform: "translate(-50%, -50%) rotate(-90deg)",
            transformOrigin: "center",
            fontFamily: fontById(subtitle.fontId).family,
            fontWeight: resolveTextStyle(subtitle).weight,
            fontSize: cqi(POSTCARD_LAYOUT.subtitle.size * resolveTextStyle(subtitle).sizeScale),
            letterSpacing: `${resolveTextStyle(subtitle).letterSpacing || POSTCARD_LAYOUT.subtitle.tracking}em`,
            color: subtitle.color,
          }}
        >
          {subtitle.uppercase ? subtitle.text.toUpperCase() : subtitle.text}
        </div>
      )}

      {/* Country label — ink on the paper footer, right-aligned to the title. */}
      {country?.visible && country.text.trim() && (
        <div
          className="pointer-events-none absolute whitespace-nowrap text-right"
          style={{
            right: pct(1 - POSTCARD_LAYOUT.country.right),
            top: pct(POSTCARD_LAYOUT.country.baseline),
            transform: "translateY(-100%)",
            fontFamily: fontById(country.fontId).family,
            fontWeight: resolveTextStyle(country).weight,
            fontSize: cqi(POSTCARD_LAYOUT.country.size * resolveTextStyle(country).sizeScale),
            letterSpacing: `${resolveTextStyle(country).letterSpacing || POSTCARD_LAYOUT.country.tracking}em`,
            color: country.color,
          }}
        >
          {country.uppercase ? country.text.toUpperCase() : country.text}
        </div>
      )}
    </div>
  );
}

// A small US flag (white field, 13 red/white stripes, blue canton with a grid of
// white stars). Sized by `width` (any CSS length). Shared spec with `drawUsFlag`.
function FlagUS({ width }: { width: string }) {
  const W = 190;
  const H = 100;
  const stripeH = H / 13;
  const cantonW = W * 0.4;
  const cantonH = stripeH * 7;
  const stars: { cx: number; cy: number }[] = [];
  const cols = 5;
  const rows = 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      stars.push({
        cx: ((col + 0.5) / cols) * cantonW,
        cy: ((row + 0.5) / rows) * cantonH,
      });
    }
  }
  return (
    <svg
      width={width}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
      aria-hidden
    >
      <rect x={0} y={0} width={W} height={H} fill="#f4f4f2" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={0} y={i * 2 * stripeH} width={W} height={stripeH} fill="#b7332f" />
      ))}
      <rect x={0} y={0} width={cantonW} height={cantonH} fill="#1c2a5e" />
      {stars.map((star, i) => (
        <circle key={i} cx={star.cx} cy={star.cy} r={cantonW / 22} fill="#f4f4f2" />
      ))}
    </svg>
  );
}

// City text-mask poster (the SAN FRANCISCO template): a full-bleed photo revealed
// only through a giant word-wrapped city name (everything else black), with an
// optional right-aligned country label and flag in the upper right. Mirrors
// `exportCityMask`.
function CityMaskPreview({
  template,
  layers,
  selectedId,
  onSelect,
}: {
  template: RemixEditorTemplate;
  layers: EditorLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const clipId = useId();
  const photo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "image",
  );
  const city = layers.find((layer): layer is TextLayer => layer.id === "header");
  const country = layers.find((layer): layer is TextLayer => layer.id === "cta");

  const [rw, rh] = template.aspectRatio.split("/").map((part) => Number(part.trim()));
  const ratio = rw && rh ? rw / rh : 736 / 1308;
  const Wv = 1000;
  const Hv = Math.round(Wv / ratio);
  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;

  const cityStyle = city ? resolveTextStyle(city) : null;
  const label = city ? (city.uppercase ? city.text.toUpperCase() : city.text) : "";
  const showPhotoFill = Boolean(photo?.visible && photo.src);
  const cityFont = city ? fontById(city.fontId).family : "sans-serif";

  // Glyph metrics/wrapping only settle once the caption's face is loaded; bump a
  // tick when it lands so the lines re-wrap and re-fit.
  const [, setFontTick] = useState(0);
  const cityFace = city
    ? `${cityStyle?.weight ?? 400} 100px ${fontById(city.fontId).family.split(",")[0].trim()}`
    : null;
  const countryFace =
    country && country.visible
      ? `${resolveTextStyle(country).weight} 100px ${fontById(country.fontId).family.split(",")[0].trim()}`
      : null;
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let live = true;
    const faces = [cityFace, countryFace].filter(Boolean) as string[];
    if (!faces.length) return;
    Promise.all(faces.map((face) => document.fonts.load(face).catch(() => undefined)))
      .then(() => {
        if (live) setFontTick((tick) => tick + 1);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [cityFace, countryFace]);

  const geo =
    city && cityStyle ? cityMaskGeometry(label, city.fontId, cityStyle.weight, Wv, Hv) : null;
  const showTitle = Boolean(city?.visible && geo?.lines.length);

  const countryStyle = country ? resolveTextStyle(country) : null;
  const countryLabel = country ? (country.uppercase ? country.text.toUpperCase() : country.text) : "";
  const countryLines =
    country && countryStyle
      ? cityMaskLabelLines(countryLabel, country.fontId, countryStyle.weight, Wv)
      : [];
  const showCountry = Boolean(country?.visible && country?.text.trim() && countryLines.length);

  const titleTexts = geo
    ? geo.lines.map((line, index) => (
        <text
          key={index}
          x={geo.left}
          y={line.baseline}
          transform={`translate(0 ${geo.top}) scale(1 ${geo.scaleY})`}
          textAnchor="start"
          style={{
            fontFamily: cityFont,
            fontWeight: cityStyle?.weight,
            fontSize: `${geo.fontSize}px`,
          }}
        >
          {line.text}
        </text>
      ))
    : null;

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
        isolation: "isolate",
      }}
    >
      {showTitle && geo && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${Wv} ${Hv}`}
          preserveAspectRatio="none"
          onPointerDown={(event) => {
            event.stopPropagation();
            if (photo) onSelect(photo.id);
          }}
        >
          {showPhotoFill ? (
            <>
              <defs>
                <clipPath id={clipId}>{titleTexts}</clipPath>
              </defs>
              <image
                href={photo!.src}
                x={0}
                y={0}
                width={Wv}
                height={Hv}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${clipId})`}
              />
            </>
          ) : (
            <g fill={city!.color}>{titleTexts}</g>
          )}
        </svg>
      )}

      {/* Country label + flag, upper right. */}
      {showCountry && countryStyle && (
        <div
          className="pointer-events-none absolute flex flex-col items-end text-right"
          style={{
            right: pct(1 - CITYMASK_LAYOUT.label.right),
            top: pct(CITYMASK_LAYOUT.label.top),
            color: country!.color,
          }}
        >
          <div
            style={{
              fontFamily: fontById(country!.fontId).family,
              fontWeight: countryStyle.weight,
              fontSize: cqi(CITYMASK_LAYOUT.label.size * countryStyle.sizeScale),
              lineHeight: CITYMASK_LAYOUT.label.lineHeight,
              letterSpacing: `${countryStyle.letterSpacing || CITYMASK_LAYOUT.label.tracking}em`,
            }}
          >
            {countryLines.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <div style={{ marginTop: cqi(CITYMASK_LAYOUT.label.gap) }}>
            <FlagUS width={cqi(CITYMASK_LAYOUT.flag.width)} />
          </div>
        </div>
      )}
    </div>
  );
}

// The DOM preview for the "self" split-portrait poster: a full-bleed photo on
// the left half and the caption set as one giant letter per row on the right,
// each letter a window revealing the same full-frame photo. Mirrors
// `exportSelf`.
function SelfPreview({
  template,
  layers,
  selectedId,
  onSelect,
}: {
  template: RemixEditorTemplate;
  layers: EditorLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const clipId = useId();
  const grayId = useId();
  const photo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "image",
  );
  const header = layers.find((layer): layer is TextLayer => layer.id === "header");

  const [rw, rh] = template.aspectRatio.split("/").map((part) => Number(part.trim()));
  const ratio = rw && rh ? rw / rh : 736 / 1062;
  const Wv = 1000;
  const Hv = Math.round(Wv / ratio);

  const style = header ? resolveTextStyle(header) : null;
  const chars = header ? selfChars(header.uppercase ? header.text.toUpperCase() : header.text) : [];
  const showPhotoFill = Boolean(photo?.visible && photo.src);
  const font = header ? fontById(header.fontId).family : "sans-serif";

  // Glyph metrics settle once the caption's face is loaded; bump a tick when it
  // lands so the letters re-fit.
  const [, setFontTick] = useState(0);
  const face = header
    ? `${style?.weight ?? 400} 100px ${fontById(header.fontId).family.split(",")[0].trim()}`
    : null;
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts || !face) return;
    let live = true;
    document.fonts
      .load(face)
      .then(() => {
        if (live) setFontTick((tick) => tick + 1);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [face]);

  const geo =
    header && style ? selfGeometry(chars, header.fontId, style.weight, Wv, Hv) : null;
  const show = Boolean(header?.visible && geo && (geo.cells.length || geo.photoRight > 0));

  // Each glyph's ink box is stretched to fill its fixed-width cell, so every
  // letter reads the same width — mirroring `exportSelf`. Falls back to a
  // width-only stretch when ink metrics aren't available.
  const letters = geo
    ? geo.cells.map((cell, index) => {
        const met = header && style ? slicedGlyphMetrics(cell.char, header.fontId, style.weight) : null;
        if (met) {
          return (
            <text
              key={index}
              x={met.left}
              y={met.ascent}
              transform={`translate(${geo.left} ${cell.top}) scale(${geo.cellW / met.inkW} ${geo.cap / met.inkH})`}
              textAnchor="start"
              style={{ fontFamily: font, fontWeight: style?.weight, fontSize: `${met.refSize}px` }}
            >
              {cell.char}
            </text>
          );
        }
        return (
          <text
            key={index}
            x={geo.left}
            y={cell.top + geo.cap}
            textLength={geo.cellW}
            lengthAdjust="spacingAndGlyphs"
            textAnchor="start"
            style={{ fontFamily: font, fontWeight: style?.weight, fontSize: `${geo.fontSize}px` }}
          >
            {cell.char}
          </text>
        );
      })
    : null;

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
        isolation: "isolate",
      }}
    >
      {show && geo && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${Wv} ${Hv}`}
          preserveAspectRatio="none"
          onPointerDown={(event) => {
            event.stopPropagation();
            if (photo) onSelect(photo.id);
          }}
        >
          {showPhotoFill ? (
            <>
              <defs>
                <clipPath id={clipId}>
                  <rect x={0} y={0} width={geo.photoRight} height={Hv} />
                  {letters}
                </clipPath>
                <filter id={grayId} colorInterpolationFilters="sRGB">
                  <feColorMatrix
                    type="matrix"
                    values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
                  />
                </filter>
              </defs>
              <image
                href={photo!.src}
                x={0}
                y={0}
                width={Wv}
                height={Hv}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${clipId})`}
                filter={`url(#${grayId})`}
              />
            </>
          ) : (
            <g fill={header!.color}>
              <rect x={0} y={0} width={geo.photoRight} height={Hv} />
              {letters}
            </g>
          )}
        </svg>
      )}
    </div>
  );
}

// Mono Grid (the 3×3 collage series): a full-bleed background photo split into
// a 3×3 grid by thin lines in the canvas background colour, up to 3 small cell
// photos on fixed cells, a caption block (headline + hashtag) centred in one
// cell, a rotated side text block reading bottom-to-top in another, and an
// optional bottom-centred brand logo. Cell assignments come from
// `gridVariant(template.id)`. Mirrors `exportGrid`.
function GridPreview({
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
  const variant = gridVariant(template.id);
  const background = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "background",
  );
  const header = layers.find((layer): layer is TextLayer => layer.id === "header");
  const tag = layers.find((layer): layer is TextLayer => layer.id === "eyebrow");
  const sideTitle = layers.find((layer): layer is TextLayer => layer.id === "description");
  const sideTag = layers.find((layer): layer is TextLayer => layer.id === "cta");
  const logo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "logo" }> => layer.kind === "logo",
  );
  const cqi = (value: number) => `${value * 100}cqi`;
  const pct = (value: number) => `${value * 100}%`;

  // A caption-style text block: headline lines + a smaller hashtag underneath.
  const textBlock = (
    title: TextLayer | undefined,
    tagLayer: TextLayer | undefined,
    sizes: { size: number; tagSize: number; lineHeight: number; gap: number },
  ) => {
    const titleLines =
      title?.visible && title.text.trim() ? gridTextLines(title.text, title.uppercase) : [];
    const tagText =
      tagLayer?.visible && tagLayer.text.trim()
        ? (tagLayer.uppercase ? tagLayer.text.toUpperCase() : tagLayer.text)
        : "";
    if (!titleLines.length && !tagText) return null;
    const titleStyle = title ? resolveTextStyle(title) : null;
    const tagStyle = tagLayer ? resolveTextStyle(tagLayer) : null;
    return (
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: titleLines.length && tagText ? cqi(sizes.gap) : 0 }}
      >
        {title && titleStyle && titleLines.length > 0 && (
          <div
            style={{
              fontFamily: fontById(title.fontId).family,
              fontWeight: titleStyle.weight,
              fontSize: cqi(sizes.size * titleStyle.sizeScale),
              lineHeight: sizes.lineHeight,
              letterSpacing: `${titleStyle.letterSpacing}em`,
              color: title.color,
              textShadow: titleStyle.shadow ? TEXT_SHADOW_CSS : "none",
              whiteSpace: "nowrap",
            }}
          >
            {titleLines.map((lineText, index) => (
              <div key={index}>{lineText}</div>
            ))}
          </div>
        )}
        {tagLayer && tagStyle && tagText && (
          <div
            style={{
              fontFamily: fontById(tagLayer.fontId).family,
              fontWeight: tagStyle.weight,
              fontSize: cqi(sizes.tagSize * tagStyle.sizeScale),
              lineHeight: sizes.lineHeight,
              letterSpacing: `${tagStyle.letterSpacing}em`,
              color: tagLayer.color,
              textShadow: tagStyle.shadow ? TEXT_SHADOW_CSS : "none",
              whiteSpace: "nowrap",
            }}
          >
            {tagText}
          </div>
        )}
      </div>
    );
  };

  const captionRect = gridCellRect(variant.caption, 1, 1);
  const sideRect = gridCellRect(variant.side, 1, 1);

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {/* Full-bleed background photo. */}
      {background?.visible && background.src && (
        <DraggableImage
          layer={background}
          fit="cover"
          selected={selectedId === background.id}
          onSelect={() => onSelect(background.id)}
          onPan={(offsetX, offsetY) =>
            updateLayer(
              background.id,
              { transform: { ...imageTransform(background), offsetX, offsetY } },
              `pan-${background.id}`,
            )
          }
          className="inset-0 h-full w-full"
        />
      )}

      {/* Small photos, one per variant cell. */}
      {variant.photos.map((cell, index) => {
        const layer = layers.find(
          (candidate): candidate is Extract<EditorLayer, { kind: "image" }> =>
            candidate.id === `cell-${index + 1}` && candidate.kind === "image",
        );
        if (!layer?.visible || !layer.src) return null;
        const rect = gridCellRect(cell, 1, 1);
        return (
          <DraggableImage
            key={layer.id}
            layer={layer}
            fit="cover"
            selected={selectedId === layer.id}
            onSelect={() => onSelect(layer.id)}
            onPan={(offsetX, offsetY) =>
              updateLayer(
                layer.id,
                { transform: { ...imageTransform(layer), offsetX, offsetY } },
                `pan-${layer.id}`,
              )
            }
            style={{
              left: pct(rect.x),
              top: pct(rect.y),
              width: pct(rect.w),
              height: pct(rect.h),
            }}
          />
        );
      })}

      {/* Grid hairlines, centred on the cell edges, over the photos. */}
      {[1, 2].map((i) => (
        <div key={`v-${i}`} className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-0 h-full -translate-x-1/2"
            style={{
              left: pct(i / 3),
              width: `max(1px, ${cqi(GRID_LAYOUT.line)})`,
              background: template.background,
            }}
          />
          <div
            className="absolute left-0 w-full -translate-y-1/2"
            style={{
              top: pct(i / 3),
              height: `max(1px, ${cqi(GRID_LAYOUT.line)})`,
              background: template.background,
            }}
          />
        </div>
      ))}

      {/* Caption block, centred in its cell. */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: pct(captionRect.x),
          top: pct(captionRect.y),
          width: pct(captionRect.w),
          height: pct(captionRect.h),
        }}
      >
        {textBlock(header, tag, GRID_LAYOUT.caption)}
      </div>

      {/* Side block — rotated -90° so it reads bottom-to-top. */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: pct(sideRect.x),
          top: pct(sideRect.y),
          width: pct(sideRect.w),
          height: pct(sideRect.h),
        }}
      >
        <div style={{ transform: "rotate(-90deg)" }}>
          {textBlock(sideTitle, sideTag, GRID_LAYOUT.side)}
        </div>
      </div>

      {/* Bottom-centred brand logo. */}
      {logo?.visible && logo.src && (
        <img
          src={logo.src}
          alt=""
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 object-contain"
          style={{
            bottom: pct(GRID_LAYOUT.logo.bottom),
            height: cqi(GRID_LAYOUT.logo.height),
            maxWidth: cqi(GRID_LAYOUT.logo.maxWidth),
          }}
        />
      )}
    </div>
  );
}

// FRANKOF editorial paper slides (1, 6, 8): an uppercase headline on top, a
// flexible photo (contain or cover), and an optional footer caption + arrow disc.
// Geometry resolved per template via `editorialGeometry`. Mirrors
// `template_frankof.v2.html`'s `.s1`/`.s6`/`.s8` and `exportEditorial`.
function EditorialPreview({
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
  const geom = editorialGeometry(template.id);
  const image = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const header = layers.find((layer): layer is TextLayer => layer.kind === "header");
  const description = layers.find((layer): layer is TextLayer => layer.kind === "description");
  const headerStyle = header ? resolveTextStyle(header) : null;
  const descStyle = description ? resolveTextStyle(description) : null;

  // Vertical measures are fractions of *height*; convert to width-based `cqi`
  // (container-query units are % of width) using the poster's aspect ratio.
  const [rw, rh] = template.aspectRatio.split("/").map((v) => parseFloat(v.trim()));
  const hOverW = rw && rh ? rh / rw : 1.25;
  const cqi = (value: number) => `${value * 100}cqi`;
  const vcqi = (value: number) => `${value * hOverW * 100}cqi`;
  const arrowInk = header?.color ?? "#1d1b19";
  const showFooter = geom.footer && (description?.visible || geom.footer.arrow);
  const bleed = geom.media.bleed ?? false;

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
      }}
    >
      {header?.visible && headerStyle && header.text.trim() && (
        <div
          className="pointer-events-none shrink-0"
          style={{
            padding: `${vcqi(geom.padTop)} ${cqi(geom.padX)} 0`,
            marginBottom: vcqi(geom.headline.gap),
            fontFamily: fontById(header.fontId).family,
            fontWeight: headerStyle.weight,
            fontSize: cqi(geom.headline.size * headerStyle.sizeScale),
            lineHeight: geom.headline.lineHeight,
            letterSpacing: `${headerStyle.letterSpacing}em`,
            textAlign: headerStyle.align,
            color: header.color,
            textTransform: header.uppercase ? "uppercase" : "none",
            whiteSpace: "pre-line",
          }}
        >
          {header.text}
        </div>
      )}

      {image?.visible && (
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{
            marginLeft: bleed ? 0 : cqi(geom.padX),
            marginRight: bleed ? 0 : cqi(geom.padX),
            marginBottom: showFooter
              ? vcqi(geom.media.gapBottom)
              : bleed
                ? 0
                : vcqi(geom.padBottom),
          }}
        >
          <DraggableImage
            layer={image}
            fit={geom.media.fit}
            selected={selectedId === image.id}
            onSelect={() => onSelect(image.id)}
            onPan={(offsetX, offsetY) =>
              updateLayer(
                image.id,
                { transform: { ...imageTransform(image), offsetX, offsetY } },
                `pan-${image.id}`,
              )
            }
            className="inset-0 h-full w-full"
          />
        </div>
      )}

      {showFooter && geom.footer && (
        <div
          className="flex shrink-0 items-center justify-between gap-6"
          style={{ padding: `0 ${cqi(geom.padX)} ${vcqi(geom.padBottom)}` }}
        >
          {description?.visible && descStyle && description.text.trim() ? (
            <div
              className="pointer-events-none"
              style={{
                maxWidth: cqi(geom.footer.maxWidth),
                fontFamily: fontById(description.fontId).family,
                fontWeight: descStyle.weight,
                fontSize: cqi(geom.footer.size * descStyle.sizeScale),
                lineHeight: geom.footer.lineHeight,
                letterSpacing: `${descStyle.letterSpacing}em`,
                textAlign: descStyle.align,
                color: description.color,
                textTransform: description.uppercase ? "uppercase" : "none",
                whiteSpace: "pre-line",
              }}
            >
              {description.text}
            </div>
          ) : (
            <span />
          )}
          {geom.footer.arrow && <ArrowDisc color={arrowInk} sizeCqi={cqi(EDITORIAL_ARROW)} />}
        </div>
      )}
    </div>
  );
}

// FRANKOF collage paper slides (3, 5, 7): a headline (with an optional brand
// wordmark and body/subtitle) over a multi-photo grid. Geometry from
// `COLLAGE_LAYOUT`; the arrangement branches on `collageSlide(template.id)`.
// Mirrors `template_frankof.v2.html`'s `.s3`/`.s5`/`.s7` and `exportCollage`.
function CollagePreview({
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
  const slide = collageSlide(template.id);
  const L = COLLAGE_LAYOUT;
  const cqi = (value: number) => `${value * 100}cqi`;
  const photos = layers.filter(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const header = layers.find((layer): layer is TextLayer => layer.kind === "header");
  const brand = layers.find((layer): layer is TextLayer => layer.kind === "eyebrow");
  const description = layers.find((layer): layer is TextLayer => layer.kind === "description");
  const logo = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "logo" }> => layer.kind === "logo",
  );

  const Photo = ({
    layer,
    className,
    style,
  }: {
    layer?: Extract<EditorLayer, { kind: "image" }>;
    className?: string;
    style?: React.CSSProperties;
  }) =>
    layer?.visible ? (
      <div className={cn("relative overflow-hidden", className)} style={style}>
        <DraggableImage
          layer={layer}
          fit="cover"
          selected={selectedId === layer.id}
          onSelect={() => onSelect(layer.id)}
          onPan={(offsetX, offsetY) =>
            updateLayer(
              layer.id,
              { transform: { ...imageTransform(layer), offsetX, offsetY } },
              `pan-${layer.id}`,
            )
          }
          className="inset-0 h-full w-full"
        />
      </div>
    ) : (
      <div className={className} style={style} />
    );

  const Headline = ({ size }: { size: number }) => {
    if (!header?.visible || !header.text.trim()) return <div className="min-w-0 flex-1" />;
    const style = resolveTextStyle(header);
    return (
      <div
        className="pointer-events-none min-w-0 flex-1"
        style={{
          fontFamily: fontById(header.fontId).family,
          fontWeight: style.weight,
          fontSize: cqi(size * style.sizeScale),
          lineHeight: 1.04,
          letterSpacing: `${style.letterSpacing}em`,
          textAlign: style.align,
          color: header.color,
          textTransform: header.uppercase ? "uppercase" : "none",
          whiteSpace: "pre-line",
        }}
      >
        {header.text}
      </div>
    );
  };

  // Top-right brand slot: the uploaded logo takes precedence over the wordmark.
  const HeaderRight = () => {
    if (logo?.visible && logo.src) {
      return (
        <img
          src={logo.src}
          alt=""
          className="pointer-events-none shrink-0 object-contain"
          style={{ height: cqi(L.logo.height), maxWidth: cqi(L.logo.maxWidth), marginLeft: "auto" }}
        />
      );
    }
    if (!brand?.visible || !brand.text.trim()) return null;
    const style = resolveTextStyle(brand);
    return (
      <div
        className="pointer-events-none shrink-0 text-right"
        style={{
          fontFamily: fontById(brand.fontId).family,
          fontWeight: style.weight,
          fontSize: cqi(L.wordmark.size * style.sizeScale),
          lineHeight: L.wordmark.lineHeight,
          letterSpacing: `${style.letterSpacing || L.wordmark.tracking}em`,
          color: brand.color,
          textTransform: brand.uppercase ? "uppercase" : "none",
          whiteSpace: "pre-line",
        }}
      >
        {brand.text}
      </div>
    );
  };

  const bodyText = (size: number, lineHeight: number, maxWidth?: number) => {
    if (!description?.visible || !description.text.trim()) return null;
    const style = resolveTextStyle(description);
    return (
      <div
        className="pointer-events-none"
        style={{
          maxWidth: maxWidth ? cqi(maxWidth) : undefined,
          fontFamily: fontById(description.fontId).family,
          fontWeight: style.weight,
          fontSize: cqi(size * style.sizeScale),
          lineHeight,
          letterSpacing: `${style.letterSpacing}em`,
          textAlign: style.align,
          color: description.color,
          textTransform: description.uppercase ? "uppercase" : "none",
          whiteSpace: "pre-line",
        }}
      >
        {description.text}
      </div>
    );
  };

  const container = (children: React.ReactNode, pad: { top: number; bottom: number }) => (
    <div
      className="relative flex w-full flex-col overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: template.background,
        containerType: "inline-size",
        padding: `${cqi(pad.top)} ${cqi(L.padX)} ${cqi(pad.bottom)}`,
      }}
    >
      {children}
    </div>
  );

  if (slide === 5) {
    const s = L.s5;
    return container(
      <>
        <div className="flex shrink-0 items-start" style={{ gap: cqi(s.headGap) }}>
          <Headline size={s.headline} />
          <HeaderRight />
        </div>
        <div className="flex shrink-0 items-start" style={{ marginTop: cqi(s.midTop), gap: cqi(s.midGap) }}>
          {bodyText(s.body.size, s.body.lineHeight, s.body.maxWidth) ?? <div className="flex-1" />}
          <Photo
            layer={photos[0]}
            className="shadow-[0_26px_54px_rgba(20,18,15,0.16)]"
            style={{ width: cqi(s.card.w), height: cqi(s.card.h), flex: "none", marginLeft: "auto" }}
          />
        </div>
        <div className="flex min-h-0 flex-1" style={{ marginTop: cqi(s.pairTop), gap: cqi(L.gap) }}>
          <Photo layer={photos[1]} style={{ flexGrow: 1, flexBasis: 0 }} />
          <Photo layer={photos[2]} style={{ flexGrow: 1, flexBasis: 0 }} />
        </div>
      </>,
      { top: s.padTop, bottom: s.padBottom },
    );
  }

  if (slide === 7) {
    const s = L.s7;
    return container(
      <>
        <div className="flex shrink-0 items-start" style={{ gap: cqi(s.headGap) }}>
          <Headline size={s.headline} />
          <HeaderRight />
        </div>
        <div className="shrink-0" style={{ marginTop: cqi(s.sub.top) }}>
          {bodyText(s.sub.size, s.sub.lineHeight)}
        </div>
        <div className="flex min-h-0 flex-1" style={{ marginTop: cqi(s.pairTop), gap: cqi(L.gap) }}>
          <Photo layer={photos[0]} style={{ flexGrow: s.cols[0], flexBasis: 0 }} />
          <Photo
            layer={photos[1]}
            style={{ flexGrow: s.cols[1], flexBasis: 0, alignSelf: "flex-start", height: `${s.secondHeight * 100}%` }}
          />
        </div>
      </>,
      { top: s.padTop, bottom: s.padBottom },
    );
  }

  // slide 3 — reviews
  const s = L.s3;
  return container(
    <>
      <div className="flex shrink-0 items-start" style={{ gap: cqi(s.headGap) }}>
        <Headline size={s.headline} />
        <Photo layer={photos[0]} style={{ width: cqi(s.thumbW), height: cqi(s.thumbH), flex: "none" }} />
      </div>
      <div
        className="grid min-h-0 flex-1"
        style={{
          marginTop: cqi(s.gridTop),
          gap: cqi(L.gap),
          gridTemplateRows: `${s.rows[0]}fr ${s.rows[1]}fr`,
        }}
      >
        <Photo layer={photos[1]} />
        <div className="grid" style={{ gap: cqi(L.gap), gridTemplateColumns: `${s.pairCols[0]}fr ${s.pairCols[1]}fr` }}>
          <Photo layer={photos[2]} />
          <Photo layer={photos[3]} />
        </div>
      </div>
    </>,
    { top: s.padTop, bottom: s.padBottom },
  );
}

function PortoPreview({
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
  const image = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.kind === "image",
  );
  const eyebrow = layers.find((layer): layer is TextLayer => layer.kind === "eyebrow");
  const caption = layers.find((layer): layer is TextLayer => layer.kind === "header");
  const overview = layers.find((layer): layer is TextLayer => layer.kind === "description");
  const eyebrowStyle = eyebrow ? resolveTextStyle(eyebrow) : null;
  const captionStyle = caption ? resolveTextStyle(caption) : null;
  const overviewStyle = overview ? resolveTextStyle(overview) : null;
  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;

  const captionFont = caption ? fontById(caption.fontId) : null;
  const captionText = caption ? (caption.uppercase ? caption.text.toUpperCase() : caption.text) : "";

  // The name is knocked out of a white band and reveals the photo behind it, so
  // it must be measured against the *real* rendered width of its container —
  // only possible in the browser. Track the wrapper (rows 2+3) box, then fit the
  // name to it (font-agnostic). Seeded 0 so SSR and the first client render agree
  // (no hydration mismatch); both the box and the name size are set after mount.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const measureCtx = useRef<CanvasRenderingContext2D | null>(null);
  // Fitted name font-size plus the font's real glyph metrics (measured, so the
  // band follows the actual text height and any font aligns flush-left).
  const [name, setName] = useState({ size: 0, ascent: 0, left: 0 });
  useEffect(() => {
    if (!caption || !captionFont || !box.w) return;
    let cancelled = false;
    const fit = () => {
      if (cancelled || !captionText.trim()) return;
      if (!measureCtx.current) {
        measureCtx.current = document.createElement("canvas").getContext("2d");
      }
      const ctx = measureCtx.current;
      if (!ctx) return;
      const ref = 100;
      ctx.font = `${captionStyle?.weight ?? 400} ${ref}px ${captionFont.family}`;
      ctx.letterSpacing = `${PORTO_CAPTION_TRACKING}em`;
      const m = ctx.measureText(captionText);
      ctx.letterSpacing = "0px";
      if (m.width > 0) {
        const size = ((box.w * PORTO_CARD.nameFill) / m.width) * ref * (captionStyle?.sizeScale ?? 1);
        const k = size / ref;
        setName({ size, ascent: m.actualBoundingBoxAscent * k, left: m.actualBoundingBoxLeft * k });
      }
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captionText, caption?.fontId, captionStyle?.weight, captionStyle?.sizeScale, box.w]);

  const nameSize = name.size;
  // The name's ink top sits at the wrapper top (baseline = ascent), so the band
  // height follows the real text height — no clipping. Its bottom (baseline)
  // drops a hair into the square; the white band ends there, minus that overlap.
  const baselineY = name.ascent;
  const bandH = Math.max(0, baselineY - nameSize * PORTO_CARD.nameOverlap);
  // Shift by the first glyph's side bearing so the ink is flush-left with the
  // square below (x0 − inkLeft aligns the visible edge to the wrapper's left).
  const nameX = name.left;

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl"
      style={{
        aspectRatio: template.aspectRatio,
        background: "#111111",
        containerType: "inline-size",
      }}
    >
      {/* Full-bleed backdrop — a blurred copy of the photo behind the card. */}
      {image && (
        <img
          src={image.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}

      {/* White poster card: three stacked full-width rows. */}
      <div
        className="absolute flex flex-col"
        style={{
          left: pct(PORTO_LAYOUT.card.x),
          top: pct(PORTO_LAYOUT.card.y),
          width: pct(PORTO_LAYOUT.card.w),
          height: pct(PORTO_LAYOUT.card.h),
          background: template.background,
          boxSizing: "border-box",
          paddingLeft: cqi(PORTO_CARD.padX),
          paddingRight: cqi(PORTO_CARD.padX),
          paddingTop: cqi(PORTO_CARD.padTop),
          paddingBottom: cqi(PORTO_CARD.padBottom),
        }}
      >
        {/* Row 1 — eyebrow (left) + overview (right). */}
        <div className="flex w-full items-start justify-between" style={{ gap: cqi(0.04) }}>
          {eyebrow?.visible && eyebrow.text.trim() && (
            <div
              className="shrink-0"
              style={{
                fontFamily: fontById(eyebrow.fontId).family,
                fontWeight: eyebrowStyle?.weight,
                fontSize: cqi(PORTO_LAYOUT.eyebrow.size),
                lineHeight: 1,
                letterSpacing: "0.025em",
                color: eyebrow.color,
                textTransform: eyebrow.uppercase ? "uppercase" : "none",
              }}
            >
              {eyebrow.text}
            </div>
          )}
          {overview?.visible && overviewStyle && (
            <div
              style={{
                width: `${PORTO_CARD.overviewMaxWidth * 100}%`,
                flexShrink: 0,
                fontFamily: fontById(overview.fontId).family,
                fontWeight: overviewStyle.weight,
                fontSize: cqi(PORTO_LAYOUT.overview.size * overviewStyle.sizeScale),
                lineHeight: PORTO_LAYOUT.overview.lineHeight,
                letterSpacing: `${overviewStyle.letterSpacing}em`,
                color: overview.color,
                textAlign: "left",
              }}
            >
              {overview.text}
            </div>
          )}
        </div>

        {/* Rows 2 + 3 — the image copy sits behind both. Row 2 is the city name,
            a white band knocked out to reveal the image (so the name is filled by
            it and continuous with the square below). Row 3 is the square. */}
        <div ref={wrapperRef} className="relative flex-1" style={{ marginTop: cqi(PORTO_CARD.rowGap) }}>
          {image?.visible && (
            <DraggableImage
              layer={image}
              fit="cover"
              selected={selectedId === image.id}
              onSelect={() => onSelect(image.id)}
              onPan={(offsetX, offsetY) =>
                updateLayer(
                  image.id,
                  { transform: { ...imageTransform(image), offsetX, offsetY } },
                  `pan-${image.id}`,
                )
              }
              style={{ left: 0, top: 0, width: "100%", height: "100%" }}
            />
          )}

          {caption?.visible && captionFont && box.w > 0 && nameSize > 0 && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${box.w} ${box.h}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <mask id="porto-name-cut">
                  {/* white = keep the paper band; black text = punch a hole. The
                      band overscans top/left/right by 2px so no subpixel sliver of
                      the photo peeks out; the bottom stays exactly at the square. */}
                  <rect x={-2} y={-2} width={box.w + 4} height={bandH + 2} fill="#fff" />
                  <text
                    x={nameX}
                    y={baselineY}
                    dominantBaseline="alphabetic"
                    fill="#000"
                    style={{
                      fontFamily: captionFont.family,
                      fontWeight: captionStyle?.weight,
                      fontSize: nameSize,
                      letterSpacing: `${PORTO_CAPTION_TRACKING}em`,
                    }}
                  >
                    {captionText}
                  </text>
                </mask>
              </defs>
              <rect
                x={-2}
                y={-2}
                width={box.w + 4}
                height={bandH + 2}
                fill={template.background}
                mask="url(#porto-name-cut)"
              />
            </svg>
          )}
        </div>
      </div>
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
  posY: number;
  assetId: string;
  assetUrl: string;
}>;

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

// Which edit sections start expanded. Keyed by layer id so moodboard photos
// (which share the "image" kind) each get their own state.
function defaultOpenSections(template: RemixEditorTemplate): Record<string, boolean> {
  if (
    template.layout === "moodboard" ||
    template.layout === "relax" ||
    template.layout === "cover" ||
    template.layout === "verticals"
  ) {
    const open: Record<string, boolean> = {};
    template.layers.forEach((layer, index) => {
      open[layer.id] = layer.kind === "header" || index === 0;
    });
    return open;
  }
  if (template.layout === "porto") {
    return { image: true, eyebrow: false, header: true, description: true };
  }
  if (template.layout === "sliced") {
    return { image: true, background: false, header: true, eyebrow: false, description: false, cta: false };
  }
  if (template.layout === "duel") {
    return {
      "photo-1": true,
      "photo-2": false,
      header: true,
      "option-left": false,
      "option-right": false,
      description: false,
    };
  }
  if (template.layout === "postcard") {
    return { image: true, header: true, eyebrow: false, cta: false };
  }
  if (template.layout === "citymask") {
    return { image: true, header: true, cta: false };
  }
  if (template.layout === "self") {
    return { image: true, header: true };
  }
  if (template.layout === "grid") {
    return {
      background: true,
      "cell-1": false,
      "cell-2": false,
      "cell-3": false,
      header: true,
      eyebrow: false,
      description: false,
      cta: false,
      logo: false,
    };
  }
  return { image: true, header: true, description: false, cta: false, logo: false };
}

function EditorScreen({
  template,
  initialCaption,
  remixId,
  initialLayers,
}: {
  template: RemixEditorTemplate;
  initialCaption?: string;
  // When set, the editor is bound to a saved remix: autosave targets the remix
  // and `initialLayers` (the remix's loaded state) seed the canvas.
  remixId?: string;
  initialLayers?: EditorLayer[];
}) {
  const router = useRouter();

  const [layers, setLayers] = useState<EditorLayer[]>(() => {
    if (initialLayers) return initialLayers;
    const cloned = cloneLayers(template);
    if (initialCaption?.trim()) {
      return cloned.map((layer) =>
        layer.kind === "header" ? { ...layer, text: initialCaption.trim() } : layer,
      );
    }
    return cloned;
  });
  // Re-register any brand fonts referenced by the loaded layers (a remix saved
  // with the Fonts card attached carries `fontId: "brand:<Family>"`). Runs during
  // render so `fontById` resolves the real family on first paint, and injects the
  // font stylesheet. Idempotent; keyed on layers so restored drafts register too.
  useMemo(() => {
    layers.forEach((layer) => {
      if ("fontId" in layer) {
        const family = brandFamilyFromId(layer.fontId);
        if (family) registerBrandFont(family);
      }
    });
  }, [layers]);

  // Snapshot the load-time layers so "reset" reverts to them — the saved remix
  // in remix mode, or the template defaults otherwise — instead of wiping the
  // user's uploaded photo.
  const baselineRef = useRef<EditorLayer[]>(layers);
  const [past, setPast] = useState<EditorLayer[][]>([]);
  const [future, setFuture] = useState<EditorLayer[][]>([]);
  const coalesceRef = useRef<{ key: string; time: number } | null>(null);

  // Autosave: a saved remix is the source of truth when `remixId` is set
  // (persisted via PATCH /remixes/{id}); otherwise fall back to the
  // per-(user,template) file draft, which also hydrates the last session.
  const fileDraft = useEditorDraft(
    template.id,
    layers,
    (saved) => {
      // Backfill template layers added after this draft was saved (e.g. the
      // Porto country eyebrow) so older drafts still expose them.
      setLayers(backfillTemplateLayers(template, saved));
      setPast([]);
      setFuture([]);
    },
    { enabled: !remixId },
  );
  const remixDraft = useRemixDraft(remixId, layers, template);
  const draftStatus = remixId ? remixDraft.status : fileDraft.status;

  const [chatDraft, setChatDraft] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: "assistant-intro",
      role: "assistant",
      text: `I have ${template.title} open. Tell me what you want to refine and I will keep it aligned with the current design.`,
    },
    {
      id: "assistant-context",
      role: "assistant",
      text: "Current edit areas: photos, title, copy, colors, and layout polish.",
    },
  ]);
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
    // Warm every weight (catalog + any brand fonts) so the first weight change
    // doesn't fetch-and-swap the glyphs (the "blink"). Must run *after* the
    // stylesheet parses — `document.fonts.load` no-ops until the @font-face rules
    // exist — so this fires on the link's load event (or immediately if already
    // present). Idempotent.
    const warm = () => preloadEditorFonts([...brandEditorFonts(), ...EDITOR_FONTS]);
    const id = "remix-editor-fonts";
    const existing = document.getElementById(id);
    if (existing) {
      warm();
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = editorFontsHref();
    link.addEventListener("load", warm, { once: true });
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
    if (
      layer &&
      (layer.kind === "header" ||
        layer.kind === "description" ||
        layer.kind === "cta" ||
        layer.kind === "eyebrow")
    ) {
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
    apply(dupLayers(baselineRef.current));
    setOpenSections(defaultOpenSections(template));
    toast.success(
      remixId ? "Reverted to your saved remix." : "Design reset to the template defaults.",
    );
  }

  function cycleSuggestion(layer: TextLayer) {
    if (layer.suggestions.length === 0) return;
    const index = layer.suggestions.findIndex(
      (option) => option.toLowerCase() === layer.text.trim().toLowerCase(),
    );
    const next = layer.suggestions[(index + 1) % layer.suggestions.length];
    updateLayer(layer.id, { text: next });
  }

  // Verticals only: strips are dynamic. Adding clones a template default photo
  // under a fresh id; removing drops the layer. Labels are renumbered so the
  // panel always reads "Photo 1…N" in strip order.
  function renumberPhotos(next: EditorLayer[]): EditorLayer[] {
    let count = 0;
    return next.map((layer) =>
      layer.kind === "image" ? { ...layer, label: `Photo ${++count}` } : layer,
    );
  }

  function addStrip() {
    const count = layers.filter((layer) => layer.kind === "image").length;
    if (count >= VERTICALS_LAYOUT.maxStrips) return;
    let n = count + 1;
    while (layers.some((layer) => layer.id === `photo-${n}`)) n++;
    const defaults = template.layers.filter(
      (layer): layer is ImageLayer => layer.kind === "image",
    );
    const fresh: ImageLayer = {
      id: `photo-${n}`,
      kind: "image",
      label: `Photo ${count + 1}`,
      visible: true,
      hideable: false,
      src: defaults[count % defaults.length]?.src ?? defaults[0].src,
    };
    const lastImage = layers.reduce(
      (last, layer, index) => (layer.kind === "image" ? index : last),
      -1,
    );
    const next = [...layers];
    next.splice(lastImage + 1, 0, fresh);
    apply(renumberPhotos(next));
    setOpenSections((current) => ({ ...current, [fresh.id]: true }));
  }

  function removeStrip(id: string) {
    const count = layers.filter((layer) => layer.kind === "image").length;
    if (count <= VERTICALS_LAYOUT.minStrips) return;
    apply(renumberPhotos(layers.filter((layer) => layer.id !== id)));
  }

  function openReplace(id: string) {
    replaceTargetRef.current = id;
    fileInputRef.current?.click();
  }

  async function handleReplaceFile(file: File) {
    const id = replaceTargetRef.current;
    if (!id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    // Instant local preview — blob URLs are same-origin, so canvas export stays
    // clean even before the upload finishes.
    const url = URL.createObjectURL(file);
    updateLayer(id, { src: url, visible: true }, `replace-${id}`);
    // Persist + attach the new photo to the remix so the swap survives reload.
    // Coalesced into the same undo step as the src change above.
    if (remixId) {
      try {
        const [asset] = await uploadAssetFiles([file]);
        if (asset?.asset_id) {
          // `assetUrl` rides along on the layer so a local (no-backend-row)
          // remix's autosave can rebuild its asset list purely from the saved
          // layers — see `assetsFromLayers`.
          updateLayer(id, { assetId: asset.asset_id, assetUrl: asset.url }, `replace-${id}`);
        }
      } catch {
        toast.error("Couldn't save the new image — it may not persist on reload.");
      }
    }
  }

  function submitChatMessage() {
    const text = chatDraft.trim();
    if (!text) return;
    const now = Date.now();
    setChatMessages((current) => [
      ...current,
      { id: `user-${now}`, role: "user", text },
      {
        id: `assistant-${now}`,
        role: "assistant",
        text: "Got it. I added this to the creative direction for the current edit.",
      },
    ]);
    setChatDraft("");
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
  // Sliced layout carries a second, optional image layer (the full-bleed
  // background) alongside the sliced photo; look it up by id, not kind.
  const slicedBackground = layers.find(
    (layer): layer is Extract<EditorLayer, { kind: "image" }> => layer.id === "background",
  );
  const eyebrow = findByKind<TextLayer>("eyebrow");
  // Duel poll options are looked up by id (they share the eyebrow/cta kinds).
  const duelOptionLeft = layers.find(
    (layer): layer is TextLayer => layer.id === "option-left" && layer.kind !== "image" && layer.kind !== "logo",
  );
  const duelOptionRight = layers.find(
    (layer): layer is TextLayer => layer.id === "option-right" && layer.kind !== "image" && layer.kind !== "logo",
  );
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
        <ShareMenu formats={template.formats} exporting={exporting} onDownload={handleDownload} />
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <EditorChatPanel
          open={chatOpen}
          onOpenChange={setChatOpen}
          messages={chatMessages}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onSubmit={submitChatMessage}
        />

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
              template.layout === "moodboard" ||
                template.layout === "porto" ||
                template.layout === "relax" ||
                template.layout === "cover" ||
                template.layout === "duel" ||
                template.layout === "postcard" ||
                template.layout === "citymask" ||
                template.layout === "self"
                ? "max-w-[300px]"
                : "max-w-[360px]",
              template.layout === "verticals" && "max-w-[420px]",
            )}
            // Tapping anywhere in the preview that isn't an image clears the
            // selection, so the crop outline only shows while an image is
            // actively selected (a `DraggableImage` stops this from firing when
            // the tap lands on it). Prevents the outline sticking around after
            // an incidental tap — common on touch, where a scroll gesture can
            // land on the photo.
            onPointerDown={() => setSelectedImageId(null)}
          >
            {template.layout === "moodboard" ? (
              <MoodboardPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "verticals" ? (
              <VerticalsPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "relax" ? (
              <RelaxPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "porto" ? (
              <PortoPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "cover" ? (
              <CoverPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "split" ? (
              <SplitPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "sliced" ? (
              <SlicedPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "editorial" ? (
              <EditorialPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "collage" ? (
              <CollagePreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "duel" ? (
              <DuelPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "postcard" ? (
              <PostcardPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
                updateLayer={updateLayer}
              />
            ) : template.layout === "citymask" ? (
              <CityMaskPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
              />
            ) : template.layout === "self" ? (
              <SelfPreview
                template={template}
                layers={layers}
                selectedId={selectedImageId}
                onSelect={setSelectedImageId}
              />
            ) : template.layout === "grid" ? (
              <GridPreview
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
        <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-[#0e1413] p-4 lg:h-full lg:min-h-0 lg:w-[440px] lg:border-l-0 lg:border-t-0 lg:p-6">
          <div className="overflow-hidden rounded-[32px] border border-white/5 bg-[#222625] text-foreground shadow-[0_24px_70px_rgba(0,0,0,0.28)] [--background:#222625] [--border:rgba(11,15,15,0.72)] [--foreground:#f0f1ed] [--input:#151819] [--muted-foreground:#a7aba7] [--primary:#c7d36f] [--ring:#c7d36f] [--secondary:#17191b]">
            <div className="flex items-center gap-2 px-6 py-5">
              <SlidersHorizontal className="h-5 w-5 text-foreground" />
              <h2 className="text-lg font-bold text-foreground">Edit creative</h2>
            </div>

            {/* Moodboard / relax / cover / verticals: one replaceable photo per
                panel + the title. */}
            {(template.layout === "moodboard" ||
              template.layout === "relax" ||
              template.layout === "cover" ||
              template.layout === "collage" ||
              template.layout === "verticals") && (
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
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                        Replace photo
                      </button>
                    </div>
                    {template.layout === "verticals" &&
                      photos.length > VERTICALS_LAYOUT.minStrips && (
                        <button
                          type="button"
                          onClick={() => removeStrip(photo.id)}
                          className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold text-foreground transition hover:bg-secondary"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove photo
                        </button>
                      )}
                    <ImageControls
                      layer={photo}
                      onChange={(transform, key) => updateLayer(photo.id, { transform }, key)}
                      onReset={() =>
                        updateLayer(photo.id, { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                      }
                    />
                  </EditorSection>
                ))}

                {template.layout === "verticals" &&
                  photos.length < VERTICALS_LAYOUT.maxStrips && (
                    <div className="border-b border-border px-6 py-4">
                      <button
                        type="button"
                        onClick={addStrip}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Plus className="h-4 w-4 text-[#c7d36f]" />
                        Add photo ({photos.length}/{VERTICALS_LAYOUT.maxStrips})
                      </button>
                    </div>
                  )}

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
                    {template.layout === "verticals" && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted-foreground">
                          <span>Vertical position</span>
                          <span className="tabular-nums">
                            {Math.round(resolveTextStyle(header).posY * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[resolveTextStyle(header).posY]}
                          min={0.05}
                          max={0.95}
                          step={0.01}
                          onValueChange={([value]) =>
                            updateLayer(header.id, { posY: value }, `posy-${header.id}`)
                          }
                        />
                      </div>
                    )}
                    <TextStyleControls
                      layer={header}
                      onChange={(patch, key) => updateLayer(header.id, patch, key)}
                    />
                  </EditorSection>
                )}
              </>
            )}

            {/* Sliced-type poster: photo + optional background + caption + the
                optional date / quote / year. */}
            {template.layout === "sliced" && (
              <>
                {[image, slicedBackground].map((img) =>
                  img ? (
                    <EditorSection
                      key={img.id}
                      title={img.label}
                      open={openSections[img.id] ?? false}
                      onToggleOpen={() => toggleOpen(img.id)}
                      hideable={img.hideable}
                      visible={img.visible}
                      onToggleVisible={() => toggleVisible(img.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-border bg-secondary">
                          {img.src ? (
                            <img src={img.src} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openReplace(img.id)}
                          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                        >
                          <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                          {img.src ? "Replace photo" : "Add photo"}
                        </button>
                      </div>
                      {img.id === "background" && (
                        <p className="mt-3 text-[13px] text-muted-foreground">
                          Optional — toggle the eye to show a full-bleed image behind the design.
                        </p>
                      )}
                      <ImageControls
                        layer={img}
                        onChange={(transform, key) => updateLayer(img.id, { transform }, key)}
                        onReset={() =>
                          updateLayer(img.id, { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                        }
                      />
                    </EditorSection>
                  ) : null,
                )}

                {[
                  { layer: header, title: "Caption", label: "Caption text", multiline: false },
                  { layer: eyebrow, title: "Date", label: "Date text", multiline: false },
                  { layer: description, title: "Quote", label: "Quote text", multiline: true },
                  { layer: cta, title: "Year", label: "Year text", multiline: false },
                ].map(({ layer, title, label, multiline }) =>
                  layer ? (
                    <EditorSection
                      key={layer.id}
                      title={title}
                      open={openSections[layer.id] ?? false}
                      onToggleOpen={() => toggleOpen(layer.id)}
                      hideable={layer.hideable}
                      visible={layer.visible}
                      onToggleVisible={() => toggleVisible(layer.id)}
                    >
                      <TextField
                        label={label}
                        value={layer.text}
                        multiline={multiline}
                        onChange={(value) => updateLayer(layer.id, { text: value }, `${layer.id}-text`)}
                        onSuggest={() => cycleSuggestion(layer)}
                      />
                      <div className="mt-4">
                        <FontDropdown
                          value={layer.fontId}
                          color={layer.color}
                          onChange={(fontId) => changeFont(layer.id, fontId)}
                        />
                      </div>
                      <div className="mt-4">
                        <ColorSwatches
                          palette={template.palette}
                          value={layer.color}
                          onChange={(hex) => updateLayer(layer.id, { color: hex })}
                        />
                      </div>
                    </EditorSection>
                  ) : null,
                )}
              </>
            )}

            {/* This-or-That poll: two photos, the caption, the optional Left/Right
                options and the optional wordmark. */}
            {template.layout === "duel" && (
              <>
                {photos.slice(0, 2).map((photo) => (
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
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Wand2 className="h-4 w-4 text-[#c7d36f]" />
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
                    title="Caption"
                    open={openSections.header ?? true}
                    onToggleOpen={() => toggleOpen("header")}
                    hideable={header.hideable}
                    visible={header.visible}
                    onToggleVisible={() => toggleVisible("header")}
                  >
                    <TextField
                      label="Caption text"
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
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted-foreground">
                        <span>Vertical position</span>
                        <span className="tabular-nums">
                          {Math.round(resolveTextStyle(header).posY * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[resolveTextStyle(header).posY]}
                        min={0.05}
                        max={0.95}
                        step={0.01}
                        onValueChange={([value]) =>
                          updateLayer("header", { posY: value }, "posy-header")
                        }
                      />
                    </div>
                    <TextStyleControls
                      layer={header}
                      onChange={(patch, key) => updateLayer("header", patch, key)}
                    />
                  </EditorSection>
                )}

                {[
                  { layer: duelOptionLeft, title: "Left option", label: "Left option text" },
                  { layer: duelOptionRight, title: "Right option", label: "Right option text" },
                  { layer: description, title: "Wordmark", label: "Wordmark text" },
                ].map(({ layer, title, label }) =>
                  layer ? (
                    <EditorSection
                      key={layer.id}
                      title={title}
                      open={openSections[layer.id] ?? false}
                      onToggleOpen={() => toggleOpen(layer.id)}
                      hideable={layer.hideable}
                      visible={layer.visible}
                      onToggleVisible={() => toggleVisible(layer.id)}
                    >
                      <TextField
                        label={label}
                        value={layer.text}
                        onChange={(value) => updateLayer(layer.id, { text: value }, `${layer.id}-text`)}
                        onSuggest={() => cycleSuggestion(layer)}
                      />
                      <div className="mt-4">
                        <FontDropdown
                          value={layer.fontId}
                          color={layer.color}
                          onChange={(fontId) => changeFont(layer.id, fontId)}
                        />
                      </div>
                      <div className="mt-4">
                        <ColorSwatches
                          palette={template.palette}
                          value={layer.color}
                          onChange={(hex) => updateLayer(layer.id, { color: hex })}
                        />
                      </div>
                      <TextStyleControls
                        layer={layer}
                        onChange={(patch, key) => updateLayer(layer.id, patch, key)}
                      />
                    </EditorSection>
                  ) : null,
                )}
              </>
            )}

            {/* City postcard: the photo, the giant city name, the optional
                subtitle and the optional country label. */}
            {template.layout === "postcard" && (
              <>
                {image && (
                  <EditorSection
                    title={image.label}
                    open={openSections.image ?? true}
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
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                        Replace photo
                      </button>
                    </div>
                    <ImageControls
                      layer={image}
                      onChange={(transform, key) => updateLayer("image", { transform }, key)}
                      onReset={() =>
                        updateLayer("image", { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                      }
                    />
                  </EditorSection>
                )}

                {[
                  { layer: header, title: "City", label: "City name" },
                  { layer: eyebrow, title: "Subtitle", label: "Subtitle text" },
                  { layer: cta, title: "Country", label: "Country text" },
                ].map(({ layer, title, label }) =>
                  layer ? (
                    <EditorSection
                      key={layer.id}
                      title={title}
                      open={openSections[layer.id] ?? layer.id === "header"}
                      onToggleOpen={() => toggleOpen(layer.id)}
                      hideable={layer.hideable}
                      visible={layer.visible}
                      onToggleVisible={() => toggleVisible(layer.id)}
                    >
                      <TextField
                        label={label}
                        value={layer.text}
                        onChange={(value) => updateLayer(layer.id, { text: value }, `${layer.id}-text`)}
                        onSuggest={() => cycleSuggestion(layer)}
                      />
                      <div className="mt-4">
                        <FontDropdown
                          value={layer.fontId}
                          color={layer.color}
                          onChange={(fontId) => changeFont(layer.id, fontId)}
                        />
                      </div>
                      <div className="mt-4">
                        <ColorSwatches
                          palette={template.palette}
                          value={layer.color}
                          onChange={(hex) => updateLayer(layer.id, { color: hex })}
                        />
                      </div>
                      <TextStyleControls
                        layer={layer}
                        onChange={(patch, key) => updateLayer(layer.id, patch, key)}
                      />
                    </EditorSection>
                  ) : null,
                )}
              </>
            )}

            {/* City text mask: the photo (revealed through the letters), the
                giant city name and the optional country label + flag. */}
            {template.layout === "citymask" && (
              <>
                {image && (
                  <EditorSection
                    title={image.label}
                    open={openSections.image ?? true}
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
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                        Replace photo
                      </button>
                    </div>
                    <ImageControls
                      layer={image}
                      onChange={(transform, key) => updateLayer("image", { transform }, key)}
                      onReset={() =>
                        updateLayer("image", { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                      }
                    />
                  </EditorSection>
                )}

                {[
                  { layer: header, title: "City", label: "City name" },
                  { layer: cta, title: "Country", label: "Country text" },
                ].map(({ layer, title, label }) =>
                  layer ? (
                    <EditorSection
                      key={layer.id}
                      title={title}
                      open={openSections[layer.id] ?? layer.id === "header"}
                      onToggleOpen={() => toggleOpen(layer.id)}
                      hideable={layer.hideable}
                      visible={layer.visible}
                      onToggleVisible={() => toggleVisible(layer.id)}
                    >
                      <TextField
                        label={label}
                        value={layer.text}
                        onChange={(value) => updateLayer(layer.id, { text: value }, `${layer.id}-text`)}
                        onSuggest={() => cycleSuggestion(layer)}
                      />
                      <div className="mt-4">
                        <FontDropdown
                          value={layer.fontId}
                          color={layer.color}
                          onChange={(fontId) => changeFont(layer.id, fontId)}
                        />
                      </div>
                      {layer.id === "cta" && (
                        <div className="mt-4">
                          <ColorSwatches
                            palette={template.palette}
                            value={layer.color}
                            onChange={(hex) => updateLayer(layer.id, { color: hex })}
                          />
                        </div>
                      )}
                      <TextStyleControls
                        layer={layer}
                        onChange={(patch, key) => updateLayer(layer.id, patch, key)}
                      />
                    </EditorSection>
                  ) : null,
                )}
              </>
            )}

            {/* Self split portrait: the photo (revealed through the left panel
                and the stacked letters) and the giant caption. */}
            {template.layout === "self" && (
              <>
                {image && (
                  <EditorSection
                    title={image.label}
                    open={openSections.image ?? true}
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
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                        Replace photo
                      </button>
                    </div>
                    <ImageControls
                      layer={image}
                      onChange={(transform, key) => updateLayer("image", { transform }, key)}
                      onReset={() =>
                        updateLayer("image", { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                      }
                    />
                  </EditorSection>
                )}

                {header && (
                  <EditorSection
                    title="Caption"
                    open={openSections.header ?? true}
                    onToggleOpen={() => toggleOpen("header")}
                    hideable={header.hideable}
                    visible={header.visible}
                    onToggleVisible={() => toggleVisible("header")}
                  >
                    <TextField
                      label="Caption text"
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
                    {/* Letters are stretched to fill a fixed-width cell, so only
                        weight (the glyph's stroke thickness) reads visually —
                        size/spacing/alignment from TextStyleControls wouldn't
                        change anything here. */}
                    {fontById(header.fontId).weights.length > 1 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[13px] font-medium text-muted-foreground">Weight</p>
                        <div className="flex flex-wrap gap-2">
                          {fontById(header.fontId).weights.map((w) => {
                            const active = resolveTextStyle(header).weight === w;
                            return (
                              <button
                                key={w}
                                type="button"
                                aria-pressed={active}
                                onClick={() => updateLayer("header", { weight: w })}
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
                  </EditorSection>
                )}
              </>
            )}

            {/* Mono Grid: the background photo, up to 3 cell photos, the caption
                (headline + hashtag) and the rotated side text (title + hashtag).
                The logo uses the shared Logo section below. */}
            {template.layout === "grid" && (
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
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-border bg-secondary">
                        {photo.src ? (
                          <img src={photo.src} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openReplace(photo.id)}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                      >
                        <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                        {photo.src ? "Replace photo" : "Add photo"}
                      </button>
                    </div>
                    {photo.id !== "background" && (
                      <p className="mt-3 text-[13px] text-muted-foreground">
                        Optional — toggle the eye to show the background through this cell.
                      </p>
                    )}
                    <ImageControls
                      layer={photo}
                      onChange={(transform, key) => updateLayer(photo.id, { transform }, key)}
                      onReset={() =>
                        updateLayer(photo.id, { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                      }
                    />
                  </EditorSection>
                ))}

                {[
                  {
                    layer: header,
                    title: "Caption",
                    label: "Caption text",
                    multiline: true,
                  },
                  { layer: eyebrow, title: "Caption tag", label: "Caption tag text", multiline: false },
                  { layer: description, title: "Side title", label: "Side title text", multiline: false },
                  { layer: cta, title: "Side tag", label: "Side tag text", multiline: false },
                ].map(({ layer, title, label, multiline }) =>
                  layer ? (
                    <EditorSection
                      key={layer.id}
                      title={title}
                      open={openSections[layer.id] ?? false}
                      onToggleOpen={() => toggleOpen(layer.id)}
                      hideable={layer.hideable}
                      visible={layer.visible}
                      onToggleVisible={() => toggleVisible(layer.id)}
                    >
                      <TextField
                        label={label}
                        value={layer.text}
                        multiline={multiline}
                        onChange={(value) => updateLayer(layer.id, { text: value }, `${layer.id}-text`)}
                        onSuggest={() => cycleSuggestion(layer)}
                      />
                      <div className="mt-4">
                        <FontDropdown
                          value={layer.fontId}
                          color={layer.color}
                          onChange={(fontId) => changeFont(layer.id, fontId)}
                        />
                      </div>
                      <div className="mt-4">
                        <ColorSwatches
                          palette={template.palette}
                          value={layer.color}
                          onChange={(hex) => updateLayer(layer.id, { color: hex })}
                        />
                      </div>
                      <TextStyleControls
                        layer={layer}
                        onChange={(patch, key) => updateLayer(layer.id, patch, key)}
                      />
                    </EditorSection>
                  ) : null,
                )}
              </>
            )}

            {/* Image */}
            {template.layout !== "moodboard" &&
              template.layout !== "relax" &&
              template.layout !== "cover" &&
              template.layout !== "verticals" &&
              template.layout !== "collage" &&
              template.layout !== "sliced" &&
              template.layout !== "duel" &&
              template.layout !== "postcard" &&
              template.layout !== "citymask" &&
              template.layout !== "self" &&
              template.layout !== "grid" &&
              image && (
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
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                  >
                    <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                    Edit image
                  </button>
                </div>
                <ImageControls
                  layer={image}
                  onChange={(transform, key) => updateLayer("image", { transform }, key)}
                  onReset={() =>
                    updateLayer("image", { transform: { ...DEFAULT_IMAGE_TRANSFORM } })
                  }
                />
              </EditorSection>
            )}

            {/* Eyebrow (porto country label / collage brand wordmark) */}
            {(template.layout === "porto" || template.layout === "collage") && eyebrow && (
              <EditorSection
                title={template.layout === "collage" ? "Brand" : "Country"}
                open={openSections.eyebrow}
                onToggleOpen={() => toggleOpen("eyebrow")}
                hideable={eyebrow.hideable}
                visible={eyebrow.visible}
                onToggleVisible={() => toggleVisible("eyebrow")}
              >
                <TextField
                  label={template.layout === "collage" ? "Brand text" : "Country text"}
                  value={eyebrow.text}
                  onChange={(value) => updateLayer("eyebrow", { text: value }, "eyebrow-text")}
                  onSuggest={() => cycleSuggestion(eyebrow)}
                />
                <div className="mt-4">
                  <FontDropdown
                    value={eyebrow.fontId}
                    color={eyebrow.color}
                    onChange={(fontId) => changeFont("eyebrow", fontId)}
                  />
                </div>
                <div className="mt-4">
                  <ColorSwatches
                    palette={template.palette}
                    value={eyebrow.color}
                    onChange={(hex) => updateLayer("eyebrow", { color: hex })}
                  />
                </div>
              </EditorSection>
            )}

            {/* Header */}
            {template.layout !== "moodboard" &&
              template.layout !== "relax" &&
              template.layout !== "cover" &&
              template.layout !== "verticals" &&
              template.layout !== "collage" &&
              template.layout !== "sliced" &&
              template.layout !== "duel" &&
              template.layout !== "postcard" &&
              template.layout !== "citymask" &&
              template.layout !== "self" &&
              template.layout !== "grid" &&
              header && (
              <EditorSection
                title={template.layout === "porto" ? "Caption" : "Header"}
                open={openSections.header}
                onToggleOpen={() => toggleOpen("header")}
                hideable={header.hideable}
                visible={header.visible}
                onToggleVisible={() => toggleVisible("header")}
              >
                <TextField
                  label={template.layout === "porto" ? "Caption text" : "Header text"}
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
            {template.layout !== "sliced" &&
              template.layout !== "duel" &&
              template.layout !== "postcard" &&
              template.layout !== "citymask" &&
              template.layout !== "self" &&
              template.layout !== "grid" &&
              description && (
              <EditorSection
                title={
                  template.layout === "porto"
                    ? "City overview"
                    : template.layout === "relax"
                      ? "Subcaption"
                      : "Description"
                }
                open={openSections.description}
                onToggleOpen={() => toggleOpen("description")}
                hideable={description.hideable}
                visible={description.visible}
                onToggleVisible={() => toggleVisible("description")}
              >
                <TextField
                  label={
                    template.layout === "porto"
                      ? "City overview text"
                      : template.layout === "relax"
                        ? "Subcaption text"
                        : "Description text"
                  }
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
            {template.layout !== "sliced" &&
              template.layout !== "duel" &&
              template.layout !== "postcard" &&
              template.layout !== "citymask" &&
              template.layout !== "self" &&
              template.layout !== "grid" &&
              cta && (
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
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:brightness-110"
                  >
                    <Wand2 className="h-4 w-4 text-[#c7d36f]" />
                    Replace logo
                  </button>
                </div>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Toggle the eye to show your logo on the creative.
                </p>
              </EditorSection>
            )}
          </div>
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
  const isDefault = t.offsetX === 0 && t.offsetY === 0 && t.scale === 1 && t.rotation === 0;
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

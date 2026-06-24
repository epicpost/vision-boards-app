import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Flag,
  Loader2,
  Redo2,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Undo2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  cloneLayers,
  editorFontsHref,
  EDITOR_FONTS,
  fontById,
  getRemixEditorTemplate,
  isLightColor,
  LAYOUT,
  readableTextColor,
  type EditorColor,
  type EditorLayer,
  type LayerKind,
  type RemixEditorTemplate,
  type TextLayer,
} from "@/lib/remix-editor";
import { exportCreativePng } from "@/lib/remix-editor-export";

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

function CreativePreview({
  template,
  layers,
}: {
  template: RemixEditorTemplate;
  layers: EditorLayer[];
}) {
  const find = <T extends EditorLayer>(id: LayerKind) =>
    layers.find((layer) => layer.id === id) as T | undefined;
  const image = find<Extract<EditorLayer, { id: "image" }>>("image");
  const header = find<TextLayer>("header");
  const description = find<TextLayer>("description");
  const cta = find<TextLayer>("cta");
  const logo = find<Extract<EditorLayer, { id: "logo" }>>("logo");

  const pct = (value: number) => `${value * 100}%`;
  const cqi = (value: number) => `${value * 100}cqi`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] shadow-2xl"
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

      {header?.visible && (
        <div
          className="absolute text-center"
          style={{
            left: pct(LAYOUT.padX),
            right: pct(LAYOUT.padX),
            top: pct(LAYOUT.header.top),
            fontFamily: fontById(header.fontId).family,
            fontWeight: LAYOUT.header.weight,
            fontSize: cqi(LAYOUT.header.size),
            lineHeight: LAYOUT.header.lineHeight,
            color: header.color,
            textTransform: header.uppercase ? "uppercase" : "none",
          }}
        >
          {header.text}
        </div>
      )}

      {description?.visible && (
        <div
          className="absolute text-center"
          style={{
            left: pct(LAYOUT.padX),
            right: pct(LAYOUT.padX),
            top: pct(LAYOUT.description.top),
            fontFamily: fontById(description.fontId).family,
            fontWeight: LAYOUT.description.weight,
            fontSize: cqi(LAYOUT.description.size),
            lineHeight: LAYOUT.description.lineHeight,
            color: description.color,
            textTransform: description.uppercase ? "uppercase" : "none",
          }}
        >
          {description.text}
        </div>
      )}

      {cta?.visible && cta.text.trim() && (
        <div
          className="absolute flex -translate-x-1/2 items-center whitespace-nowrap rounded-full"
          style={{
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
            textTransform: cta.uppercase ? "uppercase" : "none",
          }}
        >
          {cta.text}
        </div>
      )}

      {image?.visible && (
        <img
          src={image.src}
          alt=""
          className="absolute rounded-[12px] object-contain"
          style={{
            left: pct(LAYOUT.padX),
            right: pct(LAYOUT.padX),
            top: pct(LAYOUT.image.top),
            bottom: pct(1 - LAYOUT.image.bottom),
            width: "auto",
            height: "auto",
            maxWidth: pct(1 - 2 * LAYOUT.padX),
            margin: "0 auto",
          }}
        />
      )}
    </div>
  );
}

// ── editor screen ────────────────────────────────────────────────────────────

type LayerPatch = Partial<{
  label: string;
  visible: boolean;
  hideable: boolean;
  src: string;
  text: string;
  color: string;
  fontId: string;
  uppercase: boolean;
  suggestions: string[];
}>;

const DEFAULT_OPEN: Record<LayerKind, boolean> = {
  image: true,
  header: true,
  description: false,
  cta: false,
  logo: false,
};

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
        layer.id === "header" ? { ...layer, text: initialCaption.trim() } : layer,
      );
    }
    return cloned;
  });
  const [past, setPast] = useState<EditorLayer[][]>([]);
  const [future, setFuture] = useState<EditorLayer[][]>([]);
  const coalesceRef = useRef<{ key: string; time: number } | null>(null);

  const [openSections, setOpenSections] = useState<Record<LayerKind, boolean>>(DEFAULT_OPEN);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const [flagged, setFlagged] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<LayerKind | null>(null);

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

  function updateLayer(id: LayerKind, patch: LayerPatch, coalesceKey?: string) {
    apply(
      layers.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as EditorLayer) : layer)),
      coalesceKey,
    );
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
        layer.id === "header" && initialCaption?.trim()
          ? { ...layer, text: initialCaption.trim() }
          : layer,
      ),
    );
    setOpenSections(DEFAULT_OPEN);
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

  function openReplace(id: LayerKind) {
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

  async function handleDownload() {
    try {
      setExporting(true);
      const blob = await exportCreativePng(template, layers);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `epicpost-${template.id}.png`;
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

  const find = <T extends EditorLayer>(id: LayerKind) =>
    layers.find((layer) => layer.id === id) as T | undefined;
  const image = find<Extract<EditorLayer, { id: "image" }>>("image");
  const header = find<TextLayer>("header");
  const description = find<TextLayer>("description");
  const cta = find<TextLayer>("cta");
  const logo = find<Extract<EditorLayer, { id: "logo" }>>("logo");

  const toggleOpen = (id: LayerKind) =>
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  const isVisible = (id: LayerKind) => layers.find((layer) => layer.id === id)?.visible ?? false;
  const toggleVisible = (id: LayerKind) =>
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
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight text-foreground">
              {template.title}
            </p>
            <p className="text-xs text-muted-foreground">Edit creative</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={exporting}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          Download
        </button>
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Canvas stage — fixed to the viewport on desktop; scrolls only if the
            preview itself is taller than the stage, never resized by the panel. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-[#0e1413] px-4 py-8 lg:min-h-0 lg:overflow-y-auto lg:py-10">
          {/* Preview toolbar */}
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80">
            <button
              type="button"
              aria-label="Previous"
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-full opacity-40"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <span className="text-sm font-medium tabular-nums">1 / 1</span>
            <button
              type="button"
              aria-label="Next"
              disabled
              className="flex h-7 w-7 items-center justify-center rounded-full opacity-40"
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
                "flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10",
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
                "flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10",
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
                "flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10",
                flagged && "text-amber-400",
              )}
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          <div className="w-full max-w-[360px]">
            <CreativePreview template={template} layers={layers} />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Undo"
              onClick={undo}
              disabled={past.length === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Redo"
              onClick={redo}
              disabled={future.length === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Redo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={resetDesign}
              className="flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-[15px] font-semibold text-white transition hover:bg-white/20"
            >
              <Wand2 className="h-4 w-4" />
              Fix design
            </button>
            <button
              type="button"
              aria-label="Download"
              onClick={handleDownload}
              disabled={exporting}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
            >
              {exporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Edit panel */}
        <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-background px-5 pb-12 lg:h-full lg:min-h-0 lg:w-[400px] lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 py-5">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Edit creative</h2>
          </div>

          {/* Image */}
          {image && (
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
            </EditorSection>
          )}

          {/* Header */}
          {header && (
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
                  onChange={(fontId) => updateLayer("header", { fontId })}
                />
              </div>
              <div className="mt-4">
                <ColorSwatches
                  palette={template.palette}
                  value={header.color}
                  onChange={(hex) => updateLayer("header", { color: hex })}
                />
              </div>
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
                  onChange={(fontId) => updateLayer("description", { fontId })}
                />
              </div>
              <div className="mt-4">
                <ColorSwatches
                  palette={template.palette}
                  value={description.color}
                  onChange={(hex) => updateLayer("description", { color: hex })}
                />
              </div>
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
    <div className="relative rounded-[14px] border border-border bg-secondary/60 px-4 pb-3 pt-2 focus-within:border-foreground/40">
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

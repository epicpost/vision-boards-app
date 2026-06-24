import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter, d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav, P as Popover, a as PopoverTrigger, b as PopoverContent } from "./MobileNav-JTGfX7W-.mjs";
import { T as TemplateCard } from "./TemplateCard-DEpu7ADN.mjs";
import { o as Route$2, g as getAccessToken, j as getTemplateMedia, S as SignupDialog, q as postTemplateQueryKey, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, e as DialogDescription, c as cn, m as fetchPostTemplates, t as fetchPostTemplate } from "./router-Bd-4THC9.mjs";
import { C as CreateBoardDialog } from "./CreateBoardDialog-Bl7p3N_5.mjs";
import { B as Button, C as COLOR_TYPES, f as COLOR_TYPE_LABELS, j as fetchBrandKits, b as brandKitsQueryKey } from "./brand-kit-Cry52ijx.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-CqiGz96I.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { u as uploadAssetFiles, a as remixTemplate, b as remixTemplateUpload, w as waitForGeneration, r as remixesQueryKey } from "./generations-D2XE-T3o.mjs";
import { h as hasRemixEditorTemplate } from "./remix-editor-xQNVkEye.mjs";
import { s as saveTemplateToBoard, u as unsaveTemplateFromBoard, f as fetchBoards, b as boardsQueryKey } from "./boards-BOmeqqUF.mjs";
import { l as likedTemplatesQueryKey, a as likeTemplate, u as unlikeTemplate } from "./likes-BR5Zeahr.mjs";
import { m as Link2, p as MessageCircle, F as Facebook, q as Twitter, A as ArrowLeft, r as Maximize2, s as ChevronLeft, h as ChevronRight, t as Heart, l as Upload, g as Ellipsis, u as Smile, v as Sticker, n as Image$1, X, b as Plus, j as Minus, S as Search, w as Ratio, x as FileTypeCorner, y as Captions, z as Music, G as Clapperboard, J as Type, k as LoaderCircle, K as ArrowUp, N as CloudUpload, E as ExternalLink, O as Pencil, D as Download, e as Check, o as Lock, Q as Film, W as Crop, Y as Sparkles } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
function formatMime(mime) {
  const sub = mime.split("/")[1] ?? mime;
  const base = sub.split("+")[0];
  return (base === "jpeg" ? "jpg" : base).toUpperCase();
}
function formatLabel(format) {
  return (format === "jpeg" ? "jpg" : format).toUpperCase();
}
function countRange(min, max) {
  return min === max ? `${min}` : `${min}–${max}`;
}
function RequiredBadge({ required }) {
  return required ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "h-5 px-2 text-[11px]", children: "Required" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "h-5 px-2 text-[11px]", children: "Optional" });
}
function Chip({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground", children });
}
function Section({
  icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-[10px] bg-secondary text-foreground", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-foreground", children: title })
    ] }),
    children
  ] });
}
function AssetRow({ asset }) {
  const isVideo = asset.type === "video";
  const formats = asset.accepted_mime_types.map(formatMime);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[14px] border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-sm font-semibold text-foreground", children: [
        isVideo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "h-4 w-4 text-muted-foreground" }),
        asset.description ?? asset.key.replace(/_/g, " ")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RequiredBadge, { required: asset.required })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        countRange(asset.min_count, asset.max_count),
        " ",
        asset.type,
        asset.max_count > 1 ? "s" : ""
      ] }),
      formats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: formats.join(" · ") }),
      asset.preferred_aspect_ratios.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: asset.preferred_aspect_ratios.join(" · ") }),
      asset.min_width && asset.min_height ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        "min ",
        asset.min_width,
        "×",
        asset.min_height
      ] }) : null,
      asset.transparent_preferred && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: "transparent" }),
      asset.allow_crop && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crop, { className: "h-3.5 w-3.5" }),
        " crop ok"
      ] })
    ] })
  ] });
}
function TextRow({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[14px] border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-sm font-semibold text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "h-4 w-4 text-muted-foreground" }),
        text.label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RequiredBadge, { required: text.required })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
      text.max_chars != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        "max ",
        text.max_chars,
        " chars"
      ] }),
      text.recommended_chars != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        "~",
        text.recommended_chars,
        " ideal"
      ] }),
      text.ai_can_generate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
        " AI can write"
      ] }),
      text.allowed_values.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        text.allowed_values.length,
        " presets"
      ] })
    ] })
  ] });
}
function TemplateRequirements({ template }) {
  const input = template.input_requirements;
  const image = template.output_spec;
  const video = template.video_output_spec;
  const videoReq = template.video_requirements;
  const assets = input?.assets ?? [];
  const texts = input?.text_requirements ?? [];
  const aspectRatios = image?.supported_aspect_ratios ?? video?.supported_aspect_ratios ?? [];
  const formats = (image?.supported_formats ?? video?.supported_formats ?? []).map(formatLabel);
  if (!input && !image && !video) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 space-y-6", children: [
    (aspectRatios.length > 0 || formats.length > 0 || video) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileTypeCorner, { className: "h-4 w-4" }), title: "Output", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
        aspectRatios.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[14px] border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ratio, { className: "h-3.5 w-3.5" }),
            " Aspect ratios"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: aspectRatios.map((ratio) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: ratio }, ratio)) })
        ] }),
        formats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[14px] border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileTypeCorner, { className: "h-3.5 w-3.5" }),
            " File formats"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: formats.map((format) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: format }, format)) })
        ] })
      ] }),
      video && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
          video.duration_min_seconds,
          "–",
          video.duration_max_seconds,
          "s"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
          video.fps,
          " fps"
        ] }),
        video.has_captions && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Captions, { className: "h-3.5 w-3.5" }),
          " captions"
        ] }),
        video.has_music_slot && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-3.5 w-3.5" }),
          " music"
        ] })
      ] })
    ] }),
    assets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "h-4 w-4" }), title: "Assets", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: assets.map((asset) => /* @__PURE__ */ jsxRuntimeExports.jsx(AssetRow, { asset }, asset.key)) }) }),
    videoReq && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clapperboard, { className: "h-4 w-4" }), title: "Video clips", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        countRange(videoReq.clips_min, videoReq.clips_max),
        " clips"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Chip, { children: [
        videoReq.clip_duration_min_seconds,
        "–",
        videoReq.clip_duration_max_seconds,
        "s each"
      ] }),
      videoReq.requires_audio && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: "audio required" }),
      videoReq.supports_subtitles && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Captions, { className: "h-3.5 w-3.5" }),
        " subtitles"
      ] })
    ] }) }),
    texts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "h-4 w-4" }), title: "Text", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: texts.map((text) => /* @__PURE__ */ jsxRuntimeExports.jsx(TextRow, { text }, text.key)) }) })
  ] });
}
const FALLBACK_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const FALLBACK_MAX_IMAGES = 10;
function formatCreatedAt(createdAt) {
  if (!createdAt) return "";
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "";
  const diffMs = Date.now() - created;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 6e4));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 31) return `${Math.floor(diffDays / 7)}w`;
  return `${Math.floor(diffDays / 30)}mo`;
}
function RemixComposer({
  template,
  onRequireAuth
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const imageRequirements = template.input_requirements?.assets.filter((asset) => asset.type === "image") ?? [];
  const imageRequirement = imageRequirements[0];
  const captionRequirement = template.input_requirements?.text_requirements.find((text) => text.visible_on_asset) ?? template.input_requirements?.text_requirements[0];
  const requiresLogo = template.input_requirements?.assets.some((asset) => asset.type === "logo") ?? template.output_spec?.contains_branding_slot ?? false;
  const requiresText = Boolean(captionRequirement);
  const minImages = imageRequirements.length ? Math.max(
    1,
    imageRequirements.reduce((sum, asset) => sum + asset.min_count, 0)
  ) : Math.max(1, template.input_image_count ?? 1);
  const maxImages = imageRequirements.length ? Math.max(
    minImages,
    imageRequirements.reduce((sum, asset) => sum + asset.max_count, 0)
  ) : Math.max(minImages, FALLBACK_MAX_IMAGES);
  const acceptedTypes = imageRequirement?.accepted_mime_types.length ? imageRequirement.accepted_mime_types : FALLBACK_ACCEPTED_TYPES;
  const maxChars = captionRequirement?.max_chars ?? null;
  const [images, setImages] = reactExports.useState([]);
  const [caption, setCaption] = reactExports.useState("");
  const [phase, setPhase] = reactExports.useState("idle");
  const [result, setResult] = reactExports.useState(null);
  const [isResultOpen, setIsResultOpen] = reactExports.useState(false);
  const [isPickerOpen, setIsPickerOpen] = reactExports.useState(false);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [logoRemoved, setLogoRemoved] = reactExports.useState(false);
  const [fontsRemoved, setFontsRemoved] = reactExports.useState(false);
  const [captionColor, setCaptionColor] = reactExports.useState(null);
  const [colorRemoved, setColorRemoved] = reactExports.useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const brandKitsQuery = useQuery({
    queryKey: brandKitsQueryKey(),
    queryFn: fetchBrandKits,
    enabled: (requiresLogo || requiresText || isPickerOpen) && Boolean(getAccessToken())
  });
  const brandImages = (brandKitsQuery.data ?? []).flatMap((kit) => kit.images);
  const brandKit = brandKitsQuery.data?.[0] ?? null;
  const brandLogoUrl = brandKit?.logo_preview_url ?? brandKit?.logo_url ?? null;
  const brandPrimaryFont = brandKit?.font_family ?? null;
  const brandSecondaryFont = brandKit?.secondary_font_family ?? null;
  const showLogoCard = requiresLogo && Boolean(brandLogoUrl) && !logoRemoved;
  const showFontsCard = requiresText && Boolean(brandPrimaryFont) && !fontsRemoved;
  const selectedFontId = showFontsCard ? brandKit?.font_id ?? void 0 : void 0;
  const renderDefaults = template.agent_hints?.render_defaults ?? null;
  const defaultCaptionColor = renderDefaults?.caption_color ?? null;
  const templateColorOptions = renderDefaults?.caption_color_options ?? [];
  const templateColorValues = new Set(templateColorOptions.map((o) => o.value.toLowerCase()));
  const brandColorOptions = COLOR_TYPES.flatMap((type) => {
    const value = brandKit?.colors?.[type];
    return value && !templateColorValues.has(value.toLowerCase()) ? [{ label: COLOR_TYPE_LABELS[type], value }] : [];
  });
  const captionColorOptions = [...templateColorOptions, ...brandColorOptions];
  const supportsCaptionColor = requiresText && (captionColorOptions.length > 0 || Boolean(defaultCaptionColor));
  const showColorCard = supportsCaptionColor && !colorRemoved;
  const selectedCaptionColor = showColorCard ? captionColor ?? defaultCaptionColor ?? void 0 : void 0;
  const previewUrlsRef = reactExports.useRef([]);
  previewUrlsRef.current = images.map((image) => image.previewUrl);
  reactExports.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);
  reactExports.useEffect(() => {
    if (!showFontsCard || typeof document === "undefined") return;
    const families = [brandPrimaryFont, brandSecondaryFont].filter((font) => Boolean(font)).map((font) => `family=${font.trim().replace(/\s+/g, "+")}`).join("&");
    if (!families) return;
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    const id = "remix-brand-fonts";
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.href !== href) existing.href = href;
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [showFontsCard, brandPrimaryFont, brandSecondaryFont]);
  const isBusy = phase !== "idle";
  const captionMissing = Boolean(captionRequirement?.required) && !caption.trim();
  const canSend = images.length >= minImages && !captionMissing && !isBusy;
  const output = result?.assets[0] ?? null;
  const canEdit = hasRemixEditorTemplate(template.id);
  if (template.capabilities && !template.capabilities.supports_remix) return null;
  const hint = isBusy ? phase === "sending" ? "Sending images..." : "Generating your remix..." : images.length < minImages ? `Attach ${minImages - images.length} more image${minImages - images.length > 1 ? "s" : ""} to remix` : captionMissing ? "Add a caption to remix" : "Ready — send to generate your remix";
  function addFiles(fileList) {
    const files = Array.from(fileList);
    const incoming = files.filter((file) => acceptedTypes.includes(file.type));
    if (incoming.length < files.length) {
      toast.error("Some files were skipped — only PNG, JPG or WebP images are supported.");
    }
    const room = maxImages - images.length;
    if (room <= 0 || incoming.length > room) {
      toast.error(`This template uses at most ${maxImages} images.`);
    }
    const accepted = incoming.slice(0, Math.max(0, room)).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    if (accepted.length === 0) return;
    setImages((current) => [...current, ...accepted]);
    setIsPickerOpen(false);
  }
  function addBrandImage(image) {
    if (images.length >= maxImages) {
      toast.error(`This template uses at most ${maxImages} images.`);
      return;
    }
    const alreadyAttached = images.some((item) => item.assetId === image.asset_id);
    if (!alreadyAttached) {
      setImages((current) => {
        if (current.some((item) => item.assetId === image.asset_id)) return current;
        return [
          ...current,
          {
            id: crypto.randomUUID(),
            assetId: image.asset_id,
            previewUrl: image.thumbnail_url ?? image.preview_url ?? image.url
          }
        ];
      });
    }
    const attachedCount = images.length + (alreadyAttached ? 0 : 1);
    if (attachedCount >= maxImages) setIsPickerOpen(false);
  }
  function removeImage(id) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }
  async function handleSend() {
    if (!canSend) return;
    if (!getAccessToken()) {
      onRequireAuth();
      return;
    }
    try {
      setPhase("sending");
      const aspectRatio = template.output_spec?.default_aspect_ratio ?? template.aspect_ratio ?? void 0;
      const trimmedCaption = caption.trim() || void 0;
      const hasBrandPicks = images.some((image) => image.assetId);
      let initial;
      if (hasBrandPicks) {
        const filesToUpload = images.map((image) => image.file).filter((file) => Boolean(file));
        const uploaded = filesToUpload.length ? await uploadAssetFiles(filesToUpload) : [];
        let uploadCursor = 0;
        const assetIds = images.map((image) => image.assetId ?? uploaded[uploadCursor++]?.asset_id);
        if (assetIds.some((id) => !id)) {
          throw new Error("Some images could not be prepared. Please try again.");
        }
        initial = await remixTemplate({
          templateId: template.id,
          assetIds,
          caption: trimmedCaption,
          aspectRatio,
          fontId: selectedFontId,
          captionColor: selectedCaptionColor
        });
      } else {
        initial = await remixTemplateUpload({
          templateId: template.id,
          files: images.map((image) => image.file).filter((file) => Boolean(file)),
          caption: trimmedCaption,
          aspectRatio,
          fontId: selectedFontId,
          captionColor: selectedCaptionColor
        });
      }
      setPhase("generating");
      const settled = await waitForGeneration(initial);
      if (settled.status !== "completed" || settled.assets.length === 0) {
        throw new Error(settled.error ?? "The remix could not be generated. Please try again.");
      }
      setResult(settled);
      void queryClient.invalidateQueries({ queryKey: remixesQueryKey() });
      setIsResultOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remix this template.");
    } finally {
      setPhase("idle");
    }
  }
  function handleUseTemplateAgain() {
    setIsResultOpen(false);
    setImages((current) => {
      current.forEach((image) => {
        if (image.previewUrl.startsWith("blob:")) URL.revokeObjectURL(image.previewUrl);
      });
      return [];
    });
    setCaption("");
    setResult(null);
    setLogoRemoved(false);
    setFontsRemoved(false);
    setColorRemoved(false);
    setCaptionColor(null);
    setIsColorPaletteOpen(false);
  }
  function handleDownload() {
    if (!output) return;
    const anchor = document.createElement("a");
    anchor.href = output.url;
    anchor.download = `epicpost-remix-${result?.generation_id ?? "image"}.png`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  function renderColorSwatch(option) {
    const isActive = (selectedCaptionColor ?? "").toLowerCase() === option.value.toLowerCase();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        title: option.label,
        "aria-label": option.label,
        "aria-pressed": isActive,
        onClick: () => {
          setCaptionColor(option.value);
          setIsColorPaletteOpen(false);
        },
        className: `h-7 w-7 rounded-full border transition ${isActive ? "border-primary ring-2 ring-primary ring-offset-1 ring-offset-popover" : "border-black/10 hover:scale-110"}`,
        style: { backgroundColor: option.value }
      },
      option.value
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        multiple: maxImages > 1,
        accept: acceptedTypes.join(","),
        className: "hidden",
        onChange: (event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }
      }
    ),
    (images.length > 0 || showLogoCard || showFontsCard || showColorCard) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2", children: [
      showLogoCard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: brandLogoUrl ?? void 0,
            alt: "Brand logo",
            className: "h-full w-full object-contain p-1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-white", children: "Logo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "aria-label": "Remove brand logo",
            disabled: isBusy,
            onClick: () => setLogoRemoved(true),
            className: "absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3", strokeWidth: 2.6 })
          }
        )
      ] }),
      showFontsCard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "flex h-full w-full items-center justify-center text-xl leading-none text-foreground",
            style: { fontFamily: brandPrimaryFont ?? void 0 },
            title: brandSecondaryFont ? `${brandPrimaryFont} · ${brandSecondaryFont}` : brandPrimaryFont ?? void 0,
            children: "Aa"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-white", children: "Fonts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "aria-label": "Remove brand fonts",
            disabled: isBusy,
            onClick: () => setFontsRemoved(true),
            className: "absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3", strokeWidth: 2.6 })
          }
        )
      ] }),
      showColorCard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            disabled: isBusy,
            "aria-label": "Choose caption colour",
            "aria-expanded": isColorPaletteOpen,
            onClick: () => setIsColorPaletteOpen((open) => !open),
            className: "relative h-14 w-14 overflow-hidden rounded-[14px] border border-border bg-secondary",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "absolute inset-1.5 rounded-[10px] border border-black/10",
                  style: { backgroundColor: selectedCaptionColor }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-white", children: "Color" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "aria-label": "Remove caption colour",
            disabled: isBusy,
            onClick: () => {
              setColorRemoved(true);
              setIsColorPaletteOpen(false);
            },
            className: "absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3", strokeWidth: 2.6 })
          }
        ),
        isColorPaletteOpen && captionColorOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-0 z-10 mb-2 w-max max-w-[200px] rounded-xl border border-border bg-popover p-2 shadow-md", children: [
          templateColorOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: templateColorOptions.map((option) => renderColorSwatch(option)) }),
          brandColorOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            templateColorOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Brand colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: brandColorOptions.map((option) => renderColorSwatch(option)) })
          ] })
        ] })
      ] }),
      images.map((image) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: image.previewUrl,
                alt: image.file?.name ?? "Selected image",
                className: "h-full w-full object-cover"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "aria-label": `Remove ${image.file?.name ?? "image"}`,
                disabled: isBusy,
                onClick: () => removeImage(image.id),
                className: "absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3", strokeWidth: 2.6 })
              }
            )
          ]
        },
        image.id
      )),
      images.length < maxImages && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "aria-label": "Add more images",
          disabled: isBusy,
          onClick: () => setIsPickerOpen(true),
          className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-14 items-center gap-2 rounded-[28px] bg-secondary px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: caption,
          disabled: isBusy,
          maxLength: maxChars ?? void 0,
          onChange: (event) => setCaption(event.target.value),
          onKeyDown: (event) => {
            if (event.key === "Enter" && canSend) handleSend();
          },
          placeholder: captionRequirement?.description ?? `Add a ${(captionRequirement?.label ?? "caption").toLowerCase()} for your remix`,
          className: "min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
        }
      ),
      maxChars != null && caption.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-xs font-medium text-muted-foreground", children: [
        caption.length,
        "/",
        maxChars
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "aria-label": "Attach images",
          disabled: isBusy,
          onClick: () => setIsPickerOpen(true),
          className: "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-background/60 disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "h-5 w-5 text-foreground" }),
            images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground", children: images.length })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "aria-label": "Send remix request",
          disabled: !canSend,
          onClick: handleSend,
          className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40",
          children: isBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-5 w-5", strokeWidth: 2.4 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 px-2 text-xs text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: isPickerOpen,
        onOpenChange: (open) => {
          setIsPickerOpen(open);
          if (!open) setIsDragging(false);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl rounded-[20px] p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Upload a photo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Choose one of your brand kit images or add a new one." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => fileInputRef.current?.click(),
              onDragOver: (event) => {
                event.preventDefault();
                setIsDragging(true);
              },
              onDragLeave: () => setIsDragging(false),
              onDrop: (event) => {
                event.preventDefault();
                setIsDragging(false);
                if (event.dataTransfer.files?.length) {
                  addFiles(event.dataTransfer.files);
                  setIsPickerOpen(false);
                }
              },
              className: `flex h-40 w-full flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed text-muted-foreground transition ${isDragging ? "border-foreground/50 bg-secondary text-foreground" : "border-border hover:border-foreground/40 hover:text-foreground"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-7 w-7" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[15px] font-medium", children: "Choose an image or drag and drop it here" })
              ]
            }
          ),
          brandImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs font-medium text-muted-foreground", children: "From your brand kit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid max-h-[40vh] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5", children: brandImages.map((image) => {
              const alreadyAdded = images.some((item) => item.assetId === image.asset_id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  disabled: alreadyAdded || images.length >= maxImages,
                  onClick: () => addBrandImage(image),
                  className: "group relative aspect-square overflow-hidden rounded-[12px] border border-border transition hover:border-foreground/40 disabled:opacity-60",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: image.thumbnail_url ?? image.preview_url ?? image.url,
                        alt: "Brand image",
                        className: "h-full w-full object-cover"
                      }
                    ),
                    alreadyAdded && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-black/40 text-[11px] font-semibold text-white", children: "Added" })
                  ]
                },
                image.asset_id
              );
            }) })
          ] }),
          brandKitsQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading your brand kit images…" }),
          !brandKitsQuery.isLoading && brandImages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No brand kit images yet — add one above to get started." })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isResultOpen, onOpenChange: setIsResultOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg rounded-[20px] p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: template.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: result?.caption ? `${result.caption} · ${formatCreatedAt(result.created_at)}` : formatCreatedAt(result?.created_at) })
      ] }),
      output && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-[16px] border border-border bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: output.url,
          alt: result?.caption ?? template.title,
          className: "max-h-[65vh] w-full object-contain"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleUseTemplateAgain,
            className: "flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-base font-semibold text-foreground transition hover:brightness-95",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
              "Use template again"
            ]
          }
        ),
        canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => navigate({
              to: "/editor/$templateId",
              params: { templateId: template.id },
              search: result?.caption ? { caption: result.caption } : {}
            }),
            className: "flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-base font-semibold text-foreground transition hover:brightness-95",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
              "Edit"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            disabled: !output,
            onClick: handleDownload,
            className: "flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
              "Download"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function templateToPin(template, index) {
  const media = getTemplateMedia(template);
  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + index % 4 * 40,
    title: template.title,
    isSaved: template.is_saved
  };
}
function uniqueTemplates(templates) {
  return Array.from(new Map(templates.map((template) => [template.id, template])).values());
}
function preloadMediaAssets(media) {
  const cleanup = [];
  media.forEach((item) => {
    if (item.type === "video") {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = item.url;
      video.load();
      cleanup.push(() => {
        video.removeAttribute("src");
        video.load();
      });
      return;
    }
    const image = new Image();
    image.src = item.url;
  });
  return () => {
    cleanup.forEach((dispose) => dispose());
  };
}
function getBoardThumb(board) {
  return board.preview_assets[0]?.url ?? "";
}
function BoardRow({
  board,
  saving,
  selected,
  onSelect
}) {
  const thumb = getBoardThumb(board);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onSelect, disabled: saving, className: `flex h-16 w-full items-center gap-3 rounded-[16px] px-2 text-left transition hover:bg-secondary disabled:opacity-60 ${selected ? "bg-secondary" : ""}`, children: [
    thumb ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: thumb, alt: "", className: "h-12 w-12 shrink-0 rounded-[14px] object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-12 w-12 shrink-0 rounded-[14px] bg-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-base font-semibold", children: board.name }),
    saving ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium text-muted-foreground", children: "Saving..." }) : selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 shrink-0 text-foreground", strokeWidth: 2.6 }) : board.is_secret && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5 shrink-0 text-foreground" })
  ] });
}
function SharePopover({
  open,
  onOpenChange,
  align = "center",
  trigger,
  shareTargets,
  recipients,
  search,
  onSearchChange,
  onSend
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: trigger }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align, sideOffset: 10, className: "w-[min(calc(100vw-24px),360px)] overflow-hidden rounded-[20px] border-0 bg-background p-0 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[min(72vh,560px)] overflow-y-auto px-4 pb-4 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-center text-xl font-bold", children: "Share" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex items-start justify-between gap-2", children: shareTargets.map((target) => target.href ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: target.href, target: "_blank", rel: "noreferrer", className: "flex flex-1 flex-col items-center gap-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-14 w-14 items-center justify-center rounded-full ${target.bg}`, children: target.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium text-foreground", children: target.label })
      ] }, target.key) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: target.onClick, className: "flex flex-1 flex-col items-center gap-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-14 w-14 items-center justify-center rounded-full ${target.bg}`, children: target.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium text-foreground", children: target.label })
      ] }, target.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 h-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-4 flex h-12 items-center gap-2 rounded-[16px] bg-input px-4 transition focus-within:ring-2 focus-within:ring-ring", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "search", placeholder: "Search by name or email", value: search, onChange: (event) => onSearchChange(event.target.value), className: "min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" })
      ] }),
      recipients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-6 text-center text-sm text-muted-foreground", children: "No people match your search." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: recipients.map((recipient) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-[14px] px-2 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-rose-300 to-amber-200" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-base font-semibold text-foreground", children: recipient.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm text-muted-foreground", children: recipient.handle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onSend(recipient), className: "h-10 shrink-0 rounded-full bg-secondary px-5 text-sm font-semibold text-foreground transition hover:brightness-95", children: "Send" })
      ] }, recipient.id)) })
    ] }) })
  ] });
}
function SaveToBoardPopover({
  open,
  onOpenChange,
  align = "end",
  trigger,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  boardSearch,
  onBoardSearchChange,
  topChoices,
  otherBoards,
  savingBoardId,
  currentBoardId,
  onSelectBoard,
  onCreateBoard
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: trigger }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align, sideOffset: 10, className: "w-[min(calc(100vw-24px),360px)] overflow-hidden rounded-[20px] border-0 bg-background p-0 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[min(72vh,560px)] overflow-y-auto px-4 pb-24 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-center text-xl font-bold", children: "Save" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-4 flex h-12 items-center gap-2 rounded-[16px] bg-input px-4 transition focus-within:ring-2 focus-within:ring-ring", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "search", placeholder: "Search", value: boardSearch, onChange: (event) => onBoardSearchChange(event.target.value), className: "min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-6 text-center text-sm text-muted-foreground", children: "Loading boards..." }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-6 text-center text-sm text-muted-foreground", children: errorMessage }) : isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-6 text-center text-sm text-muted-foreground", children: boardSearch ? "No boards match your search." : "No boards yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          topChoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 px-2 text-[13px] font-medium text-muted-foreground", children: "Top choices" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: topChoices.map((board) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoardRow, { board, saving: savingBoardId === board.id, selected: board.id === currentBoardId, onSelect: () => onSelectBoard(board.id) }, board.id)) })
          ] }),
          otherBoards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 mt-4 px-2 text-[13px] font-medium text-muted-foreground", children: "All boards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: otherBoards.map((board) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoardRow, { board, saving: savingBoardId === board.id, selected: board.id === currentBoardId, onSelect: () => onSelectBoard(board.id) }, board.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 rounded-b-[20px] bg-background/95 px-4 py-3 shadow-[0_-8px_22px_rgba(0,0,0,0.08)] backdrop-blur transition hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onCreateBoard, className: "flex h-16 w-full items-center gap-3 px-2 text-left font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-[14px] bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-6 w-6 text-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base", children: "Create board" })
      ] }) })
    ] })
  ] });
}
function showSavedToast(board, onUndo) {
  const thumbs = board?.preview_assets.slice(0, 4) ?? [];
  toast.custom((id) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-[18px] bg-[#2d2c2a] px-3 py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.28)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-[10px] bg-white/10", children: thumbs.length > 0 ? thumbs.map((asset) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: asset.url, alt: "", className: "h-full w-full object-cover" }, asset.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-2 row-span-2" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[15px] text-white/80", children: "Saved to" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[15px] font-bold", children: board?.name ?? "your board" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
      onUndo();
      toast.dismiss(id);
    }, className: "shrink-0 rounded-[14px] bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90", children: "Undo" })
  ] }), {
    duration: 5e3,
    unstyled: true,
    className: "!border-0 !bg-transparent !p-0 !shadow-none"
  });
}
function showRemovedToast() {
  toast.custom(() => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[18px] bg-[#56544e] px-5 py-4 text-[17px] font-medium text-white shadow-[0_12px_36px_rgba(0,0,0,0.28)]", children: "Removed from your board!" }), {
    unstyled: true,
    className: "!border-0 !bg-transparent !p-0 !shadow-none"
  });
}
function PinDetail() {
  const {
    pinId
  } = Route$2.useParams();
  const loaderTemplate = Route$2.useLoaderData();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedMediaIndex, setSelectedMediaIndex] = reactExports.useState(0);
  const [isAuthOpen, setIsAuthOpen] = reactExports.useState(false);
  const [isSaveOpen, setIsSaveOpen] = reactExports.useState(false);
  const [isShareOpen, setIsShareOpen] = reactExports.useState(false);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [zoom, setZoom] = reactExports.useState(1);
  const [fsShareOpen, setFsShareOpen] = reactExports.useState(false);
  const [fsSaveOpen, setFsSaveOpen] = reactExports.useState(false);
  const [shareSearch, setShareSearch] = reactExports.useState("");
  const [isCreateBoardOpen, setIsCreateBoardOpen] = reactExports.useState(false);
  const [boardSearch, setBoardSearch] = reactExports.useState("");
  const [savedBoardId, setSavedBoardId] = reactExports.useState(null);
  const [isFirstMediaLoaded, setIsFirstMediaLoaded] = reactExports.useState(false);
  const [showRequiredInfo, setShowRequiredInfo] = reactExports.useState(false);
  const isSignedIn = Boolean(getAccessToken());
  const boardsQuery = useQuery({
    queryKey: boardsQueryKey(pinId),
    queryFn: () => fetchBoards(pinId),
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1e3
  });
  const unsaveMutation = useMutation({
    mutationFn: (boardId) => unsaveTemplateFromBoard(pinId, boardId),
    onSuccess: () => {
      setSavedBoardId(null);
      queryClient.setQueryData(postTemplateQueryKey(pinId), (cached) => cached ? {
        ...cached,
        is_saved: false,
        board_id: null,
        board_name: null
      } : cached);
      void queryClient.invalidateQueries({
        queryKey: ["post-templates"]
      });
      showRemovedToast();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not remove template.");
    }
  });
  const saveMutation = useMutation({
    mutationFn: (boardId) => saveTemplateToBoard(pinId, boardId),
    onSuccess: (_data, boardId) => {
      setSavedBoardId(boardId);
      const board = boardsQuery.data?.data.find((item) => item.id === boardId);
      queryClient.setQueryData(postTemplateQueryKey(pinId), (cached) => cached ? {
        ...cached,
        is_saved: true,
        board_id: boardId,
        board_name: board?.name ?? null
      } : cached);
      void queryClient.invalidateQueries({
        queryKey: ["post-templates"]
      });
      showSavedToast(board ?? null, () => {
        unsaveMutation.mutate(boardId);
      });
      setIsSaveOpen(false);
      setFsSaveOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save template.");
    }
  });
  const likeMutation = useMutation({
    mutationFn: (liked) => liked ? likeTemplate(pinId) : unlikeTemplate(pinId),
    onSuccess: (state) => {
      queryClient.setQueryData(postTemplateQueryKey(pinId), (cached) => cached ? {
        ...cached,
        is_liked: state.is_liked,
        likes_count: state.likes_count
      } : cached);
      void queryClient.invalidateQueries({
        queryKey: likedTemplatesQueryKey()
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update like.");
    }
  });
  const boards = reactExports.useMemo(() => boardsQuery.data?.data ?? [], [boardsQuery.data]);
  const filteredBoards = reactExports.useMemo(() => {
    const query = boardSearch.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter((board) => board.name.toLowerCase().includes(query));
  }, [boards, boardSearch]);
  const topChoices = boardSearch ? [] : filteredBoards.filter((board) => board.is_top_choice);
  const otherBoards = boardSearch ? filteredBoards : filteredBoards.filter((board) => !board.is_top_choice);
  const selectedBoard = boards.find((board) => board.id === savedBoardId) ?? null;
  const defaultFeedQuery = useQuery({
    queryKey: ["post-templates-related"],
    queryFn: () => fetchPostTemplates()
  });
  const cachedFeeds = queryClient.getQueriesData({
    queryKey: ["post-templates"]
  });
  const cachedTemplates = cachedFeeds.flatMap(([, feed]) => feed?.data ?? []);
  const templates = uniqueTemplates([...cachedTemplates, ...defaultFeedQuery.data?.data ?? []]);
  const detailQuery = useQuery({
    queryKey: postTemplateQueryKey(pinId),
    queryFn: () => fetchPostTemplate(pinId)
  });
  const template = detailQuery.data ?? loaderTemplate ?? templates.find((item) => item.id === pinId);
  const shareUrl = typeof window !== "undefined" ? window.location.href : `/template/${pinId}`;
  const shareTitle = template?.title ?? "Check out this template on EpicPost";
  const shareTargets = reactExports.useMemo(() => [{
    key: "copy",
    label: "Copy link",
    bg: "bg-secondary",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-7 w-7 text-foreground", strokeWidth: 2.2 }),
    onClick: async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied");
      } catch {
        toast.error("Could not copy link");
      }
    }
  }, {
    key: "whatsapp",
    label: "WhatsApp",
    bg: "bg-[#25D366]",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-7 w-7 text-white", strokeWidth: 2.2 }),
    href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`
  }, {
    key: "facebook",
    label: "Facebook",
    bg: "bg-[#1877F2]",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "h-7 w-7 text-white", fill: "currentColor", strokeWidth: 0 }),
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  }, {
    key: "x",
    label: "X",
    bg: "bg-foreground",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "h-7 w-7 text-background", fill: "currentColor", strokeWidth: 0 }),
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
  }], [shareUrl, shareTitle]);
  const shareRecipients = reactExports.useMemo(() => [{
    id: "ella",
    name: "ELLA",
    handle: "@ella_contentclub"
  }, {
    id: "global-travel",
    name: "Global Travel Inspiration",
    handle: "@GlobalTravelCollection2"
  }, {
    id: "uae",
    name: "UAE",
    handle: "@uaestories"
  }], []);
  const filteredRecipients = reactExports.useMemo(() => {
    const query = shareSearch.trim().toLowerCase();
    if (!query) return shareRecipients;
    return shareRecipients.filter((recipient) => recipient.name.toLowerCase().includes(query) || recipient.handle.toLowerCase().includes(query));
  }, [shareRecipients, shareSearch]);
  const currentBoardId = savedBoardId ?? template?.board_id ?? null;
  const isSaved = Boolean(template?.is_saved || currentBoardId);
  const savingBoardId = saveMutation.isPending ? saveMutation.variables ?? null : null;
  const boardsErrorMessage = boardsQuery.error instanceof Error ? boardsQuery.error.message : "Could not load boards.";
  const saveButtonLabel = selectedBoard?.name ?? (template?.board_id && template.board_name ? template.board_name : "Save to board");
  const relatedTemplates = templates.filter((item) => item.id !== pinId);
  const previewMedia = reactExports.useMemo(() => {
    if (!template) return [];
    const mediaItems = template.assets.slice().sort((a, b) => a.order - b.order).map((asset) => ({
      id: asset.id,
      url: asset.url,
      type: asset.type
    }));
    if (mediaItems.length > 0) return mediaItems;
    const media = getTemplateMedia(template);
    return media.url ? [{
      id: `${template.id}-preview`,
      url: media.url,
      type: media.type
    }] : [];
  }, [template]);
  const firstPreviewMediaId = previewMedia[0]?.id;
  const selectedMedia = previewMedia[selectedMediaIndex] ?? previewMedia[0] ?? null;
  const showMediaBullets = previewMedia.length > 1;
  const showMediaPreviews = previewMedia.length > 1;
  const canShowPreviousMedia = selectedMediaIndex > 0;
  const canShowNextMedia = selectedMediaIndex < previewMedia.length - 1;
  const sidePins = relatedTemplates.slice(0, 10);
  const belowPins = relatedTemplates.slice(10).concat(relatedTemplates.slice(0, 10));
  const isTemplateLoading = !template && (detailQuery.isLoading || defaultFeedQuery.isLoading);
  function showPreviousMedia() {
    setSelectedMediaIndex((index) => Math.max(0, index - 1));
  }
  function showNextMedia() {
    setSelectedMediaIndex((index) => Math.min(previewMedia.length - 1, index + 1));
  }
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_STEP = 0.25;
  const zoomIn = reactExports.useCallback(() => {
    setZoom((value) => Math.min(ZOOM_MAX, Math.round((value + ZOOM_STEP) * 100) / 100));
  }, []);
  const zoomOut = reactExports.useCallback(() => {
    setZoom((value) => Math.max(ZOOM_MIN, Math.round((value - ZOOM_STEP) * 100) / 100));
  }, []);
  function openFullscreen() {
    setZoom(1);
    setIsFullscreen(true);
  }
  function closeFullscreen() {
    setIsFullscreen(false);
    setFsShareOpen(false);
    setFsSaveOpen(false);
  }
  function handleSendRecipient(recipient) {
    if (!isSignedIn) {
      setIsShareOpen(false);
      setFsShareOpen(false);
      setIsAuthOpen(true);
      return;
    }
    toast.success(`Sent to ${recipient.name}`);
  }
  function openCreateBoard() {
    setIsSaveOpen(false);
    setFsSaveOpen(false);
    setIsCreateBoardOpen(true);
  }
  function requireAuthToSave() {
    if (!isSignedIn) {
      setIsAuthOpen(true);
      return false;
    }
    return true;
  }
  reactExports.useEffect(() => {
    setZoom(1);
  }, [selectedMediaIndex, isFullscreen]);
  reactExports.useEffect(() => {
    setSelectedMediaIndex(0);
    setIsFirstMediaLoaded(false);
  }, [pinId]);
  reactExports.useEffect(() => {
    setIsFirstMediaLoaded(false);
  }, [firstPreviewMediaId]);
  reactExports.useEffect(() => {
    if (selectedMediaIndex >= previewMedia.length) {
      setSelectedMediaIndex(0);
    }
  }, [previewMedia.length, selectedMediaIndex]);
  reactExports.useEffect(() => {
    if (previewMedia.length <= 1) return;
    function handleCarouselKeyDown(event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target instanceof HTMLElement && target.isContentEditable) {
        return;
      }
      if (event.key === "ArrowLeft") {
        setSelectedMediaIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "ArrowRight") {
        setSelectedMediaIndex((index) => Math.min(previewMedia.length - 1, index + 1));
      }
    }
    window.addEventListener("keydown", handleCarouselKeyDown);
    return () => window.removeEventListener("keydown", handleCarouselKeyDown);
  }, [previewMedia.length]);
  reactExports.useEffect(() => {
    if (!isFullscreen) return;
    function handleFullscreenKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target instanceof HTMLElement && target.isContentEditable) {
        return;
      }
      switch (event.key) {
        case "Escape":
          closeFullscreen();
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedMediaIndex((index) => Math.max(0, index - 1));
          break;
        case "ArrowDown":
          event.preventDefault();
          setSelectedMediaIndex((index) => Math.min(previewMedia.length - 1, index + 1));
          break;
        case "+":
        case "=":
          event.preventDefault();
          zoomIn();
          break;
        case "-":
          event.preventDefault();
          zoomOut();
          break;
      }
    }
    window.addEventListener("keydown", handleFullscreenKeyDown);
    return () => window.removeEventListener("keydown", handleFullscreenKeyDown);
  }, [isFullscreen, previewMedia.length, zoomIn, zoomOut]);
  reactExports.useEffect(() => {
    if (!isFullscreen || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isFullscreen]);
  reactExports.useEffect(() => {
    if (!isFirstMediaLoaded || previewMedia.length <= 1) return;
    return preloadMediaAssets(previewMedia.slice(1));
  }, [isFirstMediaLoaded, previewMedia]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:pl-[72px] pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { showTabs: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-3 md:px-6 pb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full xl:w-4/5 2xl:w-4/6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-[16px] border border-border bg-background overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/preview relative bg-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Back", onClick: () => router.history.back(), className: "absolute top-4 left-4 z-10 h-11 w-11 rounded-[14px] bg-background shadow-md flex items-center justify-center hover:bg-secondary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground", strokeWidth: 2.4 }) }),
              selectedMedia?.type === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex w-fit max-w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: selectedMedia.url, "aria-label": template?.title ?? "Video template", controls: true, muted: true, loop: true, playsInline: true, autoPlay: true, onLoadedData: () => {
                  if (selectedMediaIndex === 0) setIsFirstMediaLoaded(true);
                }, className: "max-h-[820px] max-w-full object-contain" }, selectedMedia.id),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 right-4 flex flex-col gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Expand", onClick: openFullscreen, className: "flex h-11 w-11 items-center justify-center rounded-[14px] bg-background shadow-md transition hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-5 w-5 text-foreground" }) }) })
              ] }) : selectedMedia ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex w-fit max-w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedMedia.url, alt: template?.title ?? "Template", onLoad: () => {
                  if (selectedMediaIndex === 0) setIsFirstMediaLoaded(true);
                }, className: "max-h-[820px] max-w-full object-contain" }, selectedMedia.id),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 right-4 flex flex-col gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Expand", onClick: openFullscreen, className: "flex h-11 w-11 items-center justify-center rounded-[14px] bg-background shadow-md transition hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-5 w-5 text-foreground" }) }) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: isTemplateLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TemplatePreviewSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[480px] w-full items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground", children: "Template preview unavailable" }) }),
              canShowPreviousMedia ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "icon", "aria-label": "Previous media", onClick: showPreviousMedia, className: "absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-[14px] bg-background opacity-0 shadow-md transition-opacity hover:bg-secondary group-hover/preview:opacity-100 focus-visible:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5 text-foreground", strokeWidth: 2.4 }) }) : null,
              canShowNextMedia ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "icon", "aria-label": "Next media", onClick: showNextMedia, className: "absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-[14px] bg-background opacity-0 shadow-md transition-opacity hover:bg-secondary group-hover/preview:opacity-100 focus-visible:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 text-foreground", strokeWidth: 2.4 }) }) : null,
              showMediaBullets && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2", "aria-label": "Template media", children: previewMedia.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": `Show media ${index + 1}`, "aria-current": index === selectedMediaIndex, onClick: () => setSelectedMediaIndex(index), className: `h-2 rounded-full transition ${index === selectedMediaIndex ? "w-2.5 bg-white opacity-100 shadow-sm" : "w-2 bg-white/55 hover:bg-white/80"}` }, item.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 md:p-8 flex flex-col", children: isTemplateLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateDetailsSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", "aria-label": template?.is_liked ? "Unlike" : "Like", "aria-pressed": Boolean(template?.is_liked), disabled: likeMutation.isPending, onClick: () => {
                    if (!isSignedIn) {
                      setIsAuthOpen(true);
                      return;
                    }
                    likeMutation.mutate(!template?.is_liked);
                  }, className: "flex items-center gap-1 px-2 h-10 rounded-full hover:bg-secondary transition disabled:opacity-60", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `h-6 w-6 transition ${template?.is_liked ? "text-[#e60023]" : "text-foreground"}`, fill: template?.is_liked ? "currentColor" : "none", strokeWidth: 2.2 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: template?.likes_count ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SharePopover, { open: isShareOpen, onOpenChange: (open) => {
                    setIsShareOpen(open);
                    if (!open) setShareSearch("");
                  }, align: "center", shareTargets, recipients: filteredRecipients, search: shareSearch, onSearchChange: setShareSearch, onSend: handleSendRecipient, trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Share", className: "h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5 text-foreground", strokeWidth: 2.2 }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "More", className: "h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-6 w-6 text-foreground", strokeWidth: 2.2 }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "start", className: "w-56", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { children: "Download image" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { children: "See more" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { children: "See less" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { children: "Report Template" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { children: "Get Template embed code" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SaveToBoardPopover, { open: isSaveOpen, onOpenChange: (open) => {
                    if (open && !isSignedIn) {
                      setIsAuthOpen(true);
                      return;
                    }
                    setIsSaveOpen(open);
                    if (!open) setBoardSearch("");
                  }, align: "end", isLoading: boardsQuery.isLoading, isError: boardsQuery.isError, errorMessage: boardsErrorMessage, isEmpty: filteredBoards.length === 0, boardSearch, onBoardSearchChange: setBoardSearch, topChoices, otherBoards, savingBoardId, currentBoardId, onSelectBoard: (boardId) => saveMutation.mutate(boardId), onCreateBoard: openCreateBoard, trigger: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-1 h-10 px-3 rounded-full hover:bg-secondary transition text-sm font-semibold text-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "md:hidden", children: "Save" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: saveButtonLabel }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 rotate-90" })
                  ] }) }),
                  isSaved ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                    if (!isSignedIn) {
                      setIsAuthOpen(true);
                      return;
                    }
                    setIsSaveOpen(true);
                  }, className: "h-11 px-5 rounded-[14px] bg-foreground text-background font-bold text-base hover:brightness-110 transition", children: "Saved" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                    if (!isSignedIn) {
                      setIsAuthOpen(true);
                      return;
                    }
                    setIsSaveOpen(true);
                  }, className: "h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:brightness-90 transition", children: "Save" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-200 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground", children: [
                  "EpicPost",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "• Public template feed" })
                ] })
              ] }),
              showMediaPreviews && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 flex-1 gap-2 overflow-x-auto py-1", children: previewMedia.map((asset, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedMediaIndex(i), className: `h-14 w-14 shrink-0 overflow-hidden rounded-[14px] transition ${i === selectedMediaIndex ? "ring-2 ring-foreground" : "opacity-90 hover:opacity-100"}`, children: asset.type === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: asset.url, muted: true, playsInline: true, preload: "metadata", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: asset.url, alt: "", className: "h-full w-full object-cover" }) }, asset.id)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 w-10 shrink-0 rounded-full hover:bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 text-foreground" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground mb-2", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[15px] text-foreground leading-relaxed", children: template?.description ?? template?.title ?? "This public template is not available in the current feed." }),
              template?.tags.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-x-2 gap-y-1", children: template.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/?search=${encodeURIComponent(tag)}`, className: "text-[15px] font-semibold text-[oklch(0.55_0.22_260)] hover:underline", children: [
                "#",
                tag
              ] }, tag)) }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowRequiredInfo((isShown) => !isShown), className: "self-end mt-2 text-sm font-bold text-foreground hover:underline", children: showRequiredInfo ? "Hide required info" : "Show required info" }),
              template && showRequiredInfo ? /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateRequirements, { template }) : null,
              template?.comments.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: template.comments.slice(0, 3).map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                comment.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: comment.avatar_url, alt: "", className: "h-8 w-8 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-secondary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: comment.username ?? "Guest" }),
                  " ",
                  comment.comment
                ] })
              ] }, comment.id)) }) : null,
              template && (!template.capabilities || template.capabilities.supports_remix) ? /* @__PURE__ */ jsxRuntimeExports.jsx(RemixComposer, { template, onRequireAuth: () => setIsAuthOpen(true) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 h-14 rounded-[28px] bg-secondary px-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Add a comment to start the conversation", className: "flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Emoji", className: "h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-5 w-5 text-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Sticker", className: "h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sticker, { className: "h-5 w-5 text-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Image", className: "h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "h-5 w-5 text-foreground" }) })
              ] }) })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]", children: belowPins.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateCard, { pin: templateToPin(p, i) }, `below-${i}-${p.id}`)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden xl:block xl:w-1/5 2xl:w-2/6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-1 2xl:columns-2 gap-3 [column-fill:_balance]", children: sidePins.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateCard, { pin: templateToPin(p, i) }, `side-${i}-${p.id}`)) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignupDialog, { open: isAuthOpen, onOpenChange: setIsAuthOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreateBoardDialog, { open: isCreateBoardOpen, onOpenChange: setIsCreateBoardOpen }),
    isFullscreen && selectedMedia ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": "Media viewer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Close", onClick: closeFullscreen, className: "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-foreground shadow-md transition hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5", strokeWidth: 2.4 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto flex items-center gap-2 rounded-[16px] bg-white/95 p-1.5 shadow-md backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SharePopover, { open: fsShareOpen, onOpenChange: (open) => {
            setFsShareOpen(open);
            if (!open) setShareSearch("");
          }, align: "end", shareTargets, recipients: filteredRecipients, search: shareSearch, onSearchChange: setShareSearch, onSend: handleSendRecipient, trigger: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex h-10 items-center gap-1.5 rounded-[12px] px-3 text-sm font-semibold text-foreground transition hover:bg-secondary", children: [
            "Share",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4", strokeWidth: 2.2 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-6 w-px bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SaveToBoardPopover, { open: fsSaveOpen, onOpenChange: (open) => {
            if (open && !isSignedIn) {
              setIsAuthOpen(true);
              return;
            }
            setFsSaveOpen(open);
            if (!open) setBoardSearch("");
          }, align: "end", isLoading: boardsQuery.isLoading, isError: boardsQuery.isError, errorMessage: boardsErrorMessage, isEmpty: filteredBoards.length === 0, boardSearch, onBoardSearchChange: setBoardSearch, topChoices, otherBoards, savingBoardId, currentBoardId, onSelectBoard: (boardId) => saveMutation.mutate(boardId), onCreateBoard: openCreateBoard, trigger: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex h-10 max-w-[160px] items-center gap-1 rounded-[12px] px-3 text-sm font-semibold text-foreground transition hover:bg-secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: saveButtonLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 shrink-0 rotate-90" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            if (!requireAuthToSave()) return;
            setFsSaveOpen(true);
          }, className: `h-10 rounded-[12px] px-5 text-sm font-bold text-white transition ${isSaved ? "bg-foreground hover:brightness-110" : "bg-primary hover:brightness-90"}`, children: isSaved ? "Saved" : "Save" })
        ] })
      ] }),
      previewMedia.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-1/2 z-10 flex max-h-[80vh] -translate-y-1/2 flex-col gap-2 overflow-y-auto py-2", children: previewMedia.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": `Show media ${index + 1}`, "aria-current": index === selectedMediaIndex, onClick: () => setSelectedMediaIndex(index), className: `h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border-2 transition ${index === selectedMediaIndex ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`, children: item.type === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: item.url, muted: true, playsInline: true, preload: "metadata", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.url, alt: "", className: "h-full w-full object-cover" }) }, item.id)) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center overflow-auto p-6", children: selectedMedia.type === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: selectedMedia.url, controls: true, muted: true, loop: true, playsInline: true, autoPlay: true, style: {
        transform: `scale(${zoom})`
      }, className: "max-h-[88vh] max-w-[88vw] origin-center object-contain transition-transform duration-150" }, selectedMedia.id) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedMedia.url, alt: template?.title ?? "Template", style: {
        transform: `scale(${zoom})`
      }, className: "max-h-[88vh] max-w-[88vw] origin-center object-contain transition-transform duration-150" }, selectedMedia.id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-[14px] bg-white shadow-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Zoom in", onClick: zoomIn, disabled: zoom >= ZOOM_MAX, className: "flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5", strokeWidth: 2.4 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-full bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Zoom out", onClick: zoomOut, disabled: zoom <= ZOOM_MIN, className: "flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-5 w-5", strokeWidth: 2.4 }) })
      ] })
    ] }) : null
  ] });
}
function TemplatePreviewSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[480px] w-full items-center justify-center px-6 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[360px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-[4/5] w-full rounded-[24px]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-8 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-2 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-2 rounded-full" })
    ] })
  ] }) });
}
function TemplateDetailsSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[480px] flex-1 flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-20 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-32 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-11 w-20 rounded-full" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 shrink-0 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48 max-w-full rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-2 h-4 w-32 rounded-full" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-40 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-full rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-5/6 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-2/3 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-36 rounded-full" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-full rounded-[28px]" }) })
  ] });
}
export {
  PinDetail as component
};

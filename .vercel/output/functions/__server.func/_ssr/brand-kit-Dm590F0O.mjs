import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useBlocker } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { Z, O as Oe } from "../_libs/react-colorful.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav, P as Popover, a as PopoverTrigger, b as PopoverContent } from "./MobileNav-JTGfX7W-.mjs";
import { R as Root2, T as Trigger2, P as Portal2, C as Content2, a as Title2, D as Description2, b as Cancel, A as Action, O as Overlay2 } from "../_libs/radix-ui__react-alert-dialog.mjs";
import { k as AUTH_SESSION_CHANGED_EVENT, l as hasAuthSession, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, f as DialogFooter, r as requestAuthDialog, c as cn, A as API_BASE_URL } from "./router-Bd-4THC9.mjs";
import { C as COLOR_TYPES, M as MAX_BRAND_IMAGES, b as brandKitsQueryKey, c as colorsToPalette, a as buttonVariants, p as paletteToColors, u as updateBrandKit, d as createBrandKit, r as removeBrandLogo, e as uploadBrandLogo, f as COLOR_TYPE_LABELS, g as uploadBrandImage, h as removeBrandImage, i as deleteBrandKit, j as fetchBrandKits } from "./brand-kit-Cry52ijx.mjs";
import { m as Link2, k as LoaderCircle, l as Upload, X, d as ChevronDown, n as Image, T as Trash2, S as Search, e as Check, b as Plus } from "../_libs/lucide-react.mjs";
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
import "./dropdown-menu-CqiGz96I.mjs";
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
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
const AlertDialog = Root2;
const AlertDialogTrigger = Trigger2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
const fontsQueryKey = () => ["fonts"];
const FONTS_CACHE_KEY = "epicpost.fonts.v1";
const FONTS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
function readCachedFonts() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(FONTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.fonts?.length || typeof parsed.fetchedAt !== "number") return null;
    if (Date.now() - parsed.fetchedAt > FONTS_CACHE_TTL_MS) return null;
    return parsed.fonts;
  } catch {
    return null;
  }
}
function writeCachedFonts(fonts) {
  if (typeof localStorage === "undefined") return;
  try {
    const payload = { fetchedAt: Date.now(), fonts };
    localStorage.setItem(FONTS_CACHE_KEY, JSON.stringify(payload));
  } catch {
  }
}
async function fetchFonts() {
  const cached = readCachedFonts();
  if (cached) return cached;
  const response = await fetch(new URL("/api/v1/fonts", API_BASE_URL));
  if (!response.ok) {
    throw new Error(`Fonts request failed with ${response.status}`);
  }
  const payload = await response.json();
  writeCachedFonts(payload.data);
  return payload.data;
}
const GOOGLE_FONTS_LINK_ID = "brand-kit-google-fonts";
function ensureFontsLoaded(fonts) {
  if (typeof document === "undefined" || fonts.length === 0) return;
  const google = fonts.filter((font) => font.provider === "google");
  if (google.length === 0) return;
  const families = google.map((font) => `family=${font.family.trim().replace(/\s+/g, "+")}`).join("&");
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  const existing = document.getElementById(GOOGLE_FONTS_LINK_ID);
  if (existing) {
    if (existing.href !== href) existing.href = href;
    return;
  }
  const link = document.createElement("link");
  link.id = GOOGLE_FONTS_LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
function fontFamilyStack(font) {
  return `'${font.family}', ${font.fallback}`;
}
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_TONE_OF_VOICE = 3;
const MAX_BRAND_VALUES = 5;
const MAX_BRAND_VALUE_LENGTH = 60;
const MAX_ONE_LINER_LENGTH = 140;
const DEFAULT_NEW_COLOR = "#888888";
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TONE_OF_VOICE_PRESETS = ["Playful", "Bold", "Friendly", "Confident", "Professional", "Warm", "Witty", "Minimal", "Premium", "Inspirational"];
function areArraysEqual(first, second) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}
function arePalettesEqual(first, second) {
  return first.length === second.length && first.every((entry, index) => entry.type === second[index].type && entry.hex === second[index].hex);
}
function areImagesEqual(first, second) {
  return areArraysEqual(first.map((image) => image.asset_id), second.map((image) => image.asset_id));
}
function parseToneOfVoice(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
function serializeToneOfVoice(values) {
  return values.join(", ");
}
function getBrandKitSnapshot(kit) {
  return {
    name: kit?.name ?? "",
    websiteUrl: kit?.website_url ?? "",
    fontPrimaryId: kit?.font_id ?? null,
    fontSecondaryId: kit?.secondary_font_id ?? null,
    oneLiner: kit?.one_liner ?? "",
    toneOfVoice: kit?.tone_of_voice ?? "",
    palette: colorsToPalette(kit?.colors),
    brandValues: kit?.brand_values ?? [],
    logoAssetId: kit?.logo_asset_id ?? null,
    logoUrl: kit?.logo_url ?? null,
    images: kit?.images ?? []
  };
}
function BrandKitPage() {
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = reactExports.useState(false);
  const [selectedId, setSelectedId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const update = () => setSignedIn(hasAuthSession());
    update();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  const kitsQuery = useQuery({
    queryKey: brandKitsQueryKey(),
    queryFn: fetchBrandKits,
    enabled: signedIn
  });
  const kits = kitsQuery.data;
  reactExports.useEffect(() => {
    if (!kits) return;
    if (selectedId === "new") return;
    if (selectedId && kits.some((k) => k.id === selectedId)) return;
    setSelectedId(kits[0]?.id ?? "new");
  }, [kits, selectedId]);
  const selectedKit = selectedId && selectedId !== "new" ? kits?.find((k) => k.id === selectedId) ?? null : null;
  function handleSaved(saved) {
    queryClient.setQueryData(brandKitsQueryKey(), (old) => {
      const list = old ?? [];
      return list.some((k) => k.id === saved.id) ? list.map((k) => k.id === saved.id ? saved : k) : [saved, ...list];
    });
    setSelectedId(saved.id);
    void queryClient.invalidateQueries({
      queryKey: brandKitsQueryKey()
    });
  }
  function handleDeleted(deletedId) {
    queryClient.setQueryData(brandKitsQueryKey(), (old) => (old ?? []).filter((k) => k.id !== deletedId));
    setSelectedId(null);
    void queryClient.invalidateQueries({
      queryKey: brandKitsQueryKey()
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:pl-[72px] pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { showTabs: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto w-full max-w-6xl px-4 pb-12 pt-2 md:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight text-foreground", children: "Brand Kit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-base text-muted-foreground", children: "Set up your brand DNA — logo, colors, fonts and voice. Every remix and generation stays aligned to it." })
          ] }),
          signedIn && !kitsQuery.isLoading && !kitsQuery.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(KitActions, {}) : null
        ] }),
        !signedIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(SignedOutState, {}) : kitsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : kitsQuery.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { message: kitsQuery.error instanceof Error ? kitsQuery.error.message : "Couldn't load your brand kits.", onRetry: () => void kitsQuery.refetch() }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BrandKitEditor, { kit: selectedKit, onSaved: handleSaved, onDeleted: handleDeleted }, selectedId ?? "loading")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {})
  ] });
}
function KitActions() {
  const [importOpen, setImportOpen] = reactExports.useState(false);
  const [websiteUrl, setWebsiteUrl] = reactExports.useState("");
  function handleImportSubmit(event) {
    event.preventDefault();
    const normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl) return;
    setWebsiteUrl("");
    setImportOpen(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex sm:pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setImportOpen(true), className: "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#e60023] px-5 text-[15px] font-semibold text-white transition hover:bg-[#ad081b]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4", strokeWidth: 2.4 }),
      "Import from URL"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: importOpen, onOpenChange: setImportOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md rounded-[20px] p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Import from URL" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleImportSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-muted-foreground", htmlFor: "brand-url", children: "Website URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex h-12 items-center gap-2 rounded-[16px] border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-ring", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "brand-url", type: "url", value: websiteUrl, onChange: (event) => setWebsiteUrl(event.target.value), placeholder: "https://yourbrand.com", className: "min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground", autoFocus: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-6 gap-2 sm:space-x-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setImportOpen(false), className: "h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:bg-accent", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !websiteUrl.trim(), className: "h-11 rounded-full bg-foreground px-5 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50", children: "Import" })
        ] })
      ] })
    ] }) })
  ] });
}
function BrandKitEditor({
  kit,
  onSaved,
  onDeleted
}) {
  const initial = reactExports.useMemo(() => getBrandKitSnapshot(kit), [kit]);
  const [savedSnapshot, setSavedSnapshot] = reactExports.useState(initial);
  const [name, setName] = reactExports.useState(initial.name);
  const [websiteUrl, setWebsiteUrl] = reactExports.useState(initial.websiteUrl);
  const [fontPrimaryId, setFontPrimaryId] = reactExports.useState(initial.fontPrimaryId);
  const [fontSecondaryId, setFontSecondaryId] = reactExports.useState(initial.fontSecondaryId);
  const [oneLiner, setOneLiner] = reactExports.useState(initial.oneLiner);
  const [toneOfVoice, setToneOfVoice] = reactExports.useState(initial.toneOfVoice);
  const [tonePickerOpen, setTonePickerOpen] = reactExports.useState(false);
  const [palette, setPalette] = reactExports.useState(initial.palette);
  const [brandValues, setBrandValues] = reactExports.useState(initial.brandValues);
  const [valueDraft, setValueDraft] = reactExports.useState("");
  const [logoAssetId, setLogoAssetId] = reactExports.useState(initial.logoAssetId);
  const [logoUrl, setLogoUrl] = reactExports.useState(initial.logoUrl);
  const [images, setImages] = reactExports.useState(initial.images);
  const [uploadingLogo, setUploadingLogo] = reactExports.useState(false);
  const [uploadingImages, setUploadingImages] = reactExports.useState(false);
  const [deletingLogo, setDeletingLogo] = reactExports.useState(false);
  const [deletingImageIds, setDeletingImageIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const logoInputRef = reactExports.useRef(null);
  const imagesInputRef = reactExports.useRef(null);
  const draftKitIdRef = reactExports.useRef(kit?.id ?? null);
  const fontsQuery = useQuery({
    queryKey: fontsQueryKey(),
    queryFn: fetchFonts,
    // Seed from the persisted cache so the picker renders instantly and skips the
    // network entirely while the local copy is still fresh.
    initialData: () => readCachedFonts() ?? void 0,
    staleTime: FONTS_CACHE_TTL_MS,
    gcTime: FONTS_CACHE_TTL_MS
  });
  const fonts = reactExports.useMemo(() => fontsQuery.data ?? [], [fontsQuery.data]);
  reactExports.useEffect(() => {
    ensureFontsLoaded(fonts);
  }, [fonts]);
  const primaryFont = reactExports.useMemo(() => fonts.find((font) => font.id === fontPrimaryId) ?? null, [fonts, fontPrimaryId]);
  const secondaryFont = reactExports.useMemo(() => fonts.find((font) => font.id === fontSecondaryId) ?? null, [fonts, fontSecondaryId]);
  const oneLinerFont = secondaryFont ?? primaryFont;
  const toneOfVoiceValues = reactExports.useMemo(() => parseToneOfVoice(toneOfVoice), [toneOfVoice]);
  const availableToneOfVoicePresets = reactExports.useMemo(() => {
    const selected = new Set(toneOfVoiceValues.map((tone) => tone.toLowerCase()));
    return TONE_OF_VOICE_PRESETS.filter((tone) => !selected.has(tone.toLowerCase()));
  }, [toneOfVoiceValues]);
  const hasUnsavedChanges = name !== savedSnapshot.name || websiteUrl !== savedSnapshot.websiteUrl || fontPrimaryId !== savedSnapshot.fontPrimaryId || fontSecondaryId !== savedSnapshot.fontSecondaryId || oneLiner !== savedSnapshot.oneLiner || toneOfVoice !== savedSnapshot.toneOfVoice || logoAssetId !== savedSnapshot.logoAssetId || logoUrl !== savedSnapshot.logoUrl || !arePalettesEqual(palette, savedSnapshot.palette) || !areArraysEqual(brandValues, savedSnapshot.brandValues) || !areImagesEqual(images, savedSnapshot.images);
  const shouldBlockLeave = reactExports.useCallback(({
    current,
    next
  }) => hasUnsavedChanges && current.pathname !== next.pathname, [hasUnsavedChanges]);
  const leaveBlocker = useBlocker({
    shouldBlockFn: shouldBlockLeave,
    enableBeforeUnload: hasUnsavedChanges,
    withResolver: true
  });
  function applySnapshot(snapshot) {
    setSavedSnapshot(snapshot);
    setName(snapshot.name);
    setWebsiteUrl(snapshot.websiteUrl);
    setFontPrimaryId(snapshot.fontPrimaryId);
    setFontSecondaryId(snapshot.fontSecondaryId);
    setOneLiner(snapshot.oneLiner);
    setToneOfVoice(snapshot.toneOfVoice);
    setPalette(snapshot.palette);
    setBrandValues(snapshot.brandValues);
    setLogoAssetId(snapshot.logoAssetId);
    setLogoUrl(snapshot.logoUrl);
    setImages(snapshot.images);
  }
  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Add a brand name first.");
      const input = {
        name: trimmed,
        colors: paletteToColors(palette),
        font_id: fontPrimaryId,
        secondary_font_id: fontSecondaryId,
        logo_asset_id: logoAssetId,
        image_asset_ids: images.map((img) => img.asset_id),
        one_liner: oneLiner.trim() || null,
        brand_values: brandValues,
        tone_of_voice: toneOfVoice.trim() || null,
        website_url: websiteUrl.trim() || null
      };
      return kit ? updateBrandKit(kit.id, input) : createBrandKit(input);
    },
    onSuccess: (saved) => {
      draftKitIdRef.current = saved.id;
      applySnapshot(getBrandKitSnapshot(saved));
      toast.success(kit ? "Brand kit updated" : "Brand kit created");
      onSaved(saved);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't save brand kit.");
    }
  });
  async function handleSaveAndLeave() {
    if (leaveBlocker.status !== "blocked") return;
    try {
      await saveMutation.mutateAsync();
      leaveBlocker.proceed();
    } catch {
    }
  }
  function handleDiscardAndLeave() {
    if (leaveBlocker.status !== "blocked") return;
    leaveBlocker.proceed();
  }
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!kit) return;
      await deleteBrandKit(kit.id);
    },
    onSuccess: () => {
      if (!kit) return;
      toast.success("Brand kit deleted");
      onDeleted(kit.id);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't delete brand kit.");
    }
  });
  function currentInput() {
    return {
      name: name.trim() || "Untitled",
      colors: paletteToColors(palette),
      font_id: fontPrimaryId,
      secondary_font_id: fontSecondaryId,
      logo_asset_id: logoAssetId,
      image_asset_ids: images.map((img) => img.asset_id),
      one_liner: oneLiner.trim() || null,
      brand_values: brandValues,
      tone_of_voice: toneOfVoice.trim() || null,
      website_url: websiteUrl.trim() || null
    };
  }
  async function ensureKitId() {
    if (draftKitIdRef.current) return draftKitIdRef.current;
    const created = await createBrandKit(currentInput());
    draftKitIdRef.current = created.id;
    return created.id;
  }
  function applyUpdatedKit(updated) {
    draftKitIdRef.current = updated.id;
    setLogoAssetId(updated.logo_asset_id);
    setLogoUrl(updated.logo_url);
    setImages(updated.images);
    setSavedSnapshot(getBrandKitSnapshot(updated));
    onSaved(updated);
  }
  async function handleLogoFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Logo must be a PNG, JPG or WebP image.");
      return;
    }
    setUploadingLogo(true);
    try {
      const kitId = await ensureKitId();
      applyUpdatedKit(await uploadBrandLogo(kitId, file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }
  async function handleRemoveLogo() {
    const kitId = draftKitIdRef.current;
    setDeletingLogo(true);
    try {
      if (!kitId) {
        setLogoAssetId(null);
        setLogoUrl(null);
        return;
      }
      applyUpdatedKit(await removeBrandLogo(kitId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't remove the logo.");
    } finally {
      setDeletingLogo(false);
    }
  }
  async function handleImageFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    if (images.length >= MAX_BRAND_IMAGES) {
      toast.error(`You've reached your max images quota of ${MAX_BRAND_IMAGES}.`);
      return;
    }
    const remainingSlots = MAX_BRAND_IMAGES - images.length;
    const files = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type)).slice(0, remainingSlots);
    if (files.length === 0) {
      toast.error("Images must be PNG, JPG or WebP.");
      return;
    }
    if (fileList.length > remainingSlots) {
      toast.info(`Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added.`);
    }
    setUploadingImages(true);
    try {
      const kitId = await ensureKitId();
      let updated = null;
      for (const [index, file] of files.entries()) {
        updated = await uploadBrandImage(kitId, file, images.length + index);
      }
      if (updated) applyUpdatedKit(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingImages(false);
      if (imagesInputRef.current) imagesInputRef.current.value = "";
    }
  }
  async function handleRemoveImage(assetId) {
    const kitId = draftKitIdRef.current;
    if (!kitId) {
      setImages((current) => current.filter((i) => i.asset_id !== assetId));
      return;
    }
    setDeletingImageIds((current) => new Set(current).add(assetId));
    try {
      applyUpdatedKit(await removeBrandImage(kitId, assetId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't remove the image.");
    } finally {
      setDeletingImageIds((current) => {
        const next = new Set(current);
        next.delete(assetId);
        return next;
      });
    }
  }
  function updatePalette(index, value) {
    setPalette((current) => current.map((entry, i) => i === index ? {
      ...entry,
      hex: value
    } : entry));
  }
  function removeSwatch(index) {
    setPalette((current) => current.filter((_, i) => i !== index));
  }
  function addSwatch(type, hex) {
    setPalette((current) => [...current, {
      type,
      hex
    }]);
  }
  function addValue() {
    const v = valueDraft.trim().slice(0, MAX_BRAND_VALUE_LENGTH);
    if (!v) return;
    if (brandValues.length >= MAX_BRAND_VALUES) {
      toast.error(`You can add up to ${MAX_BRAND_VALUES} brand values.`);
      return;
    }
    if (brandValues.includes(v)) {
      setValueDraft("");
      return;
    }
    setBrandValues((current) => [...current, v]);
    setValueDraft("");
  }
  function addToneOfVoice(value) {
    const tone = value.trim();
    if (!tone) return;
    if (toneOfVoiceValues.length >= MAX_TONE_OF_VOICE) {
      setTonePickerOpen(false);
      return;
    }
    const exists = toneOfVoiceValues.some((item) => item.toLowerCase() === tone.toLowerCase());
    if (exists) {
      setTonePickerOpen(false);
      return;
    }
    setToneOfVoice(serializeToneOfVoice([...toneOfVoiceValues, tone]));
    setTonePickerOpen(false);
  }
  function removeToneOfVoice(value) {
    setToneOfVoice(serializeToneOfVoice(toneOfVoiceValues.filter((item) => item !== value)));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: leaveBlocker.status === "blocked", onOpenChange: (open) => {
      if (!open && leaveBlocker.status === "blocked" && !saveMutation.isPending) {
        leaveBlocker.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Save changes?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "You have unsaved changes. Do you want to save them before leaving this page?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: saveMutation.isPending, children: "Stay" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: (event) => {
          event.preventDefault();
          handleDiscardAndLeave();
        }, disabled: saveMutation.isPending, className: "bg-secondary text-foreground hover:bg-accent", children: "Discard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogAction, { onClick: (event) => {
          event.preventDefault();
          void handleSaveAndLeave();
        }, disabled: saveMutation.isPending, className: "bg-foreground text-background hover:bg-foreground/90", children: [
          saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Brand name", className: "w-full bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: websiteUrl, onChange: (e) => setWebsiteUrl(e.target.value), placeholder: "yourbrand.com", className: "w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[200px_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Logo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => logoInputRef.current?.click(), disabled: uploadingLogo || deletingLogo, className: "relative mt-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[16px] border border-border bg-secondary text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50", children: uploadingLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) : logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Brand logo", className: `h-full w-full object-contain transition ${deletingLogo ? "scale-105 opacity-35 grayscale" : ""}` }),
              deletingLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-foreground" }) }) : null
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-col items-center gap-1.5 text-sm font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5" }),
              "Upload logo"
            ] }) }),
            logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void handleRemoveLogo(), disabled: deletingLogo, className: "mt-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", children: "Remove" }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: logoInputRef, type: "file", accept: ACCEPTED_TYPES.join(","), hidden: true, onChange: (e) => void handleLogoFiles(e.currentTarget.files) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Fonts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FontSlot, { fonts, loading: fontsQuery.isLoading, value: fontPrimaryId, onChange: setFontPrimaryId, placeholder: "Headline font" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FontSlot, { fonts, loading: fontsQuery.isLoading, value: fontSecondaryId, onChange: setFontSecondaryId, placeholder: "Body font" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Colors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-start gap-4", children: [
            palette.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Swatch, { type: entry.type, hex: entry.hex, onChange: (value) => updatePalette(index, value), onRemove: () => removeSwatch(index) }, entry.type)),
            (() => {
              const used = new Set(palette.map((entry) => entry.type));
              const available = COLOR_TYPES.filter((type) => !used.has(type));
              return available.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddColorButton, { availableTypes: available, onAdd: addSwatch }) : null;
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "One liner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: oneLiner, onChange: (e) => setOneLiner(e.target.value.slice(0, MAX_ONE_LINER_LENGTH)), maxLength: MAX_ONE_LINER_LENGTH, placeholder: "A short, punchy line that sums up your brand", rows: 2, className: "mt-3 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground", style: {
              fontFamily: oneLinerFont ? fontFamilyStack(oneLinerFont) : void 0
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-right text-xs text-muted-foreground", children: [
              oneLiner.length,
              "/",
              MAX_ONE_LINER_LENGTH
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Brand values" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: brandValues.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-[16px] bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground", children: [
              value,
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setBrandValues((current) => current.filter((v) => v !== value)), "aria-label": `Remove ${value}`, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }, value)) }),
            brandValues.length < MAX_BRAND_VALUES && /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: valueDraft, onChange: (e) => setValueDraft(e.target.value.slice(0, MAX_BRAND_VALUE_LENGTH)), maxLength: MAX_BRAND_VALUE_LENGTH, onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addValue();
              }
            }, onBlur: addValue, placeholder: "Add a value and press Enter", className: "mt-3 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Tone of voice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
            toneOfVoiceValues.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-[16px] bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground", children: [
              value,
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeToneOfVoice(value), "aria-label": `Remove ${value}`, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }, value)),
            toneOfVoiceValues.length < MAX_TONE_OF_VOICE && /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: tonePickerOpen, onOpenChange: setTonePickerOpen, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: availableToneOfVoicePresets.length === 0, className: "flex h-9 min-w-[180px] items-center justify-between gap-2 rounded-[16px] bg-secondary px-4 text-sm font-semibold text-foreground outline-none transition hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: availableToneOfVoicePresets.length > 0 ? "Add tone of voice" : "All tones added" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "start", sideOffset: 10, className: "w-[min(calc(100vw-32px),320px)] overflow-hidden rounded-[20px] border-0 bg-background p-0 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[320px] overflow-y-auto px-3 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-center text-xl font-bold", children: "Tone of voice" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: availableToneOfVoicePresets.map((tone) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => addToneOfVoice(tone), className: "flex h-12 w-full items-center rounded-[14px] px-4 text-left text-base font-semibold transition hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none", children: tone }, tone)) })
              ] }) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Images" }),
        images.length >= MAX_BRAND_IMAGES ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex h-32 flex-col items-center justify-center rounded-[16px] border border-border bg-secondary px-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold text-foreground", children: "You've reached your max images quota." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Remove an image to upload another one." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => imagesInputRef.current?.click(), disabled: uploadingImages, className: "mt-3 flex h-32 w-full items-center justify-center rounded-[16px] border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50", children: uploadingImages ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-col items-center gap-1.5 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5" }),
          "Upload an image"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: imagesInputRef, type: "file", multiple: true, accept: ACCEPTED_TYPES.join(","), hidden: true, onChange: (e) => void handleImageFiles(e.currentTarget.files) }),
        images.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-2 gap-3", children: images.map((image) => {
          const isDeleting = deletingImageIds.has(image.asset_id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative aspect-square overflow-hidden rounded-[14px] border border-border bg-secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image.thumbnail_url ?? image.preview_url ?? image.url, alt: "", className: `h-full w-full object-cover transition ${isDeleting ? "scale-105 opacity-35 grayscale" : ""}` }),
            isDeleting ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-foreground" }) }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: isDeleting, "aria-label": "Remove image", className: "absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete image?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action can't be undone. Are you sure you want to delete this image?" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => void handleRemoveImage(image.asset_id), className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Yes" })
                ] })
              ] })
            ] })
          ] }, image.asset_id);
        }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex h-24 items-center justify-center rounded-[14px] border border-border text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-col items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5" }),
          "Not set up yet"
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 z-10 mt-8 flex items-center justify-between gap-3 border-t border-border bg-background py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: kit ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: deleteMutation.isPending, className: "flex h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-muted-foreground transition hover:text-destructive disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
          "Delete"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete brand kit?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action can't be undone. Are you sure you want to delete this brand kit?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "No" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deleteMutation.mutate(), className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Yes" })
          ] })
        ] })
      ] }) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => saveMutation.mutate(), disabled: !hasUnsavedChanges || saveMutation.isPending, className: "flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40", children: [
        saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : null,
        kit ? "Save changes" : "Create brand kit"
      ] }) })
    ] })
  ] });
}
function Card({
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-[20px] border border-border bg-card p-5 ${className}`, children });
}
function SectionLabel({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-muted-foreground", children });
}
function isHexColor(value) {
  return HEX_COLOR_PATTERN.test(value.trim());
}
function normalizeHexColor(value) {
  const hex = value.trim();
  if (hex.length === 4) {
    return `#${hex.slice(1).split("").map((char) => char + char).join("")}`.toLowerCase();
  }
  return hex.toLowerCase();
}
function FontSlot({
  fonts,
  loading,
  value,
  onChange,
  placeholder
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const selectedFont = reactExports.useMemo(() => fonts.find((font) => font.id === value) ?? null, [fonts, value]);
  const results = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((font) => font.family.toLowerCase().includes(q));
  }, [fonts, query]);
  function handleSelect(id) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }
  function handleOpenChange(next) {
    setOpen(next);
    if (!next) setQuery("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "group relative flex w-full flex-col items-start rounded-[16px] border border-border px-4 py-3 text-left transition hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-foreground", style: {
        fontFamily: selectedFont ? fontFamilyStack(selectedFont) : void 0
      }, children: "Aa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 truncate text-sm font-semibold text-foreground", children: selectedFont ? selectedFont.family : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: placeholder }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-data-[state=open]:opacity-100" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "start", sideOffset: 8, className: "w-[var(--radix-popover-trigger-width)] min-w-[240px] rounded-[16px] p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search fonts...", className: "w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[280px] overflow-y-auto py-1", children: [
        value && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelect(null), className: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 shrink-0" }),
          "Clear selection"
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Loading fonts…"
        ] }) : results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: "No fonts found" }) : results.map((font) => {
          const selected = font.id === value;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelect(font.id), className: "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-accent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-lg text-foreground", style: {
              fontFamily: fontFamilyStack(font)
            }, children: font.family }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: font.category }),
              selected && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-foreground" })
            ] })
          ] }, font.id);
        })
      ] })
    ] })
  ] });
}
function Swatch({
  type,
  hex,
  onChange,
  onRemove
}) {
  const valid = isHexColor(hex);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: COLOR_TYPE_LABELS[type] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-14 w-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "block h-14 w-14 overflow-hidden rounded-full border border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", style: {
          backgroundColor: valid ? hex : "transparent"
        }, "aria-label": `Edit ${COLOR_TYPE_LABELS[type].toLowerCase()} color` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "start", sideOffset: 8, className: "w-[236px] rounded-[16px] p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandColorPicker, { hex, onChange }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRemove, "aria-label": "Remove color", className: "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground opacity-0 shadow transition group-hover:opacity-100 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: hex, onChange: (e) => onChange(e.target.value), spellCheck: false, className: "w-16 bg-transparent text-center text-xs font-semibold text-muted-foreground outline-none" })
  ] });
}
function BrandColorPicker({
  hex,
  onChange
}) {
  const valid = isHexColor(hex);
  const pickerColor = valid ? normalizeHexColor(hex) : DEFAULT_NEW_COLOR;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Z, { color: pickerColor, onChange, className: "brand-color-picker", style: {
      width: "100%",
      height: 190
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Oe, { color: hex, onChange, prefixed: true, "aria-label": "Hex color", className: "mt-3 h-10 w-full rounded-[16px] border border-border bg-background px-3 text-center text-sm font-semibold text-foreground outline-none focus:border-foreground/40" })
  ] });
}
function AddColorButton({
  availableTypes,
  onAdd
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [hex, setHex] = reactExports.useState(DEFAULT_NEW_COLOR);
  const [type, setType] = reactExports.useState(availableTypes[0]);
  const valid = isHexColor(hex);
  const pickerColor = valid ? normalizeHexColor(hex) : DEFAULT_NEW_COLOR;
  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (nextOpen) {
      setHex(DEFAULT_NEW_COLOR);
      setType(availableTypes[0]);
    }
  }
  function handleAdd() {
    if (!valid) return;
    onAdd(type, normalizeHexColor(hex));
    setOpen(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-[16px]", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", "aria-label": "Add color", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "start", sideOffset: 8, className: "w-[236px] rounded-[16px] p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex flex-wrap gap-1.5", children: availableTypes.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setType(option), className: `rounded-full px-2.5 py-1 text-xs font-semibold transition ${option === type ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`, children: COLOR_TYPE_LABELS[option] }, option)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Z, { color: pickerColor, onChange: setHex, className: "brand-color-picker", style: {
        width: "100%",
        height: 190
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Oe, { color: hex, onChange: setHex, prefixed: true, "aria-label": "Hex color", onKeyDown: (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleAdd();
          }
        }, className: "min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleAdd, disabled: !valid, className: "h-9 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40", children: "Add" })
      ] })
    ] })
  ] });
}
function SignedOutState() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Sign in to set up your Brand Kit" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-base text-muted-foreground", children: "Save your logo, colors, fonts and brand voice so every generation stays on-brand." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => requestAuthDialog(), className: "mt-6 h-11 rounded-full bg-foreground px-6 text-[15px] font-semibold text-background hover:opacity-90", children: "Sign in" })
  ] });
}
function LoadingState() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse", "aria-label": "Loading brand kit", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-10 w-28 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-10 w-24 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-10 w-32 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-9 w-64 max-w-full rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-4 rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-5 w-48 max-w-full rounded-lg" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[200px_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-12 rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mt-3 aspect-square w-full rounded-[16px]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mx-auto mt-3 h-4 w-16 rounded" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-12 rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-24 rounded-[16px]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-24 rounded-[16px]" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-14 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap items-start gap-4", children: Array.from({
            length: 5
          }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-14 w-14 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-3 w-14 rounded" })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-20 rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mt-4 h-5 w-full rounded-lg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mt-3 h-5 w-3/4 rounded-lg" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-24 rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-8 w-20 rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-8 w-24 rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-8 w-16 rounded-full" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mt-4 h-5 w-48 max-w-full rounded-lg" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-24 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mt-4 h-5 w-72 max-w-full rounded-lg" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-4 w-14 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "mt-3 h-32 w-full rounded-[16px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "aspect-square rounded-[14px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "aspect-square rounded-[14px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "aspect-square rounded-[14px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "aspect-square rounded-[14px]" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between gap-3 border-t border-border bg-background py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-11 w-24 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-11 w-20 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonBlock, { className: "h-11 w-36 rounded-full" })
      ] })
    ] })
  ] });
}
function SkeletonBlock({
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `bg-secondary ${className}` });
}
function ErrorState({
  message,
  onRetry
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRetry, className: "mt-4 h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground hover:bg-accent", children: "Try again" })
  ] });
}
export {
  BrandKitPage as component
};

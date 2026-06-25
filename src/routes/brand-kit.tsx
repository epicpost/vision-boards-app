import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import {
  Check,
  ChevronDown,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AUTH_SESSION_CHANGED_EVENT, hasAuthSession, requestAuthDialog } from "@/lib/auth";
import {
  type Font,
  FONTS_CACHE_TTL_MS,
  ensureFontsLoaded,
  fetchFonts,
  fontFamilyStack,
  fontsQueryKey,
  readCachedFonts,
} from "@/lib/fonts";
import {
  type BrandImage,
  type BrandKit,
  type BrandKitInput,
  type ColorType,
  type PaletteEntry,
  COLOR_TYPES,
  COLOR_TYPE_LABELS,
  MAX_BRAND_IMAGES,
  brandKitsQueryKey,
  colorsToPalette,
  createBrandKit,
  deleteBrandKit,
  fetchBrandKits,
  paletteToColors,
  removeBrandImage,
  removeBrandLogo,
  updateBrandKit,
  uploadBrandImage,
  uploadBrandLogo,
} from "@/lib/brand-kit";

export const Route = createFileRoute("/brand-kit")({
  head: () => ({
    meta: [
      { title: "Brand Kit" },
      {
        name: "description",
        content: "Set up your brand DNA so every generation stays on-brand.",
      },
    ],
  }),
  component: BrandKitPage,
});

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_TONE_OF_VOICE = 3;
const MAX_BRAND_VALUES = 5;
const MAX_BRAND_VALUE_LENGTH = 60;
const MAX_ONE_LINER_LENGTH = 140;
const DEFAULT_NEW_COLOR = "#888888";
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TONE_OF_VOICE_PRESETS = [
  "Playful",
  "Bold",
  "Friendly",
  "Confident",
  "Professional",
  "Warm",
  "Witty",
  "Minimal",
  "Premium",
  "Inspirational",
];

function areArraysEqual<T>(first: T[], second: T[]) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function arePalettesEqual(first: PaletteEntry[], second: PaletteEntry[]) {
  return (
    first.length === second.length &&
    first.every(
      (entry, index) => entry.type === second[index].type && entry.hex === second[index].hex,
    )
  );
}

function areImagesEqual(first: BrandImage[], second: BrandImage[]) {
  return areArraysEqual(
    first.map((image) => image.asset_id),
    second.map((image) => image.asset_id),
  );
}

function parseToneOfVoice(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeToneOfVoice(values: string[]) {
  return values.join(", ");
}

function getBrandKitSnapshot(kit: BrandKit | null) {
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
    images: kit?.images ?? [],
  };
}

function BrandKitPage() {
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);

  useEffect(() => {
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
    enabled: signedIn,
  });

  const kits = kitsQuery.data;

  // Default the selection to the first kit, or to a blank "new" form.
  useEffect(() => {
    if (!kits) return;
    if (selectedId === "new") return;
    if (selectedId && kits.some((k) => k.id === selectedId)) return;
    setSelectedId(kits[0]?.id ?? "new");
  }, [kits, selectedId]);

  const selectedKit =
    selectedId && selectedId !== "new" ? (kits?.find((k) => k.id === selectedId) ?? null) : null;

  function handleSaved(saved: BrandKit) {
    queryClient.setQueryData<BrandKit[]>(brandKitsQueryKey(), (old) => {
      const list = old ?? [];
      return list.some((k) => k.id === saved.id)
        ? list.map((k) => (k.id === saved.id ? saved : k))
        : [saved, ...list];
    });
    setSelectedId(saved.id);
    void queryClient.invalidateQueries({ queryKey: brandKitsQueryKey() });
  }

  function handleDeleted(deletedId: string) {
    queryClient.setQueryData<BrandKit[]>(brandKitsQueryKey(), (old) =>
      (old ?? []).filter((k) => k.id !== deletedId),
    );
    setSelectedId(null);
    void queryClient.invalidateQueries({ queryKey: brandKitsQueryKey() });
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-2 md:px-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Brand Kit</h1>
              <p className="mt-2 text-base text-muted-foreground">
                Set up your brand DNA — logo, colors, fonts and voice. Every remix and generation
                stays aligned to it.
              </p>
            </div>
            {signedIn && !kitsQuery.isLoading && !kitsQuery.isError ? <KitActions /> : null}
          </header>

          {!signedIn ? (
            <SignedOutState />
          ) : kitsQuery.isLoading ? (
            <LoadingState />
          ) : kitsQuery.isError ? (
            <ErrorState
              message={
                kitsQuery.error instanceof Error
                  ? kitsQuery.error.message
                  : "Couldn't load your brand kits."
              }
              onRetry={() => void kitsQuery.refetch()}
            />
          ) : (
            <BrandKitEditor
              key={selectedId ?? "loading"}
              kit={selectedKit}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
            />
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

// ── kit switcher ──────────────────────────────────────────────────────────────

function KitActions() {
  const [importOpen, setImportOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

  function handleImportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl) return;

    setWebsiteUrl("");
    setImportOpen(false);
  }

  return (
    <>
      <div className="flex sm:pt-2">
        <button
          onClick={() => setImportOpen(true)}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#e60023] px-5 text-[15px] font-semibold text-white transition hover:bg-[#ad081b]"
        >
          <Link2 className="h-4 w-4" strokeWidth={2.4} />
          Import from URL
        </button>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md rounded-[20px] p-6">
          <DialogHeader>
            <DialogTitle>Import from URL</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleImportSubmit}>
            <label className="text-sm font-semibold text-muted-foreground" htmlFor="brand-url">
              Website URL
            </label>
            <div className="mt-2 flex h-12 items-center gap-2 rounded-[16px] border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-ring">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="brand-url"
                type="url"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://yourbrand.com"
                className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <DialogFooter className="mt-6 gap-2 sm:space-x-0">
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!websiteUrl.trim()}
                className="h-11 rounded-full bg-foreground px-5 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Import
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── editor ────────────────────────────────────────────────────────────────────

function BrandKitEditor({
  kit,
  onSaved,
  onDeleted,
}: {
  kit: BrandKit | null;
  onSaved: (kit: BrandKit) => void;
  onDeleted: (deletedId: string) => void;
}) {
  const initial = useMemo(() => getBrandKitSnapshot(kit), [kit]);

  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const [name, setName] = useState(initial.name);
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
  const [fontPrimaryId, setFontPrimaryId] = useState<string | null>(initial.fontPrimaryId);
  const [fontSecondaryId, setFontSecondaryId] = useState<string | null>(initial.fontSecondaryId);
  const [oneLiner, setOneLiner] = useState(initial.oneLiner);
  const [toneOfVoice, setToneOfVoice] = useState(initial.toneOfVoice);
  const [tonePickerOpen, setTonePickerOpen] = useState(false);
  const [palette, setPalette] = useState<PaletteEntry[]>(initial.palette);
  const [brandValues, setBrandValues] = useState<string[]>(initial.brandValues);
  const [valueDraft, setValueDraft] = useState("");
  const [logoAssetId, setLogoAssetId] = useState<string | null>(initial.logoAssetId);
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);
  const [images, setImages] = useState<BrandImage[]>(initial.images);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [deletingImageIds, setDeletingImageIds] = useState<Set<string>>(new Set());

  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  // When uploading onto a brand-new (unsaved) kit we auto-create the profile
  // first; this remembers its id so a second upload before the remount doesn't
  // create a duplicate.
  const draftKitIdRef = useRef<string | null>(kit?.id ?? null);

  // The selectable font catalog (reference data) lives in the DB; brand kits
  // reference a typeface by its `font_id`.
  const fontsQuery = useQuery({
    queryKey: fontsQueryKey(),
    queryFn: fetchFonts,
    // Seed from the persisted cache so the picker renders instantly and skips the
    // network entirely while the local copy is still fresh.
    initialData: () => readCachedFonts() ?? undefined,
    staleTime: FONTS_CACHE_TTL_MS,
    gcTime: FONTS_CACHE_TTL_MS,
  });
  const fonts = useMemo(() => fontsQuery.data ?? [], [fontsQuery.data]);

  useEffect(() => {
    ensureFontsLoaded(fonts);
  }, [fonts]);

  const primaryFont = useMemo(
    () => fonts.find((font) => font.id === fontPrimaryId) ?? null,
    [fonts, fontPrimaryId],
  );
  const secondaryFont = useMemo(
    () => fonts.find((font) => font.id === fontSecondaryId) ?? null,
    [fonts, fontSecondaryId],
  );
  const oneLinerFont = secondaryFont ?? primaryFont;
  const toneOfVoiceValues = useMemo(() => parseToneOfVoice(toneOfVoice), [toneOfVoice]);
  const availableToneOfVoicePresets = useMemo(() => {
    const selected = new Set(toneOfVoiceValues.map((tone) => tone.toLowerCase()));
    return TONE_OF_VOICE_PRESETS.filter((tone) => !selected.has(tone.toLowerCase()));
  }, [toneOfVoiceValues]);

  const hasUnsavedChanges =
    name !== savedSnapshot.name ||
    websiteUrl !== savedSnapshot.websiteUrl ||
    fontPrimaryId !== savedSnapshot.fontPrimaryId ||
    fontSecondaryId !== savedSnapshot.fontSecondaryId ||
    oneLiner !== savedSnapshot.oneLiner ||
    toneOfVoice !== savedSnapshot.toneOfVoice ||
    logoAssetId !== savedSnapshot.logoAssetId ||
    logoUrl !== savedSnapshot.logoUrl ||
    !arePalettesEqual(palette, savedSnapshot.palette) ||
    !areArraysEqual(brandValues, savedSnapshot.brandValues) ||
    !areImagesEqual(images, savedSnapshot.images);

  const shouldBlockLeave = useCallback(
    ({ current, next }: { current: { pathname: string }; next: { pathname: string } }) =>
      hasUnsavedChanges && current.pathname !== next.pathname,
    [hasUnsavedChanges],
  );

  const leaveBlocker = useBlocker({
    shouldBlockFn: shouldBlockLeave,
    enableBeforeUnload: hasUnsavedChanges,
    withResolver: true,
  });

  function applySnapshot(snapshot: ReturnType<typeof getBrandKitSnapshot>) {
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
      const input: BrandKitInput = {
        name: trimmed,
        colors: paletteToColors(palette),
        font_id: fontPrimaryId,
        secondary_font_id: fontSecondaryId,
        logo_asset_id: logoAssetId,
        image_asset_ids: images.map((img) => img.asset_id),
        one_liner: oneLiner.trim() || null,
        brand_values: brandValues,
        tone_of_voice: toneOfVoice.trim() || null,
        website_url: websiteUrl.trim() || null,
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
    },
  });

  async function handleSaveAndLeave() {
    if (leaveBlocker.status !== "blocked") return;
    try {
      await saveMutation.mutateAsync();
      leaveBlocker.proceed();
    } catch {
      // saveMutation.onError already reports the failure.
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
    },
  });

  function currentInput(): BrandKitInput {
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
      website_url: websiteUrl.trim() || null,
    };
  }

  // Uploads are profile-scoped, so make sure a profile exists first. For a
  // brand-new kit this persists the in-progress form as a draft and returns its
  // id (the upload then attaches to it).
  async function ensureKitId(): Promise<string> {
    if (draftKitIdRef.current) return draftKitIdRef.current;
    const created = await createBrandKit(currentInput());
    draftKitIdRef.current = created.id;
    return created.id;
  }

  function applyUpdatedKit(updated: BrandKit) {
    draftKitIdRef.current = updated.id;
    setLogoAssetId(updated.logo_asset_id);
    setLogoUrl(updated.logo_url);
    setImages(updated.images);
    setSavedSnapshot(getBrandKitSnapshot(updated));
    // Push into the cache; for a new kit this switches selection (remount with a
    // fresh baseline), for an existing kit it just refreshes the data in place.
    onSaved(updated);
  }

  async function handleLogoFiles(fileList: FileList | null) {
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
      // Nothing persisted yet: just clear the local selection.
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

  async function handleImageFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (images.length >= MAX_BRAND_IMAGES) {
      toast.error(`You've reached your max images quota of ${MAX_BRAND_IMAGES}.`);
      return;
    }
    const remainingSlots = MAX_BRAND_IMAGES - images.length;
    const files = Array.from(fileList)
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .slice(0, remainingSlots);
    if (files.length === 0) {
      toast.error("Images must be PNG, JPG or WebP.");
      return;
    }
    if (fileList.length > remainingSlots) {
      toast.info(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added.`,
      );
    }
    setUploadingImages(true);
    try {
      const kitId = await ensureKitId();
      // One request per file; each returns the full updated profile.
      let updated: BrandKit | null = null;
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

  async function handleRemoveImage(assetId: string) {
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

  function updatePalette(index: number, value: string) {
    setPalette((current) =>
      current.map((entry, i) => (i === index ? { ...entry, hex: value } : entry)),
    );
  }

  function removeSwatch(index: number) {
    setPalette((current) => current.filter((_, i) => i !== index));
  }

  function addSwatch(type: ColorType, hex: string) {
    setPalette((current) => [...current, { type, hex }]);
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

  function addToneOfVoice(value: string) {
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

  function removeToneOfVoice(value: string) {
    setToneOfVoice(serializeToneOfVoice(toneOfVoiceValues.filter((item) => item !== value)));
  }

  return (
    <div>
      <AlertDialog
        open={leaveBlocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open && leaveBlocker.status === "blocked" && !saveMutation.isPending) {
            leaveBlocker.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before leaving this page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saveMutation.isPending}>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDiscardAndLeave();
              }}
              disabled={saveMutation.isPending}
              className="bg-secondary text-foreground hover:bg-accent"
            >
              Discard
            </AlertDialogAction>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleSaveAndLeave();
              }}
              disabled={saveMutation.isPending}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* Header — name + website */}
          <Card>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brand name"
              className="w-full bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-3 flex items-center gap-2 text-muted-foreground">
              <Link2 className="h-4 w-4 shrink-0" />
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="yourbrand.com"
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Card>

          {/* Logo + Fonts */}
          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <Card className="group flex flex-col">
              <SectionLabel>Logo</SectionLabel>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo || deletingLogo}
                className="relative mt-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[16px] border border-border bg-secondary text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt="Brand logo"
                      className={`h-full w-full object-contain transition ${
                        deletingLogo ? "scale-105 opacity-35 grayscale" : ""
                      }`}
                    />
                    {deletingLogo ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-sm font-semibold">
                    <Upload className="h-5 w-5" />
                    Upload logo
                  </span>
                )}
              </button>
              {logoUrl ? (
                <button
                  onClick={() => void handleRemoveLogo()}
                  disabled={deletingLogo}
                  className="mt-2 text-sm font-semibold text-muted-foreground opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
              <input
                ref={logoInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                hidden
                onChange={(e) => void handleLogoFiles(e.currentTarget.files)}
              />
            </Card>

            <Card>
              <SectionLabel>Fonts</SectionLabel>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <FontSlot
                  fonts={fonts}
                  loading={fontsQuery.isLoading}
                  value={fontPrimaryId}
                  onChange={setFontPrimaryId}
                  placeholder="Headline font"
                />
                <FontSlot
                  fonts={fonts}
                  loading={fontsQuery.isLoading}
                  value={fontSecondaryId}
                  onChange={setFontSecondaryId}
                  placeholder="Body font"
                />
              </div>
            </Card>
          </div>

          {/* Colors */}
          <Card className="group/colors">
            <SectionLabel>Colors</SectionLabel>
            <div className="mt-4 flex flex-wrap items-start gap-4">
              {palette.map((entry, index) => (
                <Swatch
                  key={entry.type}
                  type={entry.type}
                  hex={entry.hex}
                  onChange={(value) => updatePalette(index, value)}
                  onRemove={() => removeSwatch(index)}
                />
              ))}
              {(() => {
                const used = new Set(palette.map((entry) => entry.type));
                const available = COLOR_TYPES.filter((type) => !used.has(type));
                return available.length > 0 ? (
                  <AddColorButton
                    availableTypes={available}
                    onAdd={addSwatch}
                    className="opacity-0 transition group-hover/colors:opacity-100 group-focus-within/colors:opacity-100"
                  />
                ) : null;
              })()}
            </div>
          </Card>

          {/* One liner + Brand values */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="group/one-liner">
              <SectionLabel>One liner</SectionLabel>
              <textarea
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value.slice(0, MAX_ONE_LINER_LENGTH))}
                maxLength={MAX_ONE_LINER_LENGTH}
                placeholder="A short, punchy line that sums up your brand"
                rows={2}
                className="mt-3 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                style={{ fontFamily: oneLinerFont ? fontFamilyStack(oneLinerFont) : undefined }}
              />
              <p className="mt-2 text-right text-xs text-muted-foreground opacity-0 transition group-hover/one-liner:opacity-100 group-focus-within/one-liner:opacity-100">
                {oneLiner.length}/{MAX_ONE_LINER_LENGTH}
              </p>
            </Card>

            <Card>
              <SectionLabel>Brand values</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {brandValues.map((value) => (
                  <span
                    key={value}
                    className="group/value flex items-center gap-1.5 rounded-[16px] border border-secondary bg-transparent px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-secondary focus-within:bg-secondary"
                  >
                    {value}
                    <button
                      onClick={() =>
                        setBrandValues((current) => current.filter((v) => v !== value))
                      }
                      aria-label={`Remove ${value}`}
                      className="text-muted-foreground opacity-0 transition group-hover/value:opacity-100 group-focus-within/value:opacity-100 hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {brandValues.length < MAX_BRAND_VALUES && (
                <input
                  value={valueDraft}
                  onChange={(e) => setValueDraft(e.target.value.slice(0, MAX_BRAND_VALUE_LENGTH))}
                  maxLength={MAX_BRAND_VALUE_LENGTH}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addValue();
                    }
                  }}
                  onBlur={addValue}
                  placeholder="Add a value and press Enter"
                  className="mt-3 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
              )}
            </Card>
          </div>

          {/* Tone of voice */}
          <Card>
            <SectionLabel>Tone of voice</SectionLabel>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {toneOfVoiceValues.map((value) => (
                <span
                  key={value}
                  className="group/tone flex items-center gap-1.5 rounded-[16px] bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground"
                >
                  {value}
                  <button
                    onClick={() => removeToneOfVoice(value)}
                    aria-label={`Remove ${value}`}
                    className="text-muted-foreground opacity-0 transition group-hover/tone:opacity-100 group-focus-within/tone:opacity-100 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {toneOfVoiceValues.length < MAX_TONE_OF_VOICE && (
                <Popover open={tonePickerOpen} onOpenChange={setTonePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={availableToneOfVoicePresets.length === 0}
                      className="flex h-9 min-w-[180px] items-center justify-between gap-2 rounded-[16px] bg-secondary px-4 text-sm font-semibold text-foreground outline-none transition hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>
                        {availableToneOfVoicePresets.length > 0
                          ? "Add tone of voice"
                          : "All tones added"}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={10}
                    className="w-[min(calc(100vw-32px),320px)] overflow-hidden rounded-[20px] border-0 bg-background p-0 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
                  >
                    <div className="max-h-[320px] overflow-y-auto px-3 py-3">
                      <h3 className="mb-2 text-center text-xl font-bold">Tone of voice</h3>
                      <div className="space-y-1">
                        {availableToneOfVoicePresets.map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => addToneOfVoice(tone)}
                            className="flex h-12 w-full items-center rounded-[14px] px-4 text-left text-base font-semibold transition hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </Card>
        </div>

        {/* Images panel */}
        <div className="lg:col-span-1">
          <Card>
            <SectionLabel>Images</SectionLabel>
            {images.length >= MAX_BRAND_IMAGES ? (
              <div className="mt-3 flex h-32 flex-col items-center justify-center rounded-[16px] border border-border bg-secondary px-4 text-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold text-foreground">
                  You've reached your max images quota.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Remove an image to upload another one.
                </p>
              </div>
            ) : (
              <button
                onClick={() => imagesInputRef.current?.click()}
                disabled={uploadingImages}
                className="mt-3 flex h-32 w-full items-center justify-center rounded-[16px] border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
              >
                {uploadingImages ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-sm font-semibold">
                    <Upload className="h-5 w-5" />
                    Upload an image
                  </span>
                )}
              </button>
            )}
            <input
              ref={imagesInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              hidden
              onChange={(e) => void handleImageFiles(e.currentTarget.files)}
            />

            {images.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {images.map((image) => {
                  const isDeleting = deletingImageIds.has(image.asset_id);

                  return (
                    <div
                      key={image.asset_id}
                      className="group relative aspect-square overflow-hidden rounded-[14px] border border-border bg-secondary"
                    >
                      <img
                        src={image.thumbnail_url ?? image.preview_url ?? image.url}
                        alt=""
                        className={`h-full w-full object-cover transition ${
                          isDeleting ? "scale-105 opacity-35 grayscale" : ""
                        }`}
                      />
                      {isDeleting ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                          <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                        </div>
                      ) : null}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={isDeleting}
                            aria-label="Remove image"
                            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete image?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action can't be undone. Are you sure you want to delete this
                              image?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void handleRemoveImage(image.asset_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 flex h-24 items-center justify-center rounded-[14px] border border-border text-sm text-muted-foreground">
                <span className="flex flex-col items-center gap-1.5">
                  <ImageIcon className="h-5 w-5" />
                  Not set up yet
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between gap-3 border-t border-border bg-background py-4">
        <div>
          {kit ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={deleteMutation.isPending}
                  className="flex h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-muted-foreground transition hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete brand kit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action can't be undone. Are you sure you want to delete this brand kit?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!hasUnsavedChanges || saveMutation.isPending}
            className="flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {kit ? "Save changes" : "Create brand kit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── small building blocks ───────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-border bg-card p-5 ${className}`}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-muted-foreground">{children}</div>;
}

function isHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value.trim());
}

function normalizeHexColor(value: string) {
  const hex = value.trim();
  if (hex.length === 4) {
    return `#${hex
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("")}`.toLowerCase();
  }
  return hex.toLowerCase();
}

function FontSlot({
  fonts,
  loading,
  value,
  onChange,
  placeholder,
}: {
  fonts: Font[];
  loading: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedFont = useMemo(
    () => fonts.find((font) => font.id === value) ?? null,
    [fonts, value],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((font) => font.family.toLowerCase().includes(q));
  }, [fonts, query]);

  function handleSelect(id: string | null) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group relative flex w-full flex-col items-start rounded-[16px] border border-border px-4 py-3 text-left transition hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <span
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: selectedFont ? fontFamilyStack(selectedFont) : undefined }}
          >
            Aa
          </span>
          <span className="mt-2 truncate text-sm font-semibold text-foreground">
            {selectedFont ? (
              selectedFont.family
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-data-[state=open]:opacity-100" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] rounded-[16px] p-0"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fonts..."
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto py-1">
          {value && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent"
            >
              <X className="h-4 w-4 shrink-0" />
              Clear selection
            </button>
          )}
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading fonts…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No fonts found
            </div>
          ) : (
            results.map((font) => {
              const selected = font.id === value;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleSelect(font.id)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-accent"
                >
                  <span
                    className="truncate text-lg text-foreground"
                    style={{ fontFamily: fontFamilyStack(font) }}
                  >
                    {font.family}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">{font.category}</span>
                    {selected && <Check className="h-4 w-4 text-foreground" />}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Swatch({
  type,
  hex,
  onChange,
  onRemove,
}: {
  type: ColorType;
  hex: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const valid = isHexColor(hex);
  return (
    <div className="group flex flex-col items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {COLOR_TYPE_LABELS[type]}
      </span>
      <div className="relative h-14 w-14">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="block h-14 w-14 overflow-hidden rounded-full border border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={{ backgroundColor: valid ? hex : "transparent" }}
              aria-label={`Edit ${COLOR_TYPE_LABELS[type].toLowerCase()} color`}
            />
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-[236px] rounded-[16px] p-3">
            <BrandColorPicker hex={hex} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <button
          onClick={onRemove}
          aria-label="Remove color"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground opacity-0 shadow transition group-hover:opacity-100 hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <input
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-16 bg-transparent text-center text-xs font-semibold text-muted-foreground outline-none"
      />
    </div>
  );
}

function BrandColorPicker({ hex, onChange }: { hex: string; onChange: (value: string) => void }) {
  const valid = isHexColor(hex);
  const pickerColor = valid ? normalizeHexColor(hex) : DEFAULT_NEW_COLOR;

  return (
    <>
      <HexColorPicker
        color={pickerColor}
        onChange={onChange}
        className="brand-color-picker"
        style={{ width: "100%", height: 190 }}
      />
      <HexColorInput
        color={hex}
        onChange={onChange}
        prefixed
        aria-label="Hex color"
        className="mt-3 h-10 w-full rounded-[16px] border border-border bg-background px-3 text-center text-sm font-semibold text-foreground outline-none focus:border-foreground/40"
      />
    </>
  );
}

function AddColorButton({
  availableTypes,
  onAdd,
  className = "",
}: {
  availableTypes: readonly ColorType[];
  onAdd: (type: ColorType, hex: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(DEFAULT_NEW_COLOR);
  const [type, setType] = useState<ColorType>(availableTypes[0]);
  const valid = isHexColor(hex);
  const pickerColor = valid ? normalizeHexColor(hex) : DEFAULT_NEW_COLOR;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setHex(DEFAULT_NEW_COLOR);
      // Default to the first still-unused role each time the picker opens.
      setType(availableTypes[0]);
    }
  }

  function handleAdd() {
    if (!valid) return;
    onAdd(type, normalizeHexColor(hex));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={`flex flex-col items-center gap-1.5 ${className}`}>
        <span className="h-[16px]" aria-hidden="true" />
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Add color"
          >
            <Plus className="h-5 w-5" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="start" sideOffset={8} className="w-[236px] rounded-[16px] p-3">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {availableTypes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                option === type
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {COLOR_TYPE_LABELS[option]}
            </button>
          ))}
        </div>
        <HexColorPicker
          color={pickerColor}
          onChange={setHex}
          className="brand-color-picker"
          style={{ width: "100%", height: 190 }}
        />
        <div className="mt-3 flex items-center gap-2">
          <HexColorInput
            color={hex}
            onChange={setHex}
            prefixed
            aria-label="Hex color"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-foreground/40"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!valid}
            className="h-9 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── states ──────────────────────────────────────────────────────────────────

function SignedOutState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-16 text-center">
      <h2 className="text-xl font-bold text-foreground">Sign in to set up your Brand Kit</h2>
      <p className="mt-2 max-w-md text-base text-muted-foreground">
        Save your logo, colors, fonts and brand voice so every generation stays on-brand.
      </p>
      <button
        onClick={() => requestAuthDialog()}
        className="mt-6 h-11 rounded-full bg-foreground px-6 text-[15px] font-semibold text-background hover:opacity-90"
      >
        Sign in
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse" aria-label="Loading brand kit">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-10 w-28 rounded-full" />
        <SkeletonBlock className="h-10 w-24 rounded-full" />
        <SkeletonBlock className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Card>
            <SkeletonBlock className="h-9 w-64 max-w-full rounded-lg" />
            <div className="mt-4 flex items-center gap-2">
              <SkeletonBlock className="h-4 w-4 rounded" />
              <SkeletonBlock className="h-5 w-48 max-w-full rounded-lg" />
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <Card className="flex flex-col">
              <SkeletonBlock className="h-4 w-12 rounded" />
              <SkeletonBlock className="mt-3 aspect-square w-full rounded-[16px]" />
              <SkeletonBlock className="mx-auto mt-3 h-4 w-16 rounded" />
            </Card>

            <Card>
              <SkeletonBlock className="h-4 w-12 rounded" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <SkeletonBlock className="h-24 rounded-[16px]" />
                <SkeletonBlock className="h-24 rounded-[16px]" />
              </div>
            </Card>
          </div>

          <Card>
            <SkeletonBlock className="h-4 w-14 rounded" />
            <div className="mt-4 flex flex-wrap items-start gap-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <SkeletonBlock className="h-14 w-14 rounded-full" />
                  <SkeletonBlock className="h-3 w-14 rounded" />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <SkeletonBlock className="h-4 w-20 rounded" />
              <SkeletonBlock className="mt-4 h-5 w-full rounded-lg" />
              <SkeletonBlock className="mt-3 h-5 w-3/4 rounded-lg" />
            </Card>

            <Card>
              <SkeletonBlock className="h-4 w-24 rounded" />
              <div className="mt-4 flex flex-wrap gap-2">
                <SkeletonBlock className="h-8 w-20 rounded-full" />
                <SkeletonBlock className="h-8 w-24 rounded-full" />
                <SkeletonBlock className="h-8 w-16 rounded-full" />
              </div>
              <SkeletonBlock className="mt-4 h-5 w-48 max-w-full rounded-lg" />
            </Card>
          </div>

          <Card>
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="mt-4 h-5 w-72 max-w-full rounded-lg" />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <SkeletonBlock className="h-4 w-14 rounded" />
            <SkeletonBlock className="mt-3 h-32 w-full rounded-[16px]" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <SkeletonBlock className="aspect-square rounded-[14px]" />
              <SkeletonBlock className="aspect-square rounded-[14px]" />
              <SkeletonBlock className="aspect-square rounded-[14px]" />
              <SkeletonBlock className="aspect-square rounded-[14px]" />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-border bg-background py-4">
        <SkeletonBlock className="h-11 w-24 rounded-full" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-11 w-20 rounded-full" />
          <SkeletonBlock className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-secondary ${className}`} />;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-16 text-center">
      <p className="text-base text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}

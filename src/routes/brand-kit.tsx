import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Image as ImageIcon, Link2, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
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
  type BrandImage,
  type BrandKit,
  type BrandKitInput,
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
const DEFAULT_NEW_COLOR = "#888888";
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function areArraysEqual<T>(first: T[], second: T[]) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function areImagesEqual(first: BrandImage[], second: BrandImage[]) {
  return areArraysEqual(
    first.map((image) => image.asset_id),
    second.map((image) => image.asset_id),
  );
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
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Brand Kit</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Set up your brand DNA — logo, colors, fonts and voice. Every remix and generation
              stays aligned to it.
            </p>
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
            <>
              <KitSwitcher kits={kits ?? []} selectedId={selectedId} onSelect={setSelectedId} />
              <BrandKitEditor
                key={selectedId ?? "loading"}
                kit={selectedKit}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
              />
            </>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

// ── kit switcher ──────────────────────────────────────────────────────────────

function KitSwitcher({
  kits,
  selectedId,
  onSelect,
}: {
  kits: BrandKit[];
  selectedId: string | "new" | null;
  onSelect: (id: string | "new") => void;
}) {
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
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {kits.map((kit) => (
          <button
            key={kit.id}
            onClick={() => onSelect(kit.id)}
            className={`h-10 rounded-full px-4 text-[15px] font-semibold transition ${
              selectedId === kit.id
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:bg-accent"
            }`}
          >
            {kit.name || "Untitled"}
          </button>
        ))}
        <button
          onClick={() => setImportOpen(true)}
          className="flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[15px] font-semibold text-background transition hover:opacity-90"
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
  const initial = useMemo(
    () => ({
      name: kit?.name ?? "",
      websiteUrl: kit?.website_url ?? "",
      fontPrimary: kit?.font_family ?? "",
      fontSecondary: kit?.secondary_font_family ?? "",
      oneLiner: kit?.one_liner ?? "",
      toneOfVoice: kit?.tone_of_voice ?? "",
      palette: colorsToPalette(kit?.colors),
      brandValues: kit?.brand_values ?? [],
      logoAssetId: kit?.logo_asset_id ?? null,
      logoUrl: kit?.logo_url ?? null,
      images: kit?.images ?? [],
    }),
    [kit],
  );

  const [name, setName] = useState(initial.name);
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
  const [fontPrimary, setFontPrimary] = useState(initial.fontPrimary);
  const [fontSecondary, setFontSecondary] = useState(initial.fontSecondary);
  const [oneLiner, setOneLiner] = useState(initial.oneLiner);
  const [toneOfVoice, setToneOfVoice] = useState(initial.toneOfVoice);
  const [palette, setPalette] = useState<string[]>(initial.palette);
  const [brandValues, setBrandValues] = useState<string[]>(initial.brandValues);
  const [valueDraft, setValueDraft] = useState("");
  const [logoAssetId, setLogoAssetId] = useState<string | null>(initial.logoAssetId);
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);
  const [images, setImages] = useState<BrandImage[]>(initial.images);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  // When uploading onto a brand-new (unsaved) kit we auto-create the profile
  // first; this remembers its id so a second upload before the remount doesn't
  // create a duplicate.
  const draftKitIdRef = useRef<string | null>(kit?.id ?? null);

  const hasUnsavedChanges =
    name !== initial.name ||
    websiteUrl !== initial.websiteUrl ||
    fontPrimary !== initial.fontPrimary ||
    fontSecondary !== initial.fontSecondary ||
    oneLiner !== initial.oneLiner ||
    toneOfVoice !== initial.toneOfVoice ||
    logoAssetId !== initial.logoAssetId ||
    logoUrl !== initial.logoUrl ||
    !areArraysEqual(palette, initial.palette) ||
    !areArraysEqual(brandValues, initial.brandValues) ||
    !areImagesEqual(images, initial.images);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Add a brand name first.");
      const input: BrandKitInput = {
        name: trimmed,
        colors: paletteToColors(palette),
        font_family: fontPrimary.trim() || null,
        secondary_font_family: fontSecondary.trim() || null,
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
      toast.success(kit ? "Brand kit updated" : "Brand kit created");
      onSaved(saved);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't save brand kit.");
    },
  });

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
      font_family: fontPrimary.trim() || null,
      secondary_font_family: fontSecondary.trim() || null,
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
    // Nothing persisted yet — just clear the local selection.
    if (!kitId) {
      setLogoAssetId(null);
      setLogoUrl(null);
      return;
    }
    try {
      applyUpdatedKit(await removeBrandLogo(kitId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't remove the logo.");
    }
  }

  async function handleImageFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (files.length === 0) {
      toast.error("Images must be PNG, JPG or WebP.");
      return;
    }
    setUploadingImages(true);
    try {
      const kitId = await ensureKitId();
      // One request per file; each returns the full updated profile.
      let updated: BrandKit | null = null;
      for (const file of files) {
        updated = await uploadBrandImage(kitId, file);
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
    try {
      applyUpdatedKit(await removeBrandImage(kitId, assetId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't remove the image.");
    }
  }

  function updatePalette(index: number, value: string) {
    setPalette((current) => current.map((c, i) => (i === index ? value : c)));
  }

  function removeSwatch(index: number) {
    setPalette((current) => current.filter((_, i) => i !== index));
  }

  function addValue() {
    const v = valueDraft.trim();
    if (!v) return;
    if (brandValues.includes(v)) {
      setValueDraft("");
      return;
    }
    setBrandValues((current) => [...current, v]);
    setValueDraft("");
  }

  return (
    <div>
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
            <Card className="flex flex-col">
              <SectionLabel>Logo</SectionLabel>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="mt-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[16px] border border-border bg-secondary text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Brand logo" className="h-full w-full object-contain" />
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
                  className="mt-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
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
                  preview="Aa"
                  fontFamily={fontPrimary}
                  value={fontPrimary}
                  onChange={setFontPrimary}
                  placeholder="Headline font"
                />
                <FontSlot
                  preview="Aa"
                  fontFamily={fontSecondary}
                  value={fontSecondary}
                  onChange={setFontSecondary}
                  placeholder="Body font"
                />
              </div>
            </Card>
          </div>

          {/* Colors */}
          <Card>
            <SectionLabel>Colors</SectionLabel>
            <div className="mt-4 flex flex-wrap items-start gap-4">
              {palette.map((hex, index) => (
                <Swatch
                  key={index}
                  hex={hex}
                  onChange={(value) => updatePalette(index, value)}
                  onRemove={() => removeSwatch(index)}
                />
              ))}
              <AddColorButton onAdd={(hex) => setPalette((current) => [...current, hex])} />
            </div>
          </Card>

          {/* One liner + Brand values */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <SectionLabel>One liner</SectionLabel>
              <textarea
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                placeholder="A short, punchy line that sums up your brand"
                rows={2}
                className="mt-3 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Card>

            <Card>
              <SectionLabel>Brand values</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {brandValues.map((value) => (
                  <span
                    key={value}
                    className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground"
                  >
                    {value}
                    <button
                      onClick={() =>
                        setBrandValues((current) => current.filter((v) => v !== value))
                      }
                      aria-label={`Remove ${value}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={valueDraft}
                onChange={(e) => setValueDraft(e.target.value)}
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
            </Card>
          </div>

          {/* Tone of voice */}
          <Card>
            <SectionLabel>Tone of voice</SectionLabel>
            <input
              value={toneOfVoice}
              onChange={(e) => setToneOfVoice(e.target.value)}
              placeholder="e.g. Bold, playful, confident"
              className="mt-3 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </Card>
        </div>

        {/* Images panel */}
        <div className="lg:col-span-1">
          <Card>
            <SectionLabel>Images</SectionLabel>
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
                {images.map((image) => (
                  <div
                    key={image.asset_id}
                    className="group relative aspect-square overflow-hidden rounded-[14px] border border-border bg-secondary"
                  >
                    <img
                      src={image.thumbnail_url ?? image.preview_url ?? image.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => void handleRemoveImage(image.asset_id)}
                      aria-label="Remove image"
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
            <button
              onClick={() => {
                if (window.confirm("Delete this brand kit? This can't be undone.")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold text-muted-foreground transition hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
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
  preview,
  fontFamily,
  value,
  onChange,
  placeholder,
}: {
  preview: string;
  fontFamily: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="rounded-[16px] border border-border px-4 py-3">
      <div
        className="text-3xl font-bold text-foreground"
        style={{ fontFamily: fontFamily || undefined }}
      >
        {preview}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function Swatch({
  hex,
  onChange,
  onRemove,
}: {
  hex: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const valid = isHexColor(hex);
  return (
    <div className="group flex flex-col items-center gap-1.5">
      <div className="relative">
        <label
          className="block h-14 w-14 cursor-pointer overflow-hidden rounded-full border border-border"
          style={{ backgroundColor: valid ? hex : "transparent" }}
        >
          <input
            type="color"
            value={valid ? hex : "#888888"}
            onChange={(e) => onChange(e.target.value)}
            className="h-full w-full cursor-pointer opacity-0"
          />
        </label>
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

function AddColorButton({ onAdd }: { onAdd: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(DEFAULT_NEW_COLOR);
  const valid = isHexColor(hex);
  const pickerColor = valid ? normalizeHexColor(hex) : DEFAULT_NEW_COLOR;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setHex(DEFAULT_NEW_COLOR);
  }

  function handleAdd() {
    if (!valid) return;
    onAdd(normalizeHexColor(hex));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Add color"
        >
          <Plus className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-[236px] rounded-[16px] p-3">
        <HexColorPicker
          color={pickerColor}
          onChange={setHex}
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

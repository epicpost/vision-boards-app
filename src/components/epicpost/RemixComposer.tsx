import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAccessToken } from "@/lib/auth";
import { brandKitsQueryKey, fetchBrandKits, type BrandImage } from "@/lib/brand-kit";
import {
  remixesQueryKey,
  remixTemplate,
  remixTemplateUpload,
  uploadAssetFiles,
  waitForGeneration,
  type GenerationResult,
} from "@/lib/generations";
import type { PostTemplate } from "@/lib/post-templates";

interface AttachedImage {
  id: string;
  // Newly picked/dropped files carry their bytes; brand-kit picks reference an
  // already-uploaded asset by id (their bytes live on S3, which the browser
  // can't refetch due to CORS — the server resolves them at remix time).
  file?: File;
  assetId?: string;
  // Object URL for uploads, or the brand image's CDN URL for brand picks.
  previewUrl: string;
}

type Phase = "idle" | "sending" | "generating";

const FALLBACK_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const FALLBACK_MAX_IMAGES = 10;

function formatCreatedAt(createdAt: string | null | undefined) {
  if (!createdAt) return "";

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "";

  const diffMs = Date.now() - created;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 31) return `${Math.floor(diffDays / 7)}w`;

  return `${Math.floor(diffDays / 30)}mo`;
}

// The comment-style composer at the bottom of the detail card. Attach the
// images the template needs, type the caption, and send to generate a remix —
// the result opens in a dialog.
export function RemixComposer({
  template,
  onRequireAuth,
}: {
  template: PostTemplate;
  onRequireAuth: () => void;
}) {
  const queryClient = useQueryClient();
  // A template can express its image inputs either as one slot with a count
  // range (min_count/max_count) or as several single-image slots (e.g. a
  // three-image collage = three slots). Aggregate across all image slots so the
  // composer honors the full contract instead of just the first slot.
  const imageRequirements =
    template.input_requirements?.assets.filter((asset) => asset.type === "image") ?? [];
  const imageRequirement = imageRequirements[0];
  const captionRequirement =
    template.input_requirements?.text_requirements.find((text) => text.visible_on_asset) ??
    template.input_requirements?.text_requirements[0];

  // Templates can ask for the brand logo and/or render brand text on the asset.
  // When they do, we auto-attach the matching brand-kit cards below.
  const requiresLogo =
    template.input_requirements?.assets.some((asset) => asset.type === "logo") ??
    template.output_spec?.contains_branding_slot ??
    false;
  const requiresText = Boolean(captionRequirement);

  // Prefer the explicit asset contract; fall back to the template's image count
  // so the composer still works for feed entries without input_requirements.
  const minImages = imageRequirements.length
    ? Math.max(1, imageRequirements.reduce((sum, asset) => sum + asset.min_count, 0))
    : Math.max(1, template.input_image_count ?? 1);
  const maxImages = imageRequirements.length
    ? Math.max(minImages, imageRequirements.reduce((sum, asset) => sum + asset.max_count, 0))
    : Math.max(minImages, FALLBACK_MAX_IMAGES);
  const acceptedTypes = imageRequirement?.accepted_mime_types.length
    ? imageRequirement.accepted_mime_types
    : FALLBACK_ACCEPTED_TYPES;
  const maxChars = captionRequirement?.max_chars ?? null;

  const [images, setImages] = useState<AttachedImage[]>([]);
  const [caption, setCaption] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Auto-attached brand cards default to shown; the user can dismiss each one.
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [fontsRemoved, setFontsRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The brand kit feeds both the auto-attached logo/fonts cards and the image
  // picker, so it's loaded whenever the user is signed in.
  const brandKitsQuery = useQuery({
    queryKey: brandKitsQueryKey(),
    queryFn: fetchBrandKits,
    enabled: (requiresLogo || requiresText || isPickerOpen) && Boolean(getAccessToken()),
  });
  const brandImages = (brandKitsQuery.data ?? []).flatMap((kit) => kit.images);
  // Follow the brand-kit page convention: the first kit is the default.
  const brandKit = brandKitsQuery.data?.[0] ?? null;
  const brandLogoUrl = brandKit?.logo_preview_url ?? brandKit?.logo_url ?? null;
  const brandPrimaryFont = brandKit?.font_family ?? null;
  const brandSecondaryFont = brandKit?.secondary_font_family ?? null;
  const showLogoCard = requiresLogo && Boolean(brandLogoUrl) && !logoRemoved;
  const showFontsCard = requiresText && Boolean(brandPrimaryFont) && !fontsRemoved;
  // The catalog font id sent to the renderer — only while the Fonts card is
  // kept attached. The backend resolves it to the actual typeface at render time.
  const selectedFontId = showFontsCard ? (brandKit?.font_id ?? undefined) : undefined;
  // Track live preview URLs so unmount revokes exactly the current set.
  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = images.map((image) => image.previewUrl);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Best-effort load the brand fonts so the "Aa" preview renders in the real
  // typeface. Non-Google families simply fall back to the default font.
  useEffect(() => {
    if (!showFontsCard || typeof document === "undefined") return;
    const families = [brandPrimaryFont, brandSecondaryFont]
      .filter((font): font is string => Boolean(font))
      .map((font) => `family=${font.trim().replace(/\s+/g, "+")}`)
      .join("&");
    if (!families) return;

    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    const id = "remix-brand-fonts";
    const existing = document.getElementById(id) as HTMLLinkElement | null;
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

  if (template.capabilities && !template.capabilities.supports_remix) return null;

  const hint = isBusy
    ? phase === "sending"
      ? "Sending images..."
      : "Generating your remix..."
    : images.length < minImages
      ? `Attach ${minImages - images.length} more image${minImages - images.length > 1 ? "s" : ""} to remix`
      : captionMissing
        ? "Add a caption to remix"
        : "Ready — send to generate your remix";

  function addFiles(fileList: FileList | File[]) {
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
      previewUrl: URL.createObjectURL(file),
    }));
    if (accepted.length === 0) return;
    setImages((current) => [...current, ...accepted]);
    // An explicit upload (file picker or drag-and-drop in the dialog) is a
    // deliberate choice — close the picker so the user returns to the composer.
    setIsPickerOpen(false);
  }

  // Reference a brand-kit image by its asset id — no byte fetch, so the S3 CORS
  // restriction never bites. The server resolves the asset when the remix runs.
  function addBrandImage(image: BrandImage) {
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
            previewUrl: image.thumbnail_url ?? image.preview_url ?? image.url,
          },
        ];
      });
    }
    // Keep the picker open so the user can keep selecting; only close once the
    // template's image quota is filled.
    const attachedCount = images.length + (alreadyAttached ? 0 : 1);
    if (attachedCount >= maxImages) setIsPickerOpen(false);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      // Only object URLs need revoking; brand picks use plain CDN URLs.
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
      const aspectRatio =
        template.output_spec?.default_aspect_ratio ?? template.aspect_ratio ?? undefined;
      const trimmedCaption = caption.trim() || undefined;
      const hasBrandPicks = images.some((image) => image.assetId);

      // Pure uploads keep the transient (non-persisting) remix-upload path.
      // Once a brand-kit asset is in the mix, switch to the asset-id remix path:
      // persist any new uploads to get ids, then send the ordered asset list so
      // the server resolves every image (including brand ones) on its side.
      let initial: GenerationResult;
      if (hasBrandPicks) {
        const filesToUpload = images
          .map((image) => image.file)
          .filter((file): file is File => Boolean(file));
        const uploaded = filesToUpload.length ? await uploadAssetFiles(filesToUpload) : [];
        let uploadCursor = 0;
        const assetIds = images.map((image) => image.assetId ?? uploaded[uploadCursor++]?.asset_id);
        if (assetIds.some((id) => !id)) {
          throw new Error("Some images could not be prepared. Please try again.");
        }
        initial = await remixTemplate({
          templateId: template.id,
          assetIds: assetIds as string[],
          caption: trimmedCaption,
          aspectRatio,
          fontId: selectedFontId,
        });
      } else {
        initial = await remixTemplateUpload({
          templateId: template.id,
          files: images.map((image) => image.file).filter((file): file is File => Boolean(file)),
          caption: trimmedCaption,
          aspectRatio,
          fontId: selectedFontId,
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

  // "Use template again" — close the result and reset the composer so the user
  // can attach fresh images and remix the same template right away.
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

  return (
    <div className="mt-auto pt-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxImages > 1}
        accept={acceptedTypes.join(",")}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {(images.length > 0 || showLogoCard || showFontsCard) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {showLogoCard && (
            <div className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary">
              <img
                src={brandLogoUrl ?? undefined}
                alt="Brand logo"
                className="h-full w-full object-contain p-1.5"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-white">
                Logo
              </span>
              <button
                type="button"
                aria-label="Remove brand logo"
                disabled={isBusy}
                onClick={() => setLogoRemoved(true)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
              >
                <X className="h-3 w-3" strokeWidth={2.6} />
              </button>
            </div>
          )}
          {showFontsCard && (
            <div className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border bg-secondary">
              <span
                className="flex h-full w-full items-center justify-center text-xl leading-none text-foreground"
                style={{ fontFamily: brandPrimaryFont ?? undefined }}
                title={
                  brandSecondaryFont
                    ? `${brandPrimaryFont} · ${brandSecondaryFont}`
                    : (brandPrimaryFont ?? undefined)
                }
              >
                Aa
              </span>
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-white">
                Fonts
              </span>
              <button
                type="button"
                aria-label="Remove brand fonts"
                disabled={isBusy}
                onClick={() => setFontsRemoved(true)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
              >
                <X className="h-3 w-3" strokeWidth={2.6} />
              </button>
            </div>
          )}
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border"
            >
              <img
                src={image.previewUrl}
                alt={image.file?.name ?? "Selected image"}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Remove ${image.file?.name ?? "image"}`}
                disabled={isBusy}
                onClick={() => removeImage(image.id)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
              >
                <X className="h-3 w-3" strokeWidth={2.6} />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              aria-label="Add more images"
              disabled={isBusy}
              onClick={() => setIsPickerOpen(true)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      <div className="flex h-14 items-center gap-2 rounded-[28px] bg-secondary px-5">
        <input
          type="text"
          value={caption}
          disabled={isBusy}
          maxLength={maxChars ?? undefined}
          onChange={(event) => setCaption(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSend) handleSend();
          }}
          placeholder={
            captionRequirement?.description ??
            `Add a ${(captionRequirement?.label ?? "caption").toLowerCase()} for your remix`
          }
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {maxChars != null && caption.length > 0 && (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {caption.length}/{maxChars}
          </span>
        )}
        <button
          type="button"
          aria-label="Attach images"
          disabled={isBusy}
          onClick={() => setIsPickerOpen(true)}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-background/60 disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5 text-foreground" />
          {images.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {images.length}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Send remix request"
          disabled={!canSend}
          onClick={handleSend}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isBusy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
          )}
        </button>
      </div>

      <p className="mt-1.5 px-2 text-xs text-muted-foreground">{hint}</p>

      <Dialog
        open={isPickerOpen}
        onOpenChange={(open) => {
          setIsPickerOpen(open);
          if (!open) setIsDragging(false);
        }}
      >
        <DialogContent className="max-w-2xl rounded-[20px] p-6">
          <DialogHeader>
            <DialogTitle>Upload a photo</DialogTitle>
            <DialogDescription>
              Choose one of your brand kit images or add a new one.
            </DialogDescription>
          </DialogHeader>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (event.dataTransfer.files?.length) {
                addFiles(event.dataTransfer.files);
                setIsPickerOpen(false);
              }
            }}
            className={`flex h-40 w-full flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed text-muted-foreground transition ${
              isDragging
                ? "border-foreground/50 bg-secondary text-foreground"
                : "border-border hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            <UploadCloud className="h-7 w-7" />
            <span className="text-[15px] font-medium">
              Choose an image or drag and drop it here
            </span>
          </button>

          {brandImages.length > 0 && (
            <div className="mt-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">From your brand kit</p>
              <div className="grid max-h-[40vh] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
                {brandImages.map((image) => {
                  const alreadyAdded = images.some((item) => item.assetId === image.asset_id);
                  return (
                    <button
                      key={image.asset_id}
                      type="button"
                      disabled={alreadyAdded || images.length >= maxImages}
                      onClick={() => addBrandImage(image)}
                      className="group relative aspect-square overflow-hidden rounded-[12px] border border-border transition hover:border-foreground/40 disabled:opacity-60"
                    >
                      <img
                        src={image.thumbnail_url ?? image.preview_url ?? image.url}
                        alt="Brand image"
                        className="h-full w-full object-cover"
                      />
                      {alreadyAdded && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[11px] font-semibold text-white">
                          Added
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {brandKitsQuery.isLoading && (
            <p className="text-xs text-muted-foreground">Loading your brand kit images…</p>
          )}
          {!brandKitsQuery.isLoading && brandImages.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No brand kit images yet — add one above to get started.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="max-w-lg rounded-[20px] p-6">
          <DialogHeader>
            <DialogTitle>{template.title}</DialogTitle>
            <DialogDescription>
              {result?.caption
                ? `${result.caption} · ${formatCreatedAt(result.created_at)}`
                : formatCreatedAt(result?.created_at)}
            </DialogDescription>
          </DialogHeader>
          {output && (
            <div className="overflow-hidden rounded-[16px] border border-border bg-secondary">
              <img
                src={output.url}
                alt={result?.caption ?? template.title}
                className="max-h-[65vh] w-full object-contain"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleUseTemplateAgain}
              className="flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-base font-semibold text-foreground transition hover:brightness-95"
            >
              <ExternalLink className="h-4 w-4" />
              Use template again
            </button>
            <button
              type="button"
              disabled={!output}
              onClick={handleDownload}
              className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

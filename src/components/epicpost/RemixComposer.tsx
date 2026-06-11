import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAccessToken } from "@/lib/auth";
import {
  remixTemplate,
  uploadAssetFiles,
  waitForGeneration,
  type GenerationResult,
} from "@/lib/generations";
import type { PostTemplate } from "@/lib/post-templates";

interface AttachedImage {
  id: string;
  file: File;
  previewUrl: string;
}

type Phase = "idle" | "uploading" | "generating";

const FALLBACK_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function RemixComposer({
  template,
  onRequireAuth,
}: {
  template: PostTemplate;
  onRequireAuth: () => void;
}) {
  const imageRequirement = template.input_requirements?.assets.find(
    (asset) => asset.type === "image",
  );
  const captionRequirement =
    template.input_requirements?.text_requirements.find((text) => text.visible_on_asset) ??
    template.input_requirements?.text_requirements[0];

  const minImages = Math.max(1, imageRequirement?.min_count ?? 1);
  const maxImages = Math.max(minImages, imageRequirement?.max_count ?? minImages);
  const acceptedTypes = imageRequirement?.accepted_mime_types.length
    ? imageRequirement.accepted_mime_types
    : FALLBACK_ACCEPTED_TYPES;
  const maxChars = captionRequirement?.max_chars ?? null;

  const [images, setImages] = useState<AttachedImage[]>([]);
  const [caption, setCaption] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track live preview URLs so unmount revokes exactly the current set.
  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = images.map((image) => image.previewUrl);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const isBusy = phase !== "idle";
  const captionMissing = Boolean(captionRequirement?.required) && !caption.trim();
  const canRemix = images.length >= minImages && !captionMissing && !isBusy;
  const output = result?.assets[0] ?? null;

  const remixDisabledHint = useMemo(() => {
    if (images.length < minImages) {
      const remaining = minImages - images.length;
      return `Add ${remaining} more image${remaining > 1 ? "s" : ""} to remix`;
    }
    if (captionMissing) return "Add a caption to remix";
    return null;
  }, [images.length, minImages, captionMissing]);

  if (!template.input_requirements || !imageRequirement) return null;
  if (template.capabilities && !template.capabilities.supports_remix) return null;

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).filter((file) => acceptedTypes.includes(file.type));
    if (incoming.length < Array.from(fileList).length) {
      toast.error("Some files were skipped — only PNG, JPG or WebP images are supported.");
    }

    setImages((current) => {
      const room = maxImages - current.length;
      if (room <= 0) {
        toast.error(`This template uses at most ${maxImages} images.`);
        return current;
      }
      const accepted = incoming.slice(0, room).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      if (incoming.length > room) {
        toast.error(`This template uses at most ${maxImages} images.`);
      }
      return [...current, ...accepted];
    });
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  async function handleRemix() {
    if (!getAccessToken()) {
      onRequireAuth();
      return;
    }

    try {
      setPhase("uploading");
      const uploaded = await uploadAssetFiles(images.map((image) => image.file));

      setPhase("generating");
      const initial = await remixTemplate({
        templateId: template.id,
        assetIds: uploaded.map((asset) => asset.asset_id),
        caption: caption.trim() || undefined,
        aspectRatio:
          template.output_spec?.default_aspect_ratio ?? template.aspect_ratio ?? undefined,
      });
      const settled = await waitForGeneration(initial);

      if (settled.status !== "completed" || settled.assets.length === 0) {
        throw new Error(settled.error ?? "The remix could not be generated. Please try again.");
      }

      setResult(settled);
      setIsResultOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remix this template.");
    } finally {
      setPhase("idle");
    }
  }

  async function handleDownload() {
    if (!output) return;
    try {
      const response = await fetch(output.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `epicpost-remix-${result?.generation_id ?? "image"}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download the image.");
    }
  }

  return (
    <section className="mt-6 rounded-[16px] border border-border p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-secondary text-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-foreground">Remix this template</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Attach {minImages === maxImages ? minImages : `${minImages}–${maxImages}`} image
        {maxImages > 1 ? "s" : ""}
        {captionRequirement ? ` and a ${captionRequirement.label.toLowerCase()}` : ""}, then remix
        to generate your own version.
      </p>

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

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-[3/4] overflow-hidden rounded-[14px] border border-border bg-secondary"
          >
            <img
              src={image.previewUrl}
              alt={image.file.name}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {index + 1} · {formatBytes(image.file.size)}
            </span>
            <button
              type="button"
              aria-label={`Remove ${image.file.name}`}
              disabled={isBusy}
              onClick={() => removeImage(image.id)}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="px-2 text-center text-xs font-semibold">
              {images.length === 0 ? `Add image${maxImages > 1 ? "s" : ""}` : "Add more"}
            </span>
          </button>
        )}
      </div>

      <label className="mb-4 block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-foreground">
          {captionRequirement?.label ?? "Caption"}
          {maxChars != null && (
            <span
              className={`text-xs font-medium ${
                caption.length > maxChars ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {caption.length}/{maxChars}
            </span>
          )}
        </span>
        <input
          type="text"
          value={caption}
          disabled={isBusy}
          maxLength={maxChars ?? undefined}
          onChange={(event) => setCaption(event.target.value)}
          placeholder={captionRequirement?.description ?? "e.g. BARCELONA"}
          className="h-12 w-full rounded-[16px] bg-input px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!canRemix}
          onClick={handleRemix}
          className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {phase === "uploading" ? "Uploading images..." : "Generating..."}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Remix
            </>
          )}
        </button>
        {!isBusy && remixDisabledHint && (
          <span className="text-sm text-muted-foreground">{remixDisabledHint}</span>
        )}
      </div>

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="max-w-md rounded-[20px] p-6">
          <DialogHeader>
            <DialogTitle>Your remix is ready</DialogTitle>
            <DialogDescription>
              Generated from {images.length} image{images.length > 1 ? "s" : ""}
              {result?.caption ? ` with the caption “${result.caption}”` : ""}.
            </DialogDescription>
          </DialogHeader>
          {output && (
            <div className="overflow-hidden rounded-[16px] border border-border bg-secondary">
              <img
                src={output.url}
                alt={result?.caption ?? "Generated remix"}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResultOpen(false)}
              className="h-11 rounded-full bg-secondary px-5 text-base font-semibold text-foreground transition hover:brightness-95"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Download, Image as ImageIcon, Loader2, X } from "lucide-react";
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
  remixTemplateUpload,
  waitForGeneration,
  type GenerationResult,
} from "@/lib/generations";
import type { PostTemplate } from "@/lib/post-templates";

interface AttachedImage {
  id: string;
  file: File;
  previewUrl: string;
}

type Phase = "idle" | "sending" | "generating";

const FALLBACK_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const FALLBACK_MAX_IMAGES = 10;

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
  const imageRequirement = template.input_requirements?.assets.find(
    (asset) => asset.type === "image",
  );
  const captionRequirement =
    template.input_requirements?.text_requirements.find((text) => text.visible_on_asset) ??
    template.input_requirements?.text_requirements[0];

  // Prefer the explicit asset contract; fall back to the template's image count
  // so the composer still works for feed entries without input_requirements.
  const minImages = Math.max(1, imageRequirement?.min_count ?? template.input_image_count ?? 1);
  const maxImages = Math.max(minImages, imageRequirement?.max_count ?? FALLBACK_MAX_IMAGES);
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

  function addFiles(fileList: FileList) {
    const incoming = Array.from(fileList).filter((file) => acceptedTypes.includes(file.type));
    if (incoming.length < fileList.length) {
      toast.error("Some files were skipped — only PNG, JPG or WebP images are supported.");
    }

    setImages((current) => {
      const room = maxImages - current.length;
      if (room <= 0 || incoming.length > room) {
        toast.error(`This template uses at most ${maxImages} images.`);
      }
      const accepted = incoming.slice(0, Math.max(0, room)).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return accepted.length > 0 ? [...current, ...accepted] : current;
    });
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
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
      const initial = await remixTemplateUpload({
        templateId: template.id,
        files: images.map((image) => image.file),
        caption: caption.trim() || undefined,
        aspectRatio:
          template.output_spec?.default_aspect_ratio ?? template.aspect_ratio ?? undefined,
      });
      setPhase("generating");
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

      {images.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-border"
            >
              <img
                src={image.previewUrl}
                alt={image.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Remove ${image.file.name}`}
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
              onClick={() => fileInputRef.current?.click()}
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
          onClick={() => fileInputRef.current?.click()}
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
    </div>
  );
}

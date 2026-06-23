import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

// Container/output sizes. The on-screen crop viewport is VIEWPORT px; the
// exported PNG is OUTPUT px square. The backend masks it to a circle, so we
// only need to produce a correctly framed square here.
const VIEWPORT = 288;
const OUTPUT = 512;
const MAX_ZOOM = 3;

interface AvatarCropDialogProps {
  /** The image the user picked, or null when the dialog is closed. */
  file: File | null;
  onClose: () => void;
  onCropped: (blob: Blob) => void | Promise<void>;
}

export function AvatarCropDialog({ file, onClose, onCropped }: AvatarCropDialogProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origin: { x: number; y: number };
  } | null>(null);

  // Load the picked file into an HTMLImageElement and compute the "cover" scale.
  useEffect(() => {
    if (!file) {
      setSrc(null);
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setError(null);
    const image = new Image();
    image.onload = () => {
      const cover = Math.max(VIEWPORT / image.naturalWidth, VIEWPORT / image.naturalHeight);
      setImg(image);
      setBaseScale(cover);
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    image.onerror = () => setError("That image could not be loaded.");
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: pos };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    setPos({
      x: drag.origin.x + (e.clientX - drag.startX),
      y: drag.origin.y + (e.clientY - drag.startY),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const handleSave = useCallback(async () => {
    if (!img) return;
    setSaving(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");

      // Replicate the on-screen transform (centered image, translate, scale),
      // mapping viewport pixels to output pixels via `f`.
      const f = OUTPUT / VIEWPORT;
      const dispW = img.naturalWidth * baseScale;
      const dispH = img.naturalHeight * baseScale;
      ctx.translate(OUTPUT / 2 + pos.x * f, OUTPUT / 2 + pos.y * f);
      ctx.scale(zoom * f, zoom * f);
      ctx.drawImage(img, -dispW / 2, -dispH / 2, dispW, dispH);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not process the image.");
      await onCropped(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [img, baseScale, zoom, pos, onCropped]);

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
          <DialogDescription>Drag to reposition and zoom to frame your avatar.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div
            className="relative overflow-hidden rounded-lg bg-muted touch-none select-none"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {src && img ? (
              <img
                src={src}
                alt=""
                draggable={false}
                className="absolute inset-0 m-auto max-w-none cursor-grab active:cursor-grabbing"
                style={{
                  width: img.naturalWidth * baseScale,
                  height: img.naturalHeight * baseScale,
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                  transformOrigin: "center",
                }}
              />
            ) : null}
            {/* Circular framing overlay. */}
            <div className="pointer-events-none absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-full" />
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="text-sm text-muted-foreground">Zoom</span>
            <Slider
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !img}
            className="h-11 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save photo"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

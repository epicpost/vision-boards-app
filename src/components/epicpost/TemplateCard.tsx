import { MoreHorizontal, Upload, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export interface Pin {
  id: string;
  src: string | null;
  width: number | null;
  height: number | null;
  fallbackHeight: number;
  mediaType?: "image" | "video" | null;
  title?: string;
}

function isValidDimension(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function TemplateCard({ pin }: { pin: Pin }) {
  const [detectedSize, setDetectedSize] = useState<{ width: number; height: number } | null>(null);
  const width = isValidDimension(pin.width) ? pin.width : detectedSize?.width;
  const height = isValidDimension(pin.height) ? pin.height : detectedSize?.height;
  const aspectRatio =
    isValidDimension(width) && isValidDimension(height)
      ? `${width} / ${height}`
      : `250 / ${pin.fallbackHeight}`;
  const shouldDetectSize = !isValidDimension(pin.width) || !isValidDimension(pin.height);

  return (
    <div className="mb-3 break-inside-avoid group">
      <Link
        to="/template/$pinId"
        params={{ pinId: pin.id }}
        className="relative block w-full overflow-hidden rounded-[16px] bg-secondary cursor-pointer"
        style={{ aspectRatio }}
      >
        {pin.src && pin.mediaType === "video" ? (
          <video
            src={pin.src}
            aria-label={pin.title ?? "Video template"}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            onLoadedMetadata={(event) => {
              if (!shouldDetectSize) return;

              const video = event.currentTarget;
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                setDetectedSize({ width: video.videoWidth, height: video.videoHeight });
              }
            }}
            className="h-full w-full object-contain transition"
          />
        ) : pin.src ? (
          <img
            src={pin.src}
            alt={pin.title ?? "Pin"}
            loading="lazy"
            onLoad={(event) => {
              if (!shouldDetectSize) return;

              const image = event.currentTarget;
              if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                setDetectedSize({ width: image.naturalWidth, height: image.naturalHeight });
              }
            }}
            className="h-full w-full object-contain transition"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-muted-foreground">
            No preview
          </div>
        )}
        {pin.mediaType === "video" && (
          <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm">
            <Video className="h-4 w-4 text-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-[16px]">
          <div className="absolute top-3 right-3">
            <span className="inline-flex bg-primary text-primary-foreground font-bold text-sm px-4 py-2.5 rounded-full">
              Save
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end gap-2">
            <span
              aria-label="More"
              className="h-9 w-9 rounded-full bg-white text-foreground flex items-center justify-center"
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span
              aria-label="Share"
              className="h-9 w-9 rounded-full bg-white text-foreground flex items-center justify-center"
            >
              <Upload className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
      {pin.title && (
        <p className="px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2">
          {pin.title}
        </p>
      )}
    </div>
  );
}

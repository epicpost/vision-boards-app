import { MoreHorizontal, Upload, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface Pin {
  id: string;
  src: string | null;
  height: number;
  mediaType?: "image" | "video" | null;
  title?: string;
  author?: string;
  likesCount?: number;
}

export function PinCard({ pin }: { pin: Pin }) {
  return (
    <div className="mb-3 break-inside-avoid group">
      <Link
        to="/pin/$pinId"
        params={{ pinId: pin.id }}
        className="relative block w-full overflow-hidden rounded-[16px] bg-secondary cursor-zoom-in"
        style={{ aspectRatio: `1 / ${pin.height / 250}` }}
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
            className="h-full w-full object-cover transition"
          />
        ) : pin.src ? (
          <img
            src={pin.src}
            alt={pin.title ?? "Pin"}
            loading="lazy"
            className="h-full w-full object-cover transition"
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
      {pin.author && (
        <div className="px-2 pt-1 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-rose-300 to-amber-200" />
          <span className="text-xs text-muted-foreground">{pin.author}</span>
        </div>
      )}
      {typeof pin.likesCount === "number" && (
        <p className="px-2 pt-1 text-xs text-muted-foreground">{pin.likesCount} likes</p>
      )}
    </div>
  );
}

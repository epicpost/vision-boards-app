import { MoreHorizontal, Upload } from "lucide-react";

export interface Pin {
  id: string;
  src: string;
  height: number;
  title?: string;
  author?: string;
}

export function PinCard({ pin }: { pin: Pin }) {
  return (
    <div className="mb-3 break-inside-avoid group">
      <div
        className="relative w-full overflow-hidden rounded-[16px] bg-secondary cursor-zoom-in"
        style={{ aspectRatio: `1 / ${pin.height / 250}` }}
      >
        <img
          src={pin.src}
          alt={pin.title ?? "Pin"}
          loading="lazy"
          className="h-full w-full object-cover transition"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-2xl">
          <div className="absolute top-3 right-3">
            <button className="bg-primary text-primary-foreground font-bold text-sm px-4 py-2.5 rounded-full hover:brightness-90 transition">
              Save
            </button>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end gap-2">
            <div className="flex gap-2">
              <button aria-label="More" className="h-9 w-9 rounded-full bg-white text-foreground flex items-center justify-center hover:bg-secondary">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <button aria-label="Share" className="h-9 w-9 rounded-full bg-white text-foreground flex items-center justify-center hover:bg-secondary">
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {pin.title && (
        <p className="px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2">{pin.title}</p>
      )}
      {pin.author && (
        <div className="px-2 pt-1 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-rose-300 to-amber-200" />
          <span className="text-xs text-muted-foreground">{pin.author}</span>
        </div>
      )}
    </div>
  );
}

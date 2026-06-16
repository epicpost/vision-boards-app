import {
  Image as ImageIcon,
  Film,
  Type,
  Music,
  Captions,
  Crop,
  Sparkles,
  Ratio,
  FileType2,
  Clapperboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PostTemplate, AssetRequirement, TextRequirement } from "@/lib/post-templates";

// "image/jpeg" -> "JPG", "video/mp4" -> "MP4", "image/svg+xml" -> "SVG".
function formatMime(mime: string): string {
  const sub = mime.split("/")[1] ?? mime;
  const base = sub.split("+")[0];
  return (base === "jpeg" ? "jpg" : base).toUpperCase();
}

function formatLabel(format: string): string {
  return (format === "jpeg" ? "jpg" : format).toUpperCase();
}

// min/max counts -> "3" or "1–10".
function countRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

function RequiredBadge({ required }: { required: boolean }) {
  return required ? (
    <Badge className="h-5 px-2 text-[11px]">Required</Badge>
  ) : (
    <Badge variant="secondary" className="h-5 px-2 text-[11px]">
      Optional
    </Badge>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
      {children}
    </span>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-secondary text-foreground">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function AssetRow({ asset }: { asset: AssetRequirement }) {
  const isVideo = asset.type === "video";
  const formats = asset.accepted_mime_types.map(formatMime);

  return (
    <div className="rounded-[14px] border border-border p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {isVideo ? (
            <Film className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
          {asset.description ?? asset.key.replace(/_/g, " ")}
        </span>
        <RequiredBadge required={asset.required} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip>
          {countRange(asset.min_count, asset.max_count)} {asset.type}
          {asset.max_count > 1 ? "s" : ""}
        </Chip>
        {formats.length > 0 && <Chip>{formats.join(" · ")}</Chip>}
        {asset.preferred_aspect_ratios.length > 0 && (
          <Chip>{asset.preferred_aspect_ratios.join(" · ")}</Chip>
        )}
        {asset.min_width && asset.min_height ? (
          <Chip>
            min {asset.min_width}×{asset.min_height}
          </Chip>
        ) : null}
        {asset.transparent_preferred && <Chip>transparent</Chip>}
        {asset.allow_crop && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Crop className="h-3.5 w-3.5" /> crop ok
          </span>
        )}
      </div>
    </div>
  );
}

function TextRow({ text }: { text: TextRequirement }) {
  return (
    <div className="rounded-[14px] border border-border p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Type className="h-4 w-4 text-muted-foreground" />
          {text.label}
        </span>
        <RequiredBadge required={text.required} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {text.max_chars != null && <Chip>max {text.max_chars} chars</Chip>}
        {text.recommended_chars != null && <Chip>~{text.recommended_chars} ideal</Chip>}
        {text.ai_can_generate && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> AI can write
          </span>
        )}
        {text.allowed_values.length > 0 && <Chip>{text.allowed_values.length} presets</Chip>}
      </div>
    </div>
  );
}

export function TemplateRequirements({ template }: { template: PostTemplate }) {
  const input = template.input_requirements;
  const image = template.output_spec;
  const video = template.video_output_spec;
  const videoReq = template.video_requirements;

  const assets = input?.assets ?? [];
  const texts = input?.text_requirements ?? [];
  const aspectRatios = image?.supported_aspect_ratios ?? video?.supported_aspect_ratios ?? [];
  const formats = (image?.supported_formats ?? video?.supported_formats ?? []).map(formatLabel);

  // Nothing to show (e.g. a stale cached entry without the contract).
  if (!input && !image && !video) return null;

  return (
    <section className="mt-6 space-y-6">
      {/* What it produces */}
      {(aspectRatios.length > 0 || formats.length > 0 || video) && (
        <Section icon={<FileType2 className="h-4 w-4" />} title="Output">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {aspectRatios.length > 0 && (
              <div className="rounded-[14px] border border-border p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Ratio className="h-3.5 w-3.5" /> Aspect ratios
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aspectRatios.map((ratio) => (
                    <Chip key={ratio}>{ratio}</Chip>
                  ))}
                </div>
              </div>
            )}
            {formats.length > 0 && (
              <div className="rounded-[14px] border border-border p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <FileType2 className="h-3.5 w-3.5" /> File formats
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {formats.map((format) => (
                    <Chip key={format}>{format}</Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
          {video && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Chip>
                {video.duration_min_seconds}–{video.duration_max_seconds}s
              </Chip>
              <Chip>{video.fps} fps</Chip>
              {video.has_captions && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Captions className="h-3.5 w-3.5" /> captions
                </span>
              )}
              {video.has_music_slot && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Music className="h-3.5 w-3.5" /> music
                </span>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Assets */}
      {assets.length > 0 && (
        <Section icon={<ImageIcon className="h-4 w-4" />} title="Assets">
          <div className="space-y-2">
            {assets.map((asset) => (
              <AssetRow key={asset.key} asset={asset} />
            ))}
          </div>
        </Section>
      )}

      {/* Video clips */}
      {videoReq && (
        <Section icon={<Clapperboard className="h-4 w-4" />} title="Video clips">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip>{countRange(videoReq.clips_min, videoReq.clips_max)} clips</Chip>
            <Chip>
              {videoReq.clip_duration_min_seconds}–{videoReq.clip_duration_max_seconds}s each
            </Chip>
            {videoReq.requires_audio && <Chip>audio required</Chip>}
            {videoReq.supports_subtitles && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Captions className="h-3.5 w-3.5" /> subtitles
              </span>
            )}
          </div>
        </Section>
      )}

      {/* Text */}
      {texts.length > 0 && (
        <Section icon={<Type className="h-4 w-4" />} title="Text">
          <div className="space-y-2">
            {texts.map((text) => (
              <TextRow key={text.key} text={text} />
            ))}
          </div>
        </Section>
      )}
    </section>
  );
}

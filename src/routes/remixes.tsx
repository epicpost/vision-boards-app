import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchRemixes, remixesQueryKey, type RemixGenerationItem } from "@/lib/generations";
import { getAccessToken } from "@/lib/auth";

export const Route = createFileRoute("/remixes")({
  head: () => ({
    meta: [
      { title: "Your saved ideas — Remixes" },
      { name: "description", content: "Browse and download your generated remixes." },
    ],
  }),
  component: RemixesPage,
});

function formatUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) return "";

  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(updated)) return "";

  const diffMs = Date.now() - updated;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 31) return `${Math.floor(diffDays / 7)}w`;

  return `${Math.floor(diffDays / 30)}mo`;
}

function remixAspectRatio(remix: RemixGenerationItem) {
  const asset = remix.assets[0];
  if (asset?.width && asset.height && asset.width > 0 && asset.height > 0) {
    return `${asset.width} / ${asset.height}`;
  }

  const ratio = remix.aspect_ratio?.trim();
  if (ratio?.includes(":")) {
    return ratio.replace(":", " / ");
  }

  return "4 / 5";
}

function RemixCardSkeleton({ index }: { index: number }) {
  return (
    <div className="mb-3 break-inside-avoid">
      <div
        className="w-full animate-pulse rounded-[16px] bg-secondary"
        style={{ height: 260 + (index % 4) * 40 }}
      />
      <div className="mx-2 mt-2 h-4 w-3/4 animate-pulse rounded bg-secondary" />
    </div>
  );
}

function RemixStatusCard({ remix }: { remix: RemixGenerationItem }) {
  const isFailed = remix.status === "failed";

  return (
    <div className="mb-3 break-inside-avoid overflow-hidden rounded-[16px] bg-secondary">
      <div
        className="flex w-full flex-col items-center justify-center px-4 text-center"
        style={{ aspectRatio: remixAspectRatio(remix) }}
      >
        {isFailed ? (
          <>
            <h3 className="text-base font-bold text-foreground">Remix failed</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {remix.error ?? "The remix could not be generated."}
            </p>
          </>
        ) : (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            <h3 className="mt-3 text-base font-bold text-foreground">Generating remix</h3>
            <p className="mt-1 text-sm text-muted-foreground">This will update soon.</p>
          </>
        )}
      </div>
      <div className="border-t border-background/70 p-3">
        <p className="line-clamp-2 text-[13px] font-semibold text-foreground">
          {remix.template_title}
        </p>
        <Link
          to="/template/$pinId"
          params={{ pinId: remix.template_id }}
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-foreground hover:underline"
        >
          Use template again
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function RemixPreviewCard({
  remix,
  onPreview,
}: {
  remix: RemixGenerationItem;
  onPreview: (remix: RemixGenerationItem) => void;
}) {
  const asset = remix.assets[0];

  if (remix.status !== "completed" || !asset) {
    return <RemixStatusCard remix={remix} />;
  }

  return (
    <div className="mb-3 break-inside-avoid group">
      <button
        type="button"
        onClick={() => onPreview(remix)}
        className="relative block w-full overflow-hidden rounded-[16px] bg-secondary text-left"
        style={{ aspectRatio: remixAspectRatio(remix) }}
      >
        <img
          src={asset.url}
          alt={remix.caption ?? remix.template_title}
          loading="lazy"
          className="h-full w-full object-contain"
        />
        <span className="absolute inset-0 rounded-[16px] bg-black/25 opacity-0 transition group-hover:opacity-100" />
        <span className="absolute right-3 top-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground opacity-0 transition group-hover:opacity-100">
          Preview
        </span>
      </button>
      <p className="px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2">
        {remix.template_title}
      </p>
      <p className="px-2 pt-0.5 text-xs text-muted-foreground">
        {formatUpdatedAt(remix.created_at)}
      </p>
    </div>
  );
}

function RemixesGrid() {
  const [selectedRemix, setSelectedRemix] = useState<RemixGenerationItem | null>(null);
  const remixesQuery = useQuery({
    queryKey: remixesQueryKey(),
    queryFn: () => fetchRemixes(),
    enabled: Boolean(getAccessToken()),
  });
  const remixes = remixesQuery.data?.data ?? [];
  const refetchRemixes = remixesQuery.refetch;
  const selectedAsset = selectedRemix?.assets[0] ?? null;
  const hasInProgressRemix = remixes.some(
    (remix) => remix.status === "queued" || remix.status === "processing",
  );

  useEffect(() => {
    if (!hasInProgressRemix) return;

    const intervalId = window.setInterval(() => {
      void refetchRemixes();
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [hasInProgressRemix, refetchRemixes]);

  function handleDownload() {
    if (!selectedAsset || !selectedRemix) return;

    const anchor = document.createElement("a");
    anchor.href = selectedAsset.url;
    anchor.download = `epicpost-remix-${selectedRemix.generation_id}.png`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  if (remixesQuery.isLoading) {
    return (
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]">
        {Array.from({ length: 10 }, (_, index) => (
          <RemixCardSkeleton key={index} index={index} />
        ))}
      </div>
    );
  }

  if (remixesQuery.isError) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-foreground">Remixes did not load</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{remixesQuery.error.message}</p>
        <button
          onClick={() => void remixesQuery.refetch()}
          className="mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!remixes.length) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-foreground">No remixes yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Remix a template to see it here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]">
        {remixes.map((remix) => (
          <RemixPreviewCard key={remix.generation_id} remix={remix} onPreview={setSelectedRemix} />
        ))}
      </div>

      <Dialog
        open={Boolean(selectedRemix)}
        onOpenChange={(open) => !open && setSelectedRemix(null)}
      >
        <DialogContent className="max-w-lg rounded-[20px] p-6">
          <DialogHeader>
            <DialogTitle>{selectedRemix?.template_title ?? "Your remix"}</DialogTitle>
            <DialogDescription>
              {selectedRemix?.caption
                ? `${selectedRemix.caption} · ${formatUpdatedAt(selectedRemix.created_at)}`
                : selectedRemix
                  ? formatUpdatedAt(selectedRemix.created_at)
                  : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="overflow-hidden rounded-[16px] border border-border bg-secondary">
              <img
                src={selectedAsset.url}
                alt={selectedRemix?.caption ?? selectedRemix?.template_title ?? "Generated remix"}
                className="max-h-[65vh] w-full object-contain"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {selectedRemix && (
              <Link
                to="/template/$pinId"
                params={{ pinId: selectedRemix.template_id }}
                className="flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-base font-semibold text-foreground transition hover:brightness-95"
              >
                <ExternalLink className="h-4 w-4" />
                Use template again
              </Link>
            )}
            <button
              type="button"
              disabled={!selectedAsset}
              onClick={handleDownload}
              className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RemixesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="px-4 md:px-8 pt-2 pb-12 max-w-[1600px] mx-auto">
          <div className="mb-6 flex items-start justify-between gap-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Remixes</h1>
          </div>

          <nav className="mb-6 flex items-center justify-between gap-6 border-b border-transparent">
            <div className="flex items-center gap-6">
              <Link
                to="/remixes"
                className="border-b-[2px] border-foreground pb-2 text-[17px] font-semibold text-foreground transition"
              >
                Remixes
              </Link>
              <Link
                to="/boards"
                className="pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground"
              >
                Boards
              </Link>
              <Link
                to="/likes"
                className="pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground"
              >
                Likes
              </Link>
            </div>
          </nav>

          <RemixesGrid />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

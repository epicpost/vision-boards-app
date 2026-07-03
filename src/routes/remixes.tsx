import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  ExternalLink,
  Loader2,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  deleteRemix,
  fetchRemixes,
  remixesQueryKey,
  type RemixGenerationItem,
} from "@/lib/generations";
import {
  deleteSavedRemix,
  fetchSavedRemixes,
  savedRemixesQueryKey,
  type RemixSummary,
} from "@/lib/remixes";
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
  onDelete,
  isDeleting,
}: {
  remix: RemixGenerationItem;
  onPreview: (remix: RemixGenerationItem) => void;
  onDelete: (remix: RemixGenerationItem) => void;
  isDeleting: boolean;
}) {
  const asset = remix.assets[0];
  const [menuOpen, setMenuOpen] = useState(false);

  if (remix.status !== "completed" || !asset) {
    return <RemixStatusCard remix={remix} />;
  }

  return (
    <div className="mb-3 break-inside-avoid group">
      {/* Relative wrapper so the options menu is a sibling of the clickable
          image — a DropdownMenu (which renders buttons) can't be nested inside
          the card <button>. */}
      <div
        className="relative w-full overflow-hidden rounded-[16px] bg-secondary"
        style={{ aspectRatio: remixAspectRatio(remix) }}
      >
        <button
          type="button"
          onClick={() => onPreview(remix)}
          aria-label={`Preview ${remix.template_title}`}
          className="block h-full w-full text-left"
        >
          <img
            src={asset.url}
            alt={remix.caption ?? remix.template_title}
            loading="lazy"
            className="h-full w-full object-contain"
          />
          <span className="pointer-events-none absolute inset-0 rounded-[16px] bg-black/25 opacity-0 transition group-hover:opacity-100" />
        </button>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Remix options"
              className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
                menuOpen
                  ? "bg-foreground text-background opacity-100"
                  : "bg-white text-foreground opacity-0 hover:bg-secondary group-hover:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] rounded-[16px] p-2 shadow-lg">
            <DropdownMenuItem
              onSelect={() => onDelete(remix)}
              disabled={isDeleting}
              className="cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2">
        {remix.template_title}
      </p>
      <p className="px-2 pt-0.5 text-xs text-muted-foreground">
        {formatUpdatedAt(remix.created_at)}
      </p>
    </div>
  );
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

// Fullscreen remix viewer — mirrors the template detail page's image viewer
// (dark backdrop, centered media, zoom controls) and adds the remix CTAs.
function RemixViewer({
  remix,
  onClose,
  onDownload,
}: {
  remix: RemixGenerationItem;
  onClose: () => void;
  onDownload: () => void;
}) {
  const asset = remix.assets[0] ?? null;
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => {
    setZoom((value) => Math.min(ZOOM_MAX, Math.round((value + ZOOM_STEP) * 100) / 100));
  }, []);
  const zoomOut = useCallback(() => {
    setZoom((value) => Math.max(ZOOM_MIN, Math.round((value - ZOOM_STEP) * 100) / 100));
  }, []);

  // Lock body scroll while the viewer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Keyboard shortcuts: Escape to close, +/- to zoom.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          event.preventDefault();
          zoomIn();
          break;
        case "-":
          event.preventDefault();
          zoomOut();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, zoomIn, zoomOut]);

  if (!asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Remix viewer"
    >
      {/* Top bar: close (left) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-foreground shadow-md transition hover:bg-secondary"
        >
          <X className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>

      {/* Centered media */}
      <div className="flex h-full w-full items-center justify-center overflow-auto p-6">
        <img
          src={asset.url}
          alt={remix.caption ?? remix.template_title}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-[80vh] max-w-[88vw] origin-center object-contain transition-transform duration-150"
        />
      </div>

      {/* CTA buttons */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex flex-wrap items-center justify-center gap-2 px-4">
        <Link
          to="/template/$pinId"
          params={{ pinId: remix.template_id }}
          className="pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-white px-5 text-base font-semibold text-foreground shadow-md transition hover:brightness-95"
        >
          <ExternalLink className="h-4 w-4" />
          Use template again
        </Link>
        <button
          type="button"
          onClick={onDownload}
          className="pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-md transition hover:brightness-90"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-[14px] bg-white shadow-md">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <span className="h-px w-full bg-border" />
        <button
          type="button"
          aria-label="Zoom out"
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40"
        >
          <Minus className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// A saved (DB-backed) remix: opens into the editor with the user's images +
// text. The hover menu carries actions so the image stays clean.
function SavedRemixCard({
  remix,
  onDelete,
  isDeleting,
}: {
  remix: RemixSummary;
  onDelete: (remix: RemixSummary) => void;
  isDeleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const editorLink = {
    to: "/editor/$templateId" as const,
    params: { templateId: remix.post_template_id },
    search: { remixId: remix.remix_id },
  };

  return (
    <div className="mb-3 break-inside-avoid group">
      <div className="relative w-full overflow-hidden rounded-[16px] bg-secondary">
        <Link
          {...editorLink}
          aria-label={`Edit ${remix.caption ?? remix.template_title}`}
          className="relative block w-full"
          style={{ aspectRatio: "9 / 16" }}
        >
          {remix.thumbnail_url ? (
            <img
              src={remix.thumbnail_url}
              alt={remix.caption ?? remix.template_title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Open editor
            </div>
          )}
          <span className="pointer-events-none absolute inset-0 bg-black/25 opacity-0 transition group-hover:opacity-100" />
        </Link>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Remix options"
              className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
                menuOpen
                  ? "bg-foreground text-background opacity-100"
                  : "bg-white text-foreground opacity-0 hover:bg-secondary group-hover:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] rounded-[16px] p-2 shadow-lg">
            <DropdownMenuItem asChild disabled={!remix.thumbnail_url}>
              <a
                href={remix.thumbnail_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-[15px] font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                {...editorLink}
                className="flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-[15px] font-medium"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete(remix)}
              disabled={isDeleting}
              className="cursor-pointer gap-2 rounded-[10px] px-3 py-2 text-[15px] font-medium text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2">
        {remix.caption || remix.template_title}
      </p>
      <p className="px-2 pt-0.5 text-xs text-muted-foreground">
        {formatUpdatedAt(remix.created_at)}
      </p>
    </div>
  );
}

function RemixesGrid() {
  const queryClient = useQueryClient();
  const savedRemixesQuery = useQuery({
    queryKey: savedRemixesQueryKey(),
    queryFn: fetchSavedRemixes,
    enabled: Boolean(getAccessToken()),
  });
  const savedRemixes = savedRemixesQuery.data ?? [];
  const [selectedRemix, setSelectedRemix] = useState<RemixGenerationItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingSavedId, setDeletingSavedId] = useState<string | null>(null);
  const remixesQuery = useQuery({
    queryKey: remixesQueryKey(),
    queryFn: () => fetchRemixes(),
    enabled: Boolean(getAccessToken()),
  });
  const deleteMutation = useMutation({
    mutationFn: (remix: RemixGenerationItem) => deleteRemix(remix.generation_id),
    onMutate: (remix) => {
      setDeletingId(remix.generation_id);
    },
    onSuccess: (_data, remix) => {
      if (selectedRemix?.generation_id === remix.generation_id) {
        setSelectedRemix(null);
      }
      void queryClient.invalidateQueries({ queryKey: remixesQueryKey() });
      toast.success("Remix deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not delete remix.");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });
  const deleteSavedMutation = useMutation({
    mutationFn: (remix: RemixSummary) => deleteSavedRemix(remix.remix_id),
    onMutate: (remix) => {
      setDeletingSavedId(remix.remix_id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedRemixesQueryKey() });
      toast.success("Remix deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not delete remix.");
    },
    onSettled: () => {
      setDeletingSavedId(null);
    },
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

  if (remixesQuery.isLoading || savedRemixesQuery.isLoading) {
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

  if (!remixes.length && !savedRemixes.length) {
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
        {savedRemixes.map((remix) => (
          <SavedRemixCard
            key={remix.remix_id}
            remix={remix}
            onDelete={(target) => deleteSavedMutation.mutate(target)}
            isDeleting={deletingSavedId === remix.remix_id}
          />
        ))}
        {remixes.map((remix) => (
          <RemixPreviewCard
            key={remix.generation_id}
            remix={remix}
            onPreview={setSelectedRemix}
            onDelete={(target) => deleteMutation.mutate(target)}
            isDeleting={deletingId === remix.generation_id}
          />
        ))}
      </div>

      {selectedRemix && selectedAsset ? (
        <RemixViewer
          remix={selectedRemix}
          onClose={() => setSelectedRemix(null)}
          onDownload={handleDownload}
        />
      ) : null}
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

import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav } from "./MobileNav-JTGfX7W-.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-CqiGz96I.mjs";
import { r as remixesQueryKey, d as deleteRemix, f as fetchRemixes } from "./generations-D2XE-T3o.mjs";
import { g as getAccessToken } from "./router-Bd-4THC9.mjs";
import { g as Ellipsis, X, E as ExternalLink, D as Download, b as Plus, j as Minus, k as LoaderCircle } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function formatUpdatedAt(updatedAt) {
  if (!updatedAt) return "";
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(updated)) return "";
  const diffMs = Date.now() - updated;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 6e4));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 31) return `${Math.floor(diffDays / 7)}w`;
  return `${Math.floor(diffDays / 30)}mo`;
}
function remixAspectRatio(remix) {
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
function RemixCardSkeleton({
  index
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 break-inside-avoid", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full animate-pulse rounded-[16px] bg-secondary", style: {
      height: 260 + index % 4 * 40
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-2 mt-2 h-4 w-3/4 animate-pulse rounded bg-secondary" })
  ] });
}
function RemixStatusCard({
  remix
}) {
  const isFailed = remix.status === "failed";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 break-inside-avoid overflow-hidden rounded-[16px] bg-secondary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full flex-col items-center justify-center px-4 text-center", style: {
      aspectRatio: remixAspectRatio(remix)
    }, children: isFailed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-foreground", children: "Remix failed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-3 text-sm text-muted-foreground", children: remix.error ?? "The remix could not be generated." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-base font-bold text-foreground", children: "Generating remix" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "This will update soon." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-background/70 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-[13px] font-semibold text-foreground", children: remix.template_title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/template/$pinId", params: {
        pinId: remix.template_id
      }, className: "mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-foreground hover:underline", children: [
        "Use template again",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
      ] })
    ] })
  ] });
}
function RemixPreviewCard({
  remix,
  onPreview,
  onDelete,
  isDeleting
}) {
  const asset = remix.assets[0];
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  if (remix.status !== "completed" || !asset) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RemixStatusCard, { remix });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 break-inside-avoid group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden rounded-[16px] bg-secondary", style: {
      aspectRatio: remixAspectRatio(remix)
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onPreview(remix), "aria-label": `Preview ${remix.template_title}`, className: "block h-full w-full text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: asset.url, alt: remix.caption ?? remix.template_title, loading: "lazy", className: "h-full w-full object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute inset-0 rounded-[16px] bg-black/25 opacity-0 transition group-hover:opacity-100" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Remix options", className: `absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${menuOpen ? "bg-foreground text-background opacity-100" : "bg-white text-foreground opacity-0 hover:bg-secondary group-hover:opacity-100"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-5 w-5", strokeWidth: 2.5 }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", className: "min-w-[180px] rounded-[16px] p-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onSelect: () => onDelete(remix), disabled: isDeleting, className: "cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-60", children: isDeleting ? "Deleting..." : "Delete" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2", children: remix.template_title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 pt-0.5 text-xs text-muted-foreground", children: formatUpdatedAt(remix.created_at) })
  ] });
}
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;
function RemixViewer({
  remix,
  onClose,
  onDownload
}) {
  const asset = remix.assets[0] ?? null;
  const [zoom, setZoom] = reactExports.useState(1);
  const zoomIn = reactExports.useCallback(() => {
    setZoom((value) => Math.min(ZOOM_MAX, Math.round((value + ZOOM_STEP) * 100) / 100));
  }, []);
  const zoomOut = reactExports.useCallback(() => {
    setZoom((value) => Math.max(ZOOM_MIN, Math.round((value - ZOOM_STEP) * 100) / 100));
  }, []);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  reactExports.useEffect(() => {
    function handleKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target instanceof HTMLElement && target.isContentEditable) {
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
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, zoomIn, zoomOut]);
  if (!asset) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": "Remix viewer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Close", onClick: onClose, className: "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-foreground shadow-md transition hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5", strokeWidth: 2.4 }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center overflow-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: asset.url, alt: remix.caption ?? remix.template_title, style: {
      transform: `scale(${zoom})`
    }, className: "max-h-[80vh] max-w-[88vw] origin-center object-contain transition-transform duration-150" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-x-0 bottom-4 z-10 flex flex-wrap items-center justify-center gap-2 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/template/$pinId", params: {
        pinId: remix.template_id
      }, className: "pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-white px-5 text-base font-semibold text-foreground shadow-md transition hover:brightness-95", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
        "Use template again"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onDownload, className: "pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-md transition hover:brightness-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
        "Download"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-[14px] bg-white shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Zoom in", onClick: zoomIn, disabled: zoom >= ZOOM_MAX, className: "flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5", strokeWidth: 2.4 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-full bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Zoom out", onClick: zoomOut, disabled: zoom <= ZOOM_MIN, className: "flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-5 w-5", strokeWidth: 2.4 }) })
    ] })
  ] });
}
function RemixesGrid() {
  const queryClient = useQueryClient();
  const [selectedRemix, setSelectedRemix] = reactExports.useState(null);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const remixesQuery = useQuery({
    queryKey: remixesQueryKey(),
    queryFn: () => fetchRemixes(),
    enabled: Boolean(getAccessToken())
  });
  const deleteMutation = useMutation({
    mutationFn: (remix) => deleteRemix(remix.generation_id),
    onMutate: (remix) => {
      setDeletingId(remix.generation_id);
    },
    onSuccess: (_data, remix) => {
      if (selectedRemix?.generation_id === remix.generation_id) {
        setSelectedRemix(null);
      }
      void queryClient.invalidateQueries({
        queryKey: remixesQueryKey()
      });
      toast.success("Remix deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not delete remix.");
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });
  const remixes = remixesQuery.data?.data ?? [];
  const refetchRemixes = remixesQuery.refetch;
  const selectedAsset = selectedRemix?.assets[0] ?? null;
  const hasInProgressRemix = remixes.some((remix) => remix.status === "queued" || remix.status === "processing");
  reactExports.useEffect(() => {
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]", children: Array.from({
      length: 10
    }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(RemixCardSkeleton, { index }, index)) });
  }
  if (remixesQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Remixes did not load" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: remixesQuery.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void remixesQuery.refetch(), className: "mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90", children: "Try again" })
    ] });
  }
  if (!remixes.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "No remixes yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Remix a template to see it here." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]", children: remixes.map((remix) => /* @__PURE__ */ jsxRuntimeExports.jsx(RemixPreviewCard, { remix, onPreview: setSelectedRemix, onDelete: (target) => deleteMutation.mutate(target), isDeleting: deletingId === remix.generation_id }, remix.generation_id)) }),
    selectedRemix && selectedAsset ? /* @__PURE__ */ jsxRuntimeExports.jsx(RemixViewer, { remix: selectedRemix, onClose: () => setSelectedRemix(null), onDownload: handleDownload }) : null
  ] });
}
function RemixesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:pl-[72px] pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { showTabs: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-4 md:px-8 pt-2 pb-12 max-w-[1600px] mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex items-start justify-between gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight text-foreground", children: "Remixes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mb-6 flex items-center justify-between gap-6 border-b border-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/remixes", className: "border-b-[2px] border-foreground pb-2 text-[17px] font-semibold text-foreground transition", children: "Remixes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/boards", className: "pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground", children: "Boards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/likes", className: "pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground", children: "Likes" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RemixesGrid, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {})
  ] });
}
export {
  RemixesPage as component
};

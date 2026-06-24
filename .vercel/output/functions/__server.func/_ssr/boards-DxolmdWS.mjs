import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav } from "./MobileNav-JTGfX7W-.mjs";
import { C as CreateBoardDialog } from "./CreateBoardDialog-Bl7p3N_5.mjs";
import { T as TemplateCard } from "./TemplateCard-DEpu7ADN.mjs";
import { g as getAccessToken, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, e as DialogDescription, j as getTemplateMedia } from "./router-Bd-4THC9.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-CqiGz96I.mjs";
import { b as boardsQueryKey, d as deleteBoard, f as fetchBoards } from "./boards-BOmeqqUF.mjs";
import { f as fetchRemixes, r as remixesQueryKey } from "./generations-D2XE-T3o.mjs";
import { f as fetchLikedTemplates, l as likedTemplatesQueryKey } from "./likes-BR5Zeahr.mjs";
import { E as ExternalLink, D as Download, o as Lock, g as Ellipsis, k as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
const seeds = [
  { s: "ocean", h: 620, t: "Aerial coastline" },
  { s: "varanasi", h: 540, t: "varanasi", a: "shivamtravels" },
  { s: "barcelona", h: 460, t: "W Hotel Barcelona" },
  { s: "appdesign", h: 500, t: "Meeting app concept", a: "design.lab" },
  { s: "cabin", h: 580, t: "A-frame in the forest" },
  { s: "gaudi", h: 540, t: "Park Güell mosaics" },
  { s: "italy", h: 600, t: "Italy travel itinerary", a: "wanderoot" },
  { s: "portrait", h: 520, t: "Editorial portrait" },
  { s: "coffee", h: 480, t: "Slow mornings", a: "ella_contentclub" },
  { s: "mountains", h: 560 },
  { s: "garden", h: 440, t: "Garden inspiration" },
  { s: "fashion", h: 620, t: "Soft tailoring" },
  { s: "interior", h: 500, t: "Warm minimal interior" },
  { s: "sunset", h: 460 },
  { s: "ceramics", h: 540, t: "Studio ceramics", a: "claystudio" },
  { s: "books", h: 420, t: "Reading nook" },
  { s: "lake", h: 600 },
  { s: "city", h: 520, t: "Night city walk" },
  { s: "flowers", h: 440 },
  { s: "skincare", h: 560, t: "Skincare flatlay" },
  { s: "desk", h: 480, t: "Workspace setup" },
  { s: "tokyo", h: 620, t: "Tokyo neon" },
  { s: "dessert", h: 460, t: "Pavlova recipe" },
  { s: "swim", h: 540 }
];
const pins = seeds.map((p, i) => ({
  id: String(i),
  src: `https://picsum.photos/seed/${p.s}/600/${p.h}`,
  width: 600,
  height: p.h,
  fallbackHeight: p.h,
  title: p.t
}));
function take(start, count) {
  return Array.from({
    length: count
  }, (_, i) => {
    const pin = pins[(start + i) % pins.length];
    return pin?.src ?? "";
  });
}
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
function BoardCard({
  board,
  onDelete,
  isDeleting
}) {
  const thumbs = board.preview_assets.map((asset) => asset.url);
  const fallbackThumbs = take(board.id.length % pins.length, 3);
  const [main, ...rest] = [...thumbs, ...fallbackThumbs].slice(0, 3);
  const updated = formatUpdatedAt(board.updated_at);
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[20px] bg-secondary aspect-[4/3]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", search: {
        board: board.id
      }, className: "block h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full gap-px", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-full w-2/3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: main, alt: "", className: "h-full w-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-1/3 flex-col gap-px", children: rest.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "h-1/2 w-full object-cover" }, i)) })
      ] }) }),
      board.is_secret && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-foreground", strokeWidth: 2.5 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Board options", className: `absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${menuOpen ? "bg-foreground text-background opacity-100" : "bg-white text-foreground opacity-0 hover:bg-secondary group-hover:opacity-100"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-5 w-5", strokeWidth: 2.5 }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", className: "min-w-[180px] rounded-[16px] p-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onSelect: () => onDelete(board), disabled: isDeleting, className: "cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-60", children: isDeleting ? "Deleting..." : "Delete" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 px-1 text-[17px] font-bold text-foreground truncate", children: board.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "px-1 text-sm text-muted-foreground", children: [
      board.template_count,
      " ",
      board.template_count === 1 ? "Template" : "Templates",
      updated ? ` · ${updated}` : ""
    ] })
  ] });
}
function BoardCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3] rounded-[20px] bg-secondary animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 mx-1 h-5 w-2/3 rounded bg-secondary animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 mx-1 h-4 w-1/3 rounded bg-secondary animate-pulse" })
  ] });
}
const TABS = [{
  key: "remixes",
  label: "Remixes"
}, {
  key: "boards",
  label: "Boards"
}, {
  key: "likes",
  label: "Likes"
}];
function templateToPin(template, index) {
  const media = getTemplateMedia(template);
  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + index % 4 * 40,
    title: template.title,
    isSaved: template.is_saved
  };
}
function LikesGrid() {
  const likesQuery = useQuery({
    queryKey: likedTemplatesQueryKey(),
    queryFn: () => fetchLikedTemplates(),
    enabled: Boolean(getAccessToken())
  });
  const liked = likesQuery.data?.data ?? [];
  if (likesQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]", children: Array.from({
      length: 10
    }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 break-inside-avoid rounded-[16px] bg-secondary animate-pulse", style: {
      height: 260 + index % 4 * 40
    } }, index)) });
  }
  if (likesQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Likes did not load" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: likesQuery.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void likesQuery.refetch(), className: "mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90", children: "Try again" })
    ] });
  }
  if (!liked.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "No likes yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Tap the heart on a template to find it here later." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]", children: liked.map((template, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateCard, { pin: templateToPin(template, index) }, template.id)) });
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
  onPreview
}) {
  const asset = remix.assets[0];
  if (remix.status !== "completed" || !asset) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RemixStatusCard, { remix });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 break-inside-avoid group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onPreview(remix), className: "relative block w-full overflow-hidden rounded-[16px] bg-secondary text-left", style: {
      aspectRatio: remixAspectRatio(remix)
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: asset.url, alt: remix.caption ?? remix.template_title, loading: "lazy", className: "h-full w-full object-contain" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-[16px] bg-black/25 opacity-0 transition group-hover:opacity-100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground opacity-0 transition group-hover:opacity-100", children: "Preview" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2", children: remix.template_title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 pt-0.5 text-xs text-muted-foreground", children: formatUpdatedAt(remix.created_at) })
  ] });
}
function RemixesGrid() {
  const [selectedRemix, setSelectedRemix] = reactExports.useState(null);
  const remixesQuery = useQuery({
    queryKey: remixesQueryKey(),
    queryFn: () => fetchRemixes(),
    enabled: Boolean(getAccessToken())
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 [column-fill:_balance]", children: remixes.map((remix) => /* @__PURE__ */ jsxRuntimeExports.jsx(RemixPreviewCard, { remix, onPreview: setSelectedRemix }, remix.generation_id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(selectedRemix), onOpenChange: (open) => !open && setSelectedRemix(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg rounded-[20px] p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: selectedRemix?.template_title ?? "Your remix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: selectedRemix?.caption ? `${selectedRemix.caption} · ${formatUpdatedAt(selectedRemix.created_at)}` : selectedRemix ? formatUpdatedAt(selectedRemix.created_at) : "" })
      ] }),
      selectedAsset && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-[16px] border border-border bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedAsset.url, alt: selectedRemix?.caption ?? selectedRemix?.template_title ?? "Generated remix", className: "max-h-[65vh] w-full object-contain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-end gap-2", children: [
        selectedRemix && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/template/$pinId", params: {
          pinId: selectedRemix.template_id
        }, className: "flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-base font-semibold text-foreground transition hover:brightness-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
          "Use template again"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: !selectedAsset, onClick: handleDownload, className: "flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          "Download"
        ] })
      ] })
    ] }) })
  ] });
}
function BoardsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("boards");
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const boardsQuery = useQuery({
    queryKey: boardsQueryKey(),
    queryFn: () => fetchBoards()
  });
  const deleteMutation = useMutation({
    mutationFn: (board) => deleteBoard(board.id),
    onMutate: (board) => {
      setDeletingId(board.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: boardsQueryKey()
      });
      toast.success("Board deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not delete board.");
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });
  const boards = boardsQuery.data?.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:pl-[72px] pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { showTabs: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-4 md:px-8 pt-2 pb-12 max-w-[1600px] mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-6 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-foreground tracking-tight", children: "Boards" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center justify-between gap-6 border-b border-transparent mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-6", children: TABS.map((t) => t.key === "remixes" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/remixes", className: "pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground", children: t.label }, t.key) : t.key === "likes" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/likes", className: "pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground", children: t.label }, t.key) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab(t.key), className: `pb-2 text-[17px] font-semibold transition ${t.key === activeTab ? "text-foreground border-b-[2px] border-foreground" : "text-foreground/80 hover:text-foreground"}`, children: t.label }, t.key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsCreateOpen(true), className: "rounded-full bg-[#e60023] hover:bg-[#ad081b] transition text-white px-5 h-11 text-[15px] font-semibold", children: "Create" }) })
        ] }),
        activeTab === "likes" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LikesGrid, {}) : activeTab === "remixes" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RemixesGrid, {}) : boardsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8", children: Array.from({
          length: 8
        }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoardCardSkeleton, {}, index)) }) : boardsQuery.isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Boards did not load" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: boardsQuery.error.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void boardsQuery.refetch(), className: "mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90", children: "Try again" })
        ] }) : boards.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8", children: boards.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoardCard, { board: b, onDelete: (target) => deleteMutation.mutate(target), isDeleting: deletingId === b.id }, b.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "No boards yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Create a board to start organizing saved ideas." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreateBoardDialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen })
  ] });
}
export {
  BoardsPage as component
};

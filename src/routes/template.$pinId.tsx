import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Upload,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Smile,
  Sticker,
  Image as ImageIcon,
  Search,
  Lock,
  Check,
  Plus,
  Link2,
  MessageCircle,
  Facebook,
  Twitter,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { TemplateCard } from "@/components/epicpost/TemplateCard";
import { MobileNav } from "@/components/epicpost/MobileNav";
import { SignupDialog } from "@/components/epicpost/SignupDialog";
import { CreateBoardDialog } from "@/components/epicpost/CreateBoardDialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPostTemplate,
  fetchPostTemplates,
  getTemplateMedia,
  postTemplateQueryKey,
  postTemplatesQueryKey,
  type TemplateMediaType,
  type PostTemplate,
  type PostTemplateFeedResponse,
} from "@/lib/post-templates";
import { TemplateRequirements } from "@/components/epicpost/TemplateRequirements";
import { RemixComposer } from "@/components/epicpost/RemixComposer";
import {
  boardsQueryKey,
  fetchBoards,
  saveTemplateToBoard,
  unsaveTemplateFromBoard,
  type Board,
} from "@/lib/boards";
import { likedTemplatesQueryKey, likeTemplate, unlikeTemplate } from "@/lib/likes";
import { getAccessToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "https://www.epicpost.app";
const DEFAULT_SHARE_TITLE = "EpicPost — Remixable Social Media Templates";
const DEFAULT_SHARE_DESCRIPTION =
  "Discover curated social media templates, remix them with your own assets, and create daily posts, reels, stories, and visuals faster with AI.";

function absoluteUrl(value: string) {
  try {
    return new URL(value, APP_BASE_URL).toString();
  } catch {
    return value;
  }
}

function getTemplateShareMeta(template: PostTemplate | null, pinId: string) {
  const media = template ? getTemplateMedia(template) : null;
  const title = template?.title ? `${template.title} | EpicPost` : DEFAULT_SHARE_TITLE;
  const description = template?.description || template?.title || DEFAULT_SHARE_DESCRIPTION;
  const url = absoluteUrl(`/template/${pinId}`);
  const imageUrl = media?.type === "image" && media.url ? absoluteUrl(media.url) : null;

  return {
    title,
    description,
    url,
    imageUrl,
    imageWidth: media?.width,
    imageHeight: media?.height,
  };
}

function templateShareMetaTags(template: PostTemplate | null, pinId: string) {
  const meta = getTemplateShareMeta(template, pinId);
  const tags = [
    { title: meta.title },
    { name: "description", content: meta.description },
    { property: "og:title", content: meta.title },
    { property: "og:description", content: meta.description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: meta.url },
    { name: "twitter:card", content: meta.imageUrl ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: meta.title },
    { name: "twitter:description", content: meta.description },
  ];

  if (meta.imageUrl) {
    tags.push(
      { property: "og:image", content: meta.imageUrl },
      { property: "og:image:secure_url", content: meta.imageUrl },
      { property: "og:image:alt", content: meta.title },
      { name: "twitter:image", content: meta.imageUrl },
      { name: "twitter:image:alt", content: meta.title },
    );

    if (meta.imageWidth) {
      tags.push({ property: "og:image:width", content: String(meta.imageWidth) });
    }
    if (meta.imageHeight) {
      tags.push({ property: "og:image:height", content: String(meta.imageHeight) });
    }
  }

  return tags;
}

export const Route = createFileRoute("/template/$pinId")({
  loader: async ({ params }) => fetchPostTemplate(params.pinId).catch(() => null),
  head: ({ loaderData, params }) => ({
    meta: templateShareMetaTags(loaderData ?? null, params.pinId),
    links: [{ rel: "canonical", href: absoluteUrl(`/template/${params.pinId}`) }],
  }),
  component: PinDetail,
});

function templateToPin(template: PostTemplate, index: number) {
  const media = getTemplateMedia(template);

  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + (index % 4) * 40,
    title: template.title,
    isSaved: template.is_saved,
  };
}

function uniqueTemplates(templates: PostTemplate[]) {
  return Array.from(new Map(templates.map((template) => [template.id, template])).values());
}

function preloadMediaAssets(media: PreviewMedia[]) {
  const cleanup: Array<() => void> = [];

  media.forEach((item) => {
    if (item.type === "video") {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = item.url;
      video.load();
      cleanup.push(() => {
        video.removeAttribute("src");
        video.load();
      });
      return;
    }

    const image = new Image();
    image.src = item.url;
  });

  return () => {
    cleanup.forEach((dispose) => dispose());
  };
}

interface PreviewMedia {
  id: string;
  url: string;
  type: TemplateMediaType | null;
}

function getBoardThumb(board: Board) {
  return board.preview_assets[0]?.url ?? "";
}

function BoardRow({
  board,
  saving,
  selected,
  onSelect,
}: {
  board: Board;
  saving: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const thumb = getBoardThumb(board);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={saving}
      className={`flex h-16 w-full items-center gap-3 rounded-[16px] px-2 text-left transition hover:bg-secondary disabled:opacity-60 ${
        selected ? "bg-secondary" : ""
      }`}
    >
      {thumb ? (
        <img src={thumb} alt="" className="h-12 w-12 shrink-0 rounded-[14px] object-cover" />
      ) : (
        <span className="h-12 w-12 shrink-0 rounded-[14px] bg-secondary" />
      )}
      <span className="min-w-0 flex-1 truncate text-base font-semibold">{board.name}</span>
      {saving ? (
        <span className="text-[13px] font-medium text-muted-foreground">Saving...</span>
      ) : selected ? (
        <Check className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2.6} />
      ) : (
        board.is_secret && <Lock className="h-5 w-5 shrink-0 text-foreground" />
      )}
    </button>
  );
}

type ShareTarget = {
  key: string;
  label: string;
  bg: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
};

type ShareRecipient = { id: string; name: string; handle: string };

function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Reusable Share popover — rendered both in the detail header and the
// fullscreen viewer (each with its own open state and trigger).
function SharePopover({
  open,
  onOpenChange,
  align = "center",
  trigger,
  shareTargets,
  recipients,
  search,
  onSearchChange,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: "start" | "center" | "end";
  trigger: ReactNode;
  shareTargets: ShareTarget[];
  recipients: ShareRecipient[];
  search: string;
  onSearchChange: (value: string) => void;
  onSend: (recipient: ShareRecipient) => void;
}) {
  const emailSearch = search.trim();
  const canSendEmail = recipients.length === 0 && isEmailAddress(emailSearch);
  const emailRecipient: ShareRecipient | null = canSendEmail
    ? { id: `email:${emailSearch}`, name: emailSearch, handle: emailSearch }
    : null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className="w-[min(calc(100vw-24px),360px)] overflow-hidden rounded-[20px] border-0 bg-background p-0 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
      >
        <div className="max-h-[min(72vh,560px)] overflow-y-auto px-4 pb-4 pt-4">
          <h3 className="mb-4 text-center text-xl font-bold">Share</h3>
          <div className="mb-4 flex items-start justify-between gap-2">
            {shareTargets.map((target) =>
              target.href ? (
                <a
                  key={target.key}
                  href={target.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${target.bg}`}
                  >
                    {target.icon}
                  </span>
                  <span className="text-[13px] font-medium text-foreground">{target.label}</span>
                </a>
              ) : (
                <button
                  key={target.key}
                  type="button"
                  onClick={target.onClick}
                  className="flex flex-1 flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${target.bg}`}
                  >
                    {target.icon}
                  </span>
                  <span className="text-[13px] font-medium text-foreground">{target.label}</span>
                </button>
              ),
            )}
          </div>

          <div className="mb-4 h-px bg-border" />

          <label className="mb-4 flex h-12 items-center gap-2 rounded-[16px] bg-input px-4 transition focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </label>

          {emailRecipient ? (
            <div className="flex items-center gap-3 rounded-[14px] px-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground">
                  {emailRecipient.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSend(emailRecipient)}
                className="h-10 shrink-0 rounded-full bg-secondary px-5 text-sm font-semibold text-foreground transition hover:brightness-95"
              >
                Send
              </button>
            </div>
          ) : recipients.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No people match your search.
            </p>
          ) : (
            <div className="space-y-1">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center gap-3 rounded-[14px] px-2 py-2"
                >
                  <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-rose-300 to-amber-200" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-foreground">
                      {recipient.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{recipient.handle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSend(recipient)}
                    className="h-10 shrink-0 rounded-full bg-secondary px-5 text-sm font-semibold text-foreground transition hover:brightness-95"
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Reusable Save-to-board popover — shared by the detail header and the
// fullscreen viewer.
function SaveToBoardPopover({
  open,
  onOpenChange,
  align = "end",
  trigger,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  boardSearch,
  onBoardSearchChange,
  topChoices,
  otherBoards,
  savingBoardId,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: "start" | "center" | "end";
  trigger: ReactNode;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  isEmpty: boolean;
  boardSearch: string;
  onBoardSearchChange: (value: string) => void;
  topChoices: Board[];
  otherBoards: Board[];
  savingBoardId: string | null;
  currentBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className="w-[min(calc(100vw-24px),360px)] overflow-hidden rounded-[20px] border-0 bg-background p-0 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
      >
        <div className="max-h-[min(72vh,560px)] overflow-y-auto px-4 pb-24 pt-4">
          <h3 className="mb-4 text-center text-xl font-bold">Save</h3>
          <label className="mb-4 flex h-12 items-center gap-2 rounded-[16px] bg-input px-4 transition focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search"
              value={boardSearch}
              onChange={(event) => onBoardSearchChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </label>

          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">Loading boards...</p>
          ) : isError ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">{errorMessage}</p>
          ) : isEmpty ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {boardSearch ? "No boards match your search." : "No boards yet."}
            </p>
          ) : (
            <>
              {topChoices.length > 0 && (
                <>
                  <p className="mb-2 px-2 text-[13px] font-medium text-muted-foreground">
                    Top choices
                  </p>
                  <div className="space-y-2">
                    {topChoices.map((board) => (
                      <BoardRow
                        key={board.id}
                        board={board}
                        saving={savingBoardId === board.id}
                        selected={board.id === currentBoardId}
                        onSelect={() => onSelectBoard(board.id)}
                      />
                    ))}
                  </div>
                </>
              )}

              {otherBoards.length > 0 && (
                <>
                  <p className="mb-2 mt-4 px-2 text-[13px] font-medium text-muted-foreground">
                    All boards
                  </p>
                  <div className="space-y-2">
                    {otherBoards.map((board) => (
                      <BoardRow
                        key={board.id}
                        board={board}
                        saving={savingBoardId === board.id}
                        selected={board.id === currentBoardId}
                        onSelect={() => onSelectBoard(board.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 rounded-b-[20px] bg-background/95 px-4 py-3 shadow-[0_-8px_22px_rgba(0,0,0,0.08)] backdrop-blur transition hover:bg-secondary">
          <button
            type="button"
            onClick={onCreateBoard}
            className="flex h-16 w-full items-center gap-3 px-2 text-left font-semibold"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-secondary">
              <Plus className="h-6 w-6 text-foreground" />
            </span>
            <span className="text-base">Create board</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function showSavedToast(board: Board | null, onUndo: () => void) {
  const thumbs = board?.preview_assets.slice(0, 4) ?? [];

  toast.custom(
    (id) => (
      <div className="flex items-center gap-3 rounded-[18px] bg-[#2d2c2a] px-3 py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
        <div className="grid h-11 w-11 shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-[10px] bg-white/10">
          {thumbs.length > 0 ? (
            thumbs.map((asset) => (
              <img key={asset.id} src={asset.url} alt="" className="h-full w-full object-cover" />
            ))
          ) : (
            <span className="col-span-2 row-span-2" />
          )}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[15px] text-white/80">Saved to</p>
          <p className="truncate text-[15px] font-bold">{board?.name ?? "your board"}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onUndo();
            toast.dismiss(id);
          }}
          className="shrink-0 rounded-[14px] bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Undo
        </button>
      </div>
    ),
    {
      duration: 5000,
      unstyled: true,
      className: "!border-0 !bg-transparent !p-0 !shadow-none",
    },
  );
}

function showRemovedToast() {
  toast.custom(
    () => (
      <div className="rounded-[18px] bg-[#56544e] px-5 py-4 text-[17px] font-medium text-white shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
        Removed from your board!
      </div>
    ),
    { unstyled: true, className: "!border-0 !bg-transparent !p-0 !shadow-none" },
  );
}

function PinDetail() {
  const { pinId } = Route.useParams();
  const loaderTemplate = Route.useLoaderData();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  // Fullscreen viewer: independent share/save popover state so the overlay's
  // controls don't collide with the inline header ones.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fsShareOpen, setFsShareOpen] = useState(false);
  const [fsSaveOpen, setFsSaveOpen] = useState(false);
  const [shareSearch, setShareSearch] = useState("");
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [savedBoardId, setSavedBoardId] = useState<string | null>(null);
  const [isFirstMediaLoaded, setIsFirstMediaLoaded] = useState(false);
  const [showRequiredInfo, setShowRequiredInfo] = useState(false);
  const isSignedIn = Boolean(getAccessToken());
  // Prefetch and cache boards as soon as the pin detail opens so that opening
  // the save dropdown reads from the cache instead of showing "Loading boards...".
  const boardsQuery = useQuery({
    queryKey: boardsQueryKey(pinId),
    queryFn: () => fetchBoards(pinId),
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
  const unsaveMutation = useMutation({
    mutationFn: (boardId: string) => unsaveTemplateFromBoard(pinId, boardId),
    onSuccess: () => {
      setSavedBoardId(null);
      queryClient.setQueryData<PostTemplate | undefined>(postTemplateQueryKey(pinId), (cached) =>
        cached ? { ...cached, is_saved: false, board_id: null, board_name: null } : cached,
      );
      void queryClient.invalidateQueries({ queryKey: ["post-templates"] });
      showRemovedToast();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not remove template.");
    },
  });
  const saveMutation = useMutation({
    mutationFn: (boardId: string) => saveTemplateToBoard(pinId, boardId),
    onSuccess: (_data, boardId) => {
      setSavedBoardId(boardId);
      const board = boardsQuery.data?.data.find((item) => item.id === boardId);
      queryClient.setQueryData<PostTemplate | undefined>(postTemplateQueryKey(pinId), (cached) =>
        cached
          ? { ...cached, is_saved: true, board_id: boardId, board_name: board?.name ?? null }
          : cached,
      );
      void queryClient.invalidateQueries({ queryKey: ["post-templates"] });
      showSavedToast(board ?? null, () => {
        unsaveMutation.mutate(boardId);
      });
      setIsSaveOpen(false);
      setFsSaveOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not save template.");
    },
  });
  const likeMutation = useMutation({
    mutationFn: (liked: boolean) => (liked ? likeTemplate(pinId) : unlikeTemplate(pinId)),
    onSuccess: (state) => {
      // Reconcile the detail cache with the server's authoritative count/state.
      queryClient.setQueryData<PostTemplate | undefined>(postTemplateQueryKey(pinId), (cached) =>
        cached ? { ...cached, is_liked: state.is_liked, likes_count: state.likes_count } : cached,
      );
      void queryClient.invalidateQueries({ queryKey: likedTemplatesQueryKey() });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not update like.");
    },
  });
  const boards = useMemo(() => boardsQuery.data?.data ?? [], [boardsQuery.data]);
  const filteredBoards = useMemo(() => {
    const query = boardSearch.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter((board) => board.name.toLowerCase().includes(query));
  }, [boards, boardSearch]);
  // The API flags boards relevant to this template (`suggest_for=pinId`) as
  // top choices based on tag overlap; we keep them out of the "All boards" list.
  // While searching, show a single flat list of matches instead.
  const topChoices = boardSearch ? [] : filteredBoards.filter((board) => board.is_top_choice);
  const otherBoards = boardSearch
    ? filteredBoards
    : filteredBoards.filter((board) => !board.is_top_choice);
  const selectedBoard = boards.find((board) => board.id === savedBoardId) ?? null;
  // Use a dedicated key (not `postTemplatesQueryKey()`) so this plain query never
  // clobbers the home feed's `useInfiniteQuery` cache, which shares that key but
  // stores a `{ pages, pageParams }` shape. A flat write there makes the infinite
  // observer crash on `data.pages.length`.
  const defaultFeedQuery = useQuery({
    queryKey: ["post-templates-related"],
    queryFn: () => fetchPostTemplates(),
  });
  const cachedFeeds = queryClient.getQueriesData<PostTemplateFeedResponse>({
    queryKey: ["post-templates"],
  });
  const cachedTemplates = cachedFeeds.flatMap(([, feed]) => feed?.data ?? []);
  const templates = uniqueTemplates([...cachedTemplates, ...(defaultFeedQuery.data?.data ?? [])]);
  // Fetch the full single-template contract (input/output requirements, slots)
  // directly so the page can render the requirements panel even when the feed
  // cache is empty (e.g. opening the detail URL cold).
  const detailQuery = useQuery({
    queryKey: postTemplateQueryKey(pinId),
    queryFn: () => fetchPostTemplate(pinId),
  });
  const template =
    detailQuery.data ?? loaderTemplate ?? templates.find((item) => item.id === pinId);
  const shareUrl = typeof window !== "undefined" ? window.location.href : `/template/${pinId}`;
  const shareTitle = template?.title ?? "Check out this template on EpicPost";
  const shareTargets = useMemo(
    () => [
      {
        key: "copy",
        label: "Copy link",
        bg: "bg-secondary",
        icon: <Link2 className="h-7 w-7 text-foreground" strokeWidth={2.2} />,
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied");
          } catch {
            toast.error("Could not copy link");
          }
        },
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        bg: "bg-[#25D366]",
        icon: <MessageCircle className="h-7 w-7 text-white" strokeWidth={2.2} />,
        href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
      },
      {
        key: "facebook",
        label: "Facebook",
        bg: "bg-[#1877F2]",
        icon: <Facebook className="h-7 w-7 text-white" fill="currentColor" strokeWidth={0} />,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      {
        key: "x",
        label: "X",
        bg: "bg-foreground",
        icon: <Twitter className="h-7 w-7 text-background" fill="currentColor" strokeWidth={0} />,
        href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      },
    ],
    [shareUrl, shareTitle],
  );
  const shareRecipients = useMemo(
    () => [
      { id: "ella", name: "ELLA", handle: "@ella_contentclub" },
      {
        id: "global-travel",
        name: "Global Travel Inspiration",
        handle: "@GlobalTravelCollection2",
      },
      { id: "uae", name: "UAE", handle: "@uaestories" },
    ],
    [],
  );
  const filteredRecipients = useMemo(() => {
    const query = shareSearch.trim().toLowerCase();
    if (!query) return shareRecipients;
    return shareRecipients.filter(
      (recipient) =>
        recipient.name.toLowerCase().includes(query) ||
        recipient.handle.toLowerCase().includes(query),
    );
  }, [shareRecipients, shareSearch]);
  const currentBoardId = savedBoardId ?? template?.board_id ?? null;
  const isSaved = Boolean(template?.is_saved || currentBoardId);
  const savingBoardId = saveMutation.isPending ? (saveMutation.variables ?? null) : null;
  const boardsErrorMessage =
    boardsQuery.error instanceof Error ? boardsQuery.error.message : "Could not load boards.";
  const saveButtonLabel =
    selectedBoard?.name ??
    (template?.board_id && template.board_name ? template.board_name : "Save to board");
  const relatedTemplates = templates.filter((item) => item.id !== pinId);
  const previewMedia = useMemo<PreviewMedia[]>(() => {
    if (!template) return [];

    const mediaItems = template.assets
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((asset) => ({ id: asset.id, url: asset.url, type: asset.type }));

    if (mediaItems.length > 0) return mediaItems;

    const media = getTemplateMedia(template);
    return media.url ? [{ id: `${template.id}-preview`, url: media.url, type: media.type }] : [];
  }, [template]);
  const firstPreviewMediaId = previewMedia[0]?.id;
  const selectedMedia = previewMedia[selectedMediaIndex] ?? previewMedia[0] ?? null;
  const showMediaBullets = previewMedia.length > 1;
  const showMediaPreviews = previewMedia.length > 1;
  const canShowPreviousMedia = selectedMediaIndex > 0;
  const canShowNextMedia = selectedMediaIndex < previewMedia.length - 1;
  const sidePins = relatedTemplates.slice(0, 10);
  const belowPins = relatedTemplates.slice(10).concat(relatedTemplates.slice(0, 10));
  const isTemplateLoading = !template && (detailQuery.isLoading || defaultFeedQuery.isLoading);

  function showPreviousMedia() {
    setSelectedMediaIndex((index) => Math.max(0, index - 1));
  }

  function showNextMedia() {
    setSelectedMediaIndex((index) => Math.min(previewMedia.length - 1, index + 1));
  }

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_STEP = 0.25;

  const zoomIn = useCallback(() => {
    setZoom((value) => Math.min(ZOOM_MAX, Math.round((value + ZOOM_STEP) * 100) / 100));
  }, []);
  const zoomOut = useCallback(() => {
    setZoom((value) => Math.max(ZOOM_MIN, Math.round((value - ZOOM_STEP) * 100) / 100));
  }, []);

  function openFullscreen() {
    setZoom(1);
    setIsFullscreen(true);
  }

  function closeFullscreen() {
    setIsFullscreen(false);
    setFsShareOpen(false);
    setFsSaveOpen(false);
  }

  function handleSendRecipient(recipient: ShareRecipient) {
    if (!isSignedIn) {
      setIsShareOpen(false);
      setFsShareOpen(false);
      setIsAuthOpen(true);
      return;
    }
    toast.success(`Sent to ${recipient.name}`);
  }

  function openCreateBoard() {
    setIsSaveOpen(false);
    setFsSaveOpen(false);
    setIsCreateBoardOpen(true);
  }

  function requireAuthToSave(): boolean {
    if (!isSignedIn) {
      setIsAuthOpen(true);
      return false;
    }
    return true;
  }

  // Reset zoom whenever the active media changes (or the viewer closes).
  useEffect(() => {
    setZoom(1);
  }, [selectedMediaIndex, isFullscreen]);

  useEffect(() => {
    setSelectedMediaIndex(0);
    setIsFirstMediaLoaded(false);
  }, [pinId]);

  useEffect(() => {
    setIsFirstMediaLoaded(false);
  }, [firstPreviewMediaId]);

  useEffect(() => {
    if (selectedMediaIndex >= previewMedia.length) {
      setSelectedMediaIndex(0);
    }
  }, [previewMedia.length, selectedMediaIndex]);

  useEffect(() => {
    if (previewMedia.length <= 1) return;

    function handleCarouselKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setSelectedMediaIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "ArrowRight") {
        setSelectedMediaIndex((index) => Math.min(previewMedia.length - 1, index + 1));
      }
    }

    window.addEventListener("keydown", handleCarouselKeyDown);
    return () => window.removeEventListener("keydown", handleCarouselKeyDown);
  }, [previewMedia.length]);

  // Fullscreen viewer shortcuts: Escape to close, Up/Down to change media (in
  // addition to the Left/Right handled above), +/- to zoom.
  useEffect(() => {
    if (!isFullscreen) return;

    function handleFullscreenKeyDown(event: KeyboardEvent) {
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
          closeFullscreen();
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedMediaIndex((index) => Math.max(0, index - 1));
          break;
        case "ArrowDown":
          event.preventDefault();
          setSelectedMediaIndex((index) => Math.min(previewMedia.length - 1, index + 1));
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

    window.addEventListener("keydown", handleFullscreenKeyDown);
    return () => window.removeEventListener("keydown", handleFullscreenKeyDown);
  }, [isFullscreen, previewMedia.length, zoomIn, zoomOut]);

  // Lock body scroll while the fullscreen viewer is open.
  useEffect(() => {
    if (!isFullscreen || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFirstMediaLoaded || previewMedia.length <= 1) return;

    return preloadMediaAssets(previewMedia.slice(1));
  }, [isFirstMediaLoaded, previewMedia]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="px-3 md:px-6 pb-10">
          <div className="flex gap-3 items-start">
            <div className="w-full xl:w-4/5 2xl:w-4/6">
              <article className="rounded-[16px] border border-border bg-background overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image side */}
                  <div className="group/preview relative bg-white">
                    <button
                      aria-label="Back"
                      onClick={() => router.history.back()}
                      className="absolute top-4 left-4 z-10 h-11 w-11 rounded-[16px] bg-background shadow-md flex items-center justify-center hover:bg-secondary transition"
                    >
                      <ArrowLeft className="h-5 w-5 text-foreground" strokeWidth={2.4} />
                    </button>
                    {selectedMedia?.type === "video" ? (
                      <div className="relative mx-auto flex w-fit max-w-full">
                        <video
                          key={selectedMedia.id}
                          src={selectedMedia.url}
                          aria-label={template?.title ?? "Video template"}
                          controls
                          muted
                          loop
                          playsInline
                          autoPlay
                          onLoadedData={() => {
                            if (selectedMediaIndex === 0) setIsFirstMediaLoaded(true);
                          }}
                          className="max-h-[820px] max-w-full object-contain"
                        />
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                          <button
                            aria-label="Expand"
                            onClick={openFullscreen}
                            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-background shadow-md transition hover:bg-secondary"
                          >
                            <Maximize2 className="h-5 w-5 text-foreground" />
                          </button>
                        </div>
                      </div>
                    ) : selectedMedia ? (
                      <div className="relative mx-auto flex w-fit max-w-full">
                        <img
                          key={selectedMedia.id}
                          src={selectedMedia.url}
                          alt={template?.title ?? "Template"}
                          onLoad={() => {
                            if (selectedMediaIndex === 0) setIsFirstMediaLoaded(true);
                          }}
                          className="max-h-[820px] max-w-full object-contain"
                        />
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                          <button
                            aria-label="Expand"
                            onClick={openFullscreen}
                            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-background shadow-md transition hover:bg-secondary"
                          >
                            <Maximize2 className="h-5 w-5 text-foreground" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {isTemplateLoading ? (
                          <TemplatePreviewSkeleton />
                        ) : (
                          <div className="flex min-h-[480px] w-full items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground">
                            Template preview unavailable
                          </div>
                        )}
                      </>
                    )}
                    {canShowPreviousMedia ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        aria-label="Previous media"
                        onClick={showPreviousMedia}
                        className="absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-[14px] bg-background opacity-0 shadow-md transition-opacity hover:bg-secondary group-hover/preview:opacity-100 focus-visible:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5 text-foreground" strokeWidth={2.4} />
                      </Button>
                    ) : null}
                    {canShowNextMedia ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        aria-label="Next media"
                        onClick={showNextMedia}
                        className="absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-[14px] bg-background opacity-0 shadow-md transition-opacity hover:bg-secondary group-hover/preview:opacity-100 focus-visible:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5 text-foreground" strokeWidth={2.4} />
                      </Button>
                    ) : null}
                    {showMediaBullets && (
                      <div
                        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
                        aria-label="Template media"
                      >
                        {previewMedia.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Show media ${index + 1}`}
                            aria-current={index === selectedMediaIndex}
                            onClick={() => setSelectedMediaIndex(index)}
                            className={`h-2 rounded-full transition ${
                              index === selectedMediaIndex
                                ? "w-2.5 bg-white opacity-100 shadow-sm"
                                : "w-2 bg-white/55 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details side */}
                  <div className="p-6 md:p-8 flex flex-col">
                    {isTemplateLoading ? (
                      <TemplateDetailsSkeleton />
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={template?.is_liked ? "Unlike" : "Like"}
                              aria-pressed={Boolean(template?.is_liked)}
                              disabled={likeMutation.isPending}
                              onClick={() => {
                                if (!isSignedIn) {
                                  setIsAuthOpen(true);
                                  return;
                                }
                                likeMutation.mutate(!template?.is_liked);
                              }}
                              className="flex items-center gap-1 px-2 h-10 rounded-full hover:bg-secondary transition disabled:opacity-60"
                            >
                              <Heart
                                className={`h-6 w-6 transition ${
                                  template?.is_liked ? "text-[#e60023]" : "text-foreground"
                                }`}
                                fill={template?.is_liked ? "currentColor" : "none"}
                                strokeWidth={2.2}
                              />
                              <span className="text-sm font-semibold text-foreground">
                                {template?.likes_count ?? 0}
                              </span>
                            </button>
                            <SharePopover
                              open={isShareOpen}
                              onOpenChange={(open) => {
                                setIsShareOpen(open);
                                if (!open) setShareSearch("");
                              }}
                              align="center"
                              shareTargets={shareTargets}
                              recipients={filteredRecipients}
                              search={shareSearch}
                              onSearchChange={setShareSearch}
                              onSend={handleSendRecipient}
                              trigger={
                                <button
                                  aria-label="Share"
                                  className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                                >
                                  <Upload className="h-5 w-5 text-foreground" strokeWidth={2.2} />
                                </button>
                              }
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  aria-label="More"
                                  className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                                >
                                  <MoreHorizontal
                                    className="h-6 w-6 text-foreground"
                                    strokeWidth={2.2}
                                  />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem>Download image</DropdownMenuItem>
                                <DropdownMenuItem>See more</DropdownMenuItem>
                                <DropdownMenuItem>See less</DropdownMenuItem>
                                <DropdownMenuItem>Report Template</DropdownMenuItem>
                                <DropdownMenuItem>Get Template embed code</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2">
                            <SaveToBoardPopover
                              open={isSaveOpen}
                              onOpenChange={(open) => {
                                if (open && !isSignedIn) {
                                  setIsAuthOpen(true);
                                  return;
                                }
                                setIsSaveOpen(open);
                                if (!open) setBoardSearch("");
                              }}
                              align="end"
                              isLoading={boardsQuery.isLoading}
                              isError={boardsQuery.isError}
                              errorMessage={boardsErrorMessage}
                              isEmpty={filteredBoards.length === 0}
                              boardSearch={boardSearch}
                              onBoardSearchChange={setBoardSearch}
                              topChoices={topChoices}
                              otherBoards={otherBoards}
                              savingBoardId={savingBoardId}
                              currentBoardId={currentBoardId}
                              onSelectBoard={(boardId) => saveMutation.mutate(boardId)}
                              onCreateBoard={openCreateBoard}
                              trigger={
                                <button className="flex items-center gap-1 h-10 px-3 rounded-full hover:bg-secondary transition text-sm font-semibold text-foreground">
                                  <span className="md:hidden">Save</span>
                                  <span className="hidden md:inline">{saveButtonLabel}</span>
                                  <ChevronRight className="h-4 w-4 rotate-90" />
                                </button>
                              }
                            />
                            {isSaved ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isSignedIn) {
                                    setIsAuthOpen(true);
                                    return;
                                  }
                                  setIsSaveOpen(true);
                                }}
                                className="h-11 px-5 rounded-[14px] bg-foreground text-background font-bold text-base hover:brightness-110 transition"
                              >
                                Saved
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isSignedIn) {
                                    setIsAuthOpen(true);
                                    return;
                                  }
                                  setIsSaveOpen(true);
                                }}
                                className="h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:brightness-90 transition"
                              >
                                Save
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-5">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-200 shrink-0" />
                          <p className="text-sm font-semibold text-foreground">
                            EpicPost{" "}
                            <span className="text-muted-foreground font-normal">
                              • Public template feed
                            </span>
                          </p>
                        </div>

                        {showMediaPreviews && (
                          <div className="flex items-center gap-2 mb-5">
                            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
                              {previewMedia.map((asset, i) => (
                                <button
                                  key={asset.id}
                                  type="button"
                                  onClick={() => setSelectedMediaIndex(i)}
                                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-[14px] transition ${
                                    i === selectedMediaIndex
                                      ? "ring-2 ring-foreground"
                                      : "opacity-90 hover:opacity-100"
                                  }`}
                                >
                                  {asset.type === "video" ? (
                                    <video
                                      src={asset.url}
                                      muted
                                      playsInline
                                      preload="metadata"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={asset.url}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                            <button className="h-10 w-10 shrink-0 rounded-full hover:bg-secondary flex items-center justify-center">
                              <ChevronRight className="h-5 w-5 text-foreground" />
                            </button>
                          </div>
                        )}

                        <h2 className="text-lg font-bold text-foreground mb-2">Description</h2>
                        <p className="text-[15px] text-foreground leading-relaxed">
                          {template?.description ??
                            template?.title ??
                            "This public template is not available in the current feed."}
                        </p>
                        {template?.tags.length ? (
                          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                            {template.tags.map((tag) => (
                              <a
                                key={tag}
                                href={`/?search=${encodeURIComponent(tag)}`}
                                className="text-[15px] font-semibold text-[oklch(0.55_0.22_260)] hover:underline"
                              >
                                #{tag}
                              </a>
                            ))}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setShowRequiredInfo((isShown) => !isShown)}
                          className="self-end mt-2 text-sm font-bold text-foreground hover:underline"
                        >
                          {showRequiredInfo ? "Hide required info" : "Show required info"}
                        </button>

                        {template && showRequiredInfo ? (
                          <TemplateRequirements template={template} />
                        ) : null}

                        {template?.comments.length ? (
                          <div className="mt-6 space-y-3">
                            {template.comments.slice(0, 3).map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                {comment.avatar_url ? (
                                  <img
                                    src={comment.avatar_url}
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-secondary" />
                                )}
                                <p className="text-sm text-foreground">
                                  <span className="font-semibold">
                                    {comment.username ?? "Guest"}
                                  </span>{" "}
                                  {comment.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {template &&
                        (!template.capabilities || template.capabilities.supports_remix) ? (
                          <RemixComposer
                            template={template}
                            onRequireAuth={() => setIsAuthOpen(true)}
                          />
                        ) : (
                          <div className="mt-auto pt-6">
                            <div className="flex items-center gap-2 h-14 rounded-[16px] bg-secondary p-2">
                              <input
                                type="text"
                                placeholder="Add a comment to start the conversation"
                                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]"
                              />
                              <button
                                aria-label="Emoji"
                                className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center"
                              >
                                <Smile className="h-5 w-5 text-foreground" />
                              </button>
                              <button
                                aria-label="Sticker"
                                className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center"
                              >
                                <Sticker className="h-5 w-5 text-foreground" />
                              </button>
                              <button
                                aria-label="Image"
                                className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center"
                              >
                                <ImageIcon className="h-5 w-5 text-foreground" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>

              {/* Pins flowing right below the detail card */}
              <div className="mt-3 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
                {belowPins.map((p, i) => (
                  <TemplateCard key={`below-${i}-${p.id}`} pin={templateToPin(p, i)} />
                ))}
              </div>
            </div>

            {/* Side column visible at xl+ flowing alongside the detail */}
            <aside className="hidden xl:block xl:w-1/5 2xl:w-2/6">
              <div className="columns-1 2xl:columns-2 gap-3 [column-fill:_balance]">
                {sidePins.map((p, i) => (
                  <TemplateCard key={`side-${i}-${p.id}`} pin={templateToPin(p, i)} />
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
      <MobileNav />
      <SignupDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
      <CreateBoardDialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen} />

      {isFullscreen && selectedMedia ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
        >
          {/* Top bar: close (left) + share/save (right) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
            <button
              type="button"
              aria-label="Close"
              onClick={closeFullscreen}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-foreground shadow-md transition hover:bg-secondary"
            >
              <X className="h-5 w-5" strokeWidth={2.4} />
            </button>

            <div className="pointer-events-auto flex items-center gap-2 rounded-[16px] bg-white/95 p-1.5 shadow-md backdrop-blur">
              <SharePopover
                open={fsShareOpen}
                onOpenChange={(open) => {
                  setFsShareOpen(open);
                  if (!open) setShareSearch("");
                }}
                align="end"
                shareTargets={shareTargets}
                recipients={filteredRecipients}
                search={shareSearch}
                onSearchChange={setShareSearch}
                onSend={handleSendRecipient}
                trigger={
                  <button className="flex h-10 items-center gap-1.5 rounded-[12px] px-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
                    Share
                    <Upload className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                }
              />
              <span className="h-6 w-px bg-border" />
              <SaveToBoardPopover
                open={fsSaveOpen}
                onOpenChange={(open) => {
                  if (open && !isSignedIn) {
                    setIsAuthOpen(true);
                    return;
                  }
                  setFsSaveOpen(open);
                  if (!open) setBoardSearch("");
                }}
                align="end"
                isLoading={boardsQuery.isLoading}
                isError={boardsQuery.isError}
                errorMessage={boardsErrorMessage}
                isEmpty={filteredBoards.length === 0}
                boardSearch={boardSearch}
                onBoardSearchChange={setBoardSearch}
                topChoices={topChoices}
                otherBoards={otherBoards}
                savingBoardId={savingBoardId}
                currentBoardId={currentBoardId}
                onSelectBoard={(boardId) => saveMutation.mutate(boardId)}
                onCreateBoard={openCreateBoard}
                trigger={
                  <button className="flex h-10 max-w-[160px] items-center gap-1 rounded-[12px] px-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
                    <span className="truncate">{saveButtonLabel}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 rotate-90" />
                  </button>
                }
              />
              <button
                type="button"
                onClick={() => {
                  if (!requireAuthToSave()) return;
                  setFsSaveOpen(true);
                }}
                className={`h-10 rounded-[12px] px-5 text-sm font-bold text-white transition ${
                  isSaved ? "bg-foreground hover:brightness-110" : "bg-primary hover:brightness-90"
                }`}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Carousel rail (other images) */}
          {previewMedia.length > 1 ? (
            <div className="absolute left-4 top-1/2 z-10 flex max-h-[80vh] -translate-y-1/2 flex-col gap-2 overflow-y-auto py-2">
              {previewMedia.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show media ${index + 1}`}
                  aria-current={index === selectedMediaIndex}
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border-2 transition ${
                    index === selectedMediaIndex
                      ? "border-white"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          ) : null}

          {/* Centered media */}
          <div className="flex h-full w-full items-center justify-center overflow-auto p-6">
            {selectedMedia.type === "video" ? (
              <video
                key={selectedMedia.id}
                src={selectedMedia.url}
                controls
                muted
                loop
                playsInline
                autoPlay
                style={{ transform: `scale(${zoom})` }}
                className="max-h-[88vh] max-w-[88vw] origin-center object-contain transition-transform duration-150"
              />
            ) : (
              <img
                key={selectedMedia.id}
                src={selectedMedia.url}
                alt={template?.title ?? "Template"}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-[88vh] max-w-[88vw] origin-center object-contain transition-transform duration-150"
              />
            )}
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
      ) : null}
    </div>
  );
}

function TemplatePreviewSkeleton() {
  return (
    <div className="flex min-h-[480px] w-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-[360px]">
        <Skeleton className="aspect-[4/5] w-full rounded-[24px]" />
        <div className="mt-4 flex items-center justify-center gap-2">
          <Skeleton className="h-2 w-8 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TemplateDetailsSkeleton() {
  return (
    <div className="flex min-h-[480px] flex-1 flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-11 w-20 rounded-full" />
        </div>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-48 max-w-full rounded-full" />
          <Skeleton className="mt-2 h-4 w-32 rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-5 w-full rounded-full" />
        <Skeleton className="h-5 w-5/6 rounded-full" />
        <Skeleton className="h-5 w-2/3 rounded-full" />
      </div>

      <div className="mt-5 flex justify-end">
        <Skeleton className="h-5 w-36 rounded-full" />
      </div>

      <div className="mt-auto pt-6">
        <Skeleton className="h-14 w-full rounded-[28px]" />
      </div>
    </div>
  );
}

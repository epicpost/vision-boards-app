import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Upload,
  MoreHorizontal,
  ChevronRight,
  Maximize2,
  Sparkles,
  Smile,
  Sticker,
  Image as ImageIcon,
  Search,
  Lock,
  Plus,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { PinCard } from "@/components/pinterest/PinCard";
import { MobileNav } from "@/components/pinterest/MobileNav";
import { SignupDialog } from "@/components/pinterest/SignupDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  fetchPostTemplates,
  getTemplateMedia,
  postTemplatesQueryKey,
  type TemplateMediaType,
  type PostTemplate,
  type PostTemplateFeedResponse,
} from "@/lib/post-templates";
import { boardsQueryKey, fetchBoards, saveTemplateToBoard, type Board } from "@/lib/boards";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/pin/$pinId")({
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
  };
}

function uniqueTemplates(templates: PostTemplate[]) {
  return Array.from(new Map(templates.map((template) => [template.id, template])).values());
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
  onSelect,
}: {
  board: Board;
  saving: boolean;
  onSelect: () => void;
}) {
  const thumb = getBoardThumb(board);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={saving}
      className="flex h-16 w-full items-center gap-3 rounded-[16px] px-2 text-left transition hover:bg-secondary disabled:opacity-60"
    >
      {thumb ? (
        <img src={thumb} alt="" className="h-12 w-12 shrink-0 rounded-[14px] object-cover" />
      ) : (
        <span className="h-12 w-12 shrink-0 rounded-[14px] bg-secondary" />
      )}
      <span className="min-w-0 flex-1 truncate text-base font-semibold">{board.name}</span>
      {saving ? (
        <span className="text-[13px] font-medium text-muted-foreground">Saving...</span>
      ) : (
        board.is_secret && <Lock className="h-5 w-5 shrink-0 text-foreground" />
      )}
    </button>
  );
}

function PinDetail() {
  const { pinId } = Route.useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [savedBoardId, setSavedBoardId] = useState<string | null>(null);
  const isSignedIn = Boolean(getAccessToken());
  const boardsQuery = useQuery({
    queryKey: boardsQueryKey,
    queryFn: fetchBoards,
    enabled: isSignedIn && isSaveOpen,
  });
  const saveMutation = useMutation({
    mutationFn: (boardId: string) => saveTemplateToBoard(pinId, boardId),
    onSuccess: (_data, boardId) => {
      setSavedBoardId(boardId);
      const board = boardsQuery.data?.data.find((item) => item.id === boardId);
      toast.success(board ? `Saved to ${board.name}` : "Saved");
      setIsSaveOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not save template.");
    },
  });
  const boards = useMemo(() => boardsQuery.data?.data ?? [], [boardsQuery.data]);
  const filteredBoards = useMemo(() => {
    const query = boardSearch.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter((board) => board.name.toLowerCase().includes(query));
  }, [boards, boardSearch]);
  // The boards API short view has no "top choices" param (only view/limit/cursor),
  // so we surface the first boards (most recently updated) as Top choices client-side.
  const topChoices = boardSearch ? [] : filteredBoards.slice(0, 2);
  const otherBoards = boardSearch ? filteredBoards : filteredBoards.slice(2);
  const selectedBoard = boards.find((board) => board.id === savedBoardId) ?? null;
  const defaultFeedQuery = useQuery({
    queryKey: postTemplatesQueryKey(),
    queryFn: () => fetchPostTemplates(),
  });
  const cachedFeeds = queryClient.getQueriesData<PostTemplateFeedResponse>({
    queryKey: ["post-templates"],
  });
  const cachedTemplates = cachedFeeds.flatMap(([, feed]) => feed?.data ?? []);
  const templates = uniqueTemplates([...cachedTemplates, ...(defaultFeedQuery.data?.data ?? [])]);
  const template = templates.find((item) => item.id === pinId);
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
  const selectedMedia = previewMedia[selectedMediaIndex] ?? previewMedia[0] ?? null;
  const showMediaBullets = previewMedia.length > 1;
  const showMediaPreviews = previewMedia.length > 1;
  const thumbs = previewMedia.slice(0, 5);
  const sidePins = relatedTemplates.slice(0, 10);
  const belowPins = relatedTemplates.slice(10).concat(relatedTemplates.slice(0, 10));

  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [pinId]);

  useEffect(() => {
    if (selectedMediaIndex >= previewMedia.length) {
      setSelectedMediaIndex(0);
    }
  }, [previewMedia.length, selectedMediaIndex]);

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
                  <div className="relative bg-secondary">
                    <button
                      aria-label="Back"
                      onClick={() => router.history.back()}
                      className="absolute top-4 left-4 z-10 h-11 w-11 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-secondary transition"
                    >
                      <ArrowLeft className="h-5 w-5 text-foreground" strokeWidth={2.4} />
                    </button>
                    {selectedMedia?.type === "video" ? (
                      <video
                        key={selectedMedia.id}
                        src={selectedMedia.url}
                        aria-label={template?.title ?? "Video template"}
                        controls
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="h-full max-h-[820px] w-full animate-[slide-preview-in_260ms_ease-out] object-contain"
                      />
                    ) : selectedMedia ? (
                      <img
                        key={selectedMedia.id}
                        src={selectedMedia.url}
                        alt={template?.title ?? "Template"}
                        className="h-full max-h-[820px] w-full animate-[slide-preview-in_260ms_ease-out] object-contain"
                      />
                    ) : (
                      <div className="flex min-h-[480px] w-full items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground">
                        {defaultFeedQuery.isLoading
                          ? "Loading template..."
                          : "Template preview unavailable"}
                      </div>
                    )}
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
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <button
                        aria-label="Expand"
                        className="h-11 w-11 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background"
                      >
                        <Maximize2 className="h-5 w-5 text-foreground" />
                      </button>
                      <button
                        aria-label="Visual search"
                        className="h-11 w-11 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background"
                      >
                        <Sparkles className="h-5 w-5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Details side */}
                  <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1 px-2 h-10 rounded-full hover:bg-secondary transition">
                          <Heart className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                          <span className="text-sm font-semibold text-foreground">
                            {template?.likes_count ?? 0}
                          </span>
                        </button>
                        <button
                          aria-label="Comment"
                          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                        >
                          <MessageCircle className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                        </button>
                        <button
                          aria-label="Share"
                          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                        >
                          <Upload className="h-5 w-5 text-foreground" strokeWidth={2.2} />
                        </button>
                        <button
                          aria-label="More"
                          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                        >
                          <MoreHorizontal className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Popover
                          open={isSaveOpen}
                          onOpenChange={(open) => {
                            if (open && !isSignedIn) {
                              setIsAuthOpen(true);
                              return;
                            }
                            setIsSaveOpen(open);
                            if (!open) setBoardSearch("");
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1 h-10 px-3 rounded-full hover:bg-secondary transition text-sm font-semibold text-foreground">
                              {selectedBoard?.name ?? "Save to board"}
                              <ChevronRight className="h-4 w-4 rotate-90" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
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
                                  onChange={(event) => setBoardSearch(event.target.value)}
                                  className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                                />
                              </label>

                              {boardsQuery.isLoading ? (
                                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  Loading boards...
                                </p>
                              ) : boardsQuery.isError ? (
                                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  {boardsQuery.error instanceof Error
                                    ? boardsQuery.error.message
                                    : "Could not load boards."}
                                </p>
                              ) : filteredBoards.length === 0 ? (
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
                                            saving={
                                              saveMutation.isPending &&
                                              saveMutation.variables === board.id
                                            }
                                            onSelect={() => saveMutation.mutate(board.id)}
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
                                            saving={
                                              saveMutation.isPending &&
                                              saveMutation.variables === board.id
                                            }
                                            onSelect={() => saveMutation.mutate(board.id)}
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
                                onClick={() => setIsAuthOpen(true)}
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
                        {thumbs.map((asset, i) => (
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
                              <img src={asset.url} alt="" className="h-full w-full object-cover" />
                            )}
                          </button>
                        ))}
                        <button className="h-10 w-10 ml-auto rounded-full hover:bg-secondary flex items-center justify-center">
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
                    <button className="self-end mt-2 text-sm font-bold text-foreground hover:underline">
                      See less
                    </button>

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
                              <span className="font-semibold">{comment.username ?? "Guest"}</span>{" "}
                              {comment.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-auto pt-6">
                      <div className="flex items-center gap-2 h-14 rounded-[28px] bg-secondary px-5">
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
                  </div>
                </div>
              </article>

              {/* Pins flowing right below the detail card */}
              <div className="mt-3 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
                {belowPins.map((p, i) => (
                  <PinCard key={`below-${i}-${p.id}`} pin={templateToPin(p, i)} />
                ))}
              </div>
            </div>

            {/* Side column visible at xl+ flowing alongside the detail */}
            <aside className="hidden xl:block xl:w-1/5 2xl:w-2/6">
              <div className="columns-1 2xl:columns-2 gap-3 [column-fill:_balance]">
                {sidePins.map((p, i) => (
                  <PinCard key={`side-${i}-${p.id}`} pin={templateToPin(p, i)} />
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
      <MobileNav />
      <SignupDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
}

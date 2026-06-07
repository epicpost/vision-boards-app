import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import { pins } from "@/components/epicpost/pins-data";
import { boardsQueryKey, fetchBoards, type Board } from "@/lib/boards";

export const Route = createFileRoute("/boards")({
  head: () => ({
    meta: [
      { title: "Your saved ideas — Boards" },
      { name: "description", content: "Browse your saved boards and collections." },
    ],
  }),
  component: BoardsPage,
});

function take(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const pin = pins[(start + i) % pins.length];
    return pin?.src ?? "";
  });
}

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

function BoardCard({ board }: { board: Board }) {
  const thumbs = board.preview_assets.map((asset) => asset.url);
  const fallbackThumbs = take(board.id.length % pins.length, 3);
  const [main, ...rest] = [...thumbs, ...fallbackThumbs].slice(0, 3);
  const updated = formatUpdatedAt(board.updated_at);

  return (
    <Link to="/" search={{ board: board.id }} className="group block">
      <div className="relative overflow-hidden rounded-[20px] bg-secondary aspect-[4/3]">
        <div className="flex h-full w-full gap-px">
          <div className="relative h-full w-2/3">
            <img src={main} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex h-full w-1/3 flex-col gap-px">
            {rest.map((src, i) => (
              <img key={i} src={src} alt="" className="h-1/2 w-full object-cover" />
            ))}
          </div>
        </div>
        {board.is_secret && (
          <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 shadow">
            <Lock className="h-4 w-4 text-foreground" strokeWidth={2.5} />
          </span>
        )}
      </div>
      <h3 className="mt-3 px-1 text-[17px] font-bold text-foreground truncate">{board.name}</h3>
      <p className="px-1 text-sm text-muted-foreground">
        {board.template_count} {board.template_count === 1 ? "Template" : "Templates"}
        {updated ? ` · ${updated}` : ""}
      </p>
    </Link>
  );
}

function BoardCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-[4/3] rounded-[20px] bg-secondary animate-pulse" />
      <div className="mt-3 mx-1 h-5 w-2/3 rounded bg-secondary animate-pulse" />
      <div className="mt-2 mx-1 h-4 w-1/3 rounded bg-secondary animate-pulse" />
    </div>
  );
}

const TABS = [
  { key: "remixes", label: "Remixes" },
  { key: "boards", label: "Boards" },
] as const;

function BoardsPage() {
  const boardsQuery = useQuery({
    queryKey: boardsQueryKey(),
    queryFn: () => fetchBoards(),
  });
  const boards = boardsQuery.data?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="px-4 md:px-8 pt-2 pb-12 max-w-[1600px] mx-auto">
          <div className="flex items-start justify-between gap-6 mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Your saved ideas
            </h1>
            <div className="hidden md:flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 ring-2 ring-background shrink-0" />
              <div className="leading-tight">
                <p className="text-lg font-bold text-foreground">Oleg Kuprovskiy</p>
                <p className="text-sm text-muted-foreground">20 followers · 40 following</p>
              </div>
              <button className="ml-2 rounded-full bg-secondary hover:bg-accent transition px-4 py-2 text-[15px] font-semibold text-foreground">
                View profile
              </button>
            </div>
          </div>

          <nav className="flex items-center justify-between gap-6 border-b border-transparent mb-6">
            <div className="flex items-center gap-6">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`pb-2 text-[17px] font-semibold transition ${
                    t.key === "boards"
                      ? "text-foreground border-b-[3px] border-foreground"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="rounded-full bg-[#e60023] hover:bg-[#ad081b] transition text-white px-5 h-11 text-[15px] font-semibold">
                Create
              </button>
            </div>
          </nav>

          {boardsQuery.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }, (_, index) => (
                <BoardCardSkeleton key={index} />
              ))}
            </div>
          ) : boardsQuery.isError ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <h2 className="text-xl font-semibold text-foreground">Boards did not load</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {boardsQuery.error.message}
              </p>
              <button
                onClick={() => void boardsQuery.refetch()}
                className="mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                Try again
              </button>
            </div>
          ) : boards.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {boards.map((b) => (
                <BoardCard key={b.id} board={b} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <h2 className="text-xl font-semibold text-foreground">No boards yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a board to start organizing saved ideas.
              </p>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

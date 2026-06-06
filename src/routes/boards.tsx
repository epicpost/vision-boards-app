import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, SlidersHorizontal } from "lucide-react";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { MobileNav } from "@/components/pinterest/MobileNav";
import { pins } from "@/components/pinterest/pins-data";

export const Route = createFileRoute("/boards")({
  head: () => ({
    meta: [
      { title: "Your saved ideas — Boards" },
      { name: "description", content: "Browse your saved boards and collections." },
    ],
  }),
  component: BoardsPage,
});

type Board = {
  id: string;
  name: string;
  pinCount: number;
  updated: string;
  secret?: boolean;
  thumbs: string[];
};

const boards: Board[] = [
  { id: "mono", name: "mono", pinCount: 313, updated: "4d", secret: true, thumbs: take(0, 3) },
  {
    id: "travel-app",
    name: "travel app",
    pinCount: 392,
    updated: "1w",
    secret: true,
    thumbs: take(3, 3),
  },
  {
    id: "visit-lviv",
    name: "Visit Lviv Today",
    pinCount: 11,
    updated: "1w",
    secret: true,
    thumbs: take(6, 3),
  },
  {
    id: "visit-today",
    name: "Visit.today",
    pinCount: 45,
    updated: "1w",
    secret: true,
    thumbs: take(9, 3),
  },
  { id: "gpties", name: "GPTies", pinCount: 252, updated: "3w", secret: true, thumbs: take(12, 3) },
  { id: "mars", name: "mars", pinCount: 4, updated: "1mo", secret: true, thumbs: take(15, 3) },
  {
    id: "vibekoding",
    name: "VibeKoding",
    pinCount: 72,
    updated: "2mo",
    secret: true,
    thumbs: take(18, 3),
  },
  {
    id: "monobook",
    name: "monobook.ing",
    pinCount: 32,
    updated: "3mo",
    secret: true,
    thumbs: take(21, 3),
  },
];

function take(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const pin = pins[(start + i) % pins.length];
    return pin?.src ?? "";
  });
}

function BoardCard({ board }: { board: Board }) {
  const [main, ...rest] = board.thumbs;
  return (
    <Link to="/" className="group block">
      <div className="relative overflow-hidden rounded-[20px] bg-secondary aspect-[4/3]">
        <div className="flex h-full w-full gap-1">
          <div className="relative h-full w-2/3">
            <img src={main} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex h-full w-1/3 flex-col gap-1">
            {rest.map((src, i) => (
              <img key={i} src={src} alt="" className="h-1/2 w-full object-cover" />
            ))}
          </div>
        </div>
        {board.secret && (
          <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 shadow">
            <Lock className="h-4 w-4 text-foreground" strokeWidth={2.5} />
          </span>
        )}
      </div>
      <h3 className="mt-3 px-1 text-[17px] font-bold text-foreground truncate">{board.name}</h3>
      <p className="px-1 text-sm text-muted-foreground">
        {board.pinCount} Pins · {board.updated}
      </p>
    </Link>
  );
}

const TABS = [
  { key: "pins", label: "Pins" },
  { key: "boards", label: "Boards" },
  { key: "collages", label: "Collages" },
] as const;

function BoardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="px-4 md:px-8 pt-2 pb-12 max-w-[1600px] mx-auto">
          <div className="flex items-start justify-between gap-6 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
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

          <nav className="flex items-center gap-6 border-b border-transparent mb-6">
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
          </nav>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                aria-label="Filters"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-accent transition"
              >
                <SlidersHorizontal className="h-5 w-5 text-foreground" strokeWidth={2.2} />
              </button>
              {["Group", "Secret", "Archived"].map((f) => (
                <button
                  key={f}
                  className="px-4 h-10 rounded-full bg-secondary hover:bg-accent transition text-[15px] font-semibold text-foreground"
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="rounded-full bg-[#e60023] hover:bg-[#ad081b] transition text-white px-5 h-11 text-[15px] font-semibold">
              Create
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {boards.map((b) => (
              <BoardCard key={b.id} board={b} />
            ))}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

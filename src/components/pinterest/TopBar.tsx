import { Search, Camera, Mic, ChevronDown } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="flex items-center gap-3 px-3 md:px-6 py-3">
        <a href="/" aria-label="Pinterest" className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-7 w-7" style={{ fill: "oklch(0.55 0.22 27)" }}>
            <path d="M12 0C5.4 0 0 5.4 0 12c0 5 3.1 9.3 7.5 11-.1-.9-.2-2.4 0-3.4.2-.9 1.4-5.6 1.4-5.6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4 .2 1 .9 1.9 2.1 1.9 2.6 0 4.5-2.7 4.5-6.6 0-3.5-2.5-5.9-6-5.9-4.1 0-6.5 3.1-6.5 6.2 0 1.2.5 2.5 1.1 3.2.1.1.1.2.1.3-.1.5-.4 1.6-.4 1.8-.1.3-.2.3-.5.2-1.8-.8-2.9-3.5-2.9-5.6 0-4.5 3.3-8.7 9.5-8.7 5 0 8.9 3.6 8.9 8.3 0 5-3.1 9-7.5 9-1.5 0-2.9-.8-3.3-1.7l-.9 3.4c-.3 1.2-1.2 2.8-1.8 3.7C9.6 23.8 10.8 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0z" />
          </svg>
        </a>
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 h-12 rounded-full bg-input px-4 focus-within:ring-2 focus-within:ring-ring transition">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
            />
            <button aria-label="Visual search" className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition">
              <Camera className="h-5 w-5 text-foreground" strokeWidth={2.2} />
            </button>
            <button aria-label="Voice search" className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition">
              <Mic className="h-5 w-5 text-foreground" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <button aria-label="Profile" className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 ring-2 ring-background" />
          <button aria-label="Open menu" className="h-10 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-1 px-3 md:px-6 pb-3 overflow-x-auto no-scrollbar">
        {["All", "Visit.today", "VibeKoding", "Путешествия", "Bitcoin, Crypto, Blockchain", "Osint", "Temu", "House", "Travel", "Food"].map((tab, i) => (
          <button
            key={tab}
            className={`shrink-0 px-3 py-2 text-[15px] font-semibold rounded-full transition ${i === 0 ? "text-foreground border-b-[3px] border-foreground rounded-none" : "text-foreground hover:bg-secondary"}`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  );
}

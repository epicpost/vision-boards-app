import { Search, Camera, Mic, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SignupDialog } from "./SignupDialog";

export function TopBar({
  showTabs = true,
  searchValue,
  onSearchChange,
}: {
  showTabs?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
} = {}) {
  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="flex items-center gap-3 px-3 md:px-6 py-3">
        <a
          href="/"
          aria-label="EpicPost"
          className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center"
        >
          <img src="/transpared-logo2.png" alt="" className="h-8 w-8 object-contain" />
        </a>
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 h-12 rounded-[16px] bg-input px-4 focus-within:ring-2 focus-within:ring-ring transition">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search"
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange?.(event.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
            />
            <button
              aria-label="Visual search"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition"
            >
              <Camera className="h-5 w-5 text-foreground" strokeWidth={2.2} />
            </button>
            <button
              aria-label="Voice search"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition"
            >
              <Mic className="h-5 w-5 text-foreground" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <button
            aria-label="Profile"
            className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 ring-2 ring-background"
          />
          <button
            aria-label="Open menu"
            className="h-10 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      {showTabs && (
        <nav className="flex items-center gap-1 px-3 md:px-6 pb-3 overflow-x-auto no-scrollbar">
          {[
            "All",
            "Visit.today",
            "VibeKoding",
            "Путешествия",
            "Bitcoin, Crypto, Blockchain",
            "Osint",
            "Temu",
            "House",
            "Travel",
            "Food",
          ].map((tab, i) => (
            <button
              key={tab}
              className={`shrink-0 px-3 py-2 text-[15px] font-semibold rounded-full transition ${i === 0 ? "text-foreground border-b-[3px] border-foreground rounded-none" : "text-foreground hover:bg-secondary"}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

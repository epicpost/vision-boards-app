import { Search, Camera, Mic, ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSession,
  getAuthUser,
  hasAuthSession,
} from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SignupDialog } from "./SignupDialog";
import { SearchMegaMenu } from "./SearchMegaMenu";

export function TopBar({
  showTabs = true,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeCategory = "All",
  categories = ["All"],
  onCategoryChange,
}: {
  showTabs?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  activeCategory?: string;
  categories?: readonly string[];
  onCategoryChange?: (category: string) => void;
} = {}) {
  const [signupOpen, setSignupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authUser, setAuthUser] = useState<ReturnType<typeof getAuthUser>>(null);
  const [isMobileBrandHidden, setIsMobileBrandHidden] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      setIsSignedIn(hasAuthSession());
      setAuthUser(getAuthUser());
    };

    updateAuthState();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateBrandVisibility = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      if (!isMobile || currentScrollY < 24) {
        setIsMobileBrandHidden(false);
      } else if (currentScrollY > lastScrollY + 8) {
        setIsMobileBrandHidden(true);
      } else if (currentScrollY < lastScrollY - 8) {
        setIsMobileBrandHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateBrandVisibility);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateBrandVisibility);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateBrandVisibility);
    };
  }, []);

  const displayName =
    [authUser?.first_name, authUser?.last_name].filter(Boolean).join(" ") ||
    authUser?.username ||
    "Current account";
  const avatarFallback = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 bg-background">
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
          isMobileBrandHidden
            ? "max-h-0 -translate-y-3 opacity-0"
            : "max-h-20 translate-y-0 opacity-100"
        }`}
      >
        <div className="flex items-center px-5 pb-3 pt-4">
          <a href="/" aria-label="EpicPost" className="flex min-w-0 items-center gap-2.5">
            <img src="/transparent-logo.png" alt="" className="h-10 w-10 shrink-0 object-contain" />
            <span className="truncate text-[32px] font-bold leading-none tracking-normal text-foreground">
              EpicPost
            </span>
          </a>
        </div>
      </div>
      <div className="hidden items-center gap-3 px-6 py-3 md:flex">
        <div className="flex-1 relative">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div
                className={`flex items-center gap-2 h-12 rounded-[16px] bg-input px-4 transition ${searchOpen ? "ring-2 ring-ring" : "focus-within:ring-2 focus-within:ring-ring"}`}
              >
                <Search className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={2.2} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchValue ?? ""}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      const query = (searchValue ?? "").trim();
                      if (!query) return;
                      onSearchSubmit?.(query);
                      setSearchOpen(false);
                      event.currentTarget.blur();
                    }
                  }}
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
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-[var(--radix-popover-trigger-width)] border-none bg-transparent p-0 shadow-none"
            >
              <SearchMegaMenu
                onPick={(q) => {
                  onSearchChange?.(q);
                  onSearchSubmit?.(q);
                  setSearchOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {!isSignedIn ? (
            <button
              onClick={() => setSignupOpen(true)}
              className="h-10 px-4 rounded-full bg-[#e60023] hover:bg-[#ad081b] transition text-white text-[15px] font-semibold"
            >
              Sign up
            </button>
          ) : null}
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open account menu"
                  className="flex h-10 items-center gap-2 rounded-full pl-0.5 pr-1.5 outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage src={authUser?.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 text-sm font-semibold text-foreground">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[360px] max-w-[calc(100vw-24px)] rounded-[20px] border-none bg-background p-4 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
              >
                <div className="px-2 pb-1 text-[13px] font-medium text-muted-foreground">
                  Currently in
                </div>
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={authUser?.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-muted text-lg font-semibold">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold leading-tight">
                      {displayName}
                    </div>
                    <div className="text-sm text-muted-foreground">Personal</div>
                    {authUser?.email ? (
                      <div className="truncate text-sm text-muted-foreground">{authUser.email}</div>
                    ) : null}
                  </div>
                  <Check className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2.5} />
                </div>
                <DropdownMenuItem
                  onSelect={clearAuthSession}
                  className="cursor-pointer rounded-[16px] px-2 py-2 text-base font-semibold focus:bg-secondary"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button
                aria-label="Profile"
                onClick={() => setSignupOpen(true)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 ring-2 ring-background"
              />
              <button
                aria-label="Open menu"
                onClick={() => setSignupOpen(true)}
                className="h-10 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
      <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} />
      {showTabs && (
        <nav className="flex items-center gap-1 px-3 md:px-6 pb-3 overflow-x-auto no-scrollbar">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => onCategoryChange?.(tab)}
              className={`shrink-0 px-3 py-2 text-[15px] font-semibold rounded-full transition ${
                tab === activeCategory
                  ? "text-foreground border-b-[3px] border-foreground rounded-none"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

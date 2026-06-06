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
  const [signupOpen, setSignupOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authUser, setAuthUser] = useState<ReturnType<typeof getAuthUser>>(null);

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

  const displayName =
    [authUser?.first_name, authUser?.last_name].filter(Boolean).join(" ") ||
    authUser?.username ||
    "Current account";
  const avatarFallback = displayName.trim().charAt(0).toUpperCase() || "U";

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
                  className="flex h-10 items-center gap-2 rounded-full pl-0.5 pr-1.5 outline-none transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
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
                className="w-[min(360px,calc(100vw-32px))] rounded-[20px] border-none bg-white p-4 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
              >
                <div className="px-2 pb-3 text-[15px] font-semibold text-muted-foreground">
                  Currently in
                </div>
                <div className="flex items-center gap-4 rounded-xl px-2 py-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={authUser?.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-muted text-2xl font-semibold">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xl font-bold leading-tight">{displayName}</div>
                    <div className="mt-1 text-base text-muted-foreground">Personal</div>
                    {authUser?.email ? (
                      <div className="truncate text-base text-muted-foreground">
                        {authUser.email}
                      </div>
                    ) : null}
                  </div>
                  <Check className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2.5} />
                </div>
                <DropdownMenuItem
                  onSelect={clearAuthSession}
                  className="mt-3 cursor-pointer rounded-xl px-2 py-3 text-xl font-bold focus:bg-accent"
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

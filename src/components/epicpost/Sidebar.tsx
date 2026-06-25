import { Home, LayoutGrid, Palette, Plus, Bell, Settings } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { AUTH_SESSION_CHANGED_EVENT, hasAuthSession } from "@/lib/auth";
import { fetchUnreadNotificationCount, unreadNotificationsQueryKey } from "@/lib/notifications";
import { UpdatesPanel } from "./UpdatesPopover";
import { SettingsSupportMenu } from "./SettingsSupportMenu";

const items = [
  { icon: Home, label: "Home", to: "/" as const },
  { icon: LayoutGrid, label: "Saved", to: "/remixes" as const },
  { icon: Palette, label: "Brand Kit", to: "/brand-kit" as const },
  { icon: Plus, label: "Create" },
  { icon: Bell, label: "Updates" },
];

function NavButton({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="group relative">
      <button
        aria-label={label}
        className={`click-bounce flex h-12 w-12 items-center justify-center rounded-[16px] ${
          active ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[12px] bg-foreground text-background text-sm font-semibold px-3 py-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition origin-left z-50 shadow-md"
      >
        {label}
      </span>
    </div>
  );
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isSignedIn, setIsSignedIn] = useState(false);
  const unreadCountQuery = useQuery({
    queryKey: unreadNotificationsQueryKey,
    queryFn: fetchUnreadNotificationCount,
    enabled: isSignedIn,
    refetchOnWindowFocus: false,
  });
  const unreadCount = unreadCountQuery.data?.data.count ?? 0;

  useEffect(() => {
    const updateAuthState = () => setIsSignedIn(hasAuthSession());

    updateAuthState();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] flex-col items-center justify-between py-4 bg-background border-r border-border z-40">
      <div className="flex flex-col items-center gap-4">
        <a
          href="/"
          aria-label="EpicPost home"
          className="click-bounce flex h-12 w-12 items-center justify-center rounded-full hover:bg-secondary"
        >
          <img src="/transpared-logo3.png" alt="" className="h-9 w-9 object-contain" />
        </a>
        {items.map((it) =>
          it.label === "Updates" ? (
            <div key={it.label} className="group relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label={it.label}
                    className="click-bounce relative flex h-12 w-12 items-center justify-center rounded-[16px] text-foreground hover:bg-secondary"
                  >
                    <it.icon className="h-6 w-6" strokeWidth={2.2} />
                    {unreadCount > 0 ? (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#e60023]" />
                    ) : null}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={12}
                  className="w-auto p-0 border-none bg-transparent shadow-[0_8px_30px_rgba(0,0,0,0.18)] rounded-[16px]"
                >
                  <UpdatesPanel />
                </PopoverContent>
              </Popover>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[12px] bg-foreground text-background text-sm font-semibold px-3 py-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition origin-left z-50 shadow-md"
              >
                Updates
              </span>
            </div>
          ) : "to" in it && it.to ? (
            <Link key={it.label} to={it.to} className="group relative">
              <div
                aria-label={it.label}
                className={`click-bounce flex h-12 w-12 items-center justify-center rounded-[16px] ${
                  pathname === it.to ||
                  (it.to === "/remixes" && (pathname === "/boards" || pathname === "/likes"))
                    ? "bg-foreground text-background"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <it.icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[12px] bg-foreground text-background text-sm font-semibold px-3 py-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition origin-left z-50 shadow-md"
              >
                {it.label}
              </span>
            </Link>
          ) : (
            <NavButton key={it.label} icon={it.icon} label={it.label} />
          ),
        )}
      </div>
      <SettingsTrigger />
    </aside>
  );
}

function SettingsTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Settings"
          className="click-bounce flex h-12 w-12 items-center justify-center rounded-[16px] text-foreground hover:bg-secondary"
        >
          <Settings className="h-6 w-6" strokeWidth={2.2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        className="w-auto p-0 border-none bg-transparent shadow-none"
      >
        <SettingsSupportMenu onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

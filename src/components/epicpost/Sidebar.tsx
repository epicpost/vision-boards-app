import { Home, LayoutGrid, Plus, Bell, MessageCircle, Settings } from "lucide-react";
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
  { icon: LayoutGrid, label: "Saved", to: "/boards" as const },
  { icon: Plus, label: "Create" },
  { icon: Bell, label: "Notifications" },
  { icon: MessageCircle, label: "Messages" },
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
        className={`flex h-12 w-12 items-center justify-center rounded-[16px] transition ${
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
      <div className="flex flex-col items-center gap-2">
        <a
          href="/"
          aria-label="EpicPost home"
          className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-secondary transition"
        >
          <img src="/transparent-logo.png" alt="" className="h-9 w-9 object-contain" />
        </a>
        {items.map((it) =>
          it.label === "Notifications" ? (
            <Popover key={it.label}>
              <PopoverTrigger asChild>
                <button
                  aria-label={it.label}
                  className="relative flex h-12 w-12 items-center justify-center rounded-[16px] text-foreground transition hover:bg-secondary"
                >
                  <it.icon className="h-6 w-6" strokeWidth={2.2} />
                  {unreadCount > 0 ? (
                    <span className="absolute right-2 top-2 min-w-4 rounded-full bg-[#e60023] px-1 text-center text-[10px] font-bold leading-4 text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
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
          ) : "to" in it && it.to ? (
            <Link key={it.label} to={it.to} className="group relative">
              <div
                aria-label={it.label}
                className={`flex h-12 w-12 items-center justify-center rounded-[16px] transition ${
                  pathname === it.to
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
          className="flex h-12 w-12 items-center justify-center rounded-[16px] text-foreground transition hover:bg-secondary"
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

import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { k as AUTH_SESSION_CHANGED_EVENT, y as clearAuthSession, S as SignupDialog, l as hasAuthSession, c as cn, i as getAuthUser, v as readCachedSearchMenu, x as deleteSearchHistoryItem, s as searchMenuQueryKey, g as getAccessToken, r as requestAuthDialog, A as API_BASE_URL, h as expireAuthSession, w as fetchSearchMenu } from "./router-Bd-4THC9.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-CqiGz96I.mjs";
import { A as Avatar$1, a as AvatarImage$1, b as AvatarFallback$1 } from "../_libs/radix-ui__react-avatar.mjs";
import { R as Root2, T as Trigger, A as Anchor2, P as Portal, C as Content2 } from "../_libs/radix-ui__react-popover.mjs";
import { H as House, L as LayoutGrid, P as Palette, b as Plus, B as Bell, S as Search, c as Camera, M as Mic, d as ChevronDown, e as Check, U as User, R as RefreshCw, f as Settings, X, E as ExternalLink, g as Ellipsis } from "../_libs/lucide-react.mjs";
const Popover = Root2;
const PopoverTrigger = Trigger;
const PopoverAnchor = Anchor2;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2.displayName;
const notificationsQueryKey = ["notifications", { limit: 50 }];
const unreadNotificationsQueryKey = ["notifications", "unread-count"];
function getApiErrorMessage(payload) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(". ");
  }
  return null;
}
function isTokenExpiredError(payload) {
  return payload.error?.code === "TOKEN_EXPIRED";
}
async function notificationRequest(path, init) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view notifications.");
  }
  const response = await fetch(new URL(path, API_BASE_URL), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(
      getApiErrorMessage(payload) ?? `Notifications request failed with ${response.status}`
    );
  }
  return payload;
}
function fetchNotifications() {
  const url = new URL("/api/v1/me/notifications", API_BASE_URL);
  url.searchParams.set("limit", "50");
  return notificationRequest(`${url.pathname}${url.search}`);
}
function fetchUnreadNotificationCount() {
  return notificationRequest("/api/v1/me/notifications/unread-count");
}
function markAllNotificationsSeen() {
  return notificationRequest(
    "/api/v1/me/notifications/seen",
    { method: "PATCH" }
  );
}
function deleteNotification(notificationId) {
  return notificationRequest(
    `/api/v1/me/notifications/${notificationId}`,
    { method: "DELETE" }
  );
}
function formatNotificationTime(value) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "";
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 6e4));
  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w`;
  return createdAt.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}
function NotificationIcon({ notification }) {
  if (notification.img_preview) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: notification.img_preview,
        alt: "",
        className: "h-14 w-14 shrink-0 rounded-[14px] object-cover",
        loading: "lazy"
      }
    );
  }
  const { type } = notification;
  if (type === "search") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-6 w-6 text-foreground", strokeWidth: 2.2 }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#e60023] text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6", strokeWidth: 2.2 }) });
}
function UpdateRow({
  notification,
  isDeleting,
  onDelete
}) {
  const [open, setOpen] = reactExports.useState(false);
  const titleWeight = notification.is_seen ? "font-normal" : "font-bold";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `group flex items-center gap-3 rounded-[16px] p-2 transition ${open ? "bg-secondary" : "hover:bg-secondary"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationIcon, { notification }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `min-w-0 flex-1 text-[15px] leading-snug text-foreground ${titleWeight}`, children: notification.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatNotificationTime(notification.created_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { open, onOpenChange: setOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                "aria-label": "Update options",
                className: `flex h-7 w-7 items-center justify-center rounded-full transition ${open ? "bg-foreground text-background" : "text-foreground opacity-0 hover:bg-background group-hover:opacity-100"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4", strokeWidth: 2.5 })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "min-w-[220px] rounded-[16px] p-2 shadow-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DropdownMenuItem,
                {
                  onSelect: () => onDelete(notification.id),
                  disabled: isDeleting,
                  className: "cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-60",
                  children: isDeleting ? "Deleting..." : "Delete update"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { className: "cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium", children: "View notification settings" })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function UpdatesSection({
  title,
  notifications,
  deletingId,
  onDelete
}) {
  if (notifications.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 px-2 text-lg font-bold text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1", children: notifications.map((notification) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      UpdateRow,
      {
        notification,
        isDeleting: deletingId === notification.id,
        onDelete
      },
      notification.id
    )) })
  ] });
}
function UpdatesPanel() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const notificationsQuery = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications
  });
  const refreshNotifications = () => {
    void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
  };
  const markAllSeenMutation = useMutation({
    mutationFn: markAllNotificationsSeen,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: (notificationId) => {
      setDeletingId(notificationId);
    },
    onSuccess: () => {
      refreshNotifications();
      toast.success("Update deleted.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });
  const notifications = notificationsQuery.data?.data ?? [];
  const unread = notifications.filter((notification) => !notification.is_seen);
  const seen = notifications.filter((notification) => notification.is_seen);
  const hasMarkedSeen = reactExports.useRef(false);
  const markAllSeen = markAllSeenMutation.mutate;
  reactExports.useEffect(() => {
    if (hasMarkedSeen.current || unread.length === 0) return;
    hasMarkedSeen.current = true;
    markAllSeen();
  }, [unread.length, markAllSeen]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[80vh] w-[min(400px,calc(100vw-24px))] overflow-y-auto rounded-[16px] bg-popover p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex items-center px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Updates" }) }),
    notificationsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 px-2 py-2", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-[14px] bg-secondary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 flex-1 rounded-full bg-secondary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-8 rounded-full bg-secondary" })
    ] }, index)) }) : notificationsQuery.isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: notificationsQuery.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => void notificationsQuery.refetch(),
          className: "mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4", strokeWidth: 2.2 }),
            "Retry"
          ]
        }
      )
    ] }) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-8 text-center text-sm font-medium text-muted-foreground", children: "No updates yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        UpdatesSection,
        {
          title: "New",
          notifications: unread,
          deletingId,
          onDelete: (id) => deleteMutation.mutate(id)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        UpdatesSection,
        {
          title: "Seen",
          notifications: seen,
          deletingId,
          onDelete: (id) => deleteMutation.mutate(id)
        }
      )
    ] })
  ] });
}
const main = [
  { label: "Settings", to: "/settings" },
  { label: "Refine your recommendations" },
  { label: "Link to Pinterest" },
  { label: "Reports and violations center" },
  { label: "Be a beta tester", external: true }
];
const support = [
  { label: "Help center", external: true },
  { label: "Create widget", external: true },
  { label: "Removals", external: true },
  { label: "Personalized Ads", external: true },
  { label: "Your privacy rights" },
  { label: "Privacy policy", external: true },
  { label: "Terms of service", external: true }
];
const newsroomUrl = "https://newsroom.epicpost.app";
function Row({ item, onClose }) {
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold text-foreground", children: item.label }),
    item.external ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-5 w-5 text-foreground", strokeWidth: 2.2 }) : null
  ] });
  const className = "flex w-full items-center justify-between rounded-[16px] px-2 py-2.5 text-left transition hover:bg-secondary";
  if (item.to) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: item.to, className, onClick: onClose, children: content });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className, onClick: onClose, children: content });
}
function SettingsSupportMenu({ onClose }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[380px] max-w-[calc(100vw-24px)] rounded-[20px] bg-background p-4 shadow-[0_12px_36px_rgba(0,0,0,0.18)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-3 px-2 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          "aria-label": "Close",
          className: "flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6 text-foreground", strokeWidth: 2.2 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Settings & Support" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: main.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { item, onClose }, item.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pb-2 pt-3 text-[13px] font-medium text-muted-foreground", children: "Support" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: support.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { item, onClose }, item.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pb-2 pt-3 text-[13px] font-medium text-muted-foreground", children: "Resources" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: newsroomUrl,
        target: "_blank",
        rel: "noreferrer",
        onClick: onClose,
        className: "flex w-full items-center justify-between rounded-[16px] px-2 py-2.5 text-left transition hover:bg-secondary",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold text-foreground", children: "Newsroom" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-5 w-5 text-foreground", strokeWidth: 2.2 })
        ]
      }
    )
  ] });
}
const items$1 = [
  { icon: House, label: "Home", to: "/" },
  { icon: LayoutGrid, label: "Saved", to: "/remixes" },
  { icon: Palette, label: "Brand Kit", to: "/brand-kit" },
  { icon: Plus, label: "Create" },
  { icon: Bell, label: "Notifications" }
];
function NavButton({
  icon: Icon,
  label,
  active
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-label": label,
        className: `flex h-12 w-12 items-center justify-center rounded-[16px] transition ${active ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6", strokeWidth: 2.2 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        role: "tooltip",
        className: "pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[12px] bg-foreground text-background text-sm font-semibold px-3 py-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition origin-left z-50 shadow-md",
        children: label
      }
    )
  ] });
}
function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isSignedIn, setIsSignedIn] = reactExports.useState(false);
  const unreadCountQuery = useQuery({
    queryKey: unreadNotificationsQueryKey,
    queryFn: fetchUnreadNotificationCount,
    enabled: isSignedIn,
    refetchOnWindowFocus: false
  });
  const unreadCount = unreadCountQuery.data?.data.count ?? 0;
  reactExports.useEffect(() => {
    const updateAuthState = () => setIsSignedIn(hasAuthSession());
    updateAuthState();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, updateAuthState);
    window.addEventListener("storage", updateAuthState);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex fixed left-0 top-0 h-screen w-[72px] flex-col items-center justify-between py-4 bg-background border-r border-border z-40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          "aria-label": "EpicPost home",
          className: "flex h-12 w-12 items-center justify-center rounded-full hover:bg-secondary transition",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/transparent-logo.png", alt: "", className: "h-9 w-9 object-contain" })
        }
      ),
      items$1.map(
        (it) => it.label === "Notifications" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              "aria-label": it.label,
              className: "relative flex h-12 w-12 items-center justify-center rounded-[16px] text-foreground transition hover:bg-secondary",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-6 w-6", strokeWidth: 2.2 }),
                unreadCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-1 top-1 h-2 w-2 rounded-full bg-[#e60023]" }) : null
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PopoverContent,
            {
              side: "right",
              align: "start",
              sideOffset: 12,
              className: "w-auto p-0 border-none bg-transparent shadow-[0_8px_30px_rgba(0,0,0,0.18)] rounded-[16px]",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdatesPanel, {})
            }
          )
        ] }, it.label) : "to" in it && it.to ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: it.to, className: "group relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "aria-label": it.label,
              className: `flex h-12 w-12 items-center justify-center rounded-[16px] transition ${pathname === it.to || it.to === "/remixes" && (pathname === "/boards" || pathname === "/likes") ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-6 w-6", strokeWidth: 2.2 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              role: "tooltip",
              className: "pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[12px] bg-foreground text-background text-sm font-semibold px-3 py-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition origin-left z-50 shadow-md",
              children: it.label
            }
          )
        ] }, it.label) : /* @__PURE__ */ jsxRuntimeExports.jsx(NavButton, { icon: it.icon, label: it.label }, it.label)
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTrigger, {})
  ] });
}
function SettingsTrigger() {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-label": "Settings",
        className: "flex h-12 w-12 items-center justify-center rounded-[16px] text-foreground transition hover:bg-secondary",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6", strokeWidth: 2.2 })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContent,
      {
        side: "right",
        align: "end",
        sideOffset: 12,
        className: "w-auto p-0 border-none bg-transparent shadow-none",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSupportMenu, { onClose: () => setOpen(false) })
      }
    )
  ] });
}
const Avatar = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Avatar$1,
  {
    ref,
    className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
    ...props
  }
));
Avatar.displayName = Avatar$1.displayName;
const AvatarImage = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  AvatarImage$1,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarImage$1.displayName;
const AvatarFallback = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  AvatarFallback$1,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarFallback$1.displayName;
function Section({
  title,
  items: items2,
  deletable,
  onPick,
  onDelete,
  deletingId
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 last:mb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "px-2 pb-3 text-xl font-bold text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: items2.map((item) => {
      const canDelete = deletable;
      const isDeleting = canDelete && deletingId === item.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onPick(item.label),
          className: "group flex items-center gap-3 rounded-[16px] bg-secondary/60 p-2 text-left transition hover:bg-secondary",
          children: [
            item.thumb ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: item.thumb,
                alt: "",
                className: "h-14 w-14 shrink-0 rounded-[14px] object-cover"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-14 w-14 shrink-0 rounded-[14px] bg-secondary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-[15px] font-medium text-foreground", children: item.label }),
            canDelete ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                role: "button",
                tabIndex: 0,
                "aria-label": `Remove ${item.label} from recent searches`,
                "aria-disabled": isDeleting,
                onClick: (event) => {
                  event.stopPropagation();
                  if (!isDeleting) onDelete(item.id);
                },
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!isDeleting) onDelete(item.id);
                  }
                },
                className: "mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50 aria-disabled:opacity-40",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5", strokeWidth: 2.2 })
              }
            ) : null
          ]
        },
        item.id
      );
    }) })
  ] });
}
function SectionSkeleton({ title }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 last:mb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "px-2 pb-3 text-xl font-bold text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-3 rounded-[16px] bg-secondary/60 p-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-14 w-14 shrink-0 animate-pulse rounded-[14px] bg-secondary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-32 animate-pulse rounded bg-secondary" })
        ]
      },
      index
    )) })
  ] });
}
function SearchMegaMenu({ onPick }) {
  const queryClient = useQueryClient();
  const cachedMenu = reactExports.useMemo(() => readCachedSearchMenu(), []);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: searchMenuQueryKey,
    queryFn: fetchSearchMenu,
    staleTime: 0,
    initialData: cachedMenu,
    initialDataUpdatedAt: 0
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSearchHistoryItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: searchMenuQueryKey });
      const previous = queryClient.getQueryData(searchMenuQueryKey);
      queryClient.setQueryData(
        searchMenuQueryKey,
        (current) => current ? {
          sections: current.sections.map(
            (section) => section.deletable ? { ...section, items: section.items.filter((item) => item.id !== id) } : section
          ).filter((section) => section.items.length > 0)
        } : current
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(searchMenuQueryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: searchMenuQueryKey });
    }
  });
  const sections = data?.sections ?? [];
  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[calc(100vh-120px)] overflow-y-auto rounded-[20px] bg-background p-5 shadow-[0_12px_36px_rgba(0,0,0,0.18)]", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionSkeleton, { title: "Recent searches" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionSkeleton, { title: "Ideas for you" })
  ] }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-6 text-center text-sm text-muted-foreground", children: error instanceof Error ? error.message : "Couldn't load search suggestions." }) : sections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-6 text-center text-sm text-muted-foreground", children: "No search suggestions yet." }) : sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Section,
    {
      title: section.title,
      items: section.items,
      deletable: section.deletable,
      onPick,
      onDelete: (id) => deleteMutation.mutate(id),
      deletingId
    },
    section.key
  )) });
}
function TopBar({
  showTabs = true,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeCategory = "all",
  categories = [{ id: "all", label: "All" }],
  onCategoryChange
} = {}) {
  const [signupOpen, setSignupOpen] = reactExports.useState(false);
  const [searchOpen, setSearchOpen] = reactExports.useState(false);
  const [isSignedIn, setIsSignedIn] = reactExports.useState(false);
  const [authUser, setAuthUser] = reactExports.useState(null);
  const [isMobileBrandHidden, setIsMobileBrandHidden] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
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
  const displayName = [authUser?.first_name, authUser?.last_name].filter(Boolean).join(" ") || authUser?.username || "Current account";
  const avatarFallback = displayName.trim().charAt(0).toUpperCase() || "U";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${isMobileBrandHidden ? "max-h-0 -translate-y-3 opacity-0" : "max-h-20 translate-y-0 opacity-100"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center px-5 pb-3 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/", "aria-label": "EpicPost", className: "flex min-w-0 items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/transparent-logo.png", alt: "", className: "h-10 w-10 shrink-0 object-contain" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-2xl font-bold leading-none tracking-normal text-foreground", children: "EpicPost" })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-3 px-6 py-3 md:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: searchOpen, onOpenChange: setSearchOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverAnchor, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-2 h-12 rounded-[16px] bg-input px-4 transition ${searchOpen ? "ring-2 ring-ring" : "focus-within:ring-2 focus-within:ring-ring"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5 text-muted-foreground shrink-0", strokeWidth: 2.2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Search",
                  value: searchValue ?? "",
                  onChange: (event) => onSearchChange?.(event.target.value),
                  onFocus: () => setSearchOpen(true),
                  onKeyDown: (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      const query = (searchValue ?? "").trim();
                      if (!query) return;
                      onSearchSubmit?.(query);
                      setSearchOpen(false);
                      event.currentTarget.blur();
                    }
                  },
                  className: "flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  "aria-label": "Visual search",
                  className: "hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-5 w-5 text-foreground", strokeWidth: 2.2 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  "aria-label": "Voice search",
                  className: "hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-5 w-5 text-foreground", strokeWidth: 2.2 })
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PopoverContent,
          {
            align: "start",
            sideOffset: 8,
            onOpenAutoFocus: (e) => e.preventDefault(),
            className: "w-[var(--radix-popover-trigger-width)] border-none bg-transparent p-0 shadow-none",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SearchMegaMenu,
              {
                onPick: (q) => {
                  onSearchChange?.(q);
                  onSearchSubmit?.(q);
                  setSearchOpen(false);
                }
              }
            )
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2", children: [
        !isSignedIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSignupOpen(true),
            className: "h-10 px-4 rounded-full bg-[#e60023] hover:bg-[#ad081b] transition text-white text-[15px] font-semibold",
            children: "Sign up"
          }
        ) : null,
        isSignedIn && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              "aria-label": "Open account menu",
              className: "flex h-10 items-center gap-2 rounded-full pl-0.5 pr-1.5 outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-10 w-10 ring-2 ring-background", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: authUser?.avatar_url ?? void 0, alt: displayName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 text-sm font-semibold text-foreground", children: avatarFallback })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-5 w-5 text-foreground", strokeWidth: 2.5 })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuContent,
            {
              align: "end",
              sideOffset: 10,
              className: "w-[360px] max-w-[calc(100vw-24px)] rounded-[20px] border-none bg-background p-4 text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pb-1 text-[13px] font-medium text-muted-foreground", children: "Currently in" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl px-2 py-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-12 w-12", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: authUser?.avatar_url ?? void 0, alt: displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-muted text-lg font-semibold", children: avatarFallback })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-base font-semibold leading-tight", children: displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Personal" }),
                    authUser?.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm text-muted-foreground", children: authUser.email }) : null
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 shrink-0 text-foreground", strokeWidth: 2.5 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DropdownMenuItem,
                  {
                    onSelect: clearAuthSession,
                    className: "cursor-pointer rounded-[16px] px-2 py-2 text-base font-semibold focus:bg-secondary",
                    children: "Log out"
                  }
                )
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignupDialog, { open: signupOpen, onOpenChange: setSignupOpen }),
    showTabs && /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex items-center gap-1 px-3 md:px-6 pb-3 overflow-x-auto no-scrollbar", children: categories.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onCategoryChange?.(tab.id),
        className: `shrink-0 px-3 py-2 text-[15px] font-semibold rounded-full transition ${tab.id === activeCategory ? "text-foreground border-b-[2px] border-foreground rounded-none" : "text-foreground hover:bg-secondary"}`,
        children: tab.label
      },
      tab.id
    )) })
  ] });
}
const items = [
  { icon: House, label: "Home", active: true },
  { icon: Search, label: "Search" },
  { icon: User, label: "Profile" }
];
function MobileNav() {
  const [bouncingItem, setBouncingItem] = reactExports.useState(null);
  const handleButtonClick = (label) => {
    setBouncingItem(label);
    window.setTimeout(
      () => setBouncingItem((current) => current === label ? null : current),
      360
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center gap-3 md:hidden", children: items.map(({ icon: Icon, label, active }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      "aria-label": label,
      onClick: () => handleButtonClick(label),
      className: `flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-background shadow-[0_10px_28px_rgba(0,0,0,0.16)] transition-transform duration-200 active:scale-90 ${bouncingItem === label ? "animate-[mobile-nav-bounce_360ms_ease-out]" : ""}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Icon,
        {
          className: `h-7 w-7 ${active ? "text-foreground" : "text-muted-foreground"}`,
          strokeWidth: 2.5
        }
      )
    },
    label
  )) });
}
export {
  Avatar as A,
  MobileNav as M,
  Popover as P,
  Sidebar as S,
  TopBar as T,
  PopoverTrigger as a,
  PopoverContent as b,
  AvatarImage as c,
  AvatarFallback as d
};

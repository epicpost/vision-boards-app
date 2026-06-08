import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsSeen,
  Notification,
  notificationsQueryKey,
  unreadNotificationsQueryKey,
} from "@/lib/notifications";

function formatNotificationTime(value: string) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "";

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w`;

  return createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NotificationIcon({ notification }: { notification: Notification }) {
  if (notification.img_preview) {
    return (
      <img
        src={notification.img_preview}
        alt=""
        className="h-14 w-14 shrink-0 rounded-[14px] object-cover"
        loading="lazy"
      />
    );
  }

  const { type } = notification;
  if (type === "search") {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Search className="h-6 w-6 text-foreground" strokeWidth={2.2} />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#e60023] text-white">
      <Bell className="h-6 w-6" strokeWidth={2.2} />
    </div>
  );
}

function UpdateRow({
  notification,
  isDeleting,
  onDelete,
}: {
  notification: Notification;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const titleWeight = notification.is_seen ? "font-normal" : "font-bold";

  return (
    <div
      className={`group flex items-center gap-3 rounded-[16px] p-2 transition ${
        open ? "bg-secondary" : "hover:bg-secondary"
      }`}
    >
      <NotificationIcon notification={notification} />
      <div className={`min-w-0 flex-1 text-[15px] leading-snug text-foreground ${titleWeight}`}>
        {notification.title}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">
          {formatNotificationTime(notification.created_at)}
        </span>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Update options"
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                open
                  ? "bg-foreground text-background"
                  : "text-foreground opacity-0 hover:bg-background group-hover:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px] rounded-[16px] p-2 shadow-lg">
            <DropdownMenuItem
              onSelect={() => onDelete(notification.id)}
              disabled={isDeleting}
              className="cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium text-destructive focus:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete update"}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-[10px] px-3 py-2 text-[15px] font-medium">
              View notification settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function UpdatesSection({
  title,
  notifications,
  deletingId,
  onDelete,
}: {
  title: string;
  notifications: Notification[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 px-2 text-lg font-bold text-foreground">{title}</h3>
      <div className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <UpdateRow
            key={notification.id}
            notification={notification}
            isDeleting={deletingId === notification.id}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export function UpdatesPanel() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const notificationsQuery = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications,
  });

  const refreshNotifications = () => {
    void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
  };

  const markAllSeenMutation = useMutation({
    mutationFn: markAllNotificationsSeen,
    onSuccess: () => {
      // Clear the unread badge without re-sorting the open list, so the
      // current New/Seen split stays put until the panel is reopened.
      void queryClient.invalidateQueries({ queryKey: unreadNotificationsQueryKey });
    },
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
    },
  });

  const notifications = notificationsQuery.data?.data ?? [];
  const unread = notifications.filter((notification) => !notification.is_seen);
  const seen = notifications.filter((notification) => notification.is_seen);

  // Once the panel has opened with unread updates, mark them all seen in the
  // background so the bell's red dot clears. Runs once per mount.
  const hasMarkedSeen = useRef(false);
  const markAllSeen = markAllSeenMutation.mutate;
  useEffect(() => {
    if (hasMarkedSeen.current || unread.length === 0) return;
    hasMarkedSeen.current = true;
    markAllSeen();
  }, [unread.length, markAllSeen]);

  return (
    <div className="max-h-[80vh] w-[min(400px,calc(100vw-24px))] overflow-y-auto rounded-[16px] bg-popover p-4">
      <div className="mb-3 flex items-center px-2">
        <h2 className="text-xl font-bold text-foreground">Updates</h2>
      </div>

      {notificationsQuery.isLoading ? (
        <div className="space-y-3 px-2 py-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-[14px] bg-secondary" />
              <div className="h-4 flex-1 rounded-full bg-secondary" />
              <div className="h-3 w-8 rounded-full bg-secondary" />
            </div>
          ))}
        </div>
      ) : notificationsQuery.isError ? (
        <div className="px-2 py-8 text-center">
          <p className="text-sm font-medium text-foreground">{notificationsQuery.error.message}</p>
          <button
            onClick={() => void notificationsQuery.refetch()}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2.2} />
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <p className="px-2 py-8 text-center text-sm font-medium text-muted-foreground">
          No updates yet.
        </p>
      ) : (
        <div className="space-y-4">
          <UpdatesSection
            title="New"
            notifications={unread}
            deletingId={deletingId}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <UpdatesSection
            title="Seen"
            notifications={seen}
            deletingId={deletingId}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </div>
      )}
    </div>
  );
}

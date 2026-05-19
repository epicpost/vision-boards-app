import { Home, Search, Bell, MessageCircle, User } from "lucide-react";

const items = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Search" },
  { icon: Bell, label: "Notifications" },
  { icon: MessageCircle, label: "Messages" },
  { icon: User, label: "Profile" },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border h-14 flex items-center justify-around px-2">
      {items.map(({ icon: Icon, label, active }) => (
        <button key={label} aria-label={label} className="flex-1 h-full flex items-center justify-center">
          <Icon className={`h-6 w-6 ${active ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={2.2} />
        </button>
      ))}
    </nav>
  );
}

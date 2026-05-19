import { Home, LayoutGrid, Plus, Bell, MessageCircle, Settings } from "lucide-react";

const items = [
  { icon: Home, label: "Home", active: true },
  { icon: LayoutGrid, label: "Saved" },
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
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] flex-col items-center justify-between py-4 bg-background border-r border-border z-40">
      <div className="flex flex-col items-center gap-2">
        <a href="/" aria-label="Pinterest home" className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-secondary transition">
          <svg viewBox="0 0 24 24" className="h-7 w-7" style={{ fill: "oklch(0.55 0.22 27)" }}>
            <path d="M12 0C5.4 0 0 5.4 0 12c0 5 3.1 9.3 7.5 11-.1-.9-.2-2.4 0-3.4.2-.9 1.4-5.6 1.4-5.6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4 .2 1 .9 1.9 2.1 1.9 2.6 0 4.5-2.7 4.5-6.6 0-3.5-2.5-5.9-6-5.9-4.1 0-6.5 3.1-6.5 6.2 0 1.2.5 2.5 1.1 3.2.1.1.1.2.1.3-.1.5-.4 1.6-.4 1.8-.1.3-.2.3-.5.2-1.8-.8-2.9-3.5-2.9-5.6 0-4.5 3.3-8.7 9.5-8.7 5 0 8.9 3.6 8.9 8.3 0 5-3.1 9-7.5 9-1.5 0-2.9-.8-3.3-1.7l-.9 3.4c-.3 1.2-1.2 2.8-1.8 3.7C9.6 23.8 10.8 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0z" />
          </svg>
        </a>
        {items.map((it) => (
          <NavButton key={it.label} icon={it.icon} label={it.label} active={it.active} />
        ))}
      </div>
      <NavButton icon={Settings} label="Settings" />
    </aside>
  );
}

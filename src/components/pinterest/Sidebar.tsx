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
        <a
          href="/"
          aria-label="EpicPost home"
          className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-secondary transition"
        >
          <img src="/transpared-logo2.png" alt="" className="h-9 w-9 object-contain" />
        </a>
        {items.map((it) => (
          <NavButton key={it.label} icon={it.icon} label={it.label} active={it.active} />
        ))}
      </div>
      <NavButton icon={Settings} label="Settings" />
    </aside>
  );
}

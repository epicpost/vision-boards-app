import { Home, Search, User } from "lucide-react";
import { useState } from "react";

const items = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Search" },
  { icon: User, label: "Profile" },
];

export function MobileNav() {
  const [bouncingItem, setBouncingItem] = useState<string | null>(null);

  const handleButtonClick = (label: string) => {
    setBouncingItem(label);
    window.setTimeout(
      () => setBouncingItem((current) => (current === label ? null : current)),
      360,
    );
  };

  return (
    <nav className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center gap-3 md:hidden">
      {items.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          aria-label={label}
          onClick={() => handleButtonClick(label)}
          className={`flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-background shadow-[0_10px_28px_rgba(0,0,0,0.16)] transition-transform duration-200 active:scale-90 ${
            bouncingItem === label ? "animate-[mobile-nav-bounce_360ms_ease-out]" : ""
          }`}
        >
          <Icon
            className={`h-7 w-7 ${active ? "text-foreground" : "text-muted-foreground"}`}
            strokeWidth={2.5}
          />
        </button>
      ))}
    </nav>
  );
}

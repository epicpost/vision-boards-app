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
    <nav className="fixed bottom-5 left-1/2 z-40 flex h-16 -translate-x-1/2 items-center justify-center gap-4 rounded-[24px] bg-background/95 px-4 shadow-[0_10px_36px_rgba(0,0,0,0.18)] backdrop-blur md:hidden">
      {items.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          aria-label={label}
          onClick={() => handleButtonClick(label)}
          className={`flex h-14 w-14 items-center justify-center rounded-[18px] bg-background transition-transform duration-200 active:scale-90 ${
            bouncingItem === label ? "animate-[mobile-nav-bounce_360ms_ease-out]" : ""
          }`}
        >
          <Icon
            className={`h-8 w-8 ${active ? "text-foreground" : "text-muted-foreground"}`}
            strokeWidth={2.5}
          />
        </button>
      ))}
    </nav>
  );
}

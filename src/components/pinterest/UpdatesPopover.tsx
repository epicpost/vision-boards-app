import { useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { pins } from "./pins-data";

type Update = {
  id: string;
  title: React.ReactNode;
  time: string;
  thumb?: string;
  icon?: "search";
};

const updates: Update[] = [
  {
    id: "1",
    title: (
      <>
        <b>Barcelona Travel</b>
      </>
    ),
    time: "11h",
    thumb: pins[5]?.src ?? undefined,
  },
  {
    id: "2",
    title: (
      <>
        <b>Instagram Story Design</b> ideas
      </>
    ),
    time: "11h",
    thumb: pins[3]?.src ?? undefined,
  },
  { id: "3", title: <>Feels like your vibe</>, time: "18h", thumb: pins[21]?.src ?? undefined },
  { id: "4", title: <>Love this for you</>, time: "21h", thumb: pins[9]?.src ?? undefined },
  {
    id: "5",
    title: (
      <>
        Still searching? Explore ideas related to <b>Business Card</b>
      </>
    ),
    time: "23h",
    icon: "search",
  },
  {
    id: "6",
    title: (
      <>
        <b>Instagram Story Templates</b> for you
      </>
    ),
    time: "2d",
    thumb: pins[12]?.src ?? undefined,
  },
  {
    id: "7",
    title: (
      <>
        <b>Lviv Travel</b> for you
      </>
    ),
    time: "2d",
    thumb: pins[17]?.src ?? undefined,
  },
  { id: "8", title: <>Feels like your vibe</>, time: "3d", thumb: pins[8]?.src ?? undefined },
  {
    id: "9",
    title: (
      <>
        <b>Lviv Travel</b>
      </>
    ),
    time: "3d",
    thumb: pins[16]?.src ?? undefined,
  },
];

function UpdateRow({ u }: { u: Update }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`group flex items-center gap-3 rounded-[16px] p-2 transition ${
        open ? "bg-secondary" : "hover:bg-secondary"
      }`}
    >
      {u.icon === "search" ? (
        <div className="h-14 w-14 shrink-0 rounded-full bg-secondary flex items-center justify-center">
          <Search className="h-6 w-6 text-foreground" strokeWidth={2.2} />
        </div>
      ) : (
        <img src={u.thumb} alt="" className="h-14 w-14 shrink-0 rounded-[14px] object-cover" />
      )}
      <div className="flex-1 min-w-0 text-[15px] text-foreground leading-snug">{u.title}</div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">{u.time}</span>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Update options"
              className={`h-7 w-7 rounded-full flex items-center justify-center transition ${
                open
                  ? "bg-foreground text-background"
                  : "text-foreground opacity-0 group-hover:opacity-100 hover:bg-background"
              }`}
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-[16px] p-2 min-w-[220px] shadow-lg">
            <DropdownMenuItem className="rounded-[10px] px-3 py-2 text-[15px] font-medium cursor-pointer">
              Delete update
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[10px] px-3 py-2 text-[15px] font-medium cursor-pointer">
              View notification settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function UpdatesPanel() {
  return (
    <div className="w-[400px] max-h-[80vh] overflow-y-auto p-4 bg-popover rounded-[16px]">
      <h2 className="text-2xl font-bold text-foreground px-2 mb-3">Updates</h2>
      <h3 className="text-xl font-bold text-foreground px-2 mb-2">Seen</h3>
      <div className="flex flex-col gap-1">
        {updates.map((u) => (
          <UpdateRow key={u.id} u={u} />
        ))}
      </div>
    </div>
  );
}

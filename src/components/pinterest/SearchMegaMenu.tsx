import { pins } from "./pins-data";

type Item = { label: string; thumb: string };

const recentSearches: Item[] = [
  { label: "travel smm", thumb: pins[1].src ?? "" },
  { label: "mountain La blanc challet", thumb: pins[9].src ?? "" },
  { label: "mountain La blanc shallet", thumb: pins[4].src ?? "" },
  { label: "business card app", thumb: pins[3].src ?? "" },
  { label: "business card", thumb: pins[20].src ?? "" },
  { label: "lviv", thumb: pins[17].src ?? "" },
  { label: "львів", thumb: pins[5].src ?? "" },
  { label: "Phone notes", thumb: pins[15].src ?? "" },
  { label: "phone map", thumb: pins[21].src ?? "" },
  { label: "phone map saved address", thumb: pins[7].src ?? "" },
];

const ideasForYou: Item[] = [
  { label: "Christchurch", thumb: pins[16].src ?? "" },
  { label: "Cadiz", thumb: pins[13].src ?? "" },
  { label: "Wellington", thumb: pins[8].src ?? "" },
  { label: "Reykjavik", thumb: pins[19].src ?? "" },
  { label: "Porto", thumb: pins[6].src ?? "" },
  { label: "Marrakech", thumb: pins[14].src ?? "" },
];

const popular: Item[] = [
  { label: "Editorial portrait", thumb: pins[10].src ?? "" },
  { label: "Soft tailoring", thumb: pins[11].src ?? "" },
  { label: "Warm minimal interior", thumb: pins[12].src ?? "" },
  { label: "Tokyo neon", thumb: pins[22].src ?? "" },
  { label: "Studio ceramics", thumb: pins[18].src ?? "" },
  { label: "Pavlova recipe", thumb: pins[23].src ?? "" },
];

function Section({
  title,
  items,
  onPick,
}: {
  title: string;
  items: Item[];
  onPick: (q: string) => void;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="px-2 pb-3 text-xl font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onPick(item.label)}
            className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-2 text-left transition hover:bg-secondary"
          >
            <img
              src={item.thumb}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
            <span className="truncate text-[15px] font-medium text-foreground">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchMegaMenu({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-[20px] bg-background p-5 shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
      <Section title="Recent searches" items={recentSearches} onPick={onPick} />
      <Section title="Ideas for you" items={ideasForYou} onPick={onPick} />
      <Section title="Popular on Pinterest" items={popular} onPick={onPick} />
    </div>
  );
}

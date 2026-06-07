import { useQuery } from "@tanstack/react-query";

import {
  fetchSearchMenu,
  searchMenuQueryKey,
  type SearchMenuItem,
} from "@/lib/search-menu";

function Section({
  title,
  items,
  onPick,
}: {
  title: string;
  items: SearchMenuItem[];
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
            className="flex items-center gap-3 rounded-[16px] bg-secondary/60 p-2 text-left transition hover:bg-secondary"
          >
            {item.thumb ? (
              <img
                src={item.thumb}
                alt=""
                className="h-14 w-14 shrink-0 rounded-[14px] object-cover"
              />
            ) : (
              <span className="h-14 w-14 shrink-0 rounded-[14px] bg-secondary" />
            )}
            <span className="truncate text-[15px] font-medium text-foreground">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="px-2 pb-3 text-xl font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-[16px] bg-secondary/60 p-2"
          >
            <span className="h-14 w-14 shrink-0 animate-pulse rounded-[14px] bg-secondary" />
            <span className="h-4 w-32 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchMegaMenu({ onPick }: { onPick: (q: string) => void }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: searchMenuQueryKey,
    queryFn: fetchSearchMenu,
    staleTime: 5 * 60 * 1000,
  });

  const sections = data?.sections ?? [];

  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-[20px] bg-background p-5 shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
      {isLoading ? (
        <>
          <SectionSkeleton title="Recent searches" />
          <SectionSkeleton title="Ideas for you" />
        </>
      ) : isError ? (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Couldn't load search suggestions."}
        </p>
      ) : sections.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          No search suggestions yet.
        </p>
      ) : (
        sections.map((section) => (
          <Section
            key={section.key}
            title={section.title}
            items={section.items}
            onPick={onPick}
          />
        ))
      )}
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import {
  deleteSearchHistoryItem,
  fetchSearchMenu,
  searchMenuQueryKey,
  type SearchMenuItem,
  type SearchMenuResponse,
} from "@/lib/search-menu";

function Section({
  title,
  items,
  deletable,
  onPick,
  onDelete,
  deletingId,
}: {
  title: string;
  items: SearchMenuItem[];
  deletable: boolean;
  onPick: (q: string) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="px-2 pb-3 text-xl font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const canDelete = deletable;
          const isDeleting = canDelete && deletingId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPick(item.label)}
              className="group flex items-center gap-3 rounded-[16px] bg-secondary/60 p-2 text-left transition hover:bg-secondary"
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
              <span className="flex-1 truncate text-[15px] font-medium text-foreground">
                {item.label}
              </span>
              {canDelete ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${item.label} from recent searches`}
                  aria-disabled={isDeleting}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!isDeleting) onDelete(item.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!isDeleting) onDelete(item.id);
                    }
                  }}
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50 aria-disabled:opacity-40"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </span>
              ) : null}
            </button>
          );
        })}
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
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: searchMenuQueryKey,
    queryFn: fetchSearchMenu,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSearchHistoryItem,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: searchMenuQueryKey });
      const previous = queryClient.getQueryData<SearchMenuResponse>(searchMenuQueryKey);

      queryClient.setQueryData<SearchMenuResponse>(searchMenuQueryKey, (current) =>
        current
          ? {
              sections: current.sections
                .map((section) =>
                  section.deletable
                    ? { ...section, items: section.items.filter((item) => item.id !== id) }
                    : section,
                )
                .filter((section) => section.items.length > 0),
            }
          : current,
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
    },
  });

  const sections = data?.sections ?? [];
  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

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
            deletable={section.deletable}
            onPick={onPick}
            onDelete={(id) => deleteMutation.mutate(id)}
            deletingId={deletingId}
          />
        ))
      )}
    </div>
  );
}

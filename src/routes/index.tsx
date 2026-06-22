import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { TemplateGrid } from "@/components/epicpost/TemplateGrid";
import { MobileNav } from "@/components/epicpost/MobileNav";
import {
  fetchBoardFeedCategories,
  readCachedBoardFeedCategories,
  writeCachedBoardFeedCategories,
} from "@/lib/boards";
import {
  fetchPostTemplates,
  getTemplateMedia,
  postTemplatesQueryKey,
  type PostTemplateFeedParams,
} from "@/lib/post-templates";
import { recordSearch, searchMenuQueryKey } from "@/lib/search-menu";

const ALL_CATEGORY_ID = "all";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { search?: string; board?: string } => {
    const result: { search?: string; board?: string } = {};
    if (typeof search.search === "string" && search.search.trim()) {
      result.search = search.search;
    }
    if (typeof search.board === "string" && search.board.trim()) {
      result.board = search.board;
    }
    return result;
  },
  component: Index,
});

function Index() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const routeSearch = Route.useSearch() as { search?: string; board?: string } | undefined;
  const search = routeSearch?.search ?? "";
  const activeBoardId = routeSearch?.board ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardCategoriesQuery = useQuery({
    queryKey: ["board-feed-categories"],
    queryFn: fetchBoardFeedCategories,
    staleTime: 60_000,
  });

  // Seed the query with the locally cached list once on the client so the next
  // page open renders instantly. Reading localStorage during render would make
  // the first client paint diverge from the server HTML and trigger a React
  // hydration mismatch (error #418), so we do it after mount instead. The query
  // still refetches in the background to pick up any board changes.
  useEffect(() => {
    if (boardCategoriesQuery.data !== undefined) return;
    const cached = readCachedBoardFeedCategories();
    if (cached) {
      queryClient.setQueryData(["board-feed-categories"], cached);
    }
    // Run once on mount; intentionally not reacting to query data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the freshest board list so the next page open can render it instantly.
  useEffect(() => {
    if (!boardCategoriesQuery.isSuccess || boardCategoriesQuery.isPlaceholderData) return;
    writeCachedBoardFeedCategories(boardCategoriesQuery.data);
  }, [boardCategoriesQuery.data, boardCategoriesQuery.isSuccess, boardCategoriesQuery.isPlaceholderData]);
  const feedCategories = useMemo(
    () => [
      { id: ALL_CATEGORY_ID, label: "All" },
      ...(boardCategoriesQuery.data ?? []).map((board) => ({ id: board.id, label: board.name })),
    ],
    [boardCategoriesQuery.data],
  );
  const activeCategory = activeBoardId || ALL_CATEGORY_ID;

  // While a board filter is active, search is ignored; searching clears the board.
  const feedParams: PostTemplateFeedParams = activeBoardId
    ? { board: activeBoardId }
    : { search: search.trim() };
  const activeCategoryIndex = useMemo(
    () => feedCategories.findIndex((category) => category.id === activeCategory),
    [activeCategory, feedCategories],
  );

  const templatesQuery = useQuery({
    queryKey: postTemplatesQueryKey(feedParams),
    queryFn: () => fetchPostTemplates(feedParams),
    placeholderData: keepPreviousData,
  });

  // If the active board disappears from the list (e.g. deleted), fall back to All.
  useEffect(() => {
    if (!activeBoardId) return;
    if (boardCategoriesQuery.data === undefined) return;
    if (feedCategories.some((category) => category.id === activeBoardId)) return;

    void navigate({ to: "/", search: {}, replace: true });
  }, [activeBoardId, boardCategoriesQuery.data, feedCategories, navigate]);

  useEffect(() => {
    if (search.trim()) return;

    for (let offset = 1; offset <= 2; offset += 1) {
      const nextCategory = feedCategories[activeCategoryIndex + offset];
      const previousCategory = feedCategories[activeCategoryIndex - offset];

      [nextCategory, previousCategory].forEach((category) => {
        if (!category) return;

        const nextParams: PostTemplateFeedParams =
          category.id === ALL_CATEGORY_ID ? {} : { board: category.id };
        void queryClient.prefetchQuery({
          queryKey: postTemplatesQueryKey(nextParams),
          queryFn: () => fetchPostTemplates(nextParams),
        });
      });
    }
  }, [activeCategoryIndex, feedCategories, queryClient, search]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const submitSearch = (rawQuery: string) => {
    const nextSearch = rawQuery.trim();
    setSearchInput(nextSearch);

    if (nextSearch === search.trim() && !activeBoardId) return;

    void navigate({
      to: "/",
      search: nextSearch ? { search: nextSearch } : {},
    });
  };

  // Record the committed search in history once its results are available, so
  // the recent-searches menu can show a representative thumbnail. The repository
  // upserts by (user, query), so re-searching only bumps updated_at.
  const recordedSearchRef = useRef<string | null>(null);
  useEffect(() => {
    const query = search.trim();
    if (!query) return;
    if (recordedSearchRef.current === query) return;
    if (templatesQuery.isPending || templatesQuery.isError) return;

    recordedSearchRef.current = query;
    const firstPreview = templatesQuery.data?.data[0]
      ? getTemplateMedia(templatesQuery.data.data[0]).url
      : null;

    recordSearch(query, firstPreview)
      .then(() => queryClient.invalidateQueries({ queryKey: searchMenuQueryKey }))
      .catch(() => {
        // Recording history is best-effort; ignore failures.
      });
  }, [search, templatesQuery.data, templatesQuery.isPending, templatesQuery.isError, queryClient]);

  const selectCategory = (categoryId: string) => {
    setSearchInput("");

    void navigate({
      to: "/",
      search: categoryId === ALL_CATEGORY_ID ? {} : { board: categoryId },
      replace: true,
    });
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || search.trim()) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const isHorizontalSwipe = Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4;
    if (!isHorizontalSwipe) return;

    const nextIndex = deltaX > 0 ? activeCategoryIndex + 1 : activeCategoryIndex - 1;
    const nextCategory = feedCategories[nextIndex];
    if (nextCategory) {
      selectCategory(nextCategory.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={submitSearch}
          activeCategory={activeCategory}
          categories={feedCategories}
          onCategoryChange={selectCategory}
        />
        <main onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <h1 className="sr-only">Pinterest — Discover ideas you'll love</h1>
          <TemplateGrid
            templates={templatesQuery.data?.data ?? []}
            isLoading={templatesQuery.isLoading}
            isError={templatesQuery.isError}
            onRetry={() => void templatesQuery.refetch()}
            search={search.trim()}
          />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

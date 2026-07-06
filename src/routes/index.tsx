import { createFileRoute } from "@tanstack/react-router";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { Loader2 } from "lucide-react";
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
  localPostTemplatesForParams,
  postTemplatesQueryKey,
  type PostTemplateFeedResponse,
  type PostTemplateFeedParams,
} from "@/lib/post-templates";
import { recordSearch, searchMenuQueryKey } from "@/lib/search-menu";

const ALL_CATEGORY_ID = "all";
const PULL_REFRESH_THRESHOLD = 72;
const PULL_REFRESH_MAX_DISTANCE = 104;

function getNextTemplatesPageParam(lastPage: PostTemplateFeedResponse) {
  return lastPage.pagination.has_more ? (lastPage.pagination.next_cursor ?? undefined) : undefined;
}

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
  const [pullDistance, setPullDistance] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pullDistanceRef = useRef(0);
  const isPullingToRefreshRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
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
  }, [
    boardCategoriesQuery.data,
    boardCategoriesQuery.isSuccess,
    boardCategoriesQuery.isPlaceholderData,
  ]);
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

  const templatesQuery = useInfiniteQuery({
    queryKey: postTemplatesQueryKey(feedParams),
    queryFn: ({ pageParam }) => fetchPostTemplates({ ...feedParams, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: getNextTemplatesPageParam,
    placeholderData: keepPreviousData,
  });
  const fetchNextTemplatesPage = templatesQuery.fetchNextPage;
  const hasNextTemplatesPage = templatesQuery.hasNextPage;
  const isFetchingNextTemplatesPage = templatesQuery.isFetchingNextPage;
  const templates = useMemo(() => {
    const seen = new Set<string>();
    const local = localPostTemplatesForParams(feedParams);
    const pages = templatesQuery.data?.pages.flatMap((page) => page.data) ?? [];

    return [...local, ...pages].filter((template) => {
      if (seen.has(template.id)) return false;
      seen.add(template.id);
      return true;
    });
  }, [feedParams, templatesQuery.data]);

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
        void queryClient.prefetchInfiniteQuery({
          queryKey: postTemplatesQueryKey(nextParams),
          queryFn: ({ pageParam }) => fetchPostTemplates({ ...nextParams, cursor: pageParam }),
          initialPageParam: undefined as string | undefined,
          getNextPageParam: getNextTemplatesPageParam,
        });
      });
    }
  }, [activeCategoryIndex, feedCategories, queryClient, search]);

  useEffect(() => {
    if (!hasNextTemplatesPage || isFetchingNextTemplatesPage) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const preloadDistance = Math.max(window.innerHeight * 3, 2400);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        void fetchNextTemplatesPage();
      },
      { root: null, rootMargin: `0px 0px ${preloadDistance}px 0px`, threshold: 0 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [fetchNextTemplatesPage, hasNextTemplatesPage, isFetchingNextTemplatesPage, templates.length]);

  useEffect(() => {
    if (!hasNextTemplatesPage) return;

    let frame = 0;

    const maybeLoadMore = () => {
      frame = 0;
      if (!hasNextTemplatesPage || isFetchingNextTemplatesPage) return;

      const documentElement = document.documentElement;
      const remainingScroll = documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      const preloadDistance = Math.max(window.innerHeight * 3, 2400);

      if (remainingScroll <= preloadDistance) {
        void fetchNextTemplatesPage();
      }
    };

    const scheduleLoadCheck = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(maybeLoadMore);
    };

    scheduleLoadCheck();
    window.addEventListener("scroll", scheduleLoadCheck, { passive: true });
    window.addEventListener("resize", scheduleLoadCheck);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleLoadCheck);
      window.removeEventListener("resize", scheduleLoadCheck);
    };
  }, [fetchNextTemplatesPage, hasNextTemplatesPage, isFetchingNextTemplatesPage, templates.length]);

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
    const firstPreview = templates[0] ? getTemplateMedia(templates[0]).url : null;

    recordSearch(query, firstPreview)
      .then(() => queryClient.invalidateQueries({ queryKey: searchMenuQueryKey }))
      .catch(() => {
        // Recording history is best-effort; ignore failures.
      });
  }, [search, templates, templatesQuery.isPending, templatesQuery.isError, queryClient]);

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
    pullDistanceRef.current = 0;
    isPullingToRefreshRef.current = false;
  };

  const handlePullRefresh = async () => {
    if (isPullRefreshing) return;

    setIsPullRefreshing(true);
    setPullDistance(PULL_REFRESH_THRESHOLD);
    try {
      await Promise.all([templatesQuery.refetch(), boardCategoriesQuery.refetch()]);
    } finally {
      setIsPullRefreshing(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
      isPullingToRefreshRef.current = false;
    }
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    if (!start || isPullRefreshing) return;
    if (window.scrollY > 2) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (deltaY <= 0) return;
    if (!isPullingToRefreshRef.current && deltaY < 12) return;
    if (Math.abs(deltaX) > deltaY * 0.75) return;

    isPullingToRefreshRef.current = true;
    const nextDistance = Math.min((deltaY - 12) * 0.6, PULL_REFRESH_MAX_DISTANCE);
    pullDistanceRef.current = Math.max(0, nextDistance);
    setPullDistance(pullDistanceRef.current);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (isPullingToRefreshRef.current) {
      if (pullDistanceRef.current >= PULL_REFRESH_THRESHOLD) {
        void handlePullRefresh();
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
        isPullingToRefreshRef.current = false;
      }
      return;
    }

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

  const handleTouchCancel = () => {
    touchStartRef.current = null;
    pullDistanceRef.current = 0;
    isPullingToRefreshRef.current = false;
    if (!isPullRefreshing) setPullDistance(0);
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
        <main
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <h1 className="sr-only">Pinterest — Discover ideas you'll love</h1>
          <div
            className="pointer-events-none sticky top-[84px] z-20 flex h-0 justify-center md:hidden"
            aria-hidden={!isPullRefreshing && pullDistance === 0}
          >
            <div
              className="mt-2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[opacity,transform]"
              style={{
                opacity: isPullRefreshing || pullDistance > 0 ? 1 : 0,
                transform: `translateY(${Math.max(pullDistance - 48, 0)}px) scale(${
                  isPullRefreshing || pullDistance >= PULL_REFRESH_THRESHOLD ? 1 : 0.88
                })`,
              }}
            >
              <Loader2
                className={`h-5 w-5 text-foreground ${
                  isPullRefreshing || pullDistance >= PULL_REFRESH_THRESHOLD ? "animate-spin" : ""
                }`}
              />
            </div>
          </div>
          <TemplateGrid
            templates={templates}
            isLoading={templatesQuery.isLoading}
            isFetchingMore={isFetchingNextTemplatesPage}
            isError={templatesQuery.isError}
            onRetry={() => void templatesQuery.refetch()}
            search={search.trim()}
          />
          <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

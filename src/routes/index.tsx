import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { PinGrid } from "@/components/pinterest/PinGrid";
import { MobileNav } from "@/components/pinterest/MobileNav";
import { fetchBoardFeedCategories } from "@/lib/boards";
import { fetchPostTemplates, postTemplatesQueryKey } from "@/lib/post-templates";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { search?: string } =>
    typeof search.search === "string" && search.search.trim() ? { search: search.search } : {},
  component: Index,
});

function Index() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const routeSearch = Route.useSearch() as { search?: string } | undefined;
  const search = routeSearch?.search ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardCategoriesQuery = useQuery({
    queryKey: ["board-feed-categories"],
    queryFn: fetchBoardFeedCategories,
    staleTime: 60_000,
  });
  const feedCategories = useMemo(
    () => ["All", ...(boardCategoriesQuery.data ?? [])],
    [boardCategoriesQuery.data],
  );
  const categorySearch = activeCategory === "All" ? "" : activeCategory;
  const normalizedSearch = (search || categorySearch).trim();
  const activeCategoryIndex = useMemo(
    () => feedCategories.findIndex((category) => category === activeCategory),
    [activeCategory, feedCategories],
  );

  const templatesQuery = useQuery({
    queryKey: postTemplatesQueryKey(normalizedSearch),
    queryFn: () => fetchPostTemplates(normalizedSearch),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (feedCategories.includes(activeCategory)) return;

    setActiveCategory("All");
  }, [activeCategory, feedCategories]);

  useEffect(() => {
    if (search.trim()) return;

    for (let offset = 1; offset <= 2; offset += 1) {
      const nextCategory = feedCategories[activeCategoryIndex + offset];
      const previousCategory = feedCategories[activeCategoryIndex - offset];

      [nextCategory, previousCategory].forEach((category) => {
        if (!category) return;

        const nextSearch = category === "All" ? "" : category;
        void queryClient.prefetchQuery({
          queryKey: postTemplatesQueryKey(nextSearch),
          queryFn: () => fetchPostTemplates(nextSearch),
        });
      });
    }
  }, [activeCategoryIndex, feedCategories, queryClient, search]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const nextSearch = searchInput.trim();
    const currentSearch = search.trim();

    const timer = window.setTimeout(() => {
      if (nextSearch === currentSearch) return;

      navigate({
        to: "/",
        search: nextSearch ? { search: nextSearch } : {},
        replace: true,
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [navigate, search, searchInput]);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setSearchInput("");

    if (search) {
      void navigate({ to: "/", search: {}, replace: true });
    }
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
      selectCategory(nextCategory);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          activeCategory={activeCategory}
          categories={feedCategories}
          onCategoryChange={selectCategory}
        />
        <main onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <h1 className="sr-only">Pinterest — Discover ideas you'll love</h1>
          <PinGrid
            templates={templatesQuery.data?.data ?? []}
            isLoading={templatesQuery.isLoading}
            isError={templatesQuery.isError}
            onRetry={() => void templatesQuery.refetch()}
            search={normalizedSearch}
          />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

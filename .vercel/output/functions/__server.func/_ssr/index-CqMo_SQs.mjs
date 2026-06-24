import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { k as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { a as useQueryClient, u as useQuery, c as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav } from "./MobileNav-JTGfX7W-.mjs";
import { T as TemplateCard } from "./TemplateCard-DEpu7ADN.mjs";
import { R as Route$3, p as postTemplatesQueryKey, m as fetchPostTemplates, j as getTemplateMedia, n as recordSearch, s as searchMenuQueryKey } from "./router-Bd-4THC9.mjs";
import { r as readCachedBoardFeedCategories, w as writeCachedBoardFeedCategories, a as fetchBoardFeedCategories } from "./boards-BOmeqqUF.mjs";
import "../_libs/sonner.mjs";
import { k as LoaderCircle } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./dropdown-menu-CqiGz96I.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function templateToPin(template, index) {
  const media = getTemplateMedia(template);
  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + index % 4 * 40,
    title: template.title,
    isSaved: template.is_saved
  };
}
function PinSkeleton({ index }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 break-inside-avoid", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-full animate-pulse rounded-[16px] bg-secondary",
        style: { aspectRatio: `1 / ${(460 + index % 4 * 40) / 250}` }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-2 mt-2 h-4 w-3/4 animate-pulse rounded bg-secondary" })
  ] });
}
function TemplateGrid({
  templates,
  isLoading,
  isFetchingMore,
  isError,
  onRetry,
  search
}) {
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 md:px-6 pb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[320px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground", children: "Templates did not load" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: "The public feed is unavailable right now." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onRetry,
          className: "mt-5 h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:brightness-90",
          children: "Try again"
        }
      )
    ] }) });
  }
  if (!isLoading && templates.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 md:px-6 pb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[320px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground", children: "No templates found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: search ? `Nothing matched "${search}".` : "The public feed is empty." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 md:px-6 pb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3 [column-fill:_balance]", children: isLoading ? Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(PinSkeleton, { index }, index)) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    templates.map((template, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateCard, { pin: templateToPin(template, index) }, template.id)),
    isFetchingMore ? Array.from({ length: 8 }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(PinSkeleton, { index: templates.length + index }, `next-page-${index}`)) : null
  ] }) }) });
}
const ALL_CATEGORY_ID = "all";
const PULL_REFRESH_THRESHOLD = 72;
const PULL_REFRESH_MAX_DISTANCE = 104;
function getNextTemplatesPageParam(lastPage) {
  return lastPage.pagination.has_more ? lastPage.pagination.next_cursor ?? void 0 : void 0;
}
function Index() {
  const navigate = Route$3.useNavigate();
  const queryClient = useQueryClient();
  const routeSearch = Route$3.useSearch();
  const search = routeSearch?.search ?? "";
  const activeBoardId = routeSearch?.board ?? "";
  const [searchInput, setSearchInput] = reactExports.useState(search);
  const [pullDistance, setPullDistance] = reactExports.useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = reactExports.useState(false);
  const touchStartRef = reactExports.useRef(null);
  const pullDistanceRef = reactExports.useRef(0);
  const isPullingToRefreshRef = reactExports.useRef(false);
  const loadMoreRef = reactExports.useRef(null);
  const boardCategoriesQuery = useQuery({
    queryKey: ["board-feed-categories"],
    queryFn: fetchBoardFeedCategories,
    staleTime: 6e4
  });
  reactExports.useEffect(() => {
    if (boardCategoriesQuery.data !== void 0) return;
    const cached = readCachedBoardFeedCategories();
    if (cached) {
      queryClient.setQueryData(["board-feed-categories"], cached);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!boardCategoriesQuery.isSuccess || boardCategoriesQuery.isPlaceholderData) return;
    writeCachedBoardFeedCategories(boardCategoriesQuery.data);
  }, [boardCategoriesQuery.data, boardCategoriesQuery.isSuccess, boardCategoriesQuery.isPlaceholderData]);
  const feedCategories = reactExports.useMemo(() => [{
    id: ALL_CATEGORY_ID,
    label: "All"
  }, ...(boardCategoriesQuery.data ?? []).map((board) => ({
    id: board.id,
    label: board.name
  }))], [boardCategoriesQuery.data]);
  const activeCategory = activeBoardId || ALL_CATEGORY_ID;
  const feedParams = activeBoardId ? {
    board: activeBoardId
  } : {
    search: search.trim()
  };
  const activeCategoryIndex = reactExports.useMemo(() => feedCategories.findIndex((category) => category.id === activeCategory), [activeCategory, feedCategories]);
  const templatesQuery = useInfiniteQuery({
    queryKey: postTemplatesQueryKey(feedParams),
    queryFn: ({
      pageParam
    }) => fetchPostTemplates({
      ...feedParams,
      cursor: pageParam
    }),
    initialPageParam: void 0,
    getNextPageParam: getNextTemplatesPageParam,
    placeholderData: keepPreviousData
  });
  const fetchNextTemplatesPage = templatesQuery.fetchNextPage;
  const hasNextTemplatesPage = templatesQuery.hasNextPage;
  const isFetchingNextTemplatesPage = templatesQuery.isFetchingNextPage;
  const templates = reactExports.useMemo(() => {
    const seen = /* @__PURE__ */ new Set();
    return templatesQuery.data?.pages.flatMap((page) => page.data).filter((template) => {
      if (seen.has(template.id)) return false;
      seen.add(template.id);
      return true;
    }) ?? [];
  }, [templatesQuery.data]);
  reactExports.useEffect(() => {
    if (!activeBoardId) return;
    if (boardCategoriesQuery.data === void 0) return;
    if (feedCategories.some((category) => category.id === activeBoardId)) return;
    void navigate({
      to: "/",
      search: {},
      replace: true
    });
  }, [activeBoardId, boardCategoriesQuery.data, feedCategories, navigate]);
  reactExports.useEffect(() => {
    if (search.trim()) return;
    for (let offset = 1; offset <= 2; offset += 1) {
      const nextCategory = feedCategories[activeCategoryIndex + offset];
      const previousCategory = feedCategories[activeCategoryIndex - offset];
      [nextCategory, previousCategory].forEach((category) => {
        if (!category) return;
        const nextParams = category.id === ALL_CATEGORY_ID ? {} : {
          board: category.id
        };
        void queryClient.prefetchInfiniteQuery({
          queryKey: postTemplatesQueryKey(nextParams),
          queryFn: ({
            pageParam
          }) => fetchPostTemplates({
            ...nextParams,
            cursor: pageParam
          }),
          initialPageParam: void 0,
          getNextPageParam: getNextTemplatesPageParam
        });
      });
    }
  }, [activeCategoryIndex, feedCategories, queryClient, search]);
  reactExports.useEffect(() => {
    if (!hasNextTemplatesPage || isFetchingNextTemplatesPage) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const preloadDistance = Math.max(window.innerHeight * 3, 2400);
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      void fetchNextTemplatesPage();
    }, {
      root: null,
      rootMargin: `0px 0px ${preloadDistance}px 0px`,
      threshold: 0
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextTemplatesPage, hasNextTemplatesPage, isFetchingNextTemplatesPage, templates.length]);
  reactExports.useEffect(() => {
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
    window.addEventListener("scroll", scheduleLoadCheck, {
      passive: true
    });
    window.addEventListener("resize", scheduleLoadCheck);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleLoadCheck);
      window.removeEventListener("resize", scheduleLoadCheck);
    };
  }, [fetchNextTemplatesPage, hasNextTemplatesPage, isFetchingNextTemplatesPage, templates.length]);
  reactExports.useEffect(() => {
    setSearchInput(search);
  }, [search]);
  const submitSearch = (rawQuery) => {
    const nextSearch = rawQuery.trim();
    setSearchInput(nextSearch);
    if (nextSearch === search.trim() && !activeBoardId) return;
    void navigate({
      to: "/",
      search: nextSearch ? {
        search: nextSearch
      } : {}
    });
  };
  const recordedSearchRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const query = search.trim();
    if (!query) return;
    if (recordedSearchRef.current === query) return;
    if (templatesQuery.isPending || templatesQuery.isError) return;
    recordedSearchRef.current = query;
    const firstPreview = templates[0] ? getTemplateMedia(templates[0]).url : null;
    recordSearch(query, firstPreview).then(() => queryClient.invalidateQueries({
      queryKey: searchMenuQueryKey
    })).catch(() => {
    });
  }, [search, templates, templatesQuery.isPending, templatesQuery.isError, queryClient]);
  const selectCategory = (categoryId) => {
    setSearchInput("");
    void navigate({
      to: "/",
      search: categoryId === ALL_CATEGORY_ID ? {} : {
        board: categoryId
      },
      replace: true
    });
  };
  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
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
  const handleTouchMove = (event) => {
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
  const handleTouchEnd = (event) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:pl-[72px] pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { searchValue: searchInput, onSearchChange: setSearchInput, onSearchSubmit: submitSearch, activeCategory, categories: feedCategories, onCategoryChange: selectCategory }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, onTouchCancel: handleTouchCancel, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "sr-only", children: "Pinterest — Discover ideas you'll love" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none sticky top-[84px] z-20 flex h-0 justify-center md:hidden", "aria-hidden": !isPullRefreshing && pullDistance === 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[opacity,transform]", style: {
          opacity: isPullRefreshing || pullDistance > 0 ? 1 : 0,
          transform: `translateY(${Math.max(pullDistance - 48, 0)}px) scale(${isPullRefreshing || pullDistance >= PULL_REFRESH_THRESHOLD ? 1 : 0.88})`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: `h-5 w-5 text-foreground ${isPullRefreshing || pullDistance >= PULL_REFRESH_THRESHOLD ? "animate-spin" : ""}` }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateGrid, { templates, isLoading: templatesQuery.isLoading, isFetchingMore: isFetchingNextTemplatesPage, isError: templatesQuery.isError, onRetry: () => void templatesQuery.refetch(), search: search.trim() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: loadMoreRef, className: "h-px", "aria-hidden": "true" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {})
  ] });
}
export {
  Index as component
};

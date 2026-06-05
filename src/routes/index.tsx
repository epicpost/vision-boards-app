import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { PinGrid } from "@/components/pinterest/PinGrid";
import { MobileNav } from "@/components/pinterest/MobileNav";
import { fetchPostTemplates, postTemplatesQueryKey } from "@/lib/post-templates";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { search?: string } =>
    typeof search.search === "string" && search.search.trim() ? { search: search.search } : {},
  component: Index,
});

function Index() {
  const navigate = Route.useNavigate();
  const routeSearch = Route.useSearch() as { search?: string } | undefined;
  const search = routeSearch?.search ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const normalizedSearch = search.trim();

  const templatesQuery = useQuery({
    queryKey: postTemplatesQueryKey(normalizedSearch),
    queryFn: () => fetchPostTemplates(normalizedSearch),
    placeholderData: keepPreviousData,
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar searchValue={searchInput} onSearchChange={setSearchInput} />
        <main>
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

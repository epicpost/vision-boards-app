import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import { TemplateCard } from "@/components/epicpost/TemplateCard";
import { fetchLikedTemplates, likedTemplatesQueryKey } from "@/lib/likes";
import { getAccessToken } from "@/lib/auth";
import { getTemplateMedia, type PostTemplate } from "@/lib/post-templates";

export const Route = createFileRoute("/likes")({
  head: () => ({
    meta: [
      { title: "Your saved ideas — Likes" },
      { name: "description", content: "Browse the templates you liked." },
    ],
  }),
  component: LikesPage,
});

function templateToPin(template: PostTemplate, index: number) {
  const media = getTemplateMedia(template);

  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + (index % 4) * 40,
    title: template.title,
    isSaved: template.is_saved,
  };
}

function LikesGrid() {
  const likesQuery = useQuery({
    queryKey: likedTemplatesQueryKey(),
    queryFn: () => fetchLikedTemplates(),
    enabled: Boolean(getAccessToken()),
  });
  const liked = likesQuery.data?.data ?? [];

  if (likesQuery.isLoading) {
    return (
      <div className="columns-2 gap-3 [column-fill:_balance] sm:columns-3 md:columns-4 lg:columns-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div
            key={index}
            className="mb-3 break-inside-avoid animate-pulse rounded-[16px] bg-secondary"
            style={{ height: 260 + (index % 4) * 40 }}
          />
        ))}
      </div>
    );
  }

  if (likesQuery.isError) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-foreground">Likes did not load</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{likesQuery.error.message}</p>
        <button
          onClick={() => void likesQuery.refetch()}
          className="mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!liked.length) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-foreground">No likes yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart on a template to find it here later.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 [column-fill:_balance] sm:columns-3 md:columns-4 lg:columns-5">
      {liked.map((template, index) => (
        <TemplateCard key={template.id} pin={templateToPin(template, index)} />
      ))}
    </div>
  );
}

function LikesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pb-16 md:pl-[72px] md:pb-0">
        <TopBar showTabs={false} />
        <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-2 md:px-8">
          <div className="mb-6 flex items-start justify-between gap-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Likes</h1>
          </div>

          <nav className="mb-6 flex items-center justify-between gap-6 border-b border-transparent">
            <div className="flex items-center gap-6">
              <Link
                to="/remixes"
                className="pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground"
              >
                Remixes
              </Link>
              <Link
                to="/boards"
                className="pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground"
              >
                Boards
              </Link>
              <Link
                to="/likes"
                className="border-b-[2px] border-foreground pb-2 text-[17px] font-semibold text-foreground transition"
              >
                Likes
              </Link>
            </div>
          </nav>

          <LikesGrid />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Upload,
  MoreHorizontal,
  ChevronRight,
  Maximize2,
  Sparkles,
  Smile,
  Sticker,
  Image as ImageIcon,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { PinCard } from "@/components/pinterest/PinCard";
import { MobileNav } from "@/components/pinterest/MobileNav";
import {
  fetchPostTemplates,
  getTemplateMedia,
  postTemplatesQueryKey,
  type PostTemplate,
  type PostTemplateFeedResponse,
} from "@/lib/post-templates";

export const Route = createFileRoute("/pin/$pinId")({
  component: PinDetail,
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
  };
}

function uniqueTemplates(templates: PostTemplate[]) {
  return Array.from(new Map(templates.map((template) => [template.id, template])).values());
}

function PinDetail() {
  const { pinId } = Route.useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const defaultFeedQuery = useQuery({
    queryKey: postTemplatesQueryKey(),
    queryFn: () => fetchPostTemplates(),
  });
  const cachedFeeds = queryClient.getQueriesData<PostTemplateFeedResponse>({
    queryKey: ["post-templates"],
  });
  const cachedTemplates = cachedFeeds.flatMap(([, feed]) => feed?.data ?? []);
  const templates = uniqueTemplates([...cachedTemplates, ...(defaultFeedQuery.data?.data ?? [])]);
  const template = templates.find((item) => item.id === pinId);
  const relatedTemplates = templates.filter((item) => item.id !== pinId);
  const media = template
    ? getTemplateMedia(template)
    : { url: null, type: null, width: null, height: null };
  const thumbs = template?.assets.slice(0, 5) ?? [];
  const sidePins = relatedTemplates.slice(0, 10);
  const belowPins = relatedTemplates.slice(10).concat(relatedTemplates.slice(0, 10));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="px-3 md:px-6 pb-10">
          <div className="flex gap-3 items-start">
            <div className="w-full xl:w-4/5 2xl:w-4/6">
              <article className="rounded-[16px] border border-border bg-background overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image side */}
                  <div className="relative bg-secondary">
                    <button
                      aria-label="Back"
                      onClick={() => router.history.back()}
                      className="absolute top-4 left-4 z-10 h-11 w-11 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-secondary transition"
                    >
                      <ArrowLeft className="h-5 w-5 text-foreground" strokeWidth={2.4} />
                    </button>
                    {media.url && media.type === "video" ? (
                      <video
                        src={media.url}
                        aria-label={template?.title ?? "Video template"}
                        controls
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover max-h-[820px]"
                      />
                    ) : media.url ? (
                      <img
                        src={media.url}
                        alt={template?.title ?? "Template"}
                        className="w-full h-full object-cover max-h-[820px]"
                      />
                    ) : (
                      <div className="flex min-h-[480px] w-full items-center justify-center px-6 text-center text-sm font-semibold text-muted-foreground">
                        {defaultFeedQuery.isLoading
                          ? "Loading template..."
                          : "Template preview unavailable"}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-foreground/70 text-background text-xs font-semibold">
                      {template?.preview_type === "video" ? "Video template" : "AI modified"}
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <button
                        aria-label="Expand"
                        className="h-11 w-11 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background"
                      >
                        <Maximize2 className="h-5 w-5 text-foreground" />
                      </button>
                      <button
                        aria-label="Visual search"
                        className="h-11 w-11 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background"
                      >
                        <Sparkles className="h-5 w-5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Details side */}
                  <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1 px-2 h-10 rounded-full hover:bg-secondary transition">
                          <Heart className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                          <span className="text-sm font-semibold text-foreground">
                            {template?.likes_count ?? 0}
                          </span>
                        </button>
                        <button
                          aria-label="Comment"
                          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                        >
                          <MessageCircle className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                        </button>
                        <button
                          aria-label="Share"
                          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                        >
                          <Upload className="h-5 w-5 text-foreground" strokeWidth={2.2} />
                        </button>
                        <button
                          aria-label="More"
                          className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition"
                        >
                          <MoreHorizontal className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 h-10 px-3 rounded-full hover:bg-secondary transition text-sm font-semibold text-foreground">
                          {template?.tags[0] ?? "templates"}
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </button>
                        <button className="h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:brightness-90 transition">
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-200 shrink-0" />
                      <p className="text-sm font-semibold text-foreground">
                        EpicPost{" "}
                        <span className="text-muted-foreground font-normal">
                          • Public template feed
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                      {thumbs.map((asset, i) => (
                        <button
                          key={asset.id}
                          className={`h-14 w-14 rounded-[14px] overflow-hidden shrink-0 transition ${i === 0 ? "ring-2 ring-foreground" : "opacity-90 hover:opacity-100"}`}
                        >
                          {asset.type === "video" ? (
                            <video
                              src={asset.url}
                              muted
                              playsInline
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img src={asset.url} alt="" className="h-full w-full object-cover" />
                          )}
                        </button>
                      ))}
                      <button className="h-10 w-10 ml-auto rounded-full hover:bg-secondary flex items-center justify-center">
                        <ChevronRight className="h-5 w-5 text-foreground" />
                      </button>
                    </div>

                    <button className="w-full h-12 rounded-[16px] bg-secondary text-foreground font-semibold text-base hover:brightness-95 transition mb-6">
                      Visit site
                    </button>

                    <h2 className="text-lg font-bold text-foreground mb-2">Description</h2>
                    <p className="text-[15px] text-foreground leading-relaxed">
                      {template?.description ??
                        template?.title ??
                        "This public template is not available in the current feed."}
                    </p>
                    {template?.tags.map((tag) => (
                      <a
                        key={tag}
                        href={`/?search=${encodeURIComponent(tag)}`}
                        className="mr-2 mt-2 inline-block text-[15px] font-semibold text-[oklch(0.55_0.22_260)] hover:underline"
                      >
                        #{tag}
                      </a>
                    ))}
                    <button className="self-end mt-2 text-sm font-bold text-foreground hover:underline">
                      See less
                    </button>

                    {template?.comments.length ? (
                      <div className="mt-6 space-y-3">
                        {template.comments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            {comment.avatar_url ? (
                              <img
                                src={comment.avatar_url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-secondary" />
                            )}
                            <p className="text-sm text-foreground">
                              <span className="font-semibold">{comment.username ?? "Guest"}</span>{" "}
                              {comment.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-auto pt-6">
                      <div className="flex items-center gap-2 h-14 rounded-[28px] bg-secondary px-5">
                        <input
                          type="text"
                          placeholder="Add a comment to start the conversation"
                          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]"
                        />
                        <button
                          aria-label="Emoji"
                          className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center"
                        >
                          <Smile className="h-5 w-5 text-foreground" />
                        </button>
                        <button
                          aria-label="Sticker"
                          className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center"
                        >
                          <Sticker className="h-5 w-5 text-foreground" />
                        </button>
                        <button
                          aria-label="Image"
                          className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center"
                        >
                          <ImageIcon className="h-5 w-5 text-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Pins flowing right below the detail card */}
              <div className="mt-3 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
                {belowPins.map((p, i) => (
                  <PinCard key={`below-${i}-${p.id}`} pin={templateToPin(p, i)} />
                ))}
              </div>
            </div>

            {/* Side column visible at xl+ flowing alongside the detail */}
            <aside className="hidden xl:block xl:w-1/5 2xl:w-2/6">
              <div className="columns-1 2xl:columns-2 gap-3 [column-fill:_balance]">
                {sidePins.map((p, i) => (
                  <PinCard key={`side-${i}-${p.id}`} pin={templateToPin(p, i)} />
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Image as ImageIcon,
  Megaphone,
  MoreVertical,
  Plus,
  Share2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import {
  campaignCreativesForBrief,
  readStoredCampaignBrief,
  type CampaignBrief,
  type CampaignCreative,
} from "@/lib/campaigns";

export const Route = createFileRoute("/campaigns/results")({
  head: () => ({
    meta: [
      { title: "Campaign Results — EpicPost" },
      {
        name: "description",
        content: "Review generated campaign creative directions.",
      },
    ],
  }),
  component: CampaignResultsPage,
});

function CampaignCreativeCard({ creative, index }: { creative: CampaignCreative; index: number }) {
  const isLight = creative.tone === "light";

  return (
    <article
      className="campaign-result-card group relative min-w-[260px] flex-1 overflow-hidden rounded-[20px] border border-border bg-secondary shadow-sm sm:min-w-[290px]"
      style={{ animationDelay: `${index * 160}ms` }}
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        <img
          src={creative.image}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading={index === 0 ? "eager" : "lazy"}
        />
        <div
          className={`absolute inset-0 ${
            isLight
              ? "bg-gradient-to-b from-white/25 via-white/5 to-white/75"
              : "bg-gradient-to-b from-black/15 via-black/15 to-black/65"
          }`}
        />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isLight ? "bg-white/85 text-foreground" : "bg-black/35 text-white"
            }`}
          >
            {creative.eyebrow}
          </span>
          <button
            type="button"
            aria-label="Creative options"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition hover:bg-secondary group-hover:opacity-100 focus-visible:opacity-100"
          >
            <MoreVertical className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
        <div
          className={`absolute inset-x-5 bottom-5 ${isLight ? "text-foreground" : "text-white"}`}
        >
          <h2 className="text-3xl font-bold leading-none tracking-normal md:text-4xl">
            {creative.title}
          </h2>
          <p className="mt-3 text-sm font-semibold leading-snug opacity-90">{creative.body}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{creative.caption}</p>
        <button
          type="button"
          aria-label="Share creative"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition hover:bg-accent"
        >
          <Share2 className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </article>
  );
}

function CampaignResultsPage() {
  const [brief, setBrief] = useState<CampaignBrief>(() => readStoredCampaignBrief());

  useEffect(() => {
    setBrief(readStoredCampaignBrief());
  }, []);

  const creatives = useMemo(() => campaignCreativesForBrief(brief), [brief]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <main className="mx-auto min-h-screen w-full max-w-[1700px] px-4 py-5 md:px-8 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/campaigns"
              className="click-bounce inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-[15px] font-bold text-foreground shadow-sm transition hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
              Back to Campaigns
            </Link>
            <div className="flex h-11 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground">
              <Sparkles className="h-4 w-4" strokeWidth={2.3} />
              {creatives.length} creatives ready
            </div>
          </div>

          <section className="pt-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] bg-secondary text-foreground">
              <WandSparkles className="h-6 w-6" strokeWidth={2.3} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Campaign
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-base font-medium text-muted-foreground md:text-lg">
              Here is a series of creatives to post for this campaign. You can edit, delete or
              generate more.
            </p>
          </section>

          <section className="mt-9 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[24px] bg-secondary p-5 lg:sticky lg:top-6">
              <div className="flex gap-3">
                <Megaphone className="mt-1 h-5 w-5 shrink-0 text-foreground" strokeWidth={2.4} />
                <div>
                  <h2 className="text-xl font-bold leading-snug text-foreground">{brief.title}</h2>
                  <p className="mt-2 text-[15px] font-medium leading-6 text-muted-foreground">
                    {brief.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="flex gap-3">
                  <BriefcaseBusiness className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Product</h3>
                    <p className="mt-1 text-[15px] font-medium text-muted-foreground">
                      {brief.product}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ImageIcon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-foreground">Images</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {creatives.slice(0, 4).map((creative) => (
                        <div
                          key={creative.id}
                          className="aspect-square overflow-hidden rounded-[14px] bg-background"
                        >
                          <img
                            src={creative.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {creatives.map((creative, index) => (
                  <CampaignCreativeCard key={creative.id} creative={creative} index={index} />
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="click-bounce inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-primary-foreground shadow-sm transition hover:brightness-90"
                >
                  <Plus className="h-5 w-5" strokeWidth={2.4} />
                  Add Creative
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

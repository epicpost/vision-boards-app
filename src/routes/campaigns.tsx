import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Image as ImageIcon,
  Megaphone,
  Mic,
  Send,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  campaignCreativesForBrief,
  createCampaignBriefFromPrompt,
  DEFAULT_CAMPAIGN_BRIEF,
  storeCampaignBrief,
  type CampaignBrief,
} from "@/lib/campaigns";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Create Campaign — EpicPost" },
      {
        name: "description",
        content: "Create a social campaign brief and generate campaign creative previews.",
      },
    ],
  }),
  component: CampaignsPage,
});

const recentCampaigns = campaignCreativesForBrief(DEFAULT_CAMPAIGN_BRIEF).slice(0, 2);

function CampaignsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(DEFAULT_CAMPAIGN_BRIEF.prompt);
  const [brief, setBrief] = useState<CampaignBrief>(DEFAULT_CAMPAIGN_BRIEF);
  const [briefOpen, setBriefOpen] = useState(false);

  const canSubmit = prompt.trim().length > 0;

  function openBrief() {
    if (!canSubmit) return;
    setBrief(createCampaignBriefFromPrompt(prompt));
    setBriefOpen(true);
  }

  function confirmBrief() {
    storeCampaignBrief(brief);
    setBriefOpen(false);
    void navigate({ to: "/campaigns/results" });
  }

  if (pathname.startsWith("/campaigns/results")) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 md:px-8 md:py-6">
          <a
            href="/"
            className="click-bounce inline-flex h-11 w-fit items-center gap-2 rounded-full border border-border bg-background px-4 text-[15px] font-bold text-foreground shadow-sm transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
            Back to posts
          </a>

          <section className="flex flex-1 flex-col items-center justify-center py-12 text-center md:py-16">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px] bg-secondary text-foreground">
              <Megaphone className="h-6 w-6" strokeWidth={2.3} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Create Campaign
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-muted-foreground md:text-lg">
              Start from a prompt and turn it into a campaign brief with ready-to-review creative
              directions.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                openBrief();
              }}
              className="mt-10 w-full max-w-3xl"
            >
              <div className="rounded-[24px] border border-border bg-background p-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.08)] transition focus-within:ring-2 focus-within:ring-ring">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the campaign you want to create"
                  className="min-h-28 w-full resize-none bg-transparent px-3 py-3 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground md:text-lg"
                />
                <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground transition hover:bg-accent"
                  >
                    <BriefcaseBusiness className="h-4 w-4" strokeWidth={2.3} />
                    {brief.product}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground transition hover:bg-accent"
                  >
                    <ImageIcon className="h-4 w-4" strokeWidth={2.3} />
                    {brief.imageCount} Images
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground transition hover:bg-accent"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.3} />
                    {brief.format}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2.4} />
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Voice input"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-accent"
                    >
                      <Mic className="h-5 w-5" strokeWidth={2.2} />
                    </button>
                    <button
                      type="submit"
                      aria-label="Create campaign brief"
                      disabled={!canSubmit}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-5 w-5" strokeWidth={2.4} />
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 px-2 text-center text-xs font-medium text-muted-foreground">
                EpicPost can make mistakes, so double-check the brief.
              </p>
            </form>
          </section>

          <section className="mx-auto w-full max-w-5xl pb-10">
            <h2 className="mb-4 text-xl font-bold text-foreground">Recent Campaigns</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {recentCampaigns.map((creative) => (
                <article
                  key={creative.id}
                  className="overflow-hidden rounded-[20px] border border-border bg-secondary/70 p-4"
                >
                  <div className="mx-auto aspect-[4/5] max-h-64 w-full max-w-48 overflow-hidden rounded-[16px] bg-background">
                    <img
                      src={creative.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{creative.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[15px] font-medium text-muted-foreground">
                    {creative.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
      <MobileNav />

      <Dialog open={briefOpen} onOpenChange={setBriefOpen}>
        <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto rounded-[24px] border-none p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
              Campaign Brief
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-muted-foreground">
              {brief.prompt}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground">
              <BriefcaseBusiness className="h-4 w-4" strokeWidth={2.3} />
              {brief.product}
            </span>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground">
              <ImageIcon className="h-4 w-4" strokeWidth={2.3} />
              {brief.imageCount} Images
            </span>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-3 text-[15px] font-bold text-foreground">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.3} />
              {brief.format}
            </span>
          </div>

          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-[15px] font-bold text-foreground">Title</span>
              <input
                value={brief.title}
                onChange={(event) =>
                  setBrief((current) => ({ ...current, title: event.target.value }))
                }
                className="h-14 w-full rounded-[16px] border border-border bg-secondary px-4 text-base font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold text-foreground">Description</span>
              <textarea
                value={brief.description}
                onChange={(event) =>
                  setBrief((current) => ({ ...current, description: event.target.value }))
                }
                className="min-h-36 w-full resize-none rounded-[16px] border border-border bg-secondary px-4 py-4 text-base font-medium leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[15px] font-bold text-foreground">Goal</span>
                <input
                  value={brief.goal}
                  onChange={(event) =>
                    setBrief((current) => ({ ...current, goal: event.target.value }))
                  }
                  className="h-14 w-full rounded-[16px] border border-border bg-secondary px-4 text-base font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[15px] font-bold text-foreground">
                  Offer optional
                </span>
                <input
                  value={brief.offer}
                  onChange={(event) =>
                    setBrief((current) => ({ ...current, offer: event.target.value }))
                  }
                  placeholder="e.g. 10% off promotion"
                  className="h-14 w-full rounded-[16px] border border-border bg-secondary px-4 text-base font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={confirmBrief}
              className="click-bounce inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-primary-foreground shadow-sm transition hover:brightness-90"
            >
              <Sparkles className="h-5 w-5" strokeWidth={2.3} />
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

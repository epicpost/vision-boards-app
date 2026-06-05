import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Heart, MessageCircle, Upload, MoreHorizontal, ChevronRight, Maximize2, Sparkles, Smile, Sticker, Image as ImageIcon } from "lucide-react";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { PinGrid } from "@/components/pinterest/PinGrid";
import { PinCard } from "@/components/pinterest/PinCard";
import { MobileNav } from "@/components/pinterest/MobileNav";
import { getPinById, pins } from "@/components/pinterest/pins-data";

export const Route = createFileRoute("/pin/$pinId")({
  component: PinDetail,
});

function PinDetail() {
  const { pinId } = Route.useParams();
  const router = useRouter();
  const pin = getPinById(pinId) ?? pins[0];
  const thumbs = pins.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="px-3 md:px-6 pb-10">
          <div className="flex gap-3 items-start">
            <article className="w-full xl:w-4/5 2xl:w-4/6 rounded-[32px] border border-border bg-background overflow-hidden">
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
                <img
                  src={pin.src.replace(/\/\d+$/, "/1200")}
                  alt={pin.title ?? "Pin"}
                  className="w-full h-full object-cover max-h-[820px]"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-foreground/70 text-background text-xs font-semibold">
                  AI modified
                </div>
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button aria-label="Expand" className="h-11 w-11 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background">
                    <Maximize2 className="h-5 w-5 text-foreground" />
                  </button>
                  <button aria-label="Visual search" className="h-11 w-11 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background">
                    <Sparkles className="h-5 w-5 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Details side */}
              <div className="p-6 md:p-8 flex flex-col">
                {/* Action bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 px-2 h-10 rounded-full hover:bg-secondary transition">
                      <Heart className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                      <span className="text-sm font-semibold text-foreground">2</span>
                    </button>
                    <button aria-label="Comment" className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition">
                      <MessageCircle className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                    </button>
                    <button aria-label="Share" className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition">
                      <Upload className="h-5 w-5 text-foreground" strokeWidth={2.2} />
                    </button>
                    <button aria-label="More" className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition">
                      <MoreHorizontal className="h-6 w-6 text-foreground" strokeWidth={2.2} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 h-10 px-3 rounded-full hover:bg-secondary transition text-sm font-semibold text-foreground">
                      travel app
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </button>
                    <button className="h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:brightness-90 transition">
                      Save
                    </button>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-200 shrink-0" />
                  <p className="text-sm font-semibold text-foreground">
                    {pin.author ?? "Jana & Matej"} <span className="text-muted-foreground font-normal">• Hiking & Adventure Travel</span>
                  </p>
                </div>

                {/* Thumbnails */}
                <div className="flex items-center gap-2 mb-5">
                  {thumbs.map((t, i) => (
                    <button
                      key={t.id}
                      className={`h-14 w-14 rounded-[14px] overflow-hidden shrink-0 transition ${i === 0 ? "ring-2 ring-foreground" : "opacity-90 hover:opacity-100"}`}
                    >
                      <img src={t.src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                  <button className="h-10 w-10 ml-auto rounded-full hover:bg-secondary flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-foreground" />
                  </button>
                </div>

                {/* Visit site */}
                <button className="w-full h-12 rounded-[16px] bg-secondary text-foreground font-semibold text-base hover:brightness-95 transition mb-6">
                  Visit site
                </button>

                {/* Description */}
                <h2 className="text-lg font-bold text-foreground mb-2">Description</h2>
                <p className="text-[15px] text-foreground leading-relaxed">
                  {pin.title ?? "There's no other place like it"} 🥺🤍 Comment GUIDE if you'd like to get our
                  comprehensive travel guide, with interactive maps, 200+ pins of the most beautiful
                  spots, descriptions, photo locations, pre-made itineraries and important travel tips 🌲🥾🌸📸✨
                </p>
                <a href="#" className="block mt-2 text-[15px] font-semibold text-[oklch(0.55_0.22_260)] hover:underline">
                  #canadianrockies
                </a>
                <button className="self-end mt-2 text-sm font-bold text-foreground hover:underline">See less</button>

                {/* Comment box */}
                <div className="mt-auto pt-6">
                  <div className="flex items-center gap-2 h-14 rounded-[28px] bg-secondary px-5">
                    <input
                      type="text"
                      placeholder="Add a comment to start the conversation"
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]"
                    />
                    <button aria-label="Emoji" className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center">
                      <Smile className="h-5 w-5 text-foreground" />
                    </button>
                    <button aria-label="Sticker" className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center">
                      <Sticker className="h-5 w-5 text-foreground" />
                    </button>
                    <button aria-label="Image" className="h-9 w-9 rounded-full hover:bg-background/60 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </article>
            <aside className="hidden xl:block xl:w-1/5 2xl:w-2/6">
              <div className="columns-1 2xl:columns-2 gap-3 [column-fill:_balance]">
                {pins.slice(5, 13).map((p) => (
                  <PinCard key={`side-${p.id}`} pin={p} />
                ))}
              </div>
            </aside>
          </div>

          {/* More pins */}
          <div className="mt-3">
            <PinGrid />
          </div>

        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function TopBarSimple() {
  return <TopBar />;
}

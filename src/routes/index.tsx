import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/pinterest/Sidebar";
import { TopBar } from "@/components/pinterest/TopBar";
import { PinGrid } from "@/components/pinterest/PinGrid";
import { MobileNav } from "@/components/pinterest/MobileNav";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar />
        <main>
          <h1 className="sr-only">Pinterest — Discover ideas you'll love</h1>
          <PinGrid />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

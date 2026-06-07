import { ExternalLink, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const main = [
  { label: "Settings", to: "/settings" as const },
  { label: "Refine your recommendations" },
  { label: "Link to Pinterest" },
  { label: "Reports and violations center" },
  { label: "Be a beta tester", external: true },
];

const support = [
  { label: "Help center", external: true },
  { label: "Create widget", external: true },
  { label: "Removals", external: true },
  { label: "Personalized Ads", external: true },
  { label: "Your privacy rights" },
  { label: "Privacy policy", external: true },
  { label: "Terms of service", external: true },
];

const resourcesPrimary = ["About", "Blog", "Businesses"];
const resourcesSecondary = ["Careers", "Developers"];

type Item = { label: string; external?: boolean; to?: "/settings" };

function Row({ item, onClose }: { item: Item; onClose: () => void }) {
  const content = (
    <>
      <span className="text-base font-semibold text-foreground">{item.label}</span>
      {item.external ? (
        <ExternalLink className="h-5 w-5 text-foreground" strokeWidth={2.2} />
      ) : null}
    </>
  );
  const className =
    "flex w-full items-center justify-between rounded-[16px] px-2 py-2.5 text-left transition hover:bg-secondary";

  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onClose}>
        {content}
      </Link>
    );
  }
  return (
    <button className={className} onClick={onClose}>
      {content}
    </button>
  );
}

export function SettingsSupportMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[380px] max-w-[calc(100vw-24px)] rounded-[20px] bg-background p-4 shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
      <div className="mb-2 flex items-center gap-3 px-2 py-1">
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
        >
          <X className="h-6 w-6 text-foreground" strokeWidth={2.2} />
        </button>
        <h2 className="text-xl font-bold text-foreground">Settings & Support</h2>
      </div>
      <div className="mb-2">
        {main.map((item) => (
          <Row key={item.label} item={item} onClose={onClose} />
        ))}
      </div>
      <div className="px-2 pb-2 pt-3 text-[13px] font-medium text-muted-foreground">Support</div>
      <div className="mb-2">
        {support.map((item) => (
          <Row key={item.label} item={item} onClose={onClose} />
        ))}
      </div>
      <div className="px-2 pb-2 pt-3 text-[13px] font-medium text-muted-foreground">Resources</div>
      <div className="px-2 pb-1 text-base font-semibold text-[#3b6cd9]">
        {resourcesPrimary.join("  ")}
      </div>
      <div className="px-2 pb-2 text-base font-semibold text-[#3b6cd9]">
        {resourcesSecondary.join("  ")}
      </div>
    </div>
  );
}

export const CAMPAIGN_BRIEF_STORAGE_KEY = "epicpost_campaign_brief";

export interface CampaignBrief {
  prompt: string;
  title: string;
  description: string;
  product: string;
  imageCount: number;
  format: string;
  goal: string;
  offer: string;
}

export interface CampaignCreative {
  id: string;
  title: string;
  caption: string;
  eyebrow: string;
  body: string;
  image: string;
  tone: "light" | "dark";
}

export const DEFAULT_CAMPAIGN_BRIEF: CampaignBrief = {
  prompt:
    "Create a social campaign to promote our new spring linen collection, targeting young working professionals aged 25-35, timed for the start of summer, with a fresh, breezy, effortless tone.",
  title: "Easy Elegance for Summer Mornings",
  description:
    "Transition seamlessly from morning meetings to sunset socials with a lightweight collection designed for professionals who value breezy comfort and effortless style as temperatures rise.",
  product: "Linen-blend strappy dress",
  imageCount: 4,
  format: "Story (9:16)",
  goal: "Promote a new product",
  offer: "",
};

function sentenceCase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function titleFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("summer")) return "Easy Elegance for Summer Mornings";
  if (lower.includes("launch")) return "Launch Week, Styled Your Way";
  if (lower.includes("sale") || lower.includes("discount")) return "Fresh Finds Before They Go";

  const firstPhrase = prompt.split(/[.,;]/)[0]?.trim();
  if (!firstPhrase) return DEFAULT_CAMPAIGN_BRIEF.title;

  return sentenceCase(firstPhrase)
    .replace(/^create (a|an|the)\s+/i, "")
    .replace(/^social campaign to\s+/i, "")
    .slice(0, 62);
}

function descriptionFromPrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return DEFAULT_CAMPAIGN_BRIEF.description;

  return sentenceCase(trimmed.replace(/\s+/g, " ")).slice(0, 240);
}

export function createCampaignBriefFromPrompt(prompt: string): CampaignBrief {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) return DEFAULT_CAMPAIGN_BRIEF;

  return {
    ...DEFAULT_CAMPAIGN_BRIEF,
    prompt: trimmedPrompt,
    title: titleFromPrompt(trimmedPrompt),
    description: descriptionFromPrompt(trimmedPrompt),
  };
}

function isCampaignBrief(value: unknown): value is CampaignBrief {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<CampaignBrief>;

  return (
    typeof maybe.prompt === "string" &&
    typeof maybe.title === "string" &&
    typeof maybe.description === "string" &&
    typeof maybe.product === "string" &&
    typeof maybe.imageCount === "number" &&
    typeof maybe.format === "string" &&
    typeof maybe.goal === "string" &&
    typeof maybe.offer === "string"
  );
}

export function readStoredCampaignBrief(): CampaignBrief {
  if (typeof window === "undefined") return DEFAULT_CAMPAIGN_BRIEF;

  try {
    const stored = window.sessionStorage.getItem(CAMPAIGN_BRIEF_STORAGE_KEY);
    if (!stored) return DEFAULT_CAMPAIGN_BRIEF;

    const parsed = JSON.parse(stored) as unknown;
    return isCampaignBrief(parsed) ? parsed : DEFAULT_CAMPAIGN_BRIEF;
  } catch {
    return DEFAULT_CAMPAIGN_BRIEF;
  }
}

export function storeCampaignBrief(brief: CampaignBrief) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CAMPAIGN_BRIEF_STORAGE_KEY, JSON.stringify(brief));
}

export function campaignCreativesForBrief(brief: CampaignBrief): CampaignCreative[] {
  return [
    {
      id: "hero-story",
      title: brief.title,
      caption: "A polished opening story for the campaign launch.",
      eyebrow: "Launch Story",
      body: "All-day ease from the first meeting to the last toast.",
      image: "/templates/shared/Aesthetic Instagram Story Design Idea.jpg",
      tone: "dark",
    },
    {
      id: "benefit-story",
      title: "Stay Cool, Stay Polished",
      caption: "A benefit-led creative built for fast mobile scanning.",
      eyebrow: "Product Benefit",
      body: "Breathable silhouettes that keep the workday sharp as temperatures rise.",
      image: "/templates/shared/Minimal Green Typography Poster Design.jpg",
      tone: "light",
    },
    {
      id: "transition-post",
      title: "Transition Without Effort",
      caption: "A lifestyle frame that connects the product to the audience's day.",
      eyebrow: "Lifestyle",
      body: brief.offer.trim()
        ? `${brief.offer.trim()} with pieces made for desk-to-dinner plans.`
        : "Effortless layers designed for desk-to-dinner plans.",
      image: "/templates/frankof-collection/slide-03.png",
      tone: "dark",
    },
    {
      id: "retargeting-story",
      title: "From Desk to Dinner",
      caption: "A closer for retargeting and saved audiences.",
      eyebrow: "Retargeting",
      body: "Your summer uniform, ready when the calendar changes.",
      image: "/templates/frankof-collection/slide-08.png",
      tone: "light",
    },
  ];
}

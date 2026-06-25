import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getAuthUser, updateAuthUser } from "@/lib/auth";
import { completeOnboarding } from "@/lib/profile";

// Onboarding is shown once, right after a user's first sign-in (the server's
// `onboarding_completed` flag is the source of truth — see __root.tsx). Step
// progress and the data collected so far are mirrored into localStorage so a
// mid-flow refresh resumes on the step the user hadn't finished yet. Only the
// final submit writes to the DB and flips `onboarding_completed`.

const STEP_KEY = "epicpost_onboarding_step";
const DATA_KEY = "epicpost_onboarding_data";

type StepIndex = 0 | 1 | 2;

interface OnboardingData {
  name: string;
  website: string;
  interests: string[];
}

const EMPTY_DATA: OnboardingData = { name: "", website: "", interests: [] };

// Moods/topics adapted to EpicPost (a social-media content creator). Each is a
// content theme the feed of templates can be tuned around.
const INTERESTS: { id: string; label: string; emoji: string }[] = [
  { id: "instagram-posts", label: "Instagram posts", emoji: "📸" },
  { id: "reels-video", label: "Reels & video", emoji: "🎬" },
  { id: "stories", label: "Stories", emoji: "✨" },
  { id: "quotes", label: "Quotes", emoji: "💬" },
  { id: "product-promos", label: "Product promos", emoji: "🛍️" },
  { id: "food-recipes", label: "Food & recipes", emoji: "🍳" },
  { id: "fashion-outfits", label: "Fashion & outfits", emoji: "👗" },
  { id: "travel", label: "Travel", emoji: "🌍" },
  { id: "fitness", label: "Fitness", emoji: "🏋️" },
  { id: "real-estate", label: "Real estate", emoji: "🏡" },
  { id: "memes", label: "Memes", emoji: "😹" },
  { id: "marketing-tips", label: "Marketing tips", emoji: "📈" },
];

const MIN_INTERESTS = 3;

function readStep(): StepIndex {
  if (typeof window === "undefined") return 0;
  const raw = Number(window.localStorage.getItem(STEP_KEY));
  return raw === 1 || raw === 2 ? (raw as StepIndex) : 0;
}

function readData(): OnboardingData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (!raw) return EMPTY_DATA;
    return { ...EMPTY_DATA, ...(JSON.parse(raw) as Partial<OnboardingData>) };
  } catch {
    return EMPTY_DATA;
  }
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidWebsite(value: string): boolean {
  try {
    const url = new URL(normalizeWebsite(value));
    return Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
}

const PROGRESS = ["33%", "66%", "100%"] as const;

export function OnboardingDialog({
  open,
  onOpenChange,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}) {
  const [step, setStep] = useState<StepIndex>(0);
  const [data, setData] = useState<OnboardingData>(EMPTY_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seed from localStorage / the signed-in user when the dialog opens.
  useEffect(() => {
    if (!open) return;
    const stored = readData();
    const authUser = getAuthUser();
    const fallbackName = authUser
      ? [authUser.first_name, authUser.last_name].filter(Boolean).join(" ")
      : "";
    setData({ ...stored, name: stored.name || fallbackName });
    setStep(readStep());
  }, [open]);

  // Persist progress on every change so a refresh resumes the unfinished step.
  useEffect(() => {
    if (!open) return;
    window.localStorage.setItem(STEP_KEY, String(step));
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [open, step, data]);

  const canContinue = useMemo(() => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return isValidWebsite(data.website);
    return true;
  }, [step, data]);

  function goNext() {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
  }

  function goBack() {
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
  }

  function toggleInterest(id: string) {
    setData((prev) => {
      const has = prev.interests.includes(id);
      return {
        ...prev,
        interests: has ? prev.interests.filter((i) => i !== id) : [...prev.interests, id],
      };
    });
  }

  async function finish(includeInterests: boolean) {
    setIsSubmitting(true);
    const [firstName, ...rest] = data.name.trim().split(/\s+/);
    try {
      const profile = await completeOnboarding({
        first_name: firstName || null,
        last_name: rest.length ? rest.join(" ") : null,
        website: normalizeWebsite(data.website) || null,
        interests: includeInterests ? data.interests : [],
      });
      // Keep the cached auth user's name in sync with what they just entered.
      updateAuthUser({
        first_name: profile.first_name ?? null,
        last_name: profile.last_name ?? null,
      });
      window.localStorage.removeItem(STEP_KEY);
      window.localStorage.removeItem(DATA_KEY);
      toast.success("You're all set!");
      onOpenChange(false);
      onCompleted?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't save your onboarding.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className="max-w-[520px] rounded-[28px] p-8 sm:p-10 border-none shadow-2xl"
      >
        {/* Progress header */}
        <div className="flex items-center gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="text-foreground/70 hover:text-foreground transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="w-5" />
          )}
          <div className="h-1.5 flex-1 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[#e60023] transition-all duration-300"
              style={{ width: PROGRESS[step] }}
            />
          </div>
        </div>

        {step === 0 ? (
          <StepName
            value={data.name}
            email={getAuthUser()?.email ?? ""}
            onChange={(name) => setData((p) => ({ ...p, name }))}
            onSubmit={() => canContinue && goNext()}
          />
        ) : null}

        {step === 1 ? (
          <StepWebsite
            value={data.website}
            onChange={(website) => setData((p) => ({ ...p, website }))}
            onSubmit={() => canContinue && goNext()}
          />
        ) : null}

        {step === 2 ? <StepInterests selected={data.interests} onToggle={toggleInterest} /> : null}

        {/* Footer actions */}
        <div className="mt-2 flex flex-col gap-3">
          {step < 2 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={goNext}
              className="h-12 rounded-[14px] bg-[#e60023] hover:bg-[#ad081b] transition text-white font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => finish(false)}
                className="px-2 h-12 rounded-[14px] text-sm font-semibold text-muted-foreground hover:text-foreground transition disabled:opacity-50"
              >
                Skip
              </button>
              <button
                type="button"
                disabled={data.interests.length < MIN_INTERESTS || isSubmitting}
                onClick={() => finish(true)}
                className="px-6 h-12 rounded-[14px] bg-[#e60023] hover:bg-[#ad081b] transition text-white font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Finishing"
                  : data.interests.length < MIN_INTERESTS
                    ? `Pick ${MIN_INTERESTS} or more`
                    : "Finish"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepName({
  value,
  email,
  onChange,
  onSubmit,
}: {
  value: string;
  email: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col">
      <h2 className="text-[28px] font-bold leading-tight text-foreground">
        Nice to meet you!
        <br />
        What&apos;s your name?
      </h2>
      <p className="mt-3 text-[15px] text-muted-foreground">
        Your answers to the next few questions will help us find the right ideas for you.
      </p>
      <label className="mt-8 flex flex-col rounded-[14px] border border-border px-4 py-2.5 transition focus-within:ring-2 focus-within:ring-ring">
        <span className="text-xs font-semibold text-muted-foreground">Name</span>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Your name"
          className="bg-transparent text-[17px] text-foreground outline-none"
        />
      </label>
      {email ? <p className="mt-3 text-sm text-muted-foreground">{email}</p> : null}
    </div>
  );
}

function StepWebsite({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col">
      <h2 className="text-[28px] font-bold leading-tight text-foreground">
        What&apos;s your website address?
      </h2>
      <p className="mt-3 text-[15px] text-muted-foreground">
        We&apos;ll use it to tailor templates to your brand. This information will always be
        private.
      </p>
      <label className="mt-8 flex flex-col rounded-[14px] border border-border px-4 py-2.5 transition focus-within:ring-2 focus-within:ring-ring">
        <span className="text-xs font-semibold text-muted-foreground">Website</span>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="yourbrand.com"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          className="bg-transparent text-[17px] text-foreground outline-none"
        />
      </label>
    </div>
  );
}

function StepInterests({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mt-6 flex flex-col">
      <h2 className="text-[28px] font-bold leading-tight text-foreground">
        What are you in the mood to create?
      </h2>
      <p className="mt-3 text-[15px] text-muted-foreground">
        Pick a few themes so we can tune your feed of templates.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(interest.id)}
              className={`flex flex-col items-start gap-2 rounded-[16px] border p-3 text-left transition ${
                isSelected
                  ? "border-[#e60023] bg-[#e60023]/5 ring-2 ring-[#e60023]/30"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <span className="text-2xl">{interest.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{interest.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

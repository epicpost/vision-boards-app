import { X } from "lucide-react";

// A small coach-mark shown bottom-left right after onboarding finishes,
// nudging the user to tap a template to seed their personalized feed. It
// persists across refreshes (via a localStorage flag owned by __root.tsx)
// until the user dismisses it.
export function GetStartedCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-6 z-40 w-[320px] max-w-[calc(100vw-3rem)] rounded-[20px] bg-[#4255ff] p-6 text-white shadow-2xl">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-4 top-4 text-white/80 transition hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>
      <h3 className="text-[20px] font-bold leading-snug">Pick any idea to get started</h3>
      <p className="mt-2 text-[15px] leading-snug text-white/90">
        This will start to personalise your home feed recommendations.
      </p>
    </div>
  );
}

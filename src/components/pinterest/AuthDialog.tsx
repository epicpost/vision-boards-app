import { Apple, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isValidEmail, requestMagicLink } from "@/lib/auth";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedEmail = email.trim();
  const canSubmit = isValidEmail(normalizedEmail) && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSentTo(null);

    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await requestMagicLink(normalizedEmail);
      setSentTo(normalizedEmail);
      toast.success(response.message ?? "Magic link sent. Check your inbox.");
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unable to send magic link.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,620px)] gap-0 rounded-[32px] border-0 px-8 py-14 shadow-2xl sm:px-14">
        <DialogHeader className="items-center text-center">
          <img src="/transpared-logo2.png" alt="" className="h-14 w-14 object-contain" />
          <DialogTitle className="mt-8 text-center text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
            Welcome to EpicPost
          </DialogTitle>
          <DialogDescription className="sr-only">
            Sign in to EpicPost with a magic link or social provider.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-12 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            <label htmlFor={emailId} className="text-lg font-bold text-foreground">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
                setSentTo(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error || sentTo ? `${emailId}-status` : undefined}
              className="h-16 w-full rounded-[16px] border-2 border-foreground bg-background px-6 text-xl text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            {(error || sentTo) && (
              <p
                id={`${emailId}-status`}
                className={`text-sm font-medium ${error ? "text-destructive" : "text-muted-foreground"}`}
              >
                {error ?? `Magic link sent to ${sentTo}.`}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-16 w-full items-center justify-center rounded-full bg-primary px-6 text-lg font-bold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending
              </>
            ) : (
              "Send magic link"
            )}
          </button>
        </form>

        <div className="my-10 flex items-center gap-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-bold text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="flex h-16 w-full items-center justify-center gap-4 rounded-full bg-secondary px-6 text-lg font-bold text-foreground transition hover:brightness-95"
          >
            <span className="text-2xl font-bold text-[oklch(0.62_0.18_252)]">G</span>
            Continue with Google
          </button>
          <button
            type="button"
            className="flex h-16 w-full items-center justify-center gap-4 rounded-full bg-foreground px-6 text-lg font-bold text-background transition hover:opacity-90"
          >
            <Apple className="h-6 w-6 fill-current" />
            Continue with Apple
          </button>
        </div>

        <p className="mt-12 text-center text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
          By continuing, you agree to EpicPost's{" "}
          <a href="/terms" className="font-bold underline underline-offset-2">
            Terms of Service
          </a>{" "}
          and acknowledge you've read our{" "}
          <a href="/privacy" className="font-bold underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}

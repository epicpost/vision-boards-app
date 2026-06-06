import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { googleLogin, isValidEmail, requestMagicLink, saveAuthSession } from "@/lib/auth";
import { GOOGLE_CLIENT_ID, renderGoogleButton } from "@/lib/google-identity";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.37 12.65c.02 2.5 2.19 3.33 2.22 3.34-.02.06-.34 1.17-1.13 2.31-.68.99-1.39 1.97-2.5 1.99-1.1.02-1.45-.65-2.7-.65-1.25 0-1.64.63-2.68.67-1.08.04-1.9-1.07-2.58-2.05-1.4-2.02-2.47-5.71-1.03-8.21.71-1.24 1.99-2.03 3.37-2.05 1.06-.02 2.07.71 2.72.71.65 0 1.87-.88 3.16-.75.54.02 2.06.22 3.03 1.65-.08.05-1.81 1.06-1.79 3.16zM14.39 4.77c.58-.7.97-1.67.86-2.64-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.62-.89 2.56.93.07 1.88-.47 2.47-1.17z" />
    </svg>
  );
}

export function SignupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const normalizedEmail = email.trim();
  const canSubmit = isValidEmail(normalizedEmail) && !isSubmitting;

  async function handleGoogleCredential(idToken: string) {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const response = await googleLogin(idToken);
      saveAuthSession(response.data);
      toast.success("You're signed in.");
      onOpenChange(false);
      void navigate({ to: "/", replace: true });
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : "Unable to sign in with Google.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID) return;
    const container = googleButtonRef.current;
    if (!container) return;

    container.replaceChildren();
    void renderGoogleButton(
      container,
      (idToken) => {
        void handleGoogleCredential(idToken);
      },
      (renderError) => {
        toast.error(renderError.message);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);

    if (!isValidEmail(normalizedEmail)) {
      const message = "Enter a valid email address.";
      setError(message);
      toast.error(message);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await requestMagicLink(normalizedEmail);
      setSent(true);
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

  function handleProvider(name: string) {
    toast(`Continue with ${name}`, { description: "Demo only" });
  }

  const googleConfigured = Boolean(GOOGLE_CLIENT_ID);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] rounded-[28px] p-10 border-none shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center">
            <img src="/transparent-logo.png" alt="" className="h-16 w-16 object-contain" />
          </div>
          <h2 className="text-[28px] font-bold text-foreground leading-tight mb-6">
            Welcome to EpicPost
          </h2>
        </div>

        {sent ? (
          <div className="text-center text-[15px] text-foreground bg-secondary rounded-[16px] p-4 mb-2">
            We sent a magic link to <b>{normalizedEmail}</b>. Open it on this device to continue.
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
                setSent(false);
              }}
              placeholder="you@example.com"
              aria-invalid={Boolean(error)}
              className="h-12 rounded-[14px] border border-border bg-background px-4 text-[15px] text-foreground outline-none focus:border-foreground transition"
            />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-12 rounded-full bg-[#e60023] hover:bg-[#ad081b] transition text-white font-semibold text-[15px]"
            >
              {isSubmitting ? "Sending" : "Send magic link"}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative h-12">
            <button
              type="button"
              onClick={() => {
                if (!googleConfigured) handleProvider("Google");
              }}
              disabled={isGoogleLoading}
              aria-hidden={googleConfigured}
              className="h-12 w-full rounded-full bg-secondary hover:bg-accent transition flex items-center justify-center gap-3 text-[15px] font-semibold text-foreground disabled:opacity-70"
            >
              <GoogleIcon />
              {isGoogleLoading ? "Signing in" : "Continue with Google"}
            </button>
            {googleConfigured ? (
              <div
                ref={googleButtonRef}
                className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-full opacity-[0.001]"
              />
            ) : null}
          </div>
          <button
            onClick={() => handleProvider("Apple")}
            className="h-12 rounded-full bg-foreground hover:bg-foreground/90 transition flex items-center justify-center gap-3 text-[15px] font-semibold text-background"
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 px-2 leading-relaxed">
          By continuing, you agree to EpicPost's{" "}
          <a className="font-semibold underline" href="#">
            Terms of Service
          </a>{" "}
          and acknowledge you've read our{" "}
          <a className="font-semibold underline" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}

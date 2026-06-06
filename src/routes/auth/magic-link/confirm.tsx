import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { confirmMagicLink, saveAuthSession } from "@/lib/auth";

export const Route = createFileRoute("/auth/magic-link/confirm")({
  validateSearch: (search: Record<string, unknown>): { token?: string; email?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: MagicLinkConfirm,
});

function MagicLinkConfirm() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your magic link...");
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    if (!token || !email) {
      setStatus("error");
      setMessage("This magic link is missing required confirmation details.");
      return;
    }

    void confirmMagicLink(token, email)
      .then((response) => {
        saveAuthSession(response.data);
        setStatus("success");
        setMessage("You're signed in. Redirecting...");

        window.setTimeout(() => {
          void navigate({ to: "/", replace: true });
        }, 900);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "This magic link could not be used.");
      });
  }, [email, navigate, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          {status === "loading" ? (
            <Loader2 className="h-7 w-7 animate-spin text-foreground" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-7 w-7 text-[oklch(0.55_0.16_145)]" />
          ) : (
            <XCircle className="h-7 w-7 text-destructive" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-foreground">
          {status === "error" ? "Magic link failed" : "Welcome to EpicPost"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>

        {status === "error" ? (
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-95"
            >
              Back to EpicPost
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignupDialog } from "@/components/pinterest/SignupDialog";
import { AUTH_REQUIRED_EVENT } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
      { title: "Pinterest — Discover ideas you'll love" },
      {
        name: "description",
        content: "Discover recipes, home ideas, style inspiration and other ideas to try.",
      },
      { property: "og:title", content: "Pinterest — Discover ideas you'll love" },
      {
        property: "og:description",
        content: "Discover recipes, home ideas, style inspiration and other ideas to try.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicons/favicon.ico",
        sizes: "any",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicons/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicons/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicons/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/favicons/site.webmanifest",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const openAuthDialog = () => setAuthOpen(true);

    window.addEventListener(AUTH_REQUIRED_EVENT, openAuthDialog);

    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, openAuthDialog);
    };
  }, []);

  // After a new deploy, an open tab may reference chunk hashes that no longer
  // exist on the server (404 on dynamic import). Vite fires `vite:preloadError`
  // in that case — reload once to pull a fresh document with the current hashes.
  // A sessionStorage guard prevents a reload loop if the asset is truly missing.
  useEffect(() => {
    const RELOAD_KEY = "epicpost-chunk-reload";

    const handlePreloadError = (event: Event) => {
      event.preventDefault();
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    };

    const clearGuard = () => sessionStorage.removeItem(RELOAD_KEY);

    window.addEventListener("vite:preloadError", handlePreloadError);
    window.addEventListener("load", clearGuard);

    return () => {
      window.removeEventListener("vite:preloadError", handlePreloadError);
      window.removeEventListener("load", clearGuard);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <SignupDialog open={authOpen} onOpenChange={setAuthOpen} />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent, d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { D as Dialog$1, b as DialogPortal$1, d as DialogContent$1, g as DialogClose, h as DialogOverlay$1, e as DialogTitle$1, f as DialogDescription$1 } from "../_libs/radix-ui__react-dialog.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { I as Info, C as CircleX, a as CircleCheck, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Dialog = Dialog$1;
const DialogPortal = DialogPortal$1;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogOverlay$1,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogOverlay$1.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, showCloseButton = true, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent$1,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        showCloseButton ? /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogClose, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] }) : null
      ]
    }
  )
] }));
DialogContent.displayName = DialogContent$1.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogTitle$1,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogTitle$1.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogDescription$1,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogDescription$1.displayName;
const API_BASE_URL = "https://epicapi.epicpost.app";
const postTemplatesQueryKey = ({ search, board } = {}) => [
  "post-templates",
  { limit: 20, search: search?.trim() || void 0, board: board || void 0 }
];
const postTemplateQueryKey = (id) => ["post-template", id];
async function fetchPostTemplate(id) {
  const url = new URL(`/api/v1/post-templates/${id}`, API_BASE_URL);
  const token = getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : void 0
  });
  if (!response.ok) {
    throw new Error(`Post template request failed with ${response.status}`);
  }
  return response.json();
}
function getTemplateMedia(template) {
  if (template.preview) {
    return {
      url: template.preview,
      type: template.preview_type,
      width: template.preview_width,
      height: template.preview_height
    };
  }
  const firstAsset = [...template.assets].sort((a, b) => a.order - b.order)[0];
  return firstAsset ? {
    url: firstAsset.url,
    type: firstAsset.type,
    width: firstAsset.width,
    height: firstAsset.height
  } : { url: null, type: null, width: null, height: null };
}
async function fetchPostTemplates(params = {}) {
  const url = new URL("/api/v1/post-templates", API_BASE_URL);
  url.searchParams.set("limit", "20");
  const normalizedSearch = params.search?.trim();
  if (params.board) {
    url.searchParams.set("board", params.board);
  } else if (normalizedSearch) {
    url.searchParams.set("search", normalizedSearch);
  }
  if (params.cursor) {
    url.searchParams.set("cursor", params.cursor);
  }
  const token = getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : void 0
  });
  if (!response.ok) {
    throw new Error(`Post templates request failed with ${response.status}`);
  }
  return response.json();
}
const AUTH_SESSION_CHANGED_EVENT = "epicpost-auth-session-changed";
const AUTH_REQUIRED_EVENT = "epicpost-auth-required";
const ACCESS_TOKEN_KEY = "epicpost_access_token";
const REFRESH_TOKEN_KEY = "epicpost_refresh_token";
const USER_KEY = "epicpost_user";
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function getErrorMessage(payload) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(". ");
  }
  return null;
}
async function requestMagicLink(email) {
  const response = await fetch(new URL("/api/v1/auth/magic-link", API_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email.trim() })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ?? `Magic link request failed with ${response.status}`
    );
  }
  return payload;
}
async function confirmMagicLink(token, email) {
  const url = new URL("/api/v1/auth/magic-link/confirm", API_BASE_URL);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email.trim());
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ?? `Magic link confirmation failed with ${response.status}`
    );
  }
  return payload;
}
async function googleLogin(idToken) {
  const response = await fetch(new URL("/api/v1/auth/google", API_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id_token: idToken })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getErrorMessage(payload) ?? `Google login failed with ${response.status}`);
  }
  return payload;
}
function saveAuthSession(session) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}
function hasAuthSession() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY));
}
function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}
function getAuthUser() {
  if (typeof window === "undefined") return null;
  const storedUser = window.localStorage.getItem(USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}
function updateAuthUser(patch) {
  if (typeof window === "undefined") return;
  const current = getAuthUser();
  if (!current) return;
  const next = { ...current, ...patch };
  window.localStorage.setItem(USER_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}
function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}
function requestAuthDialog() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
}
function expireAuthSession() {
  clearAuthSession();
  requestAuthDialog();
}
const GOOGLE_CLIENT_ID = void 0;
async function promptGoogleOneTap(onCredential, onError) {
  {
    onError(new Error("Google sign-in is not configured."));
    return;
  }
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", "aria-hidden": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "#4285F4",
        d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "#34A853",
        d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "#FBBC05",
        d: "M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        fill: "#EA4335",
        d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      }
    )
  ] });
}
function AppleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", "aria-hidden": true, fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16.37 12.65c.02 2.5 2.19 3.33 2.22 3.34-.02.06-.34 1.17-1.13 2.31-.68.99-1.39 1.97-2.5 1.99-1.1.02-1.45-.65-2.7-.65-1.25 0-1.64.63-2.68.67-1.08.04-1.9-1.07-2.58-2.05-1.4-2.02-2.47-5.71-1.03-8.21.71-1.24 1.99-2.03 3.37-2.05 1.06-.02 2.07.71 2.72.71.65 0 1.87-.88 3.16-.75.54.02 2.06.22 3.03 1.65-.08.05-1.81 1.06-1.79 3.16zM14.39 4.77c.58-.7.97-1.67.86-2.64-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.62-.89 2.56.93.07 1.88-.47 2.47-1.17z" }) });
}
function SignupDialog({
  open,
  onOpenChange
}) {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [sent, setSent] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = reactExports.useState(false);
  const [googleButtonReady, setGoogleButtonReady] = reactExports.useState(false);
  const [googleButtonFailed, setGoogleButtonFailed] = reactExports.useState(false);
  const googleButtonRef = reactExports.useRef(null);
  const normalizedEmail = email.trim();
  const canSubmit = isValidEmail(normalizedEmail) && !isSubmitting;
  async function handleGoogleCredential(idToken) {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const response = await googleLogin(idToken);
      saveAuthSession(response.data);
      toast.success("You're signed in.");
      onOpenChange(false);
      void navigate({ to: "/", replace: true });
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Unable to sign in with Google.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  }
  reactExports.useEffect(() => {
    if (!open) {
      setGoogleButtonReady(false);
      setGoogleButtonFailed(false);
      setIsGoogleLoading(false);
      clearGooglePromptTimeout();
      return;
    }
    return;
  }, [open]);
  const googlePromptTimeout = reactExports.useRef(null);
  function clearGooglePromptTimeout() {
    if (googlePromptTimeout.current) {
      clearTimeout(googlePromptTimeout.current);
      googlePromptTimeout.current = null;
    }
  }
  function handleGoogleFallbackClick() {
    setIsGoogleLoading(true);
    clearGooglePromptTimeout();
    googlePromptTimeout.current = setTimeout(() => {
      setIsGoogleLoading(false);
    }, 6e4);
    void promptGoogleOneTap(
      (idToken) => {
        clearGooglePromptTimeout();
        void handleGoogleCredential(idToken);
      },
      (promptError) => {
        clearGooglePromptTimeout();
        setIsGoogleLoading(false);
        toast.error(promptError.message);
      }
    );
  }
  reactExports.useEffect(() => clearGooglePromptTimeout, []);
  async function handleMagicLink(e) {
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
      const message = requestError instanceof Error ? requestError.message : "Unable to send magic link.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  function handleProvider(name) {
    toast(`Continue with ${name}`, { description: "Demo only" });
  }
  const googleConfigured = Boolean(GOOGLE_CLIENT_ID);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      showCloseButton: false,
      onInteractOutside: (event) => event.preventDefault(),
      className: "max-w-[460px] rounded-[28px] p-10 border-none shadow-2xl",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex h-16 w-16 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/transparent-logo.png", alt: "", className: "h-16 w-16 object-contain" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[28px] font-bold text-foreground leading-tight mb-6", children: "Welcome to EpicPost" })
        ] }),
        sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-[15px] text-foreground bg-secondary rounded-[16px] p-4 mb-2", children: [
          "We sent a magic link to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: normalizedEmail }),
          ". Open it on this device to continue."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleMagicLink, className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-foreground", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              required: true,
              value: email,
              onChange: (e) => {
                setEmail(e.target.value);
                setError(null);
                setSent(false);
              },
              placeholder: "you@example.com",
              "aria-invalid": Boolean(error),
              className: "h-12 rounded-[14px] border border-border bg-background px-4 text-[15px] text-foreground outline-none focus:border-foreground transition"
            }
          ),
          error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: error }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: !canSubmit,
              className: "h-12 rounded-[14px] bg-[#e60023] hover:bg-[#ad081b] transition text-white font-semibold text-[15px]",
              children: isSubmitting ? "Sending" : "Send magic link"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 my-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-muted-foreground", children: "OR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
          googleConfigured ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-12", children: [
            googleButtonReady && !googleButtonFailed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-[14px] bg-secondary text-[15px] font-semibold text-foreground",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
                  "Continue with Google"
                ]
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                ref: googleButtonRef,
                className: "absolute inset-0 flex items-center justify-center opacity-0 [color-scheme:light]",
                hidden: !googleButtonReady || googleButtonFailed || isGoogleLoading
              }
            ),
            !googleButtonReady || googleButtonFailed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handleGoogleFallbackClick,
                disabled: isGoogleLoading,
                className: "h-12 w-full rounded-[14px] bg-secondary hover:bg-accent transition flex items-center justify-center gap-3 text-[15px] font-semibold text-foreground disabled:opacity-70",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
                  isGoogleLoading ? "Signing in" : "Continue with Google"
                ]
              }
            ) : null,
            isGoogleLoading && !googleButtonFailed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center gap-3 rounded-[14px] bg-secondary text-[15px] font-semibold text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
              "Signing in"
            ] }) : null
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleProvider("Google"),
              className: "h-12 w-full rounded-[14px] bg-secondary hover:bg-accent transition flex items-center justify-center gap-3 text-[15px] font-semibold text-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
                "Continue with Google"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleProvider("Apple"),
              className: "h-12 rounded-[14px] bg-foreground hover:bg-foreground/90 transition flex items-center justify-center gap-3 text-[15px] font-semibold text-background",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AppleIcon, {}),
                "Continue with Apple"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center mt-6 px-2 leading-relaxed", children: [
          "By continuing, you agree to EpicPost's",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-semibold underline", href: "#", children: "Terms of Service" }),
          " ",
          "and acknowledge you've read our",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-semibold underline", href: "#", children: "Privacy Policy" }),
          "."
        ] })
      ]
    }
  ) });
}
function getApiErrorMessage(payload) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(". ");
  }
  return null;
}
function isTokenExpiredError(payload) {
  return payload.error?.code === "TOKEN_EXPIRED";
}
function normalizeItem(raw) {
  return {
    id: String(raw.id),
    label: raw.query,
    thumb: raw.img_preview ?? ""
  };
}
const searchMenuQueryKey = ["search", "menu"];
const SEARCH_MENU_CACHE_KEY = "epicpost.search-menu";
function readCachedSearchMenu() {
  if (typeof window === "undefined") return void 0;
  try {
    const raw = window.localStorage.getItem(SEARCH_MENU_CACHE_KEY);
    if (!raw) return void 0;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.sections)) return void 0;
    return parsed;
  } catch {
    return void 0;
  }
}
function writeCachedSearchMenu(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEARCH_MENU_CACHE_KEY, JSON.stringify(data));
  } catch {
  }
}
function clearCachedSearchMenu() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEARCH_MENU_CACHE_KEY);
}
async function fetchSearchMenu() {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to see search suggestions.");
  }
  const response = await fetch(new URL("/api/v1/search/menu", API_BASE_URL), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(
      getApiErrorMessage(payload) ?? `Search menu request failed with ${response.status}`
    );
  }
  const data = payload.data ?? {};
  const result = {
    sections: [
      {
        key: "recent",
        title: "Recent searches",
        deletable: true,
        items: (data.recent ?? []).map(normalizeItem)
      },
      {
        key: "ideas",
        title: "Ideas for you",
        deletable: false,
        items: (data.ideas ?? []).map(normalizeItem)
      },
      {
        key: "popular",
        title: "Popular on EpicPost",
        deletable: false,
        items: (data.popular ?? []).map(normalizeItem)
      }
    ].filter((section) => section.items.length > 0)
  };
  writeCachedSearchMenu(result);
  return result;
}
async function prefetchSearchMenu() {
  if (!hasAuthSession()) return void 0;
  try {
    return await fetchSearchMenu();
  } catch {
    return void 0;
  }
}
async function recordSearch(query, imgPreview) {
  const token = getAccessToken();
  if (!token) return;
  const response = await fetch(new URL("/api/v1/search/recent", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, img_preview: imgPreview ?? null })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(
      getApiErrorMessage(payload) ?? `Record search request failed with ${response.status}`
    );
  }
}
async function deleteSearchHistoryItem(id) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to manage your search history.");
  }
  const response = await fetch(
    new URL(`/api/v1/search/recent/${encodeURIComponent(id)}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(
      getApiErrorMessage(payload) ?? `Delete search history request failed with ${response.status}`
    );
  }
}
const Toaster = ({ className, style, ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: `toaster group [--toast-center-offset:0px] md:[--toast-center-offset:36px] ${className ?? ""}`,
      style: {
        ...style,
        left: "calc(50% + var(--toast-center-offset))",
        transform: "translateX(-50%)"
      },
      icons: {
        success: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
        error: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5" }),
        info: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-5 w-5" })
      },
      toastOptions: {
        unstyled: true,
        classNames: {
          toast: "group toast flex items-center gap-3 rounded-[18px] border-0 bg-[#2d2c2a] px-5 py-4 text-white shadow-[0_12px_36px_rgba(0,0,0,0.28)]",
          title: "text-[17px] font-semibold leading-tight text-white",
          description: "text-white/80",
          icon: "text-white",
          actionButton: "rounded-[14px] bg-white px-4 py-2 font-semibold text-black hover:bg-white/90",
          cancelButton: "rounded-[14px] bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/styles-CquKLrLq.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$9 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      },
      { title: "EpicPost — Remixable Social Media Templates" },
      {
        name: "description",
        content: "Discover curated social media templates, remix them with your own assets, and create daily posts, reels, stories, and visuals faster with AI."
      },
      { property: "og:title", content: "EpicPost — Remixable Social Media Templates" },
      {
        property: "og:description",
        content: "Discover curated social media templates, remix them with your own assets, and create daily posts, reels, stories, and visuals faster with AI."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "icon",
        href: "/favicons/favicon.ico",
        sizes: "any"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicons/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicons/favicon-16x16.png"
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicons/apple-touch-icon.png"
      },
      {
        rel: "manifest",
        href: "/favicons/site.webmanifest"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "script",
        {
          async: true,
          defer: true,
          src: "https://www.faurya.com/js/script.js",
          "data-domain": "epicpost.app",
          "data-website-id": "cmq5fw4410009jv04de28dq54"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$9.useRouteContext();
  const [authOpen, setAuthOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const openAuthDialog = () => setAuthOpen(true);
    window.addEventListener(AUTH_REQUIRED_EVENT, openAuthDialog);
    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, openAuthDialog);
    };
  }, []);
  reactExports.useEffect(() => {
    const cached = readCachedSearchMenu();
    if (cached) {
      queryClient.setQueryData(searchMenuQueryKey, cached, { updatedAt: 0 });
    }
    void prefetchSearchMenu().then((fresh) => {
      if (fresh) {
        queryClient.setQueryData(searchMenuQueryKey, fresh);
      }
    });
  }, [queryClient]);
  reactExports.useEffect(() => {
    const handleSessionChange = () => {
      if (!hasAuthSession()) {
        clearCachedSearchMenu();
        queryClient.removeQueries({ queryKey: searchMenuQueryKey });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["post-templates"] });
      void queryClient.invalidateQueries({ queryKey: ["boards"] });
      void queryClient.invalidateQueries({ queryKey: ["remixes"] });
      void queryClient.invalidateQueries({ queryKey: ["board-feed-categories"] });
      void queryClient.invalidateQueries({ queryKey: searchMenuQueryKey });
    };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, [queryClient]);
  reactExports.useEffect(() => {
    const RELOAD_KEY = "epicpost-chunk-reload";
    const handlePreloadError = (event) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignupDialog, { open: authOpen, onOpenChange: setAuthOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center" })
  ] });
}
const $$splitComponentImporter$8 = () => import("./settings-EBAMcXur.mjs");
const Route$8 = createFileRoute("/settings")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./remixes-D0A_jTID.mjs");
const Route$7 = createFileRoute("/remixes")({
  head: () => ({
    meta: [{
      title: "Your saved ideas — Remixes"
    }, {
      name: "description",
      content: "Browse and download your generated remixes."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./likes-InlhvFfJ.mjs");
const Route$6 = createFileRoute("/likes")({
  head: () => ({
    meta: [{
      title: "Your saved ideas — Likes"
    }, {
      name: "description",
      content: "Browse the templates you liked."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./brand-kit-Dm590F0O.mjs");
const Route$5 = createFileRoute("/brand-kit")({
  head: () => ({
    meta: [{
      title: "Brand Kit"
    }, {
      name: "description",
      content: "Set up your brand DNA so every generation stays on-brand."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./boards-DxolmdWS.mjs");
const Route$4 = createFileRoute("/boards")({
  head: () => ({
    meta: [{
      title: "Your saved ideas — Boards"
    }, {
      name: "description",
      content: "Browse your saved boards and collections."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index-CqMo_SQs.mjs");
const Route$3 = createFileRoute("/")({
  validateSearch: (search) => {
    const result = {};
    if (typeof search.search === "string" && search.search.trim()) {
      result.search = search.search;
    }
    if (typeof search.board === "string" && search.board.trim()) {
      result.board = search.board;
    }
    return result;
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./template._pinId-oojlJuZy.mjs");
const APP_BASE_URL = "https://www.epicpost.app";
const DEFAULT_SHARE_TITLE = "EpicPost — Remixable Social Media Templates";
const DEFAULT_SHARE_DESCRIPTION = "Discover curated social media templates, remix them with your own assets, and create daily posts, reels, stories, and visuals faster with AI.";
function absoluteUrl(value) {
  try {
    return new URL(value, APP_BASE_URL).toString();
  } catch {
    return value;
  }
}
function getTemplateShareMeta(template, pinId) {
  const media = template ? getTemplateMedia(template) : null;
  const title = template?.title ? `${template.title} | EpicPost` : DEFAULT_SHARE_TITLE;
  const description = template?.description || template?.title || DEFAULT_SHARE_DESCRIPTION;
  const url = absoluteUrl(`/template/${pinId}`);
  const imageUrl = media?.type === "image" && media.url ? absoluteUrl(media.url) : null;
  return {
    title,
    description,
    url,
    imageUrl,
    imageWidth: media?.width,
    imageHeight: media?.height
  };
}
function templateShareMetaTags(template, pinId) {
  const meta = getTemplateShareMeta(template, pinId);
  const tags = [{
    title: meta.title
  }, {
    name: "description",
    content: meta.description
  }, {
    property: "og:title",
    content: meta.title
  }, {
    property: "og:description",
    content: meta.description
  }, {
    property: "og:type",
    content: "article"
  }, {
    property: "og:url",
    content: meta.url
  }, {
    name: "twitter:card",
    content: meta.imageUrl ? "summary_large_image" : "summary"
  }, {
    name: "twitter:title",
    content: meta.title
  }, {
    name: "twitter:description",
    content: meta.description
  }];
  if (meta.imageUrl) {
    tags.push({
      property: "og:image",
      content: meta.imageUrl
    }, {
      property: "og:image:secure_url",
      content: meta.imageUrl
    }, {
      property: "og:image:alt",
      content: meta.title
    }, {
      name: "twitter:image",
      content: meta.imageUrl
    }, {
      name: "twitter:image:alt",
      content: meta.title
    });
    if (meta.imageWidth) {
      tags.push({
        property: "og:image:width",
        content: String(meta.imageWidth)
      });
    }
    if (meta.imageHeight) {
      tags.push({
        property: "og:image:height",
        content: String(meta.imageHeight)
      });
    }
  }
  return tags;
}
const Route$2 = createFileRoute("/template/$pinId")({
  loader: async ({
    params
  }) => fetchPostTemplate(params.pinId).catch(() => null),
  head: ({
    loaderData,
    params
  }) => ({
    meta: templateShareMetaTags(loaderData ?? null, params.pinId),
    links: [{
      rel: "canonical",
      href: absoluteUrl(`/template/${params.pinId}`)
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./editor._templateId-aCbno0f3.mjs");
const Route$1 = createFileRoute("/editor/$templateId")({
  validateSearch: (search) => ({
    caption: typeof search.caption === "string" ? search.caption : void 0
  }),
  head: () => ({
    meta: [{
      title: "Edit creative — EpicPost"
    }, {
      name: "description",
      content: "Fine-tune your remixed creative before you download it."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./confirm-PBT8sB39.mjs");
const Route = createFileRoute("/auth/magic-link/confirm")({
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : void 0,
    email: typeof search.email === "string" ? search.email : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SettingsRoute = Route$8.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$9
});
const RemixesRoute = Route$7.update({
  id: "/remixes",
  path: "/remixes",
  getParentRoute: () => Route$9
});
const LikesRoute = Route$6.update({
  id: "/likes",
  path: "/likes",
  getParentRoute: () => Route$9
});
const BrandKitRoute = Route$5.update({
  id: "/brand-kit",
  path: "/brand-kit",
  getParentRoute: () => Route$9
});
const BoardsRoute = Route$4.update({
  id: "/boards",
  path: "/boards",
  getParentRoute: () => Route$9
});
const IndexRoute = Route$3.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$9
});
const TemplatePinIdRoute = Route$2.update({
  id: "/template/$pinId",
  path: "/template/$pinId",
  getParentRoute: () => Route$9
});
const EditorTemplateIdRoute = Route$1.update({
  id: "/editor/$templateId",
  path: "/editor/$templateId",
  getParentRoute: () => Route$9
});
const AuthMagicLinkConfirmRoute = Route.update({
  id: "/auth/magic-link/confirm",
  path: "/auth/magic-link/confirm",
  getParentRoute: () => Route$9
});
const rootRouteChildren = {
  IndexRoute,
  BoardsRoute,
  BrandKitRoute,
  LikesRoute,
  RemixesRoute,
  SettingsRoute,
  EditorTemplateIdRoute,
  TemplatePinIdRoute,
  AuthMagicLinkConfirmRoute
};
const routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  API_BASE_URL as A,
  Route as B,
  confirmMagicLink as C,
  Dialog as D,
  saveAuthSession as E,
  router as F,
  Route$3 as R,
  SignupDialog as S,
  DialogContent as a,
  DialogHeader as b,
  cn as c,
  DialogTitle as d,
  DialogDescription as e,
  DialogFooter as f,
  getAccessToken as g,
  expireAuthSession as h,
  getAuthUser as i,
  getTemplateMedia as j,
  AUTH_SESSION_CHANGED_EVENT as k,
  hasAuthSession as l,
  fetchPostTemplates as m,
  recordSearch as n,
  Route$2 as o,
  postTemplatesQueryKey as p,
  postTemplateQueryKey as q,
  requestAuthDialog as r,
  searchMenuQueryKey as s,
  fetchPostTemplate as t,
  updateAuthUser as u,
  readCachedSearchMenu as v,
  fetchSearchMenu as w,
  deleteSearchHistoryItem as x,
  clearAuthSession as y,
  Route$1 as z
};

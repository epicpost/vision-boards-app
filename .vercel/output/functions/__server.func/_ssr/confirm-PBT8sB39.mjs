import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Route, C as confirmMagicLink, E as saveAuthSession } from "./router-Bd-4THC9.mjs";
import "../_libs/sonner.mjs";
import { k as LoaderCircle, a as CircleCheck, C as CircleX } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function MagicLinkConfirm() {
  const navigate = useNavigate();
  const {
    token,
    email
  } = Route.useSearch();
  const [status, setStatus] = reactExports.useState("loading");
  const [message, setMessage] = reactExports.useState("Confirming your magic link...");
  const hasConfirmed = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;
    if (!token || !email) {
      setStatus("error");
      setMessage("This magic link is missing required confirmation details.");
      return;
    }
    void confirmMagicLink(token, email).then((response) => {
      saveAuthSession(response.data);
      setStatus("success");
      setMessage("You're signed in. Redirecting...");
      window.setTimeout(() => {
        void navigate({
          to: "/",
          replace: true
        });
      }, 900);
    }).catch((error) => {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "This magic link could not be used.");
    });
  }, [email, navigate, token]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary", children: status === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-7 w-7 animate-spin text-foreground" }) : status === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-7 w-7 text-[oklch(0.55_0.16_145)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-7 w-7 text-destructive" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-2xl font-bold text-foreground", children: status === "error" ? "Magic link failed" : "Welcome to EpicPost" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: message }),
    status === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-95", children: "Back to EpicPost" }) }) : null
  ] }) });
}
export {
  MagicLinkConfirm as component
};

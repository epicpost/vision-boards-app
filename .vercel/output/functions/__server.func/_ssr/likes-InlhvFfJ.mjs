import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav } from "./MobileNav-JTGfX7W-.mjs";
import { T as TemplateCard } from "./TemplateCard-DEpu7ADN.mjs";
import { f as fetchLikedTemplates, l as likedTemplatesQueryKey } from "./likes-BR5Zeahr.mjs";
import { g as getAccessToken, j as getTemplateMedia } from "./router-Bd-4THC9.mjs";
import "../_libs/sonner.mjs";
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
import "./dropdown-menu-CqiGz96I.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function templateToPin(template, index) {
  const media = getTemplateMedia(template);
  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + index % 4 * 40,
    title: template.title,
    isSaved: template.is_saved
  };
}
function LikesGrid() {
  const likesQuery = useQuery({
    queryKey: likedTemplatesQueryKey(),
    queryFn: () => fetchLikedTemplates(),
    enabled: Boolean(getAccessToken())
  });
  const liked = likesQuery.data?.data ?? [];
  if (likesQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 gap-3 [column-fill:_balance] sm:columns-3 md:columns-4 lg:columns-5", children: Array.from({
      length: 10
    }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 break-inside-avoid animate-pulse rounded-[16px] bg-secondary", style: {
      height: 260 + index % 4 * 40
    } }, index)) });
  }
  if (likesQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "Likes did not load" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: likesQuery.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void likesQuery.refetch(), className: "mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90", children: "Try again" })
    ] });
  }
  if (!liked.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[260px] flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground", children: "No likes yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Tap the heart on a template to find it here later." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "columns-2 gap-3 [column-fill:_balance] sm:columns-3 md:columns-4 lg:columns-5", children: liked.map((template, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateCard, { pin: templateToPin(template, index) }, template.id)) });
}
function LikesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-16 md:pl-[72px] md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { showTabs: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-[1600px] px-4 pb-12 pt-2 md:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex items-start justify-between gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight text-foreground", children: "Likes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mb-6 flex items-center justify-between gap-6 border-b border-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/remixes", className: "pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground", children: "Remixes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/boards", className: "pb-2 text-[17px] font-semibold text-foreground/80 transition hover:text-foreground", children: "Boards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/likes", className: "border-b-[2px] border-foreground pb-2 text-[17px] font-semibold text-foreground transition", children: "Likes" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LikesGrid, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {})
  ] });
}
export {
  LikesPage as component
};

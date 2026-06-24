import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Sidebar, T as TopBar, M as MobileNav } from "./MobileNav-JTGfX7W-.mjs";
import { i as getAuthUser, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter, u as updateAuthUser, c as cn, A as API_BASE_URL, g as getAccessToken, r as requestAuthDialog, h as expireAuthSession } from "./router-Bd-4THC9.mjs";
import { S as Slider$1, a as SliderTrack, b as SliderRange, c as SliderThumb } from "../_libs/radix-ui__react-slider.mjs";
import "../_libs/sonner.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/tanstack__react-query.mjs";
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
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Slider$1,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SliderTrack, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRange, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Slider$1.displayName;
const VIEWPORT = 288;
const OUTPUT = 512;
const MAX_ZOOM = 3;
function AvatarCropDialog({ file, onClose, onCropped }) {
  const [src, setSrc] = reactExports.useState(null);
  const [img, setImg] = reactExports.useState(null);
  const [baseScale, setBaseScale] = reactExports.useState(1);
  const [zoom, setZoom] = reactExports.useState(1);
  const [pos, setPos] = reactExports.useState({ x: 0, y: 0 });
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const dragRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!file) {
      setSrc(null);
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setError(null);
    const image = new Image();
    image.onload = () => {
      const cover = Math.max(VIEWPORT / image.naturalWidth, VIEWPORT / image.naturalHeight);
      setImg(image);
      setBaseScale(cover);
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    image.onerror = () => setError("That image could not be loaded.");
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: pos };
  };
  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    setPos({
      x: drag.origin.x + (e.clientX - drag.startX),
      y: drag.origin.y + (e.clientY - drag.startY)
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const handleSave = reactExports.useCallback(async () => {
    if (!img) return;
    setSaving(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");
      const f = OUTPUT / VIEWPORT;
      const dispW = img.naturalWidth * baseScale;
      const dispH = img.naturalHeight * baseScale;
      ctx.translate(OUTPUT / 2 + pos.x * f, OUTPUT / 2 + pos.y * f);
      ctx.scale(zoom * f, zoom * f);
      ctx.drawImage(img, -dispW / 2, -dispH / 2, dispW, dispH);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not process the image.");
      await onCropped(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [img, baseScale, zoom, pos, onCropped]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(file), onOpenChange: (open) => !open && !saving && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Crop your photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Drag to reposition and zoom to frame your avatar." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative overflow-hidden rounded-lg bg-muted touch-none select-none",
          style: { width: VIEWPORT, height: VIEWPORT },
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
          children: [
            src && img ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src,
                alt: "",
                draggable: false,
                className: "absolute inset-0 m-auto max-w-none cursor-grab active:cursor-grabbing",
                style: {
                  width: img.naturalWidth * baseScale,
                  height: img.naturalHeight * baseScale,
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                  transformOrigin: "center"
                }
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Zoom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            min: 1,
            max: MAX_ZOOM,
            step: 0.01,
            value: [zoom],
            onValueChange: ([v]) => setZoom(v),
            className: "flex-1"
          }
        )
      ] }),
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          disabled: saving,
          className: "h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground hover:bg-accent disabled:opacity-50",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleSave,
          disabled: saving || !img,
          className: "h-11 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50",
          children: saving ? "Saving…" : "Save photo"
        }
      )
    ] })
  ] }) });
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
function requireToken(action) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error(`Sign in to ${action}.`);
  }
  return token;
}
async function throwApiError(response, fallback) {
  const payload = await response.json().catch(() => ({}));
  if (payload.error?.code === "TOKEN_EXPIRED") {
    expireAuthSession();
  }
  throw new Error(getApiErrorMessage(payload) ?? fallback);
}
async function updateMyProfile(input) {
  const token = requireToken("update your profile");
  const response = await fetch(new URL("/api/v1/me/profile", API_BASE_URL), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });
  if (!response.ok) await throwApiError(response, "Failed to update your profile.");
  const payload = await response.json();
  return payload.data;
}
async function uploadAvatar(blob) {
  const token = requireToken("change your photo");
  const form = new FormData();
  form.append("file", blob, "avatar.png");
  const response = await fetch(new URL("/api/v1/me/avatar", API_BASE_URL), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!response.ok) await throwApiError(response, "Failed to upload your photo.");
  const payload = await response.json();
  return payload.data;
}
const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
const sections = ["Edit profile", "Account management", "Profile visibility", "Refine your recommendations", "Link to Pinterest", "Social permissions", "Notifications", "Privacy and data", "Security", "Branded Content"];
function SettingsPage() {
  const [active, setActive] = reactExports.useState("Edit profile");
  const user = getAuthUser();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:pl-[72px] pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopBar, { showTabs: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8 md:flex-row md:gap-16 md:py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "md:w-64 md:shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-2", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActive(s), className: `block w-full text-left text-[17px] font-bold leading-snug transition ${active === s ? "text-foreground border-b-2 border-foreground pb-1 inline-block w-auto" : "text-foreground/80 hover:text-foreground"}`, children: s }) }, s)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "flex-1 max-w-2xl", children: active === "Edit profile" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditProfileForm, { user }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-foreground", children: active }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base text-muted-foreground", children: "This section is coming soon." })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNav, {})
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block rounded-[16px] border border-border px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-semibold text-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children })
  ] });
}
function EditProfileForm({
  user
}) {
  const [firstName, setFirstName] = reactExports.useState(user?.first_name ?? "");
  const [lastName, setLastName] = reactExports.useState(user?.last_name ?? "");
  const [about, setAbout] = reactExports.useState("");
  const [pronouns, setPronouns] = reactExports.useState("");
  const [website, setWebsite] = reactExports.useState("");
  const [avatarUrl, setAvatarUrl] = reactExports.useState(user?.avatar_url ?? null);
  const [cropFile, setCropFile] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [status, setStatus] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const initial = (firstName || user?.username || "U").charAt(0).toUpperCase();
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({
        type: "error",
        message: "Please choose an image file."
      });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setStatus({
        type: "error",
        message: "Image must be 10 MB or smaller."
      });
      return;
    }
    setStatus(null);
    setCropFile(file);
  };
  const handleCropped = async (blob) => {
    const profile = await uploadAvatar(blob);
    setAvatarUrl(profile.avatar_url ?? null);
    updateAuthUser({
      avatar_url: profile.avatar_url
    });
    setCropFile(null);
    setStatus({
      type: "success",
      message: "Photo updated."
    });
  };
  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const profile = await updateMyProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        about: about.trim() || null
      });
      updateAuthUser({
        first_name: profile.first_name,
        last_name: profile.last_name
      });
      setStatus({
        type: "success",
        message: "Profile saved."
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save."
      });
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-foreground", children: "Edit profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-base text-muted-foreground", children: "Keep your personal details private. Information you add here is visible to anyone who can view your profile." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-foreground", children: "Photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 text-2xl font-bold text-foreground", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full rounded-full object-cover" }) : initial }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleFilePicked }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "h-10 rounded-full bg-secondary px-4 text-[15px] font-semibold text-foreground hover:bg-accent", children: "Change" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarCropDialog, { file: cropFile, onClose: () => setCropFile(null), onCropped: handleCropped }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "First name", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: firstName, onChange: (e) => setFirstName(e.target.value), className: "w-full bg-transparent text-base text-foreground outline-none" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Last name", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: lastName, onChange: (e) => setLastName(e.target.value), className: "w-full bg-transparent text-base text-foreground outline-none" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "About", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: about, onChange: (e) => setAbout(e.target.value), placeholder: "Tell your story", rows: 3, className: "w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Pronouns", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: pronouns, onChange: (e) => setPronouns(e.target.value), placeholder: "Add your pronouns", className: "w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Choose up to 2 sets of pronouns to appear on your profile so others know how to refer to you. You can edit or remove these any time." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Website", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: website, onChange: (e) => setWebsite(e.target.value), placeholder: "Add a link", className: "w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 mt-10 -mx-6 flex items-center justify-end gap-3 border-t border-border bg-background px-6 py-4", children: [
      status ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mr-auto text-sm font-medium ${status.type === "error" ? "text-destructive" : "text-muted-foreground"}`, children: status.message }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSave, disabled: saving, className: "h-11 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50", children: saving ? "Saving…" : "Save" })
    ] })
  ] });
}
export {
  SettingsPage as component
};

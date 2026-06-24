import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as cn, A as API_BASE_URL, g as getAccessToken, r as requestAuthDialog, h as expireAuthSession } from "./router-Bd-4THC9.mjs";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const MAX_BRAND_IMAGES = 15;
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
function validateBrandImageQuota(imageAssetIds) {
  if (imageAssetIds && imageAssetIds.length > MAX_BRAND_IMAGES) {
    throw new Error(`You can attach up to ${MAX_BRAND_IMAGES} brand images.`);
  }
}
async function throwApiError(response, fallback) {
  const payload = await response.json().catch(() => ({}));
  if (payload.error?.code === "TOKEN_EXPIRED") {
    expireAuthSession();
  }
  throw new Error(getApiErrorMessage(payload) ?? `${fallback} failed with ${response.status}`);
}
const COLOR_TYPES = ["primary", "secondary", "accent", "background", "text"];
const COLOR_TYPE_LABELS = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  text: "Text"
};
function paletteToColors(palette) {
  const colors = {};
  for (const { type, hex } of palette) {
    const value = hex.trim();
    if (value) colors[type] = value;
  }
  return colors;
}
function colorsToPalette(colors) {
  if (!colors) return [];
  const palette = [];
  for (const type of COLOR_TYPES) {
    if (colors[type]) palette.push({ type, hex: colors[type] });
  }
  return palette;
}
const brandKitsQueryKey = () => ["brand-kits"];
async function fetchBrandKits() {
  const token = requireToken("view your brand kits");
  const url = new URL("/api/v1/me/brand-profiles", API_BASE_URL);
  url.searchParams.set("limit", "50");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    await throwApiError(response, "Brand kits request");
  }
  const payload = await response.json();
  return payload.data;
}
async function createBrandKit(input) {
  const token = requireToken("create a brand kit");
  validateBrandImageQuota(input.image_asset_ids);
  const response = await fetch(new URL("/api/v1/me/brand-profiles", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    await throwApiError(response, "Create brand kit");
  }
  const payload = await response.json();
  return payload.data;
}
async function updateBrandKit(id, input) {
  const token = requireToken("update your brand kit");
  validateBrandImageQuota(input.image_asset_ids);
  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}`, API_BASE_URL), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    await throwApiError(response, "Update brand kit");
  }
  const payload = await response.json();
  return payload.data;
}
async function deleteBrandKit(id) {
  const token = requireToken("delete a brand kit");
  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}`, API_BASE_URL), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    await throwApiError(response, "Delete brand kit");
  }
}
async function uploadBrandLogo(id, file) {
  const token = requireToken("upload a logo");
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}/logo`, API_BASE_URL), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  if (!response.ok) {
    await throwApiError(response, "Logo upload");
  }
  const payload = await response.json();
  return payload.data;
}
async function removeBrandLogo(id) {
  const token = requireToken("remove the logo");
  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}/logo`, API_BASE_URL), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    await throwApiError(response, "Remove logo");
  }
  const payload = await response.json();
  return payload.data;
}
async function uploadBrandImage(id, file, existingImageCount = 0) {
  const token = requireToken("upload an image");
  if (existingImageCount >= MAX_BRAND_IMAGES) {
    throw new Error(`You've reached your max images quota of ${MAX_BRAND_IMAGES}.`);
  }
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(new URL(`/api/v1/me/brand-profiles/${id}/images`, API_BASE_URL), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  if (!response.ok) {
    await throwApiError(response, "Image upload");
  }
  const payload = await response.json();
  return payload.data;
}
async function removeBrandImage(id, assetId) {
  const token = requireToken("remove an image");
  const response = await fetch(
    new URL(`/api/v1/me/brand-profiles/${id}/images/${assetId}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!response.ok) {
    await throwApiError(response, "Remove image");
  }
  const payload = await response.json();
  return payload.data;
}
export {
  Button as B,
  COLOR_TYPES as C,
  MAX_BRAND_IMAGES as M,
  buttonVariants as a,
  brandKitsQueryKey as b,
  colorsToPalette as c,
  createBrandKit as d,
  uploadBrandLogo as e,
  COLOR_TYPE_LABELS as f,
  uploadBrandImage as g,
  removeBrandImage as h,
  deleteBrandKit as i,
  fetchBrandKits as j,
  paletteToColors as p,
  removeBrandLogo as r,
  updateBrandKit as u
};

import { createServerFn } from "@tanstack/react-start";
import { API_BASE_URL } from "@/lib/post-templates";

// Same-origin image proxy for the creative editor.
//
// Persisted remix images live on the API/CDN (a different origin than the
// web-app). Loading them straight into an <img> for canvas export taints the
// canvas (`crossOrigin="anonymous"` only helps when the host returns CORS
// headers, which our S3 assets don't). To keep `exportCreative` clean, this
// server function fetches the bytes server-side — from the web-app's own origin
// — and hands the browser a `data:` URL, which is always canvas-safe.
//
// Implemented with `createServerFn` (the same primitive `editor-drafts.ts`
// uses); this Start build doesn't expose file-based server routes.

const MAX_BYTES = 20 * 1024 * 1024;

// Only proxy hosts we control, so this can't be turned into an open SSRF proxy.
// Defaults to the API host plus the epicpost.app apex/subdomains; extend with a
// comma-separated VITE_IMAGE_PROXY_HOSTS (e.g. a raw S3/CloudFront host).
function isAllowedHost(host: string): boolean {
  const allowed = new Set<string>();
  try {
    allowed.add(new URL(API_BASE_URL).host);
  } catch {
    // API_BASE_URL is always a valid URL in practice; ignore if not.
  }
  const extra = import.meta.env.VITE_IMAGE_PROXY_HOSTS as string | undefined;
  if (extra) {
    extra
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => allowed.add(entry));
  }
  if (allowed.has(host)) return true;
  return host === "epicpost.app" || host.endsWith(".epicpost.app");
}

export const fetchImageAsDataUrl = createServerFn({ method: "GET" })
  .validator((data: { url: string }) => {
    if (typeof data?.url !== "string" || !data.url) {
      throw new Error("url is required");
    }
    return { url: data.url };
  })
  .handler(async ({ data }): Promise<string> => {
    let parsed: URL;
    try {
      parsed = new URL(data.url);
    } catch {
      throw new Error("Invalid image url");
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Unsupported image protocol");
    }
    if (!isAllowedHost(parsed.host)) {
      throw new Error("Image host is not allowed");
    }

    const response = await fetch(parsed.toString());
    if (!response.ok) {
      throw new Error(`Upstream image responded ${response.status}`);
    }
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      throw new Error("Upstream resource is not an image");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
      throw new Error("Image is too large to proxy");
    }
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  });

// Returns a canvas-clean src for any image the editor renders/exports.
// `data:`, `blob:`, and same-origin/relative URLs are already safe and pass
// through untouched; cross-origin http(s) URLs are resolved to a `data:` URL via
// the proxy. On any failure it falls back to the original URL (the preview still
// shows; only a later export of that specific image could taint), so this is
// never worse than not proxying.
export async function resolveCleanImageSrc(src: string): Promise<string> {
  if (!src || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/")) {
    return src;
  }
  let parsed: URL;
  try {
    parsed = new URL(src, typeof window !== "undefined" ? window.location.href : undefined);
  } catch {
    return src;
  }
  if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
    return src;
  }
  try {
    return await fetchImageAsDataUrl({ data: { url: parsed.toString() } });
  } catch {
    return src;
  }
}

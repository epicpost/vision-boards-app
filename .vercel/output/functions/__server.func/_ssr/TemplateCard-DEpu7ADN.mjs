import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { V as Video, l as Upload } from "../_libs/lucide-react.mjs";
function isValidDimension(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function TemplateCard({ pin }) {
  const [detectedSize, setDetectedSize] = reactExports.useState(null);
  const width = isValidDimension(pin.width) ? pin.width : detectedSize?.width;
  const height = isValidDimension(pin.height) ? pin.height : detectedSize?.height;
  const aspectRatio = isValidDimension(width) && isValidDimension(height) ? `${width} / ${height}` : `250 / ${pin.fallbackHeight}`;
  const shouldDetectSize = !isValidDimension(pin.width) || !isValidDimension(pin.height);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 break-inside-avoid group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/template/$pinId",
        params: { pinId: pin.id },
        className: "relative block w-full overflow-hidden rounded-[16px] bg-secondary cursor-pointer",
        style: { aspectRatio },
        children: [
          pin.src && pin.mediaType === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              src: pin.src,
              "aria-label": pin.title ?? "Video template",
              muted: true,
              loop: true,
              playsInline: true,
              autoPlay: true,
              preload: "metadata",
              onLoadedMetadata: (event) => {
                if (!shouldDetectSize) return;
                const video = event.currentTarget;
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  setDetectedSize({ width: video.videoWidth, height: video.videoHeight });
                }
              },
              className: "h-full w-full object-contain transition"
            }
          ) : pin.src ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: pin.src,
              alt: pin.title ?? "Pin",
              loading: "lazy",
              onLoad: (event) => {
                if (!shouldDetectSize) return;
                const image = event.currentTarget;
                if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                  setDetectedSize({ width: image.naturalWidth, height: image.naturalHeight });
                }
              },
              className: "h-full w-full object-contain transition"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-muted-foreground", children: "No preview" }),
          pin.mediaType === "video" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4 text-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-[16px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `inline-flex px-4 py-2.5 text-sm font-bold text-white ${pin.isSaved ? "rounded-[14px] bg-foreground" : "rounded-full bg-primary"}`,
                children: pin.isSaved ? "Saved" : "Save"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-3 right-3 flex justify-end items-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                "aria-label": "Share",
                className: "h-9 w-9 rounded-full bg-white text-foreground flex items-center justify-center",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" })
              }
            ) })
          ] })
        ]
      }
    ),
    pin.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 pt-2 text-[13px] font-semibold text-foreground line-clamp-2", children: pin.title })
  ] });
}
export {
  TemplateCard as T
};

const EXPORT_FORMATS = {
  png: { id: "png", label: "PNG", mime: "image/png", extension: "png" },
  jpeg: { id: "jpeg", label: "JPEG", mime: "image/jpeg", extension: "jpg", quality: 0.92 },
  webp: { id: "webp", label: "WebP", mime: "image/webp", extension: "webp", quality: 0.92 }
};
const EDITOR_FONTS = [
  { id: "anton", label: "Anton", family: "'Anton', sans-serif", weight: 400 },
  { id: "archivo", label: "Archivo", family: "'Archivo Black', sans-serif", weight: 400 },
  { id: "bebas", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", weight: 600 },
  { id: "poppins", label: "Poppins", family: "'Poppins', sans-serif", weight: 600 },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", weight: 700 },
  { id: "playfair", label: "Playfair Display", family: "'Playfair Display', serif", weight: 700 }
];
function fontById(id) {
  return EDITOR_FONTS.find((font) => font.id === id) ?? EDITOR_FONTS[0];
}
function editorFontsHref() {
  const families = [
    "Anton",
    "Archivo Black",
    "Bebas Neue",
    "Oswald:wght@400;600",
    "Poppins:wght@400;600;700",
    "Montserrat:wght@400;600;700",
    "Playfair Display:wght@400;600;700"
  ].map((family) => `family=${family.trim().replace(/\s+/g, "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
function colorLuminance(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  if (full.length !== 6) return 1;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function readableTextColor(hex) {
  return colorLuminance(hex) > 0.6 ? "#141414" : "#ffffff";
}
function isLightColor(hex) {
  return colorLuminance(hex) > 0.62;
}
const TEMPLATE_28 = {
  id: "11000000-0000-0000-0000-000000000028",
  title: "City Mood Board",
  layout: "moodboard",
  aspectRatio: "9 / 16",
  background: "#0e1413",
  palette: [
    { label: "Paper", value: "#ffffff" },
    { label: "Sand", value: "#f5ecd9" },
    { label: "Coral", value: "#e8542a" },
    { label: "Sky", value: "#1f7a5e" },
    { label: "Ink", value: "#141414" }
  ],
  formats: ["png", "jpeg", "webp"],
  layers: [
    {
      id: "photo-1",
      kind: "image",
      label: "Top photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-skyline.jpg"
    },
    {
      id: "photo-2",
      kind: "image",
      label: "Middle photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/Beach Quotes.jpg"
    },
    {
      id: "photo-3",
      kind: "image",
      label: "Bottom photo",
      visible: true,
      hideable: false,
      src: "/templates/shared/barcelona-park.jpg"
    },
    {
      id: "header",
      kind: "header",
      label: "City name",
      visible: true,
      hideable: true,
      text: "Barcelona",
      color: "#ffffff",
      fontId: "anton",
      uppercase: true,
      suggestions: ["Barcelona", "Lisbon", "Tokyo", "New York", "Marrakech"]
    }
  ]
};
const TEMPLATE_205 = {
  id: "13000000-0000-0000-0000-000000000205",
  title: "Explore the Wild",
  layout: "poster",
  aspectRatio: "4 / 5",
  background: "#13303a",
  palette: [
    { label: "Amber", value: "#f2a93b" },
    { label: "Coral", value: "#ef5d4c" },
    { label: "Cream", value: "#f5ecd9" },
    { label: "Deep", value: "#13303a" },
    { label: "Paper", value: "#ffffff" }
  ],
  formats: ["png", "jpeg"],
  layers: [
    {
      id: "image",
      kind: "image",
      label: "Image",
      visible: true,
      hideable: true,
      src: "/templates/shared/Bali photo.jpg"
    },
    {
      id: "header",
      kind: "header",
      label: "Header",
      visible: true,
      hideable: true,
      text: "Explore the wild",
      color: "#f5ecd9",
      fontId: "playfair",
      uppercase: false,
      suggestions: [
        "Explore the wild",
        "Find your next escape",
        "Adventure is calling",
        "Go where the map ends"
      ]
    },
    {
      id: "description",
      kind: "description",
      label: "Description",
      visible: true,
      hideable: true,
      text: "Hand-picked escapes for the curious traveller.",
      color: "#f5ecd9",
      fontId: "montserrat",
      uppercase: false,
      suggestions: [
        "Hand-picked escapes for the curious traveller.",
        "Small groups. Big horizons.",
        "Trips designed to be remembered."
      ]
    },
    {
      id: "cta",
      kind: "cta",
      label: "Call to action",
      visible: true,
      hideable: true,
      text: "Book now",
      color: "#f2a93b",
      fontId: "montserrat",
      uppercase: false,
      suggestions: ["Book now", "Plan your trip", "See dates", "Reserve a spot"]
    },
    {
      id: "logo",
      kind: "logo",
      label: "Logo",
      visible: false,
      hideable: true,
      src: "/transparent-logo.png"
    }
  ]
};
const REMIX_EDITOR_TEMPLATES = {
  [TEMPLATE_28.id]: TEMPLATE_28,
  [TEMPLATE_205.id]: TEMPLATE_205
};
function getRemixEditorTemplate(id) {
  return REMIX_EDITOR_TEMPLATES[id] ?? null;
}
function hasRemixEditorTemplate(id) {
  return id in REMIX_EDITOR_TEMPLATES;
}
function cloneLayers(template) {
  return template.layers.map((layer) => ({ ...layer }));
}
const LAYOUT = {
  padX: 0.08,
  logo: { x: 0.08, y: 0.06, w: 0.22, h: 0.09 },
  header: { top: 0.12, size: 0.092, lineHeight: 1.06, weight: 800 },
  description: { top: 0.34, size: 0.033, lineHeight: 1.3, weight: 500 },
  cta: { top: 0.43, height: 0.07, size: 0.032, padX: 0.05, weight: 600 },
  image: { top: 0.53, bottom: 0.95 }
};
const MOODBOARD_LAYOUT = {
  title: { centerY: 0.5, size: 0.135, lineHeight: 1, weight: 800, padX: 0.04 }
};
export {
  EXPORT_FORMATS as E,
  LAYOUT as L,
  MOODBOARD_LAYOUT as M,
  EDITOR_FONTS as a,
  cloneLayers as c,
  editorFontsHref as e,
  fontById as f,
  getRemixEditorTemplate as g,
  hasRemixEditorTemplate as h,
  isLightColor as i,
  readableTextColor as r
};

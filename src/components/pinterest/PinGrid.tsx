import { PinCard, type Pin } from "./PinCard";

const seeds = [
  { s: "ocean", h: 620, t: "Aerial coastline" },
  { s: "varanasi", h: 540, t: "varanasi", a: "shivamtravels" },
  { s: "barcelona", h: 460, t: "W Hotel Barcelona" },
  { s: "appdesign", h: 500, t: "Meeting app concept", a: "design.lab" },
  { s: "cabin", h: 580, t: "A-frame in the forest" },
  { s: "gaudi", h: 540, t: "Park Güell mosaics" },
  { s: "italy", h: 600, t: "Italy travel itinerary", a: "wanderoot" },
  { s: "portrait", h: 520, t: "Editorial portrait" },
  { s: "coffee", h: 480, t: "Slow mornings", a: "ella_contentclub" },
  { s: "mountains", h: 560 },
  { s: "garden", h: 440, t: "Garden inspiration" },
  { s: "fashion", h: 620, t: "Soft tailoring" },
  { s: "interior", h: 500, t: "Warm minimal interior" },
  { s: "sunset", h: 460 },
  { s: "ceramics", h: 540, t: "Studio ceramics", a: "claystudio" },
  { s: "books", h: 420, t: "Reading nook" },
  { s: "lake", h: 600 },
  { s: "city", h: 520, t: "Night city walk" },
  { s: "flowers", h: 440 },
  { s: "skincare", h: 560, t: "Skincare flatlay" },
  { s: "desk", h: 480, t: "Workspace setup" },
  { s: "tokyo", h: 620, t: "Tokyo neon" },
  { s: "dessert", h: 460, t: "Pavlova recipe" },
  { s: "swim", h: 540 },
];

const pins: Pin[] = seeds.map((p, i) => ({
  id: String(i),
  src: `https://picsum.photos/seed/${p.s}/600/${p.h}`,
  height: p.h,
  title: p.t,
  author: p.a,
}));

export function PinGrid() {
  return (
    <div className="px-3 md:px-6 pb-10">
      <div
        className="[column-fill:_balance]"
        style={{
          columnGap: "0.75rem",
          columnCount: "var(--cols, 2)",
        }}
      >
        {pins.map((pin) => (
          <PinCard key={pin.id} pin={pin} />
        ))}
      </div>
      <style>{`
        @media (min-width: 500px) { .pin-cols { } }
      `}</style>
    </div>
  );
}

import { PinCard } from "./PinCard";
import { pins } from "./pins-data";

export function PinGrid() {
  return (
    <div className="px-3 md:px-6 pb-10">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3 [column-fill:_balance]">
        {pins.map((pin) => (
          <PinCard key={pin.id} pin={pin} />
        ))}
      </div>
    </div>
  );
}

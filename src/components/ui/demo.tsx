import { InfiniteSlider } from "@/components/ui/infinite-slider";

function InfiniteSliderHoverSpeed() {
  return (
    <InfiniteSlider durationOnHover={75} gap={24}>
      <img
        src="https://images.unsplash.com/photo-1580927752452-89d86da3fa0a"
        alt="Music album cover"
        className="aspect-square w-[120px] rounded-[4px]"
      />
      <img
        src="https://images.unsplash.com/photo-1618609378039-b572f64d12f6"
        alt="Music album cover"
        className="aspect-square w-[120px] rounded-[4px]"
      />
      <img
        src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745"
        alt="Music album cover"
        className="aspect-square w-[120px] rounded-[4px]"
      />
      <img
        src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"
        alt="Music album cover"
        className="aspect-square w-[120px] rounded-[4px]"
      />
      <img
        src="https://images.unsplash.com/photo-1496293455970-f8581aae0e3b"
        alt="Music album cover"
        className="aspect-square w-[120px] rounded-[4px]"
      />
      <img
        src="https://images.unsplash.com/photo-1503602642458-232111445657"
        alt="Music album cover"
        className="aspect-square w-[120px] rounded-[4px]"
      />
    </InfiniteSlider>
  );
}

export default {
  InfiniteSliderHoverSpeed
};

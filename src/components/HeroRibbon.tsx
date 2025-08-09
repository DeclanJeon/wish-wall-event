import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const RIBBON_IMAGES = [
  "/lovable-uploads/fd28d9f2-3fe5-41cf-bc62-e28cec04c89f.png",
  "/lovable-uploads/7466ac51-61cc-4afd-b97c-81d92057fae3.png",
  "/lovable-uploads/c7a6e239-c29d-46b6-9afb-423ac0857eac.png",
];

export default function HeroRibbon() {
  return (
    <div className="relative">
      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {RIBBON_IMAGES.map((src, i) => (
            <CarouselItem key={i} className="md:basis-1/3">
              <img src={src} alt={`리본 이미지 ${i + 1}`} className="w-full h-40 object-cover" loading="lazy" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
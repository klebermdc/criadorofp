import { useState, useCallback } from "react";
import { CarouselData, CarouselSlide } from "@/types/carousel";
import { GeneratorSidebar } from "@/components/GeneratorSidebar";
import { CarouselPreview } from "@/components/CarouselPreview";

const Index = () => {
  const [carousel, setCarousel] = useState<CarouselData | null>(null);

  const handleUpdateSlide = (index: number, field: string, value: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = { ...updated[index], [field]: value };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleUpdateSlides = useCallback((updater: (prev: CarouselData) => CarouselData) => {
    setCarousel((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <GeneratorSidebar
        onGenerated={setCarousel}
        onLoadCarousel={setCarousel}
        onUpdateSlides={handleUpdateSlides}
        currentCarousel={carousel}
      />
      <CarouselPreview
        slides={carousel?.slides || []}
        onUpdateSlide={handleUpdateSlide}
      />
    </div>
  );
};

export default Index;

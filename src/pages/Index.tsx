import { useState, useCallback } from "react";
import { CarouselData, CarouselSlide, TextStyle } from "@/types/carousel";
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

  const handleUpdateSlideStyle = (index: number, field: "title" | "body", style: Partial<TextStyle>) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const styleKey = field === "title" ? "titleStyle" : "bodyStyle";
    updated[index] = {
      ...updated[index],
      [styleKey]: { ...updated[index][styleKey], ...style },
    };
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
        onUpdateSlideStyle={handleUpdateSlideStyle}
      />
    </div>
  );
};

export default Index;

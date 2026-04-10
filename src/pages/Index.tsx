import { useState, useCallback } from "react";
import { CarouselData, TextStyle } from "@/types/carousel";
import { GeneratorSidebar } from "@/components/GeneratorSidebar";
import { CarouselPreview } from "@/components/CarouselPreview";

const Index = () => {
  const [carousel, setCarousel] = useState<CarouselData | null>(null);

  const handleUpdateSlide = (index: number, field: string, value: any) => {
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

  const handleAddSticker = (index: number, emoji: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const sticker = {
      id: crypto.randomUUID(),
      emoji,
      x: 100 + Math.random() * 800,
      y: 100 + Math.random() * 1000,
      size: 80,
      rotation: Math.round(Math.random() * 30 - 15),
    };
    updated[index] = {
      ...updated[index],
      stickers: [...(updated[index].stickers || []), sticker],
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleRemoveSticker = (index: number, stickerId: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      stickers: (updated[index].stickers || []).filter((s) => s.id !== stickerId),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleMoveSticker = (index: number, stickerId: string, x: number, y: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      stickers: (updated[index].stickers || []).map((s) =>
        s.id === stickerId ? { ...s, x, y } : s
      ),
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
        onAddSticker={handleAddSticker}
        onRemoveSticker={handleRemoveSticker}
        onMoveSticker={handleMoveSticker}
      />
    </div>
  );
};

export default Index;

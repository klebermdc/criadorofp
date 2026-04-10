import { useState, useCallback } from "react";
import { CarouselData, TextStyle, SlideTemplate, TextBoxItem, ShapeItem } from "@/types/carousel";
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
      id: crypto.randomUUID(), emoji,
      x: 100 + Math.random() * 800, y: 100 + Math.random() * 1000,
      size: 80, rotation: Math.round(Math.random() * 30 - 15),
    };
    updated[index] = { ...updated[index], stickers: [...(updated[index].stickers || []), sticker] };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleRemoveSticker = (index: number, stickerId: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = { ...updated[index], stickers: (updated[index].stickers || []).filter((s) => s.id !== stickerId) };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleMoveSticker = (index: number, stickerId: string, x: number, y: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      stickers: (updated[index].stickers || []).map((s) => s.id === stickerId ? { ...s, x, y } : s),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleAddTextBox = (index: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const tb: TextBoxItem = {
      id: crypto.randomUUID(), text: "Novo texto",
      x: 200, y: 400, width: 400,
      style: { fontSize: 24, color: "#ffffff", fontFamily: "Inter", fontWeight: "normal" },
      zIndex: 5, visible: true,
    };
    updated[index] = { ...updated[index], textBoxes: [...(updated[index].textBoxes || []), tb] };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleMoveTextBox = (index: number, id: string, x: number, y: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      textBoxes: (updated[index].textBoxes || []).map((t) => t.id === id ? { ...t, x, y } : t),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleUpdateTextBox = (index: number, id: string, text: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      textBoxes: (updated[index].textBoxes || []).map((t) => t.id === id ? { ...t, text } : t),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleAddShape = (index: number, type: "circle" | "square" | "line") => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const shape: ShapeItem = {
      id: crypto.randomUUID(), type,
      x: 300, y: 500,
      width: type === "line" ? 200 : 100,
      height: type === "line" ? 4 : 100,
      color: "#e94560", rotation: 0, zIndex: 4, visible: true,
    };
    updated[index] = { ...updated[index], shapes: [...(updated[index].shapes || []), shape] };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleMoveShape = (index: number, id: string, x: number, y: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      shapes: (updated[index].shapes || []).map((s) => s.id === id ? { ...s, x, y } : s),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleToggleElementVisibility = (index: number, id: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const slide = updated[index];
    updated[index] = {
      ...slide,
      textBoxes: (slide.textBoxes || []).map((t) => t.id === id ? { ...t, visible: !t.visible } : t),
      shapes: (slide.shapes || []).map((s) => s.id === id ? { ...s, visible: !s.visible } : s),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleDeleteElement = (index: number, id: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const slide = updated[index];
    updated[index] = {
      ...slide,
      textBoxes: (slide.textBoxes || []).filter((t) => t.id !== id),
      shapes: (slide.shapes || []).filter((s) => s.id !== id),
      stickers: (slide.stickers || []).filter((s) => s.id !== id),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleApplyTemplate = (template: SlideTemplate) => {
    if (!carousel) return;
    const updated = carousel.slides.map((slide) => ({
      ...slide,
      titleStyle: { ...slide.titleStyle, ...template.titleStyle },
      bodyStyle: { ...slide.bodyStyle, ...template.bodyStyle },
      gradientFrom: template.gradientFrom,
      gradientTo: template.gradientTo,
      overlayOpacity: template.overlayOpacity,
    }));
    setCarousel({ ...carousel, slides: updated });
  };

  const handleUpdateSlides = useCallback((updater: (prev: CarouselData) => CarouselData) => {
    setCarousel((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
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
        onAddTextBox={handleAddTextBox}
        onMoveTextBox={handleMoveTextBox}
        onUpdateTextBox={handleUpdateTextBox}
        onAddShape={handleAddShape}
        onMoveShape={handleMoveShape}
        onToggleElementVisibility={handleToggleElementVisibility}
        onDeleteElement={handleDeleteElement}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default Index;

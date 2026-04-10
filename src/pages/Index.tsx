import { useState, useCallback } from "react";
import { CarouselData, TextStyle, SlideTemplate, TextBoxItem, ShapeItem, ImageItem } from "@/types/carousel";
import { GeneratorSidebar } from "@/components/GeneratorSidebar";
import { CarouselPreview } from "@/components/CarouselPreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { PanelLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"generator" | "preview">("generator");

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

  const handleAddImage = (index: number, src: string) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    const img: ImageItem = {
      id: crypto.randomUUID(), src,
      x: 340, y: 525, width: 400, height: 300,
      rotation: 0, zIndex: 6, visible: true, opacity: 1,
    };
    updated[index] = { ...updated[index], images: [...(updated[index].images || []), img] };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleMoveImage = (index: number, id: string, x: number, y: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      images: (updated[index].images || []).map((img) => img.id === id ? { ...img, x, y } : img),
    };
    setCarousel({ ...carousel, slides: updated });
  };

  const handleResizeImage = (index: number, id: string, width: number, height: number) => {
    if (!carousel) return;
    const updated = [...carousel.slides];
    updated[index] = {
      ...updated[index],
      images: (updated[index].images || []).map((img) => img.id === id ? { ...img, width, height } : img),
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
      images: (slide.images || []).map((img) => img.id === id ? { ...img, visible: !img.visible } : img),
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
      images: (slide.images || []).filter((img) => img.id !== id),
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
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      {/* Mobile tab bar */}
      {isMobile && (
        <div className="flex border-b border-zinc-800 bg-zinc-900">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none gap-2 ${mobileTab === "generator" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
            onClick={() => setMobileTab("generator")}
          >
            <PanelLeft className="h-4 w-4" />
            Gerador
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none gap-2 ${mobileTab === "preview" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}
            onClick={() => setMobileTab("preview")}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className={`${isMobile ? (mobileTab === "generator" ? "flex w-full" : "hidden") : "flex"}`}>
          <GeneratorSidebar
            onGenerated={(data) => { setCarousel(data); if (isMobile) setMobileTab("preview"); }}
            onLoadCarousel={(data) => { setCarousel(data); if (isMobile) setMobileTab("preview"); }}
            onUpdateSlides={handleUpdateSlides}
            currentCarousel={carousel}
          />
        </div>
        <div className={`${isMobile ? (mobileTab === "preview" ? "flex flex-1" : "hidden") : "flex flex-1"}`}>
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
            onAddImage={handleAddImage}
            onMoveImage={handleMoveImage}
            onResizeImage={handleResizeImage}
            onToggleElementVisibility={handleToggleElementVisibility}
            onDeleteElement={handleDeleteElement}
            onApplyTemplate={handleApplyTemplate}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

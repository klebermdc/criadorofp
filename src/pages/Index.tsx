import { useState, useCallback } from "react";
import { CarouselData, TextStyle, SlideTemplate, TextBoxItem, ShapeItem, ImageItem } from "@/types/carousel";
import { GeneratorSidebar } from "@/components/GeneratorSidebar";
import { CarouselPreview } from "@/components/CarouselPreview";
import { MyPosts } from "@/components/MyPosts";
import { CalendarView } from "@/components/CalendarView";
import { AnalyticsPlaceholder } from "@/components/AnalyticsPlaceholder";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PenTool, FolderOpen, CalendarDays, BarChart3, PanelLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import ofpLogo from "@/assets/ofp-logo.png";

const Index = () => {
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [activeTab, setActiveTab] = useState("criar");
  const isMobile = useIsMobile();
  const [mobileEditorTab, setMobileEditorTab] = useState<"generator" | "preview">("generator");

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
      color: "#3377AF", rotation: 0, zIndex: 4, visible: true,
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

  const handleEditCarousel = (data: CarouselData) => {
    setCarousel(data);
    setActiveTab("criar");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Top navigation bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
        <div className="flex items-center gap-3">
          <img src={ofpLogo} alt="CriadorOFP" className="h-8 w-8" />
          <div className="hidden sm:block">
            <h1 className="text-base font-bold leading-tight">
              <span style={{ color: "#3377AF" }}>Criador</span>
              <span style={{ color: "#83F714" }}>OFP</span>
              <span className="text-xs font-normal ml-2" style={{ color: "#94A3B8" }}>2.0</span>
            </h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex justify-center">
          <TabsList className="h-9" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
            <TabsTrigger value="criar" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <PenTool className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Criar</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Meus Posts</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-20" />
      </header>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "criar" && (
          <div className="flex flex-col h-full">
            {/* Mobile tab bar for editor */}
            {isMobile && (
              <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#12121A" }}>
                <Button
                  variant="ghost"
                  className={`flex-1 rounded-none gap-2 ${mobileEditorTab === "generator" ? "text-[#3377AF]" : "text-[#94A3B8]"}`}
                  onClick={() => setMobileEditorTab("generator")}
                  style={mobileEditorTab === "generator" ? { backgroundColor: "rgba(51,119,175,0.1)" } : {}}
                >
                  <PanelLeft className="h-4 w-4" />
                  Gerador
                </Button>
                <Button
                  variant="ghost"
                  className={`flex-1 rounded-none gap-2 ${mobileEditorTab === "preview" ? "text-[#3377AF]" : "text-[#94A3B8]"}`}
                  onClick={() => setMobileEditorTab("preview")}
                  style={mobileEditorTab === "preview" ? { backgroundColor: "rgba(51,119,175,0.1)" } : {}}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            )}

            <div className="flex flex-1 overflow-hidden">
              <div className={`${isMobile ? (mobileEditorTab === "generator" ? "flex w-full" : "hidden") : "flex"}`}>
                <GeneratorSidebar
                  onGenerated={(data) => { setCarousel(data); if (isMobile) setMobileEditorTab("preview"); }}
                  onLoadCarousel={(data) => { setCarousel(data); if (isMobile) setMobileEditorTab("preview"); }}
                  onUpdateSlides={handleUpdateSlides}
                  currentCarousel={carousel}
                />
              </div>
              <div className={`${isMobile ? (mobileEditorTab === "preview" ? "flex flex-1" : "hidden") : "flex flex-1"}`}>
                <CarouselPreview
                  slides={carousel?.slides || []}
                  carousel={carousel}
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
        )}

        {activeTab === "posts" && (
          <MyPosts onEdit={handleEditCarousel} />
        )}

        {activeTab === "calendario" && (
          <CalendarView onEdit={handleEditCarousel} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPlaceholder />
        )}
      </div>
    </div>
  );
};

export default Index;

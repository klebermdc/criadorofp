import { useState, useCallback } from "react";
import { CarouselData, TextStyle, SlideTemplate, TextBoxItem, ShapeItem, ImageItem, Brand } from "@/types/carousel";
import { GeneratorSidebar } from "@/components/GeneratorSidebar";
import { CarouselPreview } from "@/components/CarouselPreview";
import { MyPosts } from "@/components/MyPosts";
import { CalendarView } from "@/components/CalendarView";
import { AnalyticsPlaceholder } from "@/components/AnalyticsPlaceholder";
import { BrandManager } from "@/components/BrandManager";
import { InstagramAccountManager } from "@/components/InstagramAccountManager";
import { InstagramPublisher } from "@/components/InstagramPublisher";
import { PublishButton } from "@/components/PublishButton";
import { YouTubeClipper } from "@/components/YouTubeClipper";
import { BotCommands } from "@/components/BotCommands";
import { VideoToCarousel } from "@/components/VideoToCarousel";
import { VideoTranscriber } from "@/components/VideoTranscriber";
import { InstagramDownloader } from "@/components/InstagramDownloader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PenTool, FolderOpen, CalendarDays, BarChart3, PanelLeft, Eye,
  Building2, Film, Instagram, MessageSquare, MoreHorizontal, X,
  Video, FileText, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ofpLogo from "@/assets/ofp-logo.png";

const Index = () => {
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [activeTab, setActiveTab] = useState("criar");
  const isMobile = useIsMobile();
  const [mobileEditorTab, setMobileEditorTab] = useState<"generator" | "preview">("generator");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showPublisher, setShowPublisher] = useState(false);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    if (carousel) {
      setCarousel({
        ...carousel,
        primary_color: brand.primary_color,
        secondary_color: brand.secondary_color,
      });
    }
  };

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

  // Bottom nav: 5 main tabs (mobile)
  const bottomNavItems = [
    { id: "criar", icon: PenTool, label: "Criar" },
    { id: "reels", icon: Film, label: "Reels" },
    { id: "posts", icon: FolderOpen, label: "Posts" },
    { id: "marcas", icon: Building2, label: "Marcas" },
    { id: "mais", icon: MoreHorizontal, label: "Mais" },
  ];

  // "Mais" drawer items
  const drawerItems = [
    { id: "insta-download", icon: Instagram, label: "Baixar do Insta" },
    { id: "video-carousel", icon: Video, label: "Video → Carrossel" },
    { id: "transcricao", icon: FileText, label: "Transcricao" },
    { id: "calendario", icon: CalendarDays, label: "Calendario" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "instagram", icon: Instagram, label: "Instagram" },
    { id: "bot", icon: MessageSquare, label: "Bot" },
  ];

  const isMoreTabActive = drawerItems.some((item) => item.id === activeTab);

  const handleBottomNavTap = (id: string) => {
    if (id === "mais") {
      setShowMoreDrawer((prev) => !prev);
    } else {
      setShowMoreDrawer(false);
      setActiveTab(id);
    }
  };

  const handleDrawerItemTap = (id: string) => {
    setActiveTab(id);
    setShowMoreDrawer(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#0A0A0F" }}>
      {/* ===== DESKTOP TOP NAV ===== */}
      <header className="hidden sm:flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
        <div className="flex items-center gap-3 shrink-0">
          <img src={ofpLogo} alt="CriadorOFP" className="h-8 w-8" />
          <div>
            <h1 className="text-base font-bold leading-tight">
              <span style={{ color: "#3377AF" }}>Criador</span>
              <span style={{ color: "#83F714" }}>OFP</span>
              <span className="text-xs font-normal ml-2" style={{ color: "#94A3B8" }}>3.0</span>
            </h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex justify-center overflow-hidden">
          <TabsList className="h-9" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
            <TabsTrigger value="criar" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <PenTool className="h-3.5 w-3.5" /> Criar
            </TabsTrigger>
            <TabsTrigger value="reels" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <Film className="h-3.5 w-3.5" /> Reels
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <FolderOpen className="h-3.5 w-3.5" /> Meus Posts
            </TabsTrigger>
            <TabsTrigger value="calendario" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <CalendarDays className="h-3.5 w-3.5" /> Calendario
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="marcas" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <Building2 className="h-3.5 w-3.5" /> Marcas
            </TabsTrigger>
            <TabsTrigger value="instagram" className="gap-1.5 text-xs data-[state=active]:bg-[#E1306C]/20 data-[state=active]:text-[#E1306C]">
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </TabsTrigger>
            <TabsTrigger value="bot" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <MessageSquare className="h-3.5 w-3.5" /> Bot
            </TabsTrigger>
            <TabsTrigger value="insta-download" className="gap-1.5 text-xs data-[state=active]:bg-[#E1306C]/20 data-[state=active]:text-[#E1306C]">
              <Instagram className="h-3.5 w-3.5" /> Insta DL
            </TabsTrigger>
            <TabsTrigger value="video-carousel" className="gap-1.5 text-xs data-[state=active]:bg-[#83F714]/20 data-[state=active]:text-[#83F714]">
              <Video className="h-3.5 w-3.5" /> Video→Post
            </TabsTrigger>
            <TabsTrigger value="transcricao" className="gap-1.5 text-xs data-[state=active]:bg-[#3377AF]/20 data-[state=active]:text-[#3377AF]">
              <FileText className="h-3.5 w-3.5" /> Transcricao
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-20 shrink-0" />
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 overflow-hidden relative">
        {/* Criar tab */}
        {activeTab === "criar" && (
          <div className="flex flex-col h-full">
            {/* Mobile editor toggle — Gerador / Preview */}
            <div className="flex sm:hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#12121A" }}>
              <Button
                variant="ghost"
                className={`flex-1 rounded-none gap-2 h-12 min-h-[48px] ${mobileEditorTab === "generator" ? "text-[#3377AF]" : "text-[#94A3B8]"}`}
                onClick={() => setMobileEditorTab("generator")}
                style={mobileEditorTab === "generator" ? { backgroundColor: "rgba(51,119,175,0.1)" } : {}}
              >
                <PanelLeft className="h-4 w-4" />
                Gerador
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 rounded-none gap-2 h-12 min-h-[48px] ${mobileEditorTab === "preview" ? "text-[#3377AF]" : "text-[#94A3B8]"}`}
                onClick={() => setMobileEditorTab("preview")}
                style={mobileEditorTab === "preview" ? { backgroundColor: "rgba(51,119,175,0.1)" } : {}}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Mobile: show/hide via CSS classes; Desktop: always show */}
              <div className={`sm:flex ${mobileEditorTab === "generator" ? "flex w-full sm:w-auto" : "hidden"}`}>
                <GeneratorSidebar
                  onGenerated={(data) => { setCarousel(data); if (isMobile) setMobileEditorTab("preview"); }}
                  onLoadCarousel={(data) => { setCarousel(data); if (isMobile) setMobileEditorTab("preview"); }}
                  onUpdateSlides={handleUpdateSlides}
                  currentCarousel={carousel}
                />
              </div>
              <div className={`sm:flex sm:flex-1 ${mobileEditorTab === "preview" ? "flex flex-1" : "hidden"}`}>
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

        {/* Reels — display trick for persistence */}
        <div style={{ display: activeTab === "reels" ? "flex" : "none", height: "100%" }}>
          <YouTubeClipper />
        </div>

        {activeTab === "posts" && (
          <MyPosts onEdit={handleEditCarousel} />
        )}

        {activeTab === "calendario" && (
          <CalendarView onEdit={handleEditCarousel} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPlaceholder />
        )}

        {activeTab === "marcas" && (
          <BrandManager onSelectBrand={handleSelectBrand} selectedBrand={selectedBrand} />
        )}

        {activeTab === "instagram" && (
          <InstagramAccountManager />
        )}

        {activeTab === "bot" && (
          <BotCommands />
        )}

        {activeTab === "insta-download" && (
          <InstagramDownloader onCarouselGenerated={(data) => { setCarousel(data); setActiveTab("criar"); }} />
        )}

        {activeTab === "video-carousel" && (
          <VideoToCarousel onGenerated={(data) => { setCarousel(data); setActiveTab("criar"); }} />
        )}

        {activeTab === "transcricao" && (
          <VideoTranscriber />
        )}

        {/* ===== "MAIS" BOTTOM SHEET (mobile only) ===== */}
        {showMoreDrawer && (
          <>
            {/* Backdrop with blur */}
            <div
              className="sm:hidden fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
              onClick={() => setShowMoreDrawer(false)}
            />
            {/* Sheet */}
            <div
              className="sm:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl animate-in slide-in-from-bottom duration-200"
              style={{
                backgroundColor: "#12121A",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "env(safe-area-inset-bottom, 16px)",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <span className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>Mais opcoes</span>
                <button
                  onClick={() => setShowMoreDrawer(false)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <X className="h-4 w-4" style={{ color: "#94A3B8" }} />
                </button>
              </div>

              {/* Items */}
              <div className="px-3 pb-4">
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleDrawerItemTap(item.id)}
                      className="w-full flex items-center gap-4 px-4 rounded-xl transition-colors"
                      style={{
                        height: 56,
                        minHeight: 48,
                        backgroundColor: isActive ? "rgba(51,119,175,0.12)" : "transparent",
                      }}
                    >
                      <Icon
                        className="h-5 w-5 shrink-0"
                        style={{ color: isActive ? "#3377AF" : "#94A3B8" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: isActive ? "#3377AF" : "#E2E8F0" }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav
        className="sm:hidden flex items-stretch relative z-30"
        style={{
          height: 56,
          minHeight: 56,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "#0A0A0F",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "mais"
            ? (showMoreDrawer || isMoreTabActive)
            : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleBottomNavTap(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative"
              style={{
                minWidth: 48,
                minHeight: 48,
                color: isActive ? "#3377AF" : "#64748B",
              }}
            >
              {/* Active dot indicator */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 12, height: 3, backgroundColor: "#3377AF" }}
                />
              )}
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-semibold" style={{ fontSize: 10, lineHeight: "12px" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ===== PUBLISH BUTTON (floating) ===== */}
      {activeTab === "criar" && (
        <PublishButton
          carousel={carousel}
          onPublish={() => setShowPublisher(true)}
        />
      )}

      {/* ===== INSTAGRAM PUBLISHER MODAL ===== */}
      {carousel && (
        <InstagramPublisher
          carousel={carousel}
          slideImages={slideImages}
          isOpen={showPublisher}
          onClose={() => setShowPublisher(false)}
          onPublished={(postId) => {
            setShowPublisher(false);
          }}
        />
      )}
    </div>
  );
};

export default Index;

import { CarouselSlide, TextStyle, StickerItem, SlideTemplate, ImageItem, CarouselData } from "@/types/carousel";
import { SlideRenderer } from "./SlideRenderer";
import { SlideEditor } from "./SlideEditor";
import { LayersPanel } from "./LayersPanel";
import { ImageLibrary } from "./ImageLibrary";
import { ChevronLeft, ChevronRight, Download, Grid3X3, ZoomIn, ZoomOut, FileImage, FileArchive, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CarouselPreviewProps {
  slides: CarouselSlide[];
  carousel: CarouselData | null;
  onUpdateSlide: (index: number, field: string, value: any) => void;
  onUpdateSlideStyle: (index: number, field: "title" | "body", style: Partial<TextStyle>) => void;
  onAddSticker: (index: number, emoji: string) => void;
  onRemoveSticker: (index: number, stickerId: string) => void;
  onMoveSticker: (index: number, stickerId: string, x: number, y: number) => void;
  onAddTextBox: (index: number) => void;
  onMoveTextBox: (index: number, id: string, x: number, y: number) => void;
  onUpdateTextBox: (index: number, id: string, text: string) => void;
  onAddShape: (index: number, type: "circle" | "square" | "line") => void;
  onMoveShape: (index: number, id: string, x: number, y: number) => void;
  onAddImage: (index: number, src: string) => void;
  onMoveImage: (index: number, id: string, x: number, y: number) => void;
  onResizeImage: (index: number, id: string, width: number, height: number) => void;
  onToggleElementVisibility: (index: number, id: string) => void;
  onDeleteElement: (index: number, id: string) => void;
  onApplyTemplate: (template: SlideTemplate) => void;
}

const ZOOM_LEVELS_DESKTOP = [0.3, 0.4, 0.5, 0.6];
const ZOOM_LABELS_DESKTOP = ["30%", "40%", "50%", "60%"];
const ZOOM_LEVELS_MOBILE = [0.2, 0.25, 0.3, 0.35];
const ZOOM_LABELS_MOBILE = ["20%", "25%", "30%", "35%"];

export function CarouselPreview({
  slides, carousel, onUpdateSlide, onUpdateSlideStyle,
  onAddSticker, onRemoveSticker, onMoveSticker,
  onAddTextBox, onMoveTextBox, onUpdateTextBox,
  onAddShape, onMoveShape, onAddImage, onMoveImage, onResizeImage,
  onToggleElementVisibility, onDeleteElement,
  onApplyTemplate,
}: CarouselPreviewProps) {
  const isMobile = useIsMobile();
  const ZOOM_LEVELS = isMobile ? ZOOM_LEVELS_MOBILE : ZOOM_LEVELS_DESKTOP;
  const ZOOM_LABELS = isMobile ? ZOOM_LABELS_MOBILE : ZOOM_LABELS_DESKTOP;
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [activeField, setActiveField] = useState<"title" | "body" | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(1);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scale = ZOOM_LEVELS[zoomIdx];
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));
  const currentSlide = slides[current];

  const exportSingleSlide = async () => {
    setExporting(true);
    try {
      const el = slideRefs.current[current];
      if (!el) return;
      const slideEl = el.querySelector(".slide-root") as HTMLElement;
      if (!slideEl) return;
      const dataUrl = await toPng(slideEl, { width: 1080, height: 1350, pixelRatio: 1 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `slide-${current + 1}.png`;
      link.click();
      toast.success("Slide exportado como PNG");
    } catch (e) {
      console.error("Export error:", e);
      toast.error("Erro ao exportar slide");
    } finally {
      setExporting(false);
    }
  };

  const exportSlides = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < slides.length; i++) {
        setCurrent(i);
        await new Promise((r) => setTimeout(r, 200));
        const el = slideRefs.current[i];
        if (!el) continue;
        const slideEl = el.querySelector(".slide-root") as HTMLElement;
        if (!slideEl) continue;
        const dataUrl = await toPng(slideEl, { width: 1080, height: 1350, pixelRatio: 1 });
        const base64 = dataUrl.split(",")[1];
        zip.file(`slide-${i + 1}.png`, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "carousel-ofp.zip";
      link.click();
      toast.success("Carrossel exportado como ZIP");
    } catch (e) {
      console.error("Export error:", e);
      toast.error("Erro ao exportar carrossel");
    } finally {
      setExporting(false);
    }
  };

  const copyCaption = () => {
    const caption = carousel?.caption || "";
    const hashtags = carousel?.hashtags || "";
    const text = `${caption}\n\n${hashtags}`.trim();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedCaption(true);
      toast.success("Legenda copiada!");
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      toast.error("Nenhuma legenda disponivel");
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(51,119,175,0.15), rgba(131,247,20,0.1))" }}>
            <FileImage className="h-10 w-10" style={{ color: "#3377AF" }} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum carrossel criado</h3>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Preencha o formulario ao lado e clique em "Gerar com IA" para criar seu primeiro carrossel profissional.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full relative" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        {currentSlide && (
          <div className="overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <SlideEditor
              activeField={activeField}
              titleStyle={currentSlide.titleStyle || {}}
              bodyStyle={currentSlide.bodyStyle || {}}
              overlayOpacity={currentSlide.overlayOpacity ?? 0.75}
              gradientFrom={currentSlide.gradientFrom || "#1a1a2e"}
              gradientTo={currentSlide.gradientTo || "#16213e"}
              stickers={currentSlide.stickers || []}
              onUpdateStyle={(field, style) => onUpdateSlideStyle(current, field, style)}
              onUpdateOverlay={(opacity) => onUpdateSlide(current, "overlayOpacity", opacity)}
              onUpdateGradient={(from, to) => {
                onUpdateSlide(current, "gradientFrom", from);
                onUpdateSlide(current, "gradientTo", to);
              }}
              onAddSticker={(emoji) => onAddSticker(current, emoji)}
              onRemoveSticker={(id) => onRemoveSticker(current, id)}
              onAddTextBox={() => onAddTextBox(current)}
              onAddShape={(type) => onAddShape(current, type)}
              onApplyTemplate={onApplyTemplate}
              onOpenImageLibrary={() => setShowImageLibrary(true)}
            />
          </div>
        )}

        {/* Canvas area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-auto">
          {/* Zoom + grid controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-white"
              style={{ color: "#94A3B8" }}
              onClick={() => setZoomIdx((i) => Math.max(0, i - 1))} disabled={zoomIdx === 0}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs w-10 text-center font-mono" style={{ color: "#94A3B8" }}>{ZOOM_LABELS[zoomIdx]}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-white"
              style={{ color: "#94A3B8" }}
              onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
            <Button variant={showGrid ? "secondary" : "ghost"} size="icon" className="h-7 w-7"
              style={{ color: showGrid ? "#3377AF" : "#94A3B8" }}
              onClick={() => setShowGrid(!showGrid)}>
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Slide */}
          <div className="relative overflow-hidden rounded-xl shadow-2xl" style={{ width: 1080 * scale, height: 1350 * scale, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            {slides.map((slide, i) => (
              <div key={i} ref={(el) => (slideRefs.current[i] = el)} className={i === current ? "block" : "hidden"}>
                <SlideRenderer
                  slide={slide} index={i} total={slides.length}
                  onUpdate={(field, value) => onUpdateSlide(i, field, value)}
                  onFieldFocus={(field) => setActiveField(field)}
                  onMoveSticker={(id, x, y) => onMoveSticker(i, id, x, y)}
                  onMoveTextBox={(id, x, y) => onMoveTextBox(i, id, x, y)}
                  onMoveShape={(id, x, y) => onMoveShape(i, id, x, y)}
                  onMoveImage={(id, x, y) => onMoveImage(i, id, x, y)}
                  onResizeImage={(id, w, h) => onResizeImage(i, id, w, h)}
                  onUpdateTextBox={(id, text) => onUpdateTextBox(i, id, text)}
                  onDeleteElement={(id) => onDeleteElement(i, id)}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  scale={scale} showGrid={showGrid}
                />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={prev} disabled={current === 0} className="hover:text-white" style={{ color: "#94A3B8" }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: i === current ? "#3377AF" : "rgba(255,255,255,0.15)",
                    transform: i === current ? "scale(1.3)" : "scale(1)",
                  }} />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={next} disabled={current === slides.length - 1} className="hover:text-white" style={{ color: "#94A3B8" }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-xs ml-1" style={{ color: "#94A3B8" }}>{current + 1}/{slides.length}</span>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              onClick={exportSingleSlide}
              disabled={exporting}
              size="sm"
              className="gap-1.5 text-xs"
              style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
              variant="outline"
            >
              <FileImage className="h-3.5 w-3.5" />
              Exportar Slide PNG
            </Button>
            <Button
              onClick={exportSlides}
              disabled={exporting}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              style={{ background: "linear-gradient(135deg, #3377AF, #83F714)", color: "#0A0A0F" }}
            >
              <FileArchive className="h-3.5 w-3.5" />
              {exporting ? "Exportando..." : "Exportar ZIP"}
            </Button>
            <Button
              onClick={copyCaption}
              size="sm"
              className="gap-1.5 text-xs"
              style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
              variant="outline"
            >
              {copiedCaption ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCaption ? "Copiado!" : "Copiar Legenda"}
            </Button>
          </div>
        </div>

        {/* Bottom: Slide thumbnails strip */}
        <div className="py-2 px-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="shrink-0 rounded-lg overflow-hidden transition-all hover:opacity-90"
                  style={{
                    width: 64,
                    height: 80,
                    border: i === current ? "2px solid #3377AF" : "2px solid rgba(255,255,255,0.06)",
                    background: `linear-gradient(180deg, ${slide.gradientFrom || "#1a1a2e"} 0%, ${slide.gradientTo || "#16213e"} 100%)`,
                    position: "relative",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white/80 text-center px-1 leading-tight truncate">
                      {slide.title.slice(0, 20)}
                    </span>
                  </div>
                  <div className="absolute bottom-0.5 left-0 right-0 text-center">
                    <span className="text-[8px] font-mono" style={{ color: i === current ? "#3377AF" : "#94A3B8" }}>
                      {i + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Layers panel */}
      {currentSlide && (
        <LayersPanel
          slide={currentSlide}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onToggleVisibility={(id) => onToggleElementVisibility(current, id)}
          onDeleteElement={(id) => onDeleteElement(current, id)}
        />
      )}

      {/* Image Library panel */}
      {showImageLibrary && (
        <ImageLibrary
          onSelectImage={(src) => {
            onAddImage(current, src);
            setShowImageLibrary(false);
          }}
          onClose={() => setShowImageLibrary(false)}
        />
      )}
    </div>
  );
}

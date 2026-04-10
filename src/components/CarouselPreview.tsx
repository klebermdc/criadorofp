import { CarouselSlide, TextStyle, StickerItem, SlideTemplate } from "@/types/carousel";
import { SlideRenderer } from "./SlideRenderer";
import { SlideEditor } from "./SlideEditor";
import { LayersPanel } from "./LayersPanel";
import { ChevronLeft, ChevronRight, Download, Grid3X3, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

interface CarouselPreviewProps {
  slides: CarouselSlide[];
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
  onToggleElementVisibility: (index: number, id: string) => void;
  onDeleteElement: (index: number, id: string) => void;
  onApplyTemplate: (template: SlideTemplate) => void;
}

const ZOOM_LEVELS = [0.3, 0.45, 0.55, 0.7];
const ZOOM_LABELS = ["30%", "45%", "55%", "70%"];

export function CarouselPreview({
  slides, onUpdateSlide, onUpdateSlideStyle,
  onAddSticker, onRemoveSticker, onMoveSticker,
  onAddTextBox, onMoveTextBox, onUpdateTextBox,
  onAddShape, onMoveShape, onToggleElementVisibility, onDeleteElement,
  onApplyTemplate,
}: CarouselPreviewProps) {
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [activeField, setActiveField] = useState<"title" | "body" | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(1);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scale = ZOOM_LEVELS[zoomIdx];
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));
  const currentSlide = slides[current];

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
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500 text-lg">Gere um carrossel para visualizar aqui</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full bg-zinc-950">
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        {currentSlide && (
          <div className="border-b border-zinc-800 p-2">
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
            />
          </div>
        )}

        {/* Canvas area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-auto">
          {/* Zoom + grid controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white"
              onClick={() => setZoomIdx((i) => Math.max(0, i - 1))} disabled={zoomIdx === 0}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-zinc-500 w-10 text-center font-mono">{ZOOM_LABELS[zoomIdx]}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white"
              onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-zinc-700" />
            <Button variant={showGrid ? "secondary" : "ghost"} size="icon" className="h-7 w-7 text-zinc-400"
              onClick={() => setShowGrid(!showGrid)}>
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Slide */}
          <div className="relative overflow-hidden rounded-lg shadow-2xl" style={{ width: 1080 * scale, height: 1350 * scale }}>
            {slides.map((slide, i) => (
              <div key={i} ref={(el) => (slideRefs.current[i] = el)} className={i === current ? "block" : "hidden"}>
                <SlideRenderer
                  slide={slide} index={i} total={slides.length}
                  onUpdate={(field, value) => onUpdateSlide(i, field, value)}
                  onFieldFocus={(field) => setActiveField(field)}
                  onMoveSticker={(id, x, y) => onMoveSticker(i, id, x, y)}
                  onMoveTextBox={(id, x, y) => onMoveTextBox(i, id, x, y)}
                  onMoveShape={(id, x, y) => onMoveShape(i, id, x, y)}
                  onUpdateTextBox={(id, text) => onUpdateTextBox(i, id, text)}
                  scale={scale} showGrid={showGrid}
                />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={prev} disabled={current === 0} className="text-zinc-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-red-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"
                  }`} />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={next} disabled={current === slides.length - 1} className="text-zinc-400 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-xs text-zinc-500 ml-1">{current + 1}/{slides.length}</span>
          </div>

          <Button onClick={exportSlides} disabled={exporting} size="sm" className="gap-1.5 bg-red-600 hover:bg-red-700 text-white">
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Exportando..." : "Exportar PNG (ZIP)"}
          </Button>
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
    </div>
  );
}

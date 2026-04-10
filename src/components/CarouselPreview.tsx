import { CarouselSlide } from "@/types/carousel";
import { SlideRenderer } from "./SlideRenderer";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

interface CarouselPreviewProps {
  slides: CarouselSlide[];
  onUpdateSlide: (index: number, field: string, value: string) => void;
}

export function CarouselPreview({ slides, onUpdateSlide }: CarouselPreviewProps) {
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Gere um carrossel para visualizar aqui</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
      {/* Slide preview */}
      <div className="relative overflow-hidden" style={{ width: 1080 * 0.45, height: 1350 * 0.45 }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => (slideRefs.current[i] = el)}
            className={i === current ? "block" : "hidden"}
          >
            <SlideRenderer
              slide={slide}
              index={i}
              total={slides.length}
              onUpdate={(field, value) => onUpdateSlide(i, field, value)}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={prev} disabled={current === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === current ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={next} disabled={current === slides.length - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          {current + 1} / {slides.length}
        </span>
      </div>

      {/* Export */}
      <Button onClick={exportSlides} disabled={exporting} className="gap-2">
        <Download className="h-4 w-4" />
        {exporting ? "Exportando..." : "Exportar como PNG (ZIP)"}
      </Button>
    </div>
  );
}

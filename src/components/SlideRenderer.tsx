import { CarouselSlide } from "@/types/carousel";
import { useRef } from "react";

interface SlideRendererProps {
  slide: CarouselSlide;
  index: number;
  total: number;
  onUpdate: (field: string, value: string) => void;
  exportMode?: boolean;
}

const EditableText = ({
  value,
  onChange,
  className,
  tag: Tag = "div",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  tag?: "div" | "span" | "h1" | "h2" | "p";
}) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      className={`outline-none focus:ring-2 focus:ring-ofp-red/50 focus:rounded px-1 cursor-text ${className}`}
    >
      {value}
    </Tag>
  );
};

const Footer = () => (
  <div className="absolute bottom-8 left-0 right-0 text-center">
    <span className="text-sm tracking-[0.3em] uppercase opacity-60" style={{ color: "#ffffff" }}>
      Orlando Fast Pass
    </span>
  </div>
);

const CoverSlide = ({ slide, onUpdate }: { slide: CarouselSlide; onUpdate: SlideRendererProps["onUpdate"] }) => (
  <div className="flex flex-col items-center justify-center h-full px-16 text-center">
    <div className="w-20 h-1 mb-8" style={{ backgroundColor: "#e94560" }} />
    <EditableText
      value={slide.title}
      onChange={(v) => onUpdate("title", v)}
      tag="h1"
      className="text-5xl font-bold leading-tight mb-8"
      />
    <div className="w-20 h-1 mt-4 mb-8" style={{ backgroundColor: "#e94560" }} />
    <p className="text-xl opacity-70 mt-4">Deslize →</p>
    <Footer />
  </div>
);

const ContentSlide = ({
  slide,
  onUpdate,
}: {
  slide: CarouselSlide;
  onUpdate: SlideRendererProps["onUpdate"];
}) => (
  <div className="flex flex-col h-full px-14 py-16">
    {slide.number && (
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-6"
        style={{ backgroundColor: "#e94560", color: "#ffffff" }}
      >
        {slide.number}
      </div>
    )}
    <EditableText
      value={slide.title}
      onChange={(v) => onUpdate("title", v)}
      tag="h2"
      className="text-3xl font-bold mb-6"
    />
    {slide.body && (
      <EditableText
        value={slide.body}
        onChange={(v) => onUpdate("body", v)}
        tag="p"
        className="text-xl leading-relaxed opacity-90 flex-1"
      />
    )}
    {slide.emoji && (
      <div className="text-7xl mt-auto pt-6 text-center">{slide.emoji}</div>
    )}
    <Footer />
  </div>
);

const CTASlide = ({ slide, onUpdate }: { slide: CarouselSlide; onUpdate: SlideRendererProps["onUpdate"] }) => (
  <div className="flex flex-col items-center justify-center h-full px-16 text-center">
    <div className="text-6xl mb-8">🎢</div>
    <EditableText
      value={slide.title}
      onChange={(v) => onUpdate("title", v)}
      tag="h2"
      className="text-4xl font-bold mb-6"
    />
    <p className="text-2xl opacity-80 mb-4">@orlandofastpass</p>
    <p className="text-lg opacity-60">orlandofastpass.com.br</p>
    <Footer />
  </div>
);

export function SlideRenderer({ slide, index, total, onUpdate, exportMode }: SlideRendererProps) {
  const scale = exportMode ? 1 : undefined;

  return (
    <div
      className="slide-root relative overflow-hidden"
      style={{
        width: 1080,
        height: 1350,
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        color: "#ffffff",
        fontFamily: "'Inter', system-ui, sans-serif",
        transform: exportMode ? undefined : `scale(${0.45})`,
        transformOrigin: "top left",
      }}
    >
      {/* Title color override for content slides */}
      <style>{`
        .slide-root h2 { color: #e94560; }
      `}</style>
      {slide.type === "cover" && <CoverSlide slide={slide} onUpdate={onUpdate} />}
      {slide.type === "content" && <ContentSlide slide={slide} onUpdate={onUpdate} />}
      {slide.type === "cta" && <CTASlide slide={slide} onUpdate={onUpdate} />}
    </div>
  );
}

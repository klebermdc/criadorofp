import { CarouselSlide, TextStyle } from "@/types/carousel";
import { useRef, useState } from "react";

interface SlideRendererProps {
  slide: CarouselSlide;
  index: number;
  total: number;
  onUpdate: (field: string, value: string) => void;
  onUpdateStyle?: (field: "title" | "body", style: Partial<TextStyle>) => void;
  onFieldFocus?: (field: "title" | "body") => void;
  exportMode?: boolean;
}

const EditableText = ({
  value,
  onChange,
  className,
  tag: Tag = "div",
  style,
  onFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  tag?: "div" | "span" | "h1" | "h2" | "p";
  style?: React.CSSProperties;
  onFocus?: () => void;
}) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      onFocus={onFocus}
      className={`outline-none focus:ring-2 focus:ring-ofp-red/50 focus:rounded px-1 cursor-text ${className}`}
      style={{ position: "relative", zIndex: 2, ...style }}
    >
      {value}
    </Tag>
  );
};

const Footer = () => (
  <div className="absolute bottom-8 left-0 right-0 text-center" style={{ zIndex: 2 }}>
    <span className="text-sm tracking-[0.3em] uppercase opacity-60" style={{ color: "#ffffff" }}>
      Orlando Fast Pass
    </span>
  </div>
);

const BackgroundImage = ({ src }: { src?: string }) => {
  if (!src) return null;
  return (
    <>
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(26,26,46,0.7) 0%, rgba(22,33,62,0.85) 100%)",
          zIndex: 1,
        }}
      />
    </>
  );
};

const LoadingOverlay = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.3)",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: "3px solid rgba(255,255,255,0.3)",
        borderTopColor: "#e94560",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  </div>
);

function getTextStyle(style?: TextStyle, defaults?: Partial<TextStyle>): React.CSSProperties {
  return {
    fontSize: style?.fontSize || defaults?.fontSize,
    fontWeight: style?.fontWeight || defaults?.fontWeight || "bold",
    textAlign: style?.textAlign || defaults?.textAlign,
  };
}

const CoverSlide = ({
  slide,
  onUpdate,
  onFieldFocus,
}: {
  slide: CarouselSlide;
  onUpdate: SlideRendererProps["onUpdate"];
  onFieldFocus?: SlideRendererProps["onFieldFocus"];
}) => (
  <div className="flex flex-col items-center justify-center h-full px-16 text-center" style={{ position: "relative", zIndex: 2 }}>
    <div className="w-20 h-1 mb-8" style={{ backgroundColor: "#e94560" }} />
    <EditableText
      value={slide.title}
      onChange={(v) => onUpdate("title", v)}
      tag="h1"
      className="leading-tight mb-8 w-full"
      style={getTextStyle(slide.titleStyle, { fontSize: 48, textAlign: "center" })}
      onFocus={() => onFieldFocus?.("title")}
    />
    <div className="w-20 h-1 mt-4 mb-8" style={{ backgroundColor: "#e94560" }} />
    <p className="text-xl opacity-70 mt-4" style={{ position: "relative", zIndex: 2 }}>Deslize →</p>
    <Footer />
  </div>
);

const ContentSlide = ({
  slide,
  onUpdate,
  onFieldFocus,
}: {
  slide: CarouselSlide;
  onUpdate: SlideRendererProps["onUpdate"];
  onFieldFocus?: SlideRendererProps["onFieldFocus"];
}) => (
  <div className="flex flex-col h-full px-14 py-16" style={{ position: "relative", zIndex: 2 }}>
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
      className="mb-6 w-full"
      style={getTextStyle(slide.titleStyle, { fontSize: 30 })}
      onFocus={() => onFieldFocus?.("title")}
    />
    {slide.body && (
      <EditableText
        value={slide.body}
        onChange={(v) => onUpdate("body", v)}
        tag="p"
        className="leading-relaxed opacity-90 flex-1 w-full"
        style={getTextStyle(slide.bodyStyle, { fontSize: 20, fontWeight: "normal" })}
        onFocus={() => onFieldFocus?.("body")}
      />
    )}
    {slide.emoji && (
      <div className="text-7xl mt-auto pt-6 text-center" style={{ position: "relative", zIndex: 2 }}>{slide.emoji}</div>
    )}
    <Footer />
  </div>
);

const CTASlide = ({
  slide,
  onUpdate,
  onFieldFocus,
}: {
  slide: CarouselSlide;
  onUpdate: SlideRendererProps["onUpdate"];
  onFieldFocus?: SlideRendererProps["onFieldFocus"];
}) => (
  <div className="flex flex-col items-center justify-center h-full px-16 text-center" style={{ position: "relative", zIndex: 2 }}>
    <div className="text-6xl mb-8">🎢</div>
    <EditableText
      value={slide.title}
      onChange={(v) => onUpdate("title", v)}
      tag="h2"
      className="mb-6 w-full"
      style={getTextStyle(slide.titleStyle, { fontSize: 40, textAlign: "center" })}
      onFocus={() => onFieldFocus?.("title")}
    />
    <p className="text-2xl opacity-80 mb-4" style={{ position: "relative", zIndex: 2 }}>@orlandofastpass</p>
    <p className="text-lg opacity-60" style={{ position: "relative", zIndex: 2 }}>orlandofastpass.com.br</p>
    <Footer />
  </div>
);

export function SlideRenderer({ slide, index, total, onUpdate, onUpdateStyle, onFieldFocus, exportMode }: SlideRendererProps) {
  const isLoadingImage = slide.backgroundImage === "loading";

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
      <style>{`
        .slide-root h2 { color: #e94560; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <BackgroundImage src={isLoadingImage ? undefined : slide.backgroundImage} />
      {isLoadingImage && <LoadingOverlay />}
      {slide.type === "cover" && <CoverSlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
      {slide.type === "content" && <ContentSlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
      {slide.type === "cta" && <CTASlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
    </div>
  );
}

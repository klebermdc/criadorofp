import { CarouselSlide, TextStyle, StickerItem } from "@/types/carousel";
import { useRef, useState, useCallback } from "react";

interface SlideRendererProps {
  slide: CarouselSlide;
  index: number;
  total: number;
  onUpdate: (field: string, value: string) => void;
  onFieldFocus?: (field: "title" | "body") => void;
  onMoveSticker?: (id: string, x: number, y: number) => void;
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
    color: style?.color || defaults?.color,
  };
}

const DraggableSticker = ({
  sticker,
  onMove,
}: {
  sticker: StickerItem;
  onMove?: (id: string, x: number, y: number) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, sx: sticker.x, sy: sticker.y };

    const onMouseMove = (ev: MouseEvent) => {
      const scale = 0.45;
      const dx = (ev.clientX - startRef.current.x) / scale;
      const dy = (ev.clientY - startRef.current.y) / scale;
      onMove?.(sticker.id, startRef.current.sx + dx, startRef.current.sy + dy);
    };
    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [sticker, onMove]);

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: sticker.x,
        top: sticker.y,
        fontSize: sticker.size,
        transform: `rotate(${sticker.rotation}deg)`,
        cursor: dragging ? "grabbing" : "grab",
        zIndex: 10,
        userSelect: "none",
        lineHeight: 1,
      }}
    >
      {sticker.emoji}
    </div>
  );
};

const CoverSlide = ({
  slide, onUpdate, onFieldFocus,
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
      style={getTextStyle(slide.titleStyle, { fontSize: 48, textAlign: "center", color: "#ffffff" })}
      onFocus={() => onFieldFocus?.("title")}
    />
    <div className="w-20 h-1 mt-4 mb-8" style={{ backgroundColor: "#e94560" }} />
    <p className="text-xl opacity-70 mt-4" style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>Deslize →</p>
    <Footer />
  </div>
);

const ContentSlide = ({
  slide, onUpdate, onFieldFocus,
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
        style={getTextStyle(slide.bodyStyle, { fontSize: 20, fontWeight: "normal", color: "#ffffff" })}
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
  slide, onUpdate, onFieldFocus,
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
    <p className="text-2xl opacity-80 mb-4" style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>@orlandofastpass</p>
    <p className="text-lg opacity-60" style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>orlandofastpass.com.br</p>
    <Footer />
  </div>
);

export function SlideRenderer({ slide, index, total, onUpdate, onFieldFocus, onMoveSticker, exportMode }: SlideRendererProps) {
  const isLoadingImage = slide.backgroundImage === "loading";
  const gFrom = slide.gradientFrom || "#1a1a2e";
  const gTo = slide.gradientTo || "#16213e";
  const overlayOpacity = slide.overlayOpacity ?? 0.75;

  return (
    <div
      className="slide-root relative overflow-hidden"
      style={{
        width: 1080,
        height: 1350,
        background: `linear-gradient(180deg, ${gFrom} 0%, ${gTo} 100%)`,
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
      {/* Overlay */}
      {slide.backgroundImage && slide.backgroundImage !== "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${gFrom} 0%, ${gTo} 100%)`,
            opacity: overlayOpacity,
            zIndex: 1,
          }}
        />
      )}
      {isLoadingImage && <LoadingOverlay />}
      {/* Stickers */}
      {slide.stickers?.map((sticker) => (
        <DraggableSticker key={sticker.id} sticker={sticker} onMove={onMoveSticker} />
      ))}
      {slide.type === "cover" && <CoverSlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
      {slide.type === "content" && <ContentSlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
      {slide.type === "cta" && <CTASlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
    </div>
  );
}

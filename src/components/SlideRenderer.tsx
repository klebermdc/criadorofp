import { CarouselSlide, TextStyle, StickerItem, TextBoxItem, ShapeItem, ImageItem } from "@/types/carousel";
import { useRef, useState, useCallback } from "react";

interface SlideRendererProps {
  slide: CarouselSlide;
  index: number;
  total: number;
  onUpdate: (field: string, value: any) => void;
  onFieldFocus?: (field: "title" | "body") => void;
  onMoveSticker?: (id: string, x: number, y: number) => void;
  onMoveTextBox?: (id: string, x: number, y: number) => void;
  onMoveShape?: (id: string, x: number, y: number) => void;
  onMoveImage?: (id: string, x: number, y: number) => void;
  onResizeImage?: (id: string, width: number, height: number) => void;
  onUpdateTextBox?: (id: string, text: string) => void;
  onDeleteElement?: (id: string) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  exportMode?: boolean;
  scale?: number;
  showGrid?: boolean;
}

function getTextStyle(style?: TextStyle, defaults?: Partial<TextStyle>): React.CSSProperties {
  const s = { ...defaults, ...style };
  const css: React.CSSProperties = {
    fontSize: s.fontSize,
    fontWeight: s.fontWeight || "bold",
    textAlign: s.textAlign,
    color: s.color,
    fontFamily: s.fontFamily ? `'${s.fontFamily}', sans-serif` : undefined,
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    lineHeight: s.lineHeight || undefined,
  };
  if (s.textShadow) {
    const i = s.textShadowIntensity || 4;
    css.textShadow = `0 ${i}px ${i * 2}px rgba(0,0,0,0.7)`;
  }
  if (s.textStroke) {
    (css as any).WebkitTextStroke = `1px ${s.textStrokeColor || "#000000"}`;
  }
  return css;
}

const EditableText = ({
  value, onChange, className, tag: Tag = "div", style, onFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  tag?: "div" | "span" | "h1" | "h2" | "p";
  style?: React.CSSProperties;
  onFocus?: () => void;
}) => (
  <Tag
    contentEditable
    suppressContentEditableWarning
    onBlur={(e) => onChange((e.currentTarget as HTMLElement).textContent || "")}
    onFocus={onFocus}
    className={`outline-none focus:ring-2 focus:ring-red-500/50 focus:rounded px-1 cursor-text ${className}`}
    style={{ position: "relative", zIndex: 2, ...style }}
  >
    {value}
  </Tag>
);

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
    <img src={src} alt="" style={{
      position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0,
    }} />
  );
};

const LoadingOverlay = () => (
  <div style={{
    position: "absolute", inset: 0, zIndex: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.3)",
  }}>
    <div style={{
      width: 40, height: 40,
      border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#e94560",
      borderRadius: "50%", animation: "spin 1s linear infinite",
    }} />
  </div>
);

/* Draggable wrapper */
function useDrag(onMove?: (id: string, x: number, y: number) => void, id?: string, initX = 0, initY = 0, scale = 0.45) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, sx: initX, sy: initY };
    const onMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startRef.current.x) / scale;
      const dy = (ev.clientY - startRef.current.y) / scale;
      onMove?.(id!, startRef.current.sx + dx, startRef.current.sy + dy);
    };
    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [id, initX, initY, onMove, scale]);

  return { dragging, onMouseDown };
}

const DraggableSticker = ({ sticker, onMove, scale }: { sticker: StickerItem; onMove?: (id: string, x: number, y: number) => void; scale: number }) => {
  const { dragging, onMouseDown } = useDrag(onMove, sticker.id, sticker.x, sticker.y, scale);
  return (
    <div onMouseDown={onMouseDown} style={{
      position: "absolute", left: sticker.x, top: sticker.y, fontSize: sticker.size,
      transform: `rotate(${sticker.rotation}deg)`, cursor: dragging ? "grabbing" : "grab",
      zIndex: 10, userSelect: "none", lineHeight: 1,
    }}>
      {sticker.emoji}
    </div>
  );
};

const DraggableTextBox = ({ tb, onMove, onUpdateText, scale }: {
  tb: TextBoxItem; onMove?: (id: string, x: number, y: number) => void;
  onUpdateText?: (id: string, text: string) => void; scale: number;
}) => {
  const { dragging, onMouseDown } = useDrag(onMove, tb.id, tb.x, tb.y, scale);
  if (tb.visible === false) return null;
  return (
    <div onMouseDown={onMouseDown} style={{
      position: "absolute", left: tb.x, top: tb.y, width: tb.width || 400,
      cursor: dragging ? "grabbing" : "grab", zIndex: tb.zIndex || 5, userSelect: "none",
    }}>
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => onUpdateText?.(tb.id, e.currentTarget.textContent || "")}
        className="outline-none focus:ring-2 focus:ring-red-500/50 focus:rounded px-2 py-1"
        style={getTextStyle(tb.style, { fontSize: 24, color: "#ffffff", fontWeight: "normal" })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {tb.text}
      </div>
    </div>
  );
};

const DraggableShape = ({ shape, onMove, scale }: {
  shape: ShapeItem; onMove?: (id: string, x: number, y: number) => void; scale: number;
}) => {
  const { dragging, onMouseDown } = useDrag(onMove, shape.id, shape.x, shape.y, scale);
  if (shape.visible === false) return null;

  let shapeStyle: React.CSSProperties = {
    width: shape.width, height: shape.height, backgroundColor: shape.color,
    transform: `rotate(${shape.rotation}deg)`,
  };
  if (shape.type === "circle") shapeStyle.borderRadius = "50%";
  if (shape.type === "line") { shapeStyle.height = 4; shapeStyle.borderRadius = 2; }

  return (
    <div onMouseDown={onMouseDown} style={{
      position: "absolute", left: shape.x, top: shape.y,
      cursor: dragging ? "grabbing" : "grab", zIndex: shape.zIndex || 4, userSelect: "none",
    }}>
      <div style={shapeStyle} />
    </div>
  );
};

const DraggableImage = ({ img, onMove, onResize, scale, isSelected, onSelect }: {
  img: ImageItem; onMove?: (id: string, x: number, y: number) => void;
  onResize?: (id: string, w: number, h: number) => void;
  scale: number; isSelected: boolean; onSelect?: (id: string) => void;
}) => {
  const { dragging, onMouseDown } = useDrag(onMove, img.id, img.x, img.y, scale);
  const [resizing, setResizing] = useState(false);
  if (img.visible === false) return null;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = img.width;
    const startH = img.height;
    const aspect = startW / startH;
    const onMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const newW = Math.max(50, startW + dx);
      const newH = newW / aspect;
      onResize?.(img.id, newW, newH);
    };
    const onMouseUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      onMouseDown={(e) => { onSelect?.(img.id); onMouseDown(e); }}
      style={{
        position: "absolute", left: img.x, top: img.y,
        width: img.width, height: img.height,
        cursor: dragging ? "grabbing" : "grab",
        zIndex: img.zIndex || 6, userSelect: "none",
        opacity: img.opacity ?? 1,
        transform: img.rotation ? `rotate(${img.rotation}deg)` : undefined,
        outline: isSelected ? "2px solid #3b82f6" : "none",
        outlineOffset: 2,
      }}
    >
      <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, pointerEvents: "none" }} />
      {isSelected && (
        <div
          onMouseDown={handleResizeStart}
          style={{
            position: "absolute", right: -5, bottom: -5, width: 10, height: 10,
            background: "#3b82f6", borderRadius: 2, cursor: "nwse-resize",
          }}
        />
      )}
    </div>
  );
};

const GridGuides = () => (
  <div style={{ position: "absolute", inset: 0, zIndex: 50, pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,150,255,0.3)" }} />
    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,150,255,0.3)" }} />
    <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, background: "rgba(0,150,255,0.15)" }} />
    <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, background: "rgba(0,150,255,0.15)" }} />
    <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, background: "rgba(0,150,255,0.15)" }} />
    <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, background: "rgba(0,150,255,0.15)" }} />
  </div>
);

/* Slide type layouts */
const CoverSlide = ({ slide, onUpdate, onFieldFocus }: {
  slide: CarouselSlide; onUpdate: SlideRendererProps["onUpdate"]; onFieldFocus?: SlideRendererProps["onFieldFocus"];
}) => (
  <div className="flex flex-col items-center justify-center h-full px-16 text-center" style={{ position: "relative", zIndex: 2 }}>
    <div className="w-20 h-1 mb-8" style={{ backgroundColor: "#e94560" }} />
    <EditableText value={slide.title} onChange={(v) => onUpdate("title", v)} tag="h1"
      className="leading-tight mb-8 w-full"
      style={getTextStyle(slide.titleStyle, { fontSize: 48, textAlign: "center", color: "#ffffff" })}
      onFocus={() => onFieldFocus?.("title")} />
    <div className="w-20 h-1 mt-4 mb-8" style={{ backgroundColor: "#e94560" }} />
    <p className="text-xl opacity-70 mt-4" style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>Deslize →</p>
    <Footer />
  </div>
);

const ContentSlide = ({ slide, onUpdate, onFieldFocus }: {
  slide: CarouselSlide; onUpdate: SlideRendererProps["onUpdate"]; onFieldFocus?: SlideRendererProps["onFieldFocus"];
}) => (
  <div className="flex flex-col h-full px-14 py-16" style={{ position: "relative", zIndex: 2 }}>
    {slide.number && (
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-6"
        style={{ backgroundColor: "#e94560", color: "#ffffff" }}>{slide.number}</div>
    )}
    <EditableText value={slide.title} onChange={(v) => onUpdate("title", v)} tag="h2"
      className="mb-6 w-full" style={getTextStyle(slide.titleStyle, { fontSize: 30 })}
      onFocus={() => onFieldFocus?.("title")} />
    {slide.body && (
      <EditableText value={slide.body} onChange={(v) => onUpdate("body", v)} tag="p"
        className="leading-relaxed opacity-90 flex-1 w-full"
        style={getTextStyle(slide.bodyStyle, { fontSize: 20, fontWeight: "normal", color: "#ffffff" })}
        onFocus={() => onFieldFocus?.("body")} />
    )}
    {slide.emoji && (
      <div className="text-7xl mt-auto pt-6 text-center" style={{ position: "relative", zIndex: 2 }}>{slide.emoji}</div>
    )}
    <Footer />
  </div>
);

const CTASlide = ({ slide, onUpdate, onFieldFocus }: {
  slide: CarouselSlide; onUpdate: SlideRendererProps["onUpdate"]; onFieldFocus?: SlideRendererProps["onFieldFocus"];
}) => (
  <div className="flex flex-col items-center justify-center h-full px-16 text-center" style={{ position: "relative", zIndex: 2 }}>
    <div className="text-6xl mb-8">🎢</div>
    <EditableText value={slide.title} onChange={(v) => onUpdate("title", v)} tag="h2"
      className="mb-6 w-full" style={getTextStyle(slide.titleStyle, { fontSize: 40, textAlign: "center" })}
      onFocus={() => onFieldFocus?.("title")} />
    <p className="text-2xl opacity-80 mb-4" style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>@orlandofastpass</p>
    <p className="text-lg opacity-60" style={{ position: "relative", zIndex: 2, color: "#ffffff" }}>orlandofastpass.com.br</p>
    <Footer />
  </div>
);

export function SlideRenderer({
  slide, index, total, onUpdate, onFieldFocus, onMoveSticker,
  onMoveTextBox, onMoveShape, onMoveImage, onResizeImage,
  onUpdateTextBox, onDeleteElement, selectedElementId, onSelectElement,
  exportMode, scale = 0.45, showGrid,
}: SlideRendererProps) {
  const isLoadingImage = slide.backgroundImage === "loading";
  const gFrom = slide.gradientFrom || "#1a1a2e";
  const gTo = slide.gradientTo || "#16213e";
  const overlayOpacity = slide.overlayOpacity ?? 0.75;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId && !["title", "body"].includes(selectedElementId)) {
      // Only delete if not editing text
      const active = document.activeElement;
      if (active && (active as HTMLElement).contentEditable === "true") return;
      e.preventDefault();
      onDeleteElement?.(selectedElementId);
      onSelectElement?.(null);
    }
  }, [selectedElementId, onDeleteElement, onSelectElement]);

  return (
    <div
      className="slide-root relative overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectElement?.(null);
      }}
      style={{
        width: 1080, height: 1350,
        background: `linear-gradient(180deg, ${gFrom} 0%, ${gTo} 100%)`,
        color: "#ffffff",
        fontFamily: "'Inter', system-ui, sans-serif",
        transform: exportMode ? undefined : `scale(${scale})`,
        transformOrigin: "top left",
        outline: "none",
      }}
    >
      <style>{`
        .slide-root h2 { color: #e94560; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <BackgroundImage src={isLoadingImage ? undefined : slide.backgroundImage} />
      {slide.backgroundImage && slide.backgroundImage !== "loading" && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, ${gFrom} 0%, ${gTo} 100%)`,
          opacity: overlayOpacity, zIndex: 1,
        }} />
      )}
      {isLoadingImage && <LoadingOverlay />}
      {showGrid && <GridGuides />}
      {/* Images */}
      {slide.images?.map((img) => (
        <DraggableImage key={img.id} img={img} onMove={onMoveImage} onResize={onResizeImage}
          scale={scale} isSelected={selectedElementId === img.id}
          onSelect={(id) => onSelectElement?.(id)} />
      ))}
      {/* Shapes */}
      {slide.shapes?.map((shape) => (
        <DraggableShape key={shape.id} shape={shape} onMove={onMoveShape} scale={scale} />
      ))}
      {/* Text boxes */}
      {slide.textBoxes?.map((tb) => (
        <DraggableTextBox key={tb.id} tb={tb} onMove={onMoveTextBox} onUpdateText={onUpdateTextBox} scale={scale} />
      ))}
      {/* Stickers */}
      {slide.stickers?.map((sticker) => (
        <DraggableSticker key={sticker.id} sticker={sticker} onMove={onMoveSticker} scale={scale} />
      ))}
      {slide.type === "cover" && <CoverSlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
      {slide.type === "content" && <ContentSlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
      {slide.type === "cta" && <CTASlide slide={slide} onUpdate={onUpdate} onFieldFocus={onFieldFocus} />}
    </div>
  );
}

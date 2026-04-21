import { useState, useRef, useCallback, useEffect } from "react";
import { CarouselData, CarouselSlide, TextStyle } from "@/types/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Type, Image, Palette, TextCursorInput, Settings2,
  Sparkles, Download, Upload, RotateCcw, AlignLeft, AlignCenter,
  AlignRight, Sun, Moon, Search, Check, Loader2, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import JSZip from "jszip";

// ─── Props ────────────────────────────────────────────────────
interface PostCreatorProps {
  initialCarousel?: CarouselData | null;
  onSave?: (carousel: CarouselData) => void;
  onBack?: () => void;
}

// ─── Color Presets ────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: "Midnight Blue", gradientFrom: "#0a1628", gradientTo: "#060d18", titleColor: "#ffffff", bodyColor: "#93c5fd" },
  { name: "Executive Gold", gradientFrom: "#1a1a2e", gradientTo: "#000000", titleColor: "#d4a853", bodyColor: "#f5f0e8" },
  { name: "Emerald", gradientFrom: "#064e3b", gradientTo: "#051a0a", titleColor: "#4ade80", bodyColor: "#ffffff" },
  { name: "Royal Purple", gradientFrom: "#3b0764", gradientTo: "#0f0720", titleColor: "#c084fc", bodyColor: "#ffffff" },
  { name: "Sunset", gradientFrom: "#7c2d12", gradientTo: "#1a0a05", titleColor: "#fb923c", bodyColor: "#ffffff" },
  { name: "Ocean", gradientFrom: "#0c4a6e", gradientTo: "#0a1628", titleColor: "#22d3ee", bodyColor: "#ffffff" },
  { name: "Rose", gradientFrom: "#4c0519", gradientTo: "#1a0a10", titleColor: "#f9a8d4", bodyColor: "#ffffff" },
  { name: "Neon", gradientFrom: "#0a0a0f", gradientTo: "#0d1a0a", titleColor: "#83F714", bodyColor: "#ffffff" },
  { name: "Clean Dark", gradientFrom: "#0f0f0f", gradientTo: "#1a1a1a", titleColor: "#ffffff", bodyColor: "#a1a1aa" },
  { name: "Fire", gradientFrom: "#1a0505", gradientTo: "#0d0000", titleColor: "#ef4444", bodyColor: "#ffffff" },
  { name: "OFP Blue", gradientFrom: "#0A0A0F", gradientTo: "#12121A", titleColor: "#3377AF", bodyColor: "#ffffff" },
  { name: "OFP Green", gradientFrom: "#0A0A0F", gradientTo: "#0d1a0a", titleColor: "#83F714", bodyColor: "#ffffff" },
];

// ─── Font Options ─────────────────────────────────────────────
const FONT_OPTIONS = [
  "Space Grotesk", "Montserrat", "Playfair Display", "Poppins", "Roboto",
  "Oswald", "Lato", "Raleway", "Bebas Neue", "Inter",
];

// ─── Tabs ─────────────────────────────────────────────────────
type TabId = "texto" | "imagens" | "cores" | "fontes" | "ajustes";
const TABS: { id: TabId; label: string; icon: typeof Type }[] = [
  { id: "texto", label: "TEXTO", icon: Type },
  { id: "imagens", label: "IMAGENS", icon: Image },
  { id: "cores", label: "CORES", icon: Palette },
  { id: "fontes", label: "FONTES", icon: TextCursorInput },
  { id: "ajustes", label: "AJUSTES", icon: Settings2 },
];

// ─── Google Fonts loader ──────────────────────────────────────
function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}:wght@400;700;900&display=swap`;
  document.head.appendChild(link);
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function PostCreator({ initialCarousel, onSave, onBack }: PostCreatorProps) {
  // ── State ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("texto");
  const [carousel, setCarousel] = useState<CarouselData | null>(initialCarousel ?? null);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Text inputs
  const [mainText, setMainText] = useState("");
  const [handle, setHandle] = useState("@orlandofastpass");
  const [keyword1, setKeyword1] = useState("");
  const [keyword2, setKeyword2] = useState("");
  const [cta, setCta] = useState("Salve para depois!");
  const [numSlides, setNumSlides] = useState<5 | 7 | 9>(7);

  // Style state
  const [titleFont, setTitleFont] = useState("Space Grotesk");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [titleSize, setTitleSize] = useState(48);
  const [bodySize, setBodySize] = useState(20);
  const [fontSearch, setFontSearch] = useState("");

  // Ajustes
  const [overlayOpacity, setOverlayOpacity] = useState(0.92);
  const [textShadow, setTextShadow] = useState(true);
  const [shadowIntensity, setShadowIntensity] = useState(6);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [exportHD, setExportHD] = useState(true);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load fonts on mount
  useEffect(() => {
    FONT_OPTIONS.forEach(loadGoogleFont);
  }, []);

  // Sync from initialCarousel
  useEffect(() => {
    if (initialCarousel) {
      setCarousel(initialCarousel);
      setMainText(initialCarousel.topic || "");
      if (initialCarousel.slides.length > 0) {
        const s = initialCarousel.slides[0];
        if (s.titleStyle?.fontFamily) setTitleFont(s.titleStyle.fontFamily);
        if (s.bodyStyle?.fontFamily) setBodyFont(s.bodyStyle.fontFamily);
        if (s.titleStyle?.fontSize) setTitleSize(s.titleStyle.fontSize);
        if (s.bodyStyle?.fontSize) setBodySize(s.bodyStyle.fontSize);
        if (s.overlayOpacity !== undefined) setOverlayOpacity(s.overlayOpacity);
        if (s.titleStyle?.textShadow !== undefined) setTextShadow(s.titleStyle.textShadow);
        if (s.titleStyle?.textShadowIntensity !== undefined) setShadowIntensity(s.titleStyle.textShadowIntensity);
        if (s.titleStyle?.letterSpacing !== undefined) setLetterSpacing(s.titleStyle.letterSpacing);
        if (s.titleStyle?.lineHeight !== undefined) setLineHeight(s.titleStyle.lineHeight);
        if (s.titleStyle?.textAlign) setTextAlign(s.titleStyle.textAlign);
      }
    }
  }, [initialCarousel]);

  // ── Generate carousel via AI ──────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!mainText.trim()) {
      toast.error("Digite o texto principal do carrossel");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-carousel", {
        body: {
          topic: mainText,
          style: "Educativo",
          tone: "Profissional",
          num_slides: numSlides,
          instagram_handle: handle,
          keywords: [keyword1, keyword2].filter(Boolean),
          cta,
        },
      });
      if (error) throw error;

      const slides: CarouselSlide[] = (data.slides || []).map((s: any, i: number) => ({
        type: i === 0 ? "cover" : i === (data.slides?.length || numSlides) - 1 ? "cta" : "content",
        title: s.title || "",
        body: s.body || "",
        emoji: s.emoji || "",
        number: i > 0 && i < (data.slides?.length || numSlides) - 1 ? i : undefined,
        gradientFrom: "#0A0A0F",
        gradientTo: "#12121A",
        overlayOpacity: 0.92,
        titleStyle: {
          fontSize: titleSize,
          fontWeight: "bold" as const,
          color: "#3377AF",
          fontFamily: titleFont,
          textShadow: true,
          textShadowIntensity: 6,
          textAlign: "left" as const,
          letterSpacing: 0,
          lineHeight: 1.2,
        },
        bodyStyle: {
          fontSize: bodySize,
          fontWeight: "normal" as const,
          color: "#ffffff",
          fontFamily: bodyFont,
          lineHeight: 1.5,
          textAlign: "left" as const,
        },
        textBoxes: [],
        shapes: [],
        stickers: [],
        images: [],
      }));

      const newCarousel: CarouselData = {
        topic: mainText,
        style: "Educativo",
        tone: "Profissional",
        num_slides: numSlides,
        slides,
        status: "rascunho",
        caption: data.caption || "",
        hashtags: data.hashtags || "",
      };

      setCarousel(newCarousel);
      setSelectedSlide(0);
      toast.success(`Carrossel gerado com ${slides.length} slides!`);

      // Save to Supabase
      try {
        const { data: saved, error: saveErr } = await supabase
          .from("carousels")
          .insert({
            topic: newCarousel.topic,
            style: newCarousel.style,
            slides: newCarousel.slides as any,
            status: "rascunho",
            tone: newCarousel.tone,
            num_slides: newCarousel.num_slides,
            caption: newCarousel.caption,
            hashtags: newCarousel.hashtags,
          })
          .select()
          .single();
        if (!saveErr && saved) {
          newCarousel.id = saved.id;
          setCarousel({ ...newCarousel, id: saved.id });
        }
      } catch {}

      onSave?.(newCarousel);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar carrossel");
    } finally {
      setIsGenerating(false);
    }
  }, [mainText, handle, keyword1, keyword2, cta, numSlides, titleFont, bodyFont, titleSize, bodySize, onSave]);

  // ── Apply color preset ────────────────────────────────────
  const applyColorPreset = useCallback(
    (preset: (typeof COLOR_PRESETS)[number]) => {
      if (!carousel) return;
      const updated = carousel.slides.map((s) => ({
        ...s,
        gradientFrom: preset.gradientFrom,
        gradientTo: preset.gradientTo,
        titleStyle: { ...s.titleStyle, color: preset.titleColor },
        bodyStyle: { ...s.bodyStyle, color: preset.bodyColor },
      }));
      setCarousel({ ...carousel, slides: updated });
      toast.success(`Tema "${preset.name}" aplicado!`);
    },
    [carousel]
  );

  // ── Apply fonts ───────────────────────────────────────────
  const applyFonts = useCallback(() => {
    if (!carousel) return;
    loadGoogleFont(titleFont);
    loadGoogleFont(bodyFont);
    const updated = carousel.slides.map((s) => ({
      ...s,
      titleStyle: { ...s.titleStyle, fontFamily: titleFont, fontSize: titleSize },
      bodyStyle: { ...s.bodyStyle, fontFamily: bodyFont, fontSize: bodySize },
    }));
    setCarousel({ ...carousel, slides: updated });
    toast.success("Fontes aplicadas!");
  }, [carousel, titleFont, bodyFont, titleSize, bodySize]);

  // ── Apply adjustments ─────────────────────────────────────
  const applyAdjustments = useCallback(() => {
    if (!carousel) return;
    const updated = carousel.slides.map((s) => ({
      ...s,
      overlayOpacity,
      titleStyle: {
        ...s.titleStyle,
        textShadow,
        textShadowIntensity: shadowIntensity,
        letterSpacing,
        lineHeight,
        textAlign,
      },
      bodyStyle: {
        ...s.bodyStyle,
        textAlign,
        lineHeight,
      },
    }));
    setCarousel({ ...carousel, slides: updated });
    toast.success("Ajustes aplicados!");
  }, [carousel, overlayOpacity, textShadow, shadowIntensity, letterSpacing, lineHeight, textAlign]);

  // ── Image upload per slide ────────────────────────────────
  const handleImageUpload = useCallback(
    (slideIdx: number, file: File) => {
      if (!carousel) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const updated = [...carousel.slides];
        updated[slideIdx] = { ...updated[slideIdx], backgroundImage: url };
        setCarousel({ ...carousel, slides: updated });
        toast.success(`Imagem aplicada ao slide ${slideIdx + 1}`);
      };
      reader.readAsDataURL(file);
    },
    [carousel]
  );

  // ── Invert gradient ───────────────────────────────────────
  const invertColors = useCallback(() => {
    if (!carousel) return;
    const updated = carousel.slides.map((s) => ({
      ...s,
      gradientFrom: s.gradientTo,
      gradientTo: s.gradientFrom,
    }));
    setCarousel({ ...carousel, slides: updated });
    toast.success("Cores invertidas!");
  }, [carousel]);

  // ── Export ────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!carousel || carousel.slides.length === 0) {
      toast.error("Nenhum slide para exportar");
      return;
    }
    setIsExporting(true);
    try {
      const scale = exportHD ? 2 : 1;
      const zip = new JSZip();

      for (let i = 0; i < carousel.slides.length; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        const dataUrl = await toPng(el, {
          width: 1080 * scale,
          height: 1350 * scale,
          style: { transform: `scale(${scale})`, transformOrigin: "top left" },
          cacheBust: true,
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carrossel-${carousel.topic?.replace(/\s+/g, "-").slice(0, 30) || "export"}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Carrossel exportado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao exportar: " + (err.message || ""));
    } finally {
      setIsExporting(false);
    }
  }, [carousel, exportHD]);

  // ── Helpers ───────────────────────────────────────────────
  const slides = carousel?.slides ?? [];
  const bg = darkMode ? "#0A0A0F" : "#f8fafc";
  const surface = darkMode ? "#12121A" : "#ffffff";
  const textPrimary = darkMode ? "#E2E8F0" : "#0f172a";
  const textSecondary = darkMode ? "#94A3B8" : "#64748b";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const accent = "#3377AF";
  const accentGreen = "#83F714";

  const filteredFonts = FONT_OPTIONS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  // ── Slide Renderer ────────────────────────────────────────
  const renderSlide = (slide: CarouselSlide, idx: number, mini = false) => {
    const ts = slide.titleStyle || {};
    const bs = slide.bodyStyle || {};
    const w = mini ? 110 : 1080;
    const h = mini ? 137.5 : 1350;
    const scale = mini ? 110 / 1080 : 1;

    return (
      <div
        key={idx}
        ref={mini ? undefined : (el) => { slideRefs.current[idx] = el; }}
        style={{
          width: mini ? 110 : 1080,
          height: mini ? 137.5 : 1350,
          overflow: "hidden",
          borderRadius: mini ? 8 : 0,
          position: "relative",
          cursor: mini ? "pointer" : "default",
          border: mini && idx === selectedSlide ? `2px solid ${accent}` : mini ? `1px solid ${border}` : "none",
          flexShrink: 0,
        }}
        onClick={mini ? () => setSelectedSlide(idx) : undefined}
      >
        {/* Inner content scaled down for mini */}
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: mini ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
            position: mini ? "absolute" : "relative",
            top: 0,
            left: 0,
          }}
        >
          {/* Background image */}
          {slide.backgroundImage && (
            <img
              src={slide.backgroundImage}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${slide.gradientFrom || "#0A0A0F"} 0%, ${slide.gradientTo || "#12121A"} 100%)`,
              opacity: slide.backgroundImage ? (slide.overlayOpacity ?? 0.92) : 1,
            }}
          />
          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "80px 72px",
              gap: 32,
            }}
          >
            {/* Emoji */}
            {slide.emoji && (
              <span style={{ fontSize: 64, lineHeight: 1 }}>{slide.emoji}</span>
            )}
            {/* Number badge */}
            {slide.number && slide.type === "content" && (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: ts.color || accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  color: slide.gradientFrom || "#0A0A0F",
                  fontFamily: ts.fontFamily || "Space Grotesk",
                }}
              >
                {slide.number}
              </div>
            )}
            {/* Title */}
            <h2
              style={{
                fontSize: ts.fontSize || 48,
                fontWeight: (ts.fontWeight as any) || "bold",
                color: ts.color || "#ffffff",
                fontFamily: ts.fontFamily || "Space Grotesk",
                textAlign: ts.textAlign || "left",
                letterSpacing: ts.letterSpacing ? `${ts.letterSpacing}px` : undefined,
                lineHeight: ts.lineHeight || 1.2,
                textShadow: ts.textShadow
                  ? `0 2px ${ts.textShadowIntensity || 6}px rgba(0,0,0,0.7)`
                  : "none",
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {slide.title}
            </h2>
            {/* Body */}
            {slide.body && (
              <p
                style={{
                  fontSize: bs.fontSize || 20,
                  fontWeight: (bs.fontWeight as any) || "normal",
                  color: bs.color || "#ffffff",
                  fontFamily: bs.fontFamily || "Inter",
                  textAlign: bs.textAlign || "left",
                  lineHeight: bs.lineHeight || 1.5,
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {slide.body}
              </p>
            )}
          </div>
          {/* Handle watermark */}
          {handle && (
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 72,
                fontSize: 18,
                color: "rgba(255,255,255,0.35)",
                fontFamily: ts.fontFamily || "Space Grotesk",
              }}
            >
              {handle}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── TAB CONTENT ──────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      // ── TEXTO ───────────────────────────────────────
      case "texto":
        return (
          <div className="flex flex-col gap-5 p-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: textSecondary }}>
                Texto principal do carrossel
              </label>
              <Textarea
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                placeholder="Cole aqui o conteudo que voce quer transformar em carrossel..."
                rows={5}
                className="resize-none text-base"
                style={{
                  backgroundColor: surface,
                  borderColor: border,
                  color: textPrimary,
                  minHeight: 120,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
                  @Instagram
                </label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@seuhandle"
                  style={{ backgroundColor: surface, borderColor: border, color: textPrimary }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
                  CTA
                </label>
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Salve para depois!"
                  style={{ backgroundColor: surface, borderColor: border, color: textPrimary }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
                  Palavra-chave 1
                </label>
                <Input
                  value={keyword1}
                  onChange={(e) => setKeyword1(e.target.value)}
                  placeholder="Ex: Orlando"
                  style={{ backgroundColor: surface, borderColor: border, color: textPrimary }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
                  Palavra-chave 2
                </label>
                <Input
                  value={keyword2}
                  onChange={(e) => setKeyword2(e.target.value)}
                  placeholder="Ex: Disney"
                  style={{ backgroundColor: surface, borderColor: border, color: textPrimary }}
                />
              </div>
            </div>

            {/* Slide count */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: textSecondary }}>
                Numero de slides
              </label>
              <div className="flex gap-2">
                {([5, 7, 9] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumSlides(n)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: numSlides === n ? accent : surface,
                      color: numSlides === n ? "#ffffff" : textSecondary,
                      border: `1px solid ${numSlides === n ? accent : border}`,
                      minHeight: 48,
                    }}
                  >
                    {n} slides
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !mainText.trim()}
              className="w-full h-14 text-base font-bold rounded-xl gap-2"
              style={{
                background: isGenerating ? surface : `linear-gradient(135deg, ${accent}, ${accentGreen})`,
                color: "#ffffff",
                border: "none",
                minHeight: 56,
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Gerar Carrossel com IA
                </>
              )}
            </Button>

            {/* Preview grid after generation */}
            {slides.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: textSecondary }}>
                  Preview ({slides.length} slides)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {slides.map((s, i) => renderSlide(s, i, true))}
                </div>
              </div>
            )}
          </div>
        );

      // ── IMAGENS ─────────────────────────────────────
      case "imagens":
        return (
          <div className="flex flex-col gap-5 p-5">
            <p className="text-sm" style={{ color: textSecondary }}>
              Toque em um slide para adicionar ou trocar a imagem de fundo.
            </p>
            {slides.length === 0 ? (
              <div className="text-center py-16" style={{ color: textSecondary }}>
                <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Gere um carrossel primeiro</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {slides.map((s, i) => (
                  <div key={i} className="relative group">
                    {renderSlide(s, i, true)}
                    <label
                      className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                      <Upload className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(i, f);
                        }}
                      />
                    </label>
                    {s.backgroundImage && (
                      <div
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: accentGreen }}
                      >
                        <Check className="h-3 w-3 text-black" />
                      </div>
                    )}
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── CORES ───────────────────────────────────────
      case "cores":
        return (
          <div className="flex flex-col gap-5 p-5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
              Temas de cores
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const isActive =
                  carousel?.slides[0]?.gradientFrom === preset.gradientFrom &&
                  carousel?.slides[0]?.titleStyle?.color === preset.titleColor;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className="relative rounded-xl overflow-hidden transition-all"
                    style={{
                      height: 80,
                      border: isActive ? `2px solid ${accent}` : `1px solid ${border}`,
                      minHeight: 48,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`,
                      }}
                    />
                    <div className="relative z-10 h-full flex flex-col items-start justify-end p-3">
                      <span
                        className="text-xs font-bold"
                        style={{ color: preset.titleColor }}
                      >
                        {preset.name}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: preset.bodyColor, opacity: 0.7 }}
                      >
                        Aa Bb Cc
                      </span>
                    </div>
                    {isActive && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: accent }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom colors */}
            <div className="flex flex-col gap-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                Cores personalizadas
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: textSecondary }}>Cor do titulo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={carousel?.slides[0]?.titleStyle?.color || "#3377AF"}
                      onChange={(e) => {
                        if (!carousel) return;
                        const updated = carousel.slides.map((s) => ({
                          ...s,
                          titleStyle: { ...s.titleStyle, color: e.target.value },
                        }));
                        setCarousel({ ...carousel, slides: updated });
                      }}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                      style={{ minHeight: 40, minWidth: 40 }}
                    />
                    <span className="text-xs font-mono" style={{ color: textSecondary }}>
                      {carousel?.slides[0]?.titleStyle?.color || "#3377AF"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: textSecondary }}>Cor do corpo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={carousel?.slides[0]?.bodyStyle?.color || "#ffffff"}
                      onChange={(e) => {
                        if (!carousel) return;
                        const updated = carousel.slides.map((s) => ({
                          ...s,
                          bodyStyle: { ...s.bodyStyle, color: e.target.value },
                        }));
                        setCarousel({ ...carousel, slides: updated });
                      }}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                      style={{ minHeight: 40, minWidth: 40 }}
                    />
                    <span className="text-xs font-mono" style={{ color: textSecondary }}>
                      {carousel?.slides[0]?.bodyStyle?.color || "#ffffff"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invert */}
            <Button
              onClick={invertColors}
              variant="outline"
              className="w-full gap-2 h-12"
              style={{ borderColor: border, color: textPrimary, backgroundColor: surface, minHeight: 48 }}
              disabled={!carousel}
            >
              <RotateCcw className="h-4 w-4" />
              Inverter Cores
            </Button>
          </div>
        );

      // ── FONTES ──────────────────────────────────────
      case "fontes":
        return (
          <div className="flex flex-col gap-5 p-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: textSecondary }} />
              <Input
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                placeholder="Buscar fontes..."
                className="pl-10"
                style={{ backgroundColor: surface, borderColor: border, color: textPrimary }}
              />
            </div>

            {/* Title font */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: textSecondary }}>
                Fonte do titulo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {filteredFonts.map((f) => (
                  <button
                    key={`title-${f}`}
                    onClick={() => { setTitleFont(f); loadGoogleFont(f); }}
                    className="py-3 px-3 rounded-xl text-left transition-all"
                    style={{
                      fontFamily: f,
                      backgroundColor: titleFont === f ? `${accent}20` : surface,
                      border: `1px solid ${titleFont === f ? accent : border}`,
                      color: titleFont === f ? accent : textPrimary,
                      minHeight: 48,
                    }}
                  >
                    <span className="text-base font-bold block leading-tight">Aa Bb Cc</span>
                    <span className="text-[10px] opacity-60 block mt-0.5" style={{ fontFamily: "Inter" }}>{f}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body font */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: textSecondary }}>
                Fonte do corpo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {filteredFonts.map((f) => (
                  <button
                    key={`body-${f}`}
                    onClick={() => { setBodyFont(f); loadGoogleFont(f); }}
                    className="py-3 px-3 rounded-xl text-left transition-all"
                    style={{
                      fontFamily: f,
                      backgroundColor: bodyFont === f ? `${accent}20` : surface,
                      border: `1px solid ${bodyFont === f ? accent : border}`,
                      color: bodyFont === f ? accent : textPrimary,
                      minHeight: 48,
                    }}
                  >
                    <span className="text-sm block leading-tight">Aa Bb Cc</span>
                    <span className="text-[10px] opacity-60 block mt-0.5" style={{ fontFamily: "Inter" }}>{f}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size sliders */}
            <div className="flex flex-col gap-4 pt-3" style={{ borderTop: `1px solid ${border}` }}>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: textSecondary }}>Tamanho titulo</label>
                  <span className="text-xs font-mono" style={{ color: accent }}>{titleSize}px</span>
                </div>
                <Slider
                  value={[titleSize]}
                  onValueChange={([v]) => setTitleSize(v)}
                  min={32}
                  max={64}
                  step={2}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: textSecondary }}>Tamanho corpo</label>
                  <span className="text-xs font-mono" style={{ color: accent }}>{bodySize}px</span>
                </div>
                <Slider
                  value={[bodySize]}
                  onValueChange={([v]) => setBodySize(v)}
                  min={14}
                  max={24}
                  step={1}
                />
              </div>
            </div>

            {/* Apply */}
            <Button
              onClick={applyFonts}
              className="w-full h-12 font-bold gap-2"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentGreen})`,
                color: "#ffffff",
                border: "none",
                minHeight: 48,
              }}
              disabled={!carousel}
            >
              <Check className="h-4 w-4" />
              Aplicar Fontes
            </Button>
          </div>
        );

      // ── AJUSTES ─────────────────────────────────────
      case "ajustes":
        return (
          <div className="flex flex-col gap-5 p-5">
            {/* Overlay opacity */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                  Opacidade do overlay
                </label>
                <span className="text-xs font-mono" style={{ color: accent }}>
                  {Math.round(overlayOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[overlayOpacity]}
                onValueChange={([v]) => setOverlayOpacity(v)}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            {/* Text shadow */}
            <div className="flex items-center justify-between py-2" style={{ minHeight: 48 }}>
              <label className="text-sm font-medium" style={{ color: textPrimary }}>
                Sombra do texto
              </label>
              <Switch checked={textShadow} onCheckedChange={setTextShadow} />
            </div>
            {textShadow && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs" style={{ color: textSecondary }}>Intensidade</label>
                  <span className="text-xs font-mono" style={{ color: accent }}>{shadowIntensity}px</span>
                </div>
                <Slider
                  value={[shadowIntensity]}
                  onValueChange={([v]) => setShadowIntensity(v)}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
            )}

            {/* Letter spacing */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                  Espacamento entre letras
                </label>
                <span className="text-xs font-mono" style={{ color: accent }}>{letterSpacing}px</span>
              </div>
              <Slider
                value={[letterSpacing]}
                onValueChange={([v]) => setLetterSpacing(v)}
                min={-2}
                max={10}
                step={0.5}
              />
            </div>

            {/* Line height */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
                  Altura da linha
                </label>
                <span className="text-xs font-mono" style={{ color: accent }}>{lineHeight.toFixed(1)}</span>
              </div>
              <Slider
                value={[lineHeight]}
                onValueChange={([v]) => setLineHeight(v)}
                min={1}
                max={2.5}
                step={0.1}
              />
            </div>

            {/* Text alignment */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: textSecondary }}>
                Alinhamento
              </label>
              <div className="flex gap-2">
                {([
                  { value: "left" as const, icon: AlignLeft },
                  { value: "center" as const, icon: AlignCenter },
                  { value: "right" as const, icon: AlignRight },
                ]).map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTextAlign(value)}
                    className="flex-1 flex items-center justify-center py-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: textAlign === value ? `${accent}20` : surface,
                      border: `1px solid ${textAlign === value ? accent : border}`,
                      color: textAlign === value ? accent : textSecondary,
                      minHeight: 48,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Export quality */}
            <div className="flex items-center justify-between py-2" style={{ minHeight: 48 }}>
              <div>
                <label className="text-sm font-medium block" style={{ color: textPrimary }}>
                  Qualidade HD
                </label>
                <span className="text-xs" style={{ color: textSecondary }}>
                  {exportHD ? "2160x2700 (2x)" : "1080x1350 (1x)"}
                </span>
              </div>
              <Switch checked={exportHD} onCheckedChange={setExportHD} />
            </div>

            {/* Apply */}
            <Button
              onClick={applyAdjustments}
              className="w-full h-12 font-bold gap-2"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentGreen})`,
                color: "#ffffff",
                border: "none",
                minHeight: 48,
              }}
              disabled={!carousel}
            >
              <Check className="h-4 w-4" />
              Aplicar Ajustes
            </Button>
          </div>
        );
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: bg, color: textPrimary }}
    >
      {/* ── TOP BAR ──────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 56,
          minHeight: 56,
          borderBottom: `1px solid ${border}`,
          backgroundColor: surface,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ minWidth: 40, minHeight: 40 }}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: textSecondary }} />
          </button>
        )}
        <h1 className="text-sm font-bold tracking-widest flex-1" style={{ color: textPrimary }}>
          POST <span style={{ color: accent }}>CREATOR</span>
        </h1>
        {/* Mobile preview toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="sm:hidden p-2 rounded-lg"
          style={{ minWidth: 40, minHeight: 40, color: showPreview ? accent : textSecondary }}
        >
          {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </header>

      {/* ── TAB BAR ──────────────────────────────────────── */}
      <nav
        className="flex shrink-0"
        style={{
          borderBottom: `1px solid ${border}`,
          backgroundColor: surface,
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all relative"
              style={{
                color: isActive ? accent : textSecondary,
                minHeight: 48,
              }}
            >
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold tracking-wider">{label}</span>
              {isActive && (
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 24,
                    height: 2,
                    backgroundColor: accent,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — tab content */}
        <div
          className={`${showPreview ? "hidden sm:flex" : "flex"} flex-col overflow-hidden`}
          style={{
            width: "100%",
            maxWidth: 480,
            borderRight: `1px solid ${border}`,
          }}
        >
          <ScrollArea className="flex-1">
            {renderTabContent()}
          </ScrollArea>
        </div>

        {/* Right panel — desktop always / mobile toggle */}
        <div
          className={`${showPreview ? "flex" : "hidden sm:flex"} flex-1 flex-col overflow-hidden`}
          style={{ backgroundColor: darkMode ? "#08080C" : "#f1f5f9" }}
        >
          {slides.length > 0 ? (
            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* Selected slide large preview */}
                <div className="flex justify-center mb-6">
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 360,
                      aspectRatio: "1080/1350",
                      position: "relative",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: "scale(1)",
                        transformOrigin: "top left",
                      }}
                    >
                      {renderSlide(slides[selectedSlide], selectedSlide)}
                    </div>
                    {/* Scale to fit container */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Actually render at full res and scale down with CSS */}
                    <style>{`
                      .slide-preview-container > div:first-child {
                        width: 1080px !important;
                        height: 1350px !important;
                      }
                    `}</style>
                  </div>
                </div>

                {/* Slide number */}
                <p className="text-center text-xs font-medium mb-4" style={{ color: textSecondary }}>
                  Slide {selectedSlide + 1} de {slides.length}
                </p>

                {/* Grid thumbnails */}
                <div className="grid grid-cols-5 gap-2">
                  {slides.map((s, i) => renderSlide(s, i, true))}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${accent}15` }}
                >
                  <Sparkles className="h-8 w-8" style={{ color: accent }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: textPrimary }}>
                  Nenhum carrossel criado
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  Use a aba TEXTO para gerar seu carrossel com IA
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden full-size slides for export */}
      <div
        style={{
          position: "absolute",
          left: -99999,
          top: -99999,
          pointerEvents: "none",
        }}
      >
        {slides.map((s, i) => renderSlide(s, i, false))}
      </div>

      {/* ── BOTTOM BAR ───────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 72,
          minHeight: 72,
          borderTop: `1px solid ${border}`,
          backgroundColor: surface,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <Button
          onClick={handleExport}
          disabled={isExporting || slides.length === 0}
          className="flex-1 h-12 text-base font-bold rounded-xl gap-2"
          style={{
            background: slides.length > 0
              ? `linear-gradient(135deg, ${accent}, ${accentGreen})`
              : surface,
            color: slides.length > 0 ? "#ffffff" : textSecondary,
            border: slides.length > 0 ? "none" : `1px solid ${border}`,
            minHeight: 48,
          }}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Exportar!
            </>
          )}
        </Button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-xl transition-colors"
          style={{
            backgroundColor: `${accent}15`,
            color: accent,
            minWidth: 48,
            minHeight: 48,
          }}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

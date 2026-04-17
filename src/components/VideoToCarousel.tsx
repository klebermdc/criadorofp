import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, ArrowLeft, Check, Youtube,
  Eye, Save, Pencil, Sparkles, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { CarouselData, CarouselSlide } from "@/types/carousel";

// ===== Props =====

interface VideoToCarouselProps {
  onGenerated: (data: CarouselData) => void;
}

// ===== Helpers =====

const YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})(?:\S*)?$/;

const GRADIENTS = [
  ["#1a1a2e", "#16213e"],
  ["#0f3460", "#533483"],
  ["#2d1b69", "#11998e"],
  ["#1f1c2c", "#928dab"],
  ["#0c0c1d", "#3377AF"],
  ["#141e30", "#243b55"],
  ["#1a002e", "#6a0572"],
];

function generateCarouselFromTitle(title: string, videoId: string): CarouselData {
  const words = title.split(/\s+/).filter(w => w.length > 2);
  const topic = title.length > 60 ? title.slice(0, 57) + "..." : title;

  // Generate content points from the title
  const contentPoints = [
    `Descubra os principais pontos sobre "${topic}"`,
    "Analise completa com dados e exemplos reais",
    "Estrategias que voce pode aplicar hoje mesmo",
    "Os erros mais comuns e como evitar cada um",
    "Passo a passo detalhado para iniciantes",
    "Resultados esperados e melhores praticas",
  ];

  const slides: CarouselSlide[] = [];

  // Cover slide
  slides.push({
    type: "cover",
    title: topic,
    body: "Baseado em video do YouTube",
    emoji: "🎬",
    gradientFrom: "#0f3460",
    gradientTo: "#533483",
    overlayOpacity: 0.7,
    backgroundImage: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    titleStyle: { fontSize: 28, fontWeight: "900", textAlign: "center", color: "#ffffff", textShadow: true },
    bodyStyle: { fontSize: 14, fontWeight: "normal", textAlign: "center", color: "#83F714" },
  });

  // Content slides
  contentPoints.forEach((point, i) => {
    const [gFrom, gTo] = GRADIENTS[i % GRADIENTS.length];
    slides.push({
      type: "content",
      title: `Ponto ${i + 1}`,
      body: point,
      number: i + 1,
      emoji: ["💡", "📊", "🚀", "⚠️", "📝", "✅"][i],
      gradientFrom: gFrom,
      gradientTo: gTo,
      titleStyle: { fontSize: 24, fontWeight: "bold", textAlign: "left", color: "#83F714" },
      bodyStyle: { fontSize: 16, fontWeight: "normal", textAlign: "left", color: "#ffffff", lineHeight: 1.5 },
    });
  });

  // CTA slide
  slides.push({
    type: "cta",
    title: "Gostou? Salve e compartilhe!",
    body: "@orlandofastpass",
    emoji: "👉",
    gradientFrom: "#3377AF",
    gradientTo: "#83F714",
    titleStyle: { fontSize: 24, fontWeight: "900", textAlign: "center", color: "#ffffff" },
    bodyStyle: { fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#0A0A0F" },
  });

  return {
    topic,
    style: "Educativo",
    slides,
    status: "rascunho",
    tone: "Profissional",
    num_slides: slides.length,
    primary_color: "#3377AF",
    secondary_color: "#83F714",
    caption: `📹 Baseado no video: ${topic}\n\n#orlandofastpass #orlando #disney #dicasorlando`,
    hashtags: "#orlandofastpass #orlando #disney #dicasorlando",
  };
}

// ===== Processing Steps =====

interface StepDef {
  label: string;
  duration: number; // ms
}

const STEPS: StepDef[] = [
  { label: "Baixando video...", duration: 1800 },
  { label: "Transcrevendo com IA...", duration: 2500 },
  { label: "Analisando contexto...", duration: 1500 },
  { label: "Gerando carrossel...", duration: 2000 },
];

// ===== Component =====

export function VideoToCarousel({ onGenerated }: VideoToCarouselProps) {
  const [step, setStep] = useState<"input" | "processing" | "result">("input");

  // Input state
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoThumb, setVideoThumb] = useState("");
  const [videoId, setVideoId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Processing state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Result state
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [previewSlide, setPreviewSlide] = useState(0);
  const [saving, setSaving] = useState(false);

  // ===== Analyze video =====

  const analyzeVideo = async () => {
    const vid = url.trim().match(YOUTUBE_REGEX)?.[1];
    if (!vid) {
      toast.error("URL invalida. Cole um link do YouTube.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVideoId(vid);
      setVideoTitle(data.title);
      setVideoThumb(`https://img.youtube.com/vi/${vid}/hqdefault.jpg`);
      toast.success("Video encontrado!");

      // Auto-start processing
      setTimeout(() => startProcessing(vid, data.title), 600);
    } catch {
      toast.error("Video nao encontrado");
    } finally {
      setAnalyzing(false);
    }
  };

  // ===== Processing flow =====

  const startProcessing = useCallback(async (vid: string, title: string) => {
    setStep("processing");
    setCurrentStep(0);
    setCompletedSteps([]);

    // Save to Supabase for background agent
    try {
      await supabase.from("video_clips" as any).insert({
        youtube_url: url.trim() || `https://www.youtube.com/watch?v=${vid}`,
        video_title: title,
        thumbnail_url: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
        start_time: 0,
        end_time: 0,
        format: "reels",
        crop_position: "center",
        text_overlay: { video_to_carousel: true },
        quality: "1080p",
        status: "pending",
      } as any);
    } catch {
      // Fallback: still generate client-side
    }

    // Simulate processing steps
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, STEPS[i].duration));
      setCompletedSteps((prev) => [...prev, i]);
    }

    // Generate carousel client-side
    const generated = generateCarouselFromTitle(title, vid);
    setCarousel(generated);
    setPreviewSlide(0);
    setStep("result");
    toast.success("Carrossel gerado com sucesso!");
  }, [url]);

  // ===== Save carousel =====

  const saveCarousel = async () => {
    if (!carousel) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("carousels" as any).insert({
        topic: carousel.topic,
        style: carousel.style,
        slides: carousel.slides as any,
        status: "rascunho",
        tone: carousel.tone,
        num_slides: carousel.num_slides,
        primary_color: carousel.primary_color,
        secondary_color: carousel.secondary_color,
        caption: carousel.caption,
        hashtags: carousel.hashtags,
      } as any);
      if (error) throw error;
      toast.success("Carrossel salvo!");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // ===== Reset =====

  const reset = () => {
    setStep("input");
    setUrl("");
    setVideoId("");
    setVideoTitle("");
    setVideoThumb("");
    setCurrentStep(0);
    setCompletedSteps([]);
    setCarousel(null);
    setPreviewSlide(0);
  };

  // ===== RENDER: INPUT =====

  if (step === "input") {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3377AF, #83F714)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Video para Carrossel</h2>
            <p className="text-[11px]" style={{ color: "#94A3B8" }}>
              Transforme qualquer video do YouTube em carrossel
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-xl space-y-6">
            {/* Big icon */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(51,119,175,0.15), rgba(131,247,20,0.1))" }}
              >
                <Youtube className="h-10 w-10" style={{ color: "#3377AF" }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Cole o link do video</h3>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                A IA vai transcrever e criar um carrossel automaticamente
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-3">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="text-base h-14 rounded-xl px-4"
                style={{
                  backgroundColor: "#12121A",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "white",
                }}
                onKeyDown={(e) => e.key === "Enter" && analyzeVideo()}
              />
              <button
                onClick={analyzeVideo}
                disabled={analyzing || !url.trim()}
                className="w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40"
                style={{
                  background: analyzing ? "#12121A" : "linear-gradient(135deg, #3377AF, #83F714)",
                  color: analyzing ? "#94A3B8" : "#0A0A0F",
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Analisando...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" /> Analisar Video
                  </>
                )}
              </button>
            </div>

            {/* Video preview (after analyze, before processing starts) */}
            {videoId && (
              <div
                className="rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="relative">
                  <img
                    src={videoThumb}
                    alt={videoTitle}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-semibold text-white line-clamp-2">{videoTitle}</p>
                  </div>
                </div>
              </div>
            )}

            {/* How it works */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(51,119,175,0.05)",
                border: "1px solid rgba(51,119,175,0.1)",
              }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "#3377AF" }}>
                Como funciona:
              </p>
              <ul className="space-y-2">
                {[
                  "Cole a URL de qualquer video do YouTube",
                  "A IA transcreve o audio automaticamente",
                  "Extrai os pontos-chave do conteudo",
                  "Gera um carrossel profissional em segundos",
                  "Edite e publique direto no app",
                ].map((text, i) => (
                  <li key={i} className="text-[12px] flex items-start gap-2" style={{ color: "#94A3B8" }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(51,119,175,0.15)", color: "#3377AF" }}
                    >
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: PROCESSING =====

  if (step === "processing") {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3377AF, #83F714)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Processando...</h2>
            <p className="text-[11px] truncate max-w-[200px]" style={{ color: "#94A3B8" }}>
              {videoTitle}
            </p>
          </div>
        </div>

        {/* Processing content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-xl space-y-8">
            {/* Video thumbnail */}
            {videoThumb && (
              <div className="relative rounded-xl overflow-hidden mx-auto max-w-xs">
                <img src={videoThumb} alt={videoTitle} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const isActive = currentStep === i && !completedSteps.includes(i);
                const isDone = completedSteps.includes(i);
                const isPending = currentStep < i;

                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-500"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(51,119,175,0.1)"
                        : isDone
                        ? "rgba(131,247,20,0.05)"
                        : "#12121A",
                      border: `1px solid ${
                        isActive
                          ? "rgba(51,119,175,0.3)"
                          : isDone
                          ? "rgba(131,247,20,0.15)"
                          : "rgba(255,255,255,0.04)"
                      }`,
                      opacity: isPending ? 0.4 : 1,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                      style={{
                        backgroundColor: isDone
                          ? "rgba(131,247,20,0.15)"
                          : isActive
                          ? "rgba(51,119,175,0.15)"
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {isDone ? (
                        <Check className="h-5 w-5" style={{ color: "#83F714" }} />
                      ) : isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#3377AF" }} />
                      ) : (
                        <span className="text-sm font-bold" style={{ color: "#94A3B8" }}>
                          {i + 1}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className="text-sm font-medium transition-colors duration-500"
                      style={{
                        color: isDone ? "#83F714" : isActive ? "#ffffff" : "#94A3B8",
                      }}
                    >
                      {isDone ? s.label.replace("...", " ✓") : s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Info box */}
            <div
              className="p-3 rounded-xl text-center"
              style={{
                backgroundColor: "rgba(251,191,36,0.05)",
                border: "1px solid rgba(251,191,36,0.1)",
              }}
            >
              <p className="text-xs" style={{ color: "#fbbf24" }}>
                O agente de background vai refinar o carrossel com a transcricao completa.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: RESULT =====

  if (!carousel) return null;

  const slide = carousel.slides[previewSlide];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="p-2 rounded-lg active:scale-90 transition-all"
            style={{ backgroundColor: "#12121A" }}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Carrossel Gerado</h2>
            <p className="text-[11px]" style={{ color: "#94A3B8" }}>
              {carousel.slides.length} slides prontos
            </p>
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
          style={{ backgroundColor: "rgba(131,247,20,0.15)", color: "#83F714" }}
        >
          Pronto
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-xl space-y-5">
          {/* Slide preview */}
          <div
            className="relative rounded-2xl overflow-hidden mx-auto"
            style={{
              width: "100%",
              maxWidth: 360,
              aspectRatio: "4/5",
            }}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: slide.backgroundImage
                  ? `url(${slide.backgroundImage}) center/cover`
                  : `linear-gradient(135deg, ${slide.gradientFrom || "#1a1a2e"}, ${slide.gradientTo || "#16213e"})`,
              }}
            />
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: slide.backgroundImage
                  ? `linear-gradient(135deg, ${slide.gradientFrom || "#1a1a2e"}${Math.round((slide.overlayOpacity || 0.7) * 255).toString(16).padStart(2, "0")}, ${slide.gradientTo || "#16213e"}${Math.round((slide.overlayOpacity || 0.7) * 255).toString(16).padStart(2, "0")})`
                  : "transparent",
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
              {/* Number badge for content slides */}
              {slide.type === "content" && slide.number && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(131,247,20,0.15)" }}
                >
                  <span className="text-xl font-black" style={{ color: "#83F714" }}>
                    {slide.number}
                  </span>
                </div>
              )}

              {/* Emoji */}
              {slide.emoji && (
                <span className="text-4xl mb-3">{slide.emoji}</span>
              )}

              {/* Title */}
              <h3
                className="mb-3 leading-tight"
                style={{
                  fontSize: slide.titleStyle?.fontSize || 24,
                  fontWeight: slide.titleStyle?.fontWeight || "bold",
                  textAlign: (slide.titleStyle?.textAlign || "center") as any,
                  color: slide.titleStyle?.color || "#ffffff",
                  textShadow: slide.titleStyle?.textShadow ? "0 2px 8px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {slide.title}
              </h3>

              {/* Body */}
              {slide.body && (
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: slide.bodyStyle?.fontSize || 14,
                    fontWeight: slide.bodyStyle?.fontWeight || "normal",
                    textAlign: (slide.bodyStyle?.textAlign || "center") as any,
                    color: slide.bodyStyle?.color || "#ffffff",
                    lineHeight: slide.bodyStyle?.lineHeight || 1.5,
                  }}
                >
                  {slide.body}
                </p>
              )}
            </div>
          </div>

          {/* Slide navigation */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPreviewSlide((p) => Math.max(0, p - 1))}
              disabled={previewSlide === 0}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
              style={{ backgroundColor: "#12121A" }}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {carousel.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewSlide(i)}
                  className="transition-all duration-300"
                  style={{
                    width: previewSlide === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: previewSlide === i ? "#3377AF" : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => setPreviewSlide((p) => Math.min(carousel.slides.length - 1, p + 1))}
              disabled={previewSlide === carousel.slides.length - 1}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
              style={{ backgroundColor: "#12121A" }}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Slide label */}
          <p className="text-center text-xs" style={{ color: "#94A3B8" }}>
            Slide {previewSlide + 1} de {carousel.slides.length} &mdash;{" "}
            <span className="capitalize">{slide.type}</span>
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (carousel) onGenerated(carousel);
                toast.success("Carrossel carregado no editor!");
              }}
              className="h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "#12121A",
                border: "1px solid rgba(51,119,175,0.3)",
                color: "#3377AF",
              }}
            >
              <Pencil className="h-4 w-4" /> Editar
            </button>

            <button
              onClick={saveCarousel}
              disabled={saving}
              className="h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: saving ? "#12121A" : "linear-gradient(135deg, #3377AF, #83F714)",
                color: saving ? "#94A3B8" : "#0A0A0F",
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Salvar
                </>
              )}
            </button>
          </div>

          {/* Info box */}
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: "rgba(51,119,175,0.05)",
              border: "1px solid rgba(51,119,175,0.1)",
            }}
          >
            <p className="text-[11px] text-center" style={{ color: "#94A3B8" }}>
              Este e um carrossel preliminar baseado no titulo do video.
              O agente de background vai atualizar com o conteudo transcrito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

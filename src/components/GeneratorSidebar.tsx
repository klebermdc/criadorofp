import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, CarouselStyle, CarouselData, TONES, CarouselTone, SLIDE_COUNTS, SLIDE_TEMPLATES, SlideTemplate, TemplateCategory } from "@/types/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, History, Trash2, ImageIcon, Wand2, Clock, LayoutTemplate, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneratorSidebarProps {
  onGenerated: (data: CarouselData) => void;
  onLoadCarousel: (data: CarouselData) => void;
  onUpdateSlides: (updater: (prev: CarouselData) => CarouselData) => void;
  currentCarousel: CarouselData | null;
}

export function GeneratorSidebar({ onGenerated, onLoadCarousel, onUpdateSlides, currentCarousel }: GeneratorSidebarProps) {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<CarouselStyle>("Dicas");
  const [tone, setTone] = useState<CarouselTone>("Profissional");
  const [numSlides, setNumSlides] = useState<number>(7);
  const [primaryColor, setPrimaryColor] = useState("#3377AF");
  const [secondaryColor, setSecondaryColor] = useState("#83F714");
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [history, setHistory] = useState<CarouselData[]>([]);
  const [progress, setProgress] = useState(0);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("carousels")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setHistory(data as unknown as CarouselData[]);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const generateImages = async (carousel: CarouselData) => {
    setGeneratingImages(true);
    const topicText = carousel.topic;

    onUpdateSlides((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => ({ ...s, backgroundImage: "loading" })),
    }));

    const types = ["cover", "content", "cta"] as const;
    const imageMap: Record<string, string> = {};

    try {
      const results = await Promise.allSettled(
        types.map(async (slideType) => {
          const { data, error } = await supabase.functions.invoke("generate-slide-image", {
            body: { topic: topicText, slideType },
          });
          if (error) throw error;
          return { slideType, imageUrl: data.imageUrl };
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.imageUrl) {
          imageMap[result.value.slideType] = result.value.imageUrl;
        }
      }

      onUpdateSlides((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => ({
          ...s,
          backgroundImage: imageMap[s.type] || undefined,
        })),
      }));

      const count = Object.keys(imageMap).length;
      if (count > 0) {
        toast.success(`${count} imagens de fundo geradas!`);
      } else {
        toast.error("Nao foi possivel gerar imagens. Tente novamente.");
        onUpdateSlides((prev) => ({
          ...prev,
          slides: prev.slides.map((s) => ({ ...s, backgroundImage: undefined })),
        }));
      }
    } catch (e) {
      console.error("Image generation error:", e);
      toast.error("Erro ao gerar imagens de fundo");
      onUpdateSlides((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => ({ ...s, backgroundImage: undefined })),
      }));
    } finally {
      setGeneratingImages(false);
    }
  };

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Digite um tema para o carrossel");
      return;
    }
    setLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke("generate-carousel", {
        body: { topic, style, tone, numSlides },
      });
      if (error) throw error;
      setProgress(100);
      const carousel: CarouselData = {
        topic, style, slides: data.slides,
        tone, num_slides: numSlides,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        status: "rascunho",
        caption: data.caption || "",
        hashtags: data.hashtags || "",
      };

      const { data: saved } = await supabase
        .from("carousels")
        .insert({ topic, style, slides: data.slides as any })
        .select()
        .single();

      if (saved) {
        carousel.id = saved.id;
        carousel.created_at = saved.created_at;
      }

      onGenerated(carousel);
      loadHistory();
      toast.success("Carrossel gerado! Gerando imagens de fundo...");

      setTimeout(() => generateImages(carousel), 100);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gerar carrossel: " + (e.message || "Tente novamente"));
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
      setProgress(0);
    }
  };

  const deleteCarousel = async (id: string) => {
    await supabase.from("carousels").delete().eq("id", id);
    loadHistory();
    toast.success("Carrossel removido");
  };

  const colorPresets = [
    "#3377AF", "#83F714", "#e94560", "#8b5cf6", "#f97316",
    "#06b6d4", "#ec4899", "#22c55e", "#fbbf24", "#ef4444",
  ];

  return (
    <div className="w-full md:w-80 flex flex-col h-full" style={{ borderRight: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
      <ScrollArea className="flex-1">
        {/* Form */}
        <div className="p-5 space-y-5">
          {/* Topic */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
              Tema do carrossel
            </label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: 10 dicas para economizar no Magic Kingdom..."
              className="resize-none text-sm"
              style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
              rows={4}
            />
          </div>

          {/* Style selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
              Estilo
            </label>
            <Select value={style} onValueChange={(v) => setStyle(v as CarouselStyle)}>
              <SelectTrigger style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
              Tom
            </label>
            <Select value={tone} onValueChange={(v) => setTone(v as CarouselTone)}>
              <SelectTrigger style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of slides */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
              Numero de slides
            </label>
            <div className="flex gap-2">
              {SLIDE_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumSlides(n)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: numSlides === n ? "#3377AF" : "#12121A",
                    color: numSlides === n ? "white" : "#94A3B8",
                    border: `1px solid ${numSlides === n ? "#3377AF" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Brand colors */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
              Cores da marca
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <span className="text-[10px] block mb-1" style={{ color: "#94A3B8" }}>Primaria</span>
                <div className="flex gap-1 flex-wrap">
                  {colorPresets.slice(0, 5).map((c) => (
                    <button
                      key={`p-${c}`}
                      onClick={() => setPrimaryColor(c)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        border: primaryColor === c ? "2px solid white" : "2px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[10px] block mb-1" style={{ color: "#94A3B8" }}>Secundaria</span>
                <div className="flex gap-1 flex-wrap">
                  {colorPresets.slice(5).map((c) => (
                    <button
                      key={`s-${c}`}
                      onClick={() => setSecondaryColor(c)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        border: secondaryColor === c ? "2px solid white" : "2px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Templates section */}
          <TemplatesSection onApplyTemplate={(t) => {
            if (currentCarousel) {
              onUpdateSlides((prev) => ({
                ...prev,
                slides: prev.slides.map((s) => ({
                  ...s,
                  titleStyle: { ...s.titleStyle, ...t.titleStyle },
                  bodyStyle: { ...s.bodyStyle, ...t.bodyStyle },
                  gradientFrom: t.gradientFrom,
                  gradientTo: t.gradientTo,
                  overlayOpacity: t.overlayOpacity,
                  ...(t.titlePosition ? { titlePosition: t.titlePosition } : {}),
                  ...(t.bodyPosition ? { bodyPosition: t.bodyPosition } : {}),
                })),
              }));
              toast.success(`Template "${t.name}" aplicado!`);
            } else {
              toast.error("Gere um carrossel primeiro");
            }
          }} />

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || generatingImages}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading ? "#12121A" : "linear-gradient(135deg, #3377AF 0%, #83F714 100%)",
              color: loading ? "#94A3B8" : "#0A0A0F",
              border: loading ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando... {Math.round(progress)}%
              </>
            ) : generatingImages ? (
              <>
                <ImageIcon className="h-4 w-4 animate-pulse" />
                Gerando imagens...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Gerar com IA
              </>
            )}
          </button>

          {/* Progress bar */}
          {loading && (
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#12121A" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #3377AF, #83F714)",
                }}
              />
            </div>
          )}

          {currentCarousel && !generatingImages && (
            <Button
              variant="outline"
              onClick={() => generateImages(currentCarousel)}
              disabled={generatingImages}
              className="w-full gap-2 text-xs"
              style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#12121A" }}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Regenerar imagens de fundo
            </Button>
          )}
        </div>

        {/* Separator */}
        <div className="mx-5 my-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

        {/* History */}
        <div className="p-5 pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
              Recentes
            </span>
          </div>
          <div className="space-y-1.5">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg cursor-pointer transition-all group hover:scale-[1.01]"
                style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.05)" }}
                onClick={() => onLoadCarousel(item)}
              >
                <p className="text-sm font-medium truncate text-white">{item.topic}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(51,119,175,0.15)", color: "#3377AF" }}>
                      {item.style}
                    </span>
                    {item.created_at && (
                      <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCarousel(item.id!);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 mx-auto mb-2" style={{ color: "#3377AF", opacity: 0.3 }} />
                <p className="text-xs" style={{ color: "#94A3B8" }}>Nenhum carrossel gerado ainda</p>
                <p className="text-[10px] mt-1" style={{ color: "#94A3B8", opacity: 0.6 }}>Comece digitando um tema acima</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ===== Templates Section =====

const CATEGORIES: TemplateCategory[] = ["Todos", "Profissional", "Criativo", "Educativo", "Marketing", "Lifestyle", "Elegante", "Social Media", "Bold", "OFP"];

function TemplatesSection({ onApplyTemplate }: { onApplyTemplate: (t: SlideTemplate) => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<TemplateCategory>("Todos");

  const filtered = category === "Todos"
    ? SLIDE_TEMPLATES
    : SLIDE_TEMPLATES.filter((t) => t.category === category);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
        style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
      >
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" style={{ color: "#3377AF" }} />
          <span>Templates Prontos</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(51,119,175,0.15)", color: "#3377AF" }}>
            {SLIDE_TEMPLATES.length}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => {
              const count = cat === "Todos" ? SLIDE_TEMPLATES.length : SLIDE_TEMPLATES.filter((t) => t.category === cat).length;
              if (count === 0 && cat !== "Todos") return null;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: category === cat ? "rgba(51,119,175,0.2)" : "#12121A",
                    color: category === cat ? "#3377AF" : "#94A3B8",
                    border: `1px solid ${category === cat ? "#3377AF" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-3 gap-1.5 max-h-60 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {filtered.slice(0, 18).map((t) => (
              <button
                key={t.id}
                onClick={() => onApplyTemplate(t)}
                className="h-16 rounded-lg transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-0.5 text-center px-1 relative overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, ${t.gradientFrom}, ${t.gradientTo})`,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-[10px] font-bold truncate w-full" style={{ color: t.titleStyle.color }}>{t.name}</span>
                <span className="text-[8px] opacity-60" style={{ color: t.bodyStyle.color }}>Aa Bb</span>
              </button>
            ))}
          </div>

          {filtered.length > 18 && (
            <p className="text-[10px] text-center" style={{ color: "#94A3B8" }}>
              +{filtered.length - 18} templates — use o filtro por categoria
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, CarouselStyle, CarouselData } from "@/types/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, History, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface GeneratorSidebarProps {
  onGenerated: (data: CarouselData) => void;
  onLoadCarousel: (data: CarouselData) => void;
  onUpdateSlides: (updater: (prev: CarouselData) => CarouselData) => void;
  currentCarousel: CarouselData | null;
}

export function GeneratorSidebar({ onGenerated, onLoadCarousel, onUpdateSlides, currentCarousel }: GeneratorSidebarProps) {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<CarouselStyle>("Dicas");
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [history, setHistory] = useState<CarouselData[]>([]);

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

    // Mark all slides as loading
    onUpdateSlides((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => ({ ...s, backgroundImage: "loading" })),
    }));

    // Generate images for each unique type, then apply
    const types = ["cover", "content", "cta"] as const;
    const imageMap: Record<string, string> = {};

    try {
      // Generate all 3 types in parallel
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

      // Apply images to slides
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
        toast.error("Não foi possível gerar imagens. Tente novamente.");
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
    try {
      const { data, error } = await supabase.functions.invoke("generate-carousel", {
        body: { topic, style },
      });
      if (error) throw error;
      const carousel: CarouselData = { topic, style, slides: data.slides };

      // Save to DB
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

      // Auto-generate background images
      setTimeout(() => generateImages(carousel), 100);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gerar carrossel: " + (e.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  const deleteCarousel = async (id: string) => {
    await supabase.from("carousels").delete().eq("id", id);
    loadHistory();
  };

  return (
    <div className="w-full md:w-80 border-r border-border flex flex-col h-full bg-card/30">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold">
          <span style={{ color: "#e94560" }}>OFP</span> Carousel Generator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gerador de carrossel com IA</p>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4 border-b border-border">
        <div>
          <label className="text-sm font-medium mb-2 block">Tema do carrossel</label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: 10 dicas para economizar no Magic Kingdom"
            className="resize-none"
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Estilo</label>
          <Select value={style} onValueChange={(v) => setStyle(v as CarouselStyle)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate} disabled={loading || generatingImages} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Gerando texto..." : generatingImages ? "Gerando imagens..." : "Gerar Carrossel"}
        </Button>
        {currentCarousel && !generatingImages && (
          <Button
            variant="outline"
            onClick={() => generateImages(currentCarousel)}
            disabled={generatingImages}
            className="w-full gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Regenerar imagens de fundo
          </Button>
        )}
      </div>

      {/* History */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Histórico</span>
        </div>
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => onLoadCarousel(item)}
            >
              <p className="text-sm font-medium truncate">{item.topic}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{item.style}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCarousel(item.id!);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum carrossel gerado ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}

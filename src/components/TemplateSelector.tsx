import { useState, useMemo } from "react";
import { SLIDE_TEMPLATES, SlideTemplate, TemplateCategory } from "@/types/carousel";
import { LayoutTemplate, Search, Star, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TemplateSelectorProps {
  onApplyTemplate: (template: SlideTemplate) => void;
}

const CATEGORIES: TemplateCategory[] = [
  "Todos",
  "Business",
  "Criativo",
  "Lifestyle",
  "Tech",
  "Editorial",
  "Minimalista",
  "Bold",
  "Elegante",
  "Social Media",
  "Educacao",
];

const FEATURED_IDS = ["dark-pro", "neon-glow", "startup-pitch", "retro-wave", "midnight-luxe", "youtube-thumb"];

export function TemplateSelector({ onApplyTemplate }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeatured, setShowFeatured] = useState(true);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: SLIDE_TEMPLATES.length };
    for (const t of SLIDE_TEMPLATES) {
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    }
    return counts;
  }, []);

  const filteredTemplates = useMemo(() => {
    let list = SLIDE_TEMPLATES;
    if (activeCategory !== "Todos") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const featuredTemplates = useMemo(
    () => SLIDE_TEMPLATES.filter((t) => FEATURED_IDS.includes(t.id)),
    []
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutTemplate className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
          Templates
        </span>
        <span
          className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(51,119,175,0.15)", color: "#3377AF" }}
        >
          {SLIDE_TEMPLATES.length}
        </span>
      </div>

      {/* Search */}
      <div
        className="relative flex items-center rounded-lg overflow-hidden"
        style={{ background: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Search className="h-3 w-3 ml-2.5 shrink-0" style={{ color: "#64748b" }} />
        <input
          type="text"
          placeholder="Buscar template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs py-2 px-2 outline-none placeholder:text-slate-600"
          style={{ color: "#e2e8f0" }}
        />
      </div>

      {/* Category Tabs */}
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat !== "Todos") setShowFeatured(false);
                  else setShowFeatured(true);
                }}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200"
                style={{
                  background: isActive ? "rgba(51,119,175,0.2)" : "transparent",
                  color: isActive ? "#3377AF" : "#64748b",
                  border: isActive ? "1px solid rgba(51,119,175,0.3)" : "1px solid transparent",
                }}
              >
                {cat}
                <span
                  className="text-[9px] opacity-60"
                  style={{ color: isActive ? "#3377AF" : "#475569" }}
                >
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Featured Section */}
      {showFeatured && !searchQuery && activeCategory === "Todos" && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3" style={{ color: "#fbbf24" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#fbbf24" }}>
              Destaques
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <TooltipProvider delayDuration={200}>
              {featuredTemplates.map((t) => (
                <TemplateCard key={t.id} template={t} onApply={onApplyTemplate} featured />
              ))}
            </TooltipProvider>
          </div>
          <div
            className="w-full h-px my-1"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          />
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        <TooltipProvider delayDuration={200}>
          {filteredTemplates.map((t) => (
            <TemplateCard key={t.id} template={t} onApply={onApplyTemplate} />
          ))}
        </TooltipProvider>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs" style={{ color: "#64748b" }}>
            Nenhum template encontrado
          </p>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template: t,
  onApply,
  featured = false,
}: {
  template: SlideTemplate;
  onApply: (t: SlideTemplate) => void;
  featured?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onApply(t)}
          className="group relative h-20 rounded-lg transition-all duration-200 hover:scale-[1.04] hover:shadow-lg hover:shadow-black/30 flex flex-col items-center justify-center gap-1 text-center px-1.5 overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${t.gradientFrom}, ${t.gradientTo})`,
            border: featured
              ? "1px solid rgba(251,191,36,0.25)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.15)" }}
          />

          {/* Featured badge */}
          {featured && (
            <div
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: "#fbbf24" }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <span
              className="text-[10px] font-bold leading-tight line-clamp-1"
              style={{
                color: t.titleStyle.color,
                fontFamily: t.titleStyle.fontFamily,
                textShadow: t.titleStyle.textShadow
                  ? `0 1px 3px rgba(0,0,0,0.5)`
                  : undefined,
              }}
            >
              {t.name}
            </span>
            <span
              className="text-[14px] font-bold leading-none"
              style={{
                color: t.titleStyle.color,
                fontFamily: t.titleStyle.fontFamily,
                opacity: 0.7,
              }}
            >
              Aa
            </span>
            <span
              className="text-[8px] leading-none opacity-60"
              style={{
                color: t.bodyStyle.color,
                fontFamily: t.bodyStyle.fontFamily,
              }}
            >
              corpo texto
            </span>
          </div>

          {/* Category pill */}
          {t.category && (
            <div
              className="absolute bottom-1 left-1 px-1 py-px rounded text-[7px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                background: "rgba(0,0,0,0.5)",
                color: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(4px)",
              }}
            >
              {t.category}
            </div>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="text-xs font-medium">{t.name}</p>
        <p className="text-[10px] text-muted-foreground">{t.description}</p>
        {t.category && (
          <p className="text-[9px] mt-0.5" style={{ color: "#3377AF" }}>
            {t.category}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

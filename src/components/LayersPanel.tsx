import { CarouselSlide, SlideElement } from "@/types/carousel";
import { Eye, EyeOff, Trash2, Type, Sticker, Square, GripVertical, Image } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayersPanelProps {
  slide: CarouselSlide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteElement: (id: string) => void;
}

function getElements(slide: CarouselSlide): SlideElement[] {
  const elements: SlideElement[] = [];
  elements.push({ kind: "title", id: "title", label: slide.title.slice(0, 25) || "Título" });
  if (slide.body) {
    elements.push({ kind: "body", id: "body", label: slide.body.slice(0, 25) || "Corpo" });
  }
  slide.textBoxes?.forEach((tb) => {
    elements.push({ kind: "textbox", id: tb.id, label: tb.text.slice(0, 20) || "Texto", data: tb });
  });
  slide.images?.forEach((img) => {
    elements.push({ kind: "image", id: img.id, label: "Imagem", data: img });
  });
  slide.stickers?.forEach((s) => {
    elements.push({ kind: "sticker", id: s.id, label: s.emoji, data: s });
  });
  slide.shapes?.forEach((s) => {
    elements.push({ kind: "shape", id: s.id, label: s.type, data: s });
  });
  return elements;
}

const kindIcons = {
  title: Type,
  body: Type,
  textbox: Type,
  sticker: Sticker,
  shape: Square,
  image: Image,
};

export function LayersPanel({
  slide,
  selectedElementId,
  onSelectElement,
  onToggleVisibility,
  onDeleteElement,
}: LayersPanelProps) {
  const elements = getElements(slide);

  return (
    <div className="hidden md:flex w-52 bg-zinc-900 border-l border-zinc-800 flex-col h-full">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Camadas</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1.5 space-y-0.5">
          {elements.map((el) => {
            const Icon = kindIcons[el.kind];
            const isSelected = selectedElementId === el.id;
            const isBuiltIn = el.kind === "title" || el.kind === "body";
            const isVisible =
              el.kind === "textbox" ? (el as any).data?.visible !== false :
              el.kind === "shape" ? (el as any).data?.visible !== false : true;

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer group transition-colors text-xs ${
                  isSelected ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <GripVertical className="h-3 w-3 opacity-30" />
                <Icon className="h-3 w-3 shrink-0" />
                <span className="flex-1 truncate">{el.label}</span>
                {!isBuiltIn && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id); }}
                      className="p-0.5 rounded hover:bg-zinc-600"
                    >
                      {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteElement(el.id); }}
                      className="p-0.5 rounded hover:bg-red-900/50 text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {elements.length === 0 && (
            <p className="text-[10px] text-zinc-500 text-center py-4">Nenhum elemento</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

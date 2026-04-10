import { TextStyle, StickerItem, STICKER_CATEGORIES, GRADIENT_PRESETS } from "@/types/carousel";
import {
  Bold, AlignLeft, AlignCenter, AlignRight, Plus, Minus,
  Palette, Sticker, Layers, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SlideEditorProps {
  activeField: "title" | "body" | null;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
  overlayOpacity: number;
  gradientFrom: string;
  gradientTo: string;
  stickers: StickerItem[];
  onUpdateStyle: (field: "title" | "body", style: Partial<TextStyle>) => void;
  onUpdateOverlay: (opacity: number) => void;
  onUpdateGradient: (from: string, to: string) => void;
  onAddSticker: (emoji: string) => void;
  onRemoveSticker: (id: string) => void;
}

const TEXT_COLORS = [
  "#ffffff", "#e94560", "#ffd700", "#00ff88", "#00bfff",
  "#ff6b6b", "#c084fc", "#f97316", "#a3e635", "#f0f0f0",
];

export function SlideEditor({
  activeField, titleStyle, bodyStyle, overlayOpacity,
  gradientFrom, gradientTo, stickers,
  onUpdateStyle, onUpdateOverlay, onUpdateGradient,
  onAddSticker, onRemoveSticker,
}: SlideEditorProps) {
  const [tab, setTab] = useState("text");

  const currentStyle = activeField === "title" ? titleStyle : activeField === "body" ? bodyStyle : null;
  const fontSize = currentStyle?.fontSize || (activeField === "title" ? 48 : 20);

  return (
    <div className="w-full max-w-[500px] bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-4 rounded-none">
          <TabsTrigger value="text" className="gap-1 text-xs">
            <Bold className="h-3 w-3" /> Texto
          </TabsTrigger>
          <TabsTrigger value="stickers" className="gap-1 text-xs">
            <Sticker className="h-3 w-3" /> Figurinhas
          </TabsTrigger>
          <TabsTrigger value="background" className="gap-1 text-xs">
            <Palette className="h-3 w-3" /> Fundo
          </TabsTrigger>
          <TabsTrigger value="overlay" className="gap-1 text-xs">
            <Layers className="h-3 w-3" /> Overlay
          </TabsTrigger>
        </TabsList>

        {/* TEXT TAB */}
        <TabsContent value="text" className="p-3 space-y-3 m-0">
          {!activeField ? (
            <p className="text-xs text-muted-foreground text-center py-2">Clique em um texto no slide para editar</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">
                  {activeField === "title" ? "Título" : "Corpo"}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => onUpdateStyle(activeField, { fontSize: Math.max(12, fontSize - 4) })}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs w-8 text-center font-mono">{fontSize}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => onUpdateStyle(activeField, { fontSize: Math.min(120, fontSize + 4) })}>
                  <Plus className="h-3 w-3" />
                </Button>
                <div className="w-px h-5 bg-border" />
                <Button
                  variant={currentStyle?.fontWeight === "bold" ? "secondary" : "ghost"}
                  size="icon" className="h-7 w-7"
                  onClick={() => onUpdateStyle(activeField, {
                    fontWeight: currentStyle?.fontWeight === "bold" ? "normal" : "bold",
                  })}>
                  <Bold className="h-3 w-3" />
                </Button>
                <div className="w-px h-5 bg-border" />
                {(["left", "center", "right"] as const).map((align) => (
                  <Button key={align}
                    variant={(currentStyle?.textAlign || "left") === align ? "secondary" : "ghost"}
                    size="icon" className="h-7 w-7"
                    onClick={() => onUpdateStyle(activeField, { textAlign: align })}>
                    {align === "left" && <AlignLeft className="h-3 w-3" />}
                    {align === "center" && <AlignCenter className="h-3 w-3" />}
                    {align === "right" && <AlignRight className="h-3 w-3" />}
                  </Button>
                ))}
              </div>
              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Cor</span>
                <div className="flex gap-1.5 flex-wrap">
                  {TEXT_COLORS.map((color) => (
                    <button key={color}
                      onClick={() => onUpdateStyle(activeField, { color })}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        (currentStyle?.color || "#ffffff") === color ? "border-primary scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* STICKERS TAB */}
        <TabsContent value="stickers" className="p-3 m-0">
          <ScrollArea className="h-[180px]">
            {Object.entries(STICKER_CATEGORIES).map(([category, emojis]) => (
              <div key={category} className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{category}</p>
                <div className="flex flex-wrap gap-1">
                  {emojis.map((emoji, i) => (
                    <button key={`${category}-${i}`}
                      onClick={() => onAddSticker(emoji)}
                      className="w-9 h-9 flex items-center justify-center text-xl hover:bg-muted rounded-lg transition-colors">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
          {stickers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">No slide ({stickers.length})</p>
              <div className="flex gap-1 flex-wrap">
                {stickers.map((s) => (
                  <button key={s.id}
                    onClick={() => onRemoveSticker(s.id)}
                    className="w-8 h-8 flex items-center justify-center text-lg bg-muted rounded-lg hover:bg-destructive/20 transition-colors group relative">
                    {s.emoji}
                    <Trash2 className="h-2.5 w-2.5 absolute -top-1 -right-1 text-destructive opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* BACKGROUND TAB */}
        <TabsContent value="background" className="p-3 m-0">
          <p className="text-xs text-muted-foreground mb-2">Gradientes</p>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button key={preset.label}
                onClick={() => onUpdateGradient(preset.from, preset.to)}
                className={`h-10 rounded-lg border-2 transition-transform hover:scale-105 ${
                  gradientFrom === preset.from && gradientTo === preset.to
                    ? "border-primary" : "border-transparent"
                }`}
                style={{ background: `linear-gradient(180deg, ${preset.from}, ${preset.to})` }}
                title={preset.label}
              />
            ))}
          </div>
        </TabsContent>

        {/* OVERLAY TAB */}
        <TabsContent value="overlay" className="p-3 space-y-3 m-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20">Opacidade</span>
            <Slider
              value={[overlayOpacity * 100]}
              onValueChange={([v]) => onUpdateOverlay(v / 100)}
              min={0} max={100} step={5}
              className="flex-1"
            />
            <span className="text-xs font-mono w-10 text-right">{Math.round(overlayOpacity * 100)}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Controla a escuridão da camada sobre a imagem de fundo
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

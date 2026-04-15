import {
  TextStyle, StickerItem, ShapeItem, TextBoxItem,
  STICKER_CATEGORIES, GRADIENT_PRESETS, FONT_OPTIONS, SlideTemplate,
} from "@/types/carousel";
import {
  Bold, AlignLeft, AlignCenter, AlignRight, Plus, Minus,
  Palette, Sticker, Layers, Type, Square, Circle, Minus as LineIcon,
  SunDim, Sparkles, LetterText, MoveVertical, Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";

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
  onAddTextBox: () => void;
  onAddShape: (type: "circle" | "square" | "line") => void;
  onApplyTemplate: (template: SlideTemplate) => void;
  onOpenImageLibrary: () => void;
}

const TEXT_COLORS = [
  "#ffffff", "#000000", "#3377AF", "#83F714", "#ffd700", "#00ff88",
  "#00bfff", "#ff6b6b", "#c084fc", "#f97316", "#f0f0f0", "#6b7280",
];

type Section = "text" | "background" | "effects" | "elements";

export function SlideEditor({
  activeField, titleStyle, bodyStyle, overlayOpacity,
  gradientFrom, gradientTo, stickers,
  onUpdateStyle, onUpdateOverlay, onUpdateGradient,
  onAddSticker, onRemoveSticker, onAddTextBox, onAddShape, onApplyTemplate, onOpenImageLibrary,
}: SlideEditorProps) {
  const [section, setSection] = useState<Section>("text");

  const currentStyle = activeField === "title" ? titleStyle : activeField === "body" ? bodyStyle : null;
  const fontSize = currentStyle?.fontSize || (activeField === "title" ? 48 : 20);

  const sections: { key: Section; icon: React.ReactNode; label: string }[] = [
    { key: "text", icon: <Type className="h-4 w-4" />, label: "Texto" },
    { key: "background", icon: <Palette className="h-4 w-4" />, label: "Fundo" },
    { key: "effects", icon: <Sparkles className="h-4 w-4" />, label: "Efeitos" },
    { key: "elements", icon: <Layers className="h-4 w-4" />, label: "Elementos" },
  ];

  return (
    <div className="w-full overflow-hidden" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Section tabs */}
      <TooltipProvider delayDuration={150}>
        <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {sections.map((s) => (
            <Tooltip key={s.key}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSection(s.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
                  style={{
                    color: section === s.key ? "#3377AF" : "#94A3B8",
                    backgroundColor: section === s.key ? "rgba(51,119,175,0.08)" : "transparent",
                    borderBottom: section === s.key ? "2px solid #3377AF" : "2px solid transparent",
                  }}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>{s.label}</p></TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="p-3">
        {/* TEXT SECTION */}
        {section === "text" && (
          <div className="space-y-3">
            {!activeField ? (
              <p className="text-xs text-center py-3" style={{ color: "#94A3B8" }}>Clique em um texto no slide para editar</p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>
                  <span>{activeField === "title" ? "Titulo" : "Corpo"}</span>
                </div>
                {/* Font family */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 shrink-0" style={{ color: "#94A3B8" }}>Fonte</span>
                  <Select
                    value={currentStyle?.fontFamily || "Inter"}
                    onValueChange={(v) => onUpdateStyle(activeField, { fontFamily: v })}
                  >
                    <SelectTrigger className="h-7 text-xs text-white" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Size */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 shrink-0" style={{ color: "#94A3B8" }}>Tamanho</span>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([v]) => onUpdateStyle(activeField, { fontSize: v })}
                    min={12} max={72} step={1}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-white">{fontSize}</span>
                </div>
                {/* Weight + Align */}
                <div className="flex items-center gap-1">
                  <span className="text-xs w-14 shrink-0" style={{ color: "#94A3B8" }}>Estilo</span>
                  {(["normal", "bold", "900"] as const).map((w) => (
                    <Button key={w}
                      variant={currentStyle?.fontWeight === w ? "secondary" : "ghost"}
                      size="sm" className="h-7 text-xs px-2"
                      style={currentStyle?.fontWeight === w ? { backgroundColor: "rgba(51,119,175,0.2)", color: "#3377AF" } : { color: "#94A3B8" }}
                      onClick={() => onUpdateStyle(activeField, { fontWeight: w })}
                    >
                      {w === "normal" ? "Regular" : w === "bold" ? "Bold" : "Black"}
                    </Button>
                  ))}
                  <div className="w-px h-5 mx-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                  {(["left", "center", "right"] as const).map((align) => (
                    <Button key={align}
                      variant={(currentStyle?.textAlign || "left") === align ? "secondary" : "ghost"}
                      size="icon" className="h-7 w-7"
                      style={(currentStyle?.textAlign || "left") === align ? { backgroundColor: "rgba(51,119,175,0.2)", color: "#3377AF" } : { color: "#94A3B8" }}
                      onClick={() => onUpdateStyle(activeField, { textAlign: align })}
                    >
                      {align === "left" && <AlignLeft className="h-3 w-3" />}
                      {align === "center" && <AlignCenter className="h-3 w-3" />}
                      {align === "right" && <AlignRight className="h-3 w-3" />}
                    </Button>
                  ))}
                </div>
                {/* Color */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 shrink-0" style={{ color: "#94A3B8" }}>Cor</span>
                  <div className="flex gap-1 flex-wrap">
                    {TEXT_COLORS.map((color) => (
                      <button key={color}
                        onClick={() => onUpdateStyle(activeField, { color })}
                        className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          border: (currentStyle?.color || "#ffffff") === color ? "2px solid #3377AF" : "2px solid rgba(255,255,255,0.15)",
                          transform: (currentStyle?.color || "#ffffff") === color ? "scale(1.1)" : undefined,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* BACKGROUND SECTION */}
        {section === "background" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider" style={{ color: "#94A3B8" }}>
              Gradientes
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {GRADIENT_PRESETS.map((preset) => (
                <button key={preset.label}
                  onClick={() => onUpdateGradient(preset.from, preset.to)}
                  className="h-8 rounded-md transition-transform hover:scale-105"
                  style={{
                    background: `linear-gradient(180deg, ${preset.from}, ${preset.to})`,
                    border: gradientFrom === preset.from && gradientTo === preset.to
                      ? "2px solid #3377AF" : "1px solid rgba(255,255,255,0.08)",
                  }}
                  title={preset.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs w-20 shrink-0" style={{ color: "#94A3B8" }}>Overlay</span>
              <Slider
                value={[overlayOpacity * 100]}
                onValueChange={([v]) => onUpdateOverlay(v / 100)}
                min={0} max={100} step={5}
                className="flex-1"
              />
              <span className="text-xs font-mono w-10 text-right text-white">{Math.round(overlayOpacity * 100)}%</span>
            </div>
            {/* Templates */}
            <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <TemplateSelector onApplyTemplate={onApplyTemplate} />
            </div>
          </div>
        )}

        {/* EFFECTS SECTION */}
        {section === "effects" && (
          <div className="space-y-3">
            {!activeField ? (
              <p className="text-xs text-center py-3" style={{ color: "#94A3B8" }}>Clique em um texto para editar efeitos</p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>
                  <span>Efeitos - {activeField === "title" ? "Titulo" : "Corpo"}</span>
                </div>
                {/* Text shadow */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0" style={{ color: "#94A3B8" }}>Sombra</span>
                  <Switch
                    checked={currentStyle?.textShadow ?? false}
                    onCheckedChange={(v) => onUpdateStyle(activeField, { textShadow: v })}
                  />
                  {currentStyle?.textShadow && (
                    <>
                      <Slider
                        value={[currentStyle?.textShadowIntensity ?? 4]}
                        onValueChange={([v]) => onUpdateStyle(activeField, { textShadowIntensity: v })}
                        min={1} max={20} step={1}
                        className="flex-1"
                      />
                      <span className="text-xs font-mono w-6 text-white">{currentStyle?.textShadowIntensity ?? 4}</span>
                    </>
                  )}
                </div>
                {/* Text stroke */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0" style={{ color: "#94A3B8" }}>Contorno</span>
                  <Switch
                    checked={currentStyle?.textStroke ?? false}
                    onCheckedChange={(v) => onUpdateStyle(activeField, { textStroke: v })}
                  />
                  {currentStyle?.textStroke && (
                    <div className="flex gap-1 ml-2">
                      {["#000000", "#ffffff", "#3377AF", "#83F714"].map((c) => (
                        <button key={c}
                          onClick={() => onUpdateStyle(activeField, { textStrokeColor: c })}
                          className="w-5 h-5 rounded-full"
                          style={{
                            backgroundColor: c,
                            border: (currentStyle?.textStrokeColor || "#000000") === c ? "2px solid #3377AF" : "2px solid rgba(255,255,255,0.15)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Letter spacing */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0" style={{ color: "#94A3B8" }}>Espacamento</span>
                  <Slider
                    value={[currentStyle?.letterSpacing ?? 0]}
                    onValueChange={([v]) => onUpdateStyle(activeField, { letterSpacing: v })}
                    min={-2} max={20} step={0.5}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-white">{currentStyle?.letterSpacing ?? 0}px</span>
                </div>
                {/* Line height */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0" style={{ color: "#94A3B8" }}>Altura linha</span>
                  <Slider
                    value={[(currentStyle?.lineHeight ?? 1.4) * 100]}
                    onValueChange={([v]) => onUpdateStyle(activeField, { lineHeight: v / 100 })}
                    min={80} max={250} step={5}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-white">{(currentStyle?.lineHeight ?? 1.4).toFixed(1)}</span>
                </div>
                {/* Opacity */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0" style={{ color: "#94A3B8" }}>Opacidade</span>
                  <Slider
                    value={[(currentStyle?.opacity ?? 1) * 100]}
                    onValueChange={([v]) => onUpdateStyle(activeField, { opacity: v / 100 })}
                    min={10} max={100} step={5}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8 text-right text-white">{Math.round((currentStyle?.opacity ?? 1) * 100)}%</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ELEMENTS SECTION */}
        {section === "elements" && (
          <div className="space-y-3">
            {/* Add elements */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider" style={{ color: "#94A3B8" }}>
              Adicionar
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-white hover:text-white"
                style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={onAddTextBox}>
                <Type className="h-3 w-3" /> Texto
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-white hover:text-white"
                style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={onOpenImageLibrary}>
                <Image className="h-3 w-3" /> Imagem
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-white hover:text-white"
                style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => onAddShape("circle")}>
                <Circle className="h-3 w-3" /> Circulo
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-white hover:text-white"
                style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => onAddShape("square")}>
                <Square className="h-3 w-3" /> Quadrado
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-white hover:text-white"
                style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
                onClick={() => onAddShape("line")}>
                <Minus className="h-3 w-3" /> Linha
              </Button>
            </div>

            {/* Stickers */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider pt-2" style={{ color: "#94A3B8" }}>
              Figurinhas
            </div>
            <ScrollArea className="h-[140px]">
              {Object.entries(STICKER_CATEGORIES).map(([category, emojis]) => (
                <div key={category} className="mb-2">
                  <p className="text-[10px] font-medium mb-1" style={{ color: "#94A3B8" }}>{category}</p>
                  <div className="flex flex-wrap gap-0.5">
                    {emojis.map((emoji, i) => (
                      <button key={`${category}-${i}`}
                        onClick={() => onAddSticker(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded transition-colors"
                        style={{ backgroundColor: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#12121A")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
            {stickers.length > 0 && (
              <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] mb-1.5" style={{ color: "#94A3B8" }}>No slide ({stickers.length})</p>
                <div className="flex gap-1 flex-wrap">
                  {stickers.map((s) => (
                    <button key={s.id}
                      onClick={() => onRemoveSticker(s.id)}
                      className="w-7 h-7 flex items-center justify-center text-sm rounded transition-colors group relative"
                      style={{ backgroundColor: "#12121A" }}
                    >
                      {s.emoji}
                      <Trash2 className="h-2 w-2 absolute -top-0.5 -right-0.5 text-red-400 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { TextStyle } from "@/types/carousel";
import { Bold, AlignLeft, AlignCenter, AlignRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideEditorProps {
  activeField: "title" | "body" | null;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
  onUpdateStyle: (field: "title" | "body", style: Partial<TextStyle>) => void;
}

export function SlideEditor({ activeField, titleStyle, bodyStyle, onUpdateStyle }: SlideEditorProps) {
  if (!activeField) return null;

  const currentStyle = activeField === "title" ? titleStyle : bodyStyle;
  const fontSize = currentStyle.fontSize || (activeField === "title" ? 48 : 20);

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <span className="text-xs text-muted-foreground mr-2 capitalize">{activeField === "title" ? "Título" : "Corpo"}</span>

      {/* Font size */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onUpdateStyle(activeField, { fontSize: Math.max(12, fontSize - 4) })}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-xs w-8 text-center font-mono">{fontSize}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onUpdateStyle(activeField, { fontSize: Math.min(120, fontSize + 4) })}
      >
        <Plus className="h-3 w-3" />
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Bold */}
      <Button
        variant={currentStyle.fontWeight === "bold" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
        onClick={() =>
          onUpdateStyle(activeField, {
            fontWeight: currentStyle.fontWeight === "bold" ? "normal" : "bold",
          })
        }
      >
        <Bold className="h-3 w-3" />
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Alignment */}
      {(["left", "center", "right"] as const).map((align) => (
        <Button
          key={align}
          variant={(currentStyle.textAlign || "left") === align ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateStyle(activeField, { textAlign: align })}
        >
          {align === "left" && <AlignLeft className="h-3 w-3" />}
          {align === "center" && <AlignCenter className="h-3 w-3" />}
          {align === "right" && <AlignRight className="h-3 w-3" />}
        </Button>
      ))}
    </div>
  );
}

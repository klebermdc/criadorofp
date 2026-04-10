import { SLIDE_TEMPLATES, SlideTemplate } from "@/types/carousel";
import { LayoutTemplate } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TemplateSelectorProps {
  onApplyTemplate: (template: SlideTemplate) => void;
}

export function TemplateSelector({ onApplyTemplate }: TemplateSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <LayoutTemplate className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Templates</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <TooltipProvider delayDuration={200}>
          {SLIDE_TEMPLATES.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onApplyTemplate(t)}
                  className="h-14 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-all hover:scale-105 flex flex-col items-center justify-center gap-0.5 text-center px-1"
                  style={{
                    background: `linear-gradient(180deg, ${t.gradientFrom}, ${t.gradientTo})`,
                  }}
                >
                  <span className="text-[10px] font-bold" style={{ color: t.titleStyle.color }}>{t.name}</span>
                  <span className="text-[8px] opacity-70" style={{ color: t.bodyStyle.color }}>Aa</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}

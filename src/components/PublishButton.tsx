import { CarouselData } from "@/types/carousel";
import { Send } from "lucide-react";

interface PublishButtonProps {
  carousel: CarouselData | null;
  onPublish: () => void;
}

export function PublishButton({ carousel, onPublish }: PublishButtonProps) {
  if (!carousel || !carousel.slides || carousel.slides.length === 0) return null;

  return (
    <button
      onClick={onPublish}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(225,48,108,0.3)] active:scale-95"
      style={{
        background: "linear-gradient(135deg, #E1306C 0%, #F77737 100%)",
        color: "white",
      }}
    >
      <Send className="h-4 w-4" />
      Publicar
    </button>
  );
}

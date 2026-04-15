import { useState } from "react";
import { Search, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageLibraryProps {
  onSelectImage: (src: string) => void;
  onClose: () => void;
}

const QUICK_CATEGORIES = [
  "Orlando", "Disney", "Parques", "Hotel",
  "Restaurante", "Praia", "Aviao", "Familia",
];

const UNSPLASH_KEY = "x7JXYrrhbjZzf7iLu4I0XJTnlTqKb38UR8sPtq8CV2U";
const PEXELS_KEY = "IzZyDiEXUznH9VVUBbmTagHY81N5aTAKDSVyGY5MkRgN9Lvn4rzIvGf1";

interface ImageResult {
  id: string;
  thumb: string;
  full: string;
  alt: string;
}

export function ImageLibrary({ onSelectImage, onClose }: ImageLibraryProps) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchImages = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setImages([]);
    try {
      const unsplashRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=20&client_id=${UNSPLASH_KEY}`
      );
      if (unsplashRes.ok) {
        const data = await unsplashRes.json();
        const results: ImageResult[] = (data.results || []).map((r: any) => ({
          id: r.id,
          thumb: r.urls?.thumb || r.urls?.small,
          full: r.urls?.regular || r.urls?.full,
          alt: r.alt_description || term,
        }));
        setImages(results);
        if (results.length > 0) { setLoading(false); return; }
      }
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=20`,
        { headers: { Authorization: PEXELS_KEY } }
      );
      if (pexelsRes.ok) {
        const data = await pexelsRes.json();
        const results: ImageResult[] = (data.photos || []).map((p: any) => ({
          id: String(p.id),
          thumb: p.src?.tiny || p.src?.small,
          full: p.src?.large || p.src?.original,
          alt: p.alt || term,
        }));
        setImages(results);
      }
    } catch (e) {
      console.error("Image search error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Maximo 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onSelectImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="absolute top-0 right-0 w-72 h-full flex flex-col z-50" style={{ backgroundColor: "#0A0A0F", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Imagens</span>
        <button onClick={onClose} className="hover:text-white" style={{ color: "#94A3B8" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-2 space-y-2">
        <div className="flex gap-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchImages(query)}
            placeholder="Buscar imagens..."
            className="h-8 text-xs text-white"
            style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => searchImages(query)}>
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setQuery(cat); searchImages(cat); }}
              className="px-2 py-0.5 text-[10px] rounded-full transition-colors"
              style={{ backgroundColor: "#12121A", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1 text-white"
          style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
          onClick={handleUpload}>
          <Upload className="h-3 w-3" /> Upload (PNG, JPG, WEBP)
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#3377AF" }} />
          </div>
        )}
        <div className="grid grid-cols-3 gap-1">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => onSelectImage(img.full)}
              className="aspect-square rounded overflow-hidden hover:ring-2 hover:ring-[#3377AF] transition-all"
            >
              <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
        {!loading && images.length === 0 && query && (
          <p className="text-[10px] text-center py-4" style={{ color: "#94A3B8" }}>Nenhuma imagem encontrada</p>
        )}
      </ScrollArea>
    </div>
  );
}

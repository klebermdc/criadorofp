import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, Download, Filter, Trash2, Plus, ArrowLeft,
  Instagram, RefreshCw, PlayCircle, Video, FileText, LayoutGrid,
} from "lucide-react";
import { CarouselData } from "@/types/carousel";

// ===== Types =====

interface InstagramRecord {
  id: string;
  youtube_url: string;
  video_title: string;
  thumbnail_url: string;
  start_time: number;
  end_time: number;
  format: string;
  crop_position: string;
  text_overlay: any;
  quality: string;
  status: string;
  output_url: string | null;
  created_at: string;
}

interface InstagramDownloaderProps {
  onCarouselGenerated?: (data: CarouselData) => void;
}

// ===== Helpers =====

const INSTAGRAM_REGEX = /^https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[\w-]+/;

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "Pendente" },
  processing: { bg: "rgba(51,119,175,0.15)", color: "#3377AF", label: "Processando" },
  done: { bg: "rgba(131,247,20,0.15)", color: "#83F714", label: "Pronto" },
  error: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Erro" },
};

const INSTA_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";

// ===== Component =====

export function InstagramDownloader({ onCarouselGenerated }: InstagramDownloaderProps) {
  const [view, setView] = useState<"library" | "new">("library");
  const [records, setRecords] = useState<InstagramRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // New download form
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloadVideo, setDownloadVideo] = useState(true);
  const [transcribeAudio, setTranscribeAudio] = useState(false);
  const [generateCarousel, setGenerateCarousel] = useState(false);

  // ===== Data loading =====

  const loadRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("video_clips" as any).select("*")
        .not("text_overlay", "is", null)
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      if (data) {
        const instaRecords = (data as any[]).filter(
          (r) => r.text_overlay?.instagram_download === true
        );
        setRecords(instaRecords);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
    const iv = setInterval(loadRecords, 8000);
    return () => clearInterval(iv);
  }, [loadRecords]);

  const filtered = records.filter((r) => {
    const matchSearch = !search || (r.video_title || "").toLowerCase().includes(search.toLowerCase())
      || (r.youtube_url || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCount = records.length;
  const pendingCount = records.filter((r) => r.status === "pending" || r.status === "processing").length;
  const doneCount = records.filter((r) => r.status === "done").length;

  // ===== Actions =====

  const processUrl = async () => {
    const trimmed = url.trim();
    if (!INSTAGRAM_REGEX.test(trimmed)) {
      toast.error("URL invalida. Use um link do Instagram (reel, post ou IGTV).");
      return;
    }
    setSaving(true);
    try {
      const clipData = {
        youtube_url: trimmed,
        video_title: "Instagram Download (processando...)",
        thumbnail_url: "",
        start_time: 0,
        end_time: 0,
        format: "reels",
        crop_position: "center",
        text_overlay: {
          instagram_download: true,
          transcribe: transcribeAudio,
          carousel: generateCarousel,
        },
        quality: "1080p",
        status: "pending",
      };
      const { error } = await supabase.from("video_clips" as any).insert(clipData as any);
      if (error) throw error;
      toast.success("Download enviado para processamento!");
      setView("library");
      loadRecords();
      setUrl("");
      setTranscribeAudio(false);
      setGenerateCarousel(false);
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await supabase.from("video_clips" as any).delete().eq("id", id);
    } catch {}
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("Removido");
  };

  // ===== RENDER =====

  // --- LIBRARY VIEW ---
  if (view === "library") {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: INSTA_GRADIENT }}>
                <Instagram className="h-3.5 w-3.5 text-white" />
              </div>
              Instagram Downloader
            </h2>
            <p className="text-xs" style={{ color: "#94A3B8" }}>
              {totalCount} total | {pendingCount} pendentes | {doneCount} prontos
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                className="pl-8 h-9 text-xs w-full sm:w-40 text-white" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs w-28" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
                <Filter className="h-3 w-3 mr-1" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="done">Pronto</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={loadRecords} variant="outline" className="h-9" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#12121A" }}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 sm:px-6 py-3 flex gap-2">
          <button onClick={() => setView("new")}
            className="flex-1 py-3 sm:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: INSTA_GRADIENT, color: "white" }}>
            <Download className="h-4 w-4" /> Novo Download
          </button>
          {onCarouselGenerated && (
            <button
              className="flex-1 py-3 sm:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ backgroundColor: "#3377AF", color: "white" }}
              onClick={() => {
                setGenerateCarousel(true);
                setView("new");
              }}>
              <LayoutGrid className="h-4 w-4" /> Video &rarr; Carrossel
            </button>
          )}
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1 px-4 sm:px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#e6683c" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(224,41,67,0.08)" }}>
                <Instagram className="h-8 w-8" style={{ color: "rgba(224,41,67,0.3)" }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                {search || statusFilter !== "todos" ? "Nenhum download encontrado" : "Nenhum download ainda"}
              </h3>
              <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                {search || statusFilter !== "todos" ? "Altere os filtros" : "Baixe seu primeiro video do Instagram"}
              </p>
              {!search && statusFilter === "todos" && (
                <Button onClick={() => setView("new")} style={{ background: INSTA_GRADIENT, border: "none" }}>
                  <Plus className="h-4 w-4 mr-2" /> Novo Download
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((record) => {
                const st = STATUS[record.status] || STATUS.pending;
                const hasThumb = record.thumbnail_url && record.thumbnail_url.length > 0;
                const caption = record.video_title || record.youtube_url;
                const options = record.text_overlay || {};

                return (
                  <div key={record.id}
                    className="rounded-xl overflow-hidden group transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Thumbnail / Gradient placeholder */}
                    <div className="relative h-36 sm:h-40">
                      {hasThumb ? (
                        <img src={record.thumbnail_url} alt={caption}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: INSTA_GRADIENT }}>
                          <Instagram className="h-10 w-10 text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {/* Status */}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                        {record.status === "processing" && <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />}
                        {st.label}
                      </div>
                      {/* Option badges */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {options.transcribe && (
                          <div className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white" style={{ backgroundColor: "rgba(51,119,175,0.8)" }}>
                            <FileText className="h-2.5 w-2.5 inline mr-0.5" />AUDIO
                          </div>
                        )}
                        {options.carousel && (
                          <div className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white" style={{ backgroundColor: "rgba(131,247,20,0.6)" }}>
                            <LayoutGrid className="h-2.5 w-2.5 inline mr-0.5" />POST
                          </div>
                        )}
                      </div>
                      {/* Play overlay */}
                      <a href={record.youtube_url} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                          <PlayCircle className="h-6 w-6 text-white" />
                        </div>
                      </a>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-white truncate mb-2">{caption}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>{record.created_at ? timeAgo(record.created_at) : ""}</span>
                        <div className="flex gap-1.5">
                          {record.status === "done" && record.output_url && (
                            <a href={record.output_url} download target="_blank" rel="noopener noreferrer"
                              className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                              style={{ backgroundColor: "rgba(131,247,20,0.15)", color: "#83F714" }}>
                              <Download className="h-3.5 w-3.5" /> Baixar
                            </a>
                          )}
                          <button onClick={() => deleteRecord(record.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all active:scale-90" style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  // --- NEW DOWNLOAD VIEW ---
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => setView("library")} className="p-2 rounded-lg active:scale-90 transition-all" style={{ backgroundColor: "#12121A" }}>
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white">Novo Download</h2>
          <p className="text-[11px]" style={{ color: "#94A3B8" }}>Baixe videos do Instagram (Reels, Posts, IGTV)</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
          {/* URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>URL do Instagram</label>
            <Input
              value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/reel/..."
              className="text-sm h-12"
              style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
              onKeyDown={(e) => e.key === "Enter" && processUrl()}
            />
            <p className="text-[10px]" style={{ color: "#64748B" }}>
              Aceita: instagram.com/reel/..., instagram.com/p/..., instagram.com/tv/...
            </p>
          </div>

          {/* Options */}
          <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" style={{ color: "#e6683c" }} />
                <span className="text-sm text-white">Baixar Video</span>
              </div>
              <Switch checked={downloadVideo} onCheckedChange={setDownloadVideo} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" style={{ color: "#3377AF" }} />
                <div>
                  <span className="text-sm text-white">Transcrever Audio</span>
                  <p className="text-[10px]" style={{ color: "#64748B" }}>Whisper IA extrai o texto falado</p>
                </div>
              </div>
              <Switch checked={transcribeAudio} onCheckedChange={setTranscribeAudio} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" style={{ color: "#83F714" }} />
                <div>
                  <span className="text-sm text-white">Gerar Carrossel</span>
                  <p className="text-[10px]" style={{ color: "#64748B" }}>Cria um carrossel a partir da transcricao</p>
                </div>
              </div>
              <Switch checked={generateCarousel} onCheckedChange={setGenerateCarousel} />
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(224,41,67,0.04)", border: "1px solid rgba(224,41,67,0.1)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#e6683c" }}>Como funciona:</p>
            <ul className="space-y-1.5">
              {[
                "Cole a URL do Reel, Post ou IGTV",
                "O video e baixado via yt-dlp",
                "Audio transcrito com Whisper IA (opcional)",
                "Carrossel gerado automaticamente (opcional)",
                "Video entregue no Discord + app",
              ].map((t, i) => (
                <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: "#94A3B8" }}>
                  <span style={{ color: "#e6683c" }}>{i + 1}.</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <button
            onClick={processUrl}
            disabled={saving || !url.trim() || !INSTAGRAM_REGEX.test(url.trim())}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: saving ? "#12121A" : INSTA_GRADIENT, color: saving ? "#94A3B8" : "white" }}
          >
            {saving ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
            ) : (
              <><Download className="h-5 w-5" /> Processar</>
            )}
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}

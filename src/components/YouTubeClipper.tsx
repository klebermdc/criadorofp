import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, Scissors, Type, Download, Zap, Filter,
  Film, Clock, Trash2, Plus, ArrowLeft,
  Youtube, Smartphone, Square, MonitorPlay,
  ExternalLink, PlayCircle, RefreshCw,
} from "lucide-react";

// ===== Types =====

interface SavedClip {
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

// ===== Helpers =====

const YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})(?:\S*)?$/;

function parseTime(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  return parts[0] || 0;
}

function fmtSec(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

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

// ===== Component =====

export function YouTubeClipper() {
  const [view, setView] = useState<"library" | "new" | "auto">("library");
  const [clips, setClips] = useState<SavedClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // New clip form
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoThumb, setVideoThumb] = useState("");
  const [videoId, setVideoId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:15");
  const [format, setFormat] = useState<"reels" | "stories" | "feed">("reels");
  const [quality, setQuality] = useState<"720p" | "1080p">("1080p");

  // Auto clipper
  const [autoUrl, setAutoUrl] = useState("");
  const [autoClips, setAutoClips] = useState(5);
  const [autoLength, setAutoLength] = useState(15);
  const [autoSubs, setAutoSubs] = useState(true);
  const [autoWatermark, setAutoWatermark] = useState("@orlandofastpass");
  const [autoProcessing, setAutoProcessing] = useState(false);

  // ===== Data loading =====

  const loadClips = async () => {
    try {
      const { data, error } = await supabase
        .from("video_clips" as any).select("*")
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      if (data) setClips(data as any);
    } catch {
      setClips(JSON.parse(localStorage.getItem("video_clips") || "[]"));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadClips();
    const iv = setInterval(loadClips, 8000);
    return () => clearInterval(iv);
  }, []);

  const filtered = clips.filter(c => {
    const matchSearch = !search || (c.video_title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ===== Actions =====

  const analyzeVideo = async () => {
    const vid = url.trim().match(YOUTUBE_REGEX)?.[1];
    if (!vid) { toast.error("URL invalida"); return; }
    setAnalyzing(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVideoId(vid);
      setVideoTitle(data.title);
      setVideoThumb(`https://img.youtube.com/vi/${vid}/hqdefault.jpg`);
      toast.success("Video encontrado!");
    } catch { toast.error("Video nao encontrado"); }
    finally { setAnalyzing(false); }
  };

  const saveClip = async () => {
    if (!videoId) return;
    const dur = parseTime(endTime) - parseTime(startTime);
    if (dur <= 0) { toast.error("Tempo final deve ser maior"); return; }
    setSaving(true);
    try {
      const clipData = {
        youtube_url: url.trim(), video_title: videoTitle,
        thumbnail_url: videoThumb, start_time: parseTime(startTime),
        end_time: parseTime(endTime), format, crop_position: "center",
        text_overlay: null, quality, status: "pending",
      };
      try {
        const { error } = await supabase.from("video_clips" as any).insert(clipData as any);
        if (error) throw error;
      } catch {
        const saved = { ...clipData, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        const existing = JSON.parse(localStorage.getItem("video_clips") || "[]");
        existing.unshift(saved); localStorage.setItem("video_clips", JSON.stringify(existing));
      }
      toast.success("Clipe enviado para processamento!");
      setView("library"); loadClips();
      setUrl(""); setVideoId(""); setVideoTitle(""); setVideoThumb("");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const startAutoClipper = async () => {
    const vid = autoUrl.trim().match(YOUTUBE_REGEX)?.[1];
    if (!vid) { toast.error("URL invalida"); return; }
    setAutoProcessing(true);
    try {
      await supabase.from("video_clips" as any).insert({
        youtube_url: autoUrl.trim(), video_title: "Auto-Clip (processando...)",
        thumbnail_url: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
        start_time: 0, end_time: autoLength, format: "reels", crop_position: "center",
        text_overlay: { auto_clipper: true, max_clips: autoClips, clip_length: autoLength, add_subtitles: autoSubs, watermark: autoWatermark || null },
        quality: "1080p", status: "pending",
      } as any);
      toast.success(`Auto-Clipper vai gerar ate ${autoClips} clipes!`);
      setView("library"); loadClips();
    } catch { toast.error("Erro"); }
    finally { setAutoProcessing(false); }
  };

  const deleteClip = async (id: string) => {
    try { await supabase.from("video_clips" as any).delete().eq("id", id); } catch {}
    setClips(prev => prev.filter(c => c.id !== id));
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
              <Youtube className="h-5 w-5 text-red-500" /> Meus Reels
            </h2>
            <p className="text-xs" style={{ color: "#94A3B8" }}>{clips.length} clipes | {clips.filter(c => c.status === "done").length} prontos</p>
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
            <Button size="sm" onClick={loadClips} variant="outline" className="h-9" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#12121A" }}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 sm:px-6 py-3 flex gap-2">
          <button onClick={() => setView("new")}
            className="flex-1 py-3 sm:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: "#3377AF", color: "white" }}>
            <Scissors className="h-4 w-4" /> Novo Clipe
          </button>
          <button onClick={() => setView("auto")}
            className="flex-1 py-3 sm:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "white" }}>
            <Zap className="h-4 w-4" /> Auto IA
          </button>
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1 px-4 sm:px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3377AF" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "rgba(255,0,0,0.08)" }}>
                <Youtube className="h-8 w-8 text-red-500/30" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                {search || statusFilter !== "todos" ? "Nenhum clipe encontrado" : "Nenhum clipe ainda"}
              </h3>
              <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                {search || statusFilter !== "todos" ? "Altere os filtros" : "Crie seu primeiro clipe"}
              </p>
              {!search && statusFilter === "todos" && (
                <Button onClick={() => setView("new")} style={{ backgroundColor: "#3377AF" }}>
                  <Plus className="h-4 w-4 mr-2" /> Criar Clipe
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((clip) => {
                const st = STATUS[clip.status] || STATUS.pending;
                const vid = clip.youtube_url.match(YOUTUBE_REGEX)?.[1];
                return (
                  <div key={clip.id}
                    className="rounded-xl overflow-hidden group transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Thumbnail */}
                    <div className="relative h-36 sm:h-40">
                      <img src={clip.thumbnail_url} alt={clip.video_title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = (clip.thumbnail_url || "").replace("maxresdefault", "hqdefault"); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {/* Status */}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                        {clip.status === "processing" && <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />}
                        {st.label}
                      </div>
                      {/* Duration */}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-white" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
                        {fmtSec(clip.end_time - clip.start_time)}
                      </div>
                      {/* Play overlay */}
                      {vid && (
                        <a href={`https://youtube.com/watch?v=${vid}&t=${clip.start_time}`} target="_blank" rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                            <PlayCircle className="h-6 w-6 text-white" />
                          </div>
                        </a>
                      )}
                      {/* Format badge */}
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-semibold text-white" style={{ backgroundColor: "rgba(51,119,175,0.8)" }}>
                        {clip.format === "reels" ? "REELS" : clip.format === "stories" ? "STORIES" : "FEED"} • {clip.quality}
                      </div>
                      {/* Time range */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono text-white" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                        {fmtSec(clip.start_time)} - {fmtSec(clip.end_time)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-white truncate mb-2">{clip.video_title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>{clip.created_at ? timeAgo(clip.created_at) : ""}</span>
                        <div className="flex gap-1.5">
                          {clip.status === "done" && clip.output_url && (
                            <a href={clip.output_url} download target="_blank" rel="noopener noreferrer"
                              className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                              style={{ backgroundColor: "rgba(131,247,20,0.15)", color: "#83F714" }}>
                              <Download className="h-3.5 w-3.5" /> Baixar
                            </a>
                          )}
                          {vid && (
                            <a href={`https://youtube.com/watch?v=${vid}&t=${clip.start_time}`} target="_blank" rel="noopener noreferrer"
                              className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                              <ExternalLink className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
                            </a>
                          )}
                          <button onClick={() => deleteClip(clip.id)}
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

  // --- NEW CLIP VIEW ---
  if (view === "new") {
    const maxDur = format === "stories" ? 15 : 60;
    const dur = parseTime(endTime) - parseTime(startTime);
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setView("library")} className="p-2 rounded-lg active:scale-90 transition-all" style={{ backgroundColor: "#12121A" }}>
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Novo Clipe</h2>
            <p className="text-[11px]" style={{ color: "#94A3B8" }}>Recorte um trecho de um video do YouTube</p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
            {/* URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>URL do YouTube</label>
              <div className="flex gap-2">
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  className="text-sm flex-1 h-11" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
                  onKeyDown={(e) => e.key === "Enter" && analyzeVideo()} />
                <Button onClick={analyzeVideo} disabled={analyzing || !url.trim()} className="h-11 px-4" style={{ backgroundColor: "#3377AF" }}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Video preview */}
            {videoId && (
              <>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ position: "relative", paddingBottom: "56.25%" }}>
                    <iframe src={`https://www.youtube.com/embed/${videoId}?start=${parseTime(startTime)}&end=${parseTime(endTime)}&rel=0`}
                      title={videoTitle} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
                  </div>
                </div>
                <p className="text-sm font-medium text-white">{videoTitle}</p>

                {/* Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] block mb-1.5" style={{ color: "#94A3B8" }}>Inicio</label>
                    <Input value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className="text-sm text-center font-mono h-11" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }} />
                  </div>
                  <div>
                    <label className="text-[11px] block mb-1.5" style={{ color: "#94A3B8" }}>Fim</label>
                    <Input value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="text-sm text-center font-mono h-11" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: dur > maxDur ? "#ef4444" : "#83F714" }}>{fmtSec(dur)}</span>
                  <span className="text-[10px]" style={{ color: "#94A3B8" }}>Max: {maxDur}s</span>
                </div>

                {/* Format */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>Formato</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "reels" as const, icon: Smartphone, label: "Reels 9:16" },
                      { id: "stories" as const, icon: MonitorPlay, label: "Stories 9:16" },
                      { id: "feed" as const, icon: Square, label: "Feed 1:1" },
                    ]).map(f => (
                      <button key={f.id} onClick={() => setFormat(f.id)}
                        className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                        style={{ backgroundColor: format === f.id ? "rgba(51,119,175,0.15)" : "#12121A", color: format === f.id ? "#3377AF" : "#94A3B8",
                          border: `2px solid ${format === f.id ? "#3377AF" : "rgba(255,255,255,0.06)"}` }}>
                        <f.icon className="h-5 w-5" />{f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>Qualidade</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["720p", "1080p"] as const).map(q => (
                      <button key={q} onClick={() => setQuality(q)}
                        className="py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                        style={{ backgroundColor: quality === q ? "#3377AF" : "#12121A", color: quality === q ? "white" : "#94A3B8",
                          border: `2px solid ${quality === q ? "#3377AF" : "rgba(255,255,255,0.06)"}` }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button onClick={saveClip} disabled={saving || dur <= 0 || dur > maxDur}
                  className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: saving ? "#12121A" : "linear-gradient(135deg, #3377AF, #83F714)", color: saving ? "#94A3B8" : "#0A0A0F" }}>
                  {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</> : <><Scissors className="h-5 w-5" /> Gerar Clipe</>}
                </button>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // --- AUTO IA VIEW ---
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => setView("library")} className="p-2 rounded-lg active:scale-90 transition-all" style={{ backgroundColor: "#12121A" }}>
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4" style={{ color: "#f59e0b" }} /> Auto-Clipper IA
          </h2>
          <p className="text-[11px]" style={{ color: "#94A3B8" }}>A IA analisa e gera varios clipes automaticamente</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
          {/* URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>URL do YouTube</label>
            <Input value={autoUrl} onChange={(e) => setAutoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
              className="text-sm h-11" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }} />
          </div>

          {/* Clips count */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>Quantidade de clipes</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 10].map(n => (
                <button key={n} onClick={() => setAutoClips(n)}
                  className="py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ backgroundColor: autoClips === n ? "#f59e0b" : "#12121A", color: autoClips === n ? "#0A0A0F" : "#94A3B8",
                    border: `2px solid ${autoClips === n ? "#f59e0b" : "rgba(255,255,255,0.06)"}` }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>Duracao de cada clipe</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 30, 60].map(n => (
                <button key={n} onClick={() => setAutoLength(n)}
                  className="py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ backgroundColor: autoLength === n ? "#f59e0b" : "#12121A", color: autoLength === n ? "#0A0A0F" : "#94A3B8",
                    border: `2px solid ${autoLength === n ? "#f59e0b" : "rgba(255,255,255,0.06)"}` }}>
                  {n}s
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Legendas automaticas</span>
              <Switch checked={autoSubs} onCheckedChange={setAutoSubs} />
            </div>
            <div>
              <label className="text-[11px] block mb-1.5" style={{ color: "#94A3B8" }}>Marca d'agua</label>
              <Input value={autoWatermark} onChange={(e) => setAutoWatermark(e.target.value)} placeholder="@orlandofastpass"
                className="text-sm h-10" style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.08)", color: "white" }} />
            </div>
          </div>

          {/* How it works */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#f59e0b" }}>Como funciona:</p>
            <ul className="space-y-1.5">
              {["Baixa o video completo", "Analisa mudancas de cena", "Transcreve com Whisper IA", "Seleciona os melhores momentos", "Gera os clipes em vertical (9:16)", "Entrega no Discord + app"].map((t, i) => (
                <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: "#94A3B8" }}>
                  <span style={{ color: "#f59e0b" }}>{i + 1}.</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <button onClick={startAutoClipper} disabled={autoProcessing || !autoUrl.trim()}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: autoProcessing ? "#12121A" : "linear-gradient(135deg, #f59e0b, #ef4444)", color: autoProcessing ? "#94A3B8" : "white" }}>
            {autoProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processando...</> : <><Zap className="h-5 w-5" /> Gerar Clipes com IA</>}
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}

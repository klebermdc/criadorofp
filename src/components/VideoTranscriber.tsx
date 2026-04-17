import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, FileText, Download, Copy, Check,
  Clock, Hash, ArrowLeft, RefreshCw, Trash2,
  Youtube, ChevronDown, ChevronUp, Eye,
} from "lucide-react";

// ===== Types =====

interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionData {
  transcription_request: boolean;
  segments?: TranscriptionSegment[];
  text?: string;
  language?: string;
}

interface TranscriptionRecord {
  id: string;
  youtube_url: string;
  video_title: string;
  thumbnail_url: string;
  text_overlay: TranscriptionData | null;
  status: string;
  output_url: string | null;
  created_at: string;
}

interface VideoTranscriberProps {}

// ===== Helpers =====

const YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})(?:\S*)?$/;

function fmtTs(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
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

export function VideoTranscriber({}: VideoTranscriberProps) {
  const [view, setView] = useState<"history" | "new" | "detail">("history");
  const [records, setRecords] = useState<TranscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<TranscriptionRecord | null>(null);

  // New transcription form
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoThumb, setVideoThumb] = useState("");
  const [videoId, setVideoId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Detail view
  const [searchText, setSearchText] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

  // Progress animation
  const [progressPct, setProgressPct] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // ===== Data loading =====

  const loadRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("video_clips" as any).select("*")
        .not("text_overlay", "is", null)
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      if (data) {
        const transcriptions = (data as any[]).filter(
          (r) => r.text_overlay?.transcription_request === true
        );
        setRecords(transcriptions);
        // Update selected record if viewing detail
        if (selectedRecord) {
          const updated = transcriptions.find((r) => r.id === selectedRecord.id);
          if (updated) setSelectedRecord(updated);
        }
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRecord]);

  useEffect(() => {
    loadRecords();
    const iv = setInterval(loadRecords, 5000);
    return () => clearInterval(iv);
  }, [loadRecords]);

  // Animated progress for pending/processing
  useEffect(() => {
    if (selectedRecord && (selectedRecord.status === "pending" || selectedRecord.status === "processing")) {
      setProgressPct(selectedRecord.status === "processing" ? 30 : 5);
      progressRef.current = setInterval(() => {
        setProgressPct((p) => Math.min(p + Math.random() * 3, 95));
      }, 2000);
      return () => { if (progressRef.current) clearInterval(progressRef.current); };
    } else {
      setProgressPct(0);
      if (progressRef.current) clearInterval(progressRef.current);
    }
  }, [selectedRecord?.status, selectedRecord?.id]);

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

  const requestTranscription = async () => {
    if (!videoId) return;
    setSaving(true);
    try {
      const clipData = {
        youtube_url: url.trim(),
        video_title: videoTitle,
        thumbnail_url: videoThumb,
        start_time: 0,
        end_time: 0,
        format: "transcription",
        crop_position: "center",
        text_overlay: { transcription_request: true },
        quality: "720p",
        status: "pending",
      };
      const { error } = await supabase.from("video_clips" as any).insert(clipData as any);
      if (error) throw error;
      toast.success("Transcricao enviada para processamento!");
      setView("history");
      loadRecords();
      setUrl(""); setVideoId(""); setVideoTitle(""); setVideoThumb("");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const deleteRecord = async (id: string) => {
    try { await supabase.from("video_clips" as any).delete().eq("id", id); } catch {}
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecord?.id === id) { setSelectedRecord(null); setView("history"); }
    toast.success("Removido");
  };

  // Cache for fetched transcription data from Storage
  const [fetchedTranscriptions, setFetchedTranscriptions] = useState<Record<string, any>>({});

  // Fetch full transcription from Storage URL when needed
  useEffect(() => {
    if (!selectedRecord) return;
    const url = (selectedRecord.text_overlay as any)?.transcription_url || selectedRecord.output_url;
    if (url && url.endsWith(".json") && !fetchedTranscriptions[selectedRecord.id]) {
      fetch(url).then(r => r.json()).then(data => {
        setFetchedTranscriptions(prev => ({ ...prev, [selectedRecord.id]: data }));
      }).catch(() => {});
    }
  }, [selectedRecord?.id, selectedRecord?.status]);

  const getFullText = (record: TranscriptionRecord): string => {
    // Check fetched data from Storage first
    const fetched = fetchedTranscriptions[record.id];
    if (fetched?.text) return fetched.text;
    const overlay = record.text_overlay;
    if (!overlay) return "";
    if (overlay.text) return overlay.text;
    if (overlay.segments) return overlay.segments.map((s) => s.text).join(" ");
    return "";
  };

  const getSegments = (record: TranscriptionRecord): TranscriptionSegment[] => {
    const fetched = fetchedTranscriptions[record.id];
    if (fetched?.segments) return fetched.segments;
    return record.text_overlay?.segments || [];
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getDuration = (segments: TranscriptionSegment[]): number => {
    if (segments.length === 0) return 0;
    return segments[segments.length - 1].end;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Erro ao copiar"); }
  };

  const downloadTxt = (record: TranscriptionRecord) => {
    const segments = getSegments(record);
    let content = `${record.video_title}\n`;
    content += `${"=".repeat(60)}\n\n`;
    if (segments.length > 0) {
      segments.forEach((s) => {
        content += `[${fmtTs(s.start)} - ${fmtTs(s.end)}] ${s.text}\n`;
      });
    } else {
      content += getFullText(record);
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.video_title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSegments = (record: TranscriptionRecord) => {
    const segments = getSegments(record);
    if (!searchText.trim()) return segments;
    const q = searchText.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  };

  // ===== RENDER =====

  // --- DETAIL VIEW ---
  if (view === "detail" && selectedRecord) {
    const fullText = getFullText(selectedRecord);
    const segments = getSegments(selectedRecord);
    const wordCount = getWordCount(fullText);
    const duration = getDuration(segments);
    const isDone = selectedRecord.status === "done" && fullText.length > 0;
    const filtered = filteredSegments(selectedRecord);
    const st = STATUS[selectedRecord.status] || STATUS.pending;

    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => { setView("history"); setSearchText(""); }} className="p-2 rounded-lg active:scale-90 transition-all" style={{ backgroundColor: "#12121A" }}>
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{selectedRecord.video_title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                {selectedRecord.status === "processing" && <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />}
                {st.label}
              </span>
              {isDone && (
                <>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: "#94A3B8" }}>
                    <Hash className="h-3 w-3" /> {wordCount} palavras
                  </span>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: "#94A3B8" }}>
                    <Clock className="h-3 w-3" /> {fmtTs(duration)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Processing state */}
        {!isDone && (selectedRecord.status === "pending" || selectedRecord.status === "processing") && (
          <div className="px-4 sm:px-6 py-6">
            <div className="max-w-xl mx-auto">
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: "#3377AF" }} />
                <p className="text-sm font-semibold text-white mb-1">
                  {selectedRecord.status === "pending" ? "Na fila de processamento..." : "Transcrevendo com Whisper IA..."}
                </p>
                <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                  Tempo estimado: 2-5 minutos por cada 10min de video
                </p>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #3377AF, #83F714)" }}
                  />
                </div>
                <p className="text-[10px] mt-2 font-mono" style={{ color: "#94A3B8" }}>{Math.round(progressPct)}%</p>
                <p className="text-[10px] mt-3" style={{ color: "#94A3B8" }}>
                  Atualizando automaticamente a cada 5 segundos...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {selectedRecord.status === "error" && (
          <div className="px-4 sm:px-6 py-6">
            <div className="max-w-xl mx-auto rounded-xl p-6 text-center" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-sm font-semibold text-red-400 mb-1">Erro na transcricao</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>Tente novamente ou verifique se o video esta disponivel.</p>
            </div>
          </div>
        )}

        {/* Transcription content */}
        {isDone && (
          <>
            {/* Search + actions bar */}
            <div className="px-4 sm:px-6 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                <Input
                  value={searchText} onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar na transcricao..."
                  className="pl-8 h-9 text-xs text-white"
                  style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <Button size="sm" onClick={() => downloadTxt(selectedRecord)} className="h-9 px-3" style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Download className="h-3.5 w-3.5 mr-1.5" style={{ color: "#94A3B8" }} />
                <span className="text-xs" style={{ color: "#94A3B8" }}>TXT</span>
              </Button>
            </div>

            {/* Segments */}
            <ScrollArea className="flex-1">
              <div className="px-4 sm:px-6 py-3 max-w-xl mx-auto space-y-0.5">
                {segments.length > 0 ? (
                  filtered.map((seg, i) => (
                    <div
                      key={seg.id ?? i}
                      className="flex gap-3 py-2.5 px-3 rounded-lg transition-colors"
                      style={{ backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
                    >
                      <span className="text-[10px] font-mono whitespace-nowrap pt-0.5 flex-shrink-0" style={{ color: "#3377AF", minWidth: "52px" }}>
                        {fmtTs(seg.start)}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: "#E2E8F0" }}>
                        {searchText.trim() ? highlightText(seg.text, searchText) : seg.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-3 px-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#E2E8F0" }}>{fullText}</p>
                  </div>
                )}
                {searchText.trim() && filtered.length === 0 && (
                  <p className="text-xs text-center py-6" style={{ color: "#94A3B8" }}>Nenhum trecho encontrado para "{searchText}"</p>
                )}
              </div>
            </ScrollArea>

            {/* Sticky copy button */}
            <div className="px-4 sm:px-6 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
              <button
                onClick={() => copyToClipboard(fullText)}
                className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ backgroundColor: copied ? "rgba(131,247,20,0.15)" : "#3377AF", color: copied ? "#83F714" : "white" }}
              >
                {copied ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar Texto Completo</>}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- NEW TRANSCRIPTION VIEW ---
  if (view === "new") {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setView("history")} className="p-2 rounded-lg active:scale-90 transition-all" style={{ backgroundColor: "#12121A" }}>
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Nova Transcricao</h2>
            <p className="text-[11px]" style={{ color: "#94A3B8" }}>Transcreva qualquer video do YouTube com IA</p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
            {/* URL input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>URL do YouTube</label>
              <div className="flex gap-2">
                <Input
                  value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="text-sm flex-1 h-12"
                  style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
                  onKeyDown={(e) => e.key === "Enter" && analyzeVideo()}
                />
                <Button onClick={analyzeVideo} disabled={analyzing || !url.trim()} className="h-12 px-5" style={{ backgroundColor: "#3377AF" }}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Video preview */}
            {videoId && (
              <>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="relative">
                    <img
                      src={videoThumb}
                      alt={videoTitle}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-sm font-semibold text-white drop-shadow-lg">{videoTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(51,119,175,0.05)", border: "1px solid rgba(51,119,175,0.15)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#3377AF" }}>Como funciona:</p>
                  <ul className="space-y-1.5">
                    {[
                      "O audio do video e extraido automaticamente",
                      "Whisper IA transcreve em Portugues",
                      "O texto fica disponivel com timestamps",
                      "Voce pode copiar ou baixar como TXT",
                    ].map((t, i) => (
                      <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: "#94A3B8" }}>
                        <span style={{ color: "#3377AF" }}>{i + 1}.</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit */}
                <button
                  onClick={requestTranscription} disabled={saving}
                  className="w-full h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: saving ? "#12121A" : "linear-gradient(135deg, #3377AF, #83F714)", color: saving ? "#94A3B8" : "#0A0A0F" }}
                >
                  {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</> : <><FileText className="h-5 w-5" /> Transcrever</>}
                </button>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // --- HISTORY VIEW ---
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: "#3377AF" }} /> Transcricoes
          </h2>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            {records.length} transcricoes | {records.filter((r) => r.status === "done").length} prontas
          </p>
        </div>
        <Button size="sm" onClick={loadRecords} variant="outline" className="h-9 self-start" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#12121A" }}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* New button */}
      <div className="px-4 sm:px-6 py-3">
        <button
          onClick={() => setView("new")}
          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ backgroundColor: "#3377AF", color: "white" }}
        >
          <FileText className="h-4 w-4" /> Nova Transcricao
        </button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-4 sm:px-6 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3377AF" }} />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "rgba(51,119,175,0.08)" }}>
              <FileText className="h-8 w-8" style={{ color: "rgba(51,119,175,0.3)" }} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Nenhuma transcricao ainda</h3>
            <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>Transcreva seu primeiro video</p>
            <Button onClick={() => setView("new")} style={{ backgroundColor: "#3377AF" }}>
              <FileText className="h-4 w-4 mr-2" /> Nova Transcricao
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const st = STATUS[record.status] || STATUS.pending;
              const fullText = getFullText(record);
              const wordCount = getWordCount(fullText);
              const isExpanded = expandedHistory.has(record.id);

              return (
                <div
                  key={record.id}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={record.thumbnail_url}
                        alt={record.video_title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = (record.thumbnail_url || "").replace("maxresdefault", "hqdefault"); }}
                      />
                      <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                        {record.status === "processing" && <Loader2 className="h-2.5 w-2.5 inline mr-0.5 animate-spin" />}
                        {st.label}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{record.video_title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                          {record.created_at ? timeAgo(record.created_at) : ""}
                        </span>
                        {record.status === "done" && wordCount > 0 && (
                          <span className="text-[10px]" style={{ color: "#94A3B8" }}>{wordCount} palavras</span>
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {record.status === "done" && fullText && (
                          <button
                            onClick={() => { setSelectedRecord(record); setView("detail"); }}
                            className="h-7 px-2.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95"
                            style={{ backgroundColor: "rgba(51,119,175,0.15)", color: "#3377AF" }}
                          >
                            <Eye className="h-3 w-3" /> Ver
                          </button>
                        )}
                        {(record.status === "pending" || record.status === "processing") && (
                          <button
                            onClick={() => { setSelectedRecord(record); setView("detail"); }}
                            className="h-7 px-2.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95"
                            style={{ backgroundColor: "rgba(251,191,36,0.1)", color: "#fbbf24" }}
                          >
                            <Clock className="h-3 w-3" /> Status
                          </button>
                        )}
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                          style={{ backgroundColor: "rgba(239,68,68,0.08)" }}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview text */}
                  {record.status === "done" && fullText && (
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => {
                          const next = new Set(expandedHistory);
                          isExpanded ? next.delete(record.id) : next.add(record.id);
                          setExpandedHistory(next);
                        }}
                        className="w-full text-left"
                      >
                        <p
                          className="text-[11px] leading-relaxed"
                          style={{
                            color: "#94A3B8",
                            display: isExpanded ? "block" : "-webkit-box",
                            WebkitLineClamp: isExpanded ? undefined : 2,
                            WebkitBoxOrient: isExpanded ? undefined : "vertical",
                            overflow: isExpanded ? "visible" : "hidden",
                          }}
                        >
                          {fullText}
                        </p>
                        <span className="text-[9px] flex items-center gap-0.5 mt-1" style={{ color: "#3377AF" }}>
                          {isExpanded ? <><ChevronUp className="h-2.5 w-2.5" /> Menos</> : <><ChevronDown className="h-2.5 w-2.5" /> Mais</>}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ===== Utility =====

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ backgroundColor: "rgba(51,119,175,0.4)", color: "white", borderRadius: "2px", padding: "0 2px" }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

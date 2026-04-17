import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, Play, Scissors, Type, Download,
  Film, Clock, Move, AlignVerticalSpaceAround, Palette,
  CheckCircle2, Youtube, MonitorPlay, Smartphone, Square,
} from "lucide-react";

interface YouTubeClipperProps {
  onClipCreated?: (clipConfig: any) => void;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  author: string;
}

const YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})(?:\S*)?$/;

function parseTimeToSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 1) return parts[0] || 0;
  return 0;
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function YouTubeClipper({ onClipCreated }: YouTubeClipperProps) {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Clip config
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:15");
  const [format, setFormat] = useState<"reels" | "stories" | "feed">("reels");
  const [cropPosition, setCropPosition] = useState<"top" | "center" | "bottom">("center");

  // Text overlay
  const [textEnabled, setTextEnabled] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [bgOpacity, setBgOpacity] = useState(70);

  // Export
  const [quality, setQuality] = useState<"720p" | "1080p">("1080p");

  // Saved clips history
  const [savedClips, setSavedClips] = useState<any[]>([]);

  const extractVideoId = (videoUrl: string): string | null => {
    const match = videoUrl.match(YOUTUBE_REGEX);
    return match ? match[1] : null;
  };

  const analyzeVideo = async () => {
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      toast.error("URL invalida. Use um link do YouTube valido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!res.ok) throw new Error("Video nao encontrado");
      const data = await res.json();
      setVideoInfo({
        title: data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        author: data.author_name,
      });
      toast.success("Video encontrado!");
    } catch {
      toast.error("Nao foi possivel encontrar o video. Verifique a URL.");
    } finally {
      setLoading(false);
    }
  };

  const clipDuration = () => {
    const start = parseTimeToSeconds(startTime);
    const end = parseTimeToSeconds(endTime);
    return Math.max(0, end - start);
  };

  const maxDuration = format === "stories" ? 15 : 60;

  const saveClip = async () => {
    if (!videoInfo) {
      toast.error("Analise um video primeiro.");
      return;
    }

    const duration = clipDuration();
    if (duration <= 0) {
      toast.error("O tempo final deve ser maior que o inicial.");
      return;
    }
    if (duration > maxDuration) {
      toast.error(`Duracao maxima para ${format === "stories" ? "Stories" : "Reels"}: ${maxDuration}s`);
      return;
    }

    setSaving(true);
    try {
      const clipData = {
        youtube_url: url.trim(),
        video_title: videoInfo.title,
        thumbnail_url: videoInfo.thumbnail,
        start_time: parseTimeToSeconds(startTime),
        end_time: parseTimeToSeconds(endTime),
        format,
        crop_position: cropPosition,
        text_overlay: textEnabled
          ? { text: overlayText, position: textPosition, fontSize, textColor, bgColor, bgOpacity }
          : null,
        quality,
        status: "pending",
      };

      let saved: any = clipData;
      try {
        const { data, error } = await supabase
          .from("video_clips" as any)
          .insert(clipData as any)
          .select()
          .single();
        if (error) throw error;
        saved = data;
      } catch {
        // Fallback: save to localStorage if table doesn't exist yet
        saved = { ...clipData, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        const existing = JSON.parse(localStorage.getItem("video_clips") || "[]");
        existing.unshift(saved);
        localStorage.setItem("video_clips", JSON.stringify(existing));
      }

      toast.success("Configuracao salva! O clipe sera processado em breve.");
      setSavedClips((prev) => [saved, ...prev]);
      onClipCreated?.(saved);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao salvar: " + (e.message || "Tente novamente"));
    } finally {
      setSaving(false);
    }
  };

  const formatIcons = {
    reels: <Smartphone className="h-4 w-4" />,
    stories: <MonitorPlay className="h-4 w-4" />,
    feed: <Square className="h-4 w-4" />,
  };

  const formatLabels = {
    reels: "Reels (9:16)",
    stories: "Stories (9:16)",
    feed: "Feed (1:1)",
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Left Panel — Controls */}
      <div className="w-full md:w-96 flex flex-col h-full" style={{ borderRight: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0A0A0F" }}>
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,0,0,0.1)" }}>
                <Youtube className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">YouTube Clipper</h2>
                <p className="text-[11px]" style={{ color: "#94A3B8" }}>Crie Reels e Stories de videos do YouTube</p>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
                <Search className="h-3 w-3 inline mr-1.5" />
                URL do YouTube
              </label>
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="text-sm flex-1"
                  style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
                  onKeyDown={(e) => e.key === "Enter" && analyzeVideo()}
                />
                <Button
                  onClick={analyzeVideo}
                  disabled={loading || !url.trim()}
                  className="shrink-0"
                  style={{ backgroundColor: "#3377AF", color: "white" }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Video Info */}
            {videoInfo && (
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="relative">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = videoInfo.thumbnail.replace("maxresdefault", "hqdefault"); }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-semibold line-clamp-2">{videoInfo.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#94A3B8" }}>{videoInfo.author}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Separator */}
            {videoInfo && (
              <>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                {/* Clip Time */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: "#94A3B8" }}>
                    <Scissors className="h-3 w-3 inline mr-1.5" />
                    Recorte do Clipe
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] block mb-1" style={{ color: "#94A3B8" }}>Inicio (MM:SS)</span>
                      <Input
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="00:00"
                        className="text-sm text-center font-mono"
                        style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] block mb-1" style={{ color: "#94A3B8" }}>Fim (MM:SS)</span>
                      <Input
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="00:15"
                        className="text-sm text-center font-mono"
                        style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" style={{ color: "#94A3B8" }} />
                      <span className="text-xs font-mono" style={{ color: clipDuration() > maxDuration ? "#ef4444" : "#83F714" }}>
                        {formatSeconds(clipDuration())}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                      Max: {maxDuration}s ({format === "stories" ? "Stories" : "Reels"})
                    </span>
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
                    <Film className="h-3 w-3 inline mr-1.5" />
                    Formato
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["reels", "stories", "feed"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: format === f ? "rgba(51,119,175,0.15)" : "#12121A",
                          color: format === f ? "#3377AF" : "#94A3B8",
                          border: `1px solid ${format === f ? "#3377AF" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {formatIcons[f]}
                        {formatLabels[f]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Position */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
                    <Move className="h-3 w-3 inline mr-1.5" />
                    Posicao do Crop
                  </label>
                  <div className="flex gap-2">
                    {(["top", "center", "bottom"] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setCropPosition(pos)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                        style={{
                          backgroundColor: cropPosition === pos ? "#3377AF" : "#12121A",
                          color: cropPosition === pos ? "white" : "#94A3B8",
                          border: `1px solid ${cropPosition === pos ? "#3377AF" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {pos === "top" ? "Topo" : pos === "center" ? "Centro" : "Base"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Separator */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                {/* Text Overlay */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      <Type className="h-3 w-3 inline mr-1.5" />
                      Texto Overlay
                    </label>
                    <Switch checked={textEnabled} onCheckedChange={setTextEnabled} />
                  </div>

                  {textEnabled && (
                    <div className="space-y-3 pl-1">
                      <Input
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                        placeholder="Texto sobre o video..."
                        className="text-sm"
                        style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "white" }}
                      />

                      {/* Text Position */}
                      <div>
                        <span className="text-[10px] block mb-1.5" style={{ color: "#94A3B8" }}>Posicao</span>
                        <div className="flex gap-2">
                          {(["top", "center", "bottom"] as const).map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setTextPosition(pos)}
                              className="flex-1 py-1.5 rounded text-[11px] font-medium transition-all"
                              style={{
                                backgroundColor: textPosition === pos ? "rgba(131,247,20,0.15)" : "#12121A",
                                color: textPosition === pos ? "#83F714" : "#94A3B8",
                                border: `1px solid ${textPosition === pos ? "#83F714" : "rgba(255,255,255,0.08)"}`,
                              }}
                            >
                              {pos === "top" ? "Topo" : pos === "center" ? "Centro" : "Base"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px]" style={{ color: "#94A3B8" }}>Tamanho da fonte</span>
                          <span className="text-[10px] font-mono" style={{ color: "#83F714" }}>{fontSize}px</span>
                        </div>
                        <Slider
                          value={[fontSize]}
                          onValueChange={([v]) => setFontSize(v)}
                          min={12}
                          max={72}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Colors */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] block mb-1.5" style={{ color: "#94A3B8" }}>Cor do texto</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-white">{textColor}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] block mb-1.5" style={{ color: "#94A3B8" }}>Fundo do texto</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-white">{bgColor}</span>
                          </div>
                        </div>
                      </div>

                      {/* BG Opacity */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px]" style={{ color: "#94A3B8" }}>Opacidade do fundo</span>
                          <span className="text-[10px] font-mono" style={{ color: "#83F714" }}>{bgOpacity}%</span>
                        </div>
                        <Slider
                          value={[bgOpacity]}
                          onValueChange={([v]) => setBgOpacity(v)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                {/* Export Settings */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#94A3B8" }}>
                    <Download className="h-3 w-3 inline mr-1.5" />
                    Exportar
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] block mb-1.5" style={{ color: "#94A3B8" }}>Qualidade</span>
                      <div className="flex gap-2">
                        {(["720p", "1080p"] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: quality === q ? "#3377AF" : "#12121A",
                              color: quality === q ? "white" : "#94A3B8",
                              border: `1px solid ${quality === q ? "#3377AF" : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(51,119,175,0.08)", border: "1px solid rgba(51,119,175,0.15)" }}>
                      <Film className="h-3.5 w-3.5 shrink-0" style={{ color: "#3377AF" }} />
                      <span className="text-[11px]" style={{ color: "#94A3B8" }}>Formato de saida: <strong className="text-white">MP4</strong></span>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={saveClip}
                  disabled={saving || clipDuration() <= 0 || clipDuration() > maxDuration}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: saving ? "#12121A" : "linear-gradient(135deg, #3377AF 0%, #83F714 100%)",
                    color: saving ? "#94A3B8" : "#0A0A0F",
                    border: saving ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Scissors className="h-4 w-4" />
                      Gerar Clipe
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel — Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto" style={{ backgroundColor: "#0A0A0F" }}>
        {!videoInfo ? (
          <div className="text-center max-w-md">
            <div
              className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.15)" }}
            >
              <Youtube className="h-12 w-12 text-red-500/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Crie Clipes Incriveis</h3>
            <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
              Cole a URL de um video do YouTube e transforme trechos em Reels, Stories ou posts para o Feed.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[
                { icon: <Smartphone className="h-5 w-5" />, label: "Reels" },
                { icon: <MonitorPlay className="h-5 w-5" />, label: "Stories" },
                { icon: <Square className="h-5 w-5" />, label: "Feed" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 py-4 rounded-xl"
                  style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div style={{ color: "#3377AF" }}>{item.icon}</div>
                  <span className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            {/* Preview Mockup */}
            <div className="relative mx-auto" style={{
              width: format === "feed" ? 360 : 270,
              aspectRatio: format === "feed" ? "1/1" : "9/16",
              maxHeight: "70vh",
            }}>
              {/* Phone frame */}
              <div
                className="w-full h-full rounded-3xl overflow-hidden relative"
                style={{
                  backgroundColor: "#12121A",
                  border: "3px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 60px rgba(51,119,175,0.15), 0 0 120px rgba(131,247,20,0.05)",
                }}
              >
                {/* Thumbnail as background */}
                <img
                  src={videoInfo.thumbnail}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: cropPosition === "top" ? "top" : cropPosition === "bottom" ? "bottom" : "center",
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).src = videoInfo.thumbnail.replace("maxresdefault", "hqdefault"); }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.2)" }} />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>

                {/* Time badge */}
                <div
                  className="absolute top-3 right-3 px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                  <Clock className="h-3 w-3 text-white" />
                  <span className="text-[10px] font-mono text-white">{formatSeconds(clipDuration())}</span>
                </div>

                {/* Format badge */}
                <div
                  className="absolute top-3 left-3 px-2 py-1 rounded-md backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(51,119,175,0.8)" }}
                >
                  <span className="text-[10px] font-semibold text-white">{formatLabels[format]}</span>
                </div>

                {/* Text overlay preview */}
                {textEnabled && overlayText && (
                  <div
                    className="absolute left-3 right-3 flex"
                    style={{
                      top: textPosition === "top" ? "3rem" : textPosition === "center" ? "50%" : undefined,
                      bottom: textPosition === "bottom" ? "3rem" : undefined,
                      transform: textPosition === "center" ? "translateY(-50%)" : undefined,
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="px-3 py-2 rounded-lg max-w-full"
                      style={{
                        backgroundColor: `${bgColor}${Math.round(bgOpacity * 2.55).toString(16).padStart(2, "0")}`,
                      }}
                    >
                      <p
                        className="text-center font-semibold break-words"
                        style={{
                          color: textColor,
                          fontSize: `${Math.max(10, fontSize * 0.5)}px`,
                        }}
                      >
                        {overlayText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Crop indicator lines */}
                {cropPosition !== "center" && (
                  <>
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed"
                      style={{
                        top: cropPosition === "top" ? "0" : "auto",
                        bottom: cropPosition === "bottom" ? "0" : "auto",
                        borderColor: "rgba(131,247,20,0.4)",
                      }}
                    />
                  </>
                )}
              </div>

              {/* Quality indicator */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(131,247,20,0.1)", color: "#83F714" }}>
                  {quality}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(51,119,175,0.1)", color: "#3377AF" }}>
                  MP4
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>
                  {formatSeconds(parseTimeToSeconds(startTime))} - {formatSeconds(parseTimeToSeconds(endTime))}
                </span>
              </div>
            </div>

            {/* Saved clips */}
            {savedClips.length > 0 && (
              <div className="mt-8 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#83F714" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                    Clipes salvos
                  </span>
                </div>
                <div className="space-y-2">
                  {savedClips.map((clip, i) => (
                    <div
                      key={clip.id || i}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: clip.status === "done" ? "#83F714" : clip.status === "processing" ? "#3377AF" : "#fbbf24" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{clip.video_title}</p>
                        <p className="text-[10px]" style={{ color: "#94A3B8" }}>
                          {formatSeconds(clip.start_time)} - {formatSeconds(clip.end_time)} | {clip.format} | {clip.quality}
                        </p>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{
                          backgroundColor: clip.status === "done" ? "rgba(131,247,20,0.1)" : clip.status === "processing" ? "rgba(51,119,175,0.1)" : "rgba(251,191,36,0.1)",
                          color: clip.status === "done" ? "#83F714" : clip.status === "processing" ? "#3377AF" : "#fbbf24",
                        }}
                      >
                        {clip.status === "done" ? "Pronto" : clip.status === "processing" ? "Processando" : "Pendente"}
                      </span>
                    </div>
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

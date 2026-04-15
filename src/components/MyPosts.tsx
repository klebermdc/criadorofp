import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CarouselData, CarouselStatus } from "@/types/carousel";
import { Search, Filter, Trash2, Copy, Download, Edit3, FileImage, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import JSZip from "jszip";

interface MyPostsProps {
  onEdit: (data: CarouselData) => void;
}

const STATUS_COLORS: Record<CarouselStatus, { bg: string; text: string; label: string }> = {
  rascunho: { bg: "rgba(148,163,184,0.15)", text: "#94A3B8", label: "Rascunho" },
  agendado: { bg: "rgba(51,119,175,0.15)", text: "#3377AF", label: "Agendado" },
  publicado: { bg: "rgba(131,247,20,0.15)", text: "#83F714", label: "Publicado" },
};

export function MyPosts({ onEdit }: MyPostsProps) {
  const [posts, setPosts] = useState<CarouselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("carousels")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as unknown as CarouselData[]);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const deletePost = async (id: string) => {
    await supabase.from("carousels").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Carrossel removido");
  };

  const duplicatePost = async (post: CarouselData) => {
    const { data: saved } = await supabase
      .from("carousels")
      .insert({
        topic: post.topic + " (copia)",
        style: post.style,
        slides: post.slides as any,
      })
      .select()
      .single();
    if (saved) {
      loadPosts();
      toast.success("Carrossel duplicado");
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchSearch = !search || p.topic.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || (p.status || "rascunho") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <h2 className="text-lg font-bold text-white">Meus Posts</h2>
          <p className="text-xs" style={{ color: "#94A3B8" }}>{posts.length} carrosseis criados</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs w-48 text-white"
              style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-32" style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)" }}>
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3377AF" }} />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(51,119,175,0.1)" }}>
              <FileImage className="h-10 w-10" style={{ color: "#3377AF", opacity: 0.4 }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {search || statusFilter !== "todos" ? "Nenhum post encontrado" : "Nenhum post criado ainda"}
            </h3>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              {search || statusFilter !== "todos" ? "Tente alterar os filtros" : "Va para a aba Criar para gerar seu primeiro carrossel"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const status = post.status || "rascunho";
              const statusInfo = STATUS_COLORS[status];
              const firstSlide = post.slides?.[0];

              return (
                <div
                  key={post.id}
                  className="rounded-xl overflow-hidden group transition-all hover:scale-[1.02] cursor-pointer"
                  style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => onEdit(post)}
                >
                  {/* Thumbnail */}
                  <div
                    className="h-40 relative"
                    style={{
                      background: firstSlide
                        ? `linear-gradient(180deg, ${firstSlide.gradientFrom || "#0A0A0F"} 0%, ${firstSlide.gradientTo || "#12121A"} 100%)`
                        : "linear-gradient(180deg, #0A0A0F, #12121A)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <p className="text-sm font-bold text-white text-center leading-tight line-clamp-3">
                        {firstSlide?.title || post.topic}
                      </p>
                    </div>
                    {/* Slide count badge */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}>
                      {post.slides?.length || 0} slides
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate mb-2">{post.topic}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                          {post.created_at ? new Date(post.created_at).toLocaleDateString("pt-BR") : ""}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                          className="p-1 rounded hover:bg-white/5"
                          title="Editar"
                        >
                          <Edit3 className="h-3.5 w-3.5" style={{ color: "#3377AF" }} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicatePost(post); }}
                          className="p-1 rounded hover:bg-white/5"
                          title="Duplicar"
                        >
                          <Copy className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePost(post.id!); }}
                          className="p-1 rounded hover:bg-red-500/10"
                          title="Excluir"
                        >
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

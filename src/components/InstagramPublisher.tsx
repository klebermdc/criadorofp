import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CarouselData, InstagramAccount } from "@/types/carousel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Instagram, Send, Clock, Loader2, X, Plus, Hash,
  CalendarDays, CheckCircle2, Image as ImageIcon, AlertCircle
} from "lucide-react";

interface InstagramPublisherProps {
  carousel: CarouselData;
  slideImages: string[];
  isOpen: boolean;
  onClose: () => void;
  onPublished: (postId: string) => void;
}

async function uploadSlideImages(images: string[], carouselId: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const blob = await (await fetch(images[i])).blob();
    const fileName = `${carouselId}/slide-${i}-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from("carousel-images")
      .upload(fileName, blob, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`Erro ao enviar slide ${i + 1}: ${error.message}`);
    const { data: urlData } = supabase.storage.from("carousel-images").getPublicUrl(data.path);
    urls.push(urlData.publicUrl);
  }
  return urls;
}

async function publishToInstagram(
  account: InstagramAccount,
  images: string[],
  caption: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("instagram-publish", {
      body: {
        access_token: account.access_token,
        ig_user_id: account.ig_user_id,
        image_urls: images,
        caption,
        action: "publish",
      },
    });
    if (error) throw error;
    if (data?.error) return { success: false, error: data.error };
    return { success: true, postId: data?.post_id };
  } catch (e: any) {
    return { success: false, error: e.message || "Erro desconhecido ao publicar" };
  }
}

async function scheduleInstagramPost(
  account: InstagramAccount,
  images: string[],
  caption: string,
  scheduledTime: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("instagram-publish", {
      body: {
        access_token: account.access_token,
        ig_user_id: account.ig_user_id,
        image_urls: images,
        caption,
        action: "schedule",
        scheduled_time: scheduledTime.toISOString(),
      },
    });
    if (error) throw error;
    if (data?.error) return { success: false, error: data.error };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Erro desconhecido ao agendar" };
  }
}

export function InstagramPublisher({
  carousel,
  slideImages,
  isOpen,
  onClose,
  onPublished,
}: InstagramPublisherProps) {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setCaption(carousel.caption || "");
      const tags = carousel.hashtags
        ? carousel.hashtags.split(/\s+/).filter((t) => t.startsWith("#"))
        : [];
      setHashtags(tags);
    }
  }, [isOpen, carousel]);

  const loadAccounts = async () => {
    const { data } = await supabase
      .from("instagram_accounts")
      .select("*")
      .order("connected_at", { ascending: false });
    if (data) {
      setAccounts(data as unknown as InstagramAccount[]);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId((data[0] as any).id);
      }
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const addHashtag = () => {
    const tag = newHashtag.trim().replace(/^#?/, "#");
    if (tag.length > 1 && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const fullCaption = [caption, "", hashtags.join(" ")].join("\n").trim();
  const charCount = fullCaption.length;
  const MAX_CHARS = 2200;

  const handlePublish = async () => {
    if (!selectedAccount) {
      toast.error("Selecione uma conta do Instagram");
      return;
    }
    if (slideImages.length === 0) {
      toast.error("Nenhuma imagem de slide disponivel");
      return;
    }

    setPublishing(true);
    try {
      setUploadProgress("Enviando imagens...");
      const imageUrls = await uploadSlideImages(
        slideImages,
        carousel.id || crypto.randomUUID()
      );

      if (isScheduled && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const schedDate = new Date(scheduledDate);
        schedDate.setHours(hours, minutes, 0, 0);

        if (schedDate <= new Date()) {
          toast.error("A data de agendamento deve ser no futuro");
          setPublishing(false);
          return;
        }

        setUploadProgress("Agendando publicacao...");
        const result = await scheduleInstagramPost(
          selectedAccount,
          imageUrls,
          fullCaption,
          schedDate
        );

        if (result.success) {
          toast.success("Publicacao agendada com sucesso!");
          if (carousel.id) {
            await supabase
              .from("carousels")
              .update({
                status: "agendado",
                scheduled_date: schedDate.toISOString(),
              })
              .eq("id", carousel.id);
          }
          onClose();
        } else {
          toast.error(result.error || "Erro ao agendar publicacao");
        }
      } else {
        setUploadProgress("Publicando no Instagram...");
        const result = await publishToInstagram(
          selectedAccount,
          imageUrls,
          fullCaption
        );

        if (result.success && result.postId) {
          toast.success("Carrossel publicado no Instagram!");
          if (carousel.id) {
            await supabase
              .from("carousels")
              .update({ status: "publicado" })
              .eq("id", carousel.id);
          }
          onPublished(result.postId);
          onClose();
        } else {
          toast.error(result.error || "Erro ao publicar no Instagram");
        }
      }
    } catch (e: any) {
      toast.error("Erro: " + (e.message || "Falha na publicacao"));
    } finally {
      setPublishing(false);
      setUploadProgress("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] p-0 border"
        style={{
          backgroundColor: "#0A0A0F",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Instagram className="h-5 w-5" style={{ color: "#E1306C" }} />
            Publicar no Instagram
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Account Selector */}
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "#94A3B8" }}
              >
                Conta do Instagram
              </label>
              {accounts.length === 0 ? (
                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: "#12121A",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <AlertCircle
                    className="h-8 w-8 mx-auto mb-2"
                    style={{ color: "#94A3B8" }}
                  />
                  <p className="text-sm text-white mb-1">
                    Nenhuma conta conectada
                  </p>
                  <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                    Va na aba Instagram para conectar uma conta
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger
                    style={{
                      backgroundColor: "#12121A",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  >
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id!}>
                        <div className="flex items-center gap-2">
                          {acc.profile_picture_url ? (
                            <img
                              src={acc.profile_picture_url}
                              className="w-5 h-5 rounded-full"
                              alt=""
                            />
                          ) : (
                            <Instagram className="h-4 w-4" />
                          )}
                          @{acc.username}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Preview thumbnails */}
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "#94A3B8" }}
              >
                <ImageIcon className="h-3 w-3 inline mr-1" />
                Slides ({slideImages.length})
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {slideImages.map((img, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Slide ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {slideImages.length === 0 && (
                  <div
                    className="flex items-center justify-center w-full py-4 rounded-lg"
                    style={{
                      backgroundColor: "#12121A",
                      border: "1px dashed rgba(255,255,255,0.15)",
                    }}
                  >
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      Exporte os slides primeiro para visualizar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Caption editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#94A3B8" }}
                >
                  Legenda
                </label>
                <span
                  className="text-xs"
                  style={{
                    color: charCount > MAX_CHARS ? "#ef4444" : "#94A3B8",
                  }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva a legenda do seu post..."
                rows={5}
                className="resize-none text-sm"
                style={{
                  backgroundColor: "#12121A",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "white",
                }}
              />
            </div>

            {/* Hashtags */}
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                style={{ color: "#94A3B8" }}
              >
                <Hash className="h-3 w-3 inline mr-1" />
                Hashtags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: "rgba(51,119,175,0.15)",
                      color: "#3377AF",
                    }}
                    onClick={() => removeHashtag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                  placeholder="Adicionar hashtag..."
                  className="text-sm flex-1"
                  style={{
                    backgroundColor: "#12121A",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addHashtag}
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    backgroundColor: "#12121A",
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Schedule toggle */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#12121A",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: "#94A3B8" }} />
                  <span className="text-sm text-white">Agendar publicacao</span>
                </div>
                <Switch
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
              </div>

              {isScheduled && (
                <div className="space-y-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs mb-1 block"
                      style={{ color: "#94A3B8" }}
                    >
                      Horario
                    </label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="text-sm w-32"
                      style={{
                        backgroundColor: "#0A0A0F",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Publish button */}
            <button
              onClick={handlePublish}
              disabled={publishing || accounts.length === 0 || slideImages.length === 0}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: publishing
                  ? "#12121A"
                  : isScheduled
                  ? "linear-gradient(135deg, #3377AF 0%, #06b6d4 100%)"
                  : "linear-gradient(135deg, #E1306C 0%, #F77737 100%)",
                color: publishing ? "#94A3B8" : "white",
                border: publishing
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "none",
              }}
            >
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress || "Processando..."}
                </>
              ) : isScheduled ? (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Agendar Publicacao
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publicar Agora
                </>
              )}
            </button>

            {publishing && (
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "#12121A" }}
              >
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{
                    width: "60%",
                    background: "linear-gradient(90deg, #E1306C, #F77737)",
                  }}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

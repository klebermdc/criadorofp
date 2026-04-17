import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InstagramAccount, Brand } from "@/types/carousel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Instagram, Plus, Trash2, CheckCircle2, XCircle, Loader2,
  Link2, ExternalLink, User, Key, Hash, AlertCircle, Wifi
} from "lucide-react";

interface InstagramAccountManagerProps {
  onAccountsChange?: () => void;
}

export function InstagramAccountManager({ onAccountsChange }: InstagramAccountManagerProps) {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formAccessToken, setFormAccessToken] = useState("");
  const [formPageId, setFormPageId] = useState("");
  const [formIgUserId, setFormIgUserId] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [accountsRes, brandsRes] = await Promise.all([
      supabase
        .from("instagram_accounts")
        .select("*")
        .order("connected_at", { ascending: false }),
      supabase.from("brands").select("*").order("name"),
    ]);
    if (accountsRes.data) setAccounts(accountsRes.data as unknown as InstagramAccount[]);
    if (brandsRes.data) setBrands(brandsRes.data as unknown as Brand[]);
    setLoading(false);
  };

  const resetForm = () => {
    setFormUsername("");
    setFormAccessToken("");
    setFormPageId("");
    setFormIgUserId("");
    setFormBrandId("");
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formUsername.trim() || !formAccessToken.trim() || !formPageId.trim() || !formIgUserId.trim()) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("instagram_accounts").insert({
        username: formUsername.trim().replace(/^@/, ""),
        access_token: formAccessToken.trim(),
        page_id: formPageId.trim(),
        ig_user_id: formIgUserId.trim(),
        brand_id: formBrandId || null,
        connected_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(`Conta @${formUsername} conectada!`);
      resetForm();
      loadData();
      onAccountsChange?.();
    } catch (e: any) {
      toast.error("Erro ao salvar conta: " + (e.message || "Tente novamente"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (account: InstagramAccount) => {
    const confirmed = window.confirm(
      `Remover conta @${account.username}? Essa acao nao pode ser desfeita.`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("instagram_accounts")
      .delete()
      .eq("id", account.id!);

    if (error) {
      toast.error("Erro ao remover conta");
    } else {
      toast.success(`Conta @${account.username} removida`);
      loadData();
      onAccountsChange?.();
    }
  };

  const handleTestConnection = async (account: InstagramAccount) => {
    setTestingId(account.id!);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${account.ig_user_id}?fields=id,username,profile_picture_url&access_token=${account.access_token}`
      );
      const data = await res.json();

      if (data.error) {
        toast.error(`Falha: ${data.error.message}`);
      } else {
        toast.success(`Conexao OK! Usuario: @${data.username}`);
        // Update profile picture if available
        if (data.profile_picture_url) {
          await supabase
            .from("instagram_accounts")
            .update({ profile_picture_url: data.profile_picture_url })
            .eq("id", account.id!);
          loadData();
        }
      }
    } catch (e: any) {
      toast.error("Erro ao testar conexao: " + (e.message || "Falha na requisicao"));
    } finally {
      setTestingId(null);
    }
  };

  const handleUpdateBrand = async (accountId: string, brandId: string) => {
    const { error } = await supabase
      .from("instagram_accounts")
      .update({ brand_id: brandId || null })
      .eq("id", accountId);

    if (error) {
      toast.error("Erro ao atualizar marca");
    } else {
      toast.success("Marca associada!");
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3377AF" }} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <div
        className="p-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #E1306C, #F77737)" }}
          >
            <Instagram className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Contas Instagram</h2>
            <p className="text-xs" style={{ color: "#94A3B8" }}>
              Gerencie suas contas conectadas
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 text-sm"
          style={{
            background: showForm
              ? "#12121A"
              : "linear-gradient(135deg, #3377AF 0%, #83F714 100%)",
            color: showForm ? "#94A3B8" : "#0A0A0F",
            border: showForm ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}
        >
          {showForm ? (
            <>
              <XCircle className="h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Conectar Conta
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Connect Form */}
          {showForm && (
            <div
              className="p-5 rounded-xl space-y-4"
              style={{
                backgroundColor: "#12121A",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="h-4 w-4" style={{ color: "#3377AF" }} />
                Conectar Nova Conta
              </h3>

              {/* Instructions */}
              <div
                className="p-3 rounded-lg text-xs space-y-1"
                style={{
                  backgroundColor: "rgba(51,119,175,0.08)",
                  border: "1px solid rgba(51,119,175,0.2)",
                }}
              >
                <p className="font-semibold" style={{ color: "#3377AF" }}>
                  Como obter os tokens:
                </p>
                <ol className="list-decimal ml-4 space-y-0.5" style={{ color: "#94A3B8" }}>
                  <li>
                    Acesse{" "}
                    <a
                      href="https://developers.facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#3377AF" }}
                    >
                      developers.facebook.com
                      <ExternalLink className="h-3 w-3 inline ml-0.5" />
                    </a>
                  </li>
                  <li>Crie um app com o produto "Instagram Graph API"</li>
                  <li>
                    No Graph API Explorer, gere um token com permissoes:
                    pages_show_list, instagram_basic, instagram_content_publish
                  </li>
                  <li>Copie o Page ID e Instagram User ID do seu perfil</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>
                    <User className="h-3 w-3 inline mr-1" />
                    Username *
                  </label>
                  <Input
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="@seuusuario"
                    className="text-sm"
                    style={{
                      backgroundColor: "#0A0A0F",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>
                    <Hash className="h-3 w-3 inline mr-1" />
                    Instagram User ID *
                  </label>
                  <Input
                    value={formIgUserId}
                    onChange={(e) => setFormIgUserId(e.target.value)}
                    placeholder="17841400..."
                    className="text-sm"
                    style={{
                      backgroundColor: "#0A0A0F",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>
                  <Key className="h-3 w-3 inline mr-1" />
                  Access Token *
                </label>
                <Input
                  value={formAccessToken}
                  onChange={(e) => setFormAccessToken(e.target.value)}
                  placeholder="EAAxxxxxxx..."
                  type="password"
                  className="text-sm font-mono"
                  style={{
                    backgroundColor: "#0A0A0F",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>
                    <Hash className="h-3 w-3 inline mr-1" />
                    Page ID *
                  </label>
                  <Input
                    value={formPageId}
                    onChange={(e) => setFormPageId(e.target.value)}
                    placeholder="1234567890..."
                    className="text-sm"
                    style={{
                      backgroundColor: "#0A0A0F",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>
                    Marca (opcional)
                  </label>
                  <Select value={formBrandId} onValueChange={setFormBrandId}>
                    <SelectTrigger
                      style={{
                        backgroundColor: "#0A0A0F",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    >
                      <SelectValue placeholder="Selecionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id!}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full gap-2"
                style={{
                  background: "linear-gradient(135deg, #3377AF 0%, #83F714 100%)",
                  color: "#0A0A0F",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Conectar Conta
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Account list */}
          {accounts.length === 0 && !showForm ? (
            <div className="text-center py-16">
              <Instagram
                className="h-12 w-12 mx-auto mb-3"
                style={{ color: "#94A3B8", opacity: 0.3 }}
              />
              <p className="text-sm text-white mb-1">
                Nenhuma conta conectada
              </p>
              <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                Conecte sua conta do Instagram para publicar carrosseis
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2"
                style={{
                  background: "linear-gradient(135deg, #E1306C, #F77737)",
                  color: "white",
                }}
              >
                <Plus className="h-4 w-4" />
                Conectar Primeira Conta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => {
                const brand = brands.find((b) => b.id === acc.brand_id);
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl group transition-all hover:scale-[1.005]"
                    style={{
                      backgroundColor: "#12121A",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Profile pic */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={{
                          background: acc.profile_picture_url
                            ? "none"
                            : "linear-gradient(135deg, #E1306C, #F77737)",
                        }}
                      >
                        {acc.profile_picture_url ? (
                          <img
                            src={acc.profile_picture_url}
                            alt={acc.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">
                          @{acc.username}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {brand && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${brand.primary_color}20`,
                                color: brand.primary_color,
                              }}
                            >
                              {brand.name}
                            </span>
                          )}
                          {acc.connected_at && (
                            <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                              Conectada em{" "}
                              {new Date(acc.connected_at).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* Brand selector inline */}
                        <Select
                          value={acc.brand_id || ""}
                          onValueChange={(v) => handleUpdateBrand(acc.id!, v)}
                        >
                          <SelectTrigger
                            className="h-8 w-28 text-xs"
                            style={{
                              backgroundColor: "#0A0A0F",
                              borderColor: "rgba(255,255,255,0.08)",
                              color: "#94A3B8",
                            }}
                          >
                            <SelectValue placeholder="Marca" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((b) => (
                              <SelectItem key={b.id} value={b.id!}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => handleTestConnection(acc)}
                          disabled={testingId === acc.id}
                          style={{
                            borderColor: "rgba(255,255,255,0.08)",
                            backgroundColor: "#0A0A0F",
                          }}
                        >
                          {testingId === acc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Wifi className="h-3 w-3" />
                          )}
                          Testar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemove(acc)}
                          style={{
                            borderColor: "rgba(255,255,255,0.08)",
                            backgroundColor: "#0A0A0F",
                            color: "#ef4444",
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

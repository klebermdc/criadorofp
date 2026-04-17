import { useState, useEffect } from "react";
import { Brand, BRAND_FONT_OPTIONS, BRAND_TONE_OPTIONS, BRAND_PRESETS } from "@/types/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Palette,
  Globe,
  Instagram,
  Type,
  Sparkles,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BrandManagerProps {
  onSelectBrand: (brand: Brand) => void;
  selectedBrand?: Brand | null;
}

const STORAGE_KEY = "criadorofp_brands";

function loadFromLocalStorage(): Brand[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(brands: Brand[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
}

const emptyBrand: Brand = {
  name: "",
  primary_color: "#3377AF",
  secondary_color: "#83F714",
  accent_color: "#FF6B35",
  font_display: "Space Grotesk",
  font_body: "Montserrat",
  tone_of_voice: "Profissional",
  description: "",
  website: "",
  instagram_handle: "",
  logo_url: "",
};

export function BrandManager({ onSelectBrand, selectedBrand }: BrandManagerProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<Brand>({ ...emptyBrand });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [useSupabase, setUseSupabase] = useState(true);

  // Load brands
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          logo_url: d.logo_url,
          primary_color: d.primary_color,
          secondary_color: d.secondary_color,
          accent_color: d.accent_color,
          font_display: d.font_display,
          font_body: d.font_body,
          tone_of_voice: d.tone_of_voice,
          description: d.description,
          website: d.website,
          instagram_handle: d.instagram_handle,
          created_at: d.created_at,
        }));
        setBrands(mapped);
        saveToLocalStorage(mapped);
      }
    } catch {
      setUseSupabase(false);
      const local = loadFromLocalStorage();
      setBrands(local);
    } finally {
      setLoading(false);
    }
  };

  const saveBrand = async (brand: Brand): Promise<Brand | null> => {
    if (useSupabase) {
      try {
        const payload = {
          name: brand.name,
          logo_url: brand.logo_url || null,
          primary_color: brand.primary_color,
          secondary_color: brand.secondary_color,
          accent_color: brand.accent_color || null,
          font_display: brand.font_display,
          font_body: brand.font_body,
          tone_of_voice: brand.tone_of_voice,
          description: brand.description || null,
          website: brand.website || null,
          instagram_handle: brand.instagram_handle || null,
        };

        if (brand.id) {
          const { data, error } = await supabase
            .from("brands")
            .update(payload)
            .eq("id", brand.id)
            .select()
            .single();
          if (error) throw error;
          return data as unknown as Brand;
        } else {
          const { data, error } = await supabase
            .from("brands")
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as unknown as Brand;
        }
      } catch {
        setUseSupabase(false);
      }
    }

    // localStorage fallback
    const localBrands = loadFromLocalStorage();
    if (brand.id) {
      const idx = localBrands.findIndex((b) => b.id === brand.id);
      if (idx >= 0) localBrands[idx] = brand;
      saveToLocalStorage(localBrands);
      return brand;
    } else {
      const newBrand = { ...brand, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      localBrands.unshift(newBrand);
      saveToLocalStorage(localBrands);
      return newBrand;
    }
  };

  const deleteBrand = async (id: string) => {
    if (useSupabase) {
      try {
        const { error } = await supabase.from("brands").delete().eq("id", id);
        if (error) throw error;
      } catch {
        setUseSupabase(false);
      }
    }

    if (!useSupabase) {
      const localBrands = loadFromLocalStorage().filter((b) => b.id !== id);
      saveToLocalStorage(localBrands);
    }

    setBrands((prev) => prev.filter((b) => b.id !== id));
    toast.success("Marca removida");
    setDeleteConfirm(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome da marca e obrigatorio");
      return;
    }

    const saved = await saveBrand(formData);
    if (saved) {
      await loadBrands();
      toast.success(editingBrand ? "Marca atualizada!" : "Marca criada!");
      setShowForm(false);
      setEditingBrand(null);
      setFormData({ ...emptyBrand });
    } else {
      toast.error("Erro ao salvar marca");
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ ...brand });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditingBrand(null);
    setFormData({ ...emptyBrand });
    setShowForm(true);
  };

  const addPreset = async (preset: Brand) => {
    const saved = await saveBrand({ ...preset });
    if (saved) {
      await loadBrands();
      toast.success(`Preset "${preset.name}" adicionado!`);
    }
  };

  const handleSelectBrand = (brand: Brand) => {
    onSelectBrand(brand);
    toast.success(`Marca "${brand.name}" aplicada ao gerador`);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "#3377AF" }}>
                <Building2 className="h-5 w-5" />
                Gerenciador de Marcas
              </h2>
              <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                Crie e gerencie marcas com cores, fontes e identidade visual
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                className="gap-1.5 text-xs"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  backgroundColor: "#12121A",
                  color: "#94A3B8",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Presets
                {showPresets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                onClick={startCreate}
                className="gap-1.5 text-xs"
                style={{ backgroundColor: "#3377AF", color: "#ffffff" }}
              >
                <Plus className="h-3.5 w-3.5" />
                Nova Marca
              </Button>
            </div>
          </div>

          {/* Presets Section */}
          {showPresets && (
            <div
              className="rounded-lg p-4 space-y-3"
              style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                Presets prontos para usar
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BRAND_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => addPreset(preset)}
                    className="flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex -space-x-1">
                      <div
                        className="w-6 h-6 rounded-full border-2"
                        style={{ backgroundColor: preset.primary_color, borderColor: "#12121A" }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2"
                        style={{ backgroundColor: preset.secondary_color, borderColor: "#12121A" }}
                      />
                      {preset.accent_color && (
                        <div
                          className="w-6 h-6 rounded-full border-2"
                          style={{ backgroundColor: preset.accent_color, borderColor: "#12121A" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#E2E8F0" }}>
                        {preset.name}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: "#64748B" }}>
                        {preset.font_display} / {preset.font_body}
                      </p>
                    </div>
                    <Plus className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#3377AF" }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brand Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-6 w-6 border-2 border-t-transparent rounded-full" style={{ borderColor: "#3377AF" }} />
            </div>
          ) : brands.length === 0 ? (
            <div
              className="rounded-lg p-12 text-center space-y-3"
              style={{ backgroundColor: "#12121A", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Palette className="h-10 w-10 mx-auto" style={{ color: "#3377AF", opacity: 0.5 }} />
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Nenhuma marca criada ainda
              </p>
              <p className="text-xs" style={{ color: "#64748B" }}>
                Clique em "Nova Marca" ou adicione um preset para comecar
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => {
                const isSelected = selectedBrand?.id === brand.id;
                return (
                  <div
                    key={brand.id}
                    className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      backgroundColor: "#12121A",
                      border: isSelected
                        ? `2px solid ${brand.primary_color}`
                        : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isSelected ? `0 0 20px ${brand.primary_color}30` : "none",
                    }}
                  >
                    {/* Color Banner */}
                    <div
                      className="h-16 relative"
                      style={{
                        background: `linear-gradient(135deg, ${brand.primary_color}, ${brand.secondary_color})`,
                      }}
                    >
                      {brand.accent_color && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 rounded-full border-2"
                          style={{ backgroundColor: brand.accent_color, borderColor: "rgba(255,255,255,0.3)" }}
                        />
                      )}
                      {brand.logo_url && (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="absolute bottom-0 left-4 translate-y-1/2 w-10 h-10 rounded-lg object-cover border-2"
                          style={{ borderColor: "#12121A" }}
                        />
                      )}
                    </div>

                    <div className={`p-4 space-y-3 ${brand.logo_url ? "pt-8" : "pt-4"}`}>
                      {/* Name & Description */}
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: "#E2E8F0" }}>
                          {brand.name}
                        </h3>
                        {brand.description && (
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#64748B" }}>
                            {brand.description}
                          </p>
                        )}
                      </div>

                      {/* Color Dots */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: brand.primary_color }}
                            title="Cor primaria"
                          />
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: brand.secondary_color }}
                            title="Cor secundaria"
                          />
                          {brand.accent_color && (
                            <div
                              className="w-5 h-5 rounded-full"
                              style={{ backgroundColor: brand.accent_color }}
                              title="Cor destaque"
                            />
                          )}
                        </div>
                        <div className="flex-1" />
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(51,119,175,0.15)", color: "#3377AF" }}>
                          {brand.tone_of_voice}
                        </span>
                      </div>

                      {/* Font Preview */}
                      <div className="flex items-center gap-2">
                        <Type className="h-3 w-3 flex-shrink-0" style={{ color: "#64748B" }} />
                        <span className="text-xs truncate" style={{ color: "#94A3B8", fontFamily: brand.font_display }}>
                          {brand.font_display}
                        </span>
                        <span className="text-[10px]" style={{ color: "#475569" }}>/</span>
                        <span className="text-xs truncate" style={{ color: "#94A3B8", fontFamily: brand.font_body }}>
                          {brand.font_body}
                        </span>
                      </div>

                      {/* Meta */}
                      {(brand.instagram_handle || brand.website) && (
                        <div className="flex items-center gap-3">
                          {brand.instagram_handle && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: "#64748B" }}>
                              <Instagram className="h-3 w-3" />
                              {brand.instagram_handle}
                            </span>
                          )}
                          {brand.website && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: "#64748B" }}>
                              <Globe className="h-3 w-3" />
                              {brand.website}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 text-xs h-8"
                          onClick={() => handleSelectBrand(brand)}
                          style={{
                            backgroundColor: isSelected ? brand.primary_color : "rgba(51,119,175,0.15)",
                            color: isSelected ? "#ffffff" : "#3377AF",
                          }}
                        >
                          {isSelected ? <Check className="h-3 w-3" /> : <Palette className="h-3 w-3" />}
                          {isSelected ? "Selecionada" : "Usar Marca"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => startEdit(brand)}
                          style={{ color: "#94A3B8" }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDeleteConfirm(brand.id!)}
                          style={{ color: "#EF4444" }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingBrand(null); } }}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "#E2E8F0" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#3377AF" }}>
              {editingBrand ? "Editar Marca" : "Nova Marca"}
            </DialogTitle>
            <DialogDescription style={{ color: "#94A3B8" }}>
              {editingBrand ? "Atualize as informacoes da marca" : "Preencha os dados da sua marca"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                Nome da Marca *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Minha Marca"
                style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                Logo URL
              </label>
              <Input
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
                style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
              />
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                Cores
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px]" style={{ color: "#64748B" }}>Primaria</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="text-xs h-8 flex-1"
                      style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px]" style={{ color: "#64748B" }}>Secundaria</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="text-xs h-8 flex-1"
                      style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px]" style={{ color: "#64748B" }}>Destaque</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accent_color || "#FF6B35"}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <Input
                      value={formData.accent_color || ""}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="text-xs h-8 flex-1"
                      placeholder="#FF6B35"
                      style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                    />
                  </div>
                </div>
              </div>
              {/* Live preview */}
              <div
                className="h-8 rounded-lg mt-2"
                style={{
                  background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color}${formData.accent_color ? `, ${formData.accent_color}` : ""})`,
                }}
              />
            </div>

            {/* Fonts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                  Fonte Display
                </label>
                <Select
                  value={formData.font_display}
                  onValueChange={(v) => setFormData({ ...formData, font_display: v })}
                >
                  <SelectTrigger
                    className="h-9 text-xs"
                    style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.1)" }}>
                    {BRAND_FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs" style={{ color: "#E2E8F0" }}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                  Fonte Body
                </label>
                <Select
                  value={formData.font_body}
                  onValueChange={(v) => setFormData({ ...formData, font_body: v })}
                >
                  <SelectTrigger
                    className="h-9 text-xs"
                    style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.1)" }}>
                    {BRAND_FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs" style={{ color: "#E2E8F0" }}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Font Preview */}
            <div
              className="rounded-lg p-3 space-y-1"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <p className="text-base font-bold" style={{ fontFamily: formData.font_display, color: formData.primary_color }}>
                {formData.name || "Titulo da Marca"}
              </p>
              <p className="text-xs" style={{ fontFamily: formData.font_body, color: "#94A3B8" }}>
                Este e um exemplo de como o corpo do texto vai aparecer nos seus carrosseis usando a fonte {formData.font_body}.
              </p>
            </div>

            {/* Tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                Tom de Voz
              </label>
              <Select
                value={formData.tone_of_voice}
                onValueChange={(v) => setFormData({ ...formData, tone_of_voice: v })}
              >
                <SelectTrigger
                  className="h-9 text-xs"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.1)" }}>
                  {BRAND_TONE_OPTIONS.map((tone) => (
                    <SelectItem key={tone} value={tone} className="text-xs" style={{ color: "#E2E8F0" }}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                Descricao
              </label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva brevemente a marca..."
                rows={2}
                style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
              />
            </div>

            {/* Website & Instagram */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1" style={{ color: "#94A3B8" }}>
                  <Globe className="h-3 w-3" /> Website
                </label>
                <Input
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1" style={{ color: "#94A3B8" }}>
                  <Instagram className="h-3 w-3" /> Instagram
                </label>
                <Input
                  value={formData.instagram_handle || ""}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                  placeholder="@handle"
                  style={{ backgroundColor: "#0A0A0F", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowForm(false); setEditingBrand(null); }}
              className="gap-1.5"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94A3B8" }}
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="gap-1.5"
              style={{ backgroundColor: "#3377AF", color: "#ffffff" }}
            >
              <Check className="h-3.5 w-3.5" />
              {editingBrand ? "Salvar" : "Criar Marca"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent
          className="max-w-sm"
          style={{ backgroundColor: "#12121A", borderColor: "rgba(255,255,255,0.08)", color: "#E2E8F0" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#EF4444" }}>Excluir Marca</DialogTitle>
            <DialogDescription style={{ color: "#94A3B8" }}>
              Tem certeza que deseja excluir esta marca? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(null)}
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94A3B8" }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => deleteConfirm && deleteBrand(deleteConfirm)}
              style={{ backgroundColor: "#EF4444", color: "#ffffff" }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

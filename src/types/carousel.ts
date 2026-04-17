export interface TextStyle {
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "900";
  textAlign?: "left" | "center" | "right";
  color?: string;
  opacity?: number;
  fontFamily?: string;
  textShadow?: boolean;
  textShadowIntensity?: number;
  textStroke?: boolean;
  textStrokeColor?: string;
  letterSpacing?: number;
  lineHeight?: number;
}

export interface StickerItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface TextBoxItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  style: TextStyle;
  zIndex: number;
  visible: boolean;
}

export interface ShapeItem {
  id: string;
  type: "circle" | "square" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  zIndex: number;
  visible: boolean;
}

export interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  opacity: number;
}

export type SlideElement =
  | { kind: "title"; id: string; label: string }
  | { kind: "body"; id: string; label: string }
  | { kind: "textbox"; id: string; label: string; data: TextBoxItem }
  | { kind: "sticker"; id: string; label: string; data: StickerItem }
  | { kind: "shape"; id: string; label: string; data: ShapeItem }
  | { kind: "image"; id: string; label: string; data: ImageItem };

export interface CarouselSlide {
  type: "cover" | "content" | "cta";
  title: string;
  body?: string;
  emoji?: string;
  number?: number;
  backgroundImage?: string;
  titleStyle?: TextStyle;
  bodyStyle?: TextStyle;
  titlePosition?: { x: number; y: number };
  bodyPosition?: { x: number; y: number };
  stickers?: StickerItem[];
  overlayOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  textBoxes?: TextBoxItem[];
  shapes?: ShapeItem[];
  images?: ImageItem[];
  backgroundColor?: string;
}

export type CarouselStatus = "rascunho" | "agendado" | "publicado";

export interface CarouselData {
  id?: string;
  topic: string;
  style: string;
  slides: CarouselSlide[];
  created_at?: string;
  status?: CarouselStatus;
  scheduled_date?: string;
  tone?: string;
  num_slides?: number;
  primary_color?: string;
  secondary_color?: string;
  caption?: string;
  hashtags?: string;
}

export const STYLES = [
  "Educativo",
  "Dicas",
  "Comparativo",
  "Passo a passo",
  "Curiosidades",
  "Dados/Stats",
] as const;

export type CarouselStyle = (typeof STYLES)[number];

export const TONES = [
  "Profissional",
  "Casual",
  "Inspiracional",
] as const;

export type CarouselTone = (typeof TONES)[number];

export const SLIDE_COUNTS = [5, 7, 10] as const;

export const FONT_OPTIONS = [
  "Inter",
  "Montserrat",
  "Playfair Display",
  "Poppins",
  "Roboto",
  "Oswald",
  "Lato",
  "Raleway",
  "Open Sans",
  "Bebas Neue",
  "Space Grotesk",
] as const;

export const STICKER_CATEGORIES = {
  "Viagem": ["✈️", "🗺️", "🧳", "🏖️", "🌴", "🏰", "🎢", "🎡", "🎠", "🗽"],
  "Disney": ["🏰", "🎢", "🎡", "🎆", "🎇", "⭐", "✨", "🌟", "💫", "🎪"],
  "Comida": ["🍕", "🍔", "🌮", "🍦", "🍩", "☕", "🍹", "🥤", "🍿", "🎂"],
  "Reações": ["🔥", "💯", "❤️", "👏", "🙌", "💪", "🎯", "💡", "⚡", "🚀"],
  "Setas": ["👉", "👆", "👇", "➡️", "⬆️", "⬇️", "↗️", "📌", "🔗", "📍"],
  "Símbolos": ["⭕", "❌", "✅", "⚠️", "💬", "🏷️", "📢", "🔔", "💎", "🎁"],
};

export const GRADIENT_PRESETS = [
  { from: "#f97316", to: "#ec4899", label: "Sunset" },
  { from: "#0ea5e9", to: "#06b6d4", label: "Ocean" },
  { from: "#064e3b", to: "#16a34a", label: "Forest" },
  { from: "#0f172a", to: "#000000", label: "Midnight" },
  { from: "#ec4899", to: "#8b5cf6", label: "Candy" },
  { from: "#d97706", to: "#78350f", label: "Gold" },
  { from: "#dc2626", to: "#f97316", label: "Fire" },
  { from: "#f0f9ff", to: "#93c5fd", label: "Ice" },
  { from: "#22c55e", to: "#3b82f6", label: "Neon" },
  { from: "#fce7f3", to: "#ddd6fe", label: "Pastel" },
  { from: "#1e3a5f", to: "#6b7280", label: "Corporate" },
  { from: "#3377AF", to: "#0A0A0F", label: "Explotek" },
];

export type TemplateCategory = "Todos" | "Profissional" | "Criativo" | "Educativo" | "Marketing" | "Lifestyle" | "Elegante" | "Social Media" | "Bold" | "OFP";

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
  gradientFrom: string;
  gradientTo: string;
  overlayOpacity: number;
  backgroundColor?: string;
  category?: TemplateCategory;
  titlePosition?: { x: number; y: number };
  bodyPosition?: { x: number; y: number };
}

export interface Brand {
  id?: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  font_display: string;
  font_body: string;
  tone_of_voice: string;
  description?: string;
  website?: string;
  instagram_handle?: string;
  created_at?: string;
}

export interface InstagramAccount {
  id?: string;
  username: string;
  access_token: string;
  page_id: string;
  ig_user_id: string;
  brand_id?: string;
  profile_picture_url?: string;
  connected_at?: string;
}

export const BRAND_FONT_OPTIONS = [
  "Space Grotesk",
  "Montserrat",
  "Playfair Display",
  "Poppins",
  "Syne",
  "DM Sans",
  "DM Serif Display",
  "Outfit",
  "Work Sans",
  "Clash Display",
  "Plus Jakarta Sans",
  "Unbounded",
  "Bricolage Grotesque",
  "Fraunces",
  "Cormorant Garamond",
  "Bebas Neue",
  "Oswald",
  "Raleway",
  "Lato",
] as const;

export const BRAND_TONE_OPTIONS = [
  "Profissional",
  "Casual",
  "Inspiracional",
  "Educativo",
  "Luxo",
  "Divertido",
  "Urgente",
  "Empoderador",
] as const;

export const BRAND_PRESETS: Brand[] = [
  {
    name: "Orlando Fast Pass",
    primary_color: "#3377AF",
    secondary_color: "#83F714",
    accent_color: "#FF6B35",
    font_display: "Space Grotesk",
    font_body: "Montserrat",
    tone_of_voice: "Profissional",
    description: "Agencia de viagens especializada em Orlando",
    instagram_handle: "@orlandofastpass",
  },
  {
    name: "Explotek",
    primary_color: "#3377AF",
    secondary_color: "#83F714",
    accent_color: "#00D4FF",
    font_display: "Space Grotesk",
    font_body: "Montserrat",
    tone_of_voice: "Profissional",
    description: "Portal de inteligencia de mercado",
    instagram_handle: "@explotek.pro",
  },
  {
    name: "Studio Luxe",
    primary_color: "#1A1A2E",
    secondary_color: "#E0B060",
    accent_color: "#F5F0E8",
    font_display: "Playfair Display",
    font_body: "DM Sans",
    tone_of_voice: "Luxo",
    description: "Preset premium para marcas de luxo",
  },
  {
    name: "Vibe Digital",
    primary_color: "#6C2BD9",
    secondary_color: "#FF6BCC",
    accent_color: "#00E5FF",
    font_display: "Syne",
    font_body: "Poppins",
    tone_of_voice: "Divertido",
    description: "Preset vibrante para marcas digitais",
  },
  {
    name: "EcoGreen",
    primary_color: "#1B4332",
    secondary_color: "#52B788",
    accent_color: "#D8F3DC",
    font_display: "Outfit",
    font_body: "Work Sans",
    tone_of_voice: "Inspiracional",
    description: "Preset natural para marcas sustentaveis",
  },
  {
    name: "Tech Corp",
    primary_color: "#0F172A",
    secondary_color: "#3B82F6",
    accent_color: "#F59E0B",
    font_display: "Plus Jakarta Sans",
    font_body: "DM Sans",
    tone_of_voice: "Profissional",
    description: "Preset corporativo para empresas de tecnologia",
  },
  {
    name: "Mentor Pro",
    primary_color: "#18181B",
    secondary_color: "#F97316",
    accent_color: "#FBBF24",
    font_display: "Bebas Neue",
    font_body: "Raleway",
    tone_of_voice: "Educativo",
    description: "Preset educacional para infoprodutores",
  },
];

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  // ── Profissional (6) ─────────────────────────────────────────
  {
    id: "clean-dark",
    name: "Clean Dark",
    description: "Navy profundo, título branco impactante, corpo azul suave",
    titleStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#93c5fd", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a1628",
    gradientTo: "#060d18",
    overlayOpacity: 0.92,
    category: "Profissional",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Charcoal elegante com título dourado, tom executivo",
    titleStyle: { color: "#d4a853", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#f5f0e8", fontFamily: "Lato", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#1a1a2e",
    gradientTo: "#000000",
    overlayOpacity: 0.93,
    category: "Profissional",
  },
  {
    id: "corporate-bold",
    name: "Corporate Bold",
    description: "Azul escuro corporativo, branco vibrante, cyan nos destaques",
    titleStyle: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#00d4ff", fontFamily: "Montserrat", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0d1b2a",
    gradientTo: "#0a1420",
    overlayOpacity: 0.90,
    category: "Profissional",
  },
  {
    id: "minimal-pro",
    name: "Minimal Pro",
    description: "Quase preto, branco puro, minimalismo sofisticado",
    titleStyle: { color: "#ffffff", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 4 },
    bodyStyle: { color: "#a1a1aa", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#0f0f0f",
    gradientTo: "#1a1a1a",
    overlayOpacity: 0.95,
    category: "Profissional",
  },
  {
    id: "authority",
    name: "Authority",
    description: "Púrpura-preto imponente, título branco, corpo lilás",
    titleStyle: { color: "#ffffff", fontFamily: "Oswald", fontWeight: "bold", fontSize: 50, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#b794f6", fontFamily: "Raleway", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0d0520",
    gradientTo: "#1a0e2e",
    overlayOpacity: 0.92,
    category: "Profissional",
  },
  {
    id: "startup",
    name: "Startup",
    description: "Teal escuro tech, verde neon no título, vibe startup",
    titleStyle: { color: "#00ff88", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a1f2e",
    gradientTo: "#0d2836",
    overlayOpacity: 0.90,
    category: "Profissional",
  },

  // ── Criativo (5) ─────────────────────────────────────────────
  {
    id: "neon-night",
    name: "Neon Night",
    description: "Preto total com título rosa neon vibrante",
    titleStyle: { color: "#ff2d95", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 52, textShadow: true, textShadowIntensity: 8 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#000000",
    gradientTo: "#0a0015",
    overlayOpacity: 0.93,
    category: "Criativo",
  },
  {
    id: "electric",
    name: "Electric",
    description: "Fundo escuro com azul elétrico pulsante",
    titleStyle: { color: "#00b4ff", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a0a1a",
    gradientTo: "#12122a",
    overlayOpacity: 0.92,
    category: "Criativo",
  },
  {
    id: "sunset-vibes",
    name: "Sunset Vibes",
    description: "Tons quentes escuros, laranja vibrante, clima pôr do sol",
    titleStyle: { color: "#ff6b35", fontFamily: "Poppins", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#fef3e2", fontFamily: "Lato", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#1a0a05",
    gradientTo: "#2d1408",
    overlayOpacity: 0.90,
    category: "Criativo",
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Estética cyberpunk, ciano brilhante no escuro",
    titleStyle: { color: "#00ffcc", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#050510",
    gradientTo: "#0d0d20",
    overlayOpacity: 0.93,
    category: "Criativo",
  },
  {
    id: "tropical",
    name: "Tropical",
    description: "Verde escuro tropical, lima vibrante, vibe natureza",
    titleStyle: { color: "#83F714", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#051a0a",
    gradientTo: "#0a2d14",
    overlayOpacity: 0.90,
    category: "Criativo",
  },

  // ── Educativo (5) ────────────────────────────────────────────
  {
    id: "classroom",
    name: "Classroom",
    description: "Slate escuro acadêmico, título amarelo ouro, didático",
    titleStyle: { color: "#ffd700", fontFamily: "Oswald", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0f1729",
    gradientTo: "#1a2337",
    overlayOpacity: 0.90,
    category: "Educativo",
  },
  {
    id: "science",
    name: "Science",
    description: "Navy profundo científico, verde menta, tom analítico",
    titleStyle: { color: "#4ade80", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#d1d5db", fontFamily: "Inter", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#0a0f20",
    gradientTo: "#141d35",
    overlayOpacity: 0.92,
    category: "Educativo",
  },
  {
    id: "infographic",
    name: "Infographic",
    description: "Escuro com laranja energético, ideal para dados e gráficos",
    titleStyle: { color: "#ff8c42", fontFamily: "Montserrat", fontWeight: "900", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#101020",
    gradientTo: "#1a1a30",
    overlayOpacity: 0.91,
    category: "Educativo",
  },
  {
    id: "tutorial",
    name: "Tutorial",
    description: "GitHub-style escuro, azul céu, perfeito para passo a passo",
    titleStyle: { color: "#58a6ff", fontFamily: "Inter", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0d1117",
    gradientTo: "#161b22",
    overlayOpacity: 0.92,
    category: "Educativo",
  },
  {
    id: "study",
    name: "Study",
    description: "Tom quente escuro, âmbar acolhedor, clima de estudo",
    titleStyle: { color: "#f59e0b", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#fef3c7", fontFamily: "Lato", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#15120e",
    gradientTo: "#201d18",
    overlayOpacity: 0.90,
    category: "Educativo",
  },

  // ── Marketing (5) ────────────────────────────────────────────
  {
    id: "sales",
    name: "Sales",
    description: "Vermelho urgente no escuro, alta conversão, tom agressivo",
    titleStyle: { color: "#ef4444", fontFamily: "Oswald", fontWeight: "900", fontSize: 52, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#1a0505",
    gradientTo: "#0d0202",
    overlayOpacity: 0.93,
    category: "Marketing",
  },
  {
    id: "growth",
    name: "Growth",
    description: "Verde crescimento no escuro, vibe growth hacking",
    titleStyle: { color: "#22c55e", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a150a",
    gradientTo: "#0d200d",
    overlayOpacity: 0.90,
    category: "Marketing",
  },
  {
    id: "launch",
    name: "Launch",
    description: "Púrpura escuro de lançamento, violeta vibrante, hype",
    titleStyle: { color: "#a855f7", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 52, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Raleway", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#120520",
    gradientTo: "#1d0a35",
    overlayOpacity: 0.92,
    category: "Marketing",
  },
  {
    id: "conversion",
    name: "Conversion",
    description: "Preto com laranja de conversão, CTA forte, direto",
    titleStyle: { color: "#f97316", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0d0d0d",
    gradientTo: "#1a1a1a",
    overlayOpacity: 0.93,
    category: "Marketing",
  },
  {
    id: "brand",
    name: "Brand",
    description: "Azul escuro branding, tom confiável, corporativo moderno",
    titleStyle: { color: "#3b82f6", fontFamily: "Poppins", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a1025",
    gradientTo: "#0d1830",
    overlayOpacity: 0.90,
    category: "Marketing",
  },

  // ── Lifestyle (4) ────────────────────────────────────────────
  {
    id: "wellness",
    name: "Wellness",
    description: "Verde sage escuro, menta suave, clima bem-estar",
    titleStyle: { color: "#86efac", fontFamily: "Raleway", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Lato", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a120d",
    gradientTo: "#121e16",
    overlayOpacity: 0.90,
    category: "Lifestyle",
  },
  {
    id: "travel",
    name: "Travel",
    description: "Oceano escuro, aqua vibrante, espírito aventureiro",
    titleStyle: { color: "#22d3ee", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a1520",
    gradientTo: "#0d1d2d",
    overlayOpacity: 0.91,
    category: "Lifestyle",
  },
  {
    id: "foodie",
    name: "Foodie",
    description: "Tons quentes escuros, laranja appetitoso, clima gourmet",
    titleStyle: { color: "#fb923c", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#fef3e2", fontFamily: "Lato", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#1a100a",
    gradientTo: "#261a0f",
    overlayOpacity: 0.90,
    category: "Lifestyle",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Preto absoluto, vermelho intenso, energia pura",
    titleStyle: { color: "#ff3b30", fontFamily: "Oswald", fontWeight: "900", fontSize: 52, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#000000",
    gradientTo: "#0d0d0d",
    overlayOpacity: 0.95,
    category: "Lifestyle",
  },

  // ── Elegante (4) ─────────────────────────────────────────────
  {
    id: "luxury",
    name: "Luxury",
    description: "Preto premium, dourado luxuoso, sofisticação máxima",
    titleStyle: { color: "#d4a853", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#050505",
    gradientTo: "#111111",
    overlayOpacity: 0.95,
    category: "Elegante",
  },
  {
    id: "rose",
    name: "Rosé",
    description: "Rosé escuro romântico, rosa delicado, tom feminino premium",
    titleStyle: { color: "#f9a8d4", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#150810",
    gradientTo: "#200d18",
    overlayOpacity: 0.92,
    category: "Elegante",
  },
  {
    id: "champagne",
    name: "Champagne",
    description: "Escuro com champagne dourado, celebração sofisticada",
    titleStyle: { color: "#e8d5b7", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44, textShadow: true, textShadowIntensity: 4 },
    bodyStyle: { color: "#ffffff", fontFamily: "Lato", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#100d08",
    gradientTo: "#1a1510",
    overlayOpacity: 0.90,
    category: "Elegante",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Navy profundo meia-noite, prata elegante, noturno",
    titleStyle: { color: "#cbd5e1", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 19, lineHeight: 1.5 },
    gradientFrom: "#060d1a",
    gradientTo: "#0d1a30",
    overlayOpacity: 0.92,
    category: "Elegante",
  },

  // ── Social Media (4) ─────────────────────────────────────────
  {
    id: "instagram",
    name: "Instagram",
    description: "Escuro com rosa-púrpura gradiente Instagram, vibe rede social",
    titleStyle: { color: "#e1306c", fontFamily: "Poppins", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a0a0f",
    gradientTo: "#12121a",
    overlayOpacity: 0.92,
    category: "Social Media",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Preto com ciano TikTok brilhante, jovem e dinâmico",
    titleStyle: { color: "#25f4ee", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 52, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#000000",
    gradientTo: "#0d0d0d",
    overlayOpacity: 0.95,
    category: "Social Media",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Escuro com vermelho YouTube icônico, tom de vídeo",
    titleStyle: { color: "#ff0000", fontFamily: "Oswald", fontWeight: "900", fontSize: 50, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0d0000",
    gradientTo: "#1a0505",
    overlayOpacity: 0.93,
    category: "Social Media",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Azul escuro LinkedIn profissional, tom corporativo",
    titleStyle: { color: "#0a66c2", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#ffffff", fontFamily: "Lato", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a1020",
    gradientTo: "#0d1530",
    overlayOpacity: 0.90,
    category: "Social Media",
  },

  // ── Bold (4) ─────────────────────────────────────────────────
  {
    id: "impact",
    name: "Impact",
    description: "Preto com branco massivo, verde neon no corpo, impacto máximo",
    titleStyle: { color: "#ffffff", fontFamily: "Oswald", fontWeight: "900", fontSize: 56, textShadow: true, textShadowIntensity: 8 },
    bodyStyle: { color: "#00ff88", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#000000",
    gradientTo: "#0a0a0a",
    overlayOpacity: 0.95,
    category: "Bold",
  },
  {
    id: "rebel",
    name: "Rebel",
    description: "Escuro com rosa choque rebelde, ousado e provocativo",
    titleStyle: { color: "#ff1493", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 52, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0d0508",
    gradientTo: "#1a0a10",
    overlayOpacity: 0.92,
    category: "Bold",
  },
  {
    id: "graffiti",
    name: "Graffiti",
    description: "Verde escuro com lima vibrante, estilo urbano",
    titleStyle: { color: "#bef264", fontFamily: "Space Grotesk", fontWeight: "900", fontSize: 50, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0a0d05",
    gradientTo: "#141a0a",
    overlayOpacity: 0.90,
    category: "Bold",
  },
  {
    id: "contrast",
    name: "Contrast",
    description: "Preto puro com amarelo vivo, contraste extremo",
    titleStyle: { color: "#facc15", fontFamily: "Oswald", fontWeight: "900", fontSize: 52, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#000000",
    gradientTo: "#080808",
    overlayOpacity: 0.95,
    category: "Bold",
  },

  // ── OFP (3) ──────────────────────────────────────────────────
  {
    id: "ofp-classic",
    name: "OFP Classic",
    description: "Tema oficial OFP, azul clássico sobre escuro, identidade da marca",
    titleStyle: { color: "#3377AF", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0A0A0F",
    gradientTo: "#12121A",
    overlayOpacity: 0.92,
    category: "OFP",
  },
  {
    id: "ofp-neon",
    name: "OFP Neon",
    description: "OFP verde neon vibrante, alto impacto, estilo tech",
    titleStyle: { color: "#83F714", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 7 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0A0A0F",
    gradientTo: "#0d1a0a",
    overlayOpacity: 0.93,
    category: "OFP",
  },
  {
    id: "ofp-gradient",
    name: "OFP Gradient",
    description: "OFP gradiente azul para verde, identidade visual completa",
    titleStyle: { color: "#3377AF", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#83F714", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 20, lineHeight: 1.5 },
    gradientFrom: "#0A0A0F",
    gradientTo: "#12121A",
    overlayOpacity: 0.92,
    category: "OFP",
  },
];

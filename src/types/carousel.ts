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

export type TemplateCategory = "Todos" | "Business" | "Criativo" | "Lifestyle" | "Tech" | "Editorial" | "Minimalista" | "Bold" | "Elegante" | "Social Media" | "Educacao";

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
  // ── Original 6 ──────────────────────────────────────────────
  {
    id: "clean",
    name: "Clean",
    description: "Fundo branco, texto preto, minimalista",
    titleStyle: { color: "#111827", fontFamily: "Inter", fontWeight: "bold", fontSize: 48 },
    bodyStyle: { color: "#374151", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#ffffff",
    gradientTo: "#f3f4f6",
    overlayOpacity: 0,
    category: "Minimalista",
  },
  {
    id: "dark-pro",
    name: "Dark Pro",
    description: "Fundo escuro, texto branco, accent azul",
    titleStyle: { color: "#3377AF", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0A0A0F",
    gradientTo: "#12121A",
    overlayOpacity: 0.75,
    category: "Tech",
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Fundo gradiente, texto branco com sombra",
    titleStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 8 },
    bodyStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20, textShadow: true, textShadowIntensity: 4 },
    gradientFrom: "#8b5cf6",
    gradientTo: "#ec4899",
    overlayOpacity: 0,
    category: "Criativo",
  },
  {
    id: "photo",
    name: "Photo",
    description: "Imagem de fundo com overlay escuro + texto",
    titleStyle: { color: "#ffffff", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 10 },
    bodyStyle: { color: "#e5e7eb", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#000000",
    gradientTo: "#1a1a2e",
    overlayOpacity: 0.8,
    category: "Editorial",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Fundo colorido solido, texto grande bold",
    titleStyle: { color: "#ffffff", fontFamily: "Oswald", fontWeight: "900", fontSize: 56 },
    bodyStyle: { color: "#ffffff", fontFamily: "Roboto", fontWeight: "normal", fontSize: 22 },
    gradientFrom: "#dc2626",
    gradientTo: "#dc2626",
    overlayOpacity: 0,
    category: "Bold",
  },
  {
    id: "explotek",
    name: "Explotek",
    description: "Cores Explotek, azul + verde neon",
    titleStyle: { color: "#83F714", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 48 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0A0A0F",
    gradientTo: "#12121A",
    overlayOpacity: 0.7,
    category: "Tech",
  },

  // ── Business (8) ────────────────────────────────────────────
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Navy blues, limpo e profissional",
    titleStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#cbd5e1", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0f172a",
    gradientTo: "#1e3a5f",
    overlayOpacity: 0.6,
    category: "Business",
  },
  {
    id: "startup-pitch",
    name: "Startup Pitch",
    description: "Cores ousadas, fontes modernas",
    titleStyle: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50 },
    bodyStyle: { color: "#f0abfc", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#7c3aed",
    gradientTo: "#2563eb",
    overlayOpacity: 0,
    category: "Business",
  },
  {
    id: "finance-pro",
    name: "Finance Pro",
    description: "Fundo escuro, acentos dourados",
    titleStyle: { color: "#fbbf24", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#d4d4d8", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#0c0a09",
    gradientTo: "#1c1917",
    overlayOpacity: 0.7,
    category: "Business",
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Cinza minimalista, headers serif",
    titleStyle: { color: "#1f2937", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#4b5563", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f9fafb",
    gradientTo: "#e5e7eb",
    overlayOpacity: 0,
    category: "Business",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Tons terrosos, elegante e acolhedor",
    titleStyle: { color: "#ffffff", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#fde68a", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#78350f",
    gradientTo: "#451a03",
    overlayOpacity: 0.5,
    category: "Business",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Verdes e azuis calmantes",
    titleStyle: { color: "#065f46", fontFamily: "Poppins", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#374151", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#ecfdf5",
    gradientTo: "#d1fae5",
    overlayOpacity: 0,
    category: "Business",
  },
  {
    id: "legal",
    name: "Legal",
    description: "Navy tradicional, serif classico",
    titleStyle: { color: "#e2e8f0", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#94a3b8", fontFamily: "Lato", fontWeight: "normal", fontSize: 18 },
    gradientFrom: "#0f172a",
    gradientTo: "#020617",
    overlayOpacity: 0.65,
    category: "Business",
  },
  {
    id: "marketing-agency",
    name: "Marketing Agency",
    description: "Gradientes vibrantes, fontes display",
    titleStyle: { color: "#ffffff", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 54 },
    bodyStyle: { color: "#fce7f3", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#e11d48",
    gradientTo: "#9333ea",
    overlayOpacity: 0,
    category: "Business",
  },

  // ── Criativo (8) ────────────────────────────────────────────
  {
    id: "neon-glow",
    name: "Neon Glow",
    description: "Fundo escuro com neon pink/cyan",
    titleStyle: { color: "#f0abfc", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 48, textShadow: true, textShadowIntensity: 12 },
    bodyStyle: { color: "#67e8f9", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0a0a0a",
    gradientTo: "#150520",
    overlayOpacity: 0.8,
    category: "Criativo",
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    description: "Anos 80 purple/orange/teal",
    titleStyle: { color: "#fde047", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 52 },
    bodyStyle: { color: "#c4b5fd", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#4c1d95",
    gradientTo: "#0f766e",
    overlayOpacity: 0,
    category: "Criativo",
  },
  {
    id: "pop-art",
    name: "Pop Art",
    description: "Cores primarias ousadas, estilo comics",
    titleStyle: { color: "#000000", fontFamily: "Oswald", fontWeight: "900", fontSize: 52 },
    bodyStyle: { color: "#1e3a5f", fontFamily: "Roboto", fontWeight: "bold", fontSize: 20 },
    gradientFrom: "#facc15",
    gradientTo: "#fbbf24",
    overlayOpacity: 0,
    category: "Criativo",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Pasteis suaves, fontes delicadas",
    titleStyle: { color: "#6d28d9", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#7c3aed", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fdf2f8",
    gradientTo: "#ede9fe",
    overlayOpacity: 0,
    category: "Criativo",
  },
  {
    id: "street-art",
    name: "Street Art",
    description: "Raw, alto contraste, urbano",
    titleStyle: { color: "#ef4444", fontFamily: "Oswald", fontWeight: "900", fontSize: 54 },
    bodyStyle: { color: "#d4d4d4", fontFamily: "Roboto", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#171717",
    gradientTo: "#0a0a0a",
    overlayOpacity: 0.85,
    category: "Criativo",
  },
  {
    id: "abstract",
    name: "Abstract",
    description: "Gradientes geometricos, moderno",
    titleStyle: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#e0f2fe", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0891b2",
    gradientTo: "#6d28d9",
    overlayOpacity: 0,
    category: "Criativo",
  },
  {
    id: "collage",
    name: "Collage",
    description: "Texturas mistas, sensacao artesanal",
    titleStyle: { color: "#1c1917", fontFamily: "Raleway", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#44403c", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fef3c7",
    gradientTo: "#fed7aa",
    overlayOpacity: 0,
    category: "Criativo",
  },
  {
    id: "art-deco",
    name: "Art Deco",
    description: "Ouro/preto, padroes geometricos",
    titleStyle: { color: "#fbbf24", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 52 },
    bodyStyle: { color: "#d4a017", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#0a0a0a",
    gradientTo: "#1a1a1a",
    overlayOpacity: 0.7,
    category: "Criativo",
  },

  // ── Lifestyle (7) ──────────────────────────────────────────
  {
    id: "travel-boho",
    name: "Travel Boho",
    description: "Terra quente, sensacao handwritten",
    titleStyle: { color: "#ffffff", fontFamily: "Raleway", fontWeight: "bold", fontSize: 44, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#fef3c7", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#92400e",
    gradientTo: "#78350f",
    overlayOpacity: 0.4,
    category: "Lifestyle",
  },
  {
    id: "foodie",
    name: "Foodie",
    description: "Laranjas e vermelhos quentes",
    titleStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 8 },
    bodyStyle: { color: "#fef3c7", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#c2410c",
    gradientTo: "#b91c1c",
    overlayOpacity: 0.3,
    category: "Lifestyle",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Alta energia, fundo escuro, neon accent",
    titleStyle: { color: "#22d3ee", fontFamily: "Oswald", fontWeight: "900", fontSize: 50 },
    bodyStyle: { color: "#e5e7eb", fontFamily: "Roboto", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0f0f0f",
    gradientTo: "#1a1a2e",
    overlayOpacity: 0.8,
    category: "Lifestyle",
  },
  {
    id: "wellness",
    name: "Wellness",
    description: "Sage suave e creme, calmante",
    titleStyle: { color: "#365314", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#4d7c0f", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f7fee7",
    gradientTo: "#ecfccb",
    overlayOpacity: 0,
    category: "Lifestyle",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "P&B com accent colorido",
    titleStyle: { color: "#e11d48", fontFamily: "Montserrat", fontWeight: "900", fontSize: 48 },
    bodyStyle: { color: "#525252", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fafafa",
    gradientTo: "#e5e5e5",
    overlayOpacity: 0,
    category: "Lifestyle",
  },
  {
    id: "home-decor",
    name: "Home Decor",
    description: "Tons naturais, serif elegante",
    titleStyle: { color: "#44403c", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#78716c", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#faf5f0",
    gradientTo: "#f5ebe0",
    overlayOpacity: 0,
    category: "Lifestyle",
  },
  {
    id: "pet-lovers",
    name: "Pet Lovers",
    description: "Cores divertidas, arredondado",
    titleStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#fce7f3", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f472b6",
    gradientTo: "#a78bfa",
    overlayOpacity: 0,
    category: "Lifestyle",
  },

  // ── Tech (7) ────────────────────────────────────────────────
  {
    id: "cyber-dark",
    name: "Cyber Dark",
    description: "Matrix green on black",
    titleStyle: { color: "#22c55e", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#4ade80", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#020202",
    gradientTo: "#0a1a0a",
    overlayOpacity: 0.85,
    category: "Tech",
  },
  {
    id: "ai-ml",
    name: "AI / ML",
    description: "Gradiente purple/blue, futurista",
    titleStyle: { color: "#ffffff", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#c4b5fd", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#581c87",
    gradientTo: "#1e3a8a",
    overlayOpacity: 0,
    category: "Tech",
  },
  {
    id: "saas-clean",
    name: "SaaS Clean",
    description: "Claro/escuro com accent azul",
    titleStyle: { color: "#1e40af", fontFamily: "Inter", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#475569", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f8fafc",
    gradientTo: "#e0f2fe",
    overlayOpacity: 0,
    category: "Tech",
  },
  {
    id: "devops",
    name: "DevOps",
    description: "Estilo terminal escuro, mono font",
    titleStyle: { color: "#a3e635", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#86efac", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 18 },
    gradientFrom: "#0c0c0c",
    gradientTo: "#18181b",
    overlayOpacity: 0.9,
    category: "Tech",
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Gradiente ousado, moderno",
    titleStyle: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50 },
    bodyStyle: { color: "#e0e7ff", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#4f46e5",
    gradientTo: "#0ea5e9",
    overlayOpacity: 0,
    category: "Tech",
  },
  {
    id: "data-viz",
    name: "Data Viz",
    description: "Fundo escuro, cores de grafico",
    titleStyle: { color: "#38bdf8", fontFamily: "Inter", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#94a3b8", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#0f172a",
    gradientTo: "#020617",
    overlayOpacity: 0.75,
    category: "Tech",
  },
  {
    id: "web3",
    name: "Web3",
    description: "Gradiente purple/cyan, geometrico",
    titleStyle: { color: "#22d3ee", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#a78bfa", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#2e1065",
    gradientTo: "#042f2e",
    overlayOpacity: 0,
    category: "Tech",
  },

  // ── Editorial (6) ──────────────────────────────────────────
  {
    id: "magazine",
    name: "Magazine",
    description: "Serif grande, espacamento editorial",
    titleStyle: { color: "#0f172a", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 50 },
    bodyStyle: { color: "#334155", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fffbeb",
    gradientTo: "#fef3c7",
    overlayOpacity: 0,
    category: "Editorial",
  },
  {
    id: "newspaper",
    name: "Newspaper",
    description: "Classico newsprint, sensacao retro",
    titleStyle: { color: "#1c1917", fontFamily: "Playfair Display", fontWeight: "900", fontSize: 48 },
    bodyStyle: { color: "#44403c", fontFamily: "Roboto", fontWeight: "normal", fontSize: 18 },
    gradientFrom: "#faf9f6",
    gradientTo: "#f5f0e8",
    overlayOpacity: 0,
    category: "Editorial",
  },
  {
    id: "blog-post",
    name: "Blog Post",
    description: "Limpo, legivel, minimalista",
    titleStyle: { color: "#18181b", fontFamily: "Raleway", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#52525b", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#ffffff",
    gradientTo: "#fafafa",
    overlayOpacity: 0,
    category: "Editorial",
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Profissional, estruturado",
    titleStyle: { color: "#1e40af", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#374151", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#eff6ff",
    gradientTo: "#dbeafe",
    overlayOpacity: 0,
    category: "Editorial",
  },
  {
    id: "book-cover",
    name: "Book Cover",
    description: "Bold, centralizado, dramatico",
    titleStyle: { color: "#ffffff", fontFamily: "Playfair Display", fontWeight: "900", fontSize: 52, textShadow: true, textShadowIntensity: 10 },
    bodyStyle: { color: "#d4d4d8", fontFamily: "Raleway", fontWeight: "normal", fontSize: 18 },
    gradientFrom: "#1e1b4b",
    gradientTo: "#0f0a2e",
    overlayOpacity: 0.7,
    category: "Editorial",
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Escuro, sensacao audio-wave",
    titleStyle: { color: "#f97316", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#a1a1aa", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#18181b",
    gradientTo: "#09090b",
    overlayOpacity: 0.8,
    category: "Editorial",
  },

  // ── Minimalista (6) ────────────────────────────────────────
  {
    id: "swiss-design",
    name: "Swiss Design",
    description: "Grid-based, sensacao Helvetica",
    titleStyle: { color: "#0f172a", fontFamily: "Inter", fontWeight: "900", fontSize: 48 },
    bodyStyle: { color: "#64748b", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#ffffff",
    gradientTo: "#ffffff",
    overlayOpacity: 0,
    category: "Minimalista",
  },
  {
    id: "japanese-zen",
    name: "Japanese Zen",
    description: "Muito espaco, tons suaves",
    titleStyle: { color: "#44403c", fontFamily: "Raleway", fontWeight: "bold", fontSize: 40 },
    bodyStyle: { color: "#78716c", fontFamily: "Lato", fontWeight: "normal", fontSize: 18 },
    gradientFrom: "#fafaf9",
    gradientTo: "#f5f5f4",
    overlayOpacity: 0,
    category: "Minimalista",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Claro, limpo, funcional",
    titleStyle: { color: "#1c1917", fontFamily: "Poppins", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#57534e", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fef7ed",
    gradientTo: "#fff7ed",
    overlayOpacity: 0,
    category: "Minimalista",
  },
  {
    id: "mono-chrome",
    name: "Mono Chrome",
    description: "Puro P&B, tipografia forte",
    titleStyle: { color: "#000000", fontFamily: "Oswald", fontWeight: "900", fontSize: 50 },
    bodyStyle: { color: "#404040", fontFamily: "Roboto", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#ffffff",
    gradientTo: "#f0f0f0",
    overlayOpacity: 0,
    category: "Minimalista",
  },
  {
    id: "line-art",
    name: "Line Art",
    description: "Linhas finas, cor minima",
    titleStyle: { color: "#374151", fontFamily: "Raleway", fontWeight: "bold", fontSize: 40 },
    bodyStyle: { color: "#6b7280", fontFamily: "Lato", fontWeight: "normal", fontSize: 18 },
    gradientFrom: "#fafafa",
    gradientTo: "#f4f4f5",
    overlayOpacity: 0,
    category: "Minimalista",
  },
  {
    id: "dot-grid",
    name: "Dot Grid",
    description: "Grid sutil, preciso",
    titleStyle: { color: "#1e293b", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#475569", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f1f5f9",
    gradientTo: "#e2e8f0",
    overlayOpacity: 0,
    category: "Minimalista",
  },

  // ── Bold (6) ────────────────────────────────────────────────
  {
    id: "impact",
    name: "Impact",
    description: "Texto enorme, fundo vibrante",
    titleStyle: { color: "#000000", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 60 },
    bodyStyle: { color: "#1e1e1e", fontFamily: "Roboto", fontWeight: "bold", fontSize: 22 },
    gradientFrom: "#fde047",
    gradientTo: "#facc15",
    overlayOpacity: 0,
    category: "Bold",
  },
  {
    id: "brutalist",
    name: "Brutalist",
    description: "Raw, ugly-beautiful",
    titleStyle: { color: "#ffffff", fontFamily: "Oswald", fontWeight: "900", fontSize: 56 },
    bodyStyle: { color: "#e5e5e5", fontFamily: "Space Grotesk", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#18181b",
    gradientTo: "#27272a",
    overlayOpacity: 0,
    category: "Bold",
  },
  {
    id: "punk",
    name: "Punk",
    description: "Recortado, alto contraste, anarquico",
    titleStyle: { color: "#fde047", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 56 },
    bodyStyle: { color: "#f87171", fontFamily: "Oswald", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0a0a0a",
    gradientTo: "#1a0a0a",
    overlayOpacity: 0.9,
    category: "Bold",
  },
  {
    id: "carnival",
    name: "Carnival",
    description: "Multi-cor vibrante",
    titleStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "900", fontSize: 50 },
    bodyStyle: { color: "#fef9c3", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#c026d3",
    gradientTo: "#ea580c",
    overlayOpacity: 0,
    category: "Bold",
  },
  {
    id: "graffiti",
    name: "Graffiti",
    description: "Urbano, sensacao spray-paint",
    titleStyle: { color: "#a3e635", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 54 },
    bodyStyle: { color: "#d4d4d4", fontFamily: "Roboto", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#1c1917",
    gradientTo: "#0c0a09",
    overlayOpacity: 0.85,
    category: "Bold",
  },
  {
    id: "revolution",
    name: "Revolution",
    description: "Red/black, estilo propaganda",
    titleStyle: { color: "#fef2f2", fontFamily: "Oswald", fontWeight: "900", fontSize: 54 },
    bodyStyle: { color: "#fca5a5", fontFamily: "Roboto", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#991b1b",
    gradientTo: "#450a0a",
    overlayOpacity: 0.6,
    category: "Bold",
  },

  // ── Elegante (5) ────────────────────────────────────────────
  {
    id: "champagne",
    name: "Champagne",
    description: "Ouro/creme, fontes script",
    titleStyle: { color: "#92400e", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#78716c", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fffbeb",
    gradientTo: "#fef3c7",
    overlayOpacity: 0,
    category: "Elegante",
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    description: "Navy profundo, accent dourado",
    titleStyle: { color: "#fbbf24", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46, textShadow: true, textShadowIntensity: 6 },
    bodyStyle: { color: "#cbd5e1", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#0c1426",
    gradientTo: "#020617",
    overlayOpacity: 0.7,
    category: "Elegante",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    description: "Blush/rose gold metalico",
    titleStyle: { color: "#9f1239", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#be185d", fontFamily: "Raleway", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fff1f2",
    gradientTo: "#fce7f3",
    overlayOpacity: 0,
    category: "Elegante",
  },
  {
    id: "marble",
    name: "Marble",
    description: "Textura marmore branco",
    titleStyle: { color: "#1c1917", fontFamily: "Playfair Display", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#57534e", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f5f5f4",
    gradientTo: "#e7e5e4",
    overlayOpacity: 0,
    category: "Elegante",
  },
  {
    id: "silk",
    name: "Silk",
    description: "Gradiente suave, fluido",
    titleStyle: { color: "#ffffff", fontFamily: "Raleway", fontWeight: "bold", fontSize: 44, textShadow: true, textShadowIntensity: 5 },
    bodyStyle: { color: "#e9d5ff", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#7e22ce",
    gradientTo: "#be185d",
    overlayOpacity: 0,
    category: "Elegante",
  },

  // ── Social Media (5) ───────────────────────────────────────
  {
    id: "instagram-native",
    name: "Instagram Native",
    description: "Branco limpo, moderno",
    titleStyle: { color: "#262626", fontFamily: "Poppins", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#737373", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#ffffff",
    gradientTo: "#fafafa",
    overlayOpacity: 0,
    category: "Social Media",
  },
  {
    id: "tiktok-energy",
    name: "TikTok Energy",
    description: "Alto contraste, trendy",
    titleStyle: { color: "#25f4ee", fontFamily: "Montserrat", fontWeight: "900", fontSize: 50 },
    bodyStyle: { color: "#fe2c55", fontFamily: "Poppins", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#000000",
    gradientTo: "#161616",
    overlayOpacity: 0.85,
    category: "Social Media",
  },
  {
    id: "linkedin-pro",
    name: "LinkedIn Pro",
    description: "Azul profissional, limpo",
    titleStyle: { color: "#0a66c2", fontFamily: "Inter", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#333333", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f3f6f8",
    gradientTo: "#e8ecf0",
    overlayOpacity: 0,
    category: "Social Media",
  },
  {
    id: "twitter-thread",
    name: "Twitter Thread",
    description: "Minimalista, foco no texto",
    titleStyle: { color: "#0f1419", fontFamily: "Inter", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#536471", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#ffffff",
    gradientTo: "#f7f9f9",
    overlayOpacity: 0,
    category: "Social Media",
  },
  {
    id: "youtube-thumb",
    name: "YouTube Thumb",
    description: "Bold, chama atencao",
    titleStyle: { color: "#ffffff", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 58, textShadow: true, textShadowIntensity: 12 },
    bodyStyle: { color: "#fef08a", fontFamily: "Oswald", fontWeight: "bold", fontSize: 22 },
    gradientFrom: "#dc2626",
    gradientTo: "#7f1d1d",
    overlayOpacity: 0.5,
    category: "Social Media",
  },

  // ── Educacao (6) ───────────────────────────────────────────
  {
    id: "classroom",
    name: "Classroom",
    description: "Quadro verde, giz branco",
    titleStyle: { color: "#ffffff", fontFamily: "Raleway", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#d1fae5", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#14532d",
    gradientTo: "#052e16",
    overlayOpacity: 0.6,
    category: "Educacao",
  },
  {
    id: "study-notes",
    name: "Study Notes",
    description: "Papel amarelo, caneta azul",
    titleStyle: { color: "#1e3a8a", fontFamily: "Poppins", fontWeight: "bold", fontSize: 42 },
    bodyStyle: { color: "#1e40af", fontFamily: "Lato", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#fefce8",
    gradientTo: "#fef9c3",
    overlayOpacity: 0,
    category: "Educacao",
  },
  {
    id: "science",
    name: "Science",
    description: "Azul escuro, acentos neon",
    titleStyle: { color: "#67e8f9", fontFamily: "Space Grotesk", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#a5b4fc", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#0f172a",
    gradientTo: "#1e1b4b",
    overlayOpacity: 0.7,
    category: "Educacao",
  },
  {
    id: "kids-fun",
    name: "Kids Fun",
    description: "Cores alegres, fontes divertidas",
    titleStyle: { color: "#ffffff", fontFamily: "Poppins", fontWeight: "900", fontSize: 48 },
    bodyStyle: { color: "#fef3c7", fontFamily: "Open Sans", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#2563eb",
    gradientTo: "#7c3aed",
    overlayOpacity: 0,
    category: "Educacao",
  },
  {
    id: "tutorial",
    name: "Tutorial",
    description: "Limpo, passo a passo",
    titleStyle: { color: "#059669", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 44 },
    bodyStyle: { color: "#374151", fontFamily: "Inter", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#f0fdf4",
    gradientTo: "#dcfce7",
    overlayOpacity: 0,
    category: "Educacao",
  },
  {
    id: "infographic",
    name: "Infographic",
    description: "Colorido, dados visuais",
    titleStyle: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 46 },
    bodyStyle: { color: "#bae6fd", fontFamily: "Poppins", fontWeight: "normal", fontSize: 19 },
    gradientFrom: "#0369a1",
    gradientTo: "#0c4a6e",
    overlayOpacity: 0.5,
    category: "Educacao",
  },
];

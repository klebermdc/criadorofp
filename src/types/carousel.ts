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

export type SlideElement =
  | { kind: "title"; id: string; label: string }
  | { kind: "body"; id: string; label: string }
  | { kind: "textbox"; id: string; label: string; data: TextBoxItem }
  | { kind: "sticker"; id: string; label: string; data: StickerItem }
  | { kind: "shape"; id: string; label: string; data: ShapeItem };

export interface CarouselSlide {
  type: "cover" | "content" | "cta";
  title: string;
  body?: string;
  emoji?: string;
  number?: number;
  backgroundImage?: string;
  titleStyle?: TextStyle;
  bodyStyle?: TextStyle;
  stickers?: StickerItem[];
  overlayOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  textBoxes?: TextBoxItem[];
  shapes?: ShapeItem[];
  backgroundColor?: string;
}

export interface CarouselData {
  id?: string;
  topic: string;
  style: string;
  slides: CarouselSlide[];
  created_at?: string;
}

export const STYLES = [
  "Educativo",
  "Dicas",
  "Comparativo",
  "Passo a passo",
  "Curiosidades",
] as const;

export type CarouselStyle = (typeof STYLES)[number];

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
  { from: "#E63946", to: "#0B1426", label: "OFP" },
];

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
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: "clean",
    name: "Clean",
    description: "Fundo branco, texto preto, minimalista",
    titleStyle: { color: "#111827", fontFamily: "Inter", fontWeight: "bold", fontSize: 48 },
    bodyStyle: { color: "#374151", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#ffffff",
    gradientTo: "#f3f4f6",
    overlayOpacity: 0,
  },
  {
    id: "dark-pro",
    name: "Dark Pro",
    description: "Fundo navy, texto branco, barra vermelha",
    titleStyle: { color: "#e94560", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0B1426",
    gradientTo: "#1a1a2e",
    overlayOpacity: 0.75,
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
  },
  {
    id: "bold",
    name: "Bold",
    description: "Fundo colorido sólido, texto grande bold",
    titleStyle: { color: "#ffffff", fontFamily: "Oswald", fontWeight: "900", fontSize: 56 },
    bodyStyle: { color: "#ffffff", fontFamily: "Roboto", fontWeight: "normal", fontSize: 22 },
    gradientFrom: "#dc2626",
    gradientTo: "#dc2626",
    overlayOpacity: 0,
  },
  {
    id: "ofp-brand",
    name: "OFP Brand",
    description: "Cores da marca, estilo institucional",
    titleStyle: { color: "#e94560", fontFamily: "Montserrat", fontWeight: "bold", fontSize: 48 },
    bodyStyle: { color: "#ffffff", fontFamily: "Inter", fontWeight: "normal", fontSize: 20 },
    gradientFrom: "#0B1426",
    gradientTo: "#1a2744",
    overlayOpacity: 0.7,
  },
];

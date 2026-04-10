export interface TextStyle {
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  color?: string;
  opacity?: number;
}

export interface StickerItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

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

export const STICKER_CATEGORIES = {
  "Viagem": ["✈️", "🗺️", "🧳", "🏖️", "🌴", "🏰", "🎢", "🎡", "🎠", "🗽"],
  "Disney": ["🏰", "🎢", "🎡", "🎆", "🎇", "⭐", "✨", "🌟", "💫", "🎪"],
  "Comida": ["🍕", "🍔", "🌮", "🍦", "🍩", "☕", "🍹", "🥤", "🍿", "🎂"],
  "Reações": ["🔥", "💯", "❤️", "👏", "🙌", "💪", "🎯", "💡", "⚡", "🚀"],
  "Setas": ["👉", "👆", "👇", "➡️", "⬆️", "⬇️", "↗️", "📌", "🔗", "📍"],
  "Símbolos": ["⭕", "❌", "✅", "⚠️", "💬", "🏷️", "📢", "🔔", "💎", "🎁"],
};

export const GRADIENT_PRESETS = [
  { from: "#1a1a2e", to: "#16213e", label: "Azul Escuro" },
  { from: "#0f0c29", to: "#302b63", label: "Roxo" },
  { from: "#232526", to: "#414345", label: "Cinza" },
  { from: "#1f1c2c", to: "#928dab", label: "Lavanda" },
  { from: "#0f2027", to: "#2c5364", label: "Oceano" },
  { from: "#200122", to: "#6f0000", label: "Vermelho" },
  { from: "#141e30", to: "#243b55", label: "Meia-noite" },
  { from: "#000000", to: "#434343", label: "Preto" },
];

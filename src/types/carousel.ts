export interface TextStyle {
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
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

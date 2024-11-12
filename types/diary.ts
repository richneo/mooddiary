import type { EmotionType } from "@/lib/openai";

export interface DiaryEntry {
  id: string;
  content: string;
  emotion?: EmotionType;
  isAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
} 
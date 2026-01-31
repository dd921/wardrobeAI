import type { LABColor } from './colorSpace';

export interface DominantColor {
  rgb: [number, number, number];
  hex: string;
  colorName: string;
  lab?: LABColor;
}

import type { ClothingCategory } from './categoryMapping';

export interface AnalyzedImage {
  id: string;
  file: File;
  previewUrl: string;
  pHash: string;
  dominantColors: DominantColor[];
  detectedCategory?: ClothingCategory;
  categoryConfidence?: number;
  /** Feature embedding from MobileNet for visual similarity */
  embedding?: Float32Array;
  /** Compressed embedding as base64 for storage */
  embeddingBase64?: string;
}

export interface ImageGroup {
  id: string;
  images: AnalyzedImage[];
  suggestedName: string;
  suggestedColor: string;
  confidence: number;
  detectedCategory?: ClothingCategory;
  categoryConfidence?: number;
}

export interface AnalysisProgress {
  current: number;
  total: number;
  stage: 'hashing' | 'colors' | 'classifying' | 'grouping' | 'complete';
  message: string;
}

export type GroupingSensitivity = 'strict' | 'balanced' | 'loose';

export const SENSITIVITY_THRESHOLDS: Record<GroupingSensitivity, number> = {
  strict: 5,    // Very similar only (~92% similarity)
  balanced: 8,  // Moderately similar (~87% similarity)
  loose: 12,    // More lenient (~81% similarity)
};

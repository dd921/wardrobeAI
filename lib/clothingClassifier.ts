import type { MobileNet } from '@tensorflow-models/mobilenet';
import { getBestCategory, type ClothingCategory } from './imageSimilarity/categoryMapping';

let modelPromise: Promise<MobileNet> | null = null;
let model: MobileNet | null = null;

/**
 * Lazily load the MobileNet model
 * Only loads when first called, then caches for session
 */
export async function getClassifier(): Promise<MobileNet> {
  if (model) {
    return model;
  }

  if (!modelPromise) {
    modelPromise = loadModel();
  }

  model = await modelPromise;
  return model;
}

async function loadModel(): Promise<MobileNet> {
  // Dynamic imports to enable code splitting
  const tf = await import('@tensorflow/tfjs');
  const mobilenet = await import('@tensorflow-models/mobilenet');

  // Use smaller model (alpha 0.75) for faster loading
  const loadedModel = await mobilenet.load({
    version: 2,
    alpha: 0.75,
  });

  return loadedModel;
}

/**
 * Check if the model is already loaded
 */
export function isModelLoaded(): boolean {
  return model !== null;
}

/**
 * Classify an image and return clothing category
 */
export async function classifyImage(
  imageElement: HTMLImageElement
): Promise<{ category: ClothingCategory; confidence: number; rawPredictions: Array<{ className: string; probability: number }> }> {
  const classifier = await getClassifier();

  // Get top 5 predictions
  const predictions = await classifier.classify(imageElement, 5);

  // Map predictions to clothing category
  const { category, confidence } = getBestCategory(predictions);

  return {
    category,
    confidence,
    rawPredictions: predictions,
  };
}

/**
 * Classify multiple images in batch
 * Returns results in the same order as input
 */
export async function classifyImages(
  imageElements: HTMLImageElement[],
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ category: ClothingCategory; confidence: number }>> {
  const results: Array<{ category: ClothingCategory; confidence: number }> = [];

  // Process in batches of 3 to prevent UI freezing
  const BATCH_SIZE = 3;

  for (let i = 0; i < imageElements.length; i += BATCH_SIZE) {
    const batch = imageElements.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (img) => {
        try {
          const result = await classifyImage(img);
          return { category: result.category, confidence: result.confidence };
        } catch (error) {
          console.error('Error classifying image:', error);
          return { category: 'Other' as ClothingCategory, confidence: 0 };
        }
      })
    );

    results.push(...batchResults);

    // Report progress
    onProgress?.(Math.min(i + BATCH_SIZE, imageElements.length), imageElements.length);
  }

  return results;
}

/**
 * Create an HTMLImageElement from a File
 */
export function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Preload the model (call this early to reduce wait time later)
 */
export function preloadModel(): void {
  if (!modelPromise && !model) {
    modelPromise = loadModel().catch((error) => {
      console.error('Failed to preload model:', error);
      modelPromise = null;
      throw error;
    });
  }
}

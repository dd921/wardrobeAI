// Types
export type {
  DominantColor,
  AnalyzedImage,
  ImageGroup,
  AnalysisProgress,
  GroupingSensitivity
} from './types';

export { SENSITIVITY_THRESHOLDS } from './types';

// Category mapping
export type { ClothingCategory } from './categoryMapping';

// Perceptual hashing
export {
  computePerceptualHash,
  hammingDistance,
  areSimilar,
  similarityPercentage
} from './perceptualHash';

// Color extraction
export {
  COLOR_MAP,
  extractDominantColors,
  rgbToColorName,
  rgbToHex,
  getMostCommonColorName
} from './colorExtraction';

// Color space utilities
export {
  rgbToLab,
  colorDistanceLab,
  areColorsSimilar,
  deltaE2000,
  deltaE76
} from './colorSpace';
export type { LABColor } from './colorSpace';

// Grouping
export {
  groupImagesBySimilarity,
  mergeGroups,
  splitGroup,
  moveImageBetweenGroups,
  createSingleImageGroup
} from './grouping';

// Union-Find (for advanced use cases)
export { UnionFind } from './unionFind';

// Feature embeddings
export {
  extractEmbedding,
  extractEmbeddingsBatch,
  cosineSimilarity,
  euclideanDistance,
  areEmbeddingsSimilar,
  embeddingToBase64,
  base64ToEmbedding,
  EMBEDDING_SIZE,
} from './featureEmbedding';

import { generateId } from '@/lib/utils';
import { computePerceptualHash } from './perceptualHash';
import { extractDominantColors } from './colorExtraction';
import { groupImagesBySimilarity } from './grouping';
import { extractEmbedding } from './featureEmbedding';
import { classifyImages, createImageElement } from '@/lib/clothingClassifier';
import type { AnalyzedImage, ImageGroup, AnalysisProgress, DominantColor } from './types';
import { SENSITIVITY_THRESHOLDS } from './types';

const BATCH_SIZE = 10; // Increased from 5 for better parallelism
const MAX_IMAGES_WARNING = 50;
const DEFAULT_THRESHOLD = SENSITIVITY_THRESHOLDS.strict;

export interface AnalyzeImagesOptions {
  threshold?: number;
  skipClassification?: boolean;
  /** Extract feature embeddings for better similarity matching (default: true) */
  extractEmbeddings?: boolean;
}

/**
 * Process a single image: compute hash and extract colors
 * Returns the analysis result or null if completely failed
 */
async function processImage(
  file: File,
  index: number
): Promise<{
  pHash: string;
  dominantColors: DominantColor[];
} | null> {
  let pHash = '0000000000000000';
  let dominantColors: DominantColor[] = [
    { rgb: [128, 128, 128], hex: '#808080', colorName: 'gray' }
  ];

  // Try to compute hash
  try {
    pHash = await computePerceptualHash(file);
  } catch (error) {
    console.error(`[processImage] Hash failed for image ${index + 1}:`, error);
  }

  // Try to extract colors
  try {
    dominantColors = await extractDominantColors(file, 5);
  } catch (error) {
    console.error(`[processImage] Color extraction failed for image ${index + 1}:`, error);
  }

  return { pHash, dominantColors };
}

/**
 * Process images in parallel batches for better performance
 */
async function processImageBatch(
  files: File[],
  startIndex: number,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<Map<number, { pHash: string; dominantColors: DominantColor[] }>> {
  const results = new Map<number, { pHash: string; dominantColors: DominantColor[] }>();

  // Process all files in the batch in parallel
  const promises = files.map(async (file, batchIndex) => {
    const globalIndex = startIndex + batchIndex;
    const result = await processImage(file, globalIndex);
    if (result) {
      results.set(globalIndex, result);
    }
    return { index: globalIndex, result };
  });

  await Promise.all(promises);
  return results;
}

/**
 * Analyze a batch of images: compute hashes, extract colors, classify, and group by similarity
 * Returns progress updates via callback for UI feedback
 */
export async function analyzeImages(
  files: File[],
  onProgress?: (progress: AnalysisProgress) => void,
  options: AnalyzeImagesOptions = {}
): Promise<{ analyzedImages: AnalyzedImage[]; groups: ImageGroup[] }> {
  const { threshold = DEFAULT_THRESHOLD, skipClassification = false, extractEmbeddings = true } = options;
  const total = files.length;
  const analyzedImages: AnalyzedImage[] = [];

  
  // Initialize analyzed images array with placeholders
  const imageData: Array<{
    file: File;
    previewUrl: string;
    pHash?: string;
    dominantColors?: DominantColor[];
  }> = files.map(file => ({
    file,
    previewUrl: URL.createObjectURL(file),
  }));

  // Process images in parallel batches
  for (let batchStart = 0; batchStart < files.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, files.length);
    const batchFiles = files.slice(batchStart, batchEnd);

    onProgress?.({
      current: batchStart + 1,
      total,
      stage: 'hashing',
      message: `Processing images ${batchStart + 1}-${batchEnd} of ${total}...`
    });

    // Process batch in parallel
    const batchResults = await processImageBatch(batchFiles, batchStart, onProgress);

    // Apply results to image data
    const batchEntries = Array.from(batchResults.entries());
    for (const [index, result] of batchEntries) {
      imageData[index].pHash = result.pHash;
      imageData[index].dominantColors = result.dominantColors;
    }

    onProgress?.({
      current: batchEnd,
      total,
      stage: 'colors',
      message: `Extracted colors from ${batchEnd} of ${total} images...`
    });
  }

  // Build analyzed images array
  for (let i = 0; i < imageData.length; i++) {
    const data = imageData[i];
    analyzedImages.push({
      id: generateId(),
      file: data.file,
      previewUrl: data.previewUrl,
      pHash: data.pHash || '0000000000000000',
      dominantColors: data.dominantColors || [
        { rgb: [128, 128, 128], hex: '#808080', colorName: 'gray' }
      ]
    });
  }

  
  // Classification and embedding extraction
  // We create image elements once and reuse them for both operations
  const needsImageElements = !skipClassification || extractEmbeddings;

  if (needsImageElements) {
    onProgress?.({
      current: 0,
      total,
      stage: 'classifying',
      message: 'Loading models...'
    });

    try {
      // Create image elements in parallel batches
      const imageElements: (HTMLImageElement | null)[] = new Array(analyzedImages.length).fill(null);

      for (let batchStart = 0; batchStart < analyzedImages.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, analyzedImages.length);

        onProgress?.({
          current: batchStart + 1,
          total,
          stage: 'classifying',
          message: `Preparing images ${batchStart + 1}-${batchEnd}...`
        });

        // Create image elements in parallel
        const batchPromises = analyzedImages
          .slice(batchStart, batchEnd)
          .map(async (img, batchIndex) => {
            const globalIndex = batchStart + batchIndex;
            try {
              const imgElement = await createImageElement(img.file);
              imageElements[globalIndex] = imgElement;
            } catch {
              imageElements[globalIndex] = null;
            }
          });

        await Promise.all(batchPromises);
      }

      // Filter out null elements
      const validElements = imageElements.filter((img): img is HTMLImageElement => img !== null);
      const validIndices = imageElements
        .map((img, idx) => img !== null ? idx : -1)
        .filter(idx => idx !== -1);

      // Classify images (if enabled)
      if (!skipClassification) {
        const classificationResults = await classifyImages(
          validElements,
          (current, classifyTotal) => {
            onProgress?.({
              current,
              total: classifyTotal,
              stage: 'classifying',
              message: `Classifying image ${current} of ${classifyTotal}...`
            });
          }
        );

        // Apply classification results
        for (let i = 0; i < classificationResults.length; i++) {
          const result = classificationResults[i];
          const originalIndex = validIndices[i];
          analyzedImages[originalIndex].detectedCategory = result.category;
          analyzedImages[originalIndex].categoryConfidence = result.confidence;
        }
      }

      // Extract feature embeddings (if enabled)
      if (extractEmbeddings) {
        onProgress?.({
          current: 0,
          total: validElements.length,
          stage: 'grouping',
          message: 'Extracting visual features...'
        });

        // Process embeddings in batches
        const EMBEDDING_BATCH_SIZE = 4;
        for (let batchStart = 0; batchStart < validElements.length; batchStart += EMBEDDING_BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + EMBEDDING_BATCH_SIZE, validElements.length);
          const batch = validElements.slice(batchStart, batchEnd);
          const batchIndices = validIndices.slice(batchStart, batchEnd);

          // Extract embeddings in parallel
          const embeddings = await Promise.all(
            batch.map(async (img) => {
              try {
                return await extractEmbedding(img);
              } catch (error) {
                console.error('Error extracting embedding:', error);
                return null;
              }
            })
          );

          // Apply embeddings to analyzed images
          for (let i = 0; i < embeddings.length; i++) {
            if (embeddings[i]) {
              analyzedImages[batchIndices[i]].embedding = embeddings[i]!;
            }
          }

          onProgress?.({
            current: batchEnd,
            total: validElements.length,
            stage: 'grouping',
            message: `Extracted features from ${batchEnd} of ${validElements.length} images...`
          });
        }
      }

      // Clean up image element URLs
      for (const img of validElements) {
        URL.revokeObjectURL(img.src);
      }
    } catch (error) {
      console.error('Classification/embedding extraction failed:', error);
      // Continue without these features
    }
  }


  onProgress?.({
    current: total,
    total,
    stage: 'grouping',
    message: 'Grouping similar images...'
  });

  // Group images by similarity with the provided threshold
  const groups = groupImagesBySimilarity(analyzedImages, threshold);

  // Count total images in all groups to verify none were lost
  const totalImagesInGroups = groups.reduce((sum, g) => sum + g.images.length, 0);

  if (totalImagesInGroups !== analyzedImages.length) {
    console.error(`[analyzeImages] WARNING: Image count mismatch! ${analyzedImages.length - totalImagesInGroups} images were lost during grouping`);
  }

  onProgress?.({
    current: total,
    total,
    stage: 'complete',
    message: `Analysis complete. Found ${groups.length} group(s).`
  });

  return { analyzedImages, groups };
}

/**
 * Check if the number of images exceeds the recommended limit
 */
export function shouldWarnAboutImageCount(count: number): boolean {
  return count > MAX_IMAGES_WARNING;
}

/**
 * Clean up preview URLs to prevent memory leaks
 */
export function cleanupPreviewUrls(images: AnalyzedImage[]): void {
  for (const image of images) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

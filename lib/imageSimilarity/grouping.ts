import { AnalyzedImage, ImageGroup } from './types';
import { areSimilar, similarityPercentage } from './perceptualHash';
import { getMostCommonColorName } from './colorExtraction';
import { generateId } from '@/lib/utils';
import { UnionFind } from './unionFind';
import { cosineSimilarity } from './featureEmbedding';
import type { ClothingCategory } from './categoryMapping';

const SIMILARITY_THRESHOLD = 10; // Hamming distance threshold for pHash
const EMBEDDING_SIMILARITY_THRESHOLD = 0.75; // Cosine similarity threshold for embeddings

/**
 * Get the most common category from a list of images
 * Returns undefined if no categories are detected
 */
function getMostCommonCategory(images: AnalyzedImage[]): { category: ClothingCategory | undefined; confidence: number } {
  const categoryCounts: Record<string, { count: number; totalConfidence: number }> = {};

  for (const image of images) {
    if (image.detectedCategory && image.detectedCategory !== 'Other') {
      if (!categoryCounts[image.detectedCategory]) {
        categoryCounts[image.detectedCategory] = { count: 0, totalConfidence: 0 };
      }
      categoryCounts[image.detectedCategory].count++;
      categoryCounts[image.detectedCategory].totalConfidence += image.categoryConfidence || 0;
    }
  }

  let bestCategory: ClothingCategory | undefined = undefined;
  let bestCount = 0;
  let bestAvgConfidence = 0;

  for (const [category, data] of Object.entries(categoryCounts)) {
    const avgConfidence = data.totalConfidence / data.count;
    // Prefer categories with more votes, break ties with confidence
    if (data.count > bestCount || (data.count === bestCount && avgConfidence > bestAvgConfidence)) {
      bestCategory = category as ClothingCategory;
      bestCount = data.count;
      bestAvgConfidence = avgConfidence;
    }
  }

  return { category: bestCategory, confidence: bestAvgConfidence };
}

/**
 * Generate a suggested name based on category and color
 */
function generateSuggestedName(category: ClothingCategory | undefined, color: string): string {
  const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);

  if (category && category !== 'Other') {
    return `${category} - ${capitalizedColor}`;
  }

  return `${capitalizedColor} Item`;
}

/**
 * Check if two images are similar using embeddings (preferred) or pHash (fallback)
 */
function areImagesSimilar(
  img1: AnalyzedImage,
  img2: AnalyzedImage,
  pHashThreshold: number,
  embeddingThreshold: number = EMBEDDING_SIMILARITY_THRESHOLD
): boolean {
  // If both have embeddings, use embedding similarity (more accurate)
  if (img1.embedding && img2.embedding) {
    const similarity = cosineSimilarity(img1.embedding, img2.embedding);
    return similarity >= embeddingThreshold;
  }

  // Fall back to perceptual hash
  return areSimilar(img1.pHash, img2.pHash, pHashThreshold);
}

/**
 * Group analyzed images by visual similarity using Union-Find
 * Uses embedding similarity when available, falls back to perceptual hash
 */
export function groupImagesBySimilarity(
  images: AnalyzedImage[],
  threshold: number = SIMILARITY_THRESHOLD
): ImageGroup[] {
  const hasEmbeddings = images.some(img => img.embedding);

  if (images.length === 0) {
    return [];
  }

  // Create Union-Find structure and add all images
  const uf = new UnionFind();
  const imageMap = new Map<string, AnalyzedImage>();

  for (const image of images) {
    uf.makeSet(image.id);
    imageMap.set(image.id, image);
  }

  // Compare all pairs and union similar images
  // This is still O(n²) comparisons but the union operations are O(α(n))
  for (let i = 0; i < images.length; i++) {
    for (let j = i + 1; j < images.length; j++) {
      if (areImagesSimilar(images[i], images[j], threshold)) {
        uf.union(images[i].id, images[j].id);
      }
    }
  }

  // Extract groups from Union-Find structure
  const groupMap = uf.getGroups();
  const groups: ImageGroup[] = [];
  const groupEntries = Array.from(groupMap.entries());

  for (const [, memberIds] of groupEntries) {
    const groupImages = memberIds
      .map((id: string) => imageMap.get(id))
      .filter((img): img is AnalyzedImage => img !== undefined);

    if (groupImages.length === 0) continue;

    // Calculate group confidence as average similarity to the first image
    const confidence = calculateGroupConfidence(groupImages);

    // Get the suggested color from all images in the group
    const allColors = groupImages.flatMap((img: AnalyzedImage) => img.dominantColors);
    const suggestedColor = getMostCommonColorName(allColors);

    // Get the most common category from the group
    const { category: detectedCategory, confidence: categoryConfidence } = getMostCommonCategory(groupImages);

    // Create group with a suggested name based on category and color
    const suggestedName = generateSuggestedName(detectedCategory, suggestedColor);

    groups.push({
      id: generateId(),
      images: groupImages,
      suggestedName,
      suggestedColor,
      confidence,
      detectedCategory,
      categoryConfidence
    });
  }

  // Sort groups by number of images (descending)
  groups.sort((a, b) => b.images.length - a.images.length);

  return groups;
}

/**
 * Calculate confidence score for a group based on internal similarity
 * Uses embedding similarity when available, falls back to pHash
 */
function calculateGroupConfidence(images: AnalyzedImage[]): number {
  if (images.length <= 1) {
    return 1;
  }

  const hasEmbeddings = images.every(img => img.embedding);

  // Calculate average pairwise similarity
  let totalSimilarity = 0;
  let comparisons = 0;

  for (let i = 0; i < images.length; i++) {
    for (let j = i + 1; j < images.length; j++) {
      const emb1 = images[i].embedding;
      const emb2 = images[j].embedding;
      if (hasEmbeddings && emb1 && emb2) {
        // Use embedding cosine similarity (already 0-1 range)
        const similarity = cosineSimilarity(emb1, emb2);
        // Convert from [-1,1] to [0,1] range, though normalized vectors typically give [0,1]
        totalSimilarity += Math.max(0, similarity);
      } else {
        // Fall back to pHash similarity (returns 0-100, convert to 0-1)
        totalSimilarity += similarityPercentage(images[i].pHash, images[j].pHash) / 100;
      }
      comparisons++;
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 1;
}

/**
 * Merge two groups into one
 */
export function mergeGroups(group1: ImageGroup, group2: ImageGroup): ImageGroup {
  const mergedImages = [...group1.images, ...group2.images];
  const allColors = mergedImages.flatMap(img => img.dominantColors);
  const suggestedColor = getMostCommonColorName(allColors);
  const { category: detectedCategory, confidence: categoryConfidence } = getMostCommonCategory(mergedImages);

  return {
    id: generateId(),
    images: mergedImages,
    suggestedName: generateSuggestedName(detectedCategory, suggestedColor),
    suggestedColor,
    confidence: calculateGroupConfidence(mergedImages),
    detectedCategory,
    categoryConfidence
  };
}

/**
 * Split a group into individual single-image groups
 */
export function splitGroup(group: ImageGroup): ImageGroup[] {
  return group.images.map(image => {
    const suggestedColor = getMostCommonColorName(image.dominantColors);
    const detectedCategory = image.detectedCategory;
    const categoryConfidence = image.categoryConfidence;

    return {
      id: generateId(),
      images: [image],
      suggestedName: generateSuggestedName(detectedCategory, suggestedColor),
      suggestedColor,
      confidence: 1,
      detectedCategory,
      categoryConfidence
    };
  });
}

/**
 * Move an image from one group to another
 */
export function moveImageBetweenGroups(
  image: AnalyzedImage,
  sourceGroup: ImageGroup,
  targetGroup: ImageGroup
): { source: ImageGroup | null; target: ImageGroup } {
  // Remove from source
  const newSourceImages = sourceGroup.images.filter(img => img.id !== image.id);

  // Add to target
  const newTargetImages = [...targetGroup.images, image];

  // Recalculate target group
  const targetColors = newTargetImages.flatMap(img => img.dominantColors);
  const targetColor = getMostCommonColorName(targetColors);
  const { category: targetCategory, confidence: targetCategoryConfidence } = getMostCommonCategory(newTargetImages);

  // Check if the name was auto-generated (contains " - " or ends with "Item")
  const isAutoName = targetGroup.suggestedName.includes(' - ') || targetGroup.suggestedName.endsWith('Item');

  const newTarget: ImageGroup = {
    ...targetGroup,
    images: newTargetImages,
    suggestedColor: targetColor,
    suggestedName: isAutoName
      ? generateSuggestedName(targetCategory, targetColor)
      : targetGroup.suggestedName,
    confidence: calculateGroupConfidence(newTargetImages),
    detectedCategory: targetCategory,
    categoryConfidence: targetCategoryConfidence
  };

  // Recalculate source group (or return null if empty)
  if (newSourceImages.length === 0) {
    return { source: null, target: newTarget };
  }

  const sourceColors = newSourceImages.flatMap(img => img.dominantColors);
  const sourceColor = getMostCommonColorName(sourceColors);
  const { category: sourceCategory, confidence: sourceCategoryConfidence } = getMostCommonCategory(newSourceImages);

  // Check if the name was auto-generated
  const isSourceAutoName = sourceGroup.suggestedName.includes(' - ') || sourceGroup.suggestedName.endsWith('Item');

  const newSource: ImageGroup = {
    ...sourceGroup,
    images: newSourceImages,
    suggestedColor: sourceColor,
    suggestedName: isSourceAutoName
      ? generateSuggestedName(sourceCategory, sourceColor)
      : sourceGroup.suggestedName,
    confidence: calculateGroupConfidence(newSourceImages),
    detectedCategory: sourceCategory,
    categoryConfidence: sourceCategoryConfidence
  };

  return { source: newSource, target: newTarget };
}

/**
 * Create a new group with a single image
 */
export function createSingleImageGroup(image: AnalyzedImage): ImageGroup {
  const suggestedColor = getMostCommonColorName(image.dominantColors);
  const detectedCategory = image.detectedCategory;
  const categoryConfidence = image.categoryConfidence;

  return {
    id: generateId(),
    images: [image],
    suggestedName: generateSuggestedName(detectedCategory, suggestedColor),
    suggestedColor,
    confidence: 1,
    detectedCategory,
    categoryConfidence
  };
}

/**
 * Feature embedding extraction using MobileNet
 * Extracts visual feature vectors for semantic similarity comparison
 */

import type { MobileNet } from '@tensorflow-models/mobilenet';

let modelPromise: Promise<MobileNet> | null = null;
let model: MobileNet | null = null;
let tfModule: typeof import('@tensorflow/tfjs') | null = null;

// Embedding size from MobileNet v2 (alpha 0.75)
export const EMBEDDING_SIZE = 1280;

/**
 * Lazily load TensorFlow and MobileNet model
 */
async function getModel(): Promise<{ model: MobileNet; tf: typeof import('@tensorflow/tfjs') }> {
  if (model && tfModule) {
    return { model, tf: tfModule };
  }

  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import('@tensorflow/tfjs');
      const mobilenet = await import('@tensorflow-models/mobilenet');

      // Use same model config as classifier for consistency
      const loadedModel = await mobilenet.load({
        version: 2,
        alpha: 0.75,
      });

      tfModule = tf;
      model = loadedModel;
      return loadedModel;
    })();
  }

  await modelPromise;
  return { model: model!, tf: tfModule! };
}

/**
 * Extract feature embedding from an image element
 * Returns a normalized 1280-dimensional feature vector
 */
export async function extractEmbedding(
  imageElement: HTMLImageElement
): Promise<Float32Array> {
  const { model, tf } = await getModel();

  // Get the internal model to access intermediate layers
  const internalModel = (model as any).model;

  // Create tensor from image
  const imageTensor = tf.browser.fromPixels(imageElement);

  // Resize to MobileNet input size (224x224)
  const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);

  // Normalize to [-1, 1] range (MobileNet v2 preprocessing)
  const normalized = resized.toFloat().div(127.5).sub(1);

  // Add batch dimension
  const batched = normalized.expandDims(0);

  // Get embeddings from the model's feature extraction layer
  // MobileNet v2's global average pooling layer outputs 1280-dim vectors
  const embeddings = internalModel.predict(batched) as import('@tensorflow/tfjs').Tensor;

  // For MobileNet, the output before classification is already the embedding
  // We need to get the feature vector, not the classification logits
  let featureVector: Float32Array;

  // Check if we got logits (1000 classes) or features
  const shape = embeddings.shape;
  if (shape[shape.length - 1] === 1000) {
    // We got classification output, need to get features differently
    // Use the layer before the final dense layer
    const layers = internalModel.layers;
    const featureLayer = layers[layers.length - 2]; // Global average pooling output

    const featureModel = tf.model({
      inputs: internalModel.inputs,
      outputs: featureLayer.output,
    });

    const features = featureModel.predict(batched) as import('@tensorflow/tfjs').Tensor;
    featureVector = await features.data() as Float32Array;
    features.dispose();
    featureModel.dispose();
  } else {
    featureVector = await embeddings.data() as Float32Array;
  }

  // Clean up tensors
  imageTensor.dispose();
  resized.dispose();
  normalized.dispose();
  batched.dispose();
  embeddings.dispose();

  // Normalize the feature vector (L2 normalization)
  const normalized_embedding = l2Normalize(featureVector);

  return normalized_embedding;
}

/**
 * Extract embeddings for multiple images in batch
 */
export async function extractEmbeddingsBatch(
  imageElements: HTMLImageElement[],
  onProgress?: (current: number, total: number) => void
): Promise<Float32Array[]> {
  const embeddings: Float32Array[] = [];
  const BATCH_SIZE = 4; // Process 4 at a time to balance speed vs memory

  for (let i = 0; i < imageElements.length; i += BATCH_SIZE) {
    const batch = imageElements.slice(i, Math.min(i + BATCH_SIZE, imageElements.length));

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (img) => {
        try {
          return await extractEmbedding(img);
        } catch (error) {
          console.error('Error extracting embedding:', error);
          // Return zero vector on error
          return new Float32Array(EMBEDDING_SIZE);
        }
      })
    );

    embeddings.push(...batchResults);
    onProgress?.(Math.min(i + BATCH_SIZE, imageElements.length), imageElements.length);
  }

  return embeddings;
}

/**
 * L2 normalize a vector (makes cosine similarity = dot product)
 */
function l2Normalize(vector: Float32Array): Float32Array {
  let sumSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    sumSquares += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSquares);

  if (norm === 0) return vector;

  const normalized = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / norm;
  }
  return normalized;
}

/**
 * Calculate cosine similarity between two normalized embeddings
 * Returns value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 */
export function cosineSimilarity(
  embedding1: Float32Array,
  embedding2: Float32Array
): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have same length');
  }

  // For L2-normalized vectors, cosine similarity = dot product
  let dotProduct = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
  }

  return dotProduct;
}

/**
 * Calculate Euclidean distance between two embeddings
 */
export function euclideanDistance(
  embedding1: Float32Array,
  embedding2: Float32Array
): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have same length');
  }

  let sumSquares = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}

/**
 * Check if two images are similar based on embedding similarity
 * threshold: cosine similarity threshold (default 0.7 = fairly similar)
 */
export function areEmbeddingsSimilar(
  embedding1: Float32Array,
  embedding2: Float32Array,
  threshold: number = 0.7
): boolean {
  return cosineSimilarity(embedding1, embedding2) >= threshold;
}

/**
 * Convert embedding to a compact representation for storage
 * Quantizes to int8 to reduce size by 4x
 */
export function compressEmbedding(embedding: Float32Array): Int8Array {
  const compressed = new Int8Array(embedding.length);
  for (let i = 0; i < embedding.length; i++) {
    // Clamp to [-1, 1] and scale to [-127, 127]
    compressed[i] = Math.round(Math.max(-1, Math.min(1, embedding[i])) * 127);
  }
  return compressed;
}

/**
 * Decompress an int8 embedding back to float32
 */
export function decompressEmbedding(compressed: Int8Array): Float32Array {
  const embedding = new Float32Array(compressed.length);
  for (let i = 0; i < compressed.length; i++) {
    embedding[i] = compressed[i] / 127;
  }
  return embedding;
}

/**
 * Serialize embedding to base64 string for storage
 */
export function embeddingToBase64(embedding: Float32Array): string {
  const compressed = compressEmbedding(embedding);
  const bytes = new Uint8Array(compressed.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Deserialize embedding from base64 string
 */
export function base64ToEmbedding(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const compressed = new Int8Array(bytes.buffer);
  return decompressEmbedding(compressed);
}

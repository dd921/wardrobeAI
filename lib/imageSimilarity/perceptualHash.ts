/**
 * Perceptual hashing using block mean value algorithm
 * This implementation creates a 64-bit hash that's similar for visually similar images
 */

const HASH_SIZE = 8; // 8x8 = 64 bits

/**
 * Resize image to a small square using canvas
 */
function resizeImageToCanvas(
  img: HTMLImageElement,
  size: number
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(img, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

/**
 * Convert image data to grayscale values
 */
function toGrayscale(imageData: ImageData): number[] {
  const grayscale: number[] = [];
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Use luminance formula
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale.push(gray);
  }

  return grayscale;
}

/**
 * Compute block mean hash for the grayscale values
 * Each bit represents whether a block is above or below the median
 */
function computeBlockHash(grayscale: number[], size: number): string {
  // Calculate the median value
  const sorted = [...grayscale].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Create hash based on whether each pixel is above or below median
  let hash = '';
  for (let i = 0; i < grayscale.length; i++) {
    hash += grayscale[i] >= median ? '1' : '0';
  }

  // Convert binary string to hex for shorter representation
  let hexHash = '';
  for (let i = 0; i < hash.length; i += 4) {
    const nibble = hash.substring(i, i + 4);
    hexHash += parseInt(nibble, 2).toString(16);
  }

  return hexHash;
}

/**
 * Load an image from a File object
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Compute perceptual hash for a single image file
 */
export async function computePerceptualHash(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const imageData = resizeImageToCanvas(img, HASH_SIZE);
  const grayscale = toGrayscale(imageData);
  return computeBlockHash(grayscale, HASH_SIZE);
}

/**
 * Calculate Hamming distance between two hashes
 * Lower distance = more similar
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    // Convert hex back to binary for comparison
    const bin1 = hexToBinary(hash1);
    const bin2 = hexToBinary(hash2);

    let distance = 0;
    const maxLen = Math.max(bin1.length, bin2.length);

    for (let i = 0; i < maxLen; i++) {
      if (bin1[i] !== bin2[i]) {
        distance++;
      }
    }

    return distance;
  }

  // Compare hex directly by converting to binary
  const bin1 = hexToBinary(hash1);
  const bin2 = hexToBinary(hash2);

  let distance = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Convert hex string to binary string
 */
function hexToBinary(hex: string): string {
  let binary = '';
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    binary += nibble;
  }
  return binary;
}

/**
 * Check if two images are similar based on hash distance
 * Default threshold of 10 = ~85% similarity
 */
export function areSimilar(
  hash1: string,
  hash2: string,
  threshold: number = 10
): boolean {
  return hammingDistance(hash1, hash2) <= threshold;
}

/**
 * Calculate similarity percentage between two hashes
 */
export function similarityPercentage(hash1: string, hash2: string): number {
  const bin1 = hexToBinary(hash1);
  const bin2 = hexToBinary(hash2);
  const maxBits = Math.max(bin1.length, bin2.length);
  const distance = hammingDistance(hash1, hash2);
  return Math.round(((maxBits - distance) / maxBits) * 100);
}

import { DominantColor } from './types';
import { rgbToLab, colorDistanceLab, LABColor } from './colorSpace';

// Expanded color palette (55+ fashion colors)
export const COLOR_MAP: Record<string, string> = {
  // Neutrals
  'black': '#1a1a1a',
  'charcoal': '#36454f',
  'slate': '#708090',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'silver': '#c0c0c0',
  'white': '#f5f5f5',
  'ivory': '#fffff0',
  'cream': '#fffdd0',
  'off-white': '#faf0e6',

  // Browns & Tans
  'black-brown': '#1c1a16',
  'espresso': '#3c2415',
  'chocolate': '#4a2c2a',
  'brown': '#6b4423',
  'cognac': '#9a463d',
  'rust': '#b7410e',
  'caramel': '#a67b5b',
  'tan': '#d2b48c',
  'beige': '#d4c4a8',
  'sand': '#c2b280',
  'khaki': '#c3b091',
  'taupe': '#483c32',

  // Reds & Pinks
  'burgundy': '#722f37',
  'maroon': '#800000',
  'wine': '#722f37',
  'red': '#ef4444',
  'cherry': '#de3163',
  'coral': '#ff7f50',
  'salmon': '#fa8072',
  'blush': '#de5d83',
  'pink': '#ec4899',
  'rose': '#ff007f',
  'dusty-rose': '#c4a4a4',
  'mauve': '#e0b0ff',
  'peach': '#ffcba4',

  // Oranges & Yellows
  'burnt-orange': '#cc5500',
  'orange': '#f97316',
  'tangerine': '#ff9966',
  'mustard': '#ffdb58',
  'gold': '#ffd700',
  'yellow': '#eab308',
  'lemon': '#fff44f',

  // Greens
  'forest': '#228b22',
  'hunter': '#355e3b',
  'olive': '#6b7f59',
  'sage': '#9dc183',
  'green': '#22c55e',
  'emerald': '#50c878',
  'mint': '#98ff98',
  'seafoam': '#93e9be',
  'teal': '#14b8a6',
  'turquoise': '#40e0d0',

  // Blues
  'navy': '#1e3a5f',
  'midnight': '#191970',
  'royal': '#4169e1',
  'blue': '#3b82f6',
  'cobalt': '#0047ab',
  'denim': '#1560bd',
  'steel': '#4682b4',
  'sky': '#87ceeb',
  'powder-blue': '#b0e0e6',
  'baby-blue': '#89cff0',
  'ice-blue': '#d6ecef',

  // Purples
  'plum': '#8e4585',
  'eggplant': '#614051',
  'purple': '#a855f7',
  'violet': '#8b5cf6',
  'lilac': '#c8a2c8',
  'lavender': '#e6e6fa',
  'periwinkle': '#ccccff',
};

// Pre-computed LAB values for all reference colors
interface ColorReference {
  name: string;
  rgb: [number, number, number];
  lab: LABColor;
}

// Reference colors with RGB values - LAB will be computed on first use
const COLOR_RGB_VALUES: { name: string; rgb: [number, number, number] }[] = [
  // Neutrals
  { name: 'black', rgb: [26, 26, 26] },
  { name: 'charcoal', rgb: [54, 69, 79] },
  { name: 'slate', rgb: [112, 128, 144] },
  { name: 'gray', rgb: [107, 114, 128] },
  { name: 'silver', rgb: [192, 192, 192] },
  { name: 'white', rgb: [245, 245, 245] },
  { name: 'ivory', rgb: [255, 255, 240] },
  { name: 'cream', rgb: [255, 253, 208] },
  { name: 'off-white', rgb: [250, 240, 230] },

  // Browns & Tans
  { name: 'espresso', rgb: [60, 36, 21] },
  { name: 'chocolate', rgb: [74, 44, 42] },
  { name: 'brown', rgb: [107, 68, 35] },
  { name: 'cognac', rgb: [154, 70, 61] },
  { name: 'rust', rgb: [183, 65, 14] },
  { name: 'caramel', rgb: [166, 123, 91] },
  { name: 'tan', rgb: [210, 180, 140] },
  { name: 'beige', rgb: [212, 196, 168] },
  { name: 'sand', rgb: [194, 178, 128] },
  { name: 'khaki', rgb: [195, 176, 145] },
  { name: 'taupe', rgb: [72, 60, 50] },

  // Reds & Pinks
  { name: 'burgundy', rgb: [114, 47, 55] },
  { name: 'maroon', rgb: [128, 0, 0] },
  { name: 'wine', rgb: [114, 47, 55] },
  { name: 'red', rgb: [239, 68, 68] },
  { name: 'cherry', rgb: [222, 49, 99] },
  { name: 'coral', rgb: [255, 127, 80] },
  { name: 'salmon', rgb: [250, 128, 114] },
  { name: 'blush', rgb: [222, 93, 131] },
  { name: 'pink', rgb: [236, 72, 153] },
  { name: 'rose', rgb: [255, 0, 127] },
  { name: 'dusty-rose', rgb: [196, 164, 164] },
  { name: 'mauve', rgb: [224, 176, 255] },
  { name: 'peach', rgb: [255, 203, 164] },

  // Oranges & Yellows
  { name: 'burnt-orange', rgb: [204, 85, 0] },
  { name: 'orange', rgb: [249, 115, 22] },
  { name: 'tangerine', rgb: [255, 153, 102] },
  { name: 'mustard', rgb: [255, 219, 88] },
  { name: 'gold', rgb: [255, 215, 0] },
  { name: 'yellow', rgb: [234, 179, 8] },
  { name: 'lemon', rgb: [255, 244, 79] },

  // Greens
  { name: 'forest', rgb: [34, 139, 34] },
  { name: 'hunter', rgb: [53, 94, 59] },
  { name: 'olive', rgb: [107, 127, 89] },
  { name: 'sage', rgb: [157, 193, 131] },
  { name: 'green', rgb: [34, 197, 94] },
  { name: 'emerald', rgb: [80, 200, 120] },
  { name: 'mint', rgb: [152, 255, 152] },
  { name: 'seafoam', rgb: [147, 233, 190] },
  { name: 'teal', rgb: [20, 184, 166] },
  { name: 'turquoise', rgb: [64, 224, 208] },

  // Blues
  { name: 'navy', rgb: [30, 58, 95] },
  { name: 'midnight', rgb: [25, 25, 112] },
  { name: 'royal', rgb: [65, 105, 225] },
  { name: 'blue', rgb: [59, 130, 246] },
  { name: 'cobalt', rgb: [0, 71, 171] },
  { name: 'denim', rgb: [21, 96, 189] },
  { name: 'steel', rgb: [70, 130, 180] },
  { name: 'sky', rgb: [135, 206, 235] },
  { name: 'powder-blue', rgb: [176, 224, 230] },
  { name: 'baby-blue', rgb: [137, 207, 240] },
  { name: 'ice-blue', rgb: [214, 236, 239] },

  // Purples
  { name: 'plum', rgb: [142, 69, 133] },
  { name: 'eggplant', rgb: [97, 64, 81] },
  { name: 'purple', rgb: [168, 85, 247] },
  { name: 'violet', rgb: [139, 92, 246] },
  { name: 'lilac', rgb: [200, 162, 200] },
  { name: 'lavender', rgb: [230, 230, 250] },
  { name: 'periwinkle', rgb: [204, 204, 255] },
];

// Lazily computed LAB reference map
let colorReferences: ColorReference[] | null = null;

function getColorReferences(): ColorReference[] {
  if (!colorReferences) {
    colorReferences = COLOR_RGB_VALUES.map(c => ({
      ...c,
      lab: rgbToLab(c.rgb),
    }));
  }
  return colorReferences;
}

/**
 * Map RGB values to the closest named color using LAB color space
 * More perceptually accurate than RGB Euclidean distance
 */
export function rgbToColorName(rgb: [number, number, number]): string {
  const references = getColorReferences();
  let closestColor = 'gray';
  let minDistance = Infinity;

  for (const ref of references) {
    const distance = colorDistanceLab(rgb, ref.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = ref.name;
    }
  }

  return closestColor;
}

/**
 * Convert RGB array to hex string
 */
export function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Reusable canvas for color extraction (performance optimization)
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function getSharedCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (!sharedCanvas || !sharedCtx) {
    sharedCanvas = document.createElement('canvas');
    sharedCtx = sharedCanvas.getContext('2d', { willReadFrequently: true });
    if (!sharedCtx) {
      throw new Error('Could not get canvas context');
    }
  }
  return { canvas: sharedCanvas, ctx: sharedCtx };
}

/**
 * Load image and draw to shared canvas for color extraction
 */
function loadImageToCanvas(file: File): Promise<{ ctx: CanvasRenderingContext2D; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { canvas, ctx } = getSharedCanvas();

      // Resize canvas to smaller size for performance
      const maxSize = 100;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = Math.floor(img.width * ratio);
      canvas.height = Math.floor(img.height * ratio);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ ctx, width: canvas.width, height: canvas.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Sample ~1000 pixels using stratified grid sampling
 * More efficient than reading all pixels while maintaining representative coverage
 */
function samplePixels(
  imageData: ImageData,
  targetSamples: number = 1000
): [number, number, number][] {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const pixels: [number, number, number][] = [];

  // If image is small enough, use all pixels
  if (totalPixels <= targetSamples) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 128) { // Skip transparent pixels
        pixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    return pixels;
  }

  // Calculate grid dimensions for stratified sampling
  const gridSize = Math.ceil(Math.sqrt(targetSamples));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      // Sample from center of each grid cell
      const x = Math.floor(gx * cellWidth + cellWidth / 2);
      const y = Math.floor(gy * cellHeight + cellHeight / 2);

      if (x < width && y < height) {
        const idx = (y * width + x) * 4;
        if (data[idx + 3] > 128) { // Skip transparent pixels
          pixels.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
      }
    }
  }

  return pixels;
}

/**
 * Simple color quantization using k-means like clustering
 */
function quantizeColors(
  pixels: [number, number, number][],
  numColors: number = 5
): [number, number, number][] {
  if (pixels.length === 0) {
    return [[128, 128, 128]];
  }

  // Simple median cut algorithm for color quantization
  return medianCut(pixels, numColors);
}

/**
 * Median cut algorithm for color quantization
 */
function medianCut(
  pixels: [number, number, number][],
  numColors: number
): [number, number, number][] {
  if (pixels.length === 0) {
    return [[128, 128, 128]];
  }

  let buckets: [number, number, number][][] = [pixels];

  while (buckets.length < numColors) {
    // Find the bucket with the largest range
    let maxRange = -1;
    let bucketToSplit = 0;
    let channelToSplit = 0;

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;

      for (let channel = 0; channel < 3; channel++) {
        const values = bucket.map(p => p[channel]);
        const range = Math.max(...values) - Math.min(...values);
        if (range > maxRange) {
          maxRange = range;
          bucketToSplit = i;
          channelToSplit = channel;
        }
      }
    }

    if (maxRange <= 0) break;

    // Split the bucket at the median
    const bucket = buckets[bucketToSplit];
    bucket.sort((a, b) => a[channelToSplit] - b[channelToSplit]);
    const mid = Math.floor(bucket.length / 2);

    buckets.splice(bucketToSplit, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  // Calculate the average color of each bucket
  return buckets.map(bucket => {
    if (bucket.length === 0) return [128, 128, 128] as [number, number, number];

    const sum = bucket.reduce(
      (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
      [0, 0, 0]
    );
    return [
      Math.round(sum[0] / bucket.length),
      Math.round(sum[1] / bucket.length),
      Math.round(sum[2] / bucket.length)
    ] as [number, number, number];
  });
}

/**
 * Extract dominant colors from an image file
 */
export async function extractDominantColors(
  file: File,
  numColors: number = 5
): Promise<DominantColor[]> {
  try {
    const { ctx, width, height } = await loadImageToCanvas(file);
    const imageData = ctx.getImageData(0, 0, width, height);

    // Use stratified sampling for better performance
    const sampledPixels = samplePixels(imageData, 1000);
    const colors = quantizeColors(sampledPixels, numColors);

    return colors.map(rgb => ({
      rgb,
      hex: rgbToHex(rgb),
      colorName: rgbToColorName(rgb),
      lab: rgbToLab(rgb),
    }));
  } catch (error) {
    console.error('Error extracting colors:', error);
    return [{ rgb: [128, 128, 128], hex: '#808080', colorName: 'gray' }];
  }
}

/**
 * Get the most common color name from an array of dominant colors
 */
export function getMostCommonColorName(colors: DominantColor[]): string {
  if (colors.length === 0) return 'gray';

  // Count occurrences of each color name
  const counts: Record<string, number> = {};
  for (const color of colors) {
    counts[color.colorName] = (counts[color.colorName] || 0) + 1;
  }

  // Find the most common
  let maxCount = 0;
  let mostCommon = colors[0].colorName;
  for (const [name, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = name;
    }
  }

  return mostCommon;
}

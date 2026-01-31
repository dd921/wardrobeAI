/**
 * Color space conversion and perceptually accurate color distance calculations
 * Uses CIE LAB color space for human-perceptual color matching
 */

export interface LABColor {
  L: number; // Lightness: 0-100
  a: number; // Green-Red: -128 to 127
  b: number; // Blue-Yellow: -128 to 127
}

/**
 * Convert RGB to XYZ color space (intermediate step for LAB)
 * Uses sRGB with D65 illuminant
 */
function rgbToXyz(rgb: [number, number, number]): [number, number, number] {
  // Normalize RGB to 0-1 range
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;

  // Apply sRGB gamma correction (inverse companding)
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Scale to 0-100
  r *= 100;
  g *= 100;
  b *= 100;

  // Convert to XYZ using sRGB matrix (D65 illuminant)
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  return [x, y, z];
}

/**
 * Convert XYZ to LAB color space
 * Uses D65 reference white
 */
function xyzToLab(xyz: [number, number, number]): LABColor {
  // D65 reference white
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let x = xyz[0] / refX;
  let y = xyz[1] / refY;
  let z = xyz[2] / refZ;

  // Apply LAB transformation function
  const epsilon = 0.008856; // (6/29)^3
  const kappa = 903.3; // (29/3)^3

  x = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  y = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
  z = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

  const L = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return { L, a, b };
}

/**
 * Convert RGB color to LAB color space
 */
export function rgbToLab(rgb: [number, number, number]): LABColor {
  const xyz = rgbToXyz(rgb);
  return xyzToLab(xyz);
}

/**
 * Calculate Delta E (CIE76) color difference
 * Simple Euclidean distance in LAB space
 * Generally: <1 imperceptible, 1-2 subtle, 2-10 noticeable, >10 very different
 */
export function deltaE76(lab1: LABColor, lab2: LABColor): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Calculate Delta E 2000 (CIEDE2000) - more perceptually uniform
 * This is the gold standard for color difference
 */
export function deltaE2000(lab1: LABColor, lab2: LABColor): number {
  const L1 = lab1.L, a1 = lab1.a, b1 = lab1.b;
  const L2 = lab2.L, a2 = lab2.a, b2 = lab2.b;

  // Parametric weighting factors
  const kL = 1, kC = 1, kH = 1;

  // Calculate C' and h'
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cab, 7) / (Math.pow(Cab, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
  const h1pn = h1p >= 0 ? h1p : h1p + 360;
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
  const h2pn = h2p >= 0 ? h2p : h2p + 360;

  // Calculate deltas
  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2pn - h1pn) <= 180) {
    dhp = h2pn - h1pn;
  } else if (h2pn - h1pn > 180) {
    dhp = h2pn - h1pn - 360;
  } else {
    dhp = h2pn - h1pn + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);

  // Calculate mean values
  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let Hp: number;
  if (C1p * C2p === 0) {
    Hp = h1pn + h2pn;
  } else if (Math.abs(h1pn - h2pn) <= 180) {
    Hp = (h1pn + h2pn) / 2;
  } else if (h1pn + h2pn < 360) {
    Hp = (h1pn + h2pn + 360) / 2;
  } else {
    Hp = (h1pn + h2pn - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos((Hp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * Hp * Math.PI / 180)
    + 0.32 * Math.cos((3 * Hp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * Hp - 63) * Math.PI / 180);

  const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)));

  const Sl = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const Sc = 1 + 0.045 * Cp;
  const Sh = 1 + 0.015 * Cp * T;

  const Rt = -Math.sin(2 * dTheta * Math.PI / 180) * Rc;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
    Math.pow(dCp / (kC * Sc), 2) +
    Math.pow(dHp / (kH * Sh), 2) +
    Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh))
  );

  return dE;
}

/**
 * Calculate color distance between two RGB colors using LAB space
 * Uses Delta E 2000 for best perceptual accuracy
 */
export function colorDistanceLab(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  return deltaE2000(lab1, lab2);
}

/**
 * Check if two colors are perceptually similar
 * threshold: Delta E value (default 10 = clearly different colors)
 */
export function areColorsSimilar(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
  threshold: number = 10
): boolean {
  return colorDistanceLab(rgb1, rgb2) < threshold;
}

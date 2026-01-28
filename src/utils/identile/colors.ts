
export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function hsvToRgb(h: number, s: number, v: number): RgbaColor {
  const hue = ((h % 360) + 360) % 360;
  const saturation = Math.min(Math.max(s, 0), 1);
  const value = Math.min(Math.max(v, 0), 1);

  const c = value * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hue < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
    a: 255
  };
}

/**
 * Generates three colors in a triadic color scheme based on the HSV color model.
 * 
 * A triadic color scheme uses three colors that are evenly spaced around the color wheel,
 * creating a balanced and vibrant palette. The colors are positioned 120 degrees apart.
 * 
 * @param hueDeg - The base hue in degrees (0-360), where 0 is red, 120 is green, and 240 is blue
 * @param saturation - The saturation level (0-1), where 0 is grayscale and 1 is full color
 * @param value - The brightness/value level (0-1), where 0 is black and 1 is full brightness. Defaults to 1
 * @returns A tuple of three RgbaColor objects representing the triadic color scheme
 * 
 * @example
 * ```typescript
 * // Generate a triadic color scheme starting with red
 * const [color1, color2, color3] = getTriadColors(0, 1, 1);
 * ```
 */
export function getTriadColors(hueDeg: number, saturation: number, value = 1): [RgbaColor, RgbaColor, RgbaColor] {
  const base = hsvToRgb(hueDeg, saturation, value);
  const second = hsvToRgb(hueDeg + 120, saturation, value);
  const third = hsvToRgb(hueDeg + 240, saturation, value);
  return [base, second, third];
}

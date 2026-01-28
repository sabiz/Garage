import { getTriadColors } from './colors';
import type { RgbaColor } from './colors';

export interface RenderOptions {
  code: number;
  size: number;
}

interface Point {
  x: number;
  y: number;
}

const centerTypeTable: Point[][] = [
  [{ x: 3, y: 3 }],
  [{ x: 3, y: 2 }],
  [{ x: 3, y: 2 }],
  [{ x: 3, y: 3 }],
  [{ x: 3, y: 3 }],
  [
    { x: 3, y: 3 },
    { x: 3, y: 2 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 4 }
  ],
  [
    { x: 3, y: 3 },
    { x: 3, y: 2 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 4 }
  ],
  [
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 4 }
  ]
];

const crossTypeTable: Point[][] = [
  [
    { x: 3, y: 3 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 4 },
    { x: 3, y: 5 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 }
  ],
  [
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 1, y: 4 },
    { x: 5, y: 4 }
  ],
  [
    { x: 1, y: 1 },
    { x: 5, y: 1 },
    { x: 4, y: 2 },
    { x: 3, y: 3 },
    { x: 2, y: 4 },
    { x: 1, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 3, y: 2 },
    { x: 5, y: 2 },
    { x: 1, y: 4 },
    { x: 3, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 4, y: 5 }
  ],
  [
    { x: 1, y: 1 },
    { x: 5, y: 1 },
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 1, y: 4 },
    { x: 3, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 4, y: 5 }
  ],
  [
    { x: 3, y: 1 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 3, y: 5 }
  ],
  [
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 2, y: 4 },
    { x: 4, y: 4 }
  ],
  [{ x: 3, y: 3 }]
];

const turnCrossTypeTable: Point[][] = [
  [
    { x: 1, y: 1 },
    { x: 5, y: 1 },
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 1, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 3, y: 5 }
  ],
  [
    { x: 3, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 4, y: 4 },
    { x: 3, y: 5 }
  ],
  [
    { x: 3, y: 1 },
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 3, y: 5 }
  ],
  [
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 3, y: 2 },
    { x: 5, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 1, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 1, y: 1 },
    { x: 5, y: 1 },
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 1, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 3, y: 2 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 4 }
  ]
];

const slashTypeTable: Point[][] = [
  [
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 5, y: 2 },
    { x: 1, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 4, y: 5 }
  ],
  [
    { x: 1, y: 1 },
    { x: 5, y: 1 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 2, y: 1 },
    { x: 4, y: 2 },
    { x: 1, y: 2 },
    { x: 5, y: 2 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 1, y: 4 },
    { x: 3, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 4, y: 5 }
  ],
  [
    { x: 1, y: 1 },
    { x: 5, y: 1 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 1, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 3, y: 1 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 5 }
  ],
  [
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 5, y: 2 },
    { x: 1, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 4, y: 5 }
  ],
  [
    { x: 1, y: 2 },
    { x: 5, y: 2 },
    { x: 1, y: 4 },
    { x: 5, y: 4 }
  ],
  [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
    { x: 1, y: 2 },
    { x: 5, y: 2 },
    { x: 1, y: 3 },
    { x: 5, y: 3 },
    { x: 1, y: 4 },
    { x: 5, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 }
  ]
];

function setPixel(data: ImageData, x: number, y: number, color: RgbaColor) {
  const index = (y * data.width + x) * 4;
  data.data[index] = color.r;
  data.data[index + 1] = color.g;
  data.data[index + 2] = color.b;
  data.data[index + 3] = color.a;
}

/**
 * Clears the entire canvas by removing all drawn content.
 * 
 * @param canvas - The HTML canvas element to be cleared
 * @returns void - Returns early if the 2D rendering context cannot be obtained
 * 
 * @example
 * ```typescript
 * const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
 * clearCanvas(canvas);
 * ```
 */
export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/**
 * Renders an identicon on the provided canvas element based on the given options.
 * 
 * The function decodes a numeric code into various visual parameters (frame type, colors, patterns)
 * and draws a 7x7 pixel identicon that is then scaled to the specified size.
 * 
 * @param canvas - The HTML canvas element where the identicon will be rendered
 * @param options - Configuration options for rendering the identicon
 * @param options.code - A numeric code that encodes all visual properties of the identicon including:
 *   - bits 0-6: frame type
 *   - bit 7: center type
 *   - bit 8: cross type
 *   - bit 9: turn cross type
 *   - bit 10: slash type
 *   - bits 11-13: inner type
 *   - bits 14-18: fill option flags
 *   - bits 19-23: saturation value
 *   - bits 24-31: hue value
 * @param options.size - The target size (width and height) in pixels for the rendered identicon
 * 
 * @remarks
 * - If the size is not a finite positive number, the canvas will be cleared
 * - The identicon is first drawn at 7x7 pixels and then scaled up without smoothing
 * - Colors are generated using a triadic color scheme based on the encoded hue and saturation
 * - The function uses bitwise operations to decode different aspects of the identicon from the code
 * 
 * @returns void
 */
export function renderIdenticon(canvas: HTMLCanvasElement, options: RenderOptions) {
  const { code, size } = options;
  if (!Number.isFinite(size) || size <= 0) {
    clearCanvas(canvas);
    return;
  }

  const frameType = code & 0x7f;
  const centerType = ((code >> 7) & 0x1) !== 0;
  const crossType = ((code >> 8) & 0x1) !== 0;
  const turnCrossType = ((code >> 9) & 0x1) !== 0;
  const slashType = ((code >> 10) & 0x1) !== 0;
  const innerType = (code >> 11) & 0x7;
  const fillOption = (code >> 14) & 0x1f;
  const saturation = (code >> 19) & 0x1f;
  const hue = (code >> 24) & 0xff;

  const saturationValue = saturation / 0x1f;
  const [baseColor, secondColor, thirdColor] = getTriadColors(hue, saturationValue, 1);

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = 7;
  srcCanvas.height = 7;
  const srcContext = srcCanvas.getContext('2d');
  if (!srcContext) return;
  const imageData = srcContext.createImageData(7, 7);

  const frameFlip = (fillOption & 0x10) > 0;
  for (let i = 0; i < 7; i += 1) {
    if ((frameType & (1 << i)) > 0) {
      setPixel(imageData, i, 0, baseColor);
      setPixel(imageData, 6 - i, 6, baseColor);
      if (frameFlip) {
        setPixel(imageData, 0, 6 - i, baseColor);
        setPixel(imageData, 6, i, baseColor);
      } else {
        setPixel(imageData, 0, i, baseColor);
        setPixel(imageData, 6, 6 - i, baseColor);
      }
    }
  }

  const centerColor: RgbaColor = centerType ? baseColor : { r: 0, g: 0, b: 0, a: 0 };
  if ((fillOption & 0x1) > 0) {
    for (const point of centerTypeTable[innerType]) {
      setPixel(imageData, point.x, point.y, centerColor);
    }
  }

  const crossColor = crossType ? thirdColor : secondColor;
  if ((fillOption & 0x2) > 0) {
    for (const point of crossTypeTable[innerType]) {
      setPixel(imageData, point.x, point.y, crossColor);
    }
  }

  const turnCrossColor = turnCrossType ? thirdColor : secondColor;
  if ((fillOption & 0x4) > 0) {
    for (const point of turnCrossTypeTable[innerType]) {
      setPixel(imageData, point.x, point.y, turnCrossColor);
    }
  }

  const slashColor = slashType ? thirdColor : secondColor;
  if ((fillOption & 0x8) > 0) {
    for (const point of slashTypeTable[innerType]) {
      setPixel(imageData, point.x, point.y, slashColor);
    }
  }

  srcContext.putImageData(imageData, 0, 0);

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcCanvas, 0, 0, size, size);
}

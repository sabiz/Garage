/**
 * Favicon utilities for the Timer tool
 */

/**
 * Loads the favicon at the given URL, draws it onto a canvas, and overlays a
 * semi-transparent red filter to produce a "red-tinted" variant.
 *
 * The result is returned as a base64-encoded PNG data URL suitable for use as
 * a `<link rel="icon">` href.
 *
 * Falls back to the original href if the image fails to load.
 *
 * @param originalHref - The current favicon URL to tint
 * @returns A Promise resolving to a base64 PNG data URL of the tinted favicon
 */
export async function buildRedTintedFavicon(originalHref: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 32, 32);
      // Overlay a semi-transparent red using source-atop composite operation
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.fillRect(0, 0, 32, 32);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(originalHref);
    img.src = originalHref;
  });
}

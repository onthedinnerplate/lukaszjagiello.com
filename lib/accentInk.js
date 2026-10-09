/**
 * Handwritten accent ink. The middle swatch is used as-is when it already
 * clears 3:1 on the surface the word sits on. Otherwise the same hue is
 * darkened only until that ratio is met.
 *
 * Article titles and Journeys card titles sit on white: the page, the
 * article panel, the featured story panel, and the All journeys tile.
 */

const MIN_CONTRAST = 3;
export const ACCENT_SURFACE = '#ffffff';

function parseHex(value) {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb) {
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(foreground, background) {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return 0;
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHsl({ r, g, b }) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === R) h = (G - B) / d + (G < B ? 6 : 0);
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: h * 60, s, l };
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function hexOf(rgb) {
  const byte = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${byte(rgb.r)}${byte(rgb.g)}${byte(rgb.b)}`.toUpperCase();
}

function darkenSameHue(hex, background, minimum) {
  const hsl = rgbToHsl(parseHex(hex));
  let lo = 0;
  let hi = hsl.l;
  let best = 0;
  for (let i = 0; i < 28; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = hexOf(hslToRgb(hsl.h, hsl.s, mid));
    if (contrastRatio(candidate, background) >= minimum) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  let used = hexOf(hslToRgb(hsl.h, hsl.s, best));
  let guard = 0;
  while (contrastRatio(used, background) < minimum && best > 0 && guard < 40) {
    best = Math.max(0, best - 0.002);
    used = hexOf(hslToRgb(hsl.h, hsl.s, best));
    guard += 1;
  }
  return used;
}

/**
 * @returns {{ original: string, used: string, adjusted: boolean, contrast: number, contrastUsed: number } | null}
 */
export function accentScriptInk(hex, background = ACCENT_SURFACE) {
  if (!parseHex(hex) || !parseHex(background)) return null;
  const original = String(hex).trim();
  const contrast = contrastRatio(original, background);
  if (contrast >= MIN_CONTRAST) {
    return { original, used: original, adjusted: false, contrast, contrastUsed: contrast };
  }
  const used = darkenSameHue(original, background, MIN_CONTRAST);
  return {
    original,
    used,
    adjusted: used.toLowerCase() !== original.toLowerCase(),
    contrast,
    contrastUsed: contrastRatio(used, background),
  };
}

/** Middle swatch (index 2) turned into accent ink, or null when that swatch is missing. */
export function accentScriptFromPalette(palette, background = ACCENT_SURFACE) {
  const hex = Array.isArray(palette) ? palette[2] : null;
  return accentScriptInk(hex, background);
}

// Five-colour palette extraction. Same sampling and k-means as
// scripts/generate-journal-treatments.mjs (the Journeys palettes).
import sharp from 'sharp';

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const round = (n) => Math.round(n * 1000) / 1000;

function hex(r, g, b) {
  const h = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function lum({ r, g, b }) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function sat({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function kmeans(pixels, k = 5) {
  const sorted = [...pixels].sort((a, b) => lum(a) - lum(b));
  let centers = Array.from({ length: k }, (_, i) => {
    const p = sorted[Math.min(sorted.length - 1, Math.floor(((i + 0.5) * sorted.length) / k))];
    return { r: p.r, g: p.g, b: p.b };
  });
  for (let iter = 0; iter < 14; iter++) {
    const groups = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < k; i++) {
        const c = centers[i];
        const d = (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      groups[best].push(p);
    }
    centers = centers.map((c, i) => {
      const g = groups[i];
      if (!g.length) return c;
      return {
        r: g.reduce((s, p) => s + p.r, 0) / g.length,
        g: g.reduce((s, p) => s + p.g, 0) / g.length,
        b: g.reduce((s, p) => s + p.b, 0) / g.length,
      };
    });
  }
  const seen = new Set();
  const unique = [];
  for (const c of centers) {
    const key = hex(c.r, c.g, c.b);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }
  while (unique.length < k) unique.push(unique[unique.length - 1] || { r: 180, g: 160, b: 110 });
  return unique
    .map((c) => ({ hex: hex(c.r, c.g, c.b), lum: round(lum(c) / 255), sat: round(sat(c)) }))
    .sort((a, b) => a.lum - b.lum);
}

/** Five hex colours, dark to light, from the same 36px-wide sample Journeys uses. */
export async function extractPalette(file) {
  const meta = await sharp(file).metadata();
  const width = meta.width;
  const height = meta.height;
  const sampleW = 36;
  const sampleH = Math.max(16, Math.round((36 * height) / width));
  const rgb = await sharp(file).resize(sampleW, sampleH, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const pixels = [];
  for (let i = 0; i < rgb.length; i += 3) pixels.push({ r: rgb[i], g: rgb[i + 1], b: rgb[i + 2] });
  return kmeans(pixels, 5).map((c) => c.hex);
}

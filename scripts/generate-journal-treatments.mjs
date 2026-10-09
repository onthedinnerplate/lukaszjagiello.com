// Builds lib/journalTreatments.json: a deterministic sliced-panel layout and a
// 5-colour palette for each journal photograph. Cuts are placed around the
// subject (focus point, else the highest-detail region) so the main subject
// sits inside one tall strip instead of being split. No image files are written.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { articles } from '../lib/articles.js';
import { photos } from '../lib/photos.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COLS = 16;
const ROWS = 12;

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
function parseFocus(focus) {
  if (!focus) return null;
  const m = String(focus).match(/([\d.]+)%\s+([\d.]+)%/);
  return m ? { x: Number(m[1]) / 100, y: Number(m[2]) / 100 } : null;
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

async function analyse(file) {
  const meta = await sharp(file).metadata();
  const width = meta.width;
  const height = meta.height;
  const fineW = COLS * 4;
  const fineH = ROWS * 4;
  const grey = await sharp(file).resize(fineW, fineH, { fit: 'fill' }).greyscale().raw().toBuffer();
  const sal = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const vals = [];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) vals.push(grey[(row * 4 + y) * fineW + (col * 4 + x)]);
      }
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
      sal.push({ col, row, mean, variance });
    }
  }
  const maxV = Math.max(...sal.map((c) => c.variance)) || 1;
  for (const c of sal) c.score = c.variance / maxV;

  const sampleW = 36;
  const sampleH = Math.max(16, Math.round((36 * height) / width));
  const rgb = await sharp(file).resize(sampleW, sampleH, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const pixels = [];
  for (let i = 0; i < rgb.length; i += 3) pixels.push({ r: rgb[i], g: rgb[i + 1], b: rgb[i + 2] });
  return { width, height, sal, palette: kmeans(pixels, 5), portrait: height > width };
}

function cell(sal, col, row) {
  return sal[row * COLS + col];
}

function subjectBox(sal, focus) {
  const fx = focus ? clamp(Math.floor(focus.x * COLS), 0, COLS - 1) : null;
  const fy = focus ? clamp(Math.floor(focus.y * ROWS), 0, ROWS - 1) : null;
  let peak = sal[0];
  let peakScore = -1;
  for (const c of sal) {
    const nx = (c.col + 0.5) / COLS;
    const ny = (c.row + 0.5) / ROWS;
    const edge = Math.min(nx, ny, 1 - nx, 1 - ny);
    const edgePenalty = edge < 0.08 ? 0.25 : 1;
    const center = 1 - Math.min(1, Math.hypot((nx - 0.5) * 1.3, (ny - 0.48) * 1.5)) * 0.55;
    const focusBoost = fx == null ? 0 : Math.max(0, 1 - (Math.abs(c.col - fx) + Math.abs(c.row - fy)) / 5) * 0.85;
    const score = c.score * edgePenalty * (fx == null ? center : 1) + focusBoost;
    if (score > peakScore) {
      peakScore = score;
      peak = c;
    }
  }
  const sx = fx ?? peak.col;
  const sy = fy ?? peak.row;
  const thresh = 0.42;
  let c0 = sx;
  let c1 = sx;
  let r0 = sy;
  let r1 = sy;
  for (let col = sx; col >= 0; col--) {
    if (cell(sal, col, sy).score < thresh && sx - col > 1) break;
    c0 = col;
  }
  for (let col = sx; col < COLS; col++) {
    if (cell(sal, col, sy).score < thresh && col - sx > 1) break;
    c1 = col;
  }
  for (let row = sy; row >= 0; row--) {
    if (cell(sal, sx, row).score < thresh && sy - row > 1) break;
    r0 = row;
  }
  for (let row = sy; row < ROWS; row++) {
    if (cell(sal, sx, row).score < thresh && row - sy > 1) break;
    r1 = row;
  }
  return {
    x: c0 / COLS,
    y: r0 / ROWS,
    w: (c1 - c0 + 1) / COLS,
    h: (r1 - r0 + 1) / ROWS,
    cx: (sx + 0.5) / COLS,
    cy: (sy + 0.5) / ROWS,
  };
}

function regionMean(sal, x, y, w, h) {
  let n = 0;
  let s = 0;
  for (const c of sal) {
    const cx = (c.col + 0.5) / COLS;
    const cy = (c.row + 0.5) / ROWS;
    if (cx >= x && cx < x + w && cy >= y && cy < y + h) {
      s += c.mean;
      n++;
    }
  }
  return n ? s / n : 0;
}

function panel(x, y, w, h, shape, hero = false) {
  return { x: round(x), y: round(y), w: round(w), h: round(h), shape, hero };
}

/**
 * Hero strip always covers the subject box, full height, so the subject is
 * not cut. Templates only change how the strips beside it are divided.
 */
function panelsFor(template, subject) {
  const minW = template === 'portraitStrips' ? 0.32 : 0.26;
  let x0 = clamp(subject.x - 0.03, 0.02, 0.62);
  let x1 = clamp(subject.x + subject.w + 0.04, x0 + minW, 0.9);
  if (x1 - x0 < minW) x1 = x0 + minW;
  if (template === 'centerStrip') {
    x0 = clamp(subject.cx - 0.15, 0.3, 0.46);
    x1 = x0 + 0.28;
  }
  if (template === 'stackedRight') {
    x0 = clamp(subject.cx - 0.1, 0.52, 0.66);
    x1 = Math.min(0.92, x0 + Math.max(minW, subject.w + 0.08));
  }
  const hero = panel(x0, 0, x1 - x0, 1, 'rect', true);
  const panels = [hero];
  const left = x0;
  const rightX = x1;
  const right = 1 - rightX;

  if (template === 'centerStrip') {
    if (left > 0.08) {
      panels.push(panel(0, 0, left, 0.44, 'rect'));
      panels.push(panel(0, 0.44, left, 0.56, 'rect'));
    }
    if (right > 0.08) {
      panels.push(panel(rightX, 0, right, 0.38, 'rect'));
      panels.push(panel(rightX, 0.38, right, 0.62, 'circle'));
    }
  } else if (template === 'stackedRight') {
    if (left > 0.1) {
      panels.push(panel(0, 0, left, 0.3, 'rect'));
      panels.push(panel(0, 0.3, left * 0.58, 0.7, 'rect'));
      panels.push(panel(left * 0.58, 0.3, left * 0.42, 0.7, 'square'));
    }
    if (right > 0.06) panels.push(panel(rightX, 0.06, right, 0.88, 'rect'));
  } else if (template === 'sideBars') {
    if (left > 0.08) panels.push(panel(0, 0, left, 1, 'rect'));
    if (right > 0.1) {
      panels.push(panel(rightX, 0, right, 0.36, 'rect'));
      panels.push(panel(rightX, 0.36, right * 0.62, 0.4, 'rect'));
      panels.push(panel(rightX + right * 0.62, 0.36, right * 0.38, 0.4, 'square'));
      panels.push(panel(rightX, 0.76, right, 0.24, 'circle'));
    }
  } else {
    if (left > 0.06) panels.push(panel(0, 0, left, 1, 'rect'));
    if (right > 0.08) {
      panels.push(panel(rightX, 0, right, 0.58, 'rect'));
      panels.push(panel(rightX, 0.58, right, 0.42, 'circle'));
    }
  }

  return panels.filter((p) => p.w > 0.05 && p.h > 0.05);
}

function blocksFor(template, palette) {
  const colors = palette.filter((_, i) => i !== palette.length - 1);
  const a = colors[1]?.hex || palette[0].hex;
  const b = colors[Math.min(2, colors.length - 1)]?.hex || palette[1].hex;
  const presets = {
    centerStrip: [
      { x: -0.06, y: 0.04, w: 0.16, h: 0.13, color: a },
      { x: 0.9, y: 0.78, w: 0.12, h: 0.16, color: b },
    ],
    stackedRight: [
      { x: -0.05, y: 0.72, w: 0.14, h: 0.18, color: a },
      { x: 0.86, y: -0.04, w: 0.12, h: 0.12, color: b },
    ],
    sideBars: [
      { x: -0.04, y: 0.4, w: 0.1, h: 0.16, color: a },
      { x: 0.92, y: 0.18, w: 0.1, h: 0.22, color: b },
    ],
    leftHero: [
      { x: 0.84, y: 0.06, w: 0.14, h: 0.12, color: a },
      { x: -0.05, y: 0.8, w: 0.12, h: 0.14, color: b },
    ],
    portraitStrips: [
      { x: 0.78, y: -0.05, w: 0.16, h: 0.1, color: a },
      { x: -0.06, y: 0.84, w: 0.14, h: 0.12, color: b },
    ],
  };
  return presets[template] || presets.centerStrip;
}

const out = {};
const analysed = [];
for (const article of articles) {
  const rel = article.expectSrc.replace(/^\//, '');
  const file = path.join(root, 'public', rel);
  const info = await analyse(file);
  const focus = parseFocus(photos.find((p) => `/${p.src}` === article.expectSrc)?.focus);
  const subject = subjectBox(info.sal, focus);
  analysed.push({ slug: article.slug, info, subject, portrait: info.portrait });
}

const portraits = analysed.filter((a) => a.portrait);
const landscapes = analysed.filter((a) => !a.portrait).sort((a, b) => a.subject.cx - b.subject.cx);
const landTemplates = ['sideBars', 'centerStrip', 'stackedRight'];
landscapes.forEach((item, i) => {
  item.template = landTemplates[i] || 'centerStrip';
});
portraits.forEach((item) => {
  item.template = 'portraitStrips';
});

for (const item of analysed) {
  const panels = panelsFor(item.template, item.subject).map((p) => ({
    ...p,
    mean: round(regionMean(item.info.sal, p.x, p.y, p.w, p.h)),
  }));
  const nonHero = panels.filter((p) => !p.hero);
  const overlay = (nonHero.length ? nonHero : panels).reduce((a, b) => (a.mean >= b.mean ? a : b));
  overlay.overlay = true;
  const palette = item.info.palette.map((c) => c.hex);
  const overlayCandidates = item.info.palette.filter((c) => c.lum >= 0.18 && c.lum <= 0.82);
  const overlayColor = [...(overlayCandidates.length ? overlayCandidates : item.info.palette)].sort((a, b) => b.sat - a.sat)[0].hex;
  out[item.slug] = {
    template: item.template,
    portrait: item.portrait,
    subject: { x: round(item.subject.cx), y: round(item.subject.cy) },
    palette,
    overlay: overlayColor,
    blocks: blocksFor(item.template, item.info.palette),
    panels: panels.map(({ mean, ...p }) => p),
  };
  console.log(
    `${item.slug} template=${item.template} subject=${item.subject.cx.toFixed(2)},${item.subject.cy.toFixed(2)} panels=${panels.length} palette=${palette.join(' ')} overlay=${overlayColor}`,
  );
}

const dest = path.join(root, 'lib', 'journalTreatments.json');
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(`wrote ${dest}`);

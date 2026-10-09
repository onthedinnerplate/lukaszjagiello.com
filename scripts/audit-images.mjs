// Byte, pixel, and display-size audit for homepage + gallery images.
//
//   node scripts/audit-images.mjs
//
// Display widths are the CSS slot at 1440 and 390 (border-box, gutter
// clamp(16px, 4vw, 40px)). Retina need is that slot × 2. A use is "upscaled"
// when the file the browser would pick is narrower than the retina need, and
// "oversize" when the only candidate is more than 2.2× the retina need.

import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { photos } from '../lib/photos.js';
import { site } from '../lib/site.js';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const pub = path.join(root, 'public');

const readJson = (rel) => {
  const file = path.join(root, rel);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

const fullReport = readJson('lib/encode-report-fulls.json');
const thumbReport = readJson('lib/encode-report-thumbs.json');
const heroReport = readJson('lib/encode-report-hero.json');

const kb = (n) => Math.round(n / 1024);
const pad = (n) => String(n).padStart(2, '0');

async function info(rel) {
  const file = rel.startsWith('private/') ? path.join(root, rel) : path.join(pub, rel.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  const meta = await sharp(file).metadata();
  const bytes = statSync(file).size;
  return {
    rel,
    width: meta.width,
    height: meta.height,
    bytes,
    format: meta.format,
    space: meta.space,
    profile: Boolean(meta.hasProfile || meta.icc),
    exif: Boolean(meta.exif),
    bpp: +((bytes * 8) / (meta.width * meta.height)).toFixed(2),
  };
}

function pick(candidates, needPx) {
  const sized = candidates.filter(Boolean).sort((a, b) => a.width - b.width);
  if (!sized.length) return null;
  return sized.find((c) => c.width >= needPx) || sized[sized.length - 1];
}

const home = site.homeFeatured;
const collage = home.slice(0, site.heroCount);

// CSS slot widths (px) derived from the modules. See the component comments.
const slots = {
  collageTile: { w1440: 221, w390: 173 },
  collageWide: { w1440: 221, w390: 358 },
  spotlight: { w1440: 520, w390: 0 },
  featured: { w1440: 427, w390: 358 },
  gallery: { w1440: 440, w390: 358 },
  lightbox: { w1440: 1360, w390: 358 },
};

const rows = [];
const problems = [];

function note(file, problem) {
  problems.push({ file, problem });
}

for (const p of photos) {
  const n = Number(p.src.match(/(\d+)-full/)[1]);
  const nn = pad(n);
  const full = await info(p.src);
  const avif = await info(p.src.replace(/\.webp$/, '.avif'));
  const edges = [400, 800, 1200, 1920];
  const thumbs = {};
  for (const edge of edges) {
    const rel = edge === 800 ? p.thumb : p.thumb.replace(/-thumb\.webp$/, `-thumb-${edge}.webp`);
    thumbs[edge] = await info(rel);
  }
  const q = fullReport?.fulls?.[nn];
  const tq = thumbReport?.photos?.[nn];

  const contexts = [];
  if (collage.includes(n)) {
    const wide = collage[collage.length - 1] === n;
    contexts.push(wide ? 'collage-wide' : 'collage', 'featured', 'gallery', 'lightbox');
  } else if (home.includes(n)) {
    contexts.push('featured', 'gallery', 'lightbox');
  } else {
    contexts.push('gallery', 'lightbox');
  }

  const candidates = Object.values(thumbs);
  const fullCandidates = [full, avif].filter(Boolean);

  for (const ctx of contexts) {
    const slot = ctx === 'collage' ? slots.collageTile
      : ctx === 'collage-wide' ? slots.collageWide
      : ctx === 'featured' ? slots.featured
      : ctx === 'gallery' ? slots.gallery
      : slots.lightbox;
    const pool = ctx === 'lightbox' ? fullCandidates : candidates;
    const at = (css) => {
      if (!css) return null;
      const chosen = pick(pool, css * 2);
      return chosen ? { file: path.basename(chosen.rel), width: chosen.width, kb: kb(chosen.bytes), short: chosen.width < css * 2 } : null;
    };
    const d1440 = at(slot.w1440);
    const d390 = at(slot.w390);
    if (d1440?.short) note(`${nn} ${ctx}`, `retina upscale at 1440: ${d1440.file} is ${d1440.width}px, slot ${slot.w1440} CSS needs ${slot.w1440 * 2}`);
    if (d390?.short) note(`${nn} ${ctx}`, `retina upscale at 390: ${d390.file} is ${d390.width}px, slot ${slot.w390} CSS needs ${slot.w390 * 2}`);
    if (ctx !== 'lightbox' && d1440 && full && d1440.width > slot.w1440 * 2 * 2.2) {
      note(`${nn} ${ctx}`, `oversize at 1440: serving ${d1440.width}px into a ${slot.w1440} CSS slot`);
    }
  }

  if (full?.exif || full?.profile) note(nn, 'full still has metadata or an embedded profile');
  if (q?.webpQuality != null && q.webpQuality < 40) note(nn, `webp quality ${q.webpQuality} is still low`);
  for (const edge of edges) if (!thumbs[edge]) note(nn, `missing thumb-${edge}`);

  rows.push({
    n: nn,
    title: p.title,
    full: full && `${full.width}×${full.height} ${kb(full.bytes)}KB webp q${q?.webpQuality ?? '?'} ${full.bpp}bpp`,
    avif: avif ? `${avif.width}×${avif.height} ${kb(avif.bytes)}KB avif q${q?.avifQuality ?? '?'}` : '',
    thumbs: edges.map((e) => thumbs[e] ? `${e}:${thumbs[e].width}×${thumbs[e].height}/${kb(thumbs[e].bytes)}KB${tq?.variants?.[e] ? ` q${tq.variants[e].quality}` : ''}` : `${e}:MISSING`).join(' '),
    where: contexts.join(', '),
  });
}

const heroFiles = [];
for (const w of [1280, 1920, 2560]) {
  for (const ext of ['webp', 'avif']) {
    const rel = `images/hero/lukasz-jagiello-hero-${w}.${ext}`;
    const meta = await info(rel);
    heroFiles.push(meta ? `${w}.${ext} ${meta.width}×${meta.height} ${kb(meta.bytes)}KB q${heroReport?.variants?.[w]?.[ext === 'webp' ? 'webpQuality' : 'avifQuality'] ?? '?'}` : `${w}.${ext} MISSING`);
  }
}

let fullBytes = 0;
let thumbBytes = 0;
let avifBytes = 0;
let t1920 = 0;
for (const p of photos) {
  fullBytes += statSync(path.join(pub, p.src)).size;
  const avifPath = path.join(pub, p.src.replace(/\.webp$/, '.avif'));
  if (existsSync(avifPath)) avifBytes += statSync(avifPath).size;
  for (const edge of [400, 800, 1200, 1920]) {
    const rel = edge === 800 ? p.thumb : p.thumb.replace(/-thumb\.webp$/, `-thumb-${edge}.webp`);
    const file = path.join(pub, rel);
    if (!existsSync(file)) continue;
    const b = statSync(file).size;
    thumbBytes += b;
    if (edge === 1920) t1920 += b;
  }
}

const summary = {
  fullWebpKB: kb(fullBytes),
  fullAvifKB: kb(avifBytes),
  thumbsKB: kb(thumbBytes),
  thumb1920KB: kb(t1920),
  hero: heroFiles,
  problemCount: problems.length,
};

console.log(JSON.stringify({ summary, problems, rows }, null, 2));

// Regenerates gallery thumbnails from the full-size lightbox WebPs.
//
// The grid serves these files directly (next/image is unoptimized), with an
// explicit srcSet of three long-edge sizes:
//   *-thumb-400.webp   400px
//   *-thumb.webp        800px  (unchanged filename)
//   *-thumb-1200.webp  1200px
//
// WebP quality 80, effort 6. Budgets are approximate: 400 ≈ 15–40 KB,
// 800 ≈ 30–160 KB, 1200 ≈ 80–300 KB.
//
//   npm run thumbs
//   npm run thumbs -- --quality=85
//
// `--size` still overrides the middle (800) variant's long edge. Leave it at
// 800 so the gallery srcSet widths stay correct.
//
// Run this locally, then commit public/images/gallery/*-thumb*.webp.

import { existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos } from '../lib/photos.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const LEGACY_SIZE = arg('size', 800);
const QUALITY = arg('quality', 80);

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const variantsFor = (thumbRel) => [
  { edge: 400, budget: 40 * 1024, rel: thumbRel.replace(/-thumb\.webp$/, '-thumb-400.webp') },
  { edge: LEGACY_SIZE, budget: 160 * 1024, rel: thumbRel },
  { edge: 1200, budget: 300 * 1024, rel: thumbRel.replace(/-thumb\.webp$/, '-thumb-1200.webp') },
];

let ok = 0;
let failed = 0;
let before = 0;
let after = 0;

for (const p of photos) {
  const src = path.join(root, p.src);
  if (!existsSync(src)) {
    console.error(`✗ ${p.thumb}: source missing (${p.src})`);
    failed++;
    continue;
  }

  for (const variant of variantsFor(p.thumb)) {
    const out = path.join(root, variant.rel);
    const name = path.basename(out);
    try {
      const oldSize = existsSync(out) ? statSync(out).size : 0;
      before += oldSize;

      // Start at the requested quality and step down only when a frame misses
      // its approximate size budget. Dimensions stay on the long-edge target.
      let quality = QUALITY;
      let buf = await sharp(src)
        .rotate()
        .resize({ width: variant.edge, height: variant.edge, fit: 'inside', withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();
      while (buf.length > variant.budget && quality > 60) {
        quality -= 4;
        buf = await sharp(src)
          .rotate()
          .resize({ width: variant.edge, height: variant.edge, fit: 'inside', withoutEnlargement: true })
          .webp({ quality, effort: 6 })
          .toBuffer();
      }
      writeFileSync(out, buf);
      const meta = await sharp(buf).metadata();

      after += buf.length;
      ok++;
      const qNote = quality === QUALITY ? '' : `  q${quality}`;
      const over = buf.length > variant.budget ? `  over ~${kb(variant.budget)} budget` : '';
      console.log(`✓ ${name}  ${meta.width}×${meta.height}  ${kb(oldSize)} → ${kb(buf.length)}${qNote}${over}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${name}: ${err.message}`);
    }
  }
}

console.log(`\n${ok} thumbnails written, ${failed} failed. Total ${kb(before)} → ${kb(after)}.`);
if (failed) process.exitCode = 1;

// Regenerates the gallery thumbnails from the full-size lightbox WebPs.
//
// The grid serves thumbs directly (no on-demand optimizer), so they need to be
// large enough for a desktop column (~450–500px CSS, 2x on retina). Default is
// 800px on the long edge, WebP quality 80. Filenames are unchanged, so nothing
// in lib/photos.js needs to be touched afterwards.
//
//   npm run thumbs                 # all 46, 800px long edge
//   npm run thumbs -- --size=1000  # different long edge
//   npm run thumbs -- --quality=85 # different WebP quality
//
// Run this locally, then commit the updated public/images/gallery/*-thumb.webp.

import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos } from '../lib/photos.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const SIZE = arg('size', 800);
const QUALITY = arg('quality', 80);

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

let ok = 0;
let failed = 0;
let before = 0;
let after = 0;

for (const p of photos) {
  const src = path.join(root, p.src);
  const out = path.join(root, p.thumb);
  const name = path.basename(out);

  if (!existsSync(src)) {
    console.error(`✗ ${name}: source missing (${p.src})`);
    failed++;
    continue;
  }

  try {
    const oldSize = existsSync(out) ? statSync(out).size : 0;
    before += oldSize;

    const info = await sharp(src)
      .rotate() // honour EXIF orientation if any survived
      .resize({ width: SIZE, height: SIZE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);

    after += info.size;
    ok++;
    console.log(`✓ ${name}  ${info.width}×${info.height}  ${kb(oldSize)} → ${kb(info.size)}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}: ${err.message}`);
  }
}

console.log(`\n${ok} thumbnails written, ${failed} failed. Total ${kb(before)} → ${kb(after)}.`);
if (failed) process.exitCode = 1;

// Option A — re-encode the existing 1600px lightbox WebPs in place.
//
// The fulls are already capped at 1600px on the long edge, so this script does
// not resize them and does not need the RAW/JPEG originals (that would be
// option B). Each file is decoded and written back as WebP quality 80, effort 6.
// If the result is over 500 KB, quality steps down until it fits. Pixel
// dimensions are checked and left unchanged.
//
// Files already under 500 KB are left untouched, so running the script again
// does not recompress them.
//
//   npm run fulls
//
// Run this locally, then `npm run thumbs` so thumbnails derive from the new fulls.

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos } from '../lib/photos.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const MAX_BYTES = 500 * 1024;
const START_QUALITY = 80;
// A few foliage frames stay large even at moderate quality. The floor is low
// so every 1600px full can land under 500 KB without resizing (option A).
const MIN_QUALITY = 10;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function encode(input, quality) {
  return sharp(input).rotate().webp({ quality, effort: 6 }).toBuffer();
}

let ok = 0;
let kept = 0;
let failed = 0;

for (const p of photos) {
  const file = path.join(root, p.src);
  const name = path.basename(file);

  if (!existsSync(file)) {
    console.error(`✗ ${name}: source missing (${p.src})`);
    failed++;
    continue;
  }

  try {
    const original = readFileSync(file);
    const before = await sharp(original).metadata();

    // Already under the budget: leave the bytes alone so a second run does not
    // recompress an image that was encoded on a previous pass.
    if (original.length < MAX_BYTES) {
      kept++;
      console.log(`• ${name}  kept ${before.width}×${before.height}  ${kb(original.length)}`);
      continue;
    }

    let quality = START_QUALITY;
    let buf = await encode(original, quality);
    while (buf.length >= MAX_BYTES && quality > MIN_QUALITY) {
      const ratio = buf.length / MAX_BYTES;
      const drop = ratio > 1.6 ? 8 : ratio > 1.25 ? 4 : 2;
      quality = Math.max(MIN_QUALITY, quality - drop);
      buf = await encode(original, quality);
    }

    const after = await sharp(buf).metadata();
    if (after.width !== before.width || after.height !== before.height) {
      console.error(`✗ ${name}: dimensions changed ${before.width}×${before.height} → ${after.width}×${after.height}; not written`);
      failed++;
      continue;
    }

    if (buf.length >= MAX_BYTES) {
      console.error(`✗ ${name}: still ${kb(buf.length)} at q${quality} (limit 500 KB)`);
      failed++;
      continue;
    }

    const tmp = `${file}.tmp`;
    writeFileSync(tmp, buf);
    renameSync(tmp, file);
    ok++;
    console.log(`✓ ${name}  q${quality}  ${after.width}×${after.height}  ${kb(original.length)} → ${kb(buf.length)}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}: ${err.message}`);
  }
}

console.log(`\nOption A: ${ok} fulls re-encoded, ${kept} kept (already under 500 KB), ${failed} failed.`);
if (failed) process.exitCode = 1;

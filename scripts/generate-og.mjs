// 1200×630 JPEG link-preview images, one per photograph.
//
// Cropped from the lightbox full with sharp cover + attention. Portrait frames
// lose top and bottom; that's expected for a link card. Set `ogFocus` on a photo
// in lib/photos.js to 'top' | 'center' | 'bottom' when attention cuts the subject.
// Quality starts at 82 and steps down until the file is under 300 KB.
//
//   npm run og
//
// Commit the files in public/images/og/. They are not generated at request time.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos } from '../lib/photos.js';
import { photoNumberFromSrc } from '../lib/photoCaption.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const outDir = path.join(root, 'images', 'og');
const MAX_BYTES = 300 * 1024;
const START_QUALITY = 82;
const MIN_QUALITY = 50;

const FOCUS = {
  top: 'north',
  center: 'centre',
  centre: 'centre',
  bottom: 'south',
};

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

mkdirSync(outDir, { recursive: true });

let ok = 0;
let failed = 0;

for (const p of photos) {
  const n = photoNumberFromSrc(p.src);
  const nn = n ? String(n).padStart(2, '0') : null;
  const name = nn ? `lukasz-jagiello-${nn}.jpg` : null;
  const src = path.join(root, p.src);

  if (!nn || !existsSync(src)) {
    console.error(`✗ ${p.title}: source missing (${p.src})`);
    failed++;
    continue;
  }

  const position = p.ogFocus ? FOCUS[p.ogFocus] || p.ogFocus : 'attention';

  try {
    let quality = START_QUALITY;
    let buf = await sharp(src)
      .rotate()
      .resize(1200, 630, { fit: 'cover', position })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    while (buf.length > MAX_BYTES && quality > MIN_QUALITY) {
      quality -= 4;
      buf = await sharp(src)
        .rotate()
        .resize(1200, 630, { fit: 'cover', position })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    const meta = await sharp(buf).metadata();
    if (meta.width !== 1200 || meta.height !== 630) {
      console.error(`✗ ${name}: expected 1200×630, got ${meta.width}×${meta.height}`);
      failed++;
      continue;
    }
    if (buf.length > MAX_BYTES) {
      console.error(`✗ ${name}: still ${kb(buf.length)} at q${quality} (limit 300 KB)`);
      failed++;
      continue;
    }

    writeFileSync(path.join(outDir, name), buf);
    ok++;
    const focusNote = p.ogFocus ? ` focus=${p.ogFocus}` : '';
    console.log(`✓ ${name}  q${quality}  1200×630  ${kb(buf.length)}${focusNote}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}: ${err.message}`);
  }
}

console.log(`\n${ok} OG images written, ${failed} failed.`);
if (failed) process.exitCode = 1;

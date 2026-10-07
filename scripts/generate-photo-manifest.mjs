// Measures every photo ONCE and writes lib/photo-manifest.json:
//   { photos: { "images/gallery/lightbox/...-full.webp": { width, height, color, thumbWidth, thumbHeight } }, hero: {...} }
//
// Runs in "prebuild" so `getPhotos()` can read dimensions synchronously during
// `next build`. Measuring inside getStaticProps was the cause of the build
// timing out: Next renders pages in ~11 worker processes, each would decode
// all 92 files (sharp.stats() fully decodes to find the dominant colour), and
// every page hit the 60 s static-generation limit on Render's instance.
//
//   npm run manifest

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos, hero } from '../lib/photos.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const out = path.join(root, 'lib', 'photo-manifest.json');

const toHex = ({ r, g, b }) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

async function measure(rel, withColor) {
  const img = sharp(path.join(pub, rel));
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error(`Could not read dimensions of ${rel}`);
  if (!withColor) return { width, height };
  const { dominant } = await img.stats();
  return { width, height, color: toHex(dominant) };
}

const manifest = { photos: {}, hero: null };
let failed = 0;
for (const p of photos) {
  try {
    const full = await measure(p.src, true);
    const thumb = await measure(p.thumb, false);
    manifest.photos[p.src] = { ...full, thumbWidth: thumb.width, thumbHeight: thumb.height };
  } catch (err) {
    failed++;
    console.error(`✗ ${p.src}: ${err.message}`);
  }
}
try {
  manifest.hero = await measure(hero.src, true);
} catch (err) {
  failed++;
  console.error(`✗ hero ${hero.src}: ${err.message}`);
}

writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(`photo-manifest.json: ${Object.keys(manifest.photos).length} photos${manifest.hero ? ' + hero' : ''} measured, ${failed} failed.`);
if (failed) process.exitCode = 1;

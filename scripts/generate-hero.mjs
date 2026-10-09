// Homepage hero banner, a bottom crop of photo 41 (DSC05293, Marymere Falls).
//
// The committed 1200×550 file matches photo 41's full-resolution JPEG (plaintext
// full.jpg, or full.jpg.enc decrypted with DOWNLOAD_FILES_KEY) cropped to
// the bottom at the same 1200:550 aspect (mean error ~2.6/255). These variants
// are downscales of that JPEG — never an upscale of the 1200px file.
//
//   images/hero/lukasz-jagiello-hero-{1280,1920,2560}.webp
//   images/hero/lukasz-jagiello-hero-{1280,1920,2560}.avif
//
// WebP and AVIF, sRGB, metadata stripped, mild sharpen. The 1920 WebP is also
// what lib/photos.js points at.
//
//   npm run hero

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDownloadPlaintext } from '../lib/download-crypto.js';
import { bestUnder, encodeAvif, encodeWebp, renderPixels } from './encode-utils.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'images', 'hero');
const sourcePath = path.join(root, 'private', 'downloads', '41', 'full.jpg');
const reportPath = path.join(root, 'lib', 'encode-report-hero.json');

// Same aspect as the historical 1200×550 banner.
const ASPECT = 1200 / 550;
const WIDTHS = [1280, 1920, 2560];
const CAP = 700 * 1024;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

let source;
try {
  source = readDownloadPlaintext(sourcePath);
} catch (err) {
  const why = err.code === 'NO_KEY' ? 'DOWNLOAD_FILES_KEY is not set' : 'could not read the paid original';
  console.error(`✗ hero: ${why}`);
  process.exit(1);
}
if (!source) {
  console.error(`✗ hero: needs the original from the owner (missing ${path.relative(root, sourcePath)})`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const hero = {};
let failed = 0;

for (const width of WIDTHS) {
  const height = Math.round(width / ASPECT);
  try {
    const raw = await renderPixels(source, { width, height, fit: 'cover', position: 'south' });
    if (raw.info.width !== width || raw.info.height !== height) {
      throw new Error(`got ${raw.info.width}×${raw.info.height}, expected ${width}×${height}`);
    }
    const webp = await bestUnder((q) => encodeWebp(raw, q), CAP, 60, 80);
    const avif = await bestUnder((q) => encodeAvif(raw, q), CAP, 40, 55);
    if (!webp || !avif) throw new Error(`could not fit under ${kb(CAP)}`);
    const base = path.join(outDir, `lukasz-jagiello-hero-${width}`);
    writeFileSync(`${base}.webp`, webp.buf);
    writeFileSync(`${base}.avif`, avif.buf);
    hero[width] = {
      width: raw.info.width,
      height: raw.info.height,
      webpQuality: webp.quality,
      webpBytes: webp.buf.length,
      avifQuality: avif.quality,
      avifBytes: avif.buf.length,
    };
    console.log(`✓ hero-${width}  ${width}×${height}  webp q${webp.quality} ${kb(webp.buf.length)}  avif q${avif.quality} ${kb(avif.buf.length)}`);
  } catch (err) {
    failed++;
    console.error(`✗ hero-${width}: ${err.message}`);
  }
}

writeFileSync(reportPath, JSON.stringify({
  source: existsSync(sourcePath) ? 'private/downloads/41/full.jpg' : 'private/downloads/41/full.jpg.enc',
  originalFile: 'DSC05293-Enhanced-NR.jpg',
  crop: 'cover, position south, aspect 1200/550 (matches the previous banner)',
  sizes: '(max-width: 1400px) 100vw, 1400px',
  color: 'sRGB, metadata stripped',
  variants: hero,
}, null, 2) + '\n');

if (failed) process.exitCode = 1;

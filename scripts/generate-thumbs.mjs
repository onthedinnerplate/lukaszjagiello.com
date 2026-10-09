// Gallery thumbnails from the committed camera JPEGs (not the lightbox WebPs,
// which are already compressed — the foliage fulls especially).
//
// Long-edge variants, served directly because next/image stays unoptimized:
//   *-thumb-400.webp    400px
//   *-thumb.webp         800px   (unchanged filename)
//   *-thumb-1200.webp  1200px
//   *-thumb-1920.webp  1920px   retina grid: a 2:3 portrait at 1200px long is
//                               only ~800px wide, short of a 1440px 3-column
//                               layout at 2x. 1920px long clears that.
//
// WebP quality 80, effort 6, smartSubsample, mild sharpen on the downscale,
// sRGB, metadata stripped. Quality steps down only to 68, and only to meet the
// budget — a soft thumb is a worse miss than a few extra kilobytes.
//
//   npm run thumbs
//   npm run thumbs -- --only=28,34
//
// Then `npm run manifest`.

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { photos } from '../lib/photos.js';
import { encodeWebp, renderPixels } from './encode-utils.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const downloads = path.join(root, 'private', 'downloads');
const reportPath = path.join(root, 'lib', 'encode-report-thumbs.json');

const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.split('=')[1].split(',').map((s) => s.padStart(2, '0'))) : null;

const QUALITY = 80;
const FLOOR = 68;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const variantsFor = (thumbRel) => [
  { edge: 400, budget: 48 * 1024, rel: thumbRel.replace(/-thumb\.webp$/, '-thumb-400.webp') },
  { edge: 800, budget: 180 * 1024, rel: thumbRel },
  { edge: 1200, budget: 340 * 1024, rel: thumbRel.replace(/-thumb\.webp$/, '-thumb-1200.webp') },
  { edge: 1920, budget: 520 * 1024, rel: thumbRel.replace(/-thumb\.webp$/, '-thumb-1920.webp') },
];

const report = {};
let ok = 0;
let failed = 0;
let before = 0;
let after = 0;

for (const p of photos) {
  const nn = p.src.match(/(\d+)-full/)[1];
  if (only && !only.has(nn)) continue;
  const jpeg = path.join(downloads, nn, 'full.jpg');
  const source = existsSync(jpeg) ? jpeg : path.join(pub, p.src);
  if (!existsSync(source)) {
    failed++;
    console.error(`✗ ${nn}: no JPEG and no full`);
    continue;
  }
  const fromOriginal = source === jpeg;

  for (const variant of variantsFor(p.thumb)) {
    const out = path.join(pub, variant.rel);
    const name = path.basename(out);
    try {
      const oldSize = existsSync(out) ? statSync(out).size : 0;
      before += oldSize;
      const raw = await renderPixels(source, {
        width: variant.edge,
        height: variant.edge,
        fit: 'inside',
      });
      let quality = QUALITY;
      let buf = await encodeWebp(raw, quality);
      while (buf.length > variant.budget && quality > FLOOR) {
        quality -= 4;
        buf = await encodeWebp(raw, quality);
      }
      writeFileSync(out, buf);
      after += buf.length;
      ok++;
      if (!report[nn]) report[nn] = { source: path.relative(root, source), fromOriginal, variants: {} };
      report[nn].variants[variant.edge] = {
        quality,
        width: raw.info.width,
        height: raw.info.height,
        bytes: buf.length,
      };
      const qNote = quality === QUALITY ? '' : `  q${quality}`;
      const over = buf.length > variant.budget ? '  over budget' : '';
      console.log(`✓ ${name}  ${raw.info.width}×${raw.info.height}  ${kb(oldSize)} → ${kb(buf.length)}${qNote}${over}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${name}: ${err.message}`);
    }
  }
}

const prev = existsSync(reportPath) && only ? JSON.parse(readFileSync(reportPath, 'utf8')) : {};
const thumbs = {
  quality: QUALITY,
  floor: FLOOR,
  edges: [400, 800, 1200, 1920],
  sharpen: 'sigma 0.5 on downscale',
  color: 'sRGB, metadata stripped',
  photos: only ? { ...(prev.photos || {}), ...report } : report,
};
writeFileSync(reportPath, JSON.stringify(thumbs, null, 2) + '\n');

console.log(`\n${ok} thumbnails written, ${failed} failed. Total ${kb(before)} → ${kb(after)}.`);
if (failed) process.exitCode = 1;

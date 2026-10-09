// Lightbox fulls, regenerated from the committed camera JPEGs.
//
// Source: private/downloads/NN/full.jpg (q92, original pixel size). The published
// full keeps its current pixel size (1600px wide) so layout does not move.
// WebP quality starts at 80. Files that fit under 500 KB stay there. Frames that
// cannot hold quality 50 under 500 KB — the detailed foliage outliers — are
// allowed up to 700 KB and also get an AVIF sibling for browsers that send
// Accept: image/avif (everything in our browserslist).
//
//   npm run fulls
//   npm run fulls -- --only=28,34
//
// Then `npm run thumbs` (thumbs read the same JPEGs, not these WebPs) and
// `npm run manifest`.

import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos } from '../lib/photos.js';
import { bestUnder, encodeAvif, encodeWebp, renderPixels } from './encode-utils.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const downloads = path.join(root, 'private', 'downloads');
const reportPath = path.join(root, 'lib', 'encode-report-fulls.json');

const CAP = 500 * 1024;
const OUTLIER_CAP = 700 * 1024;
const START_Q = 80;
const FLOOR_Q = 50;
const ABS_FLOOR = 24;
const AVIF_MAX = 55;
const AVIF_MIN = 40;

const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.split('=')[1].split(',').map((s) => s.padStart(2, '0'))) : null;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

function writeAtomic(file, buf) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, buf);
  renameSync(tmp, file);
}

function mergeReport(fulls) {
  const prev = existsSync(reportPath) && only ? JSON.parse(readFileSync(reportPath, 'utf8')) : {};
  const prevFulls = prev.fulls || {};
  const next = {
    fulls: only ? { ...prevFulls, ...fulls } : fulls,
    fullSettings: {
      webp: { startQuality: START_Q, cap: CAP, outlierCap: OUTLIER_CAP, effort: 6, smartSubsample: true },
      avif: { minQuality: AVIF_MIN, maxQuality: AVIF_MAX, cap: OUTLIER_CAP, effort: 4 },
      sharpen: 'sigma 0.5 on downscale',
      color: 'sRGB, metadata stripped',
    },
  };
  writeFileSync(reportPath, JSON.stringify(next, null, 2) + '\n');
}

const report = {};
let ok = 0;
let failed = 0;

for (const p of photos) {
  const nn = p.src.match(/(\d+)-full/)[1];
  if (only && !only.has(nn)) continue;
  const dest = path.join(pub, p.src);
  const name = path.basename(dest);
  const jpeg = path.join(downloads, nn, 'full.jpg');

  if (!existsSync(jpeg)) {
    failed++;
    console.error(`✗ ${name}: needs the original from the owner (missing ${path.relative(root, jpeg)})`);
    report[nn] = { error: 'missing-original', source: path.relative(root, jpeg) };
    continue;
  }
  if (!existsSync(dest)) {
    failed++;
    console.error(`✗ ${name}: current full missing, so the target pixel size is unknown`);
    continue;
  }

  try {
    const current = await sharp(dest).metadata();
    const raw = await renderPixels(jpeg, {
      width: current.width,
      height: current.height,
      fit: 'fill',
    });
    if (raw.info.width !== current.width || raw.info.height !== current.height) {
      throw new Error(`dimensions ${raw.info.width}×${raw.info.height}, expected ${current.width}×${current.height}`);
    }

    let webp = await bestUnder((q) => encodeWebp(raw, q), CAP, FLOOR_Q, START_Q);
    let outlier = false;
    if (!webp) {
      outlier = true;
      webp = await bestUnder((q) => encodeWebp(raw, q), OUTLIER_CAP, ABS_FLOOR, START_Q);
    }
    if (!webp) {
      failed++;
      console.error(`✗ ${name}: could not fit under ${kb(OUTLIER_CAP)} even at q${ABS_FLOOR}`);
      continue;
    }

    let avif = null;
    const avifPath = dest.replace(/\.webp$/, '.avif');
    if (outlier || webp.quality < 60) {
      avif = await bestUnder((q) => encodeAvif(raw, q), OUTLIER_CAP, AVIF_MIN, AVIF_MAX);
      if (avif) writeAtomic(avifPath, avif.buf);
    } else if (existsSync(avifPath)) {
      // A previous outlier pass may have left an AVIF that this frame no longer needs.
      unlinkSync(avifPath);
    }

    writeAtomic(dest, webp.buf);
    ok++;
    report[nn] = {
      title: p.title,
      source: path.relative(root, jpeg),
      width: raw.info.width,
      height: raw.info.height,
      webpQuality: webp.quality,
      webpBytes: webp.buf.length,
      avifQuality: avif ? avif.quality : null,
      avifBytes: avif ? avif.buf.length : null,
      outlier,
    };
    const avifNote = avif ? `  avif q${avif.quality} ${kb(avif.buf.length)}` : '';
    const flag = outlier ? '  outlier cap 700KB' : '';
    console.log(`✓ ${name}  webp q${webp.quality}  ${raw.info.width}×${raw.info.height}  ${kb(webp.buf.length)}${avifNote}${flag}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}: ${err.message}`);
  }
}

mergeReport(report);
console.log(`\n${ok} fulls written, ${failed} failed.`);
if (failed) process.exitCode = 1;

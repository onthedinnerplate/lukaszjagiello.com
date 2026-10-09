// Build the paid download tiers from the original camera files.
//
//   npm run downloads -- --source="C:\Photography\porfolio\done"
//   npm run downloads -- --source=/path/to/originals --only=12,39
//
// For each photo NN in lib/originals.json, reads <source>/<original filename>
// and writes private/downloads/NN/{1080,2k,full}.jpg (see lib/store.js TIERS).
// 1080/2k are resized to the tier's long edge; full is the original re-encoded
// at quality 92 with metadata (EXIF/copyright) preserved. Existing outputs are
// skipped unless --force. Requires `sharp` (a devDependency of this repo).
//
// The .jpg files are plaintext and gitignored. Before committing, run
// `npm run encrypt-downloads` so the repo only contains .jpg.enc.

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { TIERS } from '../lib/store.js';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

if (!args.source) {
  console.error('Usage: npm run downloads -- --source=<folder of originals> [--only=1,2] [--force]');
  process.exit(1);
}

const originals = JSON.parse(readFileSync(new URL('../lib/originals.json', import.meta.url), 'utf8'));
const only = args.only ? new Set(String(args.only).split(',').map((s) => Number(s.trim()))) : null;
const outRoot = path.join(process.cwd(), 'private', 'downloads');

let done = 0;
let skipped = 0;
const missing = [];
const tooSmall = [];

for (const [num, filename] of Object.entries(originals)) {
  const n = Number(num);
  if (only && !only.has(n)) continue;
  const src = path.join(args.source, filename);
  if (!existsSync(src)) {
    missing.push(`${num} → ${filename}`);
    continue;
  }
  const dir = path.join(outRoot, String(n).padStart(2, '0'));
  mkdirSync(dir, { recursive: true });

  const meta = await sharp(src).metadata();
  const longEdge = Math.max(meta.width || 0, meta.height || 0);

  for (const tier of TIERS) {
    const out = path.join(dir, tier.file);
    if (existsSync(out) && !args.force) {
      skipped++;
      continue;
    }
    // Never sell a size the original can't fill: a 1600px source is not "2K".
    if (tier.longEdge && longEdge < tier.longEdge) {
      tooSmall.push(`${num} ${tier.label}: original is only ${longEdge}px`);
      continue;
    }
    let img = sharp(src, { failOn: 'none' }).rotate().withMetadata();
    if (tier.longEdge) img = img.resize({ width: tier.longEdge, height: tier.longEdge, fit: 'inside', withoutEnlargement: true });
    await img.jpeg({ quality: tier.longEdge ? 90 : 92, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(out);
    done++;
  }
  console.log(`✓ ${String(n).padStart(2, '0')}  ${filename}`);
}

console.log(`\n${done} files written, ${skipped} already present.`);
console.log('Plaintext JPEGs are gitignored. Encrypt them before committing: npm run encrypt-downloads');
if (tooSmall.length) console.warn(`\nSkipped (original too small for tier):\n  ${tooSmall.join('\n  ')}`);
if (missing.length) console.warn(`\nNot found in ${args.source}:\n  ${missing.join('\n  ')}`);

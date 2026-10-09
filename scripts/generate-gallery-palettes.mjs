// Writes lib/photoPalettes.json: five hex colours per gallery photo.
// Existing Journeys swatch data (journalShapes) is copied unchanged.
// A photo with no palette is extracted here with scripts/palette.mjs.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import shapes from '../lib/journalShapes.json' with { type: 'json' };
import { photos } from '../lib/photos.js';
import { extractPalette } from './palette.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = {};
const generated = [];

for (const photo of photos) {
  const match = photo.src.match(/lukasz-jagiello-(\d+)/);
  const num = match ? String(parseInt(match[1], 10)) : '';
  if (!num) throw new Error(`No photo number in ${photo.src}`);
  const existing = shapes[num]?.palette;
  if (Array.isArray(existing) && existing.length === 5) {
    out[num] = existing;
    continue;
  }
  const file = path.join(root, 'public', photo.src);
  const palette = await extractPalette(file);
  out[num] = palette;
  generated.push({ num, title: photo.title, palette });
}

const dest = path.join(root, 'lib', 'photoPalettes.json');
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
if (generated.length === 0) {
  console.log('gallery palettes: generated none; every photo already had a 5-color swatch');
} else {
  for (const item of generated) {
    console.log(`generated photo ${item.num} ${item.title}: ${item.palette.join(' ')}`);
  }
}
console.log(`wrote ${dest}`);

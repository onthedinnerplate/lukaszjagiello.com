// Server-only (used from getStaticProps). Reads real pixel dimensions and a
// dominant colour from each file at build time, so swapping a photo never
// requires hand-editing width/height — and the layout never shifts (CLS = 0).
import path from 'node:path';
import sharp from 'sharp';
import { photos, hero, LOCATIONS } from './photos';

const publicDir = path.join(process.cwd(), 'public');

const toHex = ({ r, g, b }) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

async function measure(src) {
  const file = path.join(publicDir, src);
  const img = sharp(file);
  const [{ width, height }, { dominant }] = await Promise.all([img.metadata(), img.stats()]);
  if (!width || !height) throw new Error(`Could not read dimensions of ${file}`);
  return { width, height, color: toHex(dominant) };
}

// Interleave locations (SF, Alcatraz, Jamaica, …, SF, …) so no single
// location clumps together in the masonry columns.
function interleave(list) {
  const buckets = LOCATIONS.map((loc) => list.filter((p) => p.location === loc));
  const out = [];
  for (let i = 0; out.length < list.length; i++) {
    for (const b of buckets) if (b[i]) out.push(b[i]);
  }
  return out;
}

export async function getPhotos() {
  const measured = await Promise.all(photos.map(async (p) => ({ ...p, ...(await measure(p.src)) })));
  return interleave(measured).map(({ orientation, file, ...rest }) => rest);
}

export async function getHero() {
  return { src: hero.src, alt: hero.alt, ...(await measure(hero.src)) };
}

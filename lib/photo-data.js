// Server-only (used from getStaticProps). Reads real pixel dimensions and a
// dominant colour from each file at build time, so swapping a photo never
// requires hand-editing width/height — and the layout never shifts (CLS = 0).
// Rebuild: 2026-10-07 - troubleshoot image rendering issue
import path from 'node:path';
import sharp from 'sharp';
import { photos, hero } from './photos';
import { photoPath } from './slug.js';

const publicDir = path.join(process.cwd(), 'public');

const toHex = ({ r, g, b }) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

async function measure(src) {
  const file = path.join(publicDir, src);
  const img = sharp(file);
  const [{ width, height }, { dominant }] = await Promise.all([img.metadata(), img.stats()]);
  if (!width || !height) throw new Error(`Could not read dimensions of ${file}`);
  return { width, height, color: toHex(dominant) };
}

let photoCache;

export async function getPhotos() {
  if (photoCache) return photoCache;
  // Process images sequentially instead of in parallel to avoid resource exhaustion on limited hosts.
  // Cached for the process: photo pages call this once per path during `next build`.
  const measured = [];
  for (const p of photos) {
    try {
      const metadata = await measure(p.src);
      // Thumbs are pre-sized and served directly to the grid.
      const { width: thumbWidth, height: thumbHeight } = await measure(p.thumb);
      measured.push({ ...p, ...metadata, thumbWidth, thumbHeight, href: photoPath(p, photos) });
    } catch (error) {
      console.error(`Failed to measure ${p.src}:`, error.message);
      // Skip failed images rather than breaking the entire build
      continue;
    }
  }

  photoCache = measured.map(({ orientation, file, ...rest }) => ({
    ...rest,
    src: `/${rest.src}`,
    thumb: `/${rest.thumb}`,
  }));
  return photoCache;
}

export async function getHero() {
  const measured = await measure(hero.src);
  return { src: `/${hero.src}`, alt: hero.alt, ...measured };
}

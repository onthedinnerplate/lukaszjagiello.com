// Server-only (used from getStaticProps). Real pixel dimensions and dominant
// colour come from lib/photo-manifest.json, which scripts/generate-photo-manifest.mjs
// writes in "prebuild". Nothing here touches image files, so the 52 static
// pages generate in milliseconds instead of each worker decoding 92 WebPs.
import manifest from './photo-manifest.json';
import { photos, hero } from './photos';
import { photoPath } from './slug.js';

let photoCache;

export async function getPhotos() {
  if (photoCache) return photoCache;
  const measured = [];
  for (const p of photos) {
    const m = manifest.photos[p.src];
    if (!m) {
      console.error(`photo-manifest.json has no entry for ${p.src} — run \`npm run manifest\`.`);
      continue; // skip rather than break the build
    }
    const { orientation, file, ...rest } = p;
    measured.push({
      ...rest,
      width: m.width,
      height: m.height,
      color: m.color,
      thumbWidth: m.thumbWidth,
      thumbHeight: m.thumbHeight,
      href: photoPath(p, photos),
      src: `/${p.src}`,
      thumb: `/${p.thumb}`,
    });
  }
  photoCache = measured;
  return photoCache;
}

export async function getHero() {
  const m = manifest.hero;
  if (!m) throw new Error('photo-manifest.json has no hero entry — run `npm run manifest`.');
  return { src: `/${hero.src}`, alt: hero.alt, width: m.width, height: m.height, color: m.color };
}

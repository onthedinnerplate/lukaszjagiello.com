// Server-only (used from getStaticProps). Real pixel dimensions and dominant
// colour come from lib/photo-manifest.json, which scripts/generate-photo-manifest.mjs
// writes in "prebuild". Nothing here touches image files, so the 52 static
// pages generate in milliseconds instead of each worker decoding 92 WebPs.
import manifest from './photo-manifest.json';
import { photos, hero } from './photos';
import { photoPath } from './slug.js';
import { site } from './site.js';
import { photoNumberFromSrc } from './photoCaption.js';
import { availableTiers } from './store-server.js';

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
      forSale: availableTiers(photoNumberFromSrc(p.src)).length > 0, // drives the card's buy icon
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

/**
 * Gallery display order: the homepage's curated set (site.homeFeatured) first,
 * in that order, then every remaining photo in lib/photos.js order. Used by the
 * gallery page and for prev/next on photo pages so the two agree.
 */
export async function getGalleryPhotos() {
  const all = await getPhotos();
  const featured = site.homeFeatured || [];
  const byNumber = new Map(all.map((p) => [photoNumberFromSrc(p.src), p]));
  const lead = featured.map((n) => byNumber.get(n)).filter(Boolean);
  const leadSet = new Set(lead);
  return [...lead, ...all.filter((p) => !leadSet.has(p))];
}

/** { all: 46, landscape: n, animals: n, … } for the filter row. Photos may
 *  belong to several categories, so the per-category numbers can exceed `all`. */
export function categoryCounts(photos) {
  const counts = { all: photos.length };
  for (const p of photos) for (const c of p.categories || []) counts[c] = (counts[c] || 0) + 1;
  return counts;
}

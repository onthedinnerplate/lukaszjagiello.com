// Slugs are derived from titles. The photo number NN in the filename is the
// stable identity — a renamed title changes the slug, and /photo/NN redirects
// to whatever the current slug is.
import { photoNumberFromSrc } from './photoCaption.js';

/** Kebab-case slug. Apostrophes drop out; other punctuation becomes hyphens. */
export function slugifyTitle(title = '') {
  return String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function paddedNumber(src) {
  const n = photoNumberFromSrc(src);
  return n ? String(n).padStart(2, '0') : null;
}

/**
 * Slug for one photo within the catalogue. If two titles slugify the same,
 * both gain a `-NN` suffix so the URL stays unique.
 */
export function slugFor(photo, photos) {
  const base = slugifyTitle(photo.title);
  const collisions = photos.filter((p) => slugifyTitle(p.title) === base).length;
  if (collisions > 1) {
    const nn = paddedNumber(photo.src);
    return nn ? `${base}-${nn}` : base;
  }
  return base;
}

export function photoPath(photo, photos) {
  return `/photo/${slugFor(photo, photos)}`;
}

/** 1200×630 JPEG used for Open Graph / Twitter on the photo page. */
export function ogImageSrc(src) {
  const nn = paddedNumber(src);
  return nn ? `/images/og/lukasz-jagiello-${nn}.jpg` : null;
}

/**
 * `/photo/3` and `/photo/03` → the current slug URL (301).
 * NN stays a stable link even if the title (and therefore the slug) changes.
 */
export function numericPhotoRedirects(photos) {
  const redirects = [];
  for (const photo of photos) {
    const n = photoNumberFromSrc(photo.src);
    if (!n) continue;
    const destination = photoPath(photo, photos);
    const labels = new Set([String(n), String(n).padStart(2, '0')]);
    for (const label of labels) {
      redirects.push({ source: `/photo/${label}`, destination, statusCode: 301 });
    }
  }
  return redirects;
}

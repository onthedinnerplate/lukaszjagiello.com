import shapes from './journalShapes.json';

export const LATEST_SLUGS = [
  'ruby-beach',
  'marymere-falls',
  'negril-lighthouse',
  'slot-canyon-light',
];

const SHAPE_ORDER = [
  'circle', 'pentagon', 'hexagon', 'octagon',
  'triangle', 'square', 'rectangle', 'trapezoid',
];

/**
 * More stories beside the featured portrait. The first six are the original
 * set (the other three first essays, then three further journeys). The rest
 * are published essays, in photo order, so the column matches the featured
 * story once the swatches sit clear of the portrait.
 */
export const MORE_NUMBERS = [41, 3, 23, 25, 34, 45, 1, 2, 4, 5, 6, 7, 8, 9, 10];

/** Decorative cluster on the closing band. One shape each, existing photos only. */
export const CLUSTER_NUMBERS = [7, 17, 32, 29, 14, 27, 10];

export function shapeFor(article) {
  return shapes[String(article.photoNumber)] || null;
}

export function inspirationsFrom(articles) {
  const pool = articles.filter((article) => !LATEST_SLUGS.includes(article.photoSlug));
  const chosen = [];
  for (const kind of SHAPE_ORDER) {
    const hit = pool.find((article) => shapeFor(article)?.shape === kind && !chosen.includes(article));
    if (hit) chosen.push(hit);
  }
  const rest = [...pool].sort((a, b) => a.photoNumber - b.photoNumber);
  for (const article of rest) {
    if (chosen.length >= 12) break;
    if (!chosen.includes(article)) chosen.push(article);
  }
  return chosen.slice(0, 12).sort((a, b) => a.photoNumber - b.photoNumber);
}

export function byNumber(articles, numbers) {
  return numbers
    .map((n) => articles.find((article) => article.photoNumber === n))
    .filter(Boolean);
}

// Digital download store: tiers, pricing, licence, and where the files live.
//
// Deliverable files are NOT the public gallery images. They live outside
// public/ so Next never serves them directly:
//   private/downloads/<NN>/1080.jpg   1920px long edge   (committed)
//   private/downloads/<NN>/2k.jpg     2048px long edge   (committed)
//   private/downloads/<NN>/full.jpg   original size      (committed; ~7 MB each)
// Generate them with `npm run downloads -- --source=<folder of originals>`.
// A tier is offered for sale only when its file exists on the server.

import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

export const TIERS = [
  { id: '1080', label: '1080p', longEdge: 1920, priceCents: 500, file: '1080.jpg', blurb: 'Web and social — 1920px' },
  { id: '2k', label: '2K', longEdge: 2048, priceCents: 1200, file: '2k.jpg', blurb: 'Screens and small prints — 2048px' },
  { id: 'full', label: 'Full resolution', longEdge: null, priceCents: 2500, file: 'full.jpg', blurb: 'Original camera resolution' },
];

export const CURRENCY = 'usd';

export const LICENCE_SUMMARY =
  'Personal-use licence: print it, frame it, use it as wallpaper. No resale, redistribution or commercial use.';

export const tierById = (id) => TIERS.find((t) => t.id === id) || null;

export const formatPrice = (cents) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

const DOWNLOADS_DIR = path.join(process.cwd(), 'private', 'downloads');

/** Absolute path of the deliverable for a photo number + tier, or null if absent. */
export function downloadFileFor(photoNumber, tierId) {
  const n = Number(photoNumber);
  const tier = tierById(tierId);
  if (!Number.isInteger(n) || n < 1 || n > 999 || !tier) return null; // never build a path from untrusted input
  const file = path.join(DOWNLOADS_DIR, String(n).padStart(2, '0'), tier.file);
  if (!file.startsWith(DOWNLOADS_DIR)) return null;
  return existsSync(file) ? file : null;
}

/** Tiers purchasable for this photo right now (file present), with sizes. */
export function availableTiers(photoNumber) {
  return TIERS.flatMap((t) => {
    const file = downloadFileFor(photoNumber, t.id);
    if (!file) return [];
    const bytes = statSync(file).size;
    return [{ id: t.id, label: t.label, blurb: t.blurb, priceCents: t.priceCents, price: formatPrice(t.priceCents), mb: Math.max(0.1, Math.round(bytes / 104857.6) / 10) }];
  });
}

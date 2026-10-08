// Server-only half of the store: which tier files exist on disk.
// Never import this from a component or page body — only from getStaticProps
// and API routes — because it uses node:fs.

import { existsSync, statSync } from 'fs';
import path from 'path';
import { TIERS, tierById, formatPrice } from './store.js';

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

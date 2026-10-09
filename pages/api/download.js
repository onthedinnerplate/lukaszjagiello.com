import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { photos } from '@/lib/photos';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { slugFor } from '@/lib/slug';
import { tierById } from '@/lib/store';
import { decryptDownload, downloadKey } from '@/lib/download-crypto';
import { downloadFileFor } from '@/lib/store-server';
import { retrieveCheckoutSession } from '@/lib/stripe';

export const config = { api: { responseLimit: false } };

const LINK_TTL_DAYS = 7;
const UNAVAILABLE = 'Downloads are temporarily unavailable';

/**
 * GET /api/download?session_id=cs_…   → streams the purchased file
 * GET /api/download?session_id=cs_…&info=1 → JSON { title, tier, ok, reason }
 *
 * Stateless fulfilment: the Checkout Session is the receipt. We re-check it
 * with Stripe on every request (paid? which photo/tier? how old?), so there is
 * no database and nothing to get out of sync. Session IDs are unguessable.
 *
 * The bytes on disk are AES-256-GCM ciphertext (.jpg.enc). They are decrypted
 * with DOWNLOAD_FILES_KEY and the JPEG is streamed with the same headers as
 * before. The tag is checked before any byte is sent. A missing key is a 503
 * with a generic message; the build does not need the key.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!downloadKey()) {
    console.error('[download] DOWNLOAD_FILES_KEY is not set');
    return res.status(503).json({ ok: false, reason: UNAVAILABLE });
  }

  const id = String(req.query.session_id || '');
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ ok: false, reason: 'Invalid link' });

  let session;
  try {
    session = await retrieveCheckoutSession(id);
  } catch (err) {
    console.error('[download] retrieve failed:', err.message);
    return res.status(err.status === 404 ? 404 : 502).json({ ok: false, reason: err.status === 404 ? 'Unknown order' : 'Could not verify the order' });
  }

  const n = Number(session.metadata?.photo);
  const tier = tierById(session.metadata?.tier);
  const photo = photos.find((p) => photoNumberFromSrc(p.src) === n);
  const paid = session.payment_status === 'paid';
  const ageDays = (Date.now() / 1000 - Number(session.created || 0)) / 86400;
  const expired = ageDays > LINK_TTL_DAYS;
  const file = photo && tier ? downloadFileFor(n, tier.id) : null;

  const info = { ok: paid && !expired && !!file, title: photo?.title || '', tier: tier?.label || '', slug: photo ? slugFor(photo, photos) : '' };
  if (!paid) info.reason = 'Payment not completed';
  else if (expired) info.reason = `Download links expire after ${LINK_TTL_DAYS} days`;
  else if (!file) info.reason = 'File unavailable — please contact us';

  if (req.query.info) return res.status(info.ok ? 200 : 403).json(info);
  if (!info.ok) return res.status(403).json(info);

  let plain;
  try {
    plain = decryptDownload(await readFile(file));
  } catch {
    console.error('[download] could not decrypt the file');
    return res.status(503).json({ ok: false, reason: UNAVAILABLE });
  }

  const name = `${slugFor(photo, photos)}-${tier.id}-lukasz-jagiello.jpg`;
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Length', String(plain.length));
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // One-element iterable so the Buffer is one chunk, not a byte iterator.
  await pipeline(Readable.from([plain]), res);
}

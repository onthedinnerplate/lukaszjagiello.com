import { photos } from '@/lib/photos';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { photoPath, ogImageSrc } from '@/lib/slug';
import { tierById, downloadFileFor, CURRENCY, LICENCE_SUMMARY } from '@/lib/store';
import { createCheckoutSession } from '@/lib/stripe';
import { SITE_URL, site } from '@/lib/site';

export const config = { api: { bodyParser: { sizeLimit: '2kb' } } };

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

/**
 * POST { photo: <NN>, tier: '1080' | '2k' | 'full' }
 * → { url } for Stripe Checkout. Price and product come from lib/store.js —
 * never from the client. Only tiers whose file exists on disk are sellable.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Forbidden' });

  const n = Number(req.body?.photo);
  const tier = tierById(String(req.body?.tier || ''));
  const photo = photos.find((p) => photoNumberFromSrc(p.src) === n);
  if (!photo || !tier) return res.status(400).json({ error: 'Unknown photo or tier' });
  if (!downloadFileFor(n, tier.id)) return res.status(409).json({ error: 'That size is not available yet' });

  const pagePath = photoPath(photo, photos);
  const image = `${SITE_URL}${ogImageSrc(photo.src)}`; // JPEG: Stripe's thumbnail renderer is not guaranteed to show WebP

  try {
    const session = await createCheckoutSession({
      mode: 'payment',
      success_url: `${SITE_URL}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${pagePath}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: tier.priceCents,
            product_data: {
              name: `${photo.title} — ${tier.label} digital download`,
              description: `${tier.blurb}. ${LICENCE_SUMMARY}`,
              images: [image],
            },
          },
        },
      ],
      metadata: { photo: String(n), tier: tier.id, title: photo.title },
      payment_intent_data: { description: `${site.name}: ${photo.title} (${tier.label})` },
      invoice_creation: { enabled: false },
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      submit_type: 'pay',
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return res.status(502).json({ error: 'Checkout is unavailable right now. Please try again in a minute.' });
  }
}

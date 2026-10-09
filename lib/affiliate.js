// Affiliate ids are build-time public env vars. Leave them empty until the
// owner has real ids — do not invent a tag. Empty values emit clean store
// links with no tracking parameter. NEXT_PUBLIC_* is inlined at build, so a
// change needs a redeploy; this file does not write Render settings.

export const AMAZON_ASSOC_TAG = (process.env.NEXT_PUBLIC_AMAZON_ASSOC_TAG || '').trim();
export const BH_AFFILIATE_ID = (process.env.NEXT_PUBLIC_BH_AFFILIATE_ID || '').trim();

export const AFFILIATE_DISCLOSURE = 'As an affiliate I may earn from qualifying purchases';

function hostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function onHost(url, host) {
  const name = hostname(url);
  return name === host || name.endsWith(`.${host}`);
}

function withParam(url, key, value) {
  const parsed = new URL(url);
  parsed.searchParams.set(key, value);
  return parsed.toString();
}

/**
 * Amazon search, or an exact product URL when the catalogue already has one.
 * Associates tag is appended only when NEXT_PUBLIC_AMAZON_ASSOC_TAG is set.
 */
export function amazonHref(item, exactUrl) {
  const exact = typeof exactUrl === 'string' ? exactUrl.trim() : '';
  if (exact) {
    if (!AMAZON_ASSOC_TAG || !onHost(exact, 'amazon.com')) return exact;
    return withParam(exact, 'tag', AMAZON_ASSOC_TAG);
  }
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(item)}`;
  return AMAZON_ASSOC_TAG ? `${base}&tag=${encodeURIComponent(AMAZON_ASSOC_TAG)}` : base;
}

/**
 * B&H search, or an exact product URL when the catalogue already has one.
 * B&H's affiliate portal identifies the publisher with the BI parameter.
 * Impact's deep-link wrapper also needs an ad id and a program id, which
 * this config does not have, so a set NEXT_PUBLIC_BH_AFFILIATE_ID is applied
 * as that documented BI param. Empty means no tracking parameter at all.
 */
export function bhHref(item, exactUrl) {
  const exact = typeof exactUrl === 'string' ? exactUrl.trim() : '';
  if (exact) {
    if (!BH_AFFILIATE_ID || !onHost(exact, 'bhphotovideo.com')) return exact;
    return withParam(exact, 'BI', BH_AFFILIATE_ID);
  }
  const base = `https://www.bhphotovideo.com/c/search?q=${encodeURIComponent(item)}`;
  return BH_AFFILIATE_ID ? `${base}&BI=${encodeURIComponent(BH_AFFILIATE_ID)}` : base;
}

export function storeLinks(item, exact = {}) {
  const name = String(item || '').trim();
  return {
    amazon: amazonHref(name, exact.amazon),
    bh: bhHref(name, exact.bh),
  };
}

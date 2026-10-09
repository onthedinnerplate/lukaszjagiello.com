import { absoluteUrl } from './site.js';

/** Canonical https://lukaszjagiello.com URL, including when the page is opened on a preview host. */
export function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return absoluteUrl('/');
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return absoluteUrl(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`);
}

/** Article title plus a short excerpt, for the pin at the end of a journey. */
export function pinDescription(title, excerpt) {
  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const headline = clean(title);
  const dek = clean(excerpt);
  let text = headline;
  if (dek) text = /[.!?]$/.test(headline) ? `${headline} ${dek}` : `${headline}. ${dek}`;
  if (text.length <= 500) return text;
  return `${text.slice(0, 497).trimEnd()}...`;
}

/** Plain Pinterest pin-create URL. No widget script. */
export function pinterestPinHref({ pageUrl, mediaUrl, description }) {
  const params = new URLSearchParams({
    url: pageUrl,
    media: mediaUrl,
    description,
  });
  return `https://www.pinterest.com/pin/create/button/?${params.toString()}`;
}

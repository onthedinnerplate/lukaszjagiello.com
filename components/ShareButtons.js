import ShareButton from './ShareButton';
import BuyIcon from './BuyIcon';
import { alltrailsHref } from '@/lib/affiliate';
import { pinterestPinHref, toAbsoluteUrl } from '@/lib/shareUrls';
import gallery from '@/styles/Gallery.module.css';

function TrailMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19h18" />
      <path d="M5 19l5.2-9.2a1 1 0 0 1 1.75 0L14.5 15l1.7-2.8a1 1 0 0 1 1.72 0L21 19" />
    </svg>
  );
}

function BuyMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function mapHref(photo) {
  const coords = photo?.coords;
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }
  const location = typeof photo?.location === 'string' ? photo.location.trim() : '';
  if (!location) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function PinMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 17.2V7.6h3.5a2.8 2.8 0 0 1 0 5.6H9.2" />
    </svg>
  );
}

/**
 * Pinterest, Share, Buy, then AllTrails when the photo is a hike, in the bottom-right corner.
 * Share and Buy are the Gallery controls. Pinterest is the same disc, and pins
 * this image. `pinUrl` is the photo page, or the article when the card belongs
 * to one. The description is the card title.
 */
export function PhotoCardActions({ title, shareUrl, pinUrl, mediaUrl, photo }) {
  const pageUrl = toAbsoluteUrl(pinUrl || shareUrl);
  const media = toAbsoluteUrl(mediaUrl || shareUrl);
  const href = pinterestPinHref({ pageUrl, mediaUrl: media, description: title || '' });
  const trailHref = alltrailsHref(photo);
  const trailFallback = trailHref ? '' : mapHref(photo);
  const forSale = Boolean(photo?.forSale && photo?.href);
  const stop = (event) => event.stopPropagation();

  return (
    <span className={gallery.cardActions} data-card-actions="true" onClick={stop}>
      <a
        className={gallery.share}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Pin ${title} on Pinterest`}
        title="Pin on Pinterest"
        onClick={stop}
      >
        <PinMark />
      </a>
      <ShareButton
        title={title}
        url={shareUrl}
        className={gallery.share}
        toastClassName={gallery.toast}
        wrapperClassName={gallery.shareWrap}
      />
      {forSale ? <BuyIcon photo={photo} className={gallery.share} /> : (
        <a
          className={`${gallery.share} ${gallery.phoneOnlyAction}`}
          href={photo?.href ? `${photo.href}#buy` : '/contact'}
          aria-label={`Buy a download of ${title}`}
          title="Buy a download"
          onClick={stop}
        >
          <BuyMark />
        </a>
      )}
      {trailHref ? (
        <a
          className={gallery.share}
          href={trailHref}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label="Find this trail on AllTrails"
          title="Find this trail on AllTrails"
          onClick={stop}
        >
          <TrailMark />
        </a>
      ) : (
        <a
          className={`${gallery.share} ${gallery.phoneOnlyAction}`}
          href={trailFallback || undefined}
          target={trailFallback ? '_blank' : undefined}
          rel={trailFallback ? 'noopener noreferrer' : undefined}
          aria-label="Open the map"
          title="Map"
          aria-disabled={trailFallback ? undefined : true}
          onClick={stop}
        >
          <TrailMark />
        </a>
      )}
    </span>
  );
}


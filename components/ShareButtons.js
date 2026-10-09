import ShareButton from './ShareButton';
import BuyIcon from './BuyIcon';
import { alltrailsHref } from '@/lib/affiliate';
import { pinterestPinHref, toAbsoluteUrl } from '@/lib/shareUrls';
import gallery from '@/styles/Gallery.module.css';

function TrailMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19h18" />
      <path d="M5 19l5.2-9.2a1 1 0 0 1 1.75 0L14.5 15l1.7-2.8a1 1 0 0 1 1.72 0L21 19" />
    </svg>
  );
}

function PinMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 17.2V7.6h3.5a2.8 2.8 0 0 1 0 5.6H9.2" />
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

/**
 * Phones show four actions in one pill: Pinterest, Share, Buy, and a trail
 * or map link. Wider screens keep only the Share and Buy circles.
 */
export function PhotoCardActions({ title, shareUrl, pinUrl, mediaUrl, photo }) {
  const pageUrl = toAbsoluteUrl(pinUrl || shareUrl);
  const media = toAbsoluteUrl(mediaUrl || shareUrl);
  const href = pinterestPinHref({ pageUrl, mediaUrl: media, description: title || '' });
  const trailHref = alltrailsHref(photo);
  const trailFallback = trailHref ? '' : mapHref(photo);
  const stop = (event) => event.stopPropagation();
  const buyPhoto = photo ? { ...photo, title: photo.title || title } : { title };

  return (
    <span className={gallery.cardActions} data-card-actions="true" onClick={stop}>
      <a
        className={`${gallery.share} ${gallery.phoneOnlyAction}`}
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
      <BuyIcon photo={buyPhoto} className={gallery.share} />
      {trailHref ? (
        <a
          className={`${gallery.share} ${gallery.phoneOnlyAction}`}
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
          onClick={trailFallback ? stop : (event) => event.preventDefault()}
        >
          <TrailMark />
        </a>
      )}
    </span>
  );
}

import { storyFrameObjectPosition } from '@/lib/photoFocus';
import styles from '@/styles/Journal.module.css';

function mapsHref(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

function photoSrc(src) {
  if (!src) return '';
  return src.startsWith('/') ? src : `/${src}`;
}

/**
 * The article's only photograph: full width of its column, with the trail
 * pin and place name along the bottom. Every journal story uses this.
 */
export default function ArticleLead({
  photo,
  location,
  alltrailsUrl,
  onClick,
  expanded,
  controlsId,
}) {
  const place = location || photo.title;
  const pinHref = alltrailsUrl || mapsHref(place);
  const pinLabel = alltrailsUrl ? `${place} on AllTrails` : `${place} on Google Maps`;
  return (
    <div className={styles.storyFrame}>
      <button
        type="button"
        className={styles.storyOpen}
        onClick={onClick}
        aria-expanded={expanded}
        aria-controls={controlsId}
      >
        <img
          className={styles.storyPhoto}
          src={photoSrc(photo.src)}
          alt={photo.alt}
          style={{ objectPosition: storyFrameObjectPosition(photo) }}
        />
        <span className="sr-only">View full image</span>
      </button>
      <div className={styles.storyWash} aria-hidden="true" />
      <div className={styles.storyBand}>
        <a
          className={styles.portraitPin}
          href={pinHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={pinLabel}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </a>
        <a
          className={styles.portraitPlace}
          href={mapsHref(place)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${place} on Google Maps`}
        >
          {place}
        </a>
      </div>
    </div>
  );
}

import { useState } from 'react';
import styles from '@/styles/Page.module.css';

/**
 * Where the photo was taken. Collapsed: a small map card (pin + place name)
 * that loads nothing from Google. Click → expands in place into an
 * interactive Google Maps embed (no API key needed for the plain embed URL),
 * with an "Open in Google Maps" link. Click the header again to collapse.
 *
 * Renders nothing when the photo has no coordinates.
 */
export default function PhotoMap({ coords, location, title }) {
  const [open, setOpen] = useState(false);
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return null;

  const { lat, lng } = coords;
  const zoom = coords.zoom || 13;
  const embed = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=en&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const label = location || title;

  return (
    <div className={`${styles.map} ${open ? styles.mapOpen : ''}`}>
      <button
        type="button"
        className={styles.mapToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="photo-map-panel"
      >
        <span className={styles.mapTile} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <span className={styles.mapText}>
          <span className={styles.mapLabel}>{label}</span>
          <span className={styles.mapHint}>{open ? 'Hide map' : 'View on map'}</span>
        </span>
      </button>

      {open && (
        <div id="photo-map-panel" className={styles.mapPanel}>
          <iframe
            title={`Map of ${label}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a className={styles.mapExternal} href={external} target="_blank" rel="noopener noreferrer">
            Open in Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}

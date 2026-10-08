import { useState } from 'react';
import styles from '@/styles/Page.module.css';

/**
 * Photo-page header: `children` (title + gear) on the left, a square map card
 * on the right, vertically centred. The card — pin on top, place name beneath —
 * loads nothing from Google while closed. Click → an interactive Google Maps
 * embed (plain embed URL, no API key) opens full-width below the header, with
 * an "Open in Google Maps" link; click the card again to collapse.
 *
 * With no coordinates it renders just the children (no card).
 */
export default function PhotoMap({ coords, location, title, children, stacked = false }) {
  const [open, setOpen] = useState(false);
  const has = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
  const headerClass = `${styles.photoHeader} ${stacked ? styles.photoHeaderStacked : ''}`;
  if (!has) return <header className={headerClass}>{children ? <div className={styles.photoHeaderText}>{children}</div> : null}</header>;

  const { lat, lng } = coords;
  const zoom = coords.zoom || 13;
  const embed = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=en&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const label = location || title;

  return (
    <>
      <header className={headerClass}>
        <div className={styles.photoHeaderText}>{children}</div>
        <button
          type="button"
          className={`${styles.mapCard} ${stacked ? styles.mapCardWide : ''} ${open ? styles.mapCardOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="photo-map-panel"
          title={open ? 'Hide map' : 'View on map'}
        >
          <span className={styles.mapPin} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span className={styles.mapLabel}>{label}</span>
          <span className={styles.mapHint}>{open ? 'Hide map' : 'View on map'}</span>
        </button>
      </header>

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
    </>
  );
}

import styles from '@/styles/Journal.module.css';

/** Uppercase #RRGGBB of the exact value painted on the swatch. */
export function swatchLabel(value) {
  const raw = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return `#${raw.slice(1).toUpperCase()}`;
  return raw;
}

/**
 * Pantone Color Finder text search. Verified in a browser: `?q=` plus the
 * six hex digits (no hash) stays on color-finder and lists closest chips.
 */
export function pantoneFinderHref(value) {
  const label = swatchLabel(value);
  const query = label.startsWith('#') ? label.slice(1) : label;
  return `https://www.pantone.com/color-finder?q=${encodeURIComponent(query)}`;
}

/**
 * Palette chips under the photograph. The row is as wide as that image:
 * equal columns, a square chip, and the uppercase hex centred beneath it.
 * `background` is the palette string unchanged.
 */
export default function Swatches({ shape, compact = false, featured = false }) {
  if (!shape?.palette?.length) return null;
  const className = [
    styles.swatches,
    compact ? styles.swatchesCompact : '',
    featured ? styles.swatchesFeatured : '',
  ].filter(Boolean).join(' ');
  return (
    <ul
      className={className}
      style={{ gridTemplateColumns: `repeat(${shape.palette.length}, minmax(0, 1fr))` }}
    >
      {shape.palette.map((hex, i) => {
        const label = swatchLabel(hex);
        const name = `Find nearest Pantone to ${label}`;
        return (
          <li key={`${hex}-${i}`} className={styles.swatchItem}>
            <a
              className={styles.swatchLink}
              href={pantoneFinderHref(hex)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
            >
              <span className={styles.swatch} style={{ background: hex }} aria-hidden="true" />
              <span className={styles.hex} aria-hidden="true">{label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

import styles from '@/styles/Journal.module.css';

/** Uppercase #RRGGBB of the exact value painted on the swatch. */
export function swatchLabel(value) {
  const raw = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return `#${raw.slice(1).toUpperCase()}`;
  return raw;
}

/**
 * Palette chips. `background` is the palette string unchanged.
 * The label is that same value, uppercased, beside the chip.
 */
export default function Swatches({ shape, compact = false, featured = false }) {
  if (!shape?.palette?.length) return null;
  const className = [
    styles.swatches,
    compact ? styles.swatchesCompact : '',
    featured ? styles.swatchesFeatured : '',
  ].filter(Boolean).join(' ');
  return (
    <ul className={className}>
      {shape.palette.map((hex, i) => (
        <li key={`${hex}-${i}`} className={styles.swatchItem}>
          <span className={styles.swatch} style={{ background: hex }} aria-hidden="true" />
          <span className={styles.hex}>{swatchLabel(hex)}</span>
        </li>
      ))}
    </ul>
  );
}

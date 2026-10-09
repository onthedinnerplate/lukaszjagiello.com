import Link from 'next/link';
import { CATEGORIES, galleryPathFor } from '@/lib/categories';
import styles from '@/styles/Gallery.module.css';

/**
 * Horizontal filter row. Gallery pages link to /gallery and /gallery/[category].
 * Other sections can pass `hrefFor`. `counts` is { slug: n }. When `disableEmpty`
 * is set, a category with no entries is shown disabled instead of linked.
 * `active` is one slug or a list of slugs (a photo can sit in several).
 */
export default function CategoryNav({
  active = 'all',
  counts = {},
  hrefFor = galleryPathFor,
  label = 'Gallery categories',
  disableEmpty = false,
}) {
  const items = [{ slug: 'all', label: 'All' }, ...CATEGORIES];
  const activeSet = new Set(Array.isArray(active) ? active : [active]);
  return (
    <nav className={styles.catNav} aria-label={label}>
      <ul className={styles.catList}>
        {items.map((c) => {
          const isActive = activeSet.has(c.slug);
          const n = counts[c.slug];
          const empty = disableEmpty && c.slug !== 'all' && !(n > 0);
          const count = typeof n === 'number' ? <span className={styles.catCount}>{n}</span> : null;
          if (empty) {
            return (
              <li key={c.slug}>
                <span className={`${styles.catLink} ${styles.catDisabled}`} aria-disabled="true">
                  {c.label}
                  {count}
                </span>
              </li>
            );
          }
          return (
            <li key={c.slug}>
              <Link
                href={hrefFor(c.slug)}
                className={`${styles.catLink} ${isActive ? styles.catActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {c.label}
                {count}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

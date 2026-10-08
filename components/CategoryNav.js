import Link from 'next/link';
import { CATEGORIES, galleryPathFor } from '@/lib/categories';
import styles from '@/styles/Gallery.module.css';

/**
 * Horizontal filter row under the gallery heading. Each item is a real link
 * (/gallery, /gallery/landscape, …) so every category has its own crawlable
 * page; the active one is underlined in orange. `counts` is { slug: n }.
 */
export default function CategoryNav({ active = 'all', counts = {} }) {
  const items = [{ slug: 'all', label: 'All' }, ...CATEGORIES];
  return (
    <nav className={styles.catNav} aria-label="Gallery categories">
      <ul className={styles.catList}>
        {items.map((c) => {
          const isActive = c.slug === active;
          const n = counts[c.slug];
          return (
            <li key={c.slug}>
              <Link
                href={galleryPathFor(c.slug)}
                className={`${styles.catLink} ${isActive ? styles.catActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {c.label}
                {typeof n === 'number' && <span className={styles.catCount}>{n}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

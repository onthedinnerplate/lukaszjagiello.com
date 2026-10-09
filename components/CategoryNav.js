import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, galleryPathFor } from '@/lib/categories';
import styles from '@/styles/Gallery.module.css';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The Journeys category bar. Gallery, Home, About and Contact reuse this
 * component and its CSS; only the links, the accessible name and where the
 * page places it change.
 *
 * `includeAll` stays on for Journeys. Gallery turns it off so the row lists
 * only Landscape, Animals, Architecture and People.
 */
export default function CategoryNav({
  active = 'all',
  counts = {},
  hrefFor = galleryPathFor,
  label = 'Gallery categories',
  disableEmpty = false,
  includeAll = true,
  allLabel = 'All',
  onSelect = null,
}) {
  const items = includeAll ? [{ slug: 'all', label: allLabel }, ...CATEGORIES] : CATEGORIES;
  const activeSet = new Set(Array.isArray(active) ? active : [active]);
  const countKey = items.map((item) => counts[item.slug] ?? '').join(',');
  const listRef = useRef(null);
  const [box, setBox] = useState(null);
  const [ready, setReady] = useState(false);
  const [instant, setInstant] = useState(true);

  const measure = (el) => {
    const list = listRef.current;
    if (!list || !el || !list.contains(el)) {
      setBox(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    if (rect.width < 1) {
      setBox(null);
      return;
    }
    setBox({
      x: rect.left - listRect.left + list.scrollLeft,
      y: rect.bottom - listRect.top + list.scrollTop - 2,
      w: rect.width,
    });
  };

  const activeItem = () => listRef.current?.querySelector('[aria-current="page"]') || null;

  const rest = () => {
    const list = listRef.current;
    const focused = list?.contains(document.activeElement) ? document.activeElement : null;
    if (focused && focused.matches('a, span')) {
      measure(focused);
      return;
    }
    measure(activeItem());
  };

  useIsoLayoutEffect(() => {
    measure(activeItem());
    setReady(true);
    const frame = requestAnimationFrame(() => setInstant(false));
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(() => measure(activeItem()));
    observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, includeAll, items.length, countKey]);

  const indicatorStyle = box
    ? { '--x': `${box.x}px`, '--y': `${box.y}px`, '--w': box.w, opacity: 1 }
    : { '--x': '0px', '--y': '0px', '--w': 0, opacity: 0 };

  return (
    <nav
      className={`${styles.catNav} ${ready ? styles.catNavReady : ''}`}
      aria-label={label}
      onMouseLeave={rest}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) rest();
      }}
    >
      <ul className={styles.catList} ref={listRef}>
        {items.map((c) => {
          const isActive = activeSet.has(c.slug);
          const n = counts[c.slug];
          const empty = disableEmpty && c.slug !== 'all' && !(n > 0);
          const count = typeof n === 'number' ? <span className={styles.catCount}>{n}</span> : null;
          const follow = (event) => measure(event.currentTarget);
          if (empty) {
            return (
              <li key={c.slug} onMouseEnter={(event) => measure(event.currentTarget.firstElementChild)}>
                <span className={`${styles.catLink} ${styles.catDisabled}`} aria-disabled="true">
                  {c.label}
                  {count}
                </span>
              </li>
            );
          }
          return (
            <li key={c.slug} onMouseEnter={(event) => measure(event.currentTarget.firstElementChild)}>
              <Link
                href={hrefFor(c.slug)}
                className={`${styles.catLink} ${isActive ? styles.catActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onFocus={follow}
                onClick={(event) => {
                  if (!onSelect) return;
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onSelect(c.slug);
                }}
              >
                {c.label}
                {count}
              </Link>
            </li>
          );
        })}
        <li
          className={`${styles.catIndicator} ${instant ? styles.catIndicatorInstant : ''}`}
          style={indicatorStyle}
          aria-hidden="true"
        />
      </ul>
    </nav>
  );
}

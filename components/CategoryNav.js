import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, categoryMenuLabel, galleryPathFor } from '@/lib/categories';
import styles from '@/styles/Gallery.module.css';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The Journeys category bar. Gallery, Home, About and Contact reuse this
 * component and its CSS; only the links, the accessible name and where the
 * page places it change.
 *
 * `includeAll` stays on for Journeys. Gallery section rows turn it off so
 * the row lists only Landscape, Animals, Architecture and People.
 *
 * `leading` is optional links before the categories. Heroes do not pass any.
 * A count is always "Name | count": a muted 1px rule, hidden from assistive tech.
 */
export default function CategoryNav({
  active = 'all',
  counts = {},
  hrefFor = galleryPathFor,
  label = 'Future Photography categories',
  disableEmpty = false,
  includeAll = true,
  allLabel = 'All',
  hideEmpty = false,
  onSelect = null,
  leading = [],
}) {
  const items = (includeAll ? [{ slug: 'all', label: allLabel }, ...CATEGORIES] : CATEGORIES)
    .map((item) => ({ ...item, label: item.slug === 'all' ? item.label : categoryMenuLabel(item) }))
    .filter((item) => !hideEmpty || item.slug === 'all' || counts[item.slug] > 0);
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

  const follow = (event) => measure(event.currentTarget);

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
        {leading.map((item) => {
          const isActive = activeSet.has(item.slug);
          return (
            <li key={item.slug} onMouseEnter={(event) => measure(event.currentTarget.firstElementChild)}>
              <Link
                href={item.href}
                className={`${styles.catLink} ${isActive ? styles.catActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onFocus={follow}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        {items.map((c) => {
          const isActive = activeSet.has(c.slug);
          const n = counts[c.slug];
          const empty = disableEmpty && c.slug !== 'all' && !(n > 0);
          const count = typeof n === 'number' ? (
            <span className={styles.catMeta}>
              <span className={styles.catSep} aria-hidden="true" />
              <span className={styles.catCount}>{n}</span>
            </span>
          ) : null;
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

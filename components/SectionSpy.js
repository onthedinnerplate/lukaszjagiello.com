import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/Layout.module.css';

const MENUS = [
  {
    test: (path) => path === '/',
    items: [
      { id: 'selected-photos', label: 'Selected' },
      { id: 'featured-heading', label: 'Featured' },
    ],
  },
  {
    test: (path) => path === '/gallery' || path.startsWith('/gallery/'),
    items: [
      { id: 'gate-hero-title', label: 'Featured' },
      { id: 'selected-photos', label: 'Selected' },
      { id: 'all-photos-title', label: 'All' },
      { id: 'future-photos-title', label: 'Future' },
    ],
  },
  {
    test: (path) => path === '/journal',
    items: [
      { id: 'latest-journeys', label: 'Latest' },
      { id: 'featured-story', label: 'Featured' },
      { id: 'more-stories', label: 'More stories' },
      { id: 'inspirations', label: 'Inspirations' },
      { id: 'all-journeys-title', label: 'All journeys' },
    ],
  },
];

function sectionsFor(path) {
  return MENUS.find((menu) => menu.test(path))?.items || [];
}

function headerOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Sticky section links. The gold underline follows the section crossing
 * the bottom of the header. IntersectionObserver drives the update.
 */
export default function SectionSpy({ path }) {
  const items = useMemo(() => sectionsFor(path), [path]);
  const listRef = useRef(null);
  const [active, setActive] = useState(items[0]?.id || '');
  const [box, setBox] = useState(null);
  const [instant, setInstant] = useState(true);

  useEffect(() => {
    setActive(items[0]?.id || '');
    setInstant(true);
  }, [items]);

  useEffect(() => {
    if (!items.length) return undefined;
    const shown = (el) => el && el.getClientRects().length > 0;
    const nodes = items.map((item) => document.getElementById(item.id)).filter(shown);
    if (!nodes.length) return undefined;

    const choose = () => {
      const line = headerOffset() + 8;
      const ranked = items
        .map((item) => ({ item, el: document.getElementById(item.id) }))
        .filter((entry) => shown(entry.el))
        .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
      if (!ranked.length) return;
      let chosen = ranked[0].item.id;
      for (const { item, el } of ranked) {
        if (el.getBoundingClientRect().top <= line) chosen = item.id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) chosen = ranked[ranked.length - 1].item.id;
      setActive((prev) => (prev === chosen ? prev : chosen));
    };

    const observer = new IntersectionObserver(choose, {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.2, 0.5, 1],
    });
    nodes.forEach((node) => observer.observe(node));
    choose();
    window.addEventListener('scroll', choose, { passive: true });
    window.addEventListener('resize', choose);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', choose);
      window.removeEventListener('resize', choose);
    };
  }, [items]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[aria-current="true"]');
    if (!list || !el) {
      setBox(null);
      return undefined;
    }
    const listRect = list.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setBox({
      x: rect.left - listRect.left + list.scrollLeft,
      y: rect.bottom - listRect.top + list.scrollTop - 2,
      w: rect.width,
    });
    const frame = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(frame);
  }, [active, items]);

  if (!items.length) return null;

  const indicatorStyle = box
    ? { '--x': `${box.x}px`, '--y': `${box.y}px`, '--w': box.w, opacity: 1 }
    : { '--x': '0px', '--y': '0px', '--w': 0, opacity: 0 };

  return (
    <nav className={`${styles.spyBar} container`} aria-label="On this page">
      <ul className={styles.spyList} ref={listRef}>
        {items.map((item) => (
          <li key={item.id} className={item.id === 'selected-photos' ? styles.spyPhoneHide : undefined}>
            <a
              href={`#${item.id}`}
              className={styles.spyLink}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(event) => {
                const el = document.getElementById(item.id);
                if (!el) return;
                event.preventDefault();
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
        <li
          className={`${styles.spyIndicator} ${instant ? styles.spyIndicatorInstant : ''}`}
          style={indicatorStyle}
          aria-hidden="true"
        />
      </ul>
    </nav>
  );
}

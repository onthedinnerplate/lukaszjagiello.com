import { useEffect, useState } from 'react';
import styles from '@/styles/BackToTop.module.css';

/**
 * Fixed round arrow, 10px from the viewport's right and bottom edges (plus
 * the safe-area inset). On gallery pages it walks back to the future-photos
 * section, then All photographs, then the top. Every other page goes to the top.
 */
function headerOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/** True once the section's top has moved above the sticky header. */
function scrolledPast(el) {
  if (!el) return false;
  return el.getBoundingClientRect().top < headerOffset() - 1;
}

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShow(window.scrollY > window.innerHeight * 0.8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onClick = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduce ? 'auto' : 'smooth';
    const future = document.getElementById('future-photographs');
    const all = document.getElementById('all-photographs');
    const target = scrolledPast(future) ? future : scrolledPast(all) ? all : null;
    if (!target) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    target.scrollIntoView({ behavior, block: 'start' });
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${show ? styles.show : ''}`}
      onClick={onClick}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

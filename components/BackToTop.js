import { useEffect, useState } from 'react';
import styles from '@/styles/BackToTop.module.css';

/**
 * Fixed round arrow button, bottom-right (20px up, 5px in). Appears after the
 * visitor has scrolled past roughly one screen; smooth-scrolls to the top
 * (instant for reduced-motion users). Hidden from the lightbox by z-index.
 */
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

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${show ? styles.show : ''}`}
      onClick={toTop}
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

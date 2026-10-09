import { useEffect, useId, useRef } from 'react';
import ShareButton from './ShareButton';
import ResponsiveImage from './ResponsiveImage';
import { captionFor } from '@/lib/photoCaption';
import styles from '@/styles/Lightbox.module.css';

// Overlay padding is the gutter (40px from 768px up, 16px below). The panel
// itself stops at 1600px. One candidate today (the 1600px-wide full); AVIF
// wins when a sibling exists.
const SIZES = '(max-width: 768px) calc(100vw - 32px), min(1600px, calc(100vw - 80px))';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Lightbox({ id, isOpen, photo, onClose, onPrev, onNext }) {
  const overlayRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  onCloseRef.current = onClose;
  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

  // Native fullscreen where the platform allows it (desktop browsers, Android).
  // iPhone Safari has no element fullscreen, so there the overlay itself is the
  // fullscreen experience. If the browser leaves fullscreen (Esc, swipe, system
  // UI), close the lightbox too so the two states never disagree.
  useEffect(() => {
    if (!isOpen) return undefined;
    const el = overlayRef.current;
    const doc = document;
    const request = el && (el.requestFullscreen || el.webkitRequestFullscreen);
    if (request) {
      try {
        const r = request.call(el, { navigationUI: 'hide' });
        if (r && r.catch) r.catch(() => {});
      } catch {
        /* unsupported or not allowed — plain overlay is fine */
      }
    }
    // Only treat a fullscreen exit as "close" after we actually entered it.
    // A shared /gallery#photo-NN link opens the lightbox on load, without a
    // user gesture, so requestFullscreen is rejected and must not dismiss it.
    let entered = false;
    const onFsChange = () => {
      const fsEl = doc.fullscreenElement || doc.webkitFullscreenElement;
      if (fsEl) entered = true;
      else if (entered) onCloseRef.current();
    };
    doc.addEventListener('fullscreenchange', onFsChange);
    doc.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      doc.removeEventListener('fullscreenchange', onFsChange);
      doc.removeEventListener('webkitfullscreenchange', onFsChange);
      const fsEl = doc.fullscreenElement || doc.webkitFullscreenElement;
      if (fsEl) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
        try {
          const r = exit && exit.call(doc);
          if (r && r.catch) r.catch(() => {});
        } catch {
          /* ignore */
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const root = overlayRef.current;
    closeRef.current?.focus();

    const focusable = () => {
      if (!root) return [];
      return [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.getAttribute('aria-hidden') !== 'true');
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === 'ArrowLeft') onPrevRef.current();
      if (e.key === 'ArrowRight') onNextRef.current();
      if (e.key !== 'Tab') return;
      const list = focusable();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen || !photo) {
    // Keep the id in the document so aria-controls on the opener stays valid
    // while the dialog is collapsed.
    return id ? <div id={id} hidden /> : null;
  }

  const { equipment, specs } = captionFor(photo);
  const shareUrl = photo.href;
  const label = photo.title || photo.alt || 'Photograph';

  return (
    <div
      id={id}
      ref={overlayRef}
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={photo.title ? titleId : undefined}
      aria-label={photo.title ? undefined : label}
    >
      <button
        ref={closeRef}
        type="button"
        className={styles.closeBtn}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close lightbox"
        title="Close (Esc)"
      >
        ✕
      </button>

      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageWrapper}>
          <ResponsiveImage
            key={photo.src}
            pictureClassName={styles.picture}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes={SIZES}
            srcSet={photo.width ? `${photo.src} ${photo.width}w` : undefined}
            avifSrcSet={photo.fullAvif && photo.width ? `${photo.fullAvif} ${photo.width}w` : undefined}
            fetchPriority="high"
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className={styles.caption}>
          {photo.title && <h2 id={titleId} className={styles.title}>{photo.title}</h2>}
          {(equipment || specs) && (
            <div className={styles.metaBlock}>
              {equipment && <p className={styles.meta}>{equipment}</p>}
              {specs && <p className={styles.meta}>{specs}</p>}
            </div>
          )}
          <ShareButton title={photo.title} url={shareUrl} className={styles.share} toastClassName={styles.toast} />
        </div>
      </div>

      <button type="button" className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous image" title="Previous (←)">
        ‹
      </button>
      <button type="button" className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next image" title="Next (→)">
        ›
      </button>
    </div>
  );
}

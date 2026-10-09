import { useEffect, useRef } from 'react';
import ShareButton from './ShareButton';
import ResponsiveImage from './ResponsiveImage';
import { captionFor } from '@/lib/photoCaption';
import styles from '@/styles/Lightbox.module.css';

// Overlay padding is the gutter (40px from 768px up, 16px below). The panel
// itself stops at 1600px. One candidate today (the 1600px-wide full); AVIF
// wins when a sibling exists.
const SIZES = '(max-width: 768px) calc(100vw - 32px), min(1600px, calc(100vw - 80px))';

export default function Lightbox({ isOpen, photo, onClose, onPrev, onNext }) {
  const overlayRef = useRef(null);

  // Native fullscreen where the platform allows it (desktop browsers, Android).
  // iPhone Safari has no element fullscreen, so there the overlay itself is the
  // fullscreen experience. If the browser leaves fullscreen (Esc, swipe, system
  // UI), close the lightbox too so the two states never disagree.
  useEffect(() => {
    if (!isOpen) return;
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
      else if (entered) onClose();
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
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !photo) return null;

  const { equipment, specs } = captionFor(photo);
  const shareUrl = photo.href;

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={photo.title || photo.alt}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close lightbox" title="Close (Esc)">
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
          {photo.title && <h2 className={styles.title}>{photo.title}</h2>}
          {(equipment || specs) && (
            <div className={styles.metaBlock}>
              {equipment && <p className={styles.meta}>{equipment}</p>}
              {specs && <p className={styles.meta}>{specs}</p>}
            </div>
          )}
          <ShareButton title={photo.title} url={shareUrl} className={styles.share} toastClassName={styles.toast} />
        </div>
      </div>

      <button type="button" className={`${styles.navBtn} ${styles.prevBtn}`} onClick={onPrev} aria-label="Previous image" title="Previous (←)">
        ‹
      </button>
      <button type="button" className={`${styles.navBtn} ${styles.nextBtn}`} onClick={onNext} aria-label="Next image" title="Next (→)">
        ›
      </button>
    </div>
  );
}

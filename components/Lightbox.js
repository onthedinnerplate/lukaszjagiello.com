import { useEffect } from 'react';
import Image from 'next/image';
import { captionFor } from '@/lib/photoCaption';
import styles from '@/styles/Lightbox.module.css';

export default function Lightbox({ isOpen, photo, onClose, onPrev, onNext }) {
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

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={photo.title || photo.alt}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close lightbox" title="Close (Esc)">
        ✕
      </button>

      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageWrapper}>
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 90vw"
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className={styles.caption}>
          {photo.title && <h2 className={styles.title}>{photo.title}</h2>}
          {equipment && <p className={styles.meta}>{equipment}</p>}
          {specs && <p className={styles.meta}>{specs}</p>}
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

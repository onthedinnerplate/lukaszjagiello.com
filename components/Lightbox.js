import { useEffect } from 'react';
import Image from 'next/image';
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

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <button
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close lightbox"
        title="Close (Esc)"
      >
        ✕
      </button>

      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageWrapper}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 90vw"
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        {photo.title && (
          <div className={styles.caption}>
            <h2 className={styles.title}>{photo.title}</h2>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <button
        className={`${styles.navBtn} ${styles.prevBtn}`}
        onClick={onPrev}
        aria-label="Previous image"
        title="Previous (←)"
      >
        ‹
      </button>
      <button
        className={`${styles.navBtn} ${styles.nextBtn}`}
        onClick={onNext}
        aria-label="Next image"
        title="Next (→)"
      >
        ›
      </button>
    </div>
  );
}

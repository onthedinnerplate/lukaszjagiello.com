import { useEffect } from 'react';
import Image from 'next/image';
import { photoMetadata as locationMetadata } from '@/lib/locations';
import { photoMetadata } from '@/lib/photoMetadata';
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

  // Extract photo number from src filename
  const photoNumMatch = photo.src.match(/lukasz-jagiello-(\d+)/);
  const photoNum = photoNumMatch ? parseInt(photoNumMatch[1], 10) : null;
  const locationData = photoNum ? (locationMetadata[photoNum] || {}) : {};
  const exifData = photoNum ? (photoMetadata[photoNum] || {}) : {};

  // Format camera and lens info
  const cameraDisplay = exifData.camera ? exifData.camera.replace('SONY ILCE-7RM3', 'Sony A7R III') : '';
  const lensDisplay = exifData.lens ? exifData.lens.replace(/FE /, '').replace(/GM OSS II/, 'GM II').replace(/GM II/, 'GM II') : '';

  // Format EXIF specs line
  const specsLine = exifData.focal_length && exifData.shutter_speed && exifData.aperture && exifData.iso
    ? `${exifData.focal_length} | ${exifData.shutter_speed} | ${exifData.aperture} | ISO ${exifData.iso}`
    : '';

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

        {(photo.title || cameraDisplay || specsLine) && (
          <div className={styles.caption}>
            {photo.title && <h2 className={styles.title}>{photo.title}</h2>}
            {(cameraDisplay || lensDisplay) && (
              <p style={{ fontSize: '0.95em', opacity: 0.85, margin: '0.5rem 0 0 0', fontWeight: 500 }}>
                {cameraDisplay} {lensDisplay}
              </p>
            )}
            {specsLine && (
              <p style={{ fontSize: '0.80em', opacity: 0.8, margin: '0.10rem 0 0 0', fontWeight: 500 }}>
                {specsLine}
              </p>
            )}
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

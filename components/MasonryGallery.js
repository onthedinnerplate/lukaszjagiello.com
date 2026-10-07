import { useEffect, useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';
import ShareButton from './ShareButton';
import { captionFor, photoNumberFromSrc } from '@/lib/photoCaption';
import styles from '@/styles/Gallery.module.css';

// Responsive `sizes` matching the column breakpoints in Gallery.module.css,
// so the browser picks the smallest srcset candidate that fills a column.
const SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const SIZES_WIDE = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw';

/**
 * 3-column masonry (CSS multi-column). Photos keep their true aspect ratio —
 * nothing is cropped, which matters for a photographer's portfolio.
 *
 * Caption under each photo: title on the left; on the right, stacked,
 *   Camera · Lens
 *   focal | shutter | aperture | ISO
 * Click any photo for the lightbox (Esc closes, arrows navigate).
 */
export default function MasonryGallery({ photos, wide = false, eagerCount = 0, headingId }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Shared links look like /gallery#photo-12 — open that photo on arrival.
  useEffect(() => {
    const m = window.location.hash.match(/^#photo-(\d+)$/);
    if (!m) return;
    const n = parseInt(m[1], 10);
    const idx = photos.findIndex((p) => photoNumberFromSrc(p.src) === n);
    if (idx >= 0) {
      setSelectedIndex(idx);
      setLightboxOpen(true);
    }
  }, [photos]);

  const handleImageClick = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };
  const handleCloseLightbox = () => setLightboxOpen(false);
  const handleNextImage = () => setSelectedIndex((prev) => (prev + 1) % photos.length);
  const handlePrevImage = () => setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className={styles.wrap}>
      <ul className={styles.masonry} aria-labelledby={headingId}>
        {photos.map((photo, i) => {
          const { equipment, specs } = captionFor(photo);
          const num = photoNumberFromSrc(photo.src);
          const shareUrl = `/gallery#photo-${num}`;
          return (
            <li key={photo.src} id={`photo-${num}`} className={styles.item}>
              <figure className={styles.figure}>
                <div className={styles.frame} style={{ backgroundColor: photo.color }}>
                  <button
                    type="button"
                    className={styles.imgBtn}
                    onClick={() => handleImageClick(i)}
                    aria-label={`View ${photo.title || photo.alt} in fullscreen`}
                    style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Image
                      src={photo.thumb || photo.src}
                      alt={photo.alt}
                      width={photo.thumbWidth || photo.width}
                      height={photo.thumbHeight || photo.height}
                      sizes={wide ? SIZES_WIDE : SIZES}
                      loading={i < eagerCount ? 'eager' : 'lazy'}
                      unoptimized
                      className={styles.img}
                    />
                  </button>
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.title}>{photo.title}</span>
                  {(equipment || specs) && (
                    <span className={styles.metaBlock}>
                      {equipment && <span className={styles.meta}>{equipment}</span>}
                      {specs && <span className={styles.meta}>{specs}</span>}
                    </span>
                  )}
                  <ShareButton title={photo.title} url={shareUrl} className={styles.share} toastClassName={styles.toast} />
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      <Lightbox
        isOpen={lightboxOpen}
        photo={photos[selectedIndex]}
        onClose={handleCloseLightbox}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
}

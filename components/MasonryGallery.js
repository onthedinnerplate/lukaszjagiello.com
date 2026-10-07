import { useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';
import { captionFor } from '@/lib/photoCaption';
import styles from '@/styles/Gallery.module.css';

// Responsive `sizes` matching the column breakpoints in Gallery.module.css,
// so the browser picks the smallest srcset candidate that fills a column.
const SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const SIZES_WIDE = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw';

/**
 * 3-column masonry (CSS multi-column). Photos keep their true aspect ratio —
 * nothing is cropped, which matters for a photographer's portfolio.
 *
 * Caption under each photo, stacked:
 *   Title
 *   Camera · Lens
 *   focal | shutter | aperture | ISO
 * Click any photo for the lightbox (Esc closes, arrows navigate).
 */
export default function MasonryGallery({ photos, wide = false, eagerCount = 0, headingId }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
          return (
            <li key={photo.src} className={styles.item}>
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
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes={wide ? SIZES_WIDE : SIZES}
                      loading={i < eagerCount ? 'eager' : 'lazy'}
                      className={styles.img}
                    />
                  </button>
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.title}>{photo.title}</span>
                  {equipment && <span className={styles.meta}>{equipment}</span>}
                  {specs && <span className={styles.meta}>{specs}</span>}
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

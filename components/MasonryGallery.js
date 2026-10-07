import { useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';
import { photoMetadata as locationMetadata } from '@/lib/locations';
import { photoMetadata } from '@/lib/photoMetadata';
import styles from '@/styles/Gallery.module.css';

// Responsive `sizes` matching the column breakpoints in Gallery.module.css,
// so the browser picks the smallest srcset candidate that fills a column.
const SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const SIZES_WIDE = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw';

/**
 * 3-column masonry (CSS multi-column). Photos keep their true aspect ratio —
 * nothing is cropped, which matters for a photographer's portfolio.
 *
 * Location and equipment data is displayed in captions. Click any photo to view it
 * fullscreen with keyboard navigation (Escape to close, arrow keys to navigate).
 */
export default function MasonryGallery({ photos, wide = false, eagerCount = 0, headingId }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImageClick = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleNextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className={styles.wrap}>
      <ul className={styles.masonry} aria-labelledby={headingId}>
        {photos.map((photo, i) => {
          // Extract photo number from src filename (e.g., "lukasz-jagiello-01" → 1)
          const photoNumMatch = photo.src.match(/lukasz-jagiello-(\d+)/);
          const photoNum = photoNumMatch ? parseInt(photoNumMatch[1], 10) : null;
          const locationData = photoNum ? (locationMetadata[photoNum] || {}) : {};
          const exifData = photoNum ? (photoMetadata[photoNum] || {}) : {};

          // Format camera and lens info (simplified for display)
          const cameraDisplay = exifData.camera ? exifData.camera.replace('SONY ILCE-7RM3', 'Sony A7R III') : '';
          const lensDisplay = exifData.lens ? exifData.lens.replace(/FE /, '').replace(/GM OSS II/, 'GM II').replace(/GM II/, 'GM II') : '';

          // Format EXIF specs line
          const specsLine = exifData.focal_length && exifData.shutter_speed && exifData.aperture && exifData.iso
            ? `${exifData.focal_length} | ${exifData.shutter_speed} | ${exifData.aperture} | ISO ${exifData.iso}`
            : '';

          return (
            <li key={photo.src} className={styles.item}>
              <figure className={styles.figure}>
                <div className={styles.frame} style={{ backgroundColor: photo.color }}>
                  <button
                    className={styles.imgBtn}
                    onClick={() => handleImageClick(i)}
                    aria-label={`View ${photo.alt} in fullscreen`}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
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
                  {(cameraDisplay || lensDisplay) && (
                    <span style={{ display: 'block', fontSize: '0.80em', opacity: 0.8, marginTop: '0.25rem', fontWeight: 500 }}>
                      {cameraDisplay} {lensDisplay}
                    </span>
                  )}
                  {specsLine && (
                    <span style={{ display: 'block', fontSize: '0.75em', opacity: 0.65, marginTop: '0.15rem', fontFamily: 'monospace' }}>
                      {specsLine}
                    </span>
                  )}
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

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';
import { LOCATIONS, locationSlug } from '@/lib/photos';
import styles from '@/styles/Gallery.module.css';

// Responsive `sizes` matching the column breakpoints in Gallery.module.css,
// so the browser picks the smallest srcset candidate that fills a column.
const SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const SIZES_WIDE = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw';

/**
 * 3-column masonry (CSS multi-column). Photos keep their true aspect ratio —
 * nothing is cropped, which matters for a photographer's portfolio.
 *
 * Filtering: every tile carries data-location; the filter bar renders only
 * when `filterable` is true (NEXT_PUBLIC_GALLERY_FILTERS=true). The logic is
 * already wired, so activation is a config flip, not a code change.
 */
export default function MasonryGallery({ photos, filterable = false, wide = false, eagerCount = 0, headingId }) {
  const [active, setActive] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const visible = active === 'all' ? photos : photos.filter((p) => locationSlug(p.location) === active);
  const filters = [{ slug: 'all', label: 'All' }, ...LOCATIONS.map((l) => ({ slug: locationSlug(l), label: l }))];

  const handleImageClick = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleNextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % visible.length);
  };

  const handlePrevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + visible.length) % visible.length);
  };

  return (
    <div className={styles.wrap}>
      {filterable && (
        <div className={styles.filters} role="group" aria-label="Filter photos by location">
          {filters.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              className={styles.filter}
              data-filter={slug}
              aria-pressed={active === slug}
              onClick={() => setActive(slug)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {filterable && (
        <p className={styles.srOnly} aria-live="polite">
          Showing {visible.length} of {photos.length} photos
        </p>
      )}
      <ul className={styles.masonry} aria-labelledby={headingId}>
        {visible.map((photo, i) => (
          <li key={photo.id} className={styles.item} data-location={locationSlug(photo.location)}>
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
                <span className={styles.tag}>{photo.location}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <Lightbox
        isOpen={lightboxOpen}
        photo={visible[selectedIndex]}
        onClose={handleCloseLightbox}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
}

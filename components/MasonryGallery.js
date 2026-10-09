import { useEffect, useState } from 'react';
import Link from 'next/link';
import Lightbox from './Lightbox';
import ShareButton from './ShareButton';
import BuyIcon from './BuyIcon';
import ResponsiveImage from './ResponsiveImage';
import { captionFor, photoNumberFromSrc } from '@/lib/photoCaption';
import styles from '@/styles/Gallery.module.css';

// Slot width at the column breakpoints in Gallery.module.css.
// Homepage (max 1400): ~427px at 1440, so 30vw. Gallery (max 1600): ~440px, so 32vw.
// Portrait frames need the 1920px-long thumb at 2x; landscapes are covered by 1200.
const SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw';
const SIZES_WIDE = '(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 32vw';

/**
 * 3-column masonry (CSS multi-column). Photos keep their true aspect ratio —
 * nothing is cropped, which matters for a photographer's portfolio.
 *
 * Caption under each photo: title on the left; on the right, stacked,
 *   Camera · Lens
 *   focal | shutter | aperture | ISO
 * Click any photo for the lightbox (Esc closes, arrows navigate).
 */
export default function MasonryGallery({ photos, wide = false, priorityCount = 0, headingId }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Shared links look like /gallery#photo-12 — open that photo on arrival,
  // including when the hash changes without a full reload.
  useEffect(() => {
    const openFromHash = () => {
      const m = window.location.hash.match(/^#photo-(\d+)$/);
      if (!m) return;
      const n = parseInt(m[1], 10);
      const idx = photos.findIndex((p) => photoNumberFromSrc(p.src) === n);
      if (idx >= 0) {
        setSelectedIndex(idx);
        setLightboxOpen(true);
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [photos]);

  const handleImageClick = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };
  // Cards are real links to /photo/<slug> so crawlers (and middle-click,
  // ctrl/cmd-click, "open in new tab") reach the photo pages. A plain left
  // click is intercepted to open the lightbox instead.
  const onCardClick = (e, index) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    handleImageClick(index);
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
          const shareUrl = photo.href;
          const sizes = wide ? SIZES_WIDE : SIZES;
          const prioritized = i < priorityCount;
          return (
            <li key={photo.src} id={`photo-${num}`} className={styles.item}>
              <figure className={styles.figure}>
                <div className={styles.frame} style={{ backgroundColor: photo.color }}>
                  <span className={styles.cardActions}>
                    <BuyIcon photo={photo} className={styles.share} />
                    <ShareButton title={photo.title} url={shareUrl} className={styles.share} toastClassName={styles.toast} wrapperClassName={styles.shareWrap} />
                  </span>
                  <Link
                    href={photo.href || `/gallery#photo-${num}`}
                    className={styles.imgBtn}
                    onClick={(e) => onCardClick(e, i)}
                    aria-label={`${photo.title || photo.alt} — view fullscreen`}
                    style={{ display: 'block', width: '100%', cursor: 'pointer' }}
                  >
                    <ResponsiveImage
                      pictureClassName={styles.picture}
                      src={photo.thumb || photo.src}
                      alt={photo.alt}
                      width={photo.thumbWidth || photo.width}
                      height={photo.thumbHeight || photo.height}
                      sizes={sizes}
                      srcSet={photo.thumbSrcSet}
                      className={styles.img}
                      loading={prioritized ? 'eager' : 'lazy'}
                      fetchPriority={prioritized ? 'high' : undefined}
                    />
                  </Link>
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.title}>
                    {photo.href ? <Link href={photo.href} className={styles.titleLink}>{photo.title}</Link> : photo.title}
                    {photo.location ? <span className={styles.location}>{photo.location}</span> : null}
                  </span>
                  {(equipment || specs) && (
                    <span className={styles.metaBlock}>
                      {equipment && <span className={styles.meta}>{equipment}</span>}
                      {specs && <span className={styles.meta}>{specs}</span>}
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

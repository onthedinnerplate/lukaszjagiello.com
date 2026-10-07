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

// Resource width when the long edge is `edge` px. Portrait frames are narrower
// than the long edge, so the srcSet `w` descriptor has to be the real width.
function widthAtLongEdge(width, height, edge) {
  const long = Math.max(width || 0, height || 0);
  if (!long) return edge;
  const scale = Math.min(1, edge / long);
  return Math.max(1, Math.round((width || long) * scale));
}

function thumbSrcSet(photo) {
  const thumb = photo.thumb || '';
  if (!thumb.endsWith('-thumb.webp') || !photo.width || !photo.height) return null;
  const base = thumb.slice(0, -'-thumb.webp'.length);
  const w400 = widthAtLongEdge(photo.width, photo.height, 400);
  const w800 = photo.thumbWidth || widthAtLongEdge(photo.width, photo.height, 800);
  const w1200 = widthAtLongEdge(photo.width, photo.height, 1200);
  return `${base}-thumb-400.webp ${w400}w, ${base}-thumb.webp ${w800}w, ${base}-thumb-1200.webp ${w1200}w`;
}

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
          const shareUrl = photo.href;
          const sizes = wide ? SIZES_WIDE : SIZES;
          const srcSet = thumbSrcSet(photo);
          const prioritized = i < priorityCount;
          return (
            <li key={photo.src} id={`photo-${num}`} className={styles.item}>
              <figure className={styles.figure}>
                <div className={styles.frame} style={{ backgroundColor: photo.color }}>
                  <ShareButton title={photo.title} url={shareUrl} className={styles.share} toastClassName={styles.toast} wrapperClassName={styles.shareWrap} />
                  <button
                    type="button"
                    className={styles.imgBtn}
                    onClick={() => handleImageClick(i)}
                    aria-label={`View ${photo.title || photo.alt} in fullscreen`}
                    style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    {/* next/image drops srcSet when unoptimized, so the three
                        pre-encoded thumbs are declared on <source>. The img stays
                        unoptimized and is the fallback. */}
                    <picture className={styles.picture}>
                      {srcSet ? <source srcSet={srcSet} sizes={sizes} type="image/webp" /> : null}
                      <Image
                        src={photo.thumb || photo.src}
                        alt={photo.alt}
                        width={photo.thumbWidth || photo.width}
                        height={photo.thumbHeight || photo.height}
                        sizes={sizes}
                        {...(prioritized ? { priority: true } : { loading: 'lazy' })}
                        unoptimized
                        className={styles.img}
                      />
                    </picture>
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

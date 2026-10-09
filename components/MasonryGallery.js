import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import Lightbox from './Lightbox';
import { PhotoCardActions } from './ShareButtons';
import Swatches from './Swatches';
import ResponsiveImage from './ResponsiveImage';
import { captionFor, mentionsGear, photoNumberFromSrc } from '@/lib/photoCaption';
import { AffiliateDisclosure, GearLine, gearBlockClass, gearLineClass } from './GearStoreLinks';
import { ogImageSrc } from '@/lib/slug';
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
export default function MasonryGallery({
  photos,
  sequence = null,
  linkCategory = '',
  wide = false,
  priorityCount = 0,
  headingId,
  layout = 'masonry',
  anchor = true,
  grayscale = true,
  equalCards = false,
  palettes = null,
  swatchesMode = 'always',
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lightboxId = useId();
  // Display order can differ from the order next/prev walks. `sequence` is the
  // catalog order for the active category; the grid itself uses `photos`.
  const viewing = sequence && sequence.length ? sequence : photos;

  const cardHref = (photo, num) => {
    const base = photo.href || `/gallery#photo-${num}`;
    if (!linkCategory || linkCategory === 'all' || !photo.href) return base;
    return `${photo.href}?category=${encodeURIComponent(linkCategory)}`;
  };

  // Shared links look like /gallery#photo-12 — open that photo on arrival,
  // including when the hash changes without a full reload.
  useEffect(() => {
    if (!anchor) return undefined;
    const openFromHash = () => {
      const m = window.location.hash.match(/^#photo-(\d+)$/);
      if (!m) return;
      const n = parseInt(m[1], 10);
      const idx = viewing.findIndex((p) => photoNumberFromSrc(p.src) === n);
      if (idx >= 0) {
        setSelectedIndex(idx);
        setLightboxOpen(true);
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [viewing, anchor]);

  const handleImageClick = (index) => {
    const photo = photos[index];
    const seqIndex = viewing.findIndex((p) => p.src === photo?.src);
    setSelectedIndex(seqIndex >= 0 ? seqIndex : 0);
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
  const handleNextImage = () => setSelectedIndex((prev) => (prev + 1) % viewing.length);
  const handlePrevImage = () => setSelectedIndex((prev) => (prev - 1 + viewing.length) % viewing.length);

  const showDisclosure = photos.some((photo) => mentionsGear(captionFor(photo).equipment));
  const tiled = layout === 'uniform' || layout === 'tight';
  const listClass = tiled
    ? `${styles.uniform} ${layout === 'tight' ? styles.tight : ''}`
    : layout === 'row'
      ? styles.saleRow
      : layout === 'trio'
        ? styles.saleTrio
        : styles.masonry;

  return (
    <div className={styles.wrap}>
      <ul
        className={equalCards ? `${listClass} ${styles.equalCards}` : listClass}
        aria-labelledby={headingId}
      >
        {photos.map((photo, i) => {
          const { equipment, specs } = captionFor(photo);
          const num = photoNumberFromSrc(photo.src);
          const shareUrl = photo.href;
          const href = cardHref(photo, num);
          const sizes = layout === 'row'
            ? '(max-width: 768px) 100vw, 25vw'
            : layout === 'trio'
              ? '(max-width: 768px) 100vw, 33vw'
              : (wide ? SIZES_WIDE : SIZES);
          const prioritized = i < priorityCount;
          const palette = palettes?.[String(num)];
          return (
            <li key={photo.src} id={anchor ? `photo-${num}` : undefined} className={styles.item}>
              <figure className={`${styles.figure} ${tiled ? styles.tileFigure : ''}`}>
                <div className={`${styles.frame} ${tiled ? styles.frameCover : ''}`} style={{ backgroundColor: photo.color }}>
                  <PhotoCardActions
                    title={photo.title}
                    shareUrl={shareUrl}
                    pinUrl={shareUrl}
                    mediaUrl={ogImageSrc(photo.src) || photo.src}
                    photo={photo}
                  />
                  <Link
                    href={href}
                    className={styles.imgBtn}
                    onClick={(e) => onCardClick(e, i)}
                    aria-expanded={lightboxOpen && selectedIndex === i}
                    aria-controls={lightboxId}
                    style={{ display: 'block', width: '100%', height: tiled ? '100%' : undefined, cursor: 'pointer' }}
                  >
                    <ResponsiveImage
                      pictureClassName={styles.picture}
                      src={photo.thumb || photo.src}
                      alt={photo.alt}
                      width={photo.thumbWidth || photo.width}
                      height={photo.thumbHeight || photo.height}
                      sizes={sizes}
                      srcSet={photo.thumbSrcSet}
                      className={grayscale ? styles.img : `${styles.img} ${styles.imgColor}`}
                      style={{ '--focus': photo.focus || 'center' }}
                      loading={prioritized ? 'eager' : 'lazy'}
                      fetchPriority={prioritized ? 'high' : undefined}
                    />
                  </Link>
                </div>
                {Array.isArray(palette) && palette.length ? (
                  <div className={swatchesMode === 'phone' ? `${styles.cardSwatches} ${styles.cardSwatchesPhone}` : styles.cardSwatches}>
                    <Swatches shape={{ palette }} compact />
                  </div>
                ) : null}
                <figcaption className={styles.caption}>
                  <span className={styles.title}>
                    {photo.href ? <Link href={href} className={styles.titleLink}>{photo.title}</Link> : photo.title}
                    {photo.location ? <span className={styles.location}>{photo.location}</span> : null}
                  </span>
                  {(equipment || specs) && (
                    <span className={`${styles.metaBlock} ${gearBlockClass}`}>
                      {equipment && (
                        <span className={`${styles.meta} ${gearLineClass}`}>
                          <GearLine text={equipment} />
                        </span>
                      )}
                      {specs && <span className={styles.meta}>{specs}</span>}
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      {showDisclosure ? <AffiliateDisclosure /> : null}

      <Lightbox
        id={lightboxId}
        isOpen={lightboxOpen}
        photo={viewing[selectedIndex]}
        onClose={handleCloseLightbox}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
}

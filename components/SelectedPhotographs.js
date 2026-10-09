import { useId, useState } from 'react';
import { PhotoCardActions } from '@/components/ShareButtons';
import Lightbox from '@/components/Lightbox';
import ResponsiveImage from '@/components/ResponsiveImage';
import Swatches from '@/components/Swatches';
import { GearLine } from '@/components/GearStoreLinks';
import { captionFor, photoNumberFromSrc } from '@/lib/photoCaption';
import { ogImageSrc } from '@/lib/slug';
import palettes from '@/lib/photoPalettes.json';
import styles from '@/styles/Gallery.module.css';

/** The four-pillar row, in display order. Shared by the homepage and the gallery. */
export const SELECTED_NUMBERS = [41, 39, 12, 38];

export function selectedPhotos(photos) {
  const byNumber = new Map((photos || []).map((photo) => [photoNumberFromSrc(photo.src), photo]));
  return SELECTED_NUMBERS.map((n) => byNumber.get(n)).filter(Boolean);
}

/**
 * Marymere's falls are a narrow column at 66% of the 1600×1000 frame.
 * A 3/4 cover crop shows 46.9% of that width. object-position is not
 * "put this source point here": 66% pins the falls at 65% of the card.
 * This percentage places the 66% column at the center of the card.
 */
const MARYMERE_FALLS_X = 0.66;
const SELECTED_ASPECT = 3 / 4;

function cropPosition(photo) {
  if (photoNumberFromSrc(photo.src) !== 41) return 'center';
  const imageAspect = (photo.width > 0 && photo.height > 0) ? photo.width / photo.height : 1.6;
  const ratio = imageAspect / SELECTED_ASPECT;
  const x = ((0.5 - MARYMERE_FALLS_X * ratio) / (1 - ratio)) * 100;
  return `${Math.round(x * 100) / 100}% 50%`;
}

/** Gallery "Selected photographs" row. Homepage uses this same component. */
export default function SelectedPhotographs({ photos }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const lightboxId = useId();
  if (!photos?.length) return null;
  return (
    <>
      <div className={styles.selectedRow}>
        {photos.map((photo, i) => {
          const num = photoNumberFromSrc(photo.src);
          const palette = palettes[String(num)];
          const { equipment, specs } = captionFor(photo);
          return (
            <div key={photo.src} className={styles.selectedItem}>
              <div className={styles.selectedCell} style={{ backgroundColor: photo.color }}>
                <PhotoCardActions
                  title={photo.title}
                  shareUrl={photo.href}
                  pinUrl={photo.href}
                  mediaUrl={ogImageSrc(photo.src) || photo.src}
                  photo={photo}
                />
                <button
                  type="button"
                  className={styles.selectedOpen}
                  onClick={() => { setIndex(i); setOpen(true); }}
                  aria-label={photo.title}
                  aria-expanded={open && index === i}
                  aria-controls={lightboxId}
                >
                  <ResponsiveImage
                    pictureClassName={styles.selectedPicture}
                    src={photo.thumb || photo.src}
                    alt={photo.alt}
                    width={photo.thumbWidth || photo.width}
                    height={photo.thumbHeight || photo.height}
                    sizes="(max-width: 767px) 50vw, 20vw"
                    srcSet={photo.thumbSrcSet}
                    className={styles.selectedImg}
                    style={{ objectPosition: cropPosition(photo) }}
                    loading={i < 2 ? 'eager' : 'lazy'}
                  />
                </button>
              </div>
              <div className={styles.selectedDetails}>
                {Array.isArray(palette) && palette.length ? <Swatches shape={{ palette }} compact /> : null}
                <p className={styles.selectedTitle}>{photo.title}</p>
                {photo.location ? <p className={styles.selectedLoc}>{photo.location}</p> : null}
                {equipment ? <p className={styles.selectedMeta}><GearLine text={equipment} /></p> : null}
                {specs ? <p className={styles.selectedMeta}>{specs}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
      <Lightbox
        id={lightboxId}
        isOpen={open}
        photo={photos[index]}
        onClose={() => setOpen(false)}
        onPrev={() => setIndex((n) => (n - 1 + photos.length) % photos.length)}
        onNext={() => setIndex((n) => (n + 1) % photos.length)}
      />
    </>
  );
}

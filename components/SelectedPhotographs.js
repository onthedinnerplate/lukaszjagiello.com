import { useId, useState } from 'react';
import { PhotoCardActions } from '@/components/ShareButtons';
import Lightbox from '@/components/Lightbox';
import ResponsiveImage from '@/components/ResponsiveImage';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { ogImageSrc } from '@/lib/slug';
import styles from '@/styles/Gallery.module.css';

/** The four-pillar row, in display order. Shared by the homepage and the gallery. */
export const SELECTED_NUMBERS = [41, 39, 12, 38];

export function selectedPhotos(photos) {
  const byNumber = new Map((photos || []).map((photo) => [photoNumberFromSrc(photo.src), photo]));
  return SELECTED_NUMBERS.map((n) => byNumber.get(n)).filter(Boolean);
}

/** Marymere's falls sit in a narrow column at 63.5–67.6% of the 1600×1000 frame. */
function cropPosition(photo) {
  if (photoNumberFromSrc(photo.src) === 41) return '66% 50%';
  return 'center';
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
        {photos.map((photo, i) => (
          <div key={photo.src} className={styles.selectedCell} style={{ backgroundColor: photo.color }}>
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
                sizes="(max-width: 768px) 25vw, 20vw"
                srcSet={photo.thumbSrcSet}
                className={styles.selectedImg}
                style={{ objectPosition: cropPosition(photo) }}
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            </button>
          </div>
        ))}
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

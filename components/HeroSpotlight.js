import { useEffect, useRef, useState } from 'react';
import { PhotoCardActions } from './ShareButtons';
import ResponsiveImage from './ResponsiveImage';
import { ogImageSrc } from '@/lib/slug';
import styles from '@/styles/Home.module.css';

// The 2×2 block inside the 1400px hero. Cover-crop draws a landscape about
// 520px wide; 2× needs the 1200px thumb, not the 800.
const SPOTLIGHT_SIZES = '(min-width: 901px) 520px, 100vw';

/**
 * Hover reveal over the hero's 2×2 block. Nothing moves on its own.
 *
 * Hover one of the four small tiles (slots 1–4) → its photo slides in from the
 * right edge and covers the whole 2×2 block; leaving the collage slides it back
 * out. The tall Golden Gate tile (slot 0) is static and never triggers this.
 * Clicking the slid-in photo opens the lightbox; it carries a share disc too.
 *
 * Compositor-only (transform + opacity). Disabled under 900px where the grid
 * isn't a 3×2; instant for reduced-motion users (CSS).
 */
export default function HeroSpotlight({ photos, hoverIndex, onHover, onSelect }) {
  const [slot, setSlot] = useState(null); // last hovered small-tile slot (1–4)
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 901px)');
    const update = () => setEnabled(wide.matches);
    update();
    wide.addEventListener('change', update);
    return () => wide.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (hoverIndex == null || hoverIndex === 0) {
      setOpen(false); // slide back out to the right
      return undefined;
    }
    if (hoverIndex !== slot) {
      if (open) {
        // Already covering the block: just swap the photo (CSS crossfades it).
        setSlot(hoverIndex);
      } else {
        // Closed: snap the new photo off-screen right, then slide in next frame.
        setSlot(hoverIndex);
        raf.current = requestAnimationFrame(() => {
          raf.current = requestAnimationFrame(() => setOpen(true));
        });
      }
    } else {
      setOpen(true);
    }
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverIndex]);

  // While the panel covers the block, map pointer position to the quadrant
  // beneath it so sweeping across still switches photos (TL=1, TR=2, BL=3, BR=4).
  const onMove = (e) => {
    if (!open || !onHover) return;
    const r = e.currentTarget.getBoundingClientRect();
    const right = e.clientX - r.left > r.width / 2;
    const bottom = e.clientY - r.top > r.height / 2;
    const idx = 1 + (right ? 1 : 0) + (bottom ? 2 : 0);
    if (idx !== hoverIndex) onHover(idx);
  };

  if (!enabled || slot == null || !photos[slot]) return null;

  const photo = photos[slot];
  const shareUrl = photo.href;

  return (
    <div className={`${styles.spotlight} ${open ? styles.spotOpen : ''}`} aria-hidden="true">
      <div
        className={styles.spotPanel}
        onClick={() => open && onSelect && onSelect(photo)}
        onMouseMove={onMove}
        style={{ cursor: open ? 'pointer' : 'default' }}
      >
        <ResponsiveImage
          key={photo.src}
          pictureClassName={styles.heroPicture}
          src={photo.thumb || photo.src}
          alt=""
          width={photo.thumbWidth || photo.width}
          height={photo.thumbHeight || photo.height}
          sizes={SPOTLIGHT_SIZES}
          srcSet={photo.thumbSrcSet}
          style={{ objectFit: 'cover', objectPosition: photo.focus || '50% 50%' }}
        />
        <PhotoCardActions
          title={photo.title}
          shareUrl={shareUrl}
          pinUrl={shareUrl}
          mediaUrl={ogImageSrc(photo.src) || photo.src}
          photo={photo}
        />
      </div>
    </div>
  );
}

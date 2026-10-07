import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

// Collapsed clip rectangles, one per hero slot (index = DOM order of tiles):
// 0 = tall left tile, 1 = TL, 2 = TR, 3 = BL, 4 = BR of the 2×2 block.
const SLOT_CLASS = [styles.spotTall, styles.spotTL, styles.spotTR, styles.spotBL, styles.spotBR];

/**
 * Hover-driven reveal over the hero collage. Nothing moves on its own.
 *
 * - Hover one of the four small tiles → its photo expands to fill the 2×2
 *   block (revealing more of the frame at its focal point), collapses on leave.
 * - Hover the tall Golden Gate tile → it expands across the whole collage,
 *   shown uncropped (letterboxed on dark) so the entire frame is visible.
 * - Click the expanded photo → opens the lightbox (same as clicking the tile).
 *
 * `hoverIndex` is owned by the page (tiles set it on mouseenter, the grid
 * clears it on mouseleave). Disabled on narrow layouts, where the grid is
 * not a 3×2, and the transition is instant for reduced-motion users (CSS).
 */
export default function HeroSpotlight({ photos, hoverIndex, onSelect }) {
  const [slot, setSlot] = useState(null); // which rectangle the layer is clipped to
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

  // Two-step so the expand always animates from the hovered tile's rectangle:
  // first snap (collapsed, invisible) to that slot, then open on the next frame.
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (hoverIndex == null) {
      setOpen(false); // collapses back to the current slot, then fades
      return undefined;
    }
    setSlot(hoverIndex);
    setOpen(false);
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => setOpen(true));
    });
    return () => cancelAnimationFrame(raf.current);
  }, [hoverIndex]);

  if (!enabled || slot == null || photos.length < 5) return null;

  const photo = photos[slot];
  const isTall = slot === 0;

  return (
    <div
      className={[
        styles.spotlight,
        SLOT_CLASS[slot],
        open ? (isTall ? styles.spotOpenFull : styles.spotOpenBlock) : '',
        isTall ? styles.spotContain : '',
      ].join(' ')}
      aria-hidden="true"
      onClick={() => open && onSelect && onSelect(photo)}
      style={{ cursor: open ? 'pointer' : 'default' }}
    >
      <Image
        key={photo.src}
        src={photo.thumb || photo.src}
        alt=""
        fill
        sizes="(max-width: 900px) 100vw, 60vw"
        unoptimized
        style={{ objectFit: isTall ? 'contain' : 'cover', objectPosition: isTall ? '50% 50%' : photo.focus || '50% 50%' }}
      />
    </div>
  );
}

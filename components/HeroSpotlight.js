import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ShareButton from './ShareButton';
import styles from '@/styles/Home.module.css';

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
        <Image
          key={photo.src}
          src={photo.thumb || photo.src}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 45vw"
          unoptimized
          style={{ objectFit: 'cover', objectPosition: photo.focus || '50% 50%' }}
        />
        <span className={styles.cardActions}>
          {photo.forSale && photo.href ? (
            <Link href={`${photo.href}#buy`} className={styles.share} aria-label={`Buy a download of ${photo.title}`} title="Buy a download">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </Link>
          ) : null}
          <ShareButton
            title={photo.title}
            url={shareUrl}
            className={styles.share}
            toastClassName={styles.toast}
            wrapperClassName={styles.shareWrap}
          />
        </span>
      </div>
    </div>
  );
}

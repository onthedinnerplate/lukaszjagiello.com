import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

// Timing (ms). Whole cycle per tile ≈ OPEN + HOLD + CLOSE + GAP = 5000.
const OPEN = 600;
const HOLD = 3500;
const CLOSE = 600;
const GAP = 300;

// Slot order is clockwise through the 2×2 block: TL → TR → BR → BL.
// `photos` must be the four small-tile photos in DOM order (TL, TR, BL, BR).
const CLOCKWISE = [0, 1, 3, 2];
const SLOT_CLASS = [styles.spotTL, styles.spotTR, styles.spotBL, styles.spotBR];

/**
 * Spotlight cycle over the hero's 2×2 block. Every ~5s one tile's photo
 * expands to fill the whole block (revealing more of the frame, not zooming),
 * holds, collapses back, then the next tile clockwise takes its turn.
 * Pauses on hover; off entirely for reduced-motion users and on narrow
 * layouts where the block isn't a 2×2.
 */
export default function HeroSpotlight({ photos }) {
  const [step, setStep] = useState(0); // index into CLOCKWISE
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const paused = useRef(false);
  const timers = useRef([]);
  const el = useRef(null);

  // Pause while the pointer is anywhere over the collage (the parent grid).
  useEffect(() => {
    const grid = el.current?.parentElement;
    if (!grid) return undefined;
    const on = () => (paused.current = true);
    const off = () => (paused.current = false);
    grid.addEventListener('mouseenter', on);
    grid.addEventListener('mouseleave', off);
    return () => {
      grid.removeEventListener('mouseenter', on);
      grid.removeEventListener('mouseleave', off);
    };
  }, [enabled]);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 901px)');
    const update = () => setEnabled(!motion.matches && wide.matches);
    update();
    motion.addEventListener('change', update);
    wide.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      wide.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || photos.length < 4) return undefined;
    let cancelled = false;
    const later = (fn, ms) => {
      const id = setTimeout(() => !cancelled && fn(), ms);
      timers.current.push(id);
    };
    // Wait while hovered, polling lightly, then continue.
    const whenUnpaused = (fn) => {
      const tick = () => (paused.current ? later(tick, 250) : fn());
      tick();
    };

    const run = () => {
      whenUnpaused(() => {
        setOpen(true);
        later(() => {
          whenUnpaused(() => {
            setOpen(false);
            later(() => {
              setStep((s) => (s + 1) % CLOCKWISE.length);
              later(run, GAP);
            }, CLOSE);
          });
        }, OPEN + HOLD);
      });
    };
    // Let the entrance animation finish before the first spotlight.
    later(run, 1600);

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [enabled, photos.length]);

  if (!enabled || photos.length < 4) return null;

  const slot = CLOCKWISE[step];
  const photo = photos[slot];

  return (
    <div ref={el} className={`${styles.spotlight} ${SLOT_CLASS[slot]} ${open ? styles.spotOpen : ''}`} aria-hidden="true">
      <Image
        key={photo.src}
        src={photo.thumb || photo.src}
        alt=""
        fill
        sizes="(max-width: 900px) 100vw, 40vw"
        unoptimized
        style={{ objectFit: 'cover', objectPosition: photo.focus || '50% 50%' }}
      />
    </div>
  );
}

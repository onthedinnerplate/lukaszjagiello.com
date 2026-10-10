import { useEffect, useLayoutEffect, useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import JourneysHero from '@/components/JourneysHero';
import styles from '@/styles/Journal.module.css';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Progress 0 when the hero meets the top of the viewport, 1 when it has
// scrolled its own height off the top.
const SCROLL_OFFSET = ['start start', 'end start'];

// Desktop travel. Phone (max-width 767px) uses the lighter set: less photo
// shift, less title lift, a shallower edge darkening, and no blur.
// scale keeps the translated photo covering the frame. It is anchored on the
// waterfall, so the portrait stays on the falls while the edges have room to move.
const DESKTOP = { photo: 25, lift: -40, wear: 0.85, scale: 1.56 };
const PHONE = { photo: 12, lift: -20, wear: 0.68, scale: 1.3 };
const WEAR_START = 0.5;

const REDUCE_MQ = '(prefers-reduced-motion: reduce)';
const PHONE_MQ = '(max-width: 767px)';
const CENTER_MQ = '(min-width: 769px)';

function clamp01(value) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function sample(progress, phone, center) {
  const t = clamp01(progress);
  const range = phone ? PHONE : DESKTOP;
  return {
    photo: range.photo * t,
    lift: Math.round(range.lift * t),
    wear: WEAR_START + (range.wear - WEAR_START) * t,
    opacity: 1 - t,
    scale: range.scale,
    phone,
    center,
  };
}

function copyTransform(center, liftPx) {
  if (!center) return `translate3d(0, ${liftPx}px, 0)`;
  const px = Math.abs(liftPx);
  return `translate3d(0, calc(-50% ${liftPx < 0 ? '-' : '+'} ${px}px), 0)`;
}

// Kills the one-shot photo/wear animations so inline transform and opacity
// win, and drops the header backdrop blur on phones (it repaints the hero
// on every scroll). Reduced motion keeps the live hero's static CSS.
const PREVIEW_CSS = `
@media (prefers-reduced-motion: no-preference) {
  [data-hero-parallax] .${styles.heroPhoto} {
    animation: none;
    transform-origin: 66.1% 46.77%;
    transform: translate3d(0, 0, 0) scale(${DESKTOP.scale});
  }
  [data-hero-parallax] .${styles.heroWear} {
    animation: none;
    opacity: ${WEAR_START};
  }
}
@media (prefers-reduced-motion: no-preference) and (max-width: 767px) {
  [data-hero-parallax] .${styles.heroPhoto} {
    transform-origin: 66% 47%;
    transform: translate3d(0, 0, 0) scale(${PHONE.scale});
  }
}
@media (max-width: 767px) {
  header {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    background: #fff !important;
  }
}
`;

const CLEAR_PROPS = ['transform', 'opacity', 'animation', 'filter', 'willChange', 'transformOrigin'];

function clearInline(el) {
  if (!el) return;
  for (const prop of CLEAR_PROPS) el.style[prop] = '';
}

/**
 * Homepage hero with scroll-linked parallax. The live JourneysHero is not
 * modified; this wrapper only writes transform and opacity onto its photo,
 * worn-edge overlay, and title block.
 */
export default function ParallaxJourneysHero(props) {
  const rootRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: SCROLL_OFFSET });
  const flags = useRef({ phone: false, center: false });
  const motionState = useTransform(scrollYProgress, (progress) => (
    sample(progress, flags.current.phone, flags.current.center)
  ));

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMq = window.matchMedia(REDUCE_MQ);
    const phoneMq = window.matchMedia(PHONE_MQ);
    const centerMq = window.matchMedia(CENTER_MQ);
    const els = { photo: null, wear: null, copy: null, frame: null };
    const metrics = { photoHeight: 0 };
    let mode = '';

    const grab = () => {
      els.photo = root.querySelector(`.${styles.heroPhoto}`);
      els.wear = root.querySelector(`.${styles.heroWear}`);
      els.copy = root.querySelector(`.${styles.heroCopy}`);
      els.frame = root.querySelector(`.${styles.portrait}`);
      metrics.photoHeight = els.photo ? els.photo.offsetHeight : 0;
    };

    const clear = () => {
      clearInline(els.photo);
      clearInline(els.wear);
      clearInline(els.copy);
      clearInline(els.frame);
    };

    const prime = (phone) => {
      grab();
      if (els.photo) {
        els.photo.style.animation = 'none';
        els.photo.style.filter = 'none';
        els.photo.style.transformOrigin = phone ? '66% 47%' : '66.1% 46.77%';
        els.photo.style.willChange = phone ? 'auto' : 'transform';
      }
      if (els.wear) {
        els.wear.style.animation = 'none';
        els.wear.style.filter = 'none';
        els.wear.style.willChange = phone ? 'auto' : 'opacity';
      }
      if (els.copy) {
        els.copy.style.filter = 'none';
        els.copy.style.willChange = phone ? 'auto' : 'transform, opacity';
      }
      if (els.frame) els.frame.style.willChange = phone ? 'auto' : 'transform';
    };

    // Scroll path: transform and opacity only. photoHeight is cached on resize.
    const write = (state) => {
      if (!els.photo || !els.wear || !els.copy) return;
      const y = `${state.photo}%`;
      els.photo.style.transform = `translate3d(0, ${y}, 0) scale(${state.scale})`;
      if (els.frame && metrics.photoHeight) {
        els.frame.style.transform = `translate3d(0, ${(state.photo / 100) * metrics.photoHeight}px, 0)`;
      }
      els.copy.style.opacity = String(state.opacity);
      els.copy.style.transform = copyTransform(state.center, state.lift);
      els.wear.style.opacity = String(state.wear);
    };

    const apply = () => {
      const phone = phoneMq.matches;
      const center = centerMq.matches;
      const reduce = reduceMq.matches;
      flags.current.phone = phone;
      flags.current.center = center;
      const next = `${reduce}|${phone}|${center}`;
      if (next !== mode) {
        mode = next;
        if (reduce) {
          clear();
          return;
        }
        prime(phone);
      }
      if (reduce) return;
      write(sample(scrollYProgress.get(), phone, center));
    };

    grab();
    apply();
    const unsub = motionState.on('change', (state) => {
      if (reduceMq.matches) return;
      if (!els.photo) grab();
      write(state);
    });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      grab();
      apply();
    });
    observer?.observe(root);
    if (els.photo) observer?.observe(els.photo);
    const onMode = () => apply();
    reduceMq.addEventListener('change', onMode);
    phoneMq.addEventListener('change', onMode);
    centerMq.addEventListener('change', onMode);
    const frame = requestAnimationFrame(() => {
      grab();
      apply();
    });

    return () => {
      cancelAnimationFrame(frame);
      unsub();
      observer?.disconnect();
      reduceMq.removeEventListener('change', onMode);
      phoneMq.removeEventListener('change', onMode);
      centerMq.removeEventListener('change', onMode);
      clear();
    };
  }, [motionState, scrollYProgress]);

  return (
    <div ref={rootRef} data-hero-parallax="">
      <style>{PREVIEW_CSS}</style>
      <JourneysHero {...props} />
    </div>
  );
}

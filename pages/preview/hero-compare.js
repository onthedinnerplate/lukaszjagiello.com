import { useEffect, useLayoutEffect, useRef } from 'react';
import Seo from '@/components/Seo';
import { HERO_COMPARE_PATH, HERO_PARALLAX_PATH } from '@/lib/previewRoutes';
import styles from '@/styles/Preview.module.css';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Each frame lays out at desktop width, then scales into the column so a
// laptop still shows the desktop hero side by side.
const FRAME_WIDTH = 1440;

function DesktopFrame({ title, src }) {
  const clipRef = useRef(null);
  const frameRef = useRef(null);

  useIsoLayoutEffect(() => {
    const clip = clipRef.current;
    const frame = frameRef.current;
    if (!clip || !frame) return undefined;

    const fit = () => {
      const width = clip.clientWidth;
      const height = clip.clientHeight;
      if (width < 1 || height < 1) return;
      const scale = width / FRAME_WIDTH;
      frame.style.width = `${FRAME_WIDTH}px`;
      frame.style.height = `${height / scale}px`;
      frame.style.transform = `scale(${scale})`;
    };

    fit();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(fit);
    observer.observe(clip);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className={styles.pane}>
      <figcaption className={styles.caption}>{title}</figcaption>
      <div className={styles.clip} ref={clipRef}>
        <iframe
          ref={frameRef}
          className={styles.frame}
          title={title}
          src={src}
          style={{ width: FRAME_WIDTH, height: 1600, transform: 'scale(0.5)', transformOrigin: 'top left' }}
        />
      </div>
    </figure>
  );
}

export default function HeroCompare() {
  return (
    <>
      <Seo
        title="Hero compare"
        description="Side-by-side review of the current homepage hero and the parallax preview."
        path={HERO_COMPARE_PATH}
        robots="noindex"
      />
      <h1 className="sr-only">Hero compare</h1>
      <div className={styles.compare} data-hero-compare="">
        <DesktopFrame title="Current" src="/" />
        <DesktopFrame title="Parallax" src={HERO_PARALLAX_PATH} />
      </div>
    </>
  );
}

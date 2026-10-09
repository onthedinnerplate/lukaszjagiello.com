import styles from '@/styles/Journal.module.css';

/**
 * Plain portrait photo. Replaces the clipped mosaic on Journeys cards,
 * the featured story, the closing cluster, and article pages from 769px up.
 * Swatches, maps, and article copy stay outside this frame.
 */
export default function ShapeMosaic({ src, alt, onClick }) {
  const image = <img className={styles.portraitImg} src={src} alt="" />;

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.stage} ${styles.stageBtn}`}
        onClick={onClick}
        aria-label={`View full image: ${alt}`}
      >
        {image}
      </button>
    );
  }

  return (
    <div className={styles.stage} aria-hidden="true">
      {image}
    </div>
  );
}

import styles from '@/styles/Journal.module.css';

/**
 * Portrait photo. Used on Journeys cards, the featured story, the closing
 * cluster, and article pages. Swatches, maps, and article copy stay outside
 * this frame.
 *
 * A non-empty `alt` is the photograph's description (from lib/photos.js).
 * An empty alt marks the frame decorative (the closing cluster, where the
 * pictures repeat stories already named in text) and hides it from
 * assistive tech.
 *
 * When `onClick` is set the portrait is a control that opens the lightbox.
 * The image keeps its own alt; the visually hidden "View full image" text
 * names the action without an aria-label that would replace the alt.
 */
export default function ShapeMosaic({ src, alt = '', onClick, expanded = false, controlsId }) {
  const image = <img className={styles.portraitImg} src={src} alt={alt} />;

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.stage} ${styles.stageBtn}`}
        onClick={onClick}
        aria-expanded={expanded}
        aria-controls={controlsId}
      >
        {image}
        <span className="sr-only">View full image</span>
      </button>
    );
  }

  if (!alt) {
    return (
      <div className={styles.stage} aria-hidden="true">
        {image}
      </div>
    );
  }

  return <div className={styles.stage}>{image}</div>;
}

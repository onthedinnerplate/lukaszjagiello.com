import styles from '@/styles/TrailBadge.module.css';

const RATINGS = new Set(['Easy', 'Moderate', 'Hard']);

/** Subtle AllTrails rating for an article that is about a named trail. */
export default function TrailBadge({ trail }) {
  if (!trail || !RATINGS.has(trail.difficulty) || !trail.alltrailsUrl) return null;
  const label = `AllTrails: ${trail.difficulty}`;
  return (
    <p className={styles.row}>
      <a
        className={styles.badge}
        href={trail.alltrailsUrl}
        target="_blank"
        rel="noopener"
        aria-label={`${trail.name} on AllTrails, rated ${trail.difficulty}`}
      >
        {label}
      </a>
    </p>
  );
}

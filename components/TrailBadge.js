import styles from '@/styles/TrailBadge.module.css';

const RATINGS = new Set(['Easy', 'Moderate', 'Hard']);

/** Generic trail mark. The AllTrails logo is not used. */
function TrailIcon() {
  return (
    <svg className={styles.icon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19h18" />
      <path d="M5 19l5.2-9.2a1 1 0 0 1 1.75 0L14.5 15l1.7-2.8a1 1 0 0 1 1.72 0L21 19" />
    </svg>
  );
}

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
        <TrailIcon />
        {label}
      </a>
    </p>
  );
}

import { AFFILIATE_DISCLOSURE, storeLinks } from '@/lib/affiliate';
import { splitGearLine } from '@/lib/photoCaption';
import styles from '@/styles/GearStoreLinks.module.css';

function AmazonIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M4.15 8.55c.4.85 1.2 1.3 2.15 1.3 1.35 0 2.2-.85 2.2-2.05S7.7 5.9 6.5 5.55L5.7 5.3c-.4-.12-.6-.32-.6-.62 0-.4.35-.68.9-.68.48 0 .85.2 1.05.62"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.4 11.35c2.05 1.35 4.15 1.9 5.7 1.9 2.15 0 3.9-.75 5.2-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path d="M12.55 10.15 14.3 11.4l-2.05.15z" fill="currentColor" />
    </svg>
  );
}

function BhIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <text
        x="8"
        y="11.1"
        textAnchor="middle"
        fontSize="6.4"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fill="currentColor"
      >
        B&amp;H
      </text>
    </svg>
  );
}

export function GearStoreLinks({ item, amazonUrl, bhUrl }) {
  const name = String(item || '').trim();
  if (!name) return null;
  const { amazon, bh } = storeLinks(name, { amazon: amazonUrl, bh: bhUrl });
  return (
    <span className={styles.links}>
      <a
        href={amazon}
        className={styles.link}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label={`Find ${name} on Amazon`}
        onClick={(event) => event.stopPropagation()}
      >
        <AmazonIcon />
      </a>
      <a
        href={bh}
        className={styles.link}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label={`Find ${name} on B&H Photo`}
        onClick={(event) => event.stopPropagation()}
      >
        <BhIcon />
      </a>
    </span>
  );
}

export function GearLine({ text }) {
  const parts = splitGearLine(text);
  if (!parts.length) return null;
  return parts.map((part, index) => (
    part.type === 'gear' ? (
      <span key={index} className={styles.piece}>
        {part.name}
        <GearStoreLinks item={part.name} />
      </span>
    ) : (
      <span key={index}>{part.value}</span>
    )
  ));
}

export function AffiliateDisclosure() {
  return <p className={styles.disclosure}>{AFFILIATE_DISCLOSURE}</p>;
}

export const gearLineClass = styles.line;
export const gearBlockClass = styles.block;

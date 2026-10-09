import { accentIndex, accentWords } from '@/lib/accentTitle';
import styles from '@/styles/Journal.module.css';

export default function AccentTitle({ title, color, as: Tag = 'h2', className }) {
  const words = accentWords(title);
  const idx = accentIndex(title);
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          {i === idx ? (
            <span className={styles.accentWord} style={{ color }}>{word}</span>
          ) : (
            word
          )}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

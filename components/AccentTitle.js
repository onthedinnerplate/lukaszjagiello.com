import { phraseSpan } from '@/lib/headlinePhrase';
import { headlineAccentClassName } from '@/components/headlineAccent';

/**
 * Card title using the same accent phrase and Caveat treatment as the article h1.
 * `color` overrides the accent's hero white so the word stays readable on the card.
 */
export default function AccentTitle({ title, phrase, color, as: Tag = 'h2', className }) {
  const span = phrase ? phraseSpan(title, phrase) : null;
  if (!span) return <Tag className={className}>{title}</Tag>;
  return (
    <Tag className={className}>
      {span.before}
      <span className={headlineAccentClassName} style={color ? { color } : undefined}>
        {span.phrase}
      </span>
      {span.after}
    </Tag>
  );
}

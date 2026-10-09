import { phraseSpan } from '@/lib/headlinePhrase';
import { headlineAccentClassName } from '@/components/headlineAccent';

/**
 * Article h1 with one noun or noun phrase in the shared Caveat accent.
 * `color` is that article's swatch 3 and overrides the accent's hero white.
 */
export default function HeadlinePhrase({ title, phrase, color, as: Tag = 'h1', className }) {
  const span = color ? phraseSpan(title, phrase) : null;
  if (!span) return <Tag className={className}>{title}</Tag>;
  return (
    <Tag className={className}>
      {span.before}
      <span className={headlineAccentClassName} style={{ color }}>
        {span.phrase}
      </span>
      {span.after}
    </Tag>
  );
}

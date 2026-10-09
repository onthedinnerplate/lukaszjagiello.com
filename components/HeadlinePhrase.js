import { Caveat } from 'next/font/google';
import { phraseSpan } from '@/lib/headlinePhrase';

// Lightest Caveat face. Applied only to the one headline phrase.
const caveat = Caveat({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  style: 'normal',
});

/**
 * Article h1 with one noun or noun phrase in Caveat 400.
 * `color` is that article's swatch 3. Size, spacing, and weight stay on the span.
 */
export default function HeadlinePhrase({ title, phrase, color, as: Tag = 'h1', className }) {
  const span = color ? phraseSpan(title, phrase) : null;
  if (!span) return <Tag className={className}>{title}</Tag>;
  return (
    <Tag className={className}>
      {span.before}
      <span
        className={caveat.className}
        style={{
          color,
          fontSize: '1.45em',
          lineHeight: 1,
          fontWeight: 400,
          letterSpacing: '0.02em',
          wordSpacing: '0.06em',
          marginLeft: '0.1em',
          marginRight: '0.1em',
        }}
      >
        {span.phrase}
      </span>
      {span.after}
    </Tag>
  );
}

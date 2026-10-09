import { phraseSpan } from '@/lib/headlinePhrase';
import { headlineAccentClassName } from '@/components/headlineAccent';

/**
 * Article h1 with one noun or noun phrase in the shared Caveat accent.
 * `color` is that article's middle swatch (adjusted for contrast) and is
 * passed as --accent-script. Without it the phrase stays in the title face.
 */
export default function HeadlinePhrase({ title, phrase, color, as: Tag = 'h1', className }) {
  const span = color ? phraseSpan(title, phrase) : null;
  if (!span) return <Tag className={className}>{title}</Tag>;
  return (
    <Tag className={className} style={{ '--accent-script': color }}>
      {span.before}
      <span className={headlineAccentClassName}>
        {span.phrase}
      </span>
      {span.after}
    </Tag>
  );
}

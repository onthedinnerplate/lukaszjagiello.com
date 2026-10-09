import { phraseSpan } from '@/lib/headlinePhrase';
import { headlineAccentClassName } from '@/components/headlineAccent';

/**
 * Card title using the same accent phrase and Allura treatment as the article h1.
 * `color` is that card's middle swatch (adjusted for contrast), passed as
 * --accent-script. Without a swatch the accent keeps its current color.
 */
export default function AccentTitle({ title, phrase, color, as: Tag = 'h2', className }) {
  const span = phrase ? phraseSpan(title, phrase) : null;
  if (!span) return <Tag className={className}>{title}</Tag>;
  return (
    <Tag className={className} style={color ? { '--accent-script': color } : undefined}>
      {span.before}
      <span className={headlineAccentClassName}>
        {span.phrase}
      </span>
      {span.after}
    </Tag>
  );
}

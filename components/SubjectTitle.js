import { Caveat } from 'next/font/google';
import { subjectSpan } from '@/lib/subjectNoun';

// Handwritten face for the one subject noun. Loaded here so only that span
// uses it; the rest of the description stays in the page's sans font.
const caveat = Caveat({
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
  style: 'normal',
});

/**
 * Renders a photo title with its one subject noun in `color` (swatch 3)
 * and Caveat 700. The span is 1.8em with line-height 1 so the surrounding
 * line spacing stays even, plus a little space after the word.
 */
export default function SubjectTitle({ title, subject, color }) {
  if (!title) return null;
  const span = color ? subjectSpan(title, subject) : null;
  if (!span) return title;
  return (
    <>
      {span.before}
      <span
        className={caveat.className}
        style={{ color, fontSize: '1.8em', lineHeight: 1, fontWeight: 700, marginRight: '0.15em' }}
      >
        {span.word}
      </span>
      {span.after}
    </>
  );
}

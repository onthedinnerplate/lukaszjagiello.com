import { subjectSpan } from '@/lib/subjectNoun';

/**
 * Renders a photo title with its one subject noun in `color` (swatch 3).
 * Only `color` is set — font size and weight stay whatever the parent uses.
 */
export default function SubjectTitle({ title, subject, color }) {
  if (!title) return null;
  const span = color ? subjectSpan(title, subject) : null;
  if (!span) return title;
  return (
    <>
      {span.before}
      <span style={{ color }}>{span.word}</span>
      {span.after}
    </>
  );
}

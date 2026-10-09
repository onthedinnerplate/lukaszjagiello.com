// Splits a visible title so exactly one word — the photo's subject — can be colored.
// Alt text, aria-labels, and SEO strings stay plain and never pass through here.

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * First whole-word match of `subject` inside `title`.
 * `subject` must be a single word (no spaces). Returns null when there is
 * nothing to color, so the title renders unchanged.
 */
export function subjectSpan(title, subject) {
  if (!title || !subject || /\s/u.test(subject)) return null;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(subject)}(?![\\p{L}\\p{N}])`, 'u');
  const match = re.exec(title);
  if (!match) return null;
  const start = match.index;
  const end = start + subject.length;
  return {
    before: title.slice(0, start),
    word: title.slice(start, end),
    after: title.slice(end),
  };
}

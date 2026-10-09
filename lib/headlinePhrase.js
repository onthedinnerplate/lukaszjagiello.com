// Splits a journal headline so one stored noun or noun phrase can be styled.
// The phrase has to be a whole-word match. Anything else stays plain.

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** First whole-word match of `phrase` inside `title`, or null. */
export function phraseSpan(title, phrase) {
  if (!title || !phrase || /\s{2,}/u.test(phrase)) return null;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(phrase)}(?![\\p{L}\\p{N}])`, 'u');
  const match = re.exec(title);
  if (!match) return null;
  const start = match.index;
  const end = start + phrase.length;
  return {
    before: title.slice(0, start),
    phrase: title.slice(start, end),
    after: title.slice(end),
  };
}

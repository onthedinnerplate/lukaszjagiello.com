const STOP = new Set([
  'with', 'into', 'under', 'over', 'from', 'before', 'behind', 'toward',
  'through', 'across', 'down', 'going', 'them', 'that', 'what', 'held',
]);

/** Last eligible word in a title, matching the approved mockups. */
export function accentIndex(title = '') {
  const words = String(title).split(' ');
  let idx = -1;
  words.forEach((word, i) => {
    const alnum = word.replace(/[^A-Za-z0-9]/g, '');
    if (alnum.length >= 4 && !STOP.has(alnum.toLowerCase())) idx = i;
  });
  return idx;
}

export function accentWords(title = '') {
  return String(title).split(' ');
}

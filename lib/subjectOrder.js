/**
 * Fixed tile order for the Journeys catalogue and the gallery photo grids.
 *
 * Each photograph has one subject tag. Repeated subjects (birds, beaches,
 * waterfalls, bridges, rail cars, lighthouses, iguanas, and the two dance
 * frames) are spread so the same tag is never next to itself in reading
 * order. That keeps them off the same row at 2, 3, and 4 columns. A second
 * pass also separates the same tag by four slots when it can, which is the
 * vertical neighbor on the 4-column desktop grid.
 *
 * The result depends only on the photo numbers in the list, so server render
 * and client hydration match, and a category filter spreads that subset the
 * same way every time. It is not shuffled per visit.
 */

const SUBJECT_BY_NUMBER = {
  1: 'dance',
  2: 'dance',
  3: 'lighthouse',
  4: 'lighthouse',
  5: 'beach',
  6: 'beach',
  7: 'beach',
  8: 'tower',
  9: 'rail',
  10: 'rail',
  11: 'bridge',
  12: 'bridge',
  13: 'rail',
  14: 'houses',
  15: 'bridge',
  16: 'bridge',
  17: 'redwood',
  18: 'elk',
  19: 'river',
  20: 'iguana',
  21: 'iguana',
  22: 'iguana',
  23: 'canyon',
  24: 'beach',
  25: 'beach',
  26: 'bear',
  27: 'aspen',
  28: 'homestead',
  29: 'monkey',
  30: 'umbrellas',
  31: 'bird',
  32: 'skyline',
  33: 'sail',
  34: 'waterfall',
  35: 'bird',
  36: 'waterfall',
  37: 'waterfall',
  38: 'waterfall',
  39: 'beach',
  40: 'forest',
  41: 'waterfall',
  42: 'sheep',
  43: 'bird',
  44: 'bird',
  45: 'bird',
  46: 'bird',
};

export function subjectForPhotoNumber(photoNumber) {
  const n = Number(photoNumber);
  return SUBJECT_BY_NUMBER[n] || `photo-${n}`;
}

function gapCount(subjects, gap) {
  let count = 0;
  for (let i = 0; i + gap < subjects.length; i += 1) {
    if (subjects[i] === subjects[i + gap]) count += 1;
  }
  return count;
}

/** Horizontal pairs dominate. Distance 4 is a 4-column vertical pair. */
function layoutScore(subjects) {
  return gapCount(subjects, 1) * 1_000_000
    + gapCount(subjects, 4) * 1_000
    + gapCount(subjects, 3) * 10
    + gapCount(subjects, 2);
}

function byPhotoNumber(entries) {
  return [...entries].sort((a, b) => a.n - b.n || a.tie - b.tie);
}

/**
 * Left to right. The fullest remaining subject goes in the next slot, unless
 * that would sit it beside the same subject and another subject is still
 * available. Ties prefer a subject that is not four, three, or two slots back,
 * then the earlier photo number.
 */
function placeLeftToRight(entries) {
  const groups = new Map();
  for (const entry of byPhotoNumber(entries)) {
    if (!groups.has(entry.s)) groups.set(entry.s, []);
    groups.get(entry.s).push(entry);
  }
  const placed = [];
  while (placed.length < entries.length) {
    const index = placed.length;
    const prev = index > 0 ? placed[index - 1].s : null;
    const at = (gap) => (index >= gap ? placed[index - gap].s : null);
    const ranked = [];
    for (const [subject, queue] of groups) {
      if (!queue.length) continue;
      ranked.push({
        subject,
        blocked: subject === prev ? 1 : 0,
        v4: subject === at(4) ? 1 : 0,
        v3: subject === at(3) ? 1 : 0,
        v2: subject === at(2) ? 1 : 0,
        remaining: queue.length,
        photo: queue[0].n,
        tie: queue[0].tie,
      });
    }
    const hasAlternative = ranked.some((row) => row.blocked === 0);
    ranked.sort((a, b) => (
      (hasAlternative ? a.blocked - b.blocked : 0)
      || b.remaining - a.remaining
      || a.v4 - b.v4
      || a.v3 - b.v3
      || a.v2 - b.v2
      || a.photo - b.photo
      || a.tie - b.tie
    ));
    placed.push(groups.get(ranked[0].subject).shift());
  }
  return placed;
}

function swap(list, a, b) {
  const tmp = list[a];
  list[a] = list[b];
  list[b] = tmp;
}

/**
 * Swap different subjects when it lowers the score. Pair swaps first. If a
 * horizontal pair or a 4-column vertical pair is still left, try two swaps
 * at once so a crowded category (the animal grid) can reach a layout a
 * single swap cannot step into.
 */
function separate(entries) {
  const order = entries.slice();
  const subjects = () => order.map((entry) => entry.s);
  let rounds = 0;
  while (rounds < 24) {
    rounds += 1;
    const current = subjects();
    const base = layoutScore(current);
    let best = null;
    for (let a = 0; a < order.length; a += 1) {
      for (let b = a + 1; b < order.length; b += 1) {
        if (current[a] === current[b]) continue;
        swap(current, a, b);
        const next = layoutScore(current);
        swap(current, a, b);
        if (next < base && (!best || next < best.score)) best = { a, b, score: next, kind: 'pair' };
      }
    }
    const horizontal = gapCount(current, 1);
    const vertical = gapCount(current, 4);
    if (!best && (horizontal > 0 || vertical > 0) && order.length <= 24) {
      for (let a = 0; a < order.length; a += 1) {
        for (let b = a + 1; b < order.length; b += 1) {
          if (current[a] === current[b]) continue;
          swap(current, a, b);
          for (let c = 0; c < order.length; c += 1) {
            for (let d = c + 1; d < order.length; d += 1) {
              if (c === a || c === b || d === a || d === b) continue;
              if (current[c] === current[d]) continue;
              swap(current, c, d);
              const next = layoutScore(current);
              swap(current, c, d);
              if (next < base && (!best || next < best.score)) {
                best = { a, b, c, d, score: next, kind: 'double' };
              }
            }
          }
          swap(current, a, b);
        }
      }
    }
    if (!best) break;
    swap(order, best.a, best.b);
    if (best.kind === 'double') swap(order, best.c, best.d);
  }
  return order;
}

/**
 * @param {Array} items
 * @param {(item: any) => number} photoNumberOf
 * @returns {Array} the same items, in subject-spread order
 */
export function spreadBySubject(items, photoNumberOf) {
  if (!items || items.length < 2) return items ? items.slice() : [];
  const entries = items.map((item, tie) => {
    const n = Number(photoNumberOf(item));
    const photo = Number.isFinite(n) ? n : 10000 + tie;
    return { item, n: photo, s: subjectForPhotoNumber(photo), tie };
  });
  return separate(placeLeftToRight(entries)).map((entry) => entry.item);
}

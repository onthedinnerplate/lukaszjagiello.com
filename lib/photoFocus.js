/**
 * Focal point for cover crops. focusX and focusY are fractions of the source
 * (0–1). object-position percentages do not mean "put this point in the
 * center", so these helpers solve for the percentage that does, for a known
 * frame aspect (width / height).
 */

function hasFocus(photo) {
  return photo && typeof photo.focusX === 'number' && typeof photo.focusY === 'number'
    && photo.width > 0 && photo.height > 0;
}

function clampPercent(value) {
  const clamped = Math.min(100, Math.max(0, value));
  return Math.round(clamped * 100) / 100;
}

/**
 * object-position that places `focus` at `anchor` (0–1) of the frame.
 * The other axis is unused when that side is not cropped.
 * anchor 0.5 is the middle of the frame. The article portrait passes a
 * smaller anchor so the point lands in the strip the text panel does not cover.
 */
function axisPercent(focus, imageAspect, frameAspect, axis, anchor = 0.5) {
  if (axis === 'x') {
    if (imageAspect <= frameAspect) return clampPercent(focus * 100);
    const ratio = imageAspect / frameAspect;
    return clampPercent(((anchor - focus * ratio) / (1 - ratio)) * 100);
  }
  if (imageAspect >= frameAspect) return clampPercent(focus * 100);
  const ratio = frameAspect / imageAspect;
  return clampPercent(((anchor - focus * ratio) / (1 - ratio)) * 100);
}

/**
 * One object-position for the article lead. Desktop (1440/612) crops the top
 * and bottom; phones crop the sides. Each axis is solved for the crop that
 * actually uses it.
 */
export function articleHeroObjectPosition(photo) {
  if (!hasFocus(photo)) return undefined;
  const imageAspect = photo.width / photo.height;
  const x = axisPercent(photo.focusX, imageAspect, 390 / 368, 'x');
  const y = axisPercent(photo.focusY, imageAspect, 1440 / 612, 'y');
  return `${x}% ${y}%`;
}

/**
 * 4/5 portrait beside the article text. The white panel covers the right
 * 104px (--overlap). At a ~1024px window the portrait is about 396px, so the
 * visible center is ~36% of the frame. Aim there: the falls sit in that
 * opening, and on wider windows they sit slightly left of the visible center.
 */
const PORTRAIT_VISIBLE_ANCHOR = 0.36;

export function portraitObjectPosition(photo) {
  if (!hasFocus(photo)) return undefined;
  const imageAspect = photo.width / photo.height;
  const x = axisPercent(photo.focusX, imageAspect, 4 / 5, 'x', PORTRAIT_VISIBLE_ANCHOR);
  const y = axisPercent(photo.focusY, imageAspect, 4 / 5, 'y');
  return `${x}% ${y}%`;
}

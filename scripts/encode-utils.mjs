// Shared encode settings for the gallery derivatives.
//
// Pixels are converted to sRGB and metadata (EXIF, ICC, GPS) is dropped.
// Downscales get one mild unsharp pass so a 1600px frame still reads as sharp.
// Nothing here enlarges a source: withoutEnlargement is always on.

import sharp from 'sharp';

export const WEBP_EFFORT = 6;
export const AVIF_EFFORT = 4;

// Mild output sharpen. Flat areas (below m1) are left alone so skies don't grain.
export const SHARPEN = { sigma: 0.5, m1: 0.45, m2: 0.25 };

export function fromRaw({ data, info }) {
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
    failOn: 'none',
  });
}

/**
 * Decode, optionally resize, sharpen only when the long edge actually shrinks.
 * Returns raw sRGB pixels with no alpha and no metadata.
 */
export async function renderPixels(input, resize) {
  const srcMeta = await sharp(input, { failOn: 'none' }).rotate().metadata();
  let pipeline = sharp(input, { failOn: 'none' }).rotate();
  let down = false;
  if (resize) {
    const targetLong = Math.max(resize.width || 0, resize.height || 0);
    const srcLong = Math.max(srcMeta.width || 0, srcMeta.height || 0);
    down = targetLong > 0 && srcLong > targetLong + 1;
    pipeline = pipeline.resize({ withoutEnlargement: true, ...resize });
  }
  if (down) pipeline = pipeline.sharpen(SHARPEN);
  const { data, info } = await pipeline
    .toColorspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info, downscaled: down };
}

export function encodeWebp(raw, quality) {
  return fromRaw(raw).webp({ quality, effort: WEBP_EFFORT, smartSubsample: true }).toBuffer();
}

export function encodeAvif(raw, quality) {
  return fromRaw(raw)
    .avif({ quality, effort: AVIF_EFFORT, chromaSubsampling: '4:2:0' })
    .toBuffer();
}

/** Largest quality in [minQ, maxQ] whose buffer is <= cap. Null if none fit. */
export async function bestUnder(encode, cap, minQ, maxQ) {
  const top = await encode(maxQ);
  if (top.length <= cap) return { quality: maxQ, buf: top };
  let best = null;
  let lo = minQ;
  let hi = maxQ - 1;
  while (lo <= hi) {
    const q = Math.ceil((lo + hi) / 2);
    const buf = await encode(q);
    if (buf.length <= cap) {
      best = { quality: q, buf };
      lo = q + 1;
    } else {
      hi = q - 1;
    }
  }
  return best;
}

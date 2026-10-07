// Shared caption formatting for gallery grid and lightbox so the two never drift.
import { photoMetadata } from './photoMetadata.js';

const CAMERA_NAMES = {
  'SONY ILCE-7RM3': 'Sony A7R III',
  'NIKON CORPORATION NIKON D7000': 'Nikon D7000',
};

const LENS_NAMES = {
  'FE 70-200mm F2.8 GM OSS II': '70-200mm F2.8 GM II',
  'FE 16-35mm F2.8 GM II': '16-35mm F2.8 GM II',
  'FE 20-70mm F4 G': '20-70mm F4 G',
  '18.0-105.0 mm f/3.5-5.6': '18-105mm f/3.5-5.6',
};

function prettyCamera(camera) {
  if (!camera) return '';
  return CAMERA_NAMES[camera.toUpperCase()] || camera;
}

function prettyLens(lens) {
  if (!lens) return '';
  return LENS_NAMES[lens] || lens.replace(/^FE\s+/, '').replace(/\s+OSS\b/, '').trim();
}

/** Photo number from "/images/.../lukasz-jagiello-07-thumb.webp" → 7, or null. */
export function photoNumberFromSrc(src = '') {
  const m = src.match(/lukasz-jagiello-(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Returns { equipment, specs } display strings for a photo, both '' when unknown.
 *   equipment: "Sony A7R III · 70-200mm F2.8 GM II"
 *   specs:     "117mm | 1/250s | f/2.8 | ISO 3200"
 */
export function captionFor(photo) {
  const n = photoNumberFromSrc(photo?.src);
  const d = (n && photoMetadata[n]) || null;
  if (!d) return { equipment: '', specs: '' };

  const cam = prettyCamera(d.camera);
  const lens = prettyLens(d.lens);
  const equipment = [cam, lens].filter(Boolean).join(' · ');

  const parts = [d.focal_length, d.shutter_speed, d.aperture, d.iso != null ? `ISO ${d.iso}` : ''].filter(Boolean);
  const specs = parts.join(' | ');

  return { equipment, specs };
}

// Full display names for the About page gear list (caption uses the short forms above).
const CAMERA_FULL = {
  'SONY ILCE-7RM3': 'Sony A7R III',
  'NIKON CORPORATION NIKON D7000': 'Nikon D7000',
};
const LENS_FULL = {
  'FE 70-200mm F2.8 GM OSS II': 'Sony FE 70-200mm F2.8 GM OSS II',
  'FE 16-35mm F2.8 GM II': 'Sony FE 16-35mm F2.8 GM II',
  'FE 20-70mm F4 G': 'Sony FE 20-70mm F4 G',
  '18.0-105.0 mm f/3.5-5.6': 'Nikon 18-105mm f/3.5-5.6',
};

/**
 * Unique camera bodies and lenses actually used across the portfolio, derived
 * from EXIF, each with the number of photos shot on it, most-used first.
 * Returns { cameras: [{ name, count }], lenses: [{ name, count }] }.
 */
export function gearFromMetadata() {
  const cams = new Map();
  const lenses = new Map();
  for (const d of Object.values(photoMetadata)) {
    if (d.camera) {
      const name = CAMERA_FULL[d.camera.toUpperCase()] || prettyCamera(d.camera);
      cams.set(name, (cams.get(name) || 0) + 1);
    }
    if (d.lens) {
      const name = LENS_FULL[d.lens] || prettyLens(d.lens);
      lenses.set(name, (lenses.get(name) || 0) + 1);
    }
  }
  const sorted = (m) => [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return { cameras: sorted(cams), lenses: sorted(lenses) };
}

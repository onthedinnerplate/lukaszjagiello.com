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
 * EXIF as schema.org PropertyValue rows for a photo page's ImageObject.
 * Values use the full gear names (the on-page caption stays short).
 * Returns [] when this photo has no metadata.
 */
export function exifDataFor(photo) {
  const n = photoNumberFromSrc(photo?.src);
  const d = (n && photoMetadata[n]) || null;
  if (!d) return [];

  const cam = (d.camera && (CAMERA_FULL[d.camera.toUpperCase()] || prettyCamera(d.camera))) || '';
  const lens = (d.lens && (LENS_FULL[d.lens] || prettyLens(d.lens))) || '';
  const fields = [
    ['camera', cam],
    ['lens', lens],
    ['focalLength', d.focal_length],
    ['exposureTime', d.shutter_speed],
    ['fNumber', d.aperture],
    ['iso', d.iso != null && d.iso !== '' ? String(d.iso) : ''],
  ];
  return fields
    .filter(([, value]) => value)
    .map(([name, value]) => ({ '@type': 'PropertyValue', name, value: String(value) }));
}

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

const GEAR_NAMES = [...new Set([
  ...Object.values(CAMERA_FULL),
  ...Object.values(CAMERA_NAMES),
  ...Object.values(LENS_FULL),
  ...Object.values(LENS_NAMES),
])].sort((a, b) => b.length - a.length);

function isNameBoundary(source, index, length) {
  const before = index === 0 ? '' : source[index - 1];
  const after = index + length >= source.length ? '' : source[index + length];
  const edge = (ch) => ch === '' || !/[A-Za-z0-9]/.test(ch);
  return edge(before) && edge(after);
}

/** Focal length, shutter, aperture, ISO — not a body or a lens. */
function isExposureToken(token) {
  return (
    /^iso\s+\d+$/i.test(token)
    || /^f\/[\d.]+$/i.test(token)
    || /^\d+(\.\d+)?s$/.test(token)
    || /^\d+\/\d+s$/.test(token)
    || /^\d+(\.\d+)?mm$/i.test(token)
  );
}

function scanGearNames(segment) {
  const parts = [];
  const lower = segment.toLowerCase();
  let i = 0;
  while (i < segment.length) {
    let best = null;
    for (const name of GEAR_NAMES) {
      const needle = name.toLowerCase();
      let from = i;
      while (from <= segment.length) {
        const idx = lower.indexOf(needle, from);
        if (idx === -1) break;
        if (isNameBoundary(segment, idx, name.length)) {
          if (!best || idx < best.idx || (idx === best.idx && name.length > best.name.length)) {
            best = { idx, name };
          }
          break;
        }
        from = idx + 1;
      }
    }
    if (!best) {
      parts.push({ type: 'text', value: segment.slice(i) });
      break;
    }
    if (best.idx > i) parts.push({ type: 'text', value: segment.slice(i, best.idx) });
    parts.push({ type: 'gear', name: segment.slice(best.idx, best.idx + best.name.length) });
    i = best.idx + best.name.length;
  }
  return parts;
}

/**
 * Split a gear line into plain text and body/lens names.
 * Exposure tokens (70mm, 1/60s, f/9, ISO 160) stay plain.
 * A recognised name is linked on its own; any other non-exposure
 * segment (a body or lens not yet in the name list) is one gear item.
 * Returns [{ type: 'text'|'gear', value?: string, name?: string }].
 */
export function splitGearLine(text) {
  const source = String(text || '');
  if (!source.trim()) return [];
  const segments = source.split(' · ');
  const parts = [];
  segments.forEach((segment, index) => {
    if (index > 0) parts.push({ type: 'text', value: ' · ' });
    const trimmed = segment.trim();
    if (!trimmed || isExposureToken(trimmed)) {
      parts.push({ type: 'text', value: segment });
      return;
    }
    const inner = scanGearNames(segment);
    if (inner.some((part) => part.type === 'gear')) {
      parts.push(...inner);
      return;
    }
    const lead = segment.match(/^\s*/)[0];
    const trail = segment.match(/\s*$/)[0];
    if (lead) parts.push({ type: 'text', value: lead });
    parts.push({ type: 'gear', name: trimmed });
    if (trail) parts.push({ type: 'text', value: trail });
  });
  return parts;
}

export function mentionsGear(text) {
  return splitGearLine(text).some((part) => part.type === 'gear');
}

// Generates stylised landscape placeholder JPEGs (gradient sky, sun, layered
// ridges) for every entry in lib/photos.js, plus the hero, OG image and icons.
// Existing files are left alone unless --force is passed, so running this
// after you've added real photos will NOT overwrite them.
//
//   npm run placeholders            # create missing files only
//   npm run placeholders -- --force # regenerate everything

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photos, hero } from '../lib/photos.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const force = process.argv.includes('--force');

const palettes = {
  'San Francisco': { sky: ['#f6c6a8', '#9fb7d4'], sun: '#fff1d6', ridges: ['#7d8aa3', '#56627a', '#363e50'], water: '#6d86a6' },
  Alcatraz: { sky: ['#f4a36b', '#5a6e8f'], sun: '#ffe2b8', ridges: ['#6b6f7d', '#474b57', '#2b2e36'], water: '#3e5470' },
  Jamaica: { sky: ['#bfeaf2', '#3fa7c6'], sun: '#fffbe0', ridges: ['#5aa36b', '#2f7a4c', '#1d5535'], water: '#2fb3c0' },
  'Monterey Bay': { sky: ['#ffd9a8', '#7fa9c9'], sun: '#fff4d1', ridges: ['#6f8f7a', '#4c6b5a', '#2f4a3d'], water: '#4f86a8' },
  'Ruby Beach': { sky: ['#e9d3d6', '#8ea0b3'], sun: '#fdf2f0', ridges: ['#6f7f86', '#4d5b63', '#323d44'], water: '#7d97a6' },
  Wildlife: { sky: ['#f3e3b5', '#a7c09b'], sun: '#fffbea', ridges: ['#8aa070', '#5f7a4d', '#3e5434'], water: '#7aa0a8' },
  hero: { sky: ['#ffcf9f', '#6f93bd'], sun: '#fff3d6', ridges: ['#7f8fae', '#58688a', '#3a4762'], water: '#5c7fa6' },
};

// Deterministic PRNG so placeholders are stable between runs.
const rng = (seedStr) => {
  let s = [...seedStr].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
};

const ridgePath = (w, h, baseY, amp, rand) => {
  const steps = 8;
  let d = `M0 ${h} L0 ${baseY}`;
  for (let i = 1; i <= steps; i++) {
    const x = (w / steps) * i;
    const y = baseY - amp * (0.3 + rand() * 0.7);
    const cx = x - w / steps / 2;
    d += ` Q${cx.toFixed(0)} ${(y - amp * rand() * 0.6).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}`;
  }
  return `${d} L${w} ${h} Z`;
};

const sceneSvg = (w, h, key, seed) => {
  const p = palettes[key];
  const rand = rng(seed);
  const sunX = w * (0.2 + rand() * 0.6);
  const sunY = h * (0.22 + rand() * 0.18);
  const sunR = Math.min(w, h) * (0.06 + rand() * 0.05);
  const horizon = h * (0.55 + rand() * 0.12);
  const ridges = p.ridges
    .map((fill, i) => {
      const baseY = horizon + i * h * 0.1;
      return `<path d="${ridgePath(w, h, baseY, h * (0.18 - i * 0.04), rand)}" fill="${fill}"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[0]}"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${p.sun}" stop-opacity=".9"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR * 3}" fill="url(#glow)"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${p.sun}"/>
  <rect y="${horizon + h * 0.05}" width="${w}" height="${h}" fill="${p.water}" opacity=".85"/>
  ${ridges}
</svg>`;
};

const writeJpeg = async (file, w, h, key, seed) => {
  const out = path.join(root, file);
  if (existsSync(out) && !force) return console.log(`skip  ${file} (exists)`);
  mkdirSync(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(sceneSvg(w, h, key, seed))).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log(`wrote ${file} ${w}x${h}`);
};

// Mix of aspect ratios so the masonry layout gets a realistic workout.
const sizes = {
  landscape: [[2400, 1600], [2400, 1350], [2400, 1800]],
  portrait: [[1600, 2400], [1600, 2000], [1500, 2250]],
};

let i = 0;
for (const p of photos) {
  const options = sizes[p.orientation];
  const [w, h] = options[i++ % options.length];
  await writeJpeg(`images/gallery/${p.file}`, w, h, p.location, p.id);
}
await writeJpeg(`images/${hero.file}`, 2560, 1100, 'hero', 'hero');
await writeJpeg('og-image.jpg', 1200, 630, 'hero', 'og');

// Icons: simple lime/charcoal monogram-free mark (no text, so no font deps).
const iconSvg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#3A3A3A"/>
  <path d="M8 48 L24 26 L34 38 L42 30 L56 48 Z" fill="#39FF14"/>
  <circle cx="44" cy="18" r="6" fill="#39FF14"/>
</svg>`;
const svgPath = path.join(root, 'favicon.svg');
if (!existsSync(svgPath) || force) writeFileSync(svgPath, iconSvg(64));
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const out = path.join(root, name);
  if (existsSync(out) && !force) continue;
  await sharp(Buffer.from(iconSvg(size))).png().toFile(out);
  console.log(`wrote ${name}`);
}

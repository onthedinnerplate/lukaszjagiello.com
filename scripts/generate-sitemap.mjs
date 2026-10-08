// Writes public/sitemap.xml and public/robots.txt from the canonical URL.
// Runs automatically before every `npm run build` (see "prebuild").
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, site } from '../lib/site.js';
import { photos } from '../lib/photos.js';
import { CATEGORIES, galleryPathFor } from '../lib/categories.js';
import { photoPath } from '../lib/slug.js';

const pub = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const withSlash = (p) => (p.startsWith('/') ? p : `/${p}`);
const abs = (p) => `${SITE_URL}${withSlash(p)}`;

const photoPages = photos.map((p) => ({
  path: photoPath(p, photos),
  priority: '0.7',
  freq: 'yearly',
  images: [{ src: p.src, title: p.title, caption: p.alt }],
}));

const pages = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/gallery', priority: '0.9', freq: 'weekly', images: photos.map((p) => ({ src: p.src })) },
  ...CATEGORIES.map((c) => ({
    path: galleryPathFor(c.slug),
    priority: '0.8',
    freq: 'weekly',
    images: photos.filter((p) => p.category === c.slug).map((p) => ({ src: p.src })),
  })),
  { path: '/about', priority: '0.6', freq: 'monthly' },
  { path: '/contact', priority: '0.5', freq: 'yearly' },
  ...photoPages,
];

const url = (p) => `${SITE_URL}${p === '/' ? '/' : p}`;
const imageTags = (imgs = []) =>
  imgs
    .map((i) => {
      const loc = `<image:loc>${esc(abs(i.src))}</image:loc>`;
      if (!i.title && !i.caption) return `\n    <image:image>${loc}</image:image>`;
      const title = i.title ? `\n      <image:title>${esc(i.title)}</image:title>` : '';
      const caption = i.caption ? `\n      <image:caption>${esc(i.caption)}</image:caption>` : '';
      return `\n    <image:image>\n      ${loc}${title}${caption}\n    </image:image>`;
    })
    .join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map(
    (p) => `  <url>
    <loc>${esc(url(p.path))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>${imageTags(p.images)}
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `# ${site.name}
User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(path.join(pub, 'sitemap.xml'), xml);
writeFileSync(path.join(pub, 'robots.txt'), robots);
console.log(
  `sitemap.xml (${pages.length} URLs, ${photos.length} gallery images, ${photoPages.length} photo pages) and robots.txt written for ${SITE_URL}`,
);

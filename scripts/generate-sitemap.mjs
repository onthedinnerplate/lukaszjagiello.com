// Writes public/sitemap.xml and public/robots.txt from the canonical URL.
// Runs automatically before every `npm run build` (see "prebuild").
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, site } from '../lib/site.js';
import { photos } from '../lib/photos.js';

const pub = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pages = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/gallery', priority: '0.9', freq: 'weekly', images: photos },
  { path: '/about', priority: '0.6', freq: 'monthly' },
  { path: '/contact', priority: '0.5', freq: 'yearly' },
];

const url = (p) => `${SITE_URL}${p === '/' ? '/' : p}`;
const imageTags = (imgs = []) =>
  imgs.map((i) => `\n    <image:image><image:loc>${esc(SITE_URL + i.src)}</image:loc></image:image>`).join('');

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
console.log(`sitemap.xml (${pages.length} URLs, ${photos.length} images) and robots.txt written for ${SITE_URL}`);

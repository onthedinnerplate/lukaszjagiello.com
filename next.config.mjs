import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { photos } from './lib/photos.js';
import { numericPhotoRedirects } from './lib/slug.js';

const isDev = process.env.NODE_ENV !== 'production';
// Pin the project root: this app may sit inside a larger repo with its own lockfile.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Content-Security-Policy. Production builds use webpack (`next build --webpack`)
// because Turbopack's Pages Router output includes an inline bootstrap <script>
// that a strict script-src would block. With webpack, the only inline <script>
// tags are non-executable data blocks (__NEXT_DATA__, JSON-LD), so script-src
// stays 'self' with no 'unsafe-inline'. next/image sets inline `style`
// attributes, hence 'unsafe-inline' for styles only.
// Dev mode (React Refresh) needs eval + websocket, so it gets a looser policy.
const csp = [
  "default-src 'self'",
  `script-src 'self'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "form-action 'self'",
  // Photo pages embed Google Maps on demand (components/PhotoMap.js).
  'frame-src https://www.google.com https://maps.google.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // HSTS: 2 years. Add "; preload" and submit to hstspreload.org only once
  // you're sure every subdomain will serve HTTPS forever — it's hard to undo.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  // The built-in slash redirect is priority:true and would 308 the retired
  // slug to itself before the 301. We replace that rule below, after the 301.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Photos are immutable once published; cache optimised variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [75],
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920, 2560],
    imageSizes: [256, 384, 480],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
  async redirects() {
    return [
      // Collapse www onto the apex domain (canonical host).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lukaszjagiello.com' }],
        destination: 'https://lukaszjagiello.com/:path*',
        permanent: true,
      },
      // /photo/NN (and /photo/N) stay valid when a title — and its slug — changes.
      ...numericPhotoRedirects(photos),
      // Photo 04 was titled "Negril Lighthouse at Dusk". Both slash forms 301 to the daylight slug.
      {
        source: '/photo/negril-lighthouse-at-dusk',
        destination: '/photo/negril-lighthouse-in-daylight',
        statusCode: 301,
      },
      {
        source: '/photo/negril-lighthouse-at-dusk/',
        destination: '/photo/negril-lighthouse-in-daylight',
        statusCode: 301,
      },
      // Same permanent slash cleanup Next adds when skipTrailingSlashRedirect is off (308).
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

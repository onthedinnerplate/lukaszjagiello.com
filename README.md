# lukaszjagiello.com — Łukasz Jagiełło Photography

Next.js 16 (Pages Router) portfolio: Home, Gallery, About, Contact, plus a
contact API, SEO (meta, Open Graph, JSON-LD, sitemap, robots, canonicals),
strict security headers, and responsive optimised images.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

Requires Node 22.12+ (`.nvmrc`).

## Swapping in real photos

1. Put JPEGs in `public/images/gallery/` (and `public/images/hero.jpg`), reusing
   the placeholder filenames or editing `file` in `lib/photos.js`.
2. **Update `title` and `alt` in `lib/photos.js` so they describe the real photo.**
   The current alt text describes intended shots, not the gradient placeholders.
3. Rebuild. Width, height and a dominant-colour placeholder are read from each
   file at build time, so any aspect ratio works and the layout never shifts.
4. Replace `public/og-image.jpg` (1200×630) with a real social-share image.

Export originals at about 2560px on the long edge. Next.js generates AVIF/WebP
variants and the `srcset` for you; bigger files only slow the first request.

`npm run placeholders` recreates missing placeholder files. It never overwrites
existing files unless you pass `-- --force`.

## Configuration

| Where | What |
| --- | --- |
| `lib/site.js` | Name, email, **social URLs (placeholders — replace them)**, nav, gear, homepage photo count |
| `lib/photos.js` | Photo catalogue and location tags |
| `.env.example` | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GALLERY_FILTERS` |
| `next.config.mjs` | Security headers / CSP, image settings, www→apex redirect |

`NEXT_PUBLIC_*` variables are inlined at **build** time, so redeploy after changing them.

### Gallery filters
The filter bar and its logic are built and tested but hidden. To turn them on, set
`NEXT_PUBLIC_GALLERY_FILTERS=true` and redeploy.

### Contact form
`pages/api/contact.js` validates input (rules shared with the client in `lib/contact.js`),
and also checks same-origin, a honeypot field, a 16 KB body limit and a per-IP rate limit.
It works without JavaScript too: a plain form POST redirects back with a status.
**Messages are not delivered yet.** Implement `deliver()` (a Resend example is in
the comments) and set the API key on Render. Add a CAPTCHA (e.g. Cloudflare
Turnstile) at the same time, because the IP rate limit can be spoofed.

## Deploying to Render

`render.yaml` at the repo root is a Render Blueprint. In Render go to
New → Blueprint, pick this repo and apply it. That creates the `lukaszjagiello-com` web
service with its build/start commands, health check, env vars and custom domains.
Set `RESEND_API_KEY` in the dashboard when contact delivery is wired up
(it's declared `sync: false`, so it's never stored in git).

**Domain:** add `lukaszjagiello.com` and `www.lukaszjagiello.com` under the
service's Custom Domains, then create the DNS records Render shows you. Render
issues and renews TLS certificates. The app 308-redirects `www` to the apex domain
and sends HSTS.

## Security notes
- CSP is `script-src 'self'` with no `unsafe-inline`. That only works because
  production builds use **webpack** (`next build --webpack`): Turbopack's Pages
  Router output includes an inline bootstrap script that the CSP would block.
  Don't remove the flag unless you also change the CSP to use nonces or hashes.
- `style-src` allows `'unsafe-inline'`, because next/image uses inline style attributes.
- HSTS deliberately leaves out `preload`. Add it only when you're sure every subdomain will serve HTTPS permanently.

## Brand colour and accessibility
Lime `#39FF14` on white has a contrast ratio of **1.36:1**, which fails WCAG for
text (4.5:1) and for UI boundaries (3:1). The site therefore uses lime only as a
fill or highlight behind charcoal text (8.39:1), and every lime element also gets
a charcoal edge. Never set lime as a text colour on white.

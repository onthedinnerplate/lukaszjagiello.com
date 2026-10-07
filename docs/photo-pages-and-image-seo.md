# Per-photo pages and image SEO — implementation brief

Self-contained spec for a developer who has not seen this repo. Two parts:
**(1)** give every photograph its own URL with rich link previews and
image-search metadata, **(2)** right-size the image assets. Part 1 is the
priority; Part 2 can land in the same PR or a follow-up.

Stack: Next.js 16 (Pages Router, `next build --webpack`), React 19, `sharp`.
Hosted on Render with auto-deploy from `main`. Images are served as static
files with `unoptimized` on every `next/image` — **do not re-enable the
on-demand image optimizer**; it was the cause of intermittent blank tiles
on Render's small instance.

---

## Repo map (what already exists)

| Path | What it is |
|---|---|
| `lib/photos.js` | The 46 photos: `src` (lightbox full), `thumb`, `alt`, `title`. Order = gallery order. Filenames are `lukasz-jagiello-NN-*.webp`; **NN is the photo's stable identity.** |
| `lib/photo-data.js` | Server-only. `getPhotos()` / `getHero()` read dimensions and dominant colour from `lib/photo-manifest.json` (no image work) and add `thumbWidth`, `thumbHeight`, `href`, and the leading `/` on `src`/`thumb`. Use this in `getStaticProps`; never import `photos.js` directly into a page. |
| `lib/photo-manifest.json` + `scripts/generate-photo-manifest.mjs` | Written in `prebuild` (`npm run manifest`): sharp measures all 46 fulls + thumbs + hero **once** (~9 s). Committed so dev works without running it. |
| `lib/photoMetadata.js` | EXIF per photo number: `camera`, `lens`, `focal_length`, `shutter_speed`, `aperture`, `iso`. |
| `lib/photoCaption.js` | `photoNumberFromSrc(src)` → NN; `captionFor(photo)` → `{ equipment, specs }` display strings; `gearFromMetadata()` for the About page. |
| `lib/site.js` | `SITE_URL`, `site` (name, photographer, email, `ogImage`, `homeFeatured` list), `absoluteUrl()`. |
| `lib/seo.js` | JSON-LD builders: `personNode`, `websiteNode`, `pageNode`, `imageObject`, `graph`. |
| `components/Seo.js` | `<Head>` with title, description, canonical, OG, Twitter, JSON-LD. Currently **site-wide OG image only** — Part 1 extends it. |
| `components/MasonryGallery.js` | Card grid (homepage + `/gallery`). Share links currently `/gallery#photo-NN`; opens that photo's lightbox on load. |
| `components/Lightbox.js` | Fullscreen viewer with caption and share button. |
| `components/ShareButton.js` | Web Share API → clipboard fallback. Takes `title`, `url`. |
| `scripts/generate-thumbs.mjs` | `npm run thumbs` — rebuilds all thumbs from fulls (800px, q80). |
| `scripts/generate-sitemap.mjs` | Prebuild. Writes `public/sitemap.xml` (+ `robots.txt`). Currently 4 URLs; images attached to `/gallery` only. |
| `public/images/gallery/` | `lukasz-jagiello-NN-thumb.webp` (800px long edge). |
| `public/images/gallery/lightbox/` | `lukasz-jagiello-NN-full.webp` (1600px long edge). |
| `public/og-image.jpg` | Site-wide 1200×630 share image. |

---

## Build rule: no image work in page code

**Anything that opens an image file — `sharp`, `metadata()`, `stats()`, resizing,
encoding — runs in a `prebuild` script, never in `getStaticProps`,
`getStaticPaths`, API routes, or `next.config.mjs`.**

Why this is a hard rule here: `next build` renders pages across ~11 worker
processes, each with its own module scope. A module-level cache does **not**
protect you — every worker still pays the full cost once. When the 46 photo
pages landed, `getPhotos()` was decoding all 92 WebPs per worker
(`sharp.stats()` fully decodes a 1–1.8 MB file to find the dominant colour),
and every page blew Next's 60-second static-generation limit on Render's
instance. The build failed outright.

The fix that shipped, and the pattern to follow for anything similar:

1. Do the heavy work in a script (`scripts/generate-photo-manifest.mjs`).
2. Write the result to a JSON file in `lib/` (`lib/photo-manifest.json`).
3. Import the JSON from page code. Zero I/O at page-generation time.
4. Add the script to `"prebuild"` in `package.json` so Render regenerates it
   on every deploy, and **commit the JSON** so `npm run dev` works cold.

Related rules that have already bitten this project once:

* Keep `unoptimized` on every `next/image`. The on-demand optimizer caused
  intermittent blank tiles on Render; all image variants are pre-encoded.
* With `unoptimized`, `next/image` emits no `srcset`. Responsive thumbs are
  declared on a `<picture><source srcSet>` wrapper (see `MasonryGallery.js`).
* Image scripts (`thumbs`, `fulls`, `og`) are run **locally** and their output
  committed — they are not part of the Render build.

---

## Part 1 — one page per photograph

### 1.1 Route and data

* Add `pages/photo/[slug].js` with `getStaticPaths` (all 46, `fallback: false`) and `getStaticProps`.
* Slug = kebab-case of the title: `"Negril Lighthouse at Dusk"` → `negril-lighthouse-at-dusk`. Put the slugifier in `lib/photoCaption.js` (or a new `lib/slug.js`) and use it everywhere — never hand-type slugs.
* **Stability:** the photo number NN is the identity; the slug is derived. Resolve `[slug]` by generating slugs for all photos and matching. If two titles ever collide, append `-NN`. Optional but recommended: also accept `/photo/NN` and 301 it to the slug URL so a renamed title doesn't break an old shared link.
* Add `href` (the photo page path) to each photo object in `getPhotos()` so components don't rebuild it.

### 1.2 Page content

In order, top to bottom:

1. The photograph, large: `next/image` with `src={photo.src}`, real `width`/`height`, `priority`, `unoptimized`, `sizes="(max-width: 1024px) 100vw, 1200px"`. No cropping.
2. `<h1>` title.
3. EXIF caption via `captionFor(photo)` → "Sony A7R III · 70-200mm F2.8 GM II" and "117mm | 1/250s | f/2.8 | ISO 3200", same styling as the gallery (`.meta`).
4. One-line location. Add a `location` field to each entry in `lib/photos.js` (e.g. `"Negril, Jamaica"`, `"Highway 199, Northern California"`). Where unknown, omit — never guess.
5. Previous / next links (by gallery order, wrapping), each showing the neighbour's title.
6. "Back to gallery" link.
7. Share button reusing `components/ShareButton.js` with the page's own URL.

Reuse `styles/Page.module.css` conventions; don't introduce a new design language.

### 1.3 Open Graph / Twitter per page

Extend `components/Seo.js` to accept an optional `image` prop `{ src, width, height, alt }`; fall back to `site.ogImage` when absent. On photo pages pass the photo-specific OG image (see 2.3):

```
og:type            article   (or keep "website"; either is fine for crawlers)
og:title           "<Title> | Łukasz Jagiełło Photography"
og:description     <alt text>
og:image           https://lukaszjagiello.com/images/og/lukasz-jagiello-NN.jpg
og:image:width     1200
og:image:height    630
og:image:alt       <alt text>
twitter:card       summary_large_image
twitter:image      same as og:image
```

This is what makes iMessage, Slack, WhatsApp and LinkedIn show the actual
photo instead of the generic site card.

### 1.4 JSON-LD on each photo page

Extend `imageObject()` in `lib/seo.js` (it already emits `contentUrl`,
`creator`, `creditText`, `copyrightNotice`). Add:

```json
{
  "@type": "ImageObject",
  "contentUrl": "https://lukaszjagiello.com/images/gallery/lightbox/lukasz-jagiello-03-full.webp",
  "url": "https://lukaszjagiello.com/photo/negril-lighthouse",
  "name": "Negril Lighthouse",
  "description": "<alt text>",
  "width": 1600, "height": 1067,
  "creator": { "@id": "https://lukaszjagiello.com/#person" },
  "creditText": "Łukasz Jagiełło",
  "copyrightNotice": "© Łukasz Jagiełło",
  "license": "https://lukaszjagiello.com/contact",
  "acquireLicensePage": "https://lukaszjagiello.com/contact",
  "contentLocation": { "@type": "Place", "name": "Negril, Jamaica" },
  "exifData": [
    { "@type": "PropertyValue", "name": "camera", "value": "Sony A7R III" },
    { "@type": "PropertyValue", "name": "lens", "value": "Sony FE 70-200mm F2.8 GM OSS II" },
    { "@type": "PropertyValue", "name": "focalLength", "value": "164mm" },
    { "@type": "PropertyValue", "name": "exposureTime", "value": "1/8000s" },
    { "@type": "PropertyValue", "name": "fNumber", "value": "f/4.5" },
    { "@type": "PropertyValue", "name": "iso", "value": "3200" }
  ]
}
```

`license` + `acquireLicensePage` qualify for Google Images' "Licensable"
badge. Wrap with `graph(websiteNode(), personNode(), pageNode('ItemPage', …), imageObject(photo))`.
Keep the `ImageGallery` graph on `/gallery` as-is.

### 1.5 Canonical and share links

* `<link rel="canonical">` on each photo page = its own absolute URL (`Seo.js` already does this from `path`).
* Change the share URL in **both** `components/MasonryGallery.js` and `components/Lightbox.js` from `` `/gallery#photo-${num}` `` to `photo.href`. Keep the `#photo-NN` handling in `MasonryGallery.js` so old links still open the lightbox.

### 1.6 Sitemap

In `scripts/generate-sitemap.mjs`, add one `<url>` per photo:

```xml
<url>
  <loc>https://lukaszjagiello.com/photo/negril-lighthouse</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.7</priority>
  <image:image>
    <image:loc>https://lukaszjagiello.com/images/gallery/lightbox/lukasz-jagiello-03-full.webp</image:loc>
    <image:title>Negril Lighthouse</image:title>
    <image:caption>Negril Lighthouse in Jamaica rising above trees…</image:caption>
  </image:image>
</url>
```

The script imports `lib/photos.js` directly (no build-time measuring), so
import the same slugifier and compute slugs there. XML-escape title and caption.

---

## Part 2 — image sizes

### 2.1 Thumbnails (`public/images/gallery/*-thumb.webp`)

Already 800px long edge, q80 (`npm run thumbs`). Add a responsive set:

* Generate `-thumb-400.webp` and `-thumb-1200.webp` alongside the existing 800 (extend `scripts/generate-thumbs.mjs`; keep the 800 at the current filename so nothing breaks).
* In `MasonryGallery.js`, since images are `unoptimized`, pass an explicit `srcSet`:
  `"…-thumb-400.webp 400w, …-thumb.webp 800w, …-thumb-1200.webp 1200w"` with the existing `sizes`.
  (With `unoptimized`, `next/image` will not build a srcset for you.)
* Budget: 400 ≈ 15–40 KB, 800 ≈ 30–160 KB, 1200 ≈ 80–300 KB.

### 2.2 Full-size (`public/images/gallery/lightbox/*-full.webp`)

**Correction to the verbal brief:** the fulls are already capped at 1600px on
the long edge, so "cap at 2048" does not reduce anything. Their weight is a
quality setting, not a size problem. Two options — pick one:

* **A (no originals needed):** re-encode the existing 1600px fulls at WebP q78–80, `effort 6`. Target ≤ 500 KB each.
* **B (preferred, needs the RAW/JPEG originals on the owner's PC at `C:\Photography\porfolio\done`):** regenerate at **2048px long edge**, WebP q80. Better on 4K/retina in the lightbox and on the new photo pages. Still target ≤ 600 KB; accept up to ~800 KB for the two or three most detailed frames.

Current fulls over 1 MB (measured in repo):

| NN | Title | Size |
|---|---|---|
| 28 | Forgotten Homestead | 1.86 MB |
| 34 | Myrtle Falls | 1.58 MB |
| 31 | Black Oystercatcher | 1.55 MB |
| 04 | Negril Lighthouse at Dusk | 1.20 MB |
| 37 | Snoqualmie Falls | 1.17 MB |
| 40 | Mossy Rainforest | 1.17 MB |
| 17 | Redwood Highway | 1.09 MB |
| 19 | Smith River Canyon | 1.09 MB |

`#36 Christine Falls` (954 KB) and `#27 Aspen Canopy` (810 KB) are borderline.
Foliage-heavy frames will always be the heaviest; that's expected.

Add a `scripts/generate-fulls.mjs` (mirroring `generate-thumbs.mjs`) so this
is repeatable. After regenerating, run `npm run thumbs` again so thumbs derive
from the new fulls.

### 2.3 Open Graph images (new: `public/images/og/lukasz-jagiello-NN.jpg`)

* 1200×630, **JPEG** (some crawlers still mishandle WebP), quality ~82, ≤ 300 KB.
* Crop with sharp `fit: 'cover', position: 'attention'` (or `'entropy'`) from the full. Portrait frames will lose top/bottom; that's acceptable for a link card. For the few portraits where attention-crop cuts the subject (e.g. tall lighthouses, the eagle), allow a manual `ogFocus` override in `lib/photos.js` (`'top' | 'center' | 'bottom'`).
* Generate in a script (`scripts/generate-og.mjs`) and commit the output; don't generate at request time.

### 2.4 General

* Every `next/image` keeps explicit `width`/`height` (or `fill` inside a sized box) — zero CLS. `getPhotos()` already supplies these.
* `priority` on exactly one image per page (the hero image on photo pages; the first collage tile on the homepage). Everything else `loading="lazy"`.
* Keep `unoptimized` everywhere; serve the pre-encoded files.
* Cache headers for `/images/*` are already set in `next.config.mjs` (1 day + SWR 7 days). Since filenames don't change on regeneration, bump the `Cache-Control` or add a `?v=` query to busted assets if users report stale images after a deploy.

---

## Locations

Each entry in `lib/photos.js` now has a `location` field. **Where it is an
empty string, omit the location line and `contentLocation` on the page — do
not guess.** 21 are confirmed by the photographer; 25 are blank
and for Łukasz to fill in (edit the string in `lib/photos.js`; no other change
needed).

| NN | Title | Location |
|---|---|---|
| 01 | Flag Bearer | Jamaica |
| 02 | Jamaican Dance Troupe | Jamaica |
| 03 | Negril Lighthouse | Negril, Jamaica |
| 04 | Negril Lighthouse at Dusk | Negril, Jamaica |
| 05 | Lone Boat Under Storm Clouds | **— fill in —** |
| 06 | After the Storm | **— fill in —** |
| 07 | Anchorage at Sunset | **— fill in —** |
| 08 | Alcatraz Water Tower | Alcatraz Island, San Francisco |
| 09 | Streetcar 1057 | San Francisco |
| 10 | Cable Car on the Hill | San Francisco |
| 11 | Golden Gate Surf | Golden Gate Bridge, San Francisco |
| 12 | Golden Gate Long Exposure | Golden Gate Bridge, San Francisco |
| 13 | Powell–Market Cable Car | San Francisco |
| 14 | Painted Ladies | Alamo Square, San Francisco |
| 15 | Golden Gate from Fort Point | Golden Gate Bridge, San Francisco |
| 16 | Looking Up the Tower | Golden Gate Bridge, San Francisco |
| 17 | Redwood Highway | **— fill in —** |
| 18 | Elk in Tall Grass | **— fill in —** |
| 19 | Smith River Canyon | Smith River, Highway 199, Northern California |
| 20 | Green Iguana in the Reeds | **— fill in —** |
| 21 | Iguana in the Palms | **— fill in —** |
| 22 | Iguana Foraging | **— fill in —** |
| 23 | Slot Canyon Light | **— fill in —** |
| 24 | Beached Boat | **— fill in —** |
| 25 | Swim Line at Sunset | **— fill in —** |
| 26 | Bear Among the Logs | **— fill in —** |
| 27 | Aspen Canopy | **— fill in —** |
| 28 | Forgotten Homestead | **— fill in —** |
| 29 | Squirrel Monkey | **— fill in —** |
| 30 | Rainbow Umbrellas | **— fill in —** |
| 31 | Black Oystercatcher | **— fill in —** |
| 32 | Seattle Skyline | Seattle, Washington |
| 33 | Under Full Sail | **— fill in —** |
| 34 | Myrtle Falls | Mount Rainier National Park, Washington |
| 35 | Steller's Jay | **— fill in —** |
| 36 | Christine Falls | Mount Rainier National Park, Washington |
| 37 | Snoqualmie Falls | Snoqualmie Falls, Washington |
| 38 | Snoqualmie Falls from Above | Snoqualmie Falls, Washington |
| 39 | Ruby Beach | Ruby Beach, Washington |
| 40 | Mossy Rainforest | **— fill in —** |
| 41 | Marymere Falls | Marymere Falls, Olympic National Park, Washington |
| 42 | Bighorn in the Shadows | **— fill in —** |
| 43 | Phainopepla | **— fill in —** |
| 44 | Burrowing Owl on a Log | **— fill in —** |
| 45 | Owl at the Burrow | **— fill in —** |
| 46 | Bald Eagle | **— fill in —** |

---

## Checklist

**Per-photo pages**
- [ ] `pages/photo/[slug].js` with `getStaticPaths` for all 46; slug from title; NN remains the identity
- [ ] `location` field added to `lib/photos.js` (omit where unknown)
- [ ] Page shows photo (priority, unoptimized), h1, EXIF caption, location, prev/next, back link, share button
- [ ] `Seo.js` accepts per-page `image`; photo pages pass their 1200×630 JPEG
- [ ] JSON-LD `ImageObject` with `license`, `acquireLicensePage`, `contentLocation`, `exifData`
- [ ] Canonical per page; share buttons in card + lightbox use `photo.href`; `#photo-NN` still opens lightbox
- [ ] Sitemap includes all 46 photo URLs with `image:image` (loc, title, caption)
- [ ] Optional: `/photo/NN` → 301 → slug URL

**Images**
- [ ] Thumbs: 400 / 800 / 1200 variants generated; explicit `srcSet` in `MasonryGallery.js`
- [ ] Fulls: ≤ 500–600 KB each (option A re-encode, or option B 2048px from originals); all eight >1 MB files fixed
- [ ] OG: 46 × 1200×630 JPEG ≤ 300 KB in `public/images/og/`
- [ ] One `priority` image per page; rest lazy
- [ ] `width`/`height` present on every image

**Verify**
- [ ] `npm run build` passes (46 photo pages in the build output), with **no** "took more than 60 seconds" lines — page generation must not touch image files (see *Build rule*)
- [ ] Paste a photo URL into iMessage / Slack / LinkedIn Post Inspector → the photo shows, not the site card
- [ ] Google Rich Results Test on one photo page: `ImageObject` valid, no errors
- [ ] `/sitemap.xml` lists 50 URLs (4 pages + 46 photos)
- [ ] Lighthouse mobile on `/gallery` and one photo page: no CLS, LCP < 2.5 s

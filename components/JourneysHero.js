import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import { heroAccentClassName } from '@/components/headlineAccent';
import { accentScriptInk } from '@/lib/accentInk';
import { articleTitleFont } from '@/lib/fonts';
import { photos } from '@/lib/photos';
import styles from '@/styles/Journal.module.css';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* Waterfall in the current cover crop: frame center sits at 66.1% across
   and 46.77% down the source. See the portrait comment in Journal.module.css. */
const FALLS_X = 0.661;
const FALLS_Y = 0.4677;

const HERO_ACCENTS = ['the story', 'the terrain'];

/** Split the hero sentence so only the two stored phrases take the accent. */
function titleWithAccents(title) {
  const nodes = [];
  let rest = title;
  for (const phrase of HERO_ACCENTS) {
    const at = rest.indexOf(phrase);
    if (at < 0) return null;
    if (at > 0) nodes.push({ text: rest.slice(0, at), accent: false });
    nodes.push({ text: phrase, accent: true });
    rest = rest.slice(at + phrase.length);
  }
  if (rest) nodes.push({ text: rest, accent: false });
  return nodes;
}

const POPPINS = 'https://fonts.googleapis.com/css2?family=Allura&family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap';

/** Same sentence as the Journeys page description, so every reuse stays in lockstep. */
export const JOURNEYS_HERO_DESCRIPTION =
  'Essays from the trail, the coast and the canyon, told around a single photograph.';

// Marymere Falls (photo 41, slug marymere-falls). Kept as literals so this
// component does not pull the essay catalogue into every page bundle.
const HERO_SRC = '/images/gallery/lightbox/lukasz-jagiello-41-full.webp';
// Photo 41 middle swatch (journalShapes "41".palette[2]). The hero has no
// swatch row, so the handwritten words take this photograph's middle color.
const HERO_MIDDLE = '#182a17';
// Lightest patch under those words: 95th percentile of "the terrain"
// on the full-width Journeys hero at 1440px. Gallery, About, and Contact
// match it. Marymere photograph plus the left scrim.
const HERO_PHOTO_SURFACE = '#2a5430';
const heroOnPhoto = accentScriptInk(HERO_MIDDLE, HERO_PHOTO_SURFACE);
const heroOnPage = accentScriptInk(HERO_MIDDLE, '#ffffff');
const heroAccentStyle = {
  '--hero-accent': heroOnPhoto?.used,
  '--hero-accent-mobile': heroOnPage?.used,
};
// Same description as photo 41 in lib/photos.js — do not paraphrase.
const HERO_ALT = photos.find((p) => `/${p.src}` === HERO_SRC)?.alt || '';
if (!HERO_ALT) throw new Error('Journeys hero is missing the Marymere Falls alt text from lib/photos.js.');

const HERO = {
  src: HERO_SRC,
  alt: HERO_ALT,
  creditHref: '/journal/a-thin-line-of-light-in-a-green-room',
  kicker: 'Journeys · Stories from the terrain',
  title: 'Always look for the story in the terrain.',
  credit: 'Marymere Falls · Olympic National Park, Washington',
};

const ALLTRAILS_HREF = 'https://www.alltrails.com/trail/us/washington/marymere-falls-trail';
const MAPS_HREF = 'https://www.google.com/maps/search/?api=1&query=Marymere+Falls+Olympic+National+Park';

/** Category row only: Journeys, Landscape, Animals, Architecture, People. */
function heroNavProps(nav) {
  if (!nav) return null;
  return {
    ...nav,
    separateCount: true,
    leading: Array.isArray(nav.leading) ? nav.leading : [],
  };
}

/**
 * The Journeys landing hero: Marymere photograph, kicker, headline, subline,
 * gold rule and photo credit.
 *
 * Optional `nav` is the category bar. It sits directly under the headline,
 * and the photo credit sits flush against that bar. Pages without `nav`
 * keep the credit in the lower corner of the photograph.
 *
 * `headingAs` is `h1` where this headline is the page's only heading
 * (Journeys). Pass `p` on pages that already have their own h1 — Home uses
 * "Selected photographs" — so the slogan keeps the hero type without a second h1.
 */
function nearly(a, b) {
  return a && b && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.top - b.top) < 0.5
    && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;
}

export default function JourneysHero({ nav = null, headingAs = 'h1', bleed = false }) {
  const Title = headingAs;
  const menu = heroNavProps(nav);
  const titleNodes = bleed ? null : titleWithAccents(HERO.title);
  const mediaRef = useRef(null);
  const [align, setAlign] = useState(null);

  useIsoLayoutEffect(() => {
    if (!bleed) return undefined;
    const media = mediaRef.current;
    if (!media) return undefined;

    const place = () => {
      const desktop = window.matchMedia('(min-width: 769px)').matches;
      const home = document.querySelector('[data-nav-home]');
      if (!desktop || !home) {
        media.parentElement?.style.removeProperty('--hero-frame-left');
        setAlign((prev) => (prev === null ? prev : null));
        return;
      }
      const band = media.getBoundingClientRect();
      const homeRect = home.getBoundingClientRect();
      const bw = band.width;
      const bh = band.height;
      if (bw < 1 || bh < 1) return;
      const navH = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
      const stageH = Math.max(bh - navH, 0);
      const frameH = stageH * 0.881;
      const frameW = (frameH * 9) / 16;
      const frameLeft = homeRect.left - band.left;
      /* Top of the frame sits on the nav's moss line. */
      const frameTop = navH;
      const cx = frameLeft + frameW / 2;
      const cy = frameTop + frameH / 2;
      let dw = Math.max(cx / FALLS_X, (bw - cx) / (1 - FALLS_X), bw);
      let dh = dw / 1.6;
      const dhNeed = Math.max(cy / FALLS_Y, (bh - cy) / (1 - FALLS_Y));
      if (dh < dhNeed) {
        dh = dhNeed;
        dw = dh * 1.6;
      }
      const frame = { left: frameLeft, top: frameTop, width: frameW, height: frameH };
      const photo = { left: cx - FALLS_X * dw, top: cy - FALLS_Y * dh, width: dw, height: dh };
      media.parentElement?.style.setProperty('--hero-frame-left', `${frameLeft}px`);
      setAlign((prev) => (nearly(prev?.frame, frame) && nearly(prev?.photo, photo) ? prev : { frame, photo }));
    };

    place();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place);
    observer?.observe(media);
    const home = document.querySelector('[data-nav-home]');
    if (home) observer?.observe(home);
    window.addEventListener('resize', place);
    document.fonts?.ready?.then(place);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [bleed]);

  const photoStyle = align?.photo
    ? {
        width: `${align.photo.width}px`,
        height: `${align.photo.height}px`,
        left: `${align.photo.left}px`,
        top: `${align.photo.top}px`,
        right: 'auto',
        bottom: 'auto',
        maxWidth: 'none',
        objectFit: 'cover',
      }
    : undefined;
  const frameStyle = align?.frame
    ? {
        left: `${align.frame.left}px`,
        top: `${align.frame.top}px`,
        width: `${align.frame.width}px`,
        height: `${align.frame.height}px`,
      }
    : undefined;
  const credit = (
    <p className={menu ? `${styles.heroCap} ${styles.heroCapFlush}` : styles.heroCap}>
      <Link href={HERO.creditHref}>{HERO.credit}</Link>
    </p>
  );
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={POPPINS} />
      </Head>
      <div className={bleed ? styles.heroSlotBleed : styles.heroSlot}>
        <section
          className={bleed ? `${styles.heroBand} ${styles.heroBleed}` : styles.heroBand}
          style={heroAccentStyle}
          aria-label="Marymere Falls"
        >
          <div className={styles.heroMedia} ref={mediaRef}>
            <Image
              src={HERO.src}
              alt={HERO.alt}
              fill
              priority
              unoptimized
              sizes="100vw"
              className={styles.heroPhoto}
              style={photoStyle}
            />
            <div className={styles.heroShade} aria-hidden="true" />
            {bleed ? (
              <>
                <div className={styles.heroWear} aria-hidden="true" />
                <div className={styles.heroVignette} aria-hidden="true" />
              </>
            ) : null}
            <div className={styles.portrait} style={frameStyle}>
              <div className={styles.portraitRim} aria-hidden="true" />
              <div className={styles.portraitBand}>
                <a
                  className={styles.portraitPin}
                  href={ALLTRAILS_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Marymere Falls on AllTrails"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </a>
                <a
                  className={styles.portraitPlace}
                  href={MAPS_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Marymere Falls on Google Maps"
                >
                  MARYMERE FALLS · OLYMPIC NATIONAL PARK
                </a>
              </div>
            </div>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>{HERO.kicker}</p>
            <Title className={`${styles.heroTitle} ${articleTitleFont.className}`}>
              {bleed ? (
                <>
                  <span className={styles.heroLine}>Always look for the</span>
                  <span className={styles.heroLine2}>
                    <span className={heroAccentClassName}>story</span>
                    {' in '}
                    <span className={heroAccentClassName}>the terrain</span>.
                  </span>
                </>
              ) : titleNodes ? (
                titleNodes.map((node, i) =>
                  node.accent ? (
                    <span key={`${node.text}-${i}`} className={heroAccentClassName}>
                      {node.text}
                    </span>
                  ) : (
                    node.text
                  ),
                )
              ) : (
                HERO.title
              )}
            </Title>
            {menu ? (
              <div className={styles.heroNav}>
                <CategoryNav {...menu} />
              </div>
            ) : null}
            {menu ? credit : null}
            <p className={styles.heroSub}>{JOURNEYS_HERO_DESCRIPTION}</p>
            <span className={styles.goldRule} aria-hidden="true" />
          </div>
          {menu ? null : credit}
        </section>
      </div>
    </>
  );
}

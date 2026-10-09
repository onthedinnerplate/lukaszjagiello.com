import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import { headlineAccentClassName } from '@/components/headlineAccent';
import { photos } from '@/lib/photos';
import styles from '@/styles/Journal.module.css';

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

const POPPINS = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap';

/** Same sentence as the Journeys page description, so every reuse stays in lockstep. */
export const JOURNEYS_HERO_DESCRIPTION =
  'Essays from the trail, the coast and the canyon, told around a single photograph.';

// Marymere Falls (photo 41, slug marymere-falls). Kept as literals so this
// component does not pull the essay catalogue into every page bundle.
const HERO_SRC = '/images/gallery/lightbox/lukasz-jagiello-41-full.webp';
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

/** Home and About sit in front of the category row on every hero that has one. */
function heroNavProps(nav) {
  if (!nav) return null;
  return {
    ...nav,
    separateCount: true,
    leading: [
      { slug: 'home', label: 'Home', href: '/' },
      { slug: 'about', label: 'About', href: '/about' },
      ...(Array.isArray(nav.leading) ? nav.leading : []),
    ],
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
 * `headingAs` is `h1` where this headline is the page's only heading (Home,
 * Journeys). Pass `p` on pages that already have their own h1 so the slogan
 * keeps the hero type styles without adding a second heading.
 */
export default function JourneysHero({ nav = null, headingAs = 'h1' }) {
  const Title = headingAs;
  const menu = heroNavProps(nav);
  const titleNodes = titleWithAccents(HERO.title);
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
      <section className={styles.heroBand} aria-label="Marymere Falls">
        <Image
          src={HERO.src}
          alt={HERO.alt}
          fill
          priority
          unoptimized
          sizes="100vw"
          className={styles.heroPhoto}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>{HERO.kicker}</p>
          <Title className={styles.heroTitle}>
            {titleNodes
              ? titleNodes.map((node, i) =>
                  node.accent ? (
                    <span key={`${node.text}-${i}`} className={headlineAccentClassName}>
                      {node.text}
                    </span>
                  ) : (
                    node.text
                  ),
                )
              : HERO.title}
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
    </>
  );
}

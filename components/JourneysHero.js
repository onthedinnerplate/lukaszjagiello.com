import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import styles from '@/styles/Journal.module.css';

const POPPINS = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap';

/** Same sentence as the Journeys page description, so every reuse stays in lockstep. */
export const JOURNEYS_HERO_DESCRIPTION =
  'Essays from the trail, the coast and the canyon, told around a single photograph.';

// Marymere Falls (photo 41, slug marymere-falls). Kept as literals so this
// component does not pull the essay catalogue into every page bundle.
const HERO = {
  src: '/images/gallery/lightbox/lukasz-jagiello-41-full.webp',
  creditHref: '/journal/a-thin-line-of-light-in-a-green-room',
  kicker: 'Journeys · Stories from the terrain',
  title: 'Always look for the story in the terrain.',
  credit: 'Marymere Falls · Olympic National Park, Washington',
};

/**
 * The Journeys landing hero: Marymere photograph, kicker, headline, subline,
 * gold rule and photo credit. Optional `nav` renders the same category bar
 * Journeys uses, directly above the photograph.
 *
 * `headingAs` is `h1` where this headline is the page's only heading (Home,
 * Journeys). Pass `p` on pages that already have their own h1 so the slogan
 * keeps the hero type styles without adding a second heading.
 */
export default function JourneysHero({ nav = null, headingAs = 'h1' }) {
  const Title = headingAs;
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={POPPINS} />
      </Head>
      {nav ? (
        <div className={styles.landingCats}>
          <CategoryNav {...nav} />
        </div>
      ) : null}
      <section className={styles.heroBand} aria-label="Marymere Falls">
        <Image
          src={HERO.src}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className={styles.heroPhoto}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>{HERO.kicker}</p>
          <Title className={styles.heroTitle}>{HERO.title}</Title>
          <p className={styles.heroSub}>{JOURNEYS_HERO_DESCRIPTION}</p>
          <span className={styles.goldRule} aria-hidden="true" />
        </div>
        <p className={styles.heroCap}>
          <Link href={HERO.creditHref}>{HERO.credit}</Link>
        </p>
      </section>
    </>
  );
}

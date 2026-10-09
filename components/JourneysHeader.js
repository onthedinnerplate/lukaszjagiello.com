import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import CategoryNav from '@/components/CategoryNav';
import styles from '@/styles/Journal.module.css';

const POPPINS = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap';

const COPY = {
  kicker: 'Journeys · Stories from the terrain',
  title: 'Always look for the story in the terrain.',
  sub: 'Essays from the trail, the coast and the canyon, told around a single photograph.',
  creditHref: '/journal/a-thin-line-of-light-in-a-green-room',
  credit: 'Marymere Falls · Olympic National Park, Washington',
};

/**
 * The Journeys landing header: optional category row, then the Marymere hero.
 * `titleAs` is `h1` on Journeys and Home. Other pages pass `p` so their own
 * page title stays the single h1. The class is the same either way.
 * The category row uses the Journeys landing wrapper, so it is hidden below 769px.
 */
export default function JourneysHeader({ src, titleAs = 'h1', categories = null }) {
  const Title = titleAs;
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={POPPINS} />
      </Head>
      {categories ? (
        <div className={styles.landingCats}>
          <CategoryNav
            active={categories.active}
            counts={categories.counts}
            hrefFor={categories.hrefFor}
            label={categories.label}
            disableEmpty={categories.disableEmpty}
          />
        </div>
      ) : null}
      <section className={styles.heroBand} aria-label="Marymere Falls">
        <Image
          src={src}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className={styles.heroPhoto}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>{COPY.kicker}</p>
          <Title className={styles.heroTitle}>{COPY.title}</Title>
          <p className={styles.heroSub}>{COPY.sub}</p>
          <span className={styles.goldRule} aria-hidden="true" />
        </div>
        <p className={styles.heroCap}>
          <Link href={COPY.creditHref}>{COPY.credit}</Link>
        </p>
      </section>
    </>
  );
}

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Seo from '@/components/Seo';
import CategoryNav from '@/components/CategoryNav';
import PhotoMap from '@/components/PhotoMap';
import ShapeMosaic from '@/components/ShapeMosaic';
import AccentTitle from '@/components/AccentTitle';
import { getPhotos } from '@/lib/photo-data';
import {
  articlesInCategory,
  hydrateArticles,
  journalCategoryCounts,
  journalCategoryPath,
} from '@/lib/articles';
import { byNumber, CLUSTER_NUMBERS, inspirationsFrom, LATEST_SLUGS, MORE_NUMBERS, shapeFor } from '@/lib/journeys';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import styles from '@/styles/Journal.module.css';

const POPPINS = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap';

const meta = {
  path: '/journal',
  title: 'Journeys',
  description: 'Essays from the trail, the coast and the canyon, told around a single photograph.',
};

function Swatches({ shape, compact = false }) {
  return (
    <ul className={`${styles.swatches} ${compact ? styles.swatchesCompact : ''}`}>
      {shape.palette.map((hex, i) => (
        <li key={`${hex}-${i}`} className={styles.swatchItem}>
          <span className={styles.swatch} style={{ background: hex }} />
          {compact ? null : <span className={styles.hex}>{hex}</span>}
        </li>
      ))}
    </ul>
  );
}

function JourneyCard({ article, compactSwatches = true }) {
  const shape = shapeFor(article);
  return (
    <Link href={`/journal/${article.slug}`} className={styles.journeyCard}>
      <ShapeMosaic shape={shape} src={article.photo.src} alt="" companionSrc={article.companion?.src} />
      <Swatches shape={shape} compact={compactSwatches} />
      <AccentTitle title={article.title} color={shape.accent} className={styles.journeyTitle} />
      <p className={styles.cardDek}>{article.dek}</p>
    </Link>
  );
}

export default function JournalIndex({ articles, counts, hero }) {
  const { query } = useRouter();
  const category = typeof query.category === 'string' ? query.category : 'all';
  const visible = articlesInCategory(articles, category);
  const latest = LATEST_SLUGS.map((slug) => visible.find((article) => article.photoSlug === slug)).filter(Boolean);
  const featured = visible.find((article) => article.photoSlug === 'ruby-beach') || null;
  const inspirations = inspirationsFrom(visible);
  const more = byNumber(visible, MORE_NUMBERS);
  const catalogue = [...visible].sort((a, b) => a.photoNumber - b.photoNumber);
  const cluster = byNumber(articles, CLUSTER_NUMBERS);
  const featuredShape = featured ? shapeFor(featured) : null;

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography journal', 'journeys', ...articles.map((a) => a.location).filter(Boolean)]}
        jsonLd={graph(websiteNode(), personNode(), pageNode('CollectionPage', meta))}
      />
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={POPPINS} />
      </Head>
      <article className={styles.landing}>
        <div className={styles.landingCats}>
          <CategoryNav
            active={category}
            counts={counts}
            hrefFor={journalCategoryPath}
            label="Journal categories"
            disableEmpty
          />
        </div>

        <section className={styles.heroBand} aria-label="Marymere Falls">
          <Image
            src={hero.src}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className={styles.heroPhoto}
          />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>Journeys · Stories from the terrain</p>
            <h1 className={styles.heroTitle}>Always look for the story in the terrain.</h1>
            <p className={styles.heroSub}>{meta.description}</p>
            <span className={styles.goldRule} aria-hidden="true" />
          </div>
          <p className={styles.heroCap}>
            <Link href="/journal/a-thin-line-of-light-in-a-green-room">
              Marymere Falls · Olympic National Park, Washington
            </Link>
          </p>
        </section>

        <div className={styles.landingWrap}>
          {latest.length > 0 ? (
            <section className={styles.band} aria-labelledby="latest-journeys">
              <h2 id="latest-journeys" className={styles.sectionLabel}>
                Latest journeys <span>{latest.length}</span>
              </h2>
              <ul className={styles.latestGrid}>
                {latest.map((article) => (
                  <li key={article.slug}>
                    <JourneyCard article={article} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {featured ? (
            <section className={styles.band} aria-labelledby="featured-story">
              <h2 id="featured-story" className={styles.sectionLabel}>Featured story</h2>
              <div className={styles.featured}>
                <div className={styles.featuredMain}>
                  <ShapeMosaic shape={featuredShape} src={featured.photo.src} alt="" />
                  <Swatches shape={featuredShape} />
                  <div className={styles.mapSlot}>
                    <PhotoMap
                      bare
                      coords={featured.photo.coords}
                      location={featured.location}
                      title={featured.photo.title}
                    />
                  </div>
                  <div className={styles.featuredPanel}>
                    <p className={styles.featuredKicker}>Featured · Ruby Beach · Washington</p>
                    <AccentTitle title={featured.title} color={featuredShape.accent} as="h3" className={styles.featuredTitle} />
                    <span className={styles.goldRule} aria-hidden="true" />
                    <p className={styles.featuredDek}>{featured.dek}</p>
                    <Link href={`/journal/${featured.slug}`} className={styles.storyLink}>Read the story</Link>
                  </div>
                </div>
                <aside className={styles.more} aria-labelledby="more-stories">
                  <h3 id="more-stories" className={styles.moreLabel}>More stories</h3>
                  <ul>
                    {more.map((article) => (
                      <li key={article.slug}>
                        {article.location ? <p className={styles.morePlace}>{article.location}</p> : null}
                        <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                      </li>
                    ))}
                  </ul>
                  <a href="#all-journeys" className={styles.storyLink}>All journeys</a>
                </aside>
              </div>
            </section>
          ) : null}

          {inspirations.length > 0 ? (
            <section className={styles.band} aria-labelledby="inspirations">
              <h2 id="inspirations" className={styles.sectionLabel}>
                Inspirations <span>{inspirations.length}</span>
              </h2>
              <ul className={styles.inspireGrid}>
                {inspirations.map((article) => (
                  <li key={article.slug}>
                    <JourneyCard article={article} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={styles.band} id="all-journeys" aria-labelledby="all-journeys-title">
            <h2 id="all-journeys-title" className={styles.sectionLabel}>
              All journeys <span>{catalogue.length}</span>
            </h2>
            {catalogue.length === 0 ? (
              <p className={styles.empty}>No essays in this category.</p>
            ) : (
              <ul className={styles.allList}>
                {catalogue.map((article) => (
                  <li key={article.slug}>
                    <Link href={`/journal/${article.slug}`}>
                      <AccentTitle title={article.title} color={shapeFor(article).accent} as="span" className={styles.allTitle} />
                      {article.location ? <span className={styles.allPlace}>{article.location}</span> : <span className={styles.allPlace}> </span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className={styles.earth} aria-labelledby="earth-title">
          <div className={styles.earthCopy}>
            <p className={styles.earthKicker}>Journeys</p>
            <h2 id="earth-title" className={styles.earthTitle}>Mother Earth gives us journeys</h2>
            <p>Every coastline, canyon and trail here began as a walk. These are the stories they gave back.</p>
            <Link href="/gallery" className={styles.storyLink}>Browse the gallery</Link>
          </div>
          <ul className={styles.cluster} aria-hidden="true">
            {cluster.map((article) => (
              <li key={article.slug}>
                <ShapeMosaic shape={shapeFor(article)} src={article.photo.src} alt="" />
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}

export async function getStaticProps() {
  const photos = await getPhotos();
  const articles = hydrateArticles(photos);
  const hero = articles.find((article) => article.photoSlug === 'marymere-falls');
  const cards = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    location: article.location,
    photoSlug: article.photoSlug,
    photoNumber: article.photoNumber,
    companion: article.companion ? { src: article.companion.src } : null,
    photo: {
      src: article.photo.src,
      title: article.photo.title,
      categories: article.photo.categories,
      coords: article.photo.coords,
    },
  }));
  return {
    props: {
      articles: cards,
      counts: journalCategoryCounts(articles),
      hero: { src: hero.photo.src, alt: hero.photo.alt },
    },
  };
}

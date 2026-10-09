import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Seo from '@/components/Seo';
import JourneysHero, { JOURNEYS_HERO_DESCRIPTION } from '@/components/JourneysHero';
import PhotoMap from '@/components/PhotoMap';
import ShapeMosaic from '@/components/ShapeMosaic';
import AccentTitle from '@/components/AccentTitle';
import Swatches from '@/components/Swatches';
import { getPhotos } from '@/lib/photo-data';
import {
  articlesInCategory,
  hydrateArticles,
  journalCategoryCounts,
  journalCategoryPath,
} from '@/lib/articles';
import { CATEGORIES } from '@/lib/categories';
import { byNumber, CLUSTER_NUMBERS, inspirationsFrom, LATEST_SLUGS, MORE_NUMBERS, shapeFor } from '@/lib/journeys';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import styles from '@/styles/Journal.module.css';

const meta = {
  path: '/journal',
  title: 'Journeys',
  description: JOURNEYS_HERO_DESCRIPTION,
};

/** Longest-edge 400px gallery thumb. The unsuffixed `-thumb.webp` file is the 800px variant. */
function smallThumbSrc(thumb, fileExists) {
  if (typeof thumb !== 'string' || !/-thumb\.webp$/.test(thumb)) return null;
  const small = thumb.replace(/-thumb\.webp$/, '-thumb-400.webp');
  if (fileExists && !fileExists(small)) return null;
  return small;
}

function JourneyThumb({ photo }) {
  if (!photo?.thumb) {
    return <span className={`${styles.allThumb} ${styles.allThumbPlaceholder}`} aria-hidden="true" />;
  }
  return (
    <img
      className={styles.allThumb}
      src={photo.thumb}
      alt={photo.alt || ''}
      width={80}
      height={80}
      loading="lazy"
      decoding="async"
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
    />
  );
}

function JourneyCard({ article, compactSwatches = true }) {
  const shape = shapeFor(article);
  return (
    <Link href={`/journal/${article.slug}`} className={styles.journeyCard}>
      <ShapeMosaic src={article.photo.src} alt={article.photo.alt} />
      <Swatches shape={shape} compact={compactSwatches} />
      <AccentTitle title={article.title} color={shape.accent} className={styles.journeyTitle} />
      <p className={styles.cardDek}>{article.dek}</p>
    </Link>
  );
}

export default function JournalIndex({ articles, counts }) {
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
  const [filterNote, setFilterNote] = useState('');
  const skipFilterNote = useRef(true);
  useEffect(() => {
    if (skipFilterNote.current) {
      skipFilterNote.current = false;
      return;
    }
    const name = category === 'all'
      ? 'All'
      : (CATEGORIES.find((c) => c.slug === category)?.label || 'This category');
    const n = catalogue.length;
    setFilterNote(n === 0 ? `${name}: no essays.` : `${name}: ${n} ${n === 1 ? 'journey' : 'journeys'}.`);
  }, [category, catalogue.length]);

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography journal', 'journeys', ...articles.map((a) => a.location).filter(Boolean)]}
        jsonLd={graph(websiteNode(), personNode(), pageNode('CollectionPage', meta))}
      />
      <article className={styles.landing}>
        <JourneysHero
          nav={{
            active: category,
            counts,
            hrefFor: journalCategoryPath,
            label: 'Journal categories',
            disableEmpty: true,
          }}
        />
        <p className="sr-only" aria-live="polite" aria-atomic="true">{filterNote}</p>

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
                  <ShapeMosaic src={featured.photo.src} alt={featured.photo.alt} />
                  <Swatches shape={featuredShape} featured />
                  <div className={styles.featuredMap}>
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
                      <JourneyThumb photo={article.photo} />
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
                <ShapeMosaic src={article.photo.src} alt="" />
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}

export async function getStaticProps() {
  const { existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const smallThumbExists = (urlPath) => existsSync(join(process.cwd(), 'public', urlPath.replace(/^\//, '')));
  const photos = await getPhotos();
  const articles = hydrateArticles(photos);
  const marymere = articles.find((article) => article.photoSlug === 'marymere-falls');
  if (!marymere || marymere.photo.src !== '/images/gallery/lightbox/lukasz-jagiello-41-full.webp') {
    throw new Error('Journeys hero is pinned to the Marymere Falls photograph.');
  }
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
      alt: article.photo.alt || '',
      title: article.photo.title,
      categories: article.photo.categories,
      coords: article.photo.coords,
      thumb: smallThumbSrc(article.photo.thumb, smallThumbExists),
      focus: article.photo.focus || null,
    },
  }));
  const missingThumbs = cards.filter((article) => !article.photo.thumb);
  if (missingThumbs.length) {
    console.warn(
      `All journeys placeholders (no small photo thumb): ${missingThumbs.map((article) => article.slug).join(', ')}`,
    );
  }
  return {
    props: {
      articles: cards,
      counts: journalCategoryCounts(articles),
    },
  };
}

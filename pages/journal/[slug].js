import { useId, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import CategoryNav from '@/components/CategoryNav';
import Lightbox from '@/components/Lightbox';
import PhotoMap from '@/components/PhotoMap';
import ShapeMosaic from '@/components/ShapeMosaic';
import HeadlinePhrase from '@/components/HeadlinePhrase';
import Swatches from '@/components/Swatches';
import { getPhotos } from '@/lib/photo-data';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import {
  articles as articleRecords,
  formatArticleDate,
  hydrateArticle,
  hydrateArticles,
  journalCategoryCounts,
  journalCategoryPath,
} from '@/lib/articles';
import shapes from '@/lib/journalShapes.json';
import { graph, personNode, websiteNode, pageNode, articleNode } from '@/lib/seo';
import styles from '@/styles/Journal.module.css';

const POPPINS = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,300&display=swap';

function ExpandIcon() {
  return (
    <svg className={styles.expandIcon} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M7.2 1.2H10.8V4.8M4.8 10.8H1.2V7.2M10.6 1.4 6.7 5.3M1.4 10.6 5.3 6.7" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export default function JournalArticle({ article }) {
  const path = `/journal/${article.slug}`;
  const { photo } = article;
  const shape = shapes[String(article.photoNumber)];
  const [lbOpen, setLbOpen] = useState(false);
  const lightboxId = useId();
  const openerRef = useRef(null);
  const ar = photo.width / photo.height;
  const hasMap = photo.coords && typeof photo.coords.lat === 'number';

  const openLightbox = (event) => {
    openerRef.current = event.currentTarget;
    setLbOpen(true);
  };
  const closeLightbox = () => {
    setLbOpen(false);
    const el = openerRef.current;
    requestAnimationFrame(() => el?.focus());
  };

  const jsonLd = graph(
    websiteNode(),
    personNode(),
    pageNode('WebPage', { path, title: article.title, description: article.dek }),
    articleNode({
      path,
      headline: article.title,
      description: article.dek,
      image: [photo.src, photo.og.src],
      datePublished: article.date,
      dateModified: article.date,
      articleBody: article.paragraphs.join('\n\n'),
    }),
  );

  return (
    <>
      <Seo
        title={article.title}
        description={article.dek}
        path={path}
        image={photo.og}
        ogType="article"
        keywords={[article.location, photo.title, 'photography journal'].filter(Boolean)}
        jsonLd={jsonLd}
      />
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={POPPINS} />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:modified_time" content={article.date} />
        <meta property="article:author" content={article.author} />
      </Head>
      <article className={styles.article} style={{ '--ar': ar, '--accent': shape.accent }}>
        <div className={styles.journalCats}>
          <CategoryNav
            active={photo.categories}
            counts={article.counts}
            hrefFor={journalCategoryPath}
            label="Journal categories"
            disableEmpty
          />
        </div>
        <figure className={styles.hero} style={{ backgroundColor: photo.color }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 760px) 100vw, 760px"
            priority
            unoptimized
            className={styles.heroImg}
          />
        </figure>
        <div className={styles.spread}>
          <div className={styles.visual}>
            <ShapeMosaic
              src={photo.src}
              alt={photo.alt}
              onClick={openLightbox}
              expanded={lbOpen}
              controlsId={lightboxId}
            />
            <div className={styles.under}>
              {article.taken ? (
                <p className={styles.taken}>
                  Photo taken
                  <span aria-hidden="true"> · </span>
                  <time dateTime={article.taken}>{formatArticleDate(article.taken)}</time>
                </p>
              ) : null}
              <Swatches shape={shape} />
              {hasMap ? (
                <div className={styles.mapSlot}>
                  <PhotoMap bare coords={photo.coords} location={article.location} title={photo.title} />
                </div>
              ) : null}
              <p className={styles.viewRow}>
                <button
                  type="button"
                  className={styles.viewFull}
                  onClick={openLightbox}
                  aria-expanded={lbOpen}
                  aria-controls={lightboxId}
                >
                  View full image
                  <ExpandIcon />
                </button>
                <span aria-hidden="true">·</span>
                <Link href={photo.href}>{photo.title}</Link>
              </p>
            </div>
          </div>
          <div className={styles.panel}>
            <span className={styles.accent} aria-hidden="true" />
            {article.location ? <p className={styles.kicker}>{article.location}</p> : null}
            <HeadlinePhrase
              title={article.title}
              phrase={article.headlinePhrase}
              color={shape.palette[2]}
              as="h1"
              className={styles.title}
            />
            <p className={styles.dek}>{article.dek}</p>
            <p className={styles.byline}>
              {article.location ? (
                <span className={styles.desktopOnly}>
                  <span className={styles.place}>{article.location}</span>
                  <span aria-hidden="true"> · </span>
                </span>
              ) : null}
              <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
              <span aria-hidden="true"> · </span>
              <span>{article.author}</span>
            </p>
            <div className={styles.lead}>
              {article.paragraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.column}>
              {article.paragraphs.slice(2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <section className={styles.bag} aria-labelledby="from-the-bag">
                <h2 id="from-the-bag">From the bag</h2>
                <p className={styles.settings}>{article.gear.settings}</p>
                <p>{article.gear.note}</p>
              </section>
              <p className={styles.photoLink}>
                <Link href={photo.href}>View the photograph</Link>
              </p>
              {article.companion ? (
                <p className={styles.photoLink}>
                  <Link href={article.companion.href}>{article.companion.title}</Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </article>
      <Lightbox
        id={lightboxId}
        isOpen={lbOpen}
        photo={{ src: photo.src, alt: photo.alt, title: photo.title, href: photo.href }}
        onClose={closeLightbox}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: articleRecords.map((article) => ({ params: { slug: article.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const record = articleRecords.find((article) => article.slug === params.slug);
  if (!record) return { notFound: true };
  const number = photoNumberFromSrc(record.expectSrc);
  const shape = shapes[String(number)];
  if (!shape?.palette?.[2]) {
    throw new Error(`No swatch 3 for ${record.slug}.`);
  }
  const photos = await getPhotos();
  const articles = hydrateArticles(photos);
  const article = hydrateArticle(record, photos);
  return {
    props: {
      article: { ...article, counts: journalCategoryCounts(articles) },
    },
  };
}

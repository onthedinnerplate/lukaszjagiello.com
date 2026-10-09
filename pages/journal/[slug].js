import { useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import CategoryNav from '@/components/CategoryNav';
import Lightbox from '@/components/Lightbox';
import { getPhotos } from '@/lib/photo-data';
import {
  articles as articleRecords,
  formatArticleDate,
  hydrateArticle,
  hydrateArticles,
  journalCategoryCounts,
  journalCategoryPath,
} from '@/lib/articles';
import treatments from '@/lib/journalTreatments.json';
import { graph, personNode, websiteNode, pageNode, articleNode } from '@/lib/seo';
import styles from '@/styles/Journal.module.css';

const GUTTER = 6;

function cropOf(panel, src) {
  const { x, y, w, h } = panel;
  const left = x <= 0.001 ? 0 : GUTTER / 2;
  const top = y <= 0.001 ? 0 : GUTTER / 2;
  const right = x + w >= 0.999 ? 0 : GUTTER / 2;
  const bottom = y + h >= 0.999 ? 0 : GUTTER / 2;
  const posX = w >= 0.999 ? 0 : (x / (1 - w)) * 100;
  const posY = h >= 0.999 ? 0 : (y / (1 - h)) * 100;
  return {
    left: `calc(${x * 100}% + ${left}px)`,
    top: `calc(${y * 100}% + ${top}px)`,
    width: `calc(${w * 100}% - ${left + right}px)`,
    height: `calc(${h * 100}% - ${top + bottom}px)`,
    backgroundImage: `url("${src}")`,
    backgroundSize: `${w >= 0.999 ? 100 : 100 / w}% ${h >= 0.999 ? 100 : 100 / h}%`,
    backgroundPosition: `${posX}% ${posY}%`,
  };
}

/** Largest circle that fits inside a panel, in the mosaic's own aspect. */
function circleBox(panel, ar) {
  const cellAr = (panel.w / panel.h) * ar;
  if (cellAr >= 1) {
    const w = panel.h / ar;
    return { ...panel, x: panel.x + (panel.w - w) / 2, w };
  }
  const h = panel.w * ar;
  return { ...panel, y: panel.y + (panel.h - h) / 2, h };
}

function ExpandIcon() {
  return (
    <svg className={styles.expandIcon} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M7.2 1.2H10.8V4.8M4.8 10.8H1.2V7.2M10.6 1.4 6.7 5.3M1.4 10.6 5.3 6.7" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export default function JournalArticle({ article, counts }) {
  const path = `/journal/${article.slug}`;
  const { photo } = article;
  const treatment = treatments[article.slug];
  const [lbOpen, setLbOpen] = useState(false);
  const openerRef = useRef(null);
  const ar = photo.width / photo.height;

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
        keywords={[article.location, photo.title, 'photography journal']}
        jsonLd={jsonLd}
      />
      <Head>
        <meta property="article:published_time" content={article.date} />
        <meta property="article:modified_time" content={article.date} />
        <meta property="article:author" content={article.author} />
      </Head>
      <article
        className={`${styles.article} ${photo.height > photo.width ? styles.articlePortrait : ''}`}
        style={{ '--ar': ar, '--accent': treatment.overlay }}
      >
        <div className={styles.journalCats}>
          <CategoryNav
            active={photo.categories}
            counts={counts}
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
            <div className={styles.stage}>
              {treatment.blocks.map((block, i) => (
                <span
                  key={`block-${i}`}
                  className={styles.block}
                  style={{
                    left: `${block.x * 100}%`,
                    top: `${block.y * 100}%`,
                    width: `${block.w * 100}%`,
                    height: `${block.h * 100}%`,
                    background: block.color,
                  }}
                  aria-hidden="true"
                />
              ))}
              <button
                type="button"
                className={styles.mosaicBtn}
                onClick={openLightbox}
                aria-label={`View full image: ${photo.alt}`}
              >
                {treatment.panels.map((panel, i) => {
                  const box = panel.shape === 'circle' ? circleBox(panel, ar) : panel;
                  return (
                    <span
                      key={`slice-${i}`}
                      className={`${styles.slice} ${panel.shape === 'circle' ? styles.circle : ''}`}
                      style={cropOf(box, photo.src)}
                    >
                      {panel.overlay ? <span className={styles.veil} style={{ background: treatment.overlay }} /> : null}
                    </span>
                  );
                })}
              </button>
            </div>
            <div className={styles.under}>
              <ul className={styles.swatches}>
                {treatment.palette.map((hex, i) => (
                  <li key={`swatch-${i}`} className={styles.swatchItem}>
                    <span className={styles.swatch} style={{ background: hex }} />
                    <span className={styles.hex}>{hex}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.viewRow}>
                <button type="button" className={styles.viewFull} onClick={openLightbox}>
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
            <p className={styles.kicker}>{article.location}</p>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.dek}>{article.dek}</p>
            <p className={styles.byline}>
              <span className={styles.desktopOnly}>
                <span className={styles.place}>{article.location}</span>
                <span aria-hidden="true"> · </span>
              </span>
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
            </div>
          </div>
        </div>
      </article>
      <Lightbox
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
  if (!treatments[record.slug]) {
    throw new Error(`No journal treatment for ${record.slug}.`);
  }
  const photos = await getPhotos();
  const articles = hydrateArticles(photos);
  return {
    props: {
      article: hydrateArticle(record, photos),
      counts: journalCategoryCounts(articles),
    },
  };
}

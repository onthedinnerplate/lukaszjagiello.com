import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import { getPhotos } from '@/lib/photo-data';
import { articles as articleRecords, formatArticleDate, hydrateArticle } from '@/lib/articles';
import { graph, personNode, websiteNode, pageNode, articleNode } from '@/lib/seo';
import styles from '@/styles/Journal.module.css';

export default function JournalArticle({ article }) {
  const path = `/journal/${article.slug}`;
  const { photo } = article;
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
      <article className={styles.article}>
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
        <header>
          <p className={styles.kicker}>{article.location}</p>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.dek}>{article.dek}</p>
          <p className={styles.byline}>
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
            <span aria-hidden="true"> · </span>
            <span>{article.author}</span>
          </p>
        </header>
        <div className={styles.body}>
          {article.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <section className={styles.bag} aria-labelledby="from-the-bag">
          <h2 id="from-the-bag">From the bag</h2>
          <p className={styles.settings}>{article.gear.settings}</p>
          <p>{article.gear.note}</p>
        </section>
        <p className={styles.photoLink}>
          <Link href={photo.href}>View the photograph</Link>
        </p>
      </article>
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
  const photos = await getPhotos();
  return { props: { article: hydrateArticle(record, photos) } };
}

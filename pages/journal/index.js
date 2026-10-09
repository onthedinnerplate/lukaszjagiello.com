import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import CategoryNav from '@/components/CategoryNav';
import { getPhotos } from '@/lib/photo-data';
import {
  articlesInCategory,
  formatArticleDate,
  hydrateArticles,
  journalCategoryCounts,
  journalCategoryPath,
} from '@/lib/articles';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import styles from '@/styles/Journal.module.css';

const meta = {
  path: '/journal',
  title: 'Journal',
  description: `Essays by ${site.photographer} on the photographs — field notes from the coast, the forest, and the canyon.`,
};

export default function JournalIndex({ articles, counts }) {
  const { query } = useRouter();
  const category = typeof query.category === 'string' ? query.category : 'all';
  const visible = articlesInCategory(articles, category);

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography journal', 'field notes', ...articles.map((a) => a.location)]}
        jsonLd={graph(websiteNode(), personNode(), pageNode('CollectionPage', meta))}
      />
      <article className={styles.index}>
        <header className={styles.pageHeader}>
          <h1>Journal</h1>
          <p className={styles.lede}>Stories behind the photographs.</p>
          <div className={styles.journalCats}>
            <CategoryNav
              active={category}
              counts={counts}
              hrefFor={journalCategoryPath}
              label="Journal categories"
              disableEmpty
            />
          </div>
        </header>
        {visible.length === 0 ? (
          <p className={styles.empty}>No essays in this category.</p>
        ) : (
          <ul className={styles.list}>
            {visible.map((article, i) => (
              <li key={article.slug}>
                <Link href={`/journal/${article.slug}`} className={styles.card}>
                  <span className={styles.thumbWrap} style={{ backgroundColor: article.photo.color }}>
                    <Image
                      src={article.photo.thumb}
                      alt={article.photo.alt}
                      width={article.photo.thumbWidth || article.photo.width}
                      height={article.photo.thumbHeight || article.photo.height}
                      sizes="(max-width: 640px) 100vw, 200px"
                      {...(i === 0 ? { priority: true } : { loading: 'lazy' })}
                      unoptimized
                      className={styles.thumb}
                    />
                  </span>
                  <span className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{article.title}</h2>
                    <p className={styles.cardDek}>{article.dek}</p>
                    <p className={styles.cardMeta}>
                      {article.location}
                      <span aria-hidden="true"> · </span>
                      <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
                    </p>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  );
}

export async function getStaticProps() {
  const photos = await getPhotos();
  const articles = hydrateArticles(photos);
  return { props: { articles, counts: journalCategoryCounts(articles) } };
}

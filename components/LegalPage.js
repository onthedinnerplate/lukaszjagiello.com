import Seo from '@/components/Seo';
import SiteCategoryNav from '@/components/SiteCategoryNav';
import { graph, websiteNode, pageNode } from '@/lib/seo';
import styles from '@/styles/Page.module.css';

/** Shared shell for the legal pages: header, "last updated", then the sections. */
export default function LegalPage({ path, title, description, updated, lede, navCounts, children }) {
  return (
    <>
      <Seo title={title} description={description} path={path} jsonLd={graph(websiteNode(), pageNode('WebPage', { path, title, description }))} />
      <article className={`${styles.page} ${styles.legal}`}>
        <div className={styles.pageCats}>
          <SiteCategoryNav counts={navCounts} label={`${title} categories`} />
        </div>
        <header className={styles.pageHeader}>
          <h1>{title}</h1>
          {lede && <p className={styles.lede}>{lede}</p>}
          <p className={styles.updated}>Last updated {updated}</p>
        </header>
        {children}
      </article>
    </>
  );
}

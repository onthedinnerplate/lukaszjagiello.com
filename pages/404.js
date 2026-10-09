import Link from 'next/link';
import Seo from '@/components/Seo';
import SiteCategoryNav from '@/components/SiteCategoryNav';
import { categoryNavProps } from '@/lib/photo-data';
import styles from '@/styles/Page.module.css';

export default function NotFound({ navCounts }) {
  return (
    <>
      <Seo title="Page not found" path="/404" noindex description="The page you were looking for doesn't exist." />
      <article className={styles.page}>
        <div className={styles.pageCats}>
          <SiteCategoryNav counts={navCounts} label="Categories" />
        </div>
        <header className={styles.pageHeader}>
          <h1>Page not found</h1>
          <p className={styles.lede}>That page has wandered off into the fog.</p>
        </header>
        <Link href="/" className="button">
          Back to home
        </Link>
      </article>
    </>
  );
}

export async function getStaticProps() {
  return { props: await categoryNavProps() };
}

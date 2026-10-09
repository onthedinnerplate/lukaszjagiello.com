import Link from 'next/link';
import Seo from '@/components/Seo';
import SiteCategoryNav from '@/components/SiteCategoryNav';
import { graph, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import { CATEGORIES, categoryMenuLabel, galleryPathFor } from '@/lib/categories';
import { getGalleryPhotos, heroNavCounts } from '@/lib/photo-data';
import styles from '@/styles/Page.module.css';

const meta = { path: '/sitemap', title: 'Sitemap', description: `Every page and photograph on ${site.name}.` };

export default function Sitemap({ photos, navCounts }) {
  const legal = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Sales & Licensing', href: '/licensing' },
  ];
  return (
    <>
      <Seo title={meta.title} description={meta.description} path={meta.path} jsonLd={graph(websiteNode(), pageNode('WebPage', meta))} />
      <article className={styles.page}>
        <div className={styles.pageCats}>
          <SiteCategoryNav counts={navCounts} label="Sitemap categories" />
        </div>
        <header className={styles.pageHeader}>
          <h1>Sitemap</h1>
          <p className={styles.lede}>Every page on the site. Search engines use the <a href="/sitemap.xml">XML version</a>.</p>
        </header>

        <div className={styles.sitemapGrid}>
          <section className={styles.block}>
            <h2>Pages</h2>
            <ul className={styles.sitemapList}>
              {site.nav.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              {legal.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </section>
          <section className={styles.block}>
            <h2>Future Photography</h2>
            <ul className={styles.sitemapList}>
              <li><Link href="/gallery">All photographs</Link></li>
              {CATEGORIES.map((c) => <li key={c.slug}><Link href={galleryPathFor(c.slug)}>{categoryMenuLabel(c)}</Link></li>)}
            </ul>
          </section>
        </div>

        <section className={styles.block}>
          <h2>Photographs ({photos.length})</h2>
          <ul className={`${styles.sitemapList} ${styles.sitemapPhotos}`}>
            {photos.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>{p.title}</Link>
                {p.location ? <span className={styles.sitemapLoc}> — {p.location}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}

export async function getStaticProps() {
  const gallery = await getGalleryPhotos();
  const photos = gallery.map(({ title, href, location }) => ({ title, href, location: location || null }));
  return { props: { photos, navCounts: heroNavCounts(gallery) } };
}

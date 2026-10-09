import Link from 'next/link';
import Seo from '@/components/Seo';
import JourneysHero from '@/components/JourneysHero';
import MasonryGallery from '@/components/MasonryGallery';
import { getPhotos } from '@/lib/photo-data';
import { hydrateArticles, journalCategoryCounts, journalCategoryPath } from '@/lib/articles';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import styles from '@/styles/Home.module.css';

const meta = {
  path: '/',
  title: null,
  description: site.description,
};

export default function Home({ photos, journalCounts }) {
  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography portfolio', 'landscape photography', 'professional photographer']}
        jsonLd={graph(websiteNode(), personNode(), pageNode('WebPage', { ...meta, title: site.name }))}
      />

      <JourneysHero
        nav={{
          active: '',
          counts: journalCounts,
          hrefFor: journalCategoryPath,
          label: 'Home Journeys categories',
          disableEmpty: true,
        }}
      />

      <section className={styles.section} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <h2 id="featured-heading">Featured Collections</h2>
          <p>A selection of curated photography from diverse locations and subjects.</p>
        </div>
        <MasonryGallery photos={photos} headingId="featured-heading" />
      </section>

      <section className={styles.cta} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className={styles.ctaTitle}>
          Stories from the terrain
        </h2>
        <Link href="/gallery" className="button">
          See our journeys
        </Link>
      </section>
    </>
  );
}

export async function getStaticProps() {
  const all = await getPhotos();
  // Curated set, selected by photo number so retitling/reordering photos.js never changes it.
  const byNumber = new Map(all.map((p) => [photoNumberFromSrc(p.src), p]));
  const curated = (site.homeFeatured || [])
    .map((n) => byNumber.get(n))
    .filter(Boolean);
  const photos = curated.length ? curated : all.slice(0, site.homeFeaturedCount);
  return { props: { photos, journalCounts: journalCategoryCounts(hydrateArticles(all)) } };
}

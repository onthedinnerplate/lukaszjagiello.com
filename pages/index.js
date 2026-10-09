import Link from 'next/link';
import Seo from '@/components/Seo';
import JourneysHero from '@/components/JourneysHero';
import SelectedPhotographs, { selectedPhotos } from '@/components/SelectedPhotographs';
import { getPhotos, heroNavCounts } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import styles from '@/styles/Home.module.css';

const meta = {
  path: '/',
  title: null,
  description: site.description,
};

export default function Home({ selected, navCounts }) {
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
        bleed
        headingAs="p"
        nav={{
          active: 'home',
          counts: navCounts,
          label: 'Home categories',
        }}
      />

      <section className={`${styles.section} ${styles.sectionFirst}`} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <h1 id="featured-heading">Featured Collections</h1>
          <p>A selection of curated photography from diverse locations and subjects.</p>
        </div>
        <SelectedPhotographs photos={selected} />
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
  return { props: { selected: selectedPhotos(all), navCounts: heroNavCounts(all) } };
}

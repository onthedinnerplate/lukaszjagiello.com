import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import { getPhotos, getHero } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import styles from '@/styles/Home.module.css';

const meta = {
  path: '/',
  title: null,
  description: site.description,
};

export default function Home({ hero, photos, total }) {
  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography portfolio', 'Monterey Bay', 'Ruby Beach', 'Alcatraz', 'Jamaica']}
        jsonLd={graph(websiteNode(), personNode(), pageNode('WebPage', { ...meta, title: site.name }))}
      />

      <section className={styles.hero} aria-labelledby="hero-heading">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          preload
          fetchPriority="high"
          // On phones the 550px-tall box crops a wide image, so it renders
          // ~2x the viewport width; request accordingly to avoid a soft hero.
          sizes="(max-width: 640px) 200vw, 100vw"
          className={styles.heroImg}
          style={{ backgroundColor: hero.color }}
        />
        <div className={styles.heroScrim}>
          <div className={styles.heroText}>
            <h1 id="hero-heading" className={styles.heroTitle}>
              {site.name}
            </h1>
            <p className={styles.heroSub}>Landscapes, coastlines &amp; wildlife — from the Golden Gate to the Caribbean.</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <h2 id="featured-heading">Featured work</h2>
          <p>A selection from San Francisco, Alcatraz, Jamaica, Monterey Bay, Ruby Beach and the wild.</p>
        </div>
        <MasonryGallery photos={photos} headingId="featured-heading" />
      </section>

      <section className={styles.cta} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className={styles.ctaTitle}>
          Explore more
        </h2>
        <p className={styles.ctaText}>See all {total} photographs in the full gallery.</p>
        <Link href="/gallery" className="button">
          View the gallery
        </Link>
      </section>
    </>
  );
}

export async function getStaticProps() {
  const [hero, all] = await Promise.all([getHero(), getPhotos()]);
  return { props: { hero, photos: all.slice(0, site.homeFeaturedCount), total: all.length } };
}

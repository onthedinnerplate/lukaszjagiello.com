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
  // Get 4 sample images for hero grid
  const heroImages = photos.slice(0, 4);

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography portfolio', 'landscape photography', 'professional photographer']}
        jsonLd={graph(websiteNode(), personNode(), pageNode('WebPage', { ...meta, title: site.name }))}
      />

      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroText}>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Every Frame Has A Story
          </h1>
          <p className={styles.heroSub}>
            A curated collection of landscape, travel, and lifestyle photography.
            Capturing moments from around the world.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/gallery" className="button">
              Explore Work
            </Link>
            <Link href="/contact" className="button solid">
              Contact
            </Link>
          </div>
        </div>

        {/* Image grid on the right */}
        <div className={styles.heroGrid}>
          {heroImages.map((photo, idx) => (
            <div key={photo.id} className={styles.heroGridItem}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <h2 id="featured-heading">Featured Collections</h2>
          <p>A selection of curated photography from diverse locations and subjects.</p>
        </div>
        <MasonryGallery photos={photos} headingId="featured-heading" />
      </section>

      <section className={styles.cta} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className={styles.ctaTitle}>
          View all work
        </h2>
        <p className={styles.ctaText}>Explore the complete gallery with {total} photographs.</p>
        <Link href="/gallery" className="button">
          See the full collection
        </Link>
      </section>
    </>
  );
}

export async function getStaticProps() {
  const [hero, all] = await Promise.all([getHero(), getPhotos()]);
  return { props: { hero, photos: all.slice(0, site.homeFeaturedCount), total: all.length } };
}

import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import { getPhotos, getHero } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import styles from '@/styles/Home.module.css';

const meta = {
  path: '/',
  title: null,
  description: site.description,
};

export default function Home({ hero, photos, total }) {
  // Hero collage = first `heroCount` of the curated homepage set (cover-cropped to the grid).
  const heroImages = photos.slice(0, site.heroCount || 4);

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
            <div key={photo.src} className={styles.heroGridItem} style={{ '--focus': photo.focus || '50% 50%' }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 900px) 50vw, 20vw"
                priority={idx === 0}
                unoptimized
                style={{ objectFit: 'cover', objectPosition: photo.focus || '50% 50%' }}
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
  // Curated set, selected by photo number so retitling/reordering photos.js never changes it.
  const byNumber = new Map(all.map((p) => [photoNumberFromSrc(p.src), p]));
  const curated = (site.homeFeatured || [])
    .map((n) => byNumber.get(n))
    .filter(Boolean);
  const photos = curated.length ? curated : all.slice(0, site.homeFeaturedCount);
  return { props: { hero, photos, total: all.length } };
}

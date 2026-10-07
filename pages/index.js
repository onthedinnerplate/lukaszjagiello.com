import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Lightbox from '@/components/Lightbox';
import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import HeroSpotlight from '@/components/HeroSpotlight';
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

  // Hero tiles open the lightbox over the full homepage set so prev/next work.
  // TODO: once per-photo pages exist at /photo/[slug], link tiles there instead
  // (see docs/photo-pages-and-image-seo.md) and keep the lightbox for the grid.
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const openPhoto = (photo) => {
    const i = photos.findIndex((p) => p.src === photo.src);
    if (i >= 0) {
      setLbIndex(i);
      setLbOpen(true);
    }
  };

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
            <button
              key={photo.src}
              type="button"
              className={styles.heroGridItem}
              style={{ '--focus': photo.focus || '50% 50%' }}
              onClick={() => openPhoto(photo)}
              aria-label={`View ${photo.title} in fullscreen`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 900px) 50vw, 20vw"
                priority={idx === 0}
                unoptimized
                style={{ objectFit: 'cover', objectPosition: photo.focus || '50% 50%' }}
              />
            </button>
          ))}
          {/* Rendered after the tiles so the :nth-child tile rules stay 1–5. */}
          {heroImages.length >= 5 && <HeroSpotlight photos={heroImages.slice(1, 5)} onSelect={openPhoto} />}
        </div>
      </section>

      <Lightbox
        isOpen={lbOpen}
        photo={photos[lbIndex]}
        onClose={() => setLbOpen(false)}
        onNext={() => setLbIndex((i) => (i + 1) % photos.length)}
        onPrev={() => setLbIndex((i) => (i - 1 + photos.length) % photos.length)}
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

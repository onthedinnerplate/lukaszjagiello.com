import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Lightbox from '@/components/Lightbox';
import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import HeroSpotlight from '@/components/HeroSpotlight';
import ResponsiveImage from '@/components/ResponsiveImage';
import ShareButton from '@/components/ShareButton';
import BuyIcon from '@/components/BuyIcon';
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

// Tiles are ~221px at 1440 (the 1400px hero, image column, 3 tracks).
// The fifth tile spans the row under 900px, so it is ~100vw there.
// 240px × 2 covers the cover-crop and the 1.08 Ken Burns on the tall tile.
const TILE_SIZES = '(max-width: 900px) 50vw, 240px';
const TILE_WIDE_SIZES = '(max-width: 900px) 100vw, 240px';

export default function Home({ hero, photos, total }) {
  // Hero collage = first `heroCount` of the curated homepage set (cover-cropped to the grid).
  const heroImages = photos.slice(0, site.heroCount || 4);

  // Hero tiles open the lightbox over the full homepage set so prev/next work.
  // TODO: once per-photo pages exist at /photo/[slug], link tiles there instead
  // (see docs/photo-pages-and-image-seo.md) and keep the lightbox for the grid.
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null); // hero tile under the pointer, or null
  const openPhoto = (photo) => {
    const i = photos.findIndex((p) => p.src === photo.src);
    if (i >= 0) {
      setLbIndex(i);
      setLbOpen(true);
    }
  };
  // Tiles are real links to the photo page (crawlable, middle-clickable);
  // a plain left click opens the lightbox instead.
  const onTileClick = (e, photo) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openPhoto(photo);
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

      <Head>
        {heroImages[0]?.thumbSrcSet ? (
          <link
            rel="preload"
            as="image"
            imageSrcSet={heroImages[0].thumbSrcSet}
            imageSizes={TILE_SIZES}
            fetchPriority="high"
          />
        ) : null}
      </Head>

      <section className={styles.hero} aria-labelledby="hero-heading">
        <picture className={styles.heroImg}>
          <source type="image/avif" srcSet={hero.avifSrcSet} sizes={hero.sizes} />
          <source type="image/webp" srcSet={hero.webpSrcSet} sizes={hero.sizes} />
          <img
            src={hero.src}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            sizes={hero.sizes}
            srcSet={hero.webpSrcSet}
            decoding="async"
            loading="lazy"
          />
        </picture>
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
        <div className={styles.heroGrid} onMouseLeave={() => setHoverIndex(null)}>
          {heroImages.map((photo, idx) => (
            <div
              key={photo.src}
              className={styles.heroGridItem}
              style={{ '--focus': photo.focus || '50% 50%' }}
              // Slot 0 (the tall Golden Gate tile) is static — it never triggers the reveal.
              onMouseEnter={() => setHoverIndex(idx === 0 ? null : idx)}
              onFocus={() => setHoverIndex(idx === 0 ? null : idx)}
              onBlur={() => setHoverIndex(null)}
            >
              <Link
                href={photo.href || '/gallery'}
                className={styles.heroTileBtn}
                onClick={(e) => onTileClick(e, photo)}
                aria-label={`${photo.title} — view fullscreen`}
              >
                <ResponsiveImage
                  pictureClassName={styles.heroPicture}
                  src={photo.thumb || photo.src}
                  alt={photo.alt}
                  width={photo.thumbWidth || photo.width}
                  height={photo.thumbHeight || photo.height}
                  sizes={idx === heroImages.length - 1 ? TILE_WIDE_SIZES : TILE_SIZES}
                  srcSet={photo.thumbSrcSet}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : undefined}
                  style={{ objectFit: 'cover', objectPosition: photo.focus || '50% 50%' }}
                />
              </Link>
              <span className={styles.cardActions}>
                <BuyIcon photo={photo} className={styles.share} />
                <ShareButton
                  title={photo.title}
                  url={photo.href}
                  className={styles.share}
                  toastClassName={styles.toast}
                  wrapperClassName={styles.shareWrap}
                />
              </span>
            </div>
          ))}
          {/* Rendered after the tiles so the :nth-child tile rules stay 1–5. */}
          {heroImages.length >= 5 && <HeroSpotlight photos={heroImages} hoverIndex={hoverIndex} onHover={setHoverIndex} onSelect={openPhoto} />}
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

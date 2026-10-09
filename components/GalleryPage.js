import { useId, useState } from 'react';
import Link from 'next/link';
import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import JourneysHero from '@/components/JourneysHero';
import CategoryNav from '@/components/CategoryNav';
import BuyButton from '@/components/BuyButton';
import BuyIcon from '@/components/BuyIcon';
import ShareButton from '@/components/ShareButton';
import Lightbox from '@/components/Lightbox';
import ResponsiveImage from '@/components/ResponsiveImage';
import { captionFor, photoNumberFromSrc } from '@/lib/photoCaption';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import { galleryPathFor } from '@/lib/categories';
import { site } from '@/lib/site';
import { LICENCE_SUMMARY, TIERS, formatPrice } from '@/lib/store';
import pageStyles from '@/styles/Page.module.css';
import styles from '@/styles/Gallery.module.css';

const FEATURED_SIZES = '(max-width: 1000px) 100vw, 60vw';

function pickFeatured(photos) {
  return photos.find((photo) => Array.isArray(photo.tiers) && photo.tiers.length) || photos[0] || null;
}

function FeaturedPhotograph({ photo, more }) {
  const { equipment, specs } = captionFor(photo);
  const slides = [photo, ...more];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const lightboxId = useId();
  const tiers = Array.isArray(photo.tiers) ? photo.tiers : [];

  return (
    <section className={styles.band} aria-labelledby="featured-photograph">
      <h2 id="featured-photograph" className={styles.sectionLabel}>Featured photograph</h2>
      <div className={styles.saleFeatured}>
        <div className={styles.saleMain}>
          <figure className={styles.figure}>
            <div className={styles.frame} style={{ backgroundColor: photo.color }}>
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
              <button
                type="button"
                className={styles.featuredOpen}
                onClick={() => { setIndex(0); setOpen(true); }}
                aria-expanded={open}
                aria-controls={lightboxId}
              >
                <ResponsiveImage
                  pictureClassName={styles.picture}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes={FEATURED_SIZES}
                  srcSet={photo.width ? `${photo.src} ${photo.width}w` : undefined}
                  avifSrcSet={photo.fullAvif && photo.width ? `${photo.fullAvif} ${photo.width}w` : undefined}
                  className={styles.featuredImg}
                  loading="eager"
                  fetchPriority="high"
                />
              </button>
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.title}>
                {photo.href ? <Link href={photo.href} className={styles.titleLink}>{photo.title}</Link> : photo.title}
                {photo.location ? <span className={styles.location}>{photo.location}</span> : null}
              </span>
              {(equipment || specs) && (
                <span className={styles.metaBlock}>
                  {equipment && <span className={styles.meta}>{equipment}</span>}
                  {specs && <span className={styles.meta}>{specs}</span>}
                </span>
              )}
            </figcaption>
          </figure>
          {tiers.length > 0 ? (
            <BuyButton
              photoNumber={photoNumberFromSrc(photo.src)}
              tiers={tiers}
              licence={LICENCE_SUMMARY}
            />
          ) : null}
        </div>
        {more.length > 0 ? (
          <aside className={styles.saleMore} aria-labelledby="more-photographs">
            <h3 id="more-photographs" className={styles.saleMoreLabel}>More photographs</h3>
            <ul>
              {more.map((item) => (
                <li key={item.src}>
                  {item.location ? <p className={styles.saleMorePlace}>{item.location}</p> : null}
                  <Link href={item.href}>{item.title}</Link>
                </li>
              ))}
            </ul>
            <a href="#gallery-grid" className={styles.saleLink}>All photographs</a>
          </aside>
        ) : null}
      </div>
      <Lightbox
        id={lightboxId}
        isOpen={open}
        photo={slides[index]}
        onClose={() => setOpen(false)}
        onPrev={() => setIndex((n) => (n - 1 + slides.length) % slides.length)}
        onNext={() => setIndex((n) => (n + 1) % slides.length)}
      />
    </section>
  );
}

function PhotoBand({ id, label, photos, layout }) {
  if (!photos.length) return null;
  return (
    <section className={styles.band} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionLabel}>
        {label} <span>{photos.length}</span>
      </h2>
      <MasonryGallery
        photos={photos}
        layout={layout}
        anchor={false}
        headingId={id}
        priorityCount={layout === 'row' ? 2 : 0}
      />
    </section>
  );
}

/** Shared by /gallery (all) and /gallery/[category]. */
export default function GalleryPage({ photos, category, counts }) {
  const isAll = !category || category.slug === 'all';
  const meta = isAll
    ? {
        path: '/gallery',
        title: 'Gallery',
        description: 'Full portfolio of landscape, coastal and wildlife photographs by Łukasz Jagiełło.',
      }
    : {
        path: galleryPathFor(category.slug),
        title: `${category.label} Photography`,
        description: `${category.description} — ${category.label.toLowerCase()} photographs by ${site.photographer}.`,
      };

  const jsonLd = graph(websiteNode(), personNode(), {
    ...pageNode('ImageGallery', meta),
    associatedMedia: photos.map(imageObject),
  });

  const featured = pickFeatured(photos);
  const more = featured ? photos.filter((photo) => photo.src !== featured.src).slice(0, 6) : [];
  const selected = photos.slice(0, Math.min(4, photos.length));
  const further = photos.slice(4, 16);
  const cluster = photos.slice(0, 7);

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={isAll ? ['photo gallery', 'landscape prints', 'wildlife photos'] : [`${category.label.toLowerCase()} photography`, `${category.label.toLowerCase()} prints`]}
        jsonLd={jsonLd}
      />
      <JourneysHero headingAs="p" />
      <section className={pageStyles.galleryPage} aria-labelledby="gallery-heading">
        <header className={pageStyles.pageHeader}>
          <h1 id="gallery-heading" className={pageStyles.galleryHeading}>{isAll ? 'Gallery' : category.label}</h1>
          {isAll ? null : (
            <p className={pageStyles.lede}>
              {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'}
              {` — ${category.description.toLowerCase()}.`}
            </p>
          )}
        </header>

        <PhotoBand id="selected-photos" label="Selected photographs" photos={selected} layout="row" />
        {featured ? <FeaturedPhotograph photo={featured} more={more} /> : null}
        <PhotoBand id="further-photos" label="Further photographs" photos={further.length >= 2 ? further : []} layout="trio" />

        <section className={styles.band} id="gallery-grid" aria-labelledby="all-photos-title">
          <h2 id="all-photos-title" className={`${styles.sectionLabel} ${styles.gridLabel}`}>
            All photographs <span>{photos.length}</span>
          </h2>
          <div className={styles.gridNav}>
            <CategoryNav
              active={isAll ? 'all' : category.slug}
              counts={counts}
              hrefFor={galleryPathFor}
              label={isAll ? 'Gallery categories' : `${category.label} gallery categories`}
              includeAll={false}
            />
          </div>
          <MasonryGallery photos={photos} wide headingId="all-photos-title" />
        </section>
      </section>

      <section className={styles.saleClose} aria-labelledby="download-title">
        <div className={styles.saleCloseCopy}>
          <p className={styles.saleKicker}>Digital downloads</p>
          <h2 id="download-title" className={styles.saleCloseTitle}>Buy a photograph</h2>
          <ul className={styles.saleTiers}>
            {TIERS.map((tier) => (
              <li key={tier.id}>
                <span className={styles.saleTierLabel}>{tier.label}</span>
                {' — '}
                {formatPrice(tier.priceCents)}
                {'. '}
                {tier.blurb}
              </li>
            ))}
          </ul>
          <p className={styles.saleLicence}>
            {LICENCE_SUMMARY} <Link href="/licensing">Full licence terms</Link>
          </p>
          {featured?.href && featured.tiers?.length ? (
            <a href="#buy" className={styles.saleLink}>Buy {featured.title}</a>
          ) : null}
        </div>
        {cluster.length > 0 ? (
          <ul className={styles.saleCluster} aria-hidden="true">
            {cluster.map((photo) => (
              <li key={photo.src}>
                <img
                  src={photo.thumb || photo.src}
                  alt=""
                  width={photo.thumbWidth || photo.width}
                  height={photo.thumbHeight || photo.height}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}

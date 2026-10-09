import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import JourneysHero from '@/components/JourneysHero';
import CategoryNav from '@/components/CategoryNav';
import { PhotoCardActions } from '@/components/ShareButtons';
import Lightbox from '@/components/Lightbox';
import ResponsiveImage from '@/components/ResponsiveImage';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { ogImageSrc } from '@/lib/slug';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import { galleryPathFor, inCategory } from '@/lib/categories';
import { site } from '@/lib/site';
import SelectedPhotographs, { selectedPhotos } from '@/components/SelectedPhotographs';
import pageStyles from '@/styles/Page.module.css';
import styles from '@/styles/Gallery.module.css';

/**
 * Twelve photographs for the future-photos block: three whose category data
 * already matches each gallery category. Photo 13 is tagged people and
 * architecture; it is used only for people. Nothing is relabelled.
 */
const FUTURE_PICKS = [
  { n: 23, category: 'landscape' },
  { n: 34, category: 'landscape' },
  { n: 27, category: 'landscape' },
  { n: 20, category: 'animals' },
  { n: 26, category: 'animals' },
  { n: 29, category: 'animals' },
  { n: 8, category: 'architecture' },
  { n: 9, category: 'architecture' },
  { n: 14, category: 'architecture' },
  { n: 1, category: 'people' },
  { n: 2, category: 'people' },
  { n: 13, category: 'people' },
];

function pickFuture(photos) {
  const byNumber = new Map(photos.map((photo) => [photoNumberFromSrc(photo.src), photo]));
  return FUTURE_PICKS.map((pick) => {
    const photo = byNumber.get(pick.n);
    if (!photo || !inCategory(photo, pick.category)) return null;
    return photo;
  }).filter(Boolean);
}

function slugFromPath(path) {
  const parts = String(path || '').split('?')[0].split('/').filter(Boolean);
  if (parts[0] !== 'gallery') return 'all';
  return parts[1] || 'all';
}

function GallerySectionNav({ active, counts, onSelect, onDark = false, label = 'Gallery categories' }) {
  return (
    <div className={`${styles.sectionNav} ${onDark ? styles.sectionNavOnDark : ''}`}>
      <CategoryNav
        active={active}
        counts={counts}
        hrefFor={galleryPathFor}
        includeAll={false}
        label={label}
        onSelect={onSelect}
      />
    </div>
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

  const listed = isAll ? photos : photos.filter((photo) => inCategory(photo, category.slug));
  const jsonLd = graph(websiteNode(), personNode(), {
    ...pageNode('ImageGallery', meta),
    associatedMedia: listed.map(imageObject),
  });

  const gate = photos.find((photo) => photoNumberFromSrc(photo.src) === 12) || photos[0] || null;
  const more = gate ? photos.filter((photo) => photo.src !== gate.src).slice(0, 6) : [];
  const selected = selectedPhotos(photos);
  const future = pickFuture(photos);

  const [gridCategory, setGridCategory] = useState(isAll ? 'all' : category.slug);
  const [futureCategory, setFutureCategory] = useState('all');
  const [gateOpen, setGateOpen] = useState(false);
  const gateLightboxId = useId();

  useEffect(() => {
    const onPop = () => setGridCategory(slugFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (isAll) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = requestAnimationFrame(() => {
      document.getElementById('all-photographs')?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isAll]);

  const scrollToAll = (slug) => {
    setGridCategory(slug);
    const href = galleryPathFor(slug);
    if (window.location.pathname !== href) {
      window.history.pushState({ galleryCategory: slug }, '', href);
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('all-photographs')?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const filterFuture = (slug) => {
    setFutureCategory((current) => (current === slug ? 'all' : slug));
  };

  const gridPhotos = gridCategory === 'all'
    ? photos
    : photos.filter((photo) => inCategory(photo, gridCategory));
  const futurePhotos = futureCategory === 'all'
    ? future
    : future.filter((photo) => inCategory(photo, futureCategory));

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
              {listed.length} {listed.length === 1 ? 'photograph' : 'photographs'}
              {` — ${category.description.toLowerCase()}.`}
            </p>
          )}
        </header>

        {gate ? (
          <section className={styles.band} aria-labelledby="gate-hero-title">
            <h2 id="gate-hero-title" className={styles.sectionLabel}>Featured photograph</h2>
            <GallerySectionNav
              active={gridCategory}
              counts={counts}
              onSelect={scrollToAll}
              label="Featured photograph categories"
            />
            <div className={styles.saleFeatured}>
              <div className={styles.saleMain}>
                <div className={styles.gateFrame} style={{ backgroundColor: gate.color }}>
                  <PhotoCardActions
                    title={gate.title}
                    shareUrl={gate.href}
                    pinUrl={gate.href}
                    mediaUrl={ogImageSrc(gate.src) || gate.src}
                    photo={gate}
                  />
                  <button
                    type="button"
                    className={styles.gateOpen}
                    onClick={() => setGateOpen(true)}
                    aria-label={gate.title}
                    aria-expanded={gateOpen}
                    aria-controls={gateLightboxId}
                  >
                    <ResponsiveImage
                      pictureClassName={styles.gatePicture}
                      src={gate.src}
                      alt={gate.alt}
                      width={gate.width}
                      height={gate.height}
                      sizes="(max-width: 1000px) 100vw, 60vw"
                      srcSet={gate.width ? `${gate.src} ${gate.width}w` : undefined}
                      avifSrcSet={gate.fullAvif && gate.width ? `${gate.fullAvif} ${gate.width}w` : undefined}
                      className={styles.gateImg}
                      loading="eager"
                      fetchPriority="high"
                    />
                  </button>
                </div>
              </div>
              {more.length > 0 ? (
                <aside className={styles.saleMore} aria-labelledby="more-photographs">
                  <h3 id="more-photographs" className={styles.saleMoreLabel}>More photographs</h3>
                  <GallerySectionNav
                    active={gridCategory}
                    counts={counts}
                    onSelect={scrollToAll}
                    onDark
                    label="More photographs categories"
                  />
                  <ul>
                    {more.map((item) => (
                      <li key={item.src}>
                        {item.location ? <p className={styles.saleMorePlace}>{item.location}</p> : null}
                        <Link href={item.href}>{item.title}</Link>
                      </li>
                    ))}
                  </ul>
                  <a href="#all-photographs" className={styles.saleLink}>All photographs</a>
                </aside>
              ) : null}
            </div>
            <Lightbox
              id={gateLightboxId}
              isOpen={gateOpen}
              photo={gate}
              onClose={() => setGateOpen(false)}
              onPrev={() => {}}
              onNext={() => {}}
            />
          </section>
        ) : null}

        <section className={styles.band} aria-labelledby="selected-photos">
          <h2 id="selected-photos" className={styles.sectionLabel}>
            Selected photographs <span>{selected.length}</span>
          </h2>
          <GallerySectionNav
            active={gridCategory}
            counts={counts}
            onSelect={scrollToAll}
            label="Selected photograph categories"
          />
          <SelectedPhotographs photos={selected} />
        </section>

        <section className={`${styles.band} ${styles.anchor}`} id="all-photographs" aria-labelledby="all-photos-title">
          <h2 id="all-photos-title" className={`${styles.sectionLabel} ${styles.gridLabel}`}>
            All photographs <span>{gridPhotos.length}</span>
          </h2>
          <div className={styles.gridNav}>
            <GallerySectionNav
              active={gridCategory}
              counts={counts}
              onSelect={scrollToAll}
              label={isAll ? 'Gallery categories' : `${category.label} gallery categories`}
            />
          </div>
          <MasonryGallery photos={gridPhotos} layout="uniform" wide headingId="all-photos-title" />
        </section>

        <section className={`${styles.band} ${styles.anchor} ${styles.futureBand}`} id="future-photographs" aria-labelledby="future-photos-title">
          <h2 id="future-photos-title" className={styles.sectionLabel}>
            Future photographs <span>{futurePhotos.length}</span>
          </h2>
          <GallerySectionNav
            active={futureCategory}
            counts={{}}
            onSelect={filterFuture}
            label="Future photograph categories"
          />
          <MasonryGallery
            photos={futurePhotos}
            layout="tight"
            anchor={false}
            headingId="future-photos-title"
          />
        </section>
      </section>
    </>
  );
}

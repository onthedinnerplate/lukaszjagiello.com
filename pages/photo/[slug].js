import { useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Lightbox from '@/components/Lightbox';
import Seo from '@/components/Seo';
import { PhotoCardActions } from '@/components/ShareButtons';
import Swatches from '@/components/Swatches';
import PhotoMap from '@/components/PhotoMap';
import BuyButton from '@/components/BuyButton';
import { LICENCE_SUMMARY } from '@/lib/store';
import { availableTiers } from '@/lib/store-server';
import { getPhotos, getGalleryPhotos } from '@/lib/photo-data';
import { CATEGORIES, inCategory } from '@/lib/categories';
import { captionFor, exifDataFor, mentionsGear, photoNumberFromSrc } from '@/lib/photoCaption';
import { AffiliateDisclosure, GearLine, gearLineClass } from '@/components/GearStoreLinks';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import { ogImageSrc } from '@/lib/slug';
import palettes from '@/lib/photoPalettes.json';
import styles from '@/styles/Page.module.css';

function neighbourPair(list, index) {
  const prev = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];
  return {
    prev: { title: prev.title, href: prev.href },
    next: { title: next.title, href: next.href },
  };
}

export default function PhotoPage({ photo, prev, next, tiers, photoNumber, sequences = {} }) {
  const router = useRouter();
  const requested = typeof router.query.category === 'string' ? router.query.category : '';
  const inSequence = requested && sequences[requested] ? sequences[requested] : null;
  const adjacent = inSequence || { prev, next };
  const categoryQuery = inSequence ? requested : '';
  const withCategory = (href) => (
    categoryQuery ? `${href}?category=${encodeURIComponent(categoryQuery)}` : href
  );
  const [lbOpen, setLbOpen] = useState(false);
  const lightboxId = useId();
  const { equipment, specs } = captionFor(photo);
  const description = photo.alt;
  const location = typeof photo.location === 'string' ? photo.location.trim() : '';
  const og = {
    src: ogImageSrc(photo.src),
    width: 1200,
    height: 630,
    alt: photo.alt,
  };

  const jsonLd = graph(
    websiteNode(),
    personNode(),
    pageNode('ItemPage', { path: photo.href, title: photo.title, description }),
    imageObject(photo, {
      url: photo.href,
      license: true,
      contentLocation: location,
      exifData: exifDataFor(photo),
    }),
  );

  return (
    <>
      <Seo
        title={photo.title}
        description={description}
        path={photo.href}
        image={og}
        ogType="article"
        keywords={[photo.title, location].filter(Boolean)}
        jsonLd={jsonLd}
      />
      <article className={`${styles.photoPage} ${styles.photoLayout}`}>
        {/* Left third: title, gear, map, buy, prev/next. Right two-thirds: the
            photo at full column width; click opens the lightbox. */}
        <div className={styles.photoAside}>
          <PhotoMap coords={photo.coords} location={location} title={photo.title} stacked>
            <h1 className={styles.photoTitle}>{photo.title}</h1>
            {(equipment || specs) && (
              <div className={styles.photoMeta}>
                {equipment && <p className={`${styles.meta} ${gearLineClass}`}><GearLine text={equipment} /></p>}
                {specs && <p className={styles.meta}>{specs}</p>}
                {mentionsGear(equipment) ? <AffiliateDisclosure /> : null}
              </div>
            )}
            {!photo.coords && location ? <p className={styles.location}>{location}</p> : null}
          </PhotoMap>

          <BuyButton photoNumber={photoNumber} tiers={tiers} licence={LICENCE_SUMMARY} />

          <nav className={styles.photoNav} aria-label="Adjacent photographs">
            <Link href={withCategory(adjacent.prev.href)} rel="prev" className={styles.photoNavLink}>
              <span className={styles.photoNavDir}>Previous</span>
              <span>{adjacent.prev.title}</span>
            </Link>
            <Link href={withCategory(adjacent.next.href)} rel="next" className={`${styles.photoNavLink} ${styles.photoNavNext}`}>
              <span className={styles.photoNavDir}>Next</span>
              <span>{adjacent.next.title}</span>
            </Link>
          </nav>

          <p className={styles.back}>
            <Link href="/gallery">Back to gallery</Link>
          </p>
        </div>

        <div className={styles.photoStage}>
          <div className={styles.photoColumn}>
          <div className={styles.photoFrame} style={{ backgroundColor: photo.color }}>
            <button
              type="button"
              className={styles.photoOpen}
              onClick={() => setLbOpen(true)}
              aria-expanded={lbOpen}
              aria-controls={lightboxId}
              title="View full screen"
            >
              <picture style={{ display: 'block', width: '100%' }}>
                {photo.fullAvif ? (
                  <source
                    type="image/avif"
                    srcSet={`${photo.fullAvif} ${photo.width}w`}
                    sizes="(max-width: 900px) 100vw, 66vw"
                  />
                ) : null}
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 900px) 100vw, 66vw"
                  priority
                  unoptimized
                  className={styles.photoImg}
                />
              </picture>
              <span className="sr-only">View full screen</span>
            </button>
            <PhotoCardActions
              title={photo.title}
              shareUrl={photo.href}
              pinUrl={photo.href}
              mediaUrl={og.src}
              photo={photo}
            />
          </div>
          <Swatches
            shape={{ palette: palettes[String(photoNumber)] }}
            compact
            phoneOnly
          />
          </div>
        </div>
      </article>

      <Lightbox
        id={lightboxId}
        isOpen={lbOpen}
        photo={photo}
        onClose={() => setLbOpen(false)}
        onPrev={() => router.push(withCategory(adjacent.prev.href))}
        onNext={() => router.push(withCategory(adjacent.next.href))}
      />
    </>
  );
}

export async function getStaticPaths() {
  const photos = await getPhotos();
  return {
    paths: photos.map((p) => ({ params: { slug: p.href.replace(/^\/photo\//, '') } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  // Catalog order (featured set, then the portfolio). A ?category= filter keeps
  // that relative order inside the category. The gallery grid may show a
  // different, spread order.
  const photos = await getGalleryPhotos();
  const index = photos.findIndex((p) => p.href === `/photo/${params.slug}`);
  if (index < 0) return { notFound: true };

  const photo = photos[index];
  const { prev, next } = neighbourPair(photos, index);
  const sequences = {};
  for (const cat of CATEGORIES) {
    if (!inCategory(photo, cat.slug)) continue;
    const subset = photos.filter((item) => inCategory(item, cat.slug));
    const subIndex = subset.findIndex((item) => item.href === photo.href);
    if (subIndex < 0) continue;
    sequences[cat.slug] = neighbourPair(subset, subIndex);
  }

  const photoNumber = photoNumberFromSrc(photo.src);
  // Only tiers whose file exists on the server are offered (see lib/store.js).
  const tiers = availableTiers(photoNumber);

  return { props: { photo, prev, next, tiers, photoNumber, sequences } };
}

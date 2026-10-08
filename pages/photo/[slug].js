import Image from 'next/image';
import Link from 'next/link';
import Seo from '@/components/Seo';
import ShareButton from '@/components/ShareButton';
import PhotoMap from '@/components/PhotoMap';
import BuyButton from '@/components/BuyButton';
import { availableTiers, LICENCE_SUMMARY } from '@/lib/store';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { getPhotos, getGalleryPhotos } from '@/lib/photo-data';
import { captionFor, exifDataFor } from '@/lib/photoCaption';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import { ogImageSrc } from '@/lib/slug';
import styles from '@/styles/Page.module.css';

export default function PhotoPage({ photo, prev, next, tiers, photoNumber }) {
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
      <article className={styles.photoPage}>
        <div className={styles.photoFrame} style={{ backgroundColor: photo.color }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 1024px) 100vw, 1200px"
            priority
            unoptimized
            className={styles.photoImg}
          />
        </div>

        {/* Title + gear on the left; square map card on the right, vertically
            centred against them. The card carries the place name, so there is
            no separate location line. Expanded, the map spans the full width. */}
        <PhotoMap coords={photo.coords} location={location} title={photo.title}>
          <h1 className={styles.photoTitle}>{photo.title}</h1>
          {(equipment || specs) && (
            <div className={styles.photoMeta}>
              {equipment && <p className={styles.meta}>{equipment}</p>}
              {specs && <p className={styles.meta}>{specs}</p>}
            </div>
          )}
          {!photo.coords && location ? <p className={styles.location}>{location}</p> : null}
        </PhotoMap>

        <BuyButton photoNumber={photoNumber} tiers={tiers} licence={LICENCE_SUMMARY} />

        <nav className={styles.photoNav} aria-label="Adjacent photographs">
          <Link href={prev.href} rel="prev" className={styles.photoNavLink}>
            <span className={styles.photoNavDir}>Previous</span>
            <span>{prev.title}</span>
          </Link>
          <Link href={next.href} rel="next" className={`${styles.photoNavLink} ${styles.photoNavNext}`}>
            <span className={styles.photoNavDir}>Next</span>
            <span>{next.title}</span>
          </Link>
        </nav>

        <p className={styles.back}>
          <Link href="/gallery">Back to gallery</Link>
        </p>

        <ShareButton
          title={photo.title}
          url={photo.href}
          label="Share"
          className={styles.share}
          toastClassName={styles.toast}
        />
      </article>
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
  // Gallery order, so prev/next walk the same sequence the visitor just saw.
  const photos = await getGalleryPhotos();
  const index = photos.findIndex((p) => p.href === `/photo/${params.slug}`);
  if (index < 0) return { notFound: true };

  const photo = photos[index];
  const prev = photos[(index - 1 + photos.length) % photos.length];
  const next = photos[(index + 1) % photos.length];
  const neighbour = ({ title, href }) => ({ title, href });

  const photoNumber = photoNumberFromSrc(photo.src);
  // Only tiers whose file exists on the server are offered (see lib/store.js).
  const tiers = availableTiers(photoNumber);

  return { props: { photo, prev: neighbour(prev), next: neighbour(next), tiers, photoNumber } };
}

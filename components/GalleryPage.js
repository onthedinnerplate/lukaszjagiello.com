import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import JourneysHero from '@/components/JourneysHero';
import CategoryNav from '@/components/CategoryNav';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import { galleryPathFor } from '@/lib/categories';
import { site } from '@/lib/site';
import styles from '@/styles/Page.module.css';

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

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={isAll ? ['photo gallery', 'landscape prints', 'wildlife photos'] : [`${category.label.toLowerCase()} photography`, `${category.label.toLowerCase()} prints`]}
        jsonLd={jsonLd}
      />
      {/* Page title stays the only h1. The hero has no filter bar; the
          Journeys-style category row sits directly under this heading. */}
      <JourneysHero headingAs="p" />
      <section className={styles.galleryPage} aria-labelledby="gallery-heading">
        <header className={styles.pageHeader}>
          <h1 id="gallery-heading" className={styles.galleryHeading}>{isAll ? 'Gallery' : category.label}</h1>
          <div className={styles.gallerySubnav}>
            <CategoryNav
              active={isAll ? 'all' : category.slug}
              counts={counts}
              hrefFor={galleryPathFor}
              label="Gallery categories"
            />
          </div>
          {isAll ? null : (
            <p className={styles.lede}>
              {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'}
              {` — ${category.description.toLowerCase()}.`}
            </p>
          )}
        </header>
        <MasonryGallery photos={photos} wide headingId="gallery-heading" />
      </section>
    </>
  );
}

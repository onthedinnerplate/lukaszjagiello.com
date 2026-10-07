import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import { getPhotos } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import { features } from '@/lib/site';
import styles from '@/styles/Page.module.css';

const meta = {
  path: '/gallery',
  title: 'Gallery',
  description:
    'Full portfolio of landscape, coastal and wildlife photographs by Łukasz Jagiełło: San Francisco, Alcatraz, Jamaica, Monterey Bay, Ruby Beach and wildlife.',
};

export default function Gallery({ photos }) {
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
        keywords={['photo gallery', 'landscape prints', 'wildlife photos', 'Monterey Bay photography', 'Ruby Beach']}
        jsonLd={jsonLd}
      />
      <section className={styles.galleryPage} aria-labelledby="gallery-heading">
        <header className={styles.pageHeader}>
          <h1 id="gallery-heading">Gallery</h1>
          <p className={styles.lede}>{photos.length} photographs across six collections.</p>
        </header>
        <MasonryGallery photos={photos} filterable={features.galleryFilters} wide eagerCount={3} headingId="gallery-heading" />
      </section>
    </>
  );
}

export async function getStaticProps() {
  return { props: { photos: await getPhotos() } };
}

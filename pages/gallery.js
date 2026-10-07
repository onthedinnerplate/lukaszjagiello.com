import Seo from '@/components/Seo';
import MasonryGallery from '@/components/MasonryGallery';
import { getPhotos } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode, imageObject } from '@/lib/seo';
import styles from '@/styles/Page.module.css';

const meta = {
  path: '/gallery',
  title: 'Gallery',
  description:
    'Full portfolio of landscape, coastal and wildlife photographs by Łukasz Jagiełło.',
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
        keywords={['photo gallery', 'landscape prints', 'wildlife photos']}
        jsonLd={jsonLd}
      />
      <section className={styles.galleryPage} aria-labelledby="gallery-heading">
        <header className={styles.pageHeader}>
          <h1 id="gallery-heading">Gallery</h1>
          <p className={styles.lede}>{photos.length} photographs.</p>
        </header>
        <MasonryGallery photos={photos} wide eagerCount={3} headingId="gallery-heading" />
      </section>
    </>
  );
}

export async function getStaticProps() {
  return { props: { photos: await getPhotos() } };
}

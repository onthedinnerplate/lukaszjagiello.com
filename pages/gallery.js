import GalleryPage from '@/components/GalleryPage';
import { getGalleryPhotos, categoryCounts } from '@/lib/photo-data';

export default function Gallery(props) {
  return <GalleryPage {...props} />;
}

export async function getStaticProps() {
  const photos = await getGalleryPhotos();
  return { props: { photos, category: null, counts: categoryCounts(photos) } };
}

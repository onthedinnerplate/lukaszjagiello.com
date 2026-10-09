import GalleryPage from '@/components/GalleryPage';
import { getGalleryPhotos, categoryCounts, withDownloadTiers } from '@/lib/photo-data';

export default function Gallery(props) {
  return <GalleryPage {...props} />;
}

export async function getStaticProps() {
  const photos = withDownloadTiers(await getGalleryPhotos());
  return { props: { photos, category: null, counts: categoryCounts(photos) } };
}

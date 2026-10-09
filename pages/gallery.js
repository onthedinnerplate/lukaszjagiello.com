import GalleryPage from '@/components/GalleryPage';
import { getPhotos, getGalleryPhotos, categoryCounts } from '@/lib/photo-data';
import { journeysHeroSrc } from '@/lib/journeysHero';

export default function Gallery(props) {
  return <GalleryPage {...props} />;
}

export async function getStaticProps() {
  const [photos, all] = await Promise.all([getGalleryPhotos(), getPhotos()]);
  return { props: { photos, category: null, counts: categoryCounts(photos), heroSrc: journeysHeroSrc(all) } };
}

import GalleryPage from '@/components/GalleryPage';
import { getGalleryPhotos, categoryCounts, heroNavCounts, withDownloadTiers } from '@/lib/photo-data';
import { GALLERY_NO_CATEGORIES_PATH } from '@/lib/previewRoutes';

// Same Gallery page. The header category row is removed, and the nav is
// solid white with Photography and its separator in black.
// noindex, not in the menu, not in the sitemap.
export default function GalleryNoCategories(props) {
  return <GalleryPage {...props} noindexPath={GALLERY_NO_CATEGORIES_PATH} />;
}

export async function getStaticProps() {
  const photos = withDownloadTiers(await getGalleryPhotos());
  return { props: { photos, category: null, counts: categoryCounts(photos), navCounts: heroNavCounts(photos) } };
}

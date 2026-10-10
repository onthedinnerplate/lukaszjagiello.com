import Home from '@/pages/index';
import { selectedPhotos } from '@/components/SelectedPhotographs';
import { getPhotos, heroNavCounts } from '@/lib/photo-data';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { HOME_ON_WHITE_PATH } from '@/lib/previewRoutes';
import { site } from '@/lib/site';

// Same homepage as /. The hero image is unchanged. The nav is solid white
// with Photography and its separator in black, including over the hero.
// Below the hero the page is white. noindex, not in the menu, not in the sitemap.
export default function HomeOnWhite(props) {
  return <Home {...props} noindexPath={HOME_ON_WHITE_PATH} />;
}

export async function getStaticProps() {
  const all = await getPhotos();
  const byNumber = new Map(all.map((p) => [photoNumberFromSrc(p.src), p]));
  const curated = (site.homeFeatured || []).map((n) => byNumber.get(n)).filter(Boolean);
  const photos = curated.length ? curated : all.slice(0, site.homeFeaturedCount);
  return { props: { photos, selected: selectedPhotos(all), navCounts: heroNavCounts(all) } };
}

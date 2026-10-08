import GalleryPage from '@/components/GalleryPage';
import { getGalleryPhotos, categoryCounts } from '@/lib/photo-data';
import { CATEGORIES, categoryBySlug, inCategory } from '@/lib/categories';

export default function GalleryCategory(props) {
  return <GalleryPage {...props} />;
}

export async function getStaticPaths() {
  return { paths: CATEGORIES.map((c) => ({ params: { category: c.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const category = categoryBySlug(params.category);
  if (!category) return { notFound: true };
  const all = await getGalleryPhotos();
  const photos = all.filter((p) => inCategory(p, category.slug));
  return { props: { photos, category, counts: categoryCounts(all) } };
}

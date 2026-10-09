import CategoryNav from '@/components/CategoryNav';
import { JOURNEY_MENU_LABEL, journeysThenGalleryPath } from '@/lib/categories';

/**
 * The one category row: Journey, Landscape, Animal, Architecture, People,
 * each with its count and the muted vertical rule.
 *
 * Links open the Journeys page and the gallery category pages. A page that
 * filters its own list (the Journeys index) passes `hrefFor` for that list.
 */
export default function SiteCategoryNav({
  counts,
  active = '',
  label = 'Categories',
  hrefFor = journeysThenGalleryPath,
}) {
  return (
    <CategoryNav
      active={active}
      counts={counts}
      hrefFor={hrefFor}
      allLabel={JOURNEY_MENU_LABEL}
      includeAll
      disableEmpty
      label={label}
    />
  );
}

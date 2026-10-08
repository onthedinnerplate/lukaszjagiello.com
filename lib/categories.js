// Gallery categories. Each photo in lib/photos.js carries a `categories` array of slugs
// (a photo may belong to several).
// Order here is the order of the filter row. `all` is virtual (every photo).
export const CATEGORIES = [
  { slug: 'landscape', label: 'Landscape', description: 'Coastlines, waterfalls, forests, canyons and mountains' },
  { slug: 'animals', label: 'Animals', description: 'Wildlife and animal portraits' },
  { slug: 'architecture', label: 'Architecture', description: 'Bridges, lighthouses, streetcars and city scenes' },
  { slug: 'people', label: 'People', description: 'Performers and portraits' },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug) || null;

export const galleryPathFor = (slug) => (slug && slug !== 'all' ? `/gallery/${slug}` : '/gallery');

/** True when the photo belongs to the category slug. */
export const inCategory = (photo, slug) => Array.isArray(photo.categories) && photo.categories.includes(slug);

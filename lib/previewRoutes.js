// Unlinked review routes. noindex, omitted from the sitemap, not in site.nav.
export const HERO_PARALLAX_PATH = '/preview/hero-parallax';
export const HERO_COMPARE_PATH = '/preview/hero-compare';
export const LAUNCH_FIXES_PATH = '/preview/launch-fixes';
export const HOME_NO_CATEGORIES_PATH = '/preview/home-no-categories';
export const GALLERY_NO_CATEGORIES_PATH = '/preview/gallery-no-categories';
export const HOME_ON_WHITE_PATH = '/preview/home-on-white';
export const PREVIEW_PATHS = [
  HERO_PARALLAX_PATH,
  HERO_COMPARE_PATH,
  LAUNCH_FIXES_PATH,
  HOME_NO_CATEGORIES_PATH,
  GALLERY_NO_CATEGORIES_PATH,
  HOME_ON_WHITE_PATH,
];

/** Live path these preview routes are standing in for. Every other path is unchanged. */
export function previewChromePath(path) {
  if (path === HOME_NO_CATEGORIES_PATH || path === HOME_ON_WHITE_PATH) return '/';
  if (path === GALLERY_NO_CATEGORIES_PATH) return '/gallery';
  return path;
}

/** Live homepage, and its white-page preview: white below the hero. The hero image is unchanged. */
export function lightBelowHero(path) {
  return path === '/' || path === HOME_ON_WHITE_PATH;
}

/** Preview page mocks: solid white nav, black Photography and separator, including over the hero. */
export function usesBlackNav(path) {
  return (
    path === HOME_NO_CATEGORIES_PATH
    || path === GALLERY_NO_CATEGORIES_PATH
    || path === HOME_ON_WHITE_PATH
  );
}

/** Category row is omitted only on the no-categories preview routes. */
export function hidesCategoryBar(path) {
  return path === HOME_NO_CATEGORIES_PATH || path === GALLERY_NO_CATEGORIES_PATH;
}

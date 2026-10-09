import { hydrateArticles } from './articles';

/** Same photograph the Journeys landing uses for its hero. */
export function journeysHeroSrc(photos) {
  const hero = hydrateArticles(photos).find((article) => article.photoSlug === 'marymere-falls');
  if (!hero?.photo?.src) {
    throw new Error('Journeys hero requires the Marymere Falls essay photograph.');
  }
  return hero.photo.src;
}

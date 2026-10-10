import Seo from '@/components/Seo';
import ParallaxJourneysHero from '@/components/ParallaxJourneysHero';
import MasonryGallery from '@/components/MasonryGallery';
import SelectedPhotographs, { selectedPhotos } from '@/components/SelectedPhotographs';
import { getPhotos, heroNavCounts } from '@/lib/photo-data';
import { HERO_PARALLAX_PATH } from '@/lib/previewRoutes';
import palettes from '@/lib/photoPalettes.json';
import { photoNumberFromSrc } from '@/lib/photoCaption';
import { site } from '@/lib/site';
import galleryStyles from '@/styles/Gallery.module.css';
import styles from '@/styles/Home.module.css';

// Same page as pages/index.js. Only the hero is the parallax wrapper.
export default function HeroParallaxPreview({ photos, selected, navCounts }) {
  return (
    <>
      <Seo
        title="Hero parallax preview"
        description="Scroll-driven preview of the homepage hero."
        path={HERO_PARALLAX_PATH}
        robots="noindex"
      />

      <ParallaxJourneysHero
        bleed
        headingAs="p"
        nav={{
          active: 'home',
          counts: navCounts,
          label: 'Home categories',
        }}
      />

      <h1 className={styles.phoneTitle}>Selected photographs</h1>
      <section className={`${styles.section} ${styles.sectionFirst} ${styles.phoneHide}`} aria-labelledby="selected-photos">
        <h1 id="selected-photos" className={galleryStyles.sectionLabel}>
          Selected photographs
        </h1>
        <SelectedPhotographs photos={selected} />
      </section>

      <section className={styles.section} aria-labelledby="featured-heading">
        <h2 id="featured-heading" className={galleryStyles.sectionLabel}>
          Featured collection
        </h2>
        <div className={styles.sectionHead}>
          <p>A selection of curated photography from diverse locations and subjects.</p>
        </div>
        <MasonryGallery
          photos={photos}
          headingId="featured-heading"
          layout="uniform"
          grayscale={false}
          equalCards
          palettes={palettes}
          swatchesMode="phone"
        />
      </section>
    </>
  );
}

export async function getStaticProps() {
  const all = await getPhotos();
  const byNumber = new Map(all.map((p) => [photoNumberFromSrc(p.src), p]));
  const curated = (site.homeFeatured || []).map((n) => byNumber.get(n)).filter(Boolean);
  const photos = curated.length ? curated : all.slice(0, site.homeFeaturedCount);
  return { props: { photos, selected: selectedPhotos(all), navCounts: heroNavCounts(all) } };
}

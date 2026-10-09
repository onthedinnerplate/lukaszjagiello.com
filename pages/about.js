import Link from 'next/link';
import Seo from '@/components/Seo';
import JourneysHero from '@/components/JourneysHero';
import { getPhotos, heroNavCounts } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import { gearFromMetadata, mentionsGear } from '@/lib/photoCaption';
import { AffiliateDisclosure, GearLine } from '@/components/GearStoreLinks';
import styles from '@/styles/Page.module.css';

const gear = gearFromMetadata();
const mainCamera = gear.cameras[0]?.name || site.gear.camera;
const lensList = gear.lenses.map((l) => l.name);

const meta = {
  path: '/about',
  title: 'About',
  description: `About ${site.photographer}, a landscape and wildlife photographer shooting on the ${mainCamera} with the ${lensList.slice(0, 2).join(' and ') || site.gear.lens}.`,
};

export default function About({ navCounts }) {
  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['about the photographer', ...gear.cameras.map((c) => c.name), ...lensList]}
        jsonLd={graph(websiteNode(), { ...pageNode('ProfilePage', meta), mainEntity: { '@id': personNode()['@id'] } }, personNode())}
      />
      {/* Slogan stays a paragraph: "About" remains the only h1. */}
      <JourneysHero
        headingAs="p"
        nav={{
          active: 'about',
          counts: navCounts,
          label: 'About categories',
        }}
      />
      <article className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>About</h1>
          <p className={styles.lede}>Chasing light along the Pacific coast and beyond.</p>
        </header>

        <section aria-labelledby="intro-heading" className={styles.block}>
          <h2 id="intro-heading">Based in Phoenix, Arizona</h2>
          <p>
            I&rsquo;m a landscape photographer drawn to the raw beauty of natural spaces. My work captures the dramatic
            light, texture, and emotion found in wild places—from desert expanses to coastal cliffs to mountain peaks.
          </p>
        </section>

        <section aria-labelledby="travel-heading" className={styles.block}>
          <h2 id="travel-heading">Where I&rsquo;ve Traveled</h2>
          <p>
            My photography takes me across North America and beyond. I&rsquo;ve documented the landscapes of:
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 300, fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: '0.5rem' }}>Arizona</h3>
            <p style={{ marginBottom: '1.5rem' }}>Williams • Prescott • Flagstaff • Page</p>

            <h3 style={{ fontSize: '1rem', fontWeight: 300, fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: '0.5rem' }}>California</h3>
            <p style={{ marginBottom: '1.5rem' }}>Monterey Bay • San Francisco • Fort Bragg • Redwood National Park</p>

            <h3 style={{ fontSize: '1rem', fontWeight: 300, fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: '0.5rem' }}>Other Destinations</h3>
            <p>
              Zion National Park • Bryce Canyon • Olympic National Park (Washington) • Seattle • Port Angeles (Washington) •
              San Antonio (Texas) • Playa del Carmen (Mexico) • Puerto Los Cabos (Mexico) • Jamaica • Dominican Republic
            </p>
          </div>
        </section>

        <section aria-labelledby="work-heading" className={styles.block}>
          <h2 id="work-heading">The Work</h2>
          <p>
            Each photograph is about capturing a moment—the interplay of light, shadow, and landscape that makes a place
            unforgettable. Whether it&rsquo;s the rugged Oregon coast, the Colorado plateaus, or the hidden corners of the
            desert, I&rsquo;m always looking for the story in the terrain.
          </p>
          <p>
            I shoot on location, working with natural light to reveal the authentic character of each landscape. No filters,
            no shortcuts—just the honest beauty of the earth.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            Prints, licensing and commissions are available — <Link href="/contact">get in touch</Link>.
          </p>
        </section>

        <section aria-labelledby="gear-heading" className={styles.block}>
          <h2 id="gear-heading">Camera gear</h2>
          <p className={styles.formNote}>Every body and lens below comes straight from the EXIF data of the photographs in the gallery.</p>
          <dl className={styles.gear} style={{ marginTop: '1rem' }}>
            <div>
              <dt>{gear.cameras.length === 1 ? 'Camera' : 'Cameras'}</dt>
              {gear.cameras.map((c) => (
                <dd key={c.name}>
                  <GearLine text={c.name} /> <span className={styles.gearCount}>{c.count} {c.count === 1 ? 'photo' : 'photos'}</span>
                </dd>
              ))}
            </div>
            <div>
              <dt>{gear.lenses.length === 1 ? 'Lens' : 'Lenses'}</dt>
              {gear.lenses.map((l) => (
                <dd key={l.name}>
                  <GearLine text={l.name} /> <span className={styles.gearCount}>{l.count} {l.count === 1 ? 'photo' : 'photos'}</span>
                </dd>
              ))}
            </div>
          </dl>
          {(gear.cameras.some((c) => mentionsGear(c.name)) || gear.lenses.some((l) => mentionsGear(l.name))) && (
            <AffiliateDisclosure />
          )}
        </section>
      </article>
    </>
  );
}

export async function getStaticProps() {
  const photos = await getPhotos();
  return { props: { navCounts: heroNavCounts(photos) } };
}

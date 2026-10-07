import Link from 'next/link';
import Seo from '@/components/Seo';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import styles from '@/styles/Page.module.css';

const meta = {
  path: '/about',
  title: 'About',
  description: `About ${site.photographer}, a landscape and wildlife photographer shooting on the ${site.gear.camera} with the ${site.gear.lens}.`,
};

export default function About() {
  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['about the photographer', 'Sony A7R III', 'Sony 16-35mm GM II']}
        jsonLd={graph(websiteNode(), { ...pageNode('ProfilePage', meta), mainEntity: { '@id': personNode()['@id'] } }, personNode())}
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Arizona</h3>
            <p style={{ marginBottom: '1.5rem' }}>Williams • Prescott • Flagstaff • Page</p>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>California</h3>
            <p style={{ marginBottom: '1.5rem' }}>Monterey Bay • San Francisco • Fort Bragg • Redwood National Park</p>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Other Destinations</h3>
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
          <dl className={styles.gear}>
            <div>
              <dt>Camera</dt>
              <dd>{site.gear.camera}</dd>
            </div>
            <div>
              <dt>Lens</dt>
              <dd>{site.gear.lens}</dd>
            </div>
          </dl>
        </section>
      </article>
    </>
  );
}

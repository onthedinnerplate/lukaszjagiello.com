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

        <section aria-labelledby="bio-heading" className={styles.block}>
          <h2 id="bio-heading">Bio</h2>
          <p>
            I&rsquo;m {site.photographer}, a landscape and wildlife photographer based in Phoenix, Arizona. My
            work moves between fog-wrapped city landmarks, the rugged sea stacks of the Olympic Peninsula, the kelp
            forests of Monterey Bay and the warm water of Jamaica&rsquo;s coast.
          </p>
          <p>
            I&rsquo;m drawn to quiet moments: the minute before sunrise, a harbor seal surfacing, fog rolling through the
            Golden Gate. Every image here is about patience, place, and paying attention.
          </p>
          <p>
            Prints, licensing and commissions are available — <Link href="/contact">get in touch</Link>.
          </p>
        </section>

        <section aria-labelledby="locations-heading" className={styles.block}>
          <h2 id="locations-heading">Where I&rsquo;ve been</h2>
          <ul style={{ columns: '2', columnGap: '2rem', lineHeight: '1.8' }}>
            <li>Dominican Republic</li>
            <li>Jamaica</li>
            <li>Playa del Carmen, Mexico</li>
            <li>Puerto Los Cabos, Mexico</li>
            <li>San Antonio, Texas</li>
            <li>Williams, Arizona</li>
            <li>Prescott, Arizona</li>
            <li>Flagstaff, Arizona</li>
            <li>Page, Arizona</li>
            <li>Zion National Park</li>
            <li>Bryce Canyon</li>
            <li>Monterey Bay, California</li>
            <li>San Francisco, California</li>
            <li>Fort Bragg, California</li>
            <li>Redwood National Park, California</li>
            <li>Olympic National Park, Washington</li>
            <li>Seattle, Washington</li>
            <li>Port Angeles, Washington</li>
          </ul>
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

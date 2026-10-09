import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { site } from '@/lib/site';
import styles from '@/styles/Page.module.css';

const UPDATED = 'October 8, 2026';

export default function Privacy() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy Policy"
      description={`How ${site.name} handles the small amount of personal information it collects when you browse the site or buy a download.`}
      updated={UPDATED}
      lede="Short version: there are no accounts, no advertising trackers, and card details never touch this site. Stripe handles payment."
    >
      <section className={styles.block}>
        <h2>Who we are</h2>
        <p>
          This website, {site.name} (lukaszjagiello.com), is operated by {site.photographer}, a photographer based in Phoenix, Arizona, USA.
          For anything in this policy, email <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>

      <section className={styles.block}>
        <h2>What we collect, and why</h2>
        <h3>Browsing</h3>
        <p>
          You can browse the whole site without creating an account or giving us any personal information. Our hosting provider
          (Render) keeps standard server logs — IP address, browser type, pages requested, time of request — for security and to keep
          the site running. We do not use advertising cookies, analytics trackers or social-media pixels.
        </p>
        <h3>Buying a digital download</h3>
        <p>
          Payment is handled entirely by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>, on Stripe&rsquo;s
          own checkout page. Your card number and billing details go directly to Stripe and are never sent to or stored on this site.
          What we receive back from Stripe is an order record: which photograph and size you bought, the amount paid, the email address
          you entered at checkout, and a Stripe transaction ID. We keep that record so we can deliver your file, handle refunds, and
          meet our bookkeeping and tax obligations. Stripe&rsquo;s own handling of your data is described in the{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>.
        </p>
        <h3>Contacting us</h3>
        <p>
          If you email us or use the contact form, we keep your message and address so we can reply. We do not add you to any mailing
          list unless you ask.
        </p>
        <h3>Maps</h3>
        <p>
          Photo pages have a &ldquo;View on map&rdquo; button. Nothing is loaded from Google until you click it; when you do, Google
          Maps loads in your browser and Google&rsquo;s own{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a> applies to that embed.
        </p>
      </section>

      <section className={styles.block}>
        <h2>Cookies</h2>
        <p>
          This site sets no cookies of its own. Stripe sets cookies on its checkout page for fraud prevention; those are governed by
          Stripe&rsquo;s policy, not ours.
        </p>
      </section>

      <section className={styles.block}>
        <h2>Who we share data with</h2>
        <p>We do not sell or rent personal information. The only third parties that handle it are the services that run the site:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing and receipts.</li>
          <li><strong>Render</strong> — web hosting and server logs.</li>
          <li><strong>Google Maps</strong> — only if you open a map.</li>
        </ul>
        <p>We will disclose information if the law requires it, or to protect our rights or safety.</p>
      </section>

      <section className={styles.block}>
        <h2>How long we keep it</h2>
        <p>
          Order records are kept for as long as tax and accounting rules require (generally seven years). Download links expire seven
          days after purchase. Server logs are rotated by our host on a short cycle. Emails are kept until the conversation is finished
          and then deleted periodically.
        </p>
      </section>

      <section className={styles.block}>
        <h2>Your rights</h2>
        <p>
          Wherever you live, you can ask us what personal information we hold about you, ask us to correct it, or ask us to delete it
          (we may need to keep an order record for legal reasons, and we will tell you if so). Residents of California, the EU, the UK and
          other jurisdictions with privacy laws have additional statutory rights, including the right to complain to a supervisory
          authority. Email <a href={`mailto:${site.email}`}>{site.email}</a> and we will respond within 30 days.
        </p>
      </section>

      <section className={styles.block}>
        <h2>Children</h2>
        <p>This site is not directed at children under 13, and we do not knowingly collect information from them.</p>
      </section>

      <section className={styles.block}>
        <h2>Changes</h2>
        <p>
          If this policy changes, the new version is posted here with a new date at the top. Continued use of the site after that date
          means you accept the updated policy.
        </p>
        <p>
          See also our <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/licensing">Sales &amp; Licensing</Link> terms.
        </p>
      </section>
    </LegalPage>
  );
}

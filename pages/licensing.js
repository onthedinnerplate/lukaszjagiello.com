import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { categoryNavProps } from '@/lib/photo-data';
import { site } from '@/lib/site';
import { TIERS, formatPrice } from '@/lib/store';
import styles from '@/styles/Page.module.css';

const UPDATED = 'October 8, 2026';

export default function Licensing({ navCounts }) {
  return (
    <LegalPage
      navCounts={navCounts}
      path="/licensing"
      title="Sales & Licensing"
      description={`What you get when you buy a digital download from ${site.name}: a personal-use licence, not the copyright. Refunds, commercial licensing and prints.`}
      updated={UPDATED}
      lede="A download buys you a personal-use licence to one image. It does not make the image yours, and it does not allow commercial use, resale or advertising."
    >
      <section className={styles.block}>
        <h2>1. What you are buying</h2>
        <p>
          Each digital download is a JPEG file of one photograph at the size you choose:
        </p>
        <ul>
          {TIERS.map((t) => (
            <li key={t.id}>
              <strong>{t.label}</strong> — {t.longEdge ? `${t.longEdge}px on the long edge` : 'the original camera resolution'}, {formatPrice(t.priceCents)}
            </li>
          ))}
        </ul>
        <p>
          Files are delivered in sRGB with embedded copyright metadata. You are buying a <strong>licence to use the file</strong>, as
          set out below. Copyright in the photograph stays with {site.photographer} at all times.
        </p>
      </section>

      <section className={styles.block}>
        <h2>2. Personal-use licence — what you may do</h2>
        <p>
          On payment you receive a non-exclusive, non-transferable, perpetual licence to use the purchased file for{' '}
          <strong>personal, non-commercial purposes</strong>. That means you may:
        </p>
        <ul>
          <li>print it for your own home, office wall or as a personal gift, at any size the file supports;</li>
          <li>use it as a wallpaper or screensaver on your own devices;</li>
          <li>include it in a personal, non-commercial project such as a family photo book or a private slideshow;</li>
          <li>keep backup copies for your own use.</li>
        </ul>
      </section>

      <section className={styles.block}>
        <h2>3. What you may not do</h2>
        <p>Without a separate written commercial licence from us, you may <strong>not</strong>:</p>
        <ul>
          <li><strong>use the image in advertising or marketing</strong> of any kind — ads, brochures, websites, social-media posts for a business, product packaging, presentations to clients;</li>
          <li>sell, rent, sublicense or give the file to anyone else, in whole or in part;</li>
          <li>sell prints, merchandise, NFTs or any product that includes the image;</li>
          <li>post the file, or a print of it, online as your own work or without credit to {site.photographer};</li>
          <li>use the image on a commercial website, in a publication, in a film or video, or in editorial content;</li>
          <li>use the image to train, fine-tune or evaluate machine-learning or AI systems;</li>
          <li>crop, alter or composite the image in a way that misrepresents the work, or remove copyright metadata;</li>
          <li>claim authorship or copyright in the image.</li>
        </ul>
        <p>
          Breach of this section ends the licence immediately and may expose you to copyright claims under 17 U.S.C. §&nbsp;501 and
          equivalent laws elsewhere.
        </p>
      </section>

      <section className={styles.block}>
        <h2>4. Commercial and editorial licensing</h2>
        <p>
          Businesses, publishers, agencies and anyone who wants to use an image beyond personal use can license it directly. Email{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a> with the image title, the intended use, where it will appear, the size or
          print run, and the term, and we will quote. Larger files, RAW conversions and exclusivity are available on request.
        </p>
      </section>

      <section className={styles.block}>
        <h2>5. Delivery</h2>
        <p>
          After payment you are returned to a download page and Stripe emails you a receipt linking back to it. The link works for
          seven days from purchase. Download and keep the file; if the link has expired or a download fails, email us with your receipt
          and we will send a fresh link.
        </p>
      </section>

      <section className={styles.block}>
        <h2>6. Refunds</h2>
        <p>
          Because a digital file cannot be returned, <strong>sales are final once the file has been downloaded</strong>. We will refund
          in full if: the file is corrupt or does not match the size you paid for and we cannot supply a correct one; you were charged
          more than once for the same order; or you contact us before downloading and ask to cancel. Refunds go back to the original
          payment method via Stripe and usually appear within 5–10 business days. To request one, email{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a> with your Stripe receipt.
        </p>
      </section>

      <section className={styles.block}>
        <h2>7. Prints</h2>
        <p>
          Physical prints are coming soon. When available, each print will be made to order by a professional print partner and shipped
          to you; print orders will have their own delivery, return and damage terms, posted on this page before the first print is sold.
          Until then, print enquiries are welcome at <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>

      <section className={styles.block}>
        <h2>8. Taxes</h2>
        <p>
          Prices are in US dollars. Any sales tax or VAT that applies to your purchase is calculated and shown at checkout where
          required; otherwise you are responsible for any taxes due in your jurisdiction.
        </p>
      </section>

      <section className={styles.block}>
        <h2>9. General</h2>
        <p>
          These terms form part of our <Link href="/terms">Terms &amp; Conditions</Link>, which also cover governing law and
          limitation of liability. Our <Link href="/privacy">Privacy Policy</Link> explains what happens to the details you give at
          checkout. If any part of this licence is found unenforceable, the rest still applies.
        </p>
      </section>
    </LegalPage>
  );
}

export async function getStaticProps() {
  return { props: await categoryNavProps() };
}

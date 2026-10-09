import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { site } from '@/lib/site';
import styles from '@/styles/Page.module.css';

const UPDATED = 'October 8, 2026';

export default function Terms() {
  return (
    <LegalPage
      path="/terms"
      title="Terms & Conditions"
      description={`The terms that apply when you use ${site.name} or buy from it.`}
      updated={UPDATED}
      lede="By using this website or buying from it you agree to these terms. Purchases are also covered by the Sales & Licensing terms."
    >
      <section className={styles.block}>
        <h2>1. Who you are dealing with</h2>
        <p>
          This website is owned and operated by {site.photographer}, trading as {site.name}, Phoenix, Arizona, USA
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). Contact: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>

      <section className={styles.block}>
        <h2>2. Copyright in the photographs</h2>
        <p>
          Every photograph on this site is an original work created by {site.photographer} and is protected by United States and
          international copyright law. {site.photographer} is and remains the sole copyright owner of every image, including any image
          you purchase. <strong>Buying a download or a print does not transfer copyright</strong> or any ownership of the image to you;
          it gives you the limited licence described in the <Link href="/licensing">Sales &amp; Licensing</Link> terms.
        </p>
        <p>
          Unless you hold a licence from us, you may not copy, download, screenshot, scrape, reproduce, modify, distribute, publish,
          sell, or use any image from this site for any purpose, including training machine-learning or AI models. Viewing the
          site in a normal web browser is fine; everything else needs written permission.
        </p>
      </section>

      <section className={styles.block}>
        <h2>3. Using the website</h2>
        <p>You agree not to:</p>
        <ul>
          <li>attempt to bypass the purchase process or access download files you have not paid for;</li>
          <li>share, resell or publish a download link;</li>
          <li>interfere with the site&rsquo;s operation, security or availability;</li>
          <li>use automated tools to harvest images or content;</li>
          <li>remove or alter copyright notices, watermarks or embedded metadata.</li>
        </ul>
      </section>

      <section className={styles.block}>
        <h2>4. Purchases</h2>
        <p>
          Prices are in US dollars and are shown before you pay. Payment is taken by Stripe at the time of order. Your order is accepted
          when payment succeeds and Stripe sends you a receipt. Digital downloads are delivered immediately via a link that works for
          seven days; keep a copy of the file, since we cannot guarantee the link afterwards. Refunds are covered in the{' '}
          <Link href="/licensing">Sales &amp; Licensing</Link> terms.
        </p>
        <p>
          We may correct pricing errors, refuse or cancel an order (with a full refund) where we reasonably suspect fraud or misuse,
          and change prices and products at any time without affecting orders already paid for.
        </p>
      </section>

      <section className={styles.block}>
        <h2>5. Accuracy of information</h2>
        <p>
          Captions, locations, camera settings and other details are given in good faith but may contain errors. Colours on your
          screen may differ from the file or print you receive. Nothing on this site is professional advice.
        </p>
      </section>

      <section className={styles.block}>
        <h2>6. Third-party links and services</h2>
        <p>
          Links to other sites (Stripe, Google Maps, social networks) are provided for convenience. We are not responsible for their
          content or how they handle your data.
        </p>
      </section>

      <section className={styles.block}>
        <h2>7. Disclaimer and limitation of liability</h2>
        <p>
          The site and its content are provided &ldquo;as is&rdquo; without warranties of any kind, express or implied, including
          merchantability, fitness for a particular purpose and non-infringement. To the fullest extent permitted by law, our total
          liability to you for any claim arising from the site or a purchase is limited to the amount you paid us for the item in
          question, and we are not liable for indirect, incidental, special or consequential damages. Some jurisdictions do not allow
          these limitations, in which case they apply to the extent permitted.
        </p>
      </section>

      <section className={styles.block}>
        <h2>8. Indemnity</h2>
        <p>
          You agree to indemnify us against any claim, loss or expense (including reasonable legal fees) arising from your breach of
          these terms or your use of an image outside the licence you were granted.
        </p>
      </section>

      <section className={styles.block}>
        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of the State of Arizona, USA, without regard to conflict-of-law rules. Any dispute will
          be brought in the state or federal courts located in Maricopa County, Arizona, and you consent to their jurisdiction. Nothing
          here removes consumer rights that cannot be waived under the law of the country you live in.
        </p>
      </section>

      <section className={styles.block}>
        <h2>10. Changes to these terms</h2>
        <p>
          We may update these terms; the current version is always at this page with the date at the top. Orders are governed by the
          terms in force when the order was placed.
        </p>
        <p>
          See also our <Link href="/privacy">Privacy Policy</Link> and <Link href="/licensing">Sales &amp; Licensing</Link> terms.
        </p>
      </section>
    </LegalPage>
  );
}

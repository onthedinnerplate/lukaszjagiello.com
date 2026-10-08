import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Seo from '@/components/Seo';
import { LICENCE_SUMMARY } from '@/lib/store';
import styles from '@/styles/Page.module.css';

/** Stripe sends the buyer here after payment: /download?session_id=cs_… */
export default function Download() {
  const { query, isReady } = useRouter();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (!isReady) return;
    const id = String(query.session_id || '');
    if (!id) return setState({ loading: false, ok: false, reason: 'Missing order reference' });
    fetch(`/api/download?session_id=${encodeURIComponent(id)}&info=1`)
      .then(async (r) => ({ status: r.status, ...(await r.json()) }))
      .then((d) => setState({ loading: false, ...d }))
      .catch(() => setState({ loading: false, ok: false, reason: 'Could not verify the order' }));
  }, [isReady, query.session_id]);

  const href = `/api/download?session_id=${encodeURIComponent(String(query.session_id || ''))}`;

  return (
    <>
      <Seo title="Your download" description="Download your purchased photograph." path="/download" noindex />
      <article className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>{state.ok ? 'Thank you' : 'Your download'}</h1>
          {state.loading && <p className={styles.lede}>Checking your order…</p>}
          {!state.loading && state.ok && (
            <p className={styles.lede}>
              <strong>{state.title}</strong> — {state.tier}. Your receipt is on its way from Stripe.
            </p>
          )}
          {!state.loading && !state.ok && <p className={styles.lede}>{state.reason || 'Something went wrong.'}</p>}
        </header>

        {!state.loading && state.ok && (
          <section className={styles.block}>
            <a className="button solid" href={href} download>
              Download {state.tier} file
            </a>
            <p className={styles.formNote} style={{ marginTop: '1rem' }}>
              This link works for 7 days. Keep the Stripe receipt email — it has the same link.
            </p>
            <p className={styles.formNote}>{LICENCE_SUMMARY}</p>
            {state.slug && (
              <p style={{ marginTop: '1.5rem' }}>
                <Link href={`/photo/${state.slug}`}>Back to the photograph</Link> · <Link href="/gallery">Gallery</Link>
              </p>
            )}
          </section>
        )}

        {!state.loading && !state.ok && (
          <section className={styles.block}>
            <p>
              If you were charged and can't download, <Link href="/contact">get in touch</Link> with your Stripe receipt and
              we'll sort it out.
            </p>
          </section>
        )}
      </article>
    </>
  );
}

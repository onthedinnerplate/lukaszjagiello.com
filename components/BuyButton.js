import { useState } from 'react';
import styles from '@/styles/Page.module.css';

/**
 * Digital download purchase on a photo page. `tiers` is the server-computed
 * list of sizes that actually exist for this photo (see lib/store.js); the
 * price shown comes from the server too and is re-derived there on checkout.
 * Click → POST /api/checkout → redirect to Stripe's hosted Checkout.
 */
export default function BuyButton({ photoNumber, tiers = [], licence }) {
  const [tier, setTier] = useState(tiers[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!tiers.length) return null;
  const chosen = tiers.find((t) => t.id === tier) || tiers[0];

  const buy = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: photoNumber, tier: chosen.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
      window.location.assign(data.url);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <section className={styles.buy} aria-labelledby="buy-heading">
      <h2 id="buy-heading" className={styles.buyHeading}>Buy a digital download</h2>
      <div className={styles.buyTiers} role="radiogroup" aria-label="Download size">
        {tiers.map((t) => (
          <label key={t.id} className={`${styles.buyTier} ${t.id === chosen.id ? styles.buyTierActive : ''}`}>
            <input type="radio" name="tier" value={t.id} checked={t.id === chosen.id} onChange={() => setTier(t.id)} className={styles.srOnly} />
            <span className={styles.buyTierLabel}>{t.label}</span>
            <span className={styles.buyTierBlurb}>{t.blurb}{t.mb ? ` · ${t.mb} MB` : ''}</span>
            <span className={styles.buyTierPrice}>{t.price}</span>
          </label>
        ))}
      </div>
      <div className={styles.buyRow}>
        <button type="button" className="button solid" onClick={buy} disabled={busy}>
          {busy ? 'Opening checkout…' : `Buy ${chosen.label} — ${chosen.price}`}
        </button>
        <span className={styles.buyNote}>Secure payment by Stripe. File delivered instantly.</span>
      </div>
      {error && <p className={styles.buyError} role="alert">{error}</p>}
      <p className={styles.buyLicence}>{licence}</p>
    </section>
  );
}

# Digital download store

Stripe Checkout, no database. The Checkout Session *is* the order record.

## Flow

1. Photo page (`pages/photo/[slug].js`) renders `BuyButton` with the tiers whose
   files exist on the server (`availableTiers()` in `lib/store.js`). No files →
   no buy box. Prices come from `TIERS` in `lib/store.js`, never from the client.
2. `POST /api/checkout {photo, tier}` validates both, re-checks the file exists,
   creates a Stripe Checkout Session (`mode: payment`, metadata `{photo, tier}`),
   returns its URL. Browser redirects to Stripe's hosted page.
3. Stripe sends the buyer to `/download?session_id=cs_…`. That page calls
   `GET /api/download?session_id=…&info=1` (JSON) then offers the real link.
4. `GET /api/download?session_id=…` retrieves the session from Stripe, requires
   `payment_status === 'paid'` and age ≤ 7 days, decrypts
   `private/downloads/NN/<tier>.jpg.enc` with `DOWNLOAD_FILES_KEY`, and streams
   the JPEG as an attachment.

The buyer also gets Stripe's receipt email, which links back to the success URL,
so the download link survives a closed tab for 7 days. No webhook is needed for
this design. Add one later only if you want order emails / analytics.

## Tiers

| id   | label           | long edge | price |
|------|-----------------|-----------|-------|
| 1080 | 1080p           | 1920 px   | $5    |
| 2k   | 2K              | 2048 px   | $12   |
| full | Full resolution | original  | $25   |

## Files

```
private/downloads/NN/1080.jpg.enc   committed, AES-256-GCM
private/downloads/NN/2k.jpg.enc     committed, AES-256-GCM
private/downloads/NN/full.jpg.enc   committed, AES-256-GCM
```

Each `.enc` file is a 12-byte IV, a 16-byte GCM auth tag, then the ciphertext.
`private/` is outside `public/`, so Next never serves these directly. The
download API is the only reader, and it refuses with a generic 503 when
`DOWNLOAD_FILES_KEY` is unset. Plaintext `*.jpg` is gitignored.

Files that were committed before encryption are still reachable from git
history and old commit URLs until that history is rewritten. This repo does
not rewrite history.

### Generating them

Needs the original camera files (`lib/originals.json` maps NN → original
filename) and Node with the repo's dev dependencies installed:

```
npm install
npm run downloads -- --source="C:\Photography\porfolio\done"
```

The script refuses to write a tier the original can't fill (a 1600px source is
not sold as "2K") and lists anything it skipped. It writes plaintext `.jpg`
files locally. Encrypt them before committing (the key is the same value as
on Render; do not commit it):

```
npm run encrypt-downloads
```

Commit the `.jpg.enc` files and push. Render redeploys, and the buy box
appears on each photo that has files. Set `DOWNLOAD_FILES_KEY` on Render
before that deploy, or paid downloads return 503.

### Full-res

Committed alongside the other tiers, encrypted the same way. Total stays well
under GitHub's limits (100 MB per file, ~1 GB per repo). If the catalogue ever
grows past a few hundred photos, move the ciphertext to object storage
(Cloudflare R2 + a server-side decrypt, or a presigned URL); `availableTiers()`
is the only place that would need to learn about it.

## Environment (Render → Environment)

| var                                  | value                     |
|--------------------------------------|---------------------------|
| `STRIPE_SECRET_KEY`                  | `sk_live_…` (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` (unused for now; hosted Checkout needs only the secret key) |
| `NEXT_PUBLIC_SITE_URL`               | `https://lukaszjagiello.com` |
| `DOWNLOAD_FILES_KEY`                 | base64-encoded 32-byte key (server only). Decrypts `private/downloads`. Set this before deploying ciphertext, or every download returns 503. |

Never put a secret key in the repo, a chat, or a client bundle.

## Testing

- With live keys: buy the cheapest tier once, confirm the download, refund it in
  Stripe → Payments. Costs the Stripe fee (~$0.45).
- Better: create a Stripe **sandbox**, copy its `sk_test_…` into a Render
  *preview* environment, and pay with card `4242 4242 4242 4242`.

## Failure modes

| symptom                               | cause                                                       |
|---------------------------------------|-------------------------------------------------------------|
| No buy box on a photo                 | no `.jpg.enc` files in `private/downloads/NN/` on the server |
| 409 from `/api/checkout`              | tier file missing (same cause)                              |
| 503 "Downloads are temporarily unavailable" | `DOWNLOAD_FILES_KEY` missing, or the ciphertext failed to decrypt |
| 500 "STRIPE_SECRET_KEY is not set"    | env var missing on Render                                   |
| `/download` says "expired"           | session older than 7 days — refund or re-send manually      |
| `/download` says "not paid"           | buyer abandoned Checkout; nothing to do                     |

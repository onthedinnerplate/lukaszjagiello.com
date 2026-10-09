// Digital download store: tiers, pricing, licence, and where the files live.
//
// Deliverable files are NOT the public gallery images. They live outside
// public/ so Next never serves them directly. On disk they are AES-256-GCM
// ciphertext, decrypted only by the download API:
//   private/downloads/<NN>/1080.jpg.enc   1920px long edge   (committed)
//   private/downloads/<NN>/2k.jpg.enc     2048px long edge   (committed)
//   private/downloads/<NN>/full.jpg.enc   original size      (committed)
// Generate plaintext with `npm run downloads`, then `npm run encrypt-downloads`.
// A tier is offered for sale only when its .enc file exists on the server.
// `file` below is the JPEG name; the server appends `.enc`.
//
// This module is imported by browser code: keep it free of node: imports.
// File-system helpers live in lib/store-server.js.

export const TIERS = [
  { id: '1080', label: '1080p', longEdge: 1920, priceCents: 500, file: '1080.jpg', blurb: 'Web and social — 1920px' },
  { id: '2k', label: '2K', longEdge: 2048, priceCents: 1200, file: '2k.jpg', blurb: 'Screens and small prints — 2048px' },
  { id: 'full', label: 'Full resolution', longEdge: null, priceCents: 2500, file: 'full.jpg', blurb: 'Original camera resolution' },
];

export const CURRENCY = 'usd';

export const LICENCE_SUMMARY =
  'Personal-use licence: print it, frame it, use it as wallpaper. No resale, redistribution or commercial use.';

export const tierById = (id) => TIERS.find((t) => t.id === id) || null;

export const formatPrice = (cents) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

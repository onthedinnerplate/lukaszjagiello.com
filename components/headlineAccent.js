import { Allura } from 'next/font/google';
import styles from '@/styles/Journal.module.css';

// Allura 400 for every handwritten accent word: hero phrases, article
// headlines, and journey cards. One face so the size stays consistent.
// font-display: block plus preload so the script does not flash a fallback.
export const accentScriptFont = Allura({
  weight: '400',
  subsets: ['latin'],
  display: 'block',
  preload: true,
  style: 'normal',
  adjustFontFallback: true,
});

export const heroScriptFont = accentScriptFont;

/** Allura on article headlines and journey cards. Color comes from --accent-script. */
export const headlineAccentClassName = `${accentScriptFont.className} ${styles.headlineAccent}`;

/** Allura 400 on the Journeys hero phrases. Size and color come from .heroTitle .headlineAccent. */
export const heroAccentClassName = `${heroScriptFont.className} ${styles.headlineAccent}`;

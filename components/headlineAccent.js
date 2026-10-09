import { Allura, Caveat } from 'next/font/google';
import styles from '@/styles/Journal.module.css';

// Lightest Caveat face. One instance for every headline accent and the header word.
// font-display: block plus preload so the script does not flash a fallback.
export const accentScriptFont = Caveat({
  weight: '400',
  subsets: ['latin'],
  display: 'block',
  preload: true,
  style: 'normal',
  adjustFontFallback: true,
});

/** Hero title phrases only. Header "Photography" and article accents stay Caveat. */
export const heroScriptFont = Allura({
  weight: '400',
  subsets: ['latin'],
  display: 'block',
  preload: true,
  style: 'normal',
  adjustFontFallback: true,
});

/** Font family, weight, style, size, spacing, and hero white. */
export const headlineAccentClassName = `${accentScriptFont.className} ${styles.headlineAccent}`;

/** Allura 400 on the Journeys hero phrases. Size and color come from .heroTitle .headlineAccent. */
export const heroAccentClassName = `${heroScriptFont.className} ${styles.headlineAccent}`;

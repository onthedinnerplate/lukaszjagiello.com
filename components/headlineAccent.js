import styles from '@/styles/Journal.module.css';
import { accentScriptFont } from '@/lib/fonts';

// Allura 400 for every handwritten accent word: hero phrases, article
// headlines, and journey cards. The face lives in lib/fonts.js so the nav
// word "Photography" uses the same file. font-display: block plus preload
// so the script does not flash a fallback.
export { accentScriptFont };

export const heroScriptFont = accentScriptFont;

/** Allura on article headlines and journey cards. Color comes from --accent-script. */
export const headlineAccentClassName = `${accentScriptFont.className} ${styles.headlineAccent}`;

/** Allura 400 on the Journeys hero phrases. Size and color come from .heroTitle .headlineAccent. */
export const heroAccentClassName = `${heroScriptFont.className} ${styles.headlineAccent}`;

import { Caveat } from 'next/font/google';
import styles from '@/styles/Journal.module.css';

// Lightest Caveat face. One instance for every headline accent.
const caveat = Caveat({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  style: 'normal',
});

/** Font family, weight, style, size, spacing, and hero white. */
export const headlineAccentClassName = `${caveat.className} ${styles.headlineAccent}`;

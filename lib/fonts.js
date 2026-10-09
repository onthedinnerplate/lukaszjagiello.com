import { Poppins } from 'next/font/google';

// Article headlines declare Poppins 300 (.title in Journal.module.css, from 769px up).
// The hero kicker declares Poppins 500. The Google Fonts stylesheet is blocked by
// the CSP, so these faces are self-hosted and served from this origin. Because the
// @font-face family name is Poppins, those existing rules paint this file too.
// latin-ext covers Ł / ł. font-display: block plus preload avoids a fallback flash.
export const articleTitleFont = Poppins({
  weight: ['300', '500'],
  style: 'normal',
  subsets: ['latin', 'latin-ext'],
  display: 'block',
  preload: true,
  adjustFontFallback: true,
});

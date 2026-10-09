import { Caveat, Poppins } from 'next/font/google';

// Article headlines declare Poppins 300 (.title in Journal.module.css, from 769px up).
// The Google Fonts stylesheet those pages link is blocked by font-src 'self' and
// style-src, so this face is self-hosted by next/font and served from this origin.
// latin-ext covers Ł / ł in "Łukasz Jagiełło". font-display: block plus preload
// keeps the fallback face from painting.
export const articleTitleFont = Poppins({
  weight: '300',
  style: 'normal',
  subsets: ['latin', 'latin-ext'],
  display: 'block',
  preload: true,
  adjustFontFallback: true,
});

// Same handwritten face as article headline accents (HeadlinePhrase / Caveat 400).
// "Photography" is basic Latin, so the latin subset matches that accent loader.
export const accentScriptFont = Caveat({
  weight: '400',
  style: 'normal',
  subsets: ['latin'],
  display: 'block',
  preload: true,
  adjustFontFallback: true,
});

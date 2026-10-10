import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { site, isPlaceholderSocial } from '@/lib/site';
import { CATEGORIES, categoryMenuLabel, galleryPathFor } from '@/lib/categories';
import { photos } from '@/lib/photos';
import { articles } from '@/lib/articles';
import SiteCategoryNav from '@/components/SiteCategoryNav';
import SectionSpy from '@/components/SectionSpy';
import { accentScriptFont, articleTitleFont } from '@/lib/fonts';
import styles from '@/styles/Layout.module.css';
import BackToTop from './BackToTop';
import { HERO_PARALLAX_PATH, hidesCategoryBar, lightBelowHero, previewChromePath } from '@/lib/previewRoutes';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function menuCounts() {
  const counts = { all: articles.length };
  for (const { slug } of CATEGORIES) counts[slug] = 0;
  for (const photo of photos) {
    for (const slug of photo.categories || []) {
      if (Object.prototype.hasOwnProperty.call(counts, slug)) counts[slug] += 1;
    }
  }
  return counts;
}

const MENU_COUNTS = menuCounts();

function categoryActive(path) {
  if (path === '/journal' || path.startsWith('/journal/')) return 'all';
  const match = path.match(/^\/gallery\/([^/]+)/);
  return match ? match[1] : '';
}

function currentPath(asPath) {
  return (asPath || '/').split('?')[0].split('#')[0];
}

function isHomeChrome(path) {
  return previewChromePath(path) === '/' || path === HERO_PARALLAX_PATH;
}

function sectionCurrent(path, href) {
  const chrome = previewChromePath(path);
  if (href === '/') return isHomeChrome(path);
  return chrome === href || chrome.startsWith(`${href}/`);
}

function Nav() {
  const { asPath } = useRouter();
  const path = currentPath(asPath);
  const listRef = useRef(null);
  const [box, setBox] = useState(null);
  const [ready, setReady] = useState(false);
  const [instant, setInstant] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const headerRef = useRef(null);

  const measure = (el) => {
    const list = listRef.current;
    if (!list || !el || !list.contains(el)) {
      setBox(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    if (rect.width < 1) {
      setBox(null);
      return;
    }
    setBox({
      x: rect.left - listRect.left + list.scrollLeft,
      y: rect.bottom - listRect.top + list.scrollTop - 2,
      w: rect.width,
    });
  };

  const activeItem = () => listRef.current?.querySelector('[aria-current="page"]') || null;

  const rest = () => {
    const list = listRef.current;
    const focused = list?.contains(document.activeElement) ? document.activeElement : null;
    if (focused && focused.matches('a')) {
      measure(focused);
      return;
    }
    measure(activeItem());
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!lightBelowHero(path)) {
      setPastHero(false);
      return undefined;
    }
    const onScroll = () => {
      const hero = document.querySelector('section[aria-label="Marymere Falls"]');
      const header = headerRef.current;
      if (!hero || !header) {
        setPastHero(false);
        return;
      }
      setPastHero(hero.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom + 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [path]);

  useIsoLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const apply = () => {
      document.documentElement.style.setProperty('--nav-h', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    };
    apply();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [path]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useIsoLayoutEffect(() => {
    measure(activeItem());
    setReady(true);
    const frame = requestAnimationFrame(() => setInstant(false));
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(() => rest());
    observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [path]);

  const indicatorStyle = box
    ? { '--x': `${box.x}px`, '--y': `${box.y}px`, '--w': box.w, opacity: 1 }
    : { '--x': '0px', '--y': '0px', '--w': 0, opacity: 0 };

  return (
    <header
      ref={headerRef}
      className={[
        styles.header,
        scrolled ? styles.headerScrolled : '',
        lightBelowHero(path) && pastHero ? styles.markBlack : '',
      ].filter(Boolean).join(' ')}
    >
      <nav
        className={`${styles.nav} container${ready ? ` ${styles.navReady}` : ''}${menuOpen ? ` ${styles.navOpen}` : ''}`}
        aria-label="Main"
        onMouseLeave={rest}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) rest();
        }}
      >
        <Link href="/" className={styles.brand} aria-current={isHomeChrome(path) ? 'page' : undefined}>
          <img
            className={styles.brandMark}
            src="/icon-192.png"
            alt=""
            width={192}
            height={192}
          />
          <span className={styles.brandName}>
            <span className={`${styles.brandGiven} ${articleTitleFont.className}`}>Łukasz Jagiełło</span>
            <span className={styles.brandSep} aria-hidden="true" />
            <span className={`${styles.brandScript} ${accentScriptFont.className}`}>Photography</span>
          </span>
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.burger} data-open={menuOpen ? 'true' : 'false'} aria-hidden="true" />
        </button>
        <ul id="site-menu" className={styles.links} ref={listRef}>
          {site.nav.map(({ label, href }) => {
            const current = sectionCurrent(path, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.link}
                  data-nav-home={href === '/' ? '' : undefined}
                  aria-current={current ? 'page' : undefined}
                  onMouseEnter={(event) => measure(event.currentTarget)}
                  onFocus={(event) => measure(event.currentTarget)}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          <li
            className={`${styles.indicator} ${instant ? styles.indicatorInstant : ''}`}
            style={indicatorStyle}
            aria-hidden="true"
          />
        </ul>
      </nav>
      {previewChromePath(path) === '/about' || previewChromePath(path) === '/contact' || hidesCategoryBar(path) ? null : (
        <div className={`${styles.catBar} container`}>
          <SiteCategoryNav
            counts={MENU_COUNTS}
            active={categoryActive(previewChromePath(path))}
            label="Categories"
          />
        </div>
      )}
      {isHomeChrome(path) ? null : <SectionSpy path={previewChromePath(path)} />}
    </header>
  );
}

function footerCurrent(path, href) {
  if (!href || href.startsWith('mailto:') || href.startsWith('http')) return false;
  const chrome = previewChromePath(path);
  const target = href.split('#')[0].split('?')[0];
  if (target === '/') return isHomeChrome(path);
  // "All photographs" is only the gallery index; a category has its own link.
  if (target === '/gallery') return chrome === '/gallery';
  if (target === '/journal') return chrome === '/journal' || chrome.startsWith('/journal/');
  return chrome === target;
}

function Footer() {
  const { asPath } = useRouter();
  const path = currentPath(asPath);
  const chrome = previewChromePath(path);
  const year = new Date().getFullYear();
  const columns = [
    { heading: 'Explore', links: site.nav.map(({ label, href }) => ({ label, href })) },
    { heading: 'Gallery', links: [{ label: 'All photographs', href: '/gallery' }, ...CATEGORIES.map((c) => ({ label: categoryMenuLabel(c), href: galleryPathFor(c.slug) }))] },
    {
      heading: 'Shop',
      links: [
        // The gallery page no longer carries a digital-download call to action.
        // Other pages keep this footer link.
        ...(chrome === '/gallery' || chrome.startsWith('/gallery/') ? [] : [{ label: 'Digital downloads', href: '/gallery' }]),
        { label: 'Licensing', href: '/licensing' },
        { label: 'Prints — coming soon', href: '/contact' },
      ],
    },
    {
      heading: 'Connect',
      links: [
        ...site.social.filter((s) => !isPlaceholderSocial(s.href)).map(({ label, href }) => ({ label, href, external: true })),
        { label: site.email, href: `mailto:${site.email}`, external: true },
      ],
    },
  ];
  const legal = [
    { label: 'Sitemap', href: '/sitemap' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Sales & Licensing', href: '/licensing' },
  ];

  return (
    <footer className={lightBelowHero(path) ? `${styles.footer} ${styles.footerWhite}` : styles.footer}>
      <div className={styles.footerInner}>
        <nav className={styles.footerGrid} aria-label="Site footer">
          {columns.map((col) => (
            <div key={col.heading} className={styles.footerCol}>
              <h2 className={styles.footerHeading}>{col.heading}</h2>
              <ul className={styles.footerList}>
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    {l.external ? (
                      <a href={l.href} className={styles.footerLink} target={l.href.startsWith('mailto:') ? undefined : '_blank'} rel={l.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={styles.footerLink} aria-current={footerCurrent(path, l.href) ? 'page' : undefined}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>© {year} {site.name}. All rights reserved. All photographs are the copyright of {site.photographer}.</p>
          <nav aria-label="Legal">
            <ul className={styles.footerLegal}>
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.footerLegalLink} aria-current={footerCurrent(path, l.href) ? 'page' : undefined}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const { asPath } = useRouter();
  const path = currentPath(asPath);
  const onHero = isHomeChrome(path);
  const mainClass = [
    styles.main,
    onHero ? styles.mainUnderHero : '',
    lightBelowHero(path) ? styles.mainWhite : '',
  ].filter(Boolean).join(' ');
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className={mainClass}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

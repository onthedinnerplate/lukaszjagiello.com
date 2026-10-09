import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { site, isPlaceholderSocial } from '@/lib/site';
import { CATEGORIES, galleryPathFor } from '@/lib/categories';
import { articleTitleFont } from '@/lib/fonts';
import styles from '@/styles/Layout.module.css';
import BackToTop from './BackToTop';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function currentPath(asPath) {
  return (asPath || '/').split('?')[0].split('#')[0];
}

function sectionCurrent(path, href) {
  if (href === '/') return path === '/';
  return path === href || path.startsWith(`${href}/`);
}

function Nav() {
  const { asPath } = useRouter();
  const path = currentPath(asPath);
  const onHero = path === '/';
  const listRef = useRef(null);
  const [box, setBox] = useState(null);
  const [ready, setReady] = useState(false);
  const [instant, setInstant] = useState(true);
  const [scrolled, setScrolled] = useState(false);

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
    if (!onHero) return undefined;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onHero]);

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

  const headerClass = [
    styles.header,
    onHero ? styles.headerOnHero : '',
    onHero && scrolled ? styles.headerScrolled : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClass}>
      <nav
        className={`${styles.nav} container${ready ? ` ${styles.navReady}` : ''}`}
        aria-label="Main"
        onMouseLeave={rest}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) rest();
        }}
      >
        <Link href="/" className={styles.brand} aria-current={path === '/' ? 'page' : undefined}>
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
            <span className={`${styles.brandScript} ${articleTitleFont.className}`}>Photography</span>
          </span>
        </Link>
        <ul className={styles.links} ref={listRef}>
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
    </header>
  );
}

function footerCurrent(path, href) {
  if (!href || href.startsWith('mailto:') || href.startsWith('http')) return false;
  const target = href.split('#')[0].split('?')[0];
  if (target === '/') return path === '/';
  // "All photographs" is only the gallery index; a category has its own link.
  if (target === '/gallery') return path === '/gallery';
  if (target === '/journal') return path === '/journal' || path.startsWith('/journal/');
  return path === target;
}

function Footer() {
  const { asPath } = useRouter();
  const path = currentPath(asPath);
  const year = new Date().getFullYear();
  const columns = [
    { heading: 'Explore', links: site.nav.map(({ label, href }) => ({ label, href })) },
    { heading: 'Gallery', links: [{ label: 'All photographs', href: '/gallery' }, ...CATEGORIES.map((c) => ({ label: c.label, href: galleryPathFor(c.slug) }))] },
    {
      heading: 'Shop',
      links: [
        // The gallery page no longer carries a digital-download call to action.
        // Other pages keep this footer link.
        ...(path === '/gallery' || path.startsWith('/gallery/') ? [] : [{ label: 'Digital downloads', href: '/gallery' }]),
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
    <footer className={styles.footer}>
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
  const onHero = currentPath(asPath) === '/';
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className={onHero ? `${styles.main} ${styles.mainUnderHero}` : styles.main}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

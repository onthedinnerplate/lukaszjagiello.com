import Link from 'next/link';
import { useRouter } from 'next/router';
import { site, isPlaceholderSocial } from '@/lib/site';
import { CATEGORIES, galleryPathFor } from '@/lib/categories';
import styles from '@/styles/Layout.module.css';
import BackToTop from './BackToTop';

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
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/" className={styles.brand} aria-current={path === '/' ? 'page' : undefined}>
          <img
            className={styles.brandMark}
            src="/icon-192.png"
            alt=""
            width={192}
            height={192}
          />
          <span className={styles.brandName}>{site.name}</span>
        </Link>
        <ul className={styles.links}>
          {site.nav.map(({ label, href }) => {
            const current = sectionCurrent(path, href);
            return (
              <li key={href}>
                <Link href={href} className={styles.link} aria-current={current ? 'page' : undefined}>
                  {label}
                </Link>
              </li>
            );
          })}
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
        { label: 'Digital downloads', href: '/gallery' },
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
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

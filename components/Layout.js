import Link from 'next/link';
import { useRouter } from 'next/router';
import { site } from '@/lib/site';
import styles from '@/styles/Layout.module.css';
import BackToTop from './BackToTop';

function Nav() {
  const { pathname } = useRouter();
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.brand}>
          {site.name}
        </Link>
        <ul className={styles.links}>
          {site.nav.map(({ label, href }) => {
            const current = pathname === href || (href === '/journal' && pathname.startsWith('/journal/'));
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

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <ul className={styles.footerLinks} aria-label="Contact and social media">
          <li>
            <a href={`mailto:${site.email}`} className={styles.footerLink}>
              {site.email}
            </a>
          </li>
          {site.social.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={styles.footerLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.copyright}>
          © {year} {site.name}. All rights reserved.
        </p>
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

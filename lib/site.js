// Single source of truth for site-wide settings. Everything SEO-related
// (canonical URLs, sitemap, JSON-LD, Open Graph) reads from here.

// Canonical origin. Deliberately NOT derived from the request host so that
// preview/onrender.com URLs still canonicalise to the real domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lukaszjagiello.com').replace(/\/$/, '');

export const site = {
  name: 'Łukasz Jagiełło Photography',
  shortName: 'Łukasz Jagiełło',
  photographer: 'Łukasz Jagiełło',
  email: 'hello@lukaszjagiello.com',
  locale: 'en_US',
  description:
    'Landscape, coastal and wildlife photography by Łukasz Jagiełło.',
  keywords: [
    'Łukasz Jagiełło',
    'Lukasz Jagiello photography',
    'landscape photography',
    'wildlife photography',
    'coastal photography',
    'fine art prints',
  ],
  ogImage: { src: '/og-image.jpg', width: 1200, height: 630, alt: 'Łukasz Jagiełło Photography' },
  // TODO(owner): replace with real profile URLs. Platform root URLs are used as
  // placeholders on purpose — guessing a handle could link to a stranger.
  // Entries still pointing at a bare platform root are excluded from JSON-LD sameAs.
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/lukasz_jagiello_photography/' },
    { label: 'Facebook', href: 'https://www.facebook.com/LukaszJagiellophotography/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  // How many photos the homepage gallery shows before the "Explore more" CTA.
  // Set to Infinity to show every photo on the homepage.
  homeFeaturedCount: 12,
  // Photo numbers (from the lukasz-jagiello-NN filename) shown on the homepage, in display order.
  // The first `heroCount` also form the hero collage.
  homeFeatured: [12, 39, 41, 38, 7, 17, 3, 24, 29, 30, 14, 23],
  heroCount: 5,
  gear: {
    camera: 'Sony A7R III',
    lens: 'Sony FE 16-35mm F2.8 GM II',
  },
};

// Feature flags (build-time). Flip in the Render dashboard, then redeploy.
export const features = {
  galleryFilters: process.env.NEXT_PUBLIC_GALLERY_FILTERS === 'true',
};

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`;

const isPlaceholderSocial = (href) => {
  try {
    return new URL(href).pathname.replace(/\//g, '') === '';
  } catch {
    return true;
  }
};
export const realSocialProfiles = () => site.social.map((s) => s.href).filter((h) => !isPlaceholderSocial(h));

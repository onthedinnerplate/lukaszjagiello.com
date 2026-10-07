import { site, absoluteUrl, realSocialProfiles, SITE_URL } from './site';

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const personNode = () => {
  const sameAs = realSocialProfiles();
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.photographer,
    jobTitle: 'Photographer',
    email: `mailto:${site.email}`,
    url: absoluteUrl('/'),
    image: absoluteUrl(site.ogImage.src),
    ...(sameAs.length ? { sameAs } : {}),
  };
};

export const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: absoluteUrl('/'),
  name: site.name,
  description: site.description,
  inLanguage: 'en-US',
  publisher: { '@id': PERSON_ID },
});

export const pageNode = (type, { path, title, description }) => ({
  '@type': type,
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: title,
  description,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': PERSON_ID },
  inLanguage: 'en-US',
});

export const imageObject = (photo) => ({
  '@type': 'ImageObject',
  contentUrl: absoluteUrl(photo.src),
  name: photo.title,
  description: photo.alt,
  width: photo.width,
  height: photo.height,
  contentLocation: { '@type': 'Place', name: photo.location },
  creator: { '@id': PERSON_ID },
  creditText: site.photographer,
  copyrightNotice: `© ${site.photographer}`,
});

export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

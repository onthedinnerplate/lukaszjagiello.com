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

const LICENSE_PATH = '/contact';

/**
 * ImageObject for a photograph.
 * Gallery pages call this with the photo alone (contentUrl, creator, credit, copyright).
 * Photo pages pass options to add the licensable-image fields, place, and EXIF.
 * `contentLocation` is omitted when the location string is blank — never invented.
 */
export const imageObject = (photo, options = {}) => {
  const node = {
    '@type': 'ImageObject',
    contentUrl: absoluteUrl(photo.src),
    name: photo.title,
    description: photo.alt,
    width: photo.width,
    height: photo.height,
    creator: { '@id': PERSON_ID },
    creditText: site.photographer,
    copyrightNotice: `© ${site.photographer}`,
  };

  if (options.url) node.url = absoluteUrl(options.url);

  if (options.license) {
    const license = absoluteUrl(LICENSE_PATH);
    node.license = license;
    node.acquireLicensePage = license;
  }

  const place = typeof options.contentLocation === 'string' ? options.contentLocation.trim() : '';
  const c = photo.coords;
  const geo = c && typeof c.lat === 'number' && typeof c.lng === 'number'
    ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng }
    : null;
  if (place || geo) {
    node.contentLocation = { '@type': 'Place', ...(place ? { name: place } : {}), ...(geo ? { geo } : {}) };
  }

  if (options.exifData?.length) node.exifData = options.exifData;

  return node;
};

/**
 * Article (blog post) node. `image` is one or more absolute-or-root paths;
 * they are canonicalised here. Author and publisher point at the site Person.
 */
export const articleNode = ({ path, headline, description, image, datePublished, dateModified, articleBody }) => {
  const images = (Array.isArray(image) ? image : [image]).filter(Boolean).map((src) => absoluteUrl(src));
  return {
    '@type': 'Article',
    '@id': `${absoluteUrl(path)}#article`,
    headline,
    description,
    image: images,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
    inLanguage: 'en-US',
    ...(articleBody ? { articleBody } : {}),
  };
};

export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

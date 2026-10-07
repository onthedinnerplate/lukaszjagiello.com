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
  if (place) node.contentLocation = { '@type': 'Place', name: place };

  if (options.exifData?.length) node.exifData = options.exifData;

  return node;
};

export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

import Head from 'next/head';
import { site, absoluteUrl } from '@/lib/site';

// Escape "<" so no string in the data can close the <script> element early.
const serialize = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export default function Seo({
  title,
  description = site.description,
  path = '/',
  keywords = [],
  jsonLd,
  noindex = false,
  robots,
  image,
  ogType = 'website',
}) {
  const fullTitle = title ? `${title} | ${site.name}` : site.name;
  const url = absoluteUrl(path);
  const og = image || site.ogImage;
  const ogImage = absoluteUrl(og.src);
  const allKeywords = [...new Set([...keywords, ...site.keywords])].join(', ');
  const robotsContent = robots ?? (noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  const indexable = robots == null ? !noindex : !/noindex/i.test(String(robots));

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={site.photographer} />
      <meta name="robots" content={robotsContent} />
      {indexable && <link rel="canonical" href={url} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content={String(og.width)} />
      <meta property="og:image:height" content={String(og.height)} />
      <meta property="og:image:alt" content={og.alt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={og.alt} />

      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(jsonLd) }} />}
    </Head>
  );
}

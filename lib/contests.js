// Contest entries shown on /contests.
// Append an object to add a contest. List order is the page order.
// photoSlugs point at existing /photo/<slug> pages. Do not copy image files.
// An entry that must stay unpublished sets `placeholder` and no photoSlugs.

export const CONTEST_STATUSES = {
  in_preparation: 'In preparation',
  submitted: 'Submitted',
  shortlisted: 'Shortlisted',
  winner: 'Winner',
  not_placed: 'Not placed',
};

export const contests = [
  {
    id: 'sony-world-photography-awards-2027',
    name: 'Sony World Photography Awards 2027',
    detail: 'Professional Series, Wildlife & Nature',
    status: 'in_preparation',
    deadline: null,
    results: '2027-04',
    url: 'https://www.worldphoto.org/sony-world-photography-awards/series',
    // Text only until the results are public. Do not add photoSlugs before then.
    placeholder: 'Series entry — images revealed after results',
  },
  {
    id: 'jrny-world-travel-photography-awards',
    name: 'JRNY World Travel Photography Awards',
    detail: '',
    status: 'in_preparation',
    deadline: '2026-11-09',
    results: null,
    url: 'https://jrnymag.com/wtpawards2026/',
    photoSlugs: [
      'sun-through-the-storm',
      'dock-guard-tower-from-below',
      'armory-vault-door',
      'dock-guard-tower-and-building-64',
      'palms-and-the-hilltop-cross',
      'marymere-looking-up',
    ],
  },
  {
    id: 'outdoor-photography-one-thing-this-month',
    name: 'Outdoor Photography',
    detail: 'One Thing This Month — high-speed wildlife',
    status: 'in_preparation',
    deadline: '2026-11-30',
    results: null,
    url: 'https://www.outdoorphotographymagazine.co.uk/submissions/one-thing-this-month/',
    photoSlugs: ['seabird-lifting-off'],
  },
  {
    id: 'concrete-in-life',
    name: 'Concrete in Life',
    detail: 'Concrete Beauty and Design',
    status: 'in_preparation',
    deadline: '2026-12-04',
    results: null,
    url: 'https://gccassociation.org/concreteinlife2627/',
    photoSlugs: ['dock-guard-tower-from-below'],
  },
  {
    id: 'share-the-experience-2026',
    name: 'Share the Experience 2026',
    detail: '',
    status: 'in_preparation',
    deadline: '2026-12-31',
    results: null,
    url: 'https://www.sharetheexperience.org/',
    photoSlugs: [
      'marymere-looking-up',
      'dock-guard-tower-from-below',
      'armory-vault-door',
      'dock-guard-tower-and-building-64',
    ],
  },
];

function formatContestDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month) throw new Error(`contests: bad date "${value}"`);
  const date = new Date(Date.UTC(year, month - 1, day || 1));
  const options = day
    ? { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
    : { month: 'long', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function slugFromHref(href) {
  const prefix = '/photo/';
  return typeof href === 'string' && href.startsWith(prefix) ? href.slice(prefix.length) : '';
}

/**
 * Attach gallery photographs to each contest. Throws if a slug is missing
 * or a text-only entry lists photographs.
 */
export function presentContests(gallery) {
  const bySlug = new Map(gallery.map((photo) => [slugFromHref(photo.href), photo]));
  return contests.map((contest) => {
    const statusLabel = CONTEST_STATUSES[contest.status];
    if (!statusLabel) throw new Error(`contests: ${contest.id} has unknown status "${contest.status}"`);
    const slugs = contest.photoSlugs || [];
    if (contest.placeholder && slugs.length) {
      throw new Error(`contests: ${contest.id} is text-only and must not list photographs`);
    }
    if (!contest.placeholder && !slugs.length) {
      throw new Error(`contests: ${contest.id} needs photo slugs or a placeholder`);
    }
    const photos = slugs.map((slug) => {
      const photo = bySlug.get(slug);
      if (!photo) throw new Error(`contests: ${contest.id} references unknown photo slug "${slug}"`);
      return {
        slug,
        title: photo.title,
        href: photo.href,
        thumb: photo.thumb,
        thumbWidth: photo.thumbWidth || photo.width,
        thumbHeight: photo.thumbHeight || photo.height,
        thumbSrcSet: photo.thumbSrcSet || null,
      };
    });
    return {
      id: contest.id,
      name: contest.name,
      detail: contest.detail || '',
      status: contest.status,
      statusLabel,
      deadline: contest.deadline || null,
      deadlineLabel: formatContestDate(contest.deadline),
      results: contest.results || null,
      resultsLabel: formatContestDate(contest.results),
      url: contest.url,
      placeholder: contest.placeholder || '',
      photos,
    };
  });
}

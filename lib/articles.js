// Journal essays published on /journal.
// Copy (title, italic dek, body, and the "From the bag" settings line) is the
// owner's text, verbatim. The Golden Gate essay is intentionally not included.
// Images are not stored here: each essay points at a gallery photo slug, and
// hydrateArticles() copies src, thumb, and alt from that photo's own record.
import { slugifyTitle, ogImageSrc } from './slug.js';
import { site } from './site.js';
import { CATEGORIES } from './categories.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Calendar date for the visible byline. The ISO date is YYYY-MM-DD. */
export function formatArticleDate(isoDate) {
  const [year, month, day] = String(isoDate).split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

// Newest first. All four share 8 October 2026; publishedAt keeps that order
// when the list is sorted by time.
const records = [
  {
    "photoSlug": "ruby-beach",
    "publishedAt": "2026-10-08T16:00:00.000Z",
    "expectSrc": "/images/gallery/lightbox/lukasz-jagiello-39-full.webp",
    "title": "Where the Forest Walks Into the Sea",
    "dek": "On the Washington coast, the trees don't stop at the shoreline, and neither does the story.",
    "paragraphs": [
      "Driftwood is the first thing you have to negotiate at Ruby Beach. Not step around, but negotiate. Whole trees lie bleached and tangled along the top of the beach, stripped of bark and stacked by winter storms into piles you have to climb over to reach the sand. Some of them are bigger than my car. All of them came from somewhere upstream, a forest that let go of them and an ocean that sent them back.",
      "It's a fitting welcome to a place where land and water don't have a clean border.",
      "Out on the beach, the sea stacks rise from a floor of grey pebbles and dark sand. They aren't the bare rock towers you see in a lot of coastal photographs. These are crowned with forest: spruce and shrubs clinging to the tops, a few spindly trees standing up against the sky like they wandered out from the mainland and got stranded. The rock below is dark, streaked, and furred with green where the spray keeps it wet.",
      "I spent a while walking before I took out the camera. Ruby Beach rewards that. The relationships between the stacks change with every few steps you take: one hides behind another, a gap opens up, a channel of water appears and disappears. I was looking for the moment where the big forested stack in the back sat squarely between the closer rocks, framed on both sides like a stage set, with a strip of bright water separating them.",
      "When I found it, the sky had started doing something unexpected. Streaks of pink and rose were pulling across it at an angle, thin and fast-moving, over a blend of teal and green. It didn't look like a typical Pacific Northwest sky, which more often settles for a soft grey lid. This was louder. It made the dark stacks look even heavier underneath it.",
      "I stayed put and let the scene arrange itself in front of me. A few logs lay in the foreground, half sunk into the gravel, leading the eye in toward the rocks. A boulder sat in the middle distance with a pale crust on top. The water behind it glowed faintly where it caught the sky.",
      "There's a quietness to this kind of coast that I don't find in the desert, where I live. In Arizona, the land feels finished. Here, it feels like it's still being made. The stacks are pieces of headland the sea has already cut loose. The logs on the beach are trees the river has already given up. Everything in this frame is in the middle of becoming something else, just slowly enough that you can stand there and pretend it's holding still.",
      "I made a handful of frames, then put the camera down and watched the pink fade. That part didn't need recording."
    ],
    "settings": "Sony A7R III · Sony FE 70-200mm F2.8 GM OSS II · 70mm · 1/60s · f/9 · ISO 160",
    "note": "A telephoto lens is not the obvious choice for a beach, but it's my favourite tool at places like Ruby Beach. At 70mm, the shortest end of the 70-200mm, the lens compresses the distance between the sea stacks, so the forested rock in the background looks closer to the boulders in front of it. That stacks the layers together instead of spreading them out into a wide, empty scene. f/9 gave me enough depth of field to keep the driftwood, the boulders, and the background stack sharp together. 1/60s at 70mm is comfortable to handle with stabilization, and nudging ISO to 160 instead of base 100 kept the shutter speed there as the light faded, without any real cost in image quality on the A7R III.",
    "date": "2026-10-08"
  },
  {
    "photoSlug": "marymere-falls",
    "publishedAt": "2026-10-08T15:00:00.000Z",
    "expectSrc": "/images/gallery/lightbox/lukasz-jagiello-41-full.webp",
    "title": "A Thin Line of Light in a Green Room",
    "dek": "A short trail near Lake Crescent, an old forest, and a waterfall that asks you to lower your voice.",
    "paragraphs": [
      "You hear Marymere Falls before you see it, but only just. It isn't a thundering waterfall. It's a steady, narrow pour that sounds more like rain on a roof than a river falling off a cliff, and the forest around it absorbs most of the noise anyway.",
      "The walk in is short, a trail through the woods near Lake Crescent, the kind of path that feels effortless until you realise you've stopped looking at your feet entirely. Everything is green. The trunks are wrapped in moss. Ferns spill over the edges of the trail. Branches hang with strands of moss that catch the light like old lace. Coming from Phoenix, where green is something you water deliberately, a forest like this feels almost excessive, like the landscape has too much of everything and doesn't know where to put it.",
      "The falls appear at the end, through a gap in the trees: a single silver line dropping down a dark cliff face, split in a few places where it hits ledges and fans out before gathering itself again. The rock behind it is slick and black, but the edges glow a bright, almost electric yellow-green where moss has taken hold in the spray. At the bottom, the water settles into a small dark pool, with fallen logs lying across the stream below it.",
      "What struck me was how little light there was. Under the canopy, the forest was deep in shadow, with only a few patches catching what came through the leaves. The waterfall, though, seemed to carry its own light. White water reflects everything, so even in that dim green room it stood out as the brightest thing in sight.",
      "That became the photograph. I didn't want to brighten the whole forest and flatten it into an even green wall. I wanted the darkness on the left side of the frame to stay dark: the trunk, the ferns, the hanging moss, a dense, almost black frame that you look through to reach the falls. The waterfall would sit to the right of centre, lit and smooth, with the mossy cliff glowing around it.",
      "I worked slowly. Footing near the viewing area is damp, and the forest has a way of making you move gently anyway. I adjusted the composition a few times to get a fern frond into the lower left, to keep a tree trunk running up the frame as a dark vertical against the bright vertical of the water. Two lines, one shadow, one light.",
      "There's a reason so many people walk this trail. It's easy to reach and it's beautiful. But standing there, I felt like the place still belonged more to the moss than to us. The waterfall has been drawing that same line down that same rock for a long time. I just happened to be there with a camera for three-fifths of a second of it."
    ],
    "settings": "Sony A7R III · Sony FE 16-35mm F2.8 GM II · 21mm · 3/5s · f/10 · ISO 100",
    "note": "Waterfalls in deep shade are a gift for slower shutter speeds. At 3/5 of a second, the falls turn from individual droplets into a smooth ribbon, but the exposure isn't so long that the water loses all its texture and becomes a blank white stripe. f/10 kept everything from the ferns in the foreground to the cliff behind the falls in focus, and ISO 100 kept the shadows clean, which matters in a frame where so much of the image is dark green and near-black. At 21mm I had enough width to include the forest around the falls as a frame, without making the waterfall itself look tiny. Anything under a second needs a steady support, and I exposed for the bright water first, letting the forest fall into shadow rather than lifting it.",
    "date": "2026-10-08"
  },
  {
    "photoSlug": "negril-lighthouse",
    "publishedAt": "2026-10-08T14:00:00.000Z",
    "expectSrc": "/images/gallery/lightbox/lukasz-jagiello-03-full.webp",
    "title": "The Lighthouse at the End of the Island",
    "dek": "Late sun on Jamaica's West End, and a set of camera settings I wouldn't recommend, but that worked.",
    "paragraphs": [
      "Negril's West End doesn't have beaches. It has cliffs. After the long sweep of sand on the other side of town, the coastline here turns to hard, pitted limestone: grey and gold, full of holes and ledges, dropping straight into clear water. And standing at the end of it, near the westernmost point of Jamaica, is the lighthouse.",
      "I came to it in the late afternoon, when the sun had dropped low enough to turn warm but hadn't yet gone into its sunset show. That was the light I wanted. Sunset on the West End is famous, and deserves to be, but sunset light is mostly about the sky. I wanted light that would land on the lighthouse itself.",
      "It did. The tower is white, and the low sun painted it a soft cream on one side, with long shadows sliding down its curve. The lantern room on top caught the light in its glass, flashes of red and green from inside. Behind the tower, the sky had gone a deep, saturated blue with only a few faint clouds. In front, a band of tropical trees ran along the cliff edge, some green, some touched with orange and red, all lit from the side. A small building with a pyramid-shaped roof sat tucked into the trees at the lighthouse's base, and on the left, a set of stone steps and walls climbed the rocks.",
      "It was a scene that wanted to be photographed tight. From a distance, the lighthouse is one element among many: the road, the cliffs, the sea, the people. Through a long lens, it becomes a portrait. I pulled in until the frame held only the essentials: the tower, the trees, the cliff, the sky. The limestone stretched across the bottom of the frame like a pedestal.",
      "I like that the lighthouse doesn't stand alone in this picture. The trees crowd around it. The rocks in front are rough and uneven. The stone steps on the left feel like the beginning of a path you could take. It reads less like a landmark postcard and more like a place someone lives with, which, on an island, a lighthouse is.",
      "There's a calm to this kind of light that's hard to explain. The island had been bright and hot all day, the kind of overhead sun that flattens everything. Then, for maybe half an hour, everything picked up texture and colour, and the whole coastline seemed to exhale. The lighthouse just stood in it, glowing.",
      "Then the sun went down into the sea, the sky turned to fire, and everyone along the cliffs turned to face west. I did too. But the frame I keep coming back to is this one, from just before."
    ],
    "settings": "Sony A7R III · Sony FE 70-200mm F2.8 GM OSS II · 164mm · 1/8000s · f/4.5 · ISO 3200",
    "note": "These numbers look strange, and I'll be honest about that. On a bright afternoon, ISO 3200 is far more sensitivity than the scene needed; the camera answered by pushing the shutter all the way to 1/8000s, the fastest the A7R III's mechanical shutter goes. It's not the combination I'd teach anyone to choose. At base ISO, the same exposure would have come in around 1/250s, which is still more than enough to freeze a scene that isn't moving. The reason it still works is that the A7R III handles ISO 3200 well in good light, and the scene was well exposed, so the noise stayed manageable once the file was processed. The lesson I take from it: check your ISO when the light changes. The part I'd repeat exactly is the focal length. At 164mm, the telephoto compressed the trees, the tower, and the cliff into one tight, layered portrait, and f/4.5 kept the lighthouse and the trees around it sharp.",
    "date": "2026-10-08"
  },
  {
    "photoSlug": "slot-canyon-light",
    "publishedAt": "2026-10-08T13:00:00.000Z",
    "expectSrc": "/images/gallery/lightbox/lukasz-jagiello-23-full.webp",
    "title": "Inside the Stone",
    "dek": "In Lower Antelope Canyon, the light arrives secondhand, and it's better for it.",
    "paragraphs": [
      "From the surface, there's almost nothing to see. A crack in the sandstone, a seam in a flat, sunburned landscape outside Page. If you didn't know it was there, you could walk right past it. Then you go down the stairs, squeeze into the gap, and the whole world changes colour.",
      "Lower Antelope Canyon is on Navajo land, and you visit it with a Navajo guide. I'm grateful for that. The guide knows the canyon in a way no visitor can: where the light falls at which hour, how floods have reshaped the passages, which turns are worth pausing at. It also sets the pace. You move through the canyon as part of a group, steadily, and you learn to work fast and see quickly. There's no setting up and waiting for an hour here.",
      "The canyon is narrow. In places, you can touch both walls at once. The sandstone curves and folds in long, smooth waves, carved by water rushing through during flash floods and by wind in between. Every surface is layered with fine lines, like the grain in wood or the rings in a tree, records of the sand that settled here long before it became stone.",
      "And then there's the light. Very little of it reaches the floor directly. Sunlight comes in through the slit far overhead and bounces from wall to wall on its way down, and every bounce warms it. By the time it reaches you, it's no longer sunlight in any ordinary sense. It's orange, amber, rose, gold, depending on how many times it has been reflected and off which stone.",
      "The frame on my homepage is about that bounce. I found a spot where two dark walls closed in on the foreground, rough and shadowed, almost black on the edges. Between them, a deep corridor opened up, and the far walls were glowing, caught by light that had already ricocheted down through the canyon. At the very top, a thin blade of blue sky. That blue mattered. It's the only reminder in the frame that there's an outside world, and that all this colour began as ordinary daylight.",
      "I live in Phoenix, so the desert isn't exotic to me. I know the heat, the space, the long views. Slot canyons are the opposite of all of that. They're cool, enclosed, intimate. They take everything I associate with the desert and fold it inward. Standing at the bottom, looking up through that seam of sky, I felt like I was inside the terrain rather than looking at it.",
      "The group moved on. I took one more look up, then followed."
    ],
    "settings": "Sony A7R III · Sony FE 16-35mm F2.8 GM II · 34mm · 1/80s · f/2.8 · ISO 100",
    "note": "Slot canyons are dark, and they're also extremely high-contrast: a sliver of bright sky against walls in deep shadow. I shot this handheld, so I needed a shutter speed fast enough to stay sharp while moving with the group. 1/80s at 34mm does that comfortably. Opening the 16-35mm all the way to f/2.8 let in enough light to make that possible at ISO 100, which kept the shadows in the dark foreground walls as clean as possible, so I could lift them later without noise. At 34mm, near the long end of the lens, I could isolate the glowing corridor instead of including everything around me; at 16mm, the canyon tends to feel cluttered. I exposed to protect the bright walls and the blue sky, and let the near walls fall dark to frame the light.",
    "date": "2026-10-08"
  }
];

export const articles = records.map((record) => ({
  ...record,
  slug: slugifyTitle(record.title),
  author: site.photographer,
}));

export function articlesNewestFirst() {
  return [...articles].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
}

function photoFor(article, photos) {
  const photo = photos.find((p) => p.href === `/photo/${article.photoSlug}`);
  if (!photo) {
    throw new Error(`Journal article "${article.title}" points at /photo/${article.photoSlug}, which is not in the gallery.`);
  }
  if (photo.src !== article.expectSrc) {
    throw new Error(
      `Journal article "${article.title}" expected ${article.expectSrc} but /photo/${article.photoSlug} uses ${photo.src}.`,
    );
  }
  const expectThumb = article.expectSrc
    .replace('/images/gallery/lightbox/', '/images/gallery/')
    .replace('-full.webp', '-thumb.webp');
  if (photo.thumb !== expectThumb) {
    throw new Error(
      `Journal article "${article.title}" expected thumb ${expectThumb} but /photo/${article.photoSlug} uses ${photo.thumb}.`,
    );
  }
  return photo;
}

/** Plain, serialisable article joined to the gallery photo it illustrates. */
export function hydrateArticle(article, photos) {
  const photo = photoFor(article, photos);
  const ogSrc = ogImageSrc(photo.src);
  if (!ogSrc) {
    throw new Error(`No Open Graph image for ${photo.src}.`);
  }
  return {
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    date: article.date,
    publishedAt: article.publishedAt,
    author: article.author,
    paragraphs: article.paragraphs,
    gear: { settings: article.settings, note: article.note },
    location: photo.location,
    photo: {
      src: photo.src,
      thumb: photo.thumb,
      alt: photo.alt,
      width: photo.width,
      height: photo.height,
      thumbWidth: photo.thumbWidth,
      thumbHeight: photo.thumbHeight,
      href: photo.href,
      title: photo.title,
      color: photo.color,
      focus: photo.focus || null,
      categories: photo.categories || [],
      og: { src: ogSrc, width: 1200, height: 630, alt: photo.alt },
    },
  };
}

export function hydrateArticles(photos) {
  return articlesNewestFirst().map((article) => hydrateArticle(article, photos));
}

/** /journal or /journal?category=landscape. Query filtering stays static-export friendly. */
export const journalCategoryPath = (slug) =>
  !slug || slug === 'all' ? '/journal' : `/journal?category=${encodeURIComponent(slug)}`;

/** Counts for the category row. A photo's own categories decide membership. */
export function journalCategoryCounts(articles) {
  const counts = { all: articles.length };
  for (const { slug } of CATEGORIES) counts[slug] = 0;
  for (const article of articles) {
    for (const slug of article.photo?.categories || []) {
      if (Object.prototype.hasOwnProperty.call(counts, slug)) counts[slug] += 1;
    }
  }
  return counts;
}

export function articlesInCategory(articles, slug) {
  if (!slug || slug === 'all' || !CATEGORIES.some((c) => c.slug === slug)) return articles;
  return articles.filter((article) => (article.photo.categories || []).includes(slug));
}

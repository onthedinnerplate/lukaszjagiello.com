import Seo from '@/components/Seo';
import SiteCategoryNav from '@/components/SiteCategoryNav';
import { CATEGORIES } from '@/lib/categories';
import { articles } from '@/lib/articles';
import { accentScriptFont, articleTitleFont } from '@/lib/fonts';
import { photos } from '@/lib/photos';
import { GALLERY_NO_CATEGORIES_PATH, HOME_NO_CATEGORIES_PATH, LAUNCH_FIXES_PATH } from '@/lib/previewRoutes';
import { site } from '@/lib/site';
import styles from '@/styles/LaunchFixesPreview.module.css';

// Isolated proposal page. Registered in lib/previewRoutes.js, noindex,
// omitted from the sitemap, and not linked from site.nav.

const CURRENT_GOLD = '#c4a35a';
const PROPOSED_GOLD = '#8c7032';
const HERO_TOP = '/images/gallery/lightbox/lukasz-jagiello-41-full.webp';

/** Same totals as the live header row: Journey is the essay count, the rest are photographs. */
function categoryCounts() {
  const counts = { all: articles.length };
  for (const { slug } of CATEGORIES) counts[slug] = 0;
  for (const photo of photos) {
    for (const slug of photo.categories || []) {
      if (Object.prototype.hasOwnProperty.call(counts, slug)) counts[slug] += 1;
    }
  }
  return counts;
}

const CATEGORY_COUNTS = categoryCounts();

const COPY = [
  {
    id: 'home',
    name: 'Homepage',
    current: {
      title: 'Łukasz Jagiełło Photography',
      description: 'Landscape, coastal and wildlife photography by Łukasz Jagiełło.',
    },
    proposed: {
      title: 'Łukasz Jagiełło | Olympic Park & Southwest Landscapes',
      description:
        'National Geographic-style landscape photography from Olympic National Park and the Southwest, with Journeys stories and photo downloads by Łukasz Jagiełło.',
    },
  },
  {
    id: 'gallery',
    name: 'Gallery',
    current: {
      title: 'Gallery | Łukasz Jagiełło Photography',
      description: 'Full portfolio of landscape, coastal and wildlife photographs by Łukasz Jagiełło.',
    },
    proposed: {
      title: 'Landscape Gallery | Olympic National Park & Southwest',
      description:
        'The gallery of National Geographic-style landscapes from Olympic National Park and the Southwest, with Journeys stories and photo downloads by Łukasz Jagiełło.',
    },
  },
];

/** WCAG 2 relative luminance, contrast against white. */
function contrastOnWhite(hex) {
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const value = Number.parseInt(hex.slice(1), 16);
  const L =
    0.2126 * channel((value >> 16) & 255) +
    0.7152 * channel((value >> 8) & 255) +
    0.0722 * channel(value & 255);
  return 1.05 / (L + 0.05);
}

function ratioLabel(hex) {
  return `${contrastOnWhite(hex).toFixed(2)}:1`;
}

function CopyBlock({ label, title, description }) {
  return (
    <div className={styles.copyCard}>
      <p className={styles.cardLabel}>{label}</p>
      <h3 className={styles.fieldLabel}>
        Title <span className={styles.count}>{title.length}</span>
      </h3>
      <p className={styles.quote}>{title}</p>
      <h3 className={styles.fieldLabel}>
        Description <span className={styles.count}>{description.length}</span>
      </h3>
      <p className={styles.quote}>{description}</p>
    </div>
  );
}

function MenuBar({ gold }) {
  return (
    <div className={styles.mockBlock}>
      <p className={styles.mockLabel}>Menu bar</p>
      <div className={styles.bar}>
        <div className={styles.brand}>
          <img className={styles.mark} src="/icon-192.png" alt="" width={28} height={28} />
          <span className={styles.brandName}>
            <span className={`${styles.given} ${articleTitleFont.className}`}>Łukasz Jagiełło</span>
            <span className={styles.sep} aria-hidden="true" />
            <span className={`${styles.script} ${accentScriptFont.className}`} style={{ color: gold }}>
              Photography
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function PhoneMenu({ gold }) {
  return (
    <div className={styles.mockBlock}>
      <p className={styles.mockLabel}>Phone menu</p>
      <ul className={styles.phone} aria-label="Phone menu sample">
        {site.nav.map(({ label, href }) => {
          const current = href === '/';
          return (
            <li
              key={href}
              className={current ? styles.phoneCurrent : undefined}
              style={current ? { color: gold } : undefined}
              aria-current={current ? 'page' : undefined}
            >
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PageFrame({ title, src, width, viewHeight }) {
  return (
    <figure className={styles.frameCard}>
      <figcaption className={styles.goldCaption}>
        <span className={styles.cardLabel}>{title}</span>
        <span className={styles.goldMeta}>{width}px</span>
      </figcaption>
      <div
        className={styles.frameClip}
        style={{
          height: viewHeight,
          '--frame-w': `${width}px`,
          '--view-h': `${viewHeight}px`,
        }}
      >
        <iframe className={styles.frame} title={title} src={src} loading="lazy" />
      </div>
    </figure>
  );
}

function PagePair({ heading, currentSrc, proposedSrc, width, viewHeight }) {
  return (
    <div className={styles.pageBlock}>
      <h3 className={styles.pageName}>{heading}</h3>
      <div className={width > 500 ? styles.pair : styles.phoneStage}>
        <PageFrame title="Current" src={currentSrc} width={width} viewHeight={viewHeight} />
        <PageFrame title="Without category row" src={proposedSrc} width={width} viewHeight={viewHeight} />
      </div>
    </div>
  );
}

function PhoneHeaderMock({ name, detail, showCategories }) {
  return (
    <figure className={styles.phoneCard}>
      <figcaption className={styles.goldCaption}>
        <span className={styles.cardLabel}>{name}</span>
        <span className={styles.goldMeta}>{detail}</span>
      </figcaption>
      <div className={styles.phoneFrame}>
        <div className={styles.phoneHeader}>
          <div className={styles.phoneBar}>
            <div className={styles.phoneBrand}>
              <img className={styles.phoneMark} src="/icon-192.png" alt="" width={22} height={22} />
              <span className={styles.phoneName}>
                <span className={`${styles.phoneGiven} ${articleTitleFont.className}`}>Łukasz Jagiełło</span>
                <span className={styles.sep} aria-hidden="true" />
                <span className={`${styles.phoneScript} ${accentScriptFont.className}`}>Photography</span>
              </span>
            </div>
            <span className={styles.phoneBurger} aria-hidden="true" />
          </div>
          {showCategories ? (
            <div
              className={styles.phoneCats}
              onClickCapture={(event) => {
                const node = event.target instanceof Element ? event.target : event.target?.parentElement;
                if (node?.closest('a')) event.preventDefault();
              }}
            >
              <SiteCategoryNav counts={CATEGORY_COUNTS} active="" label="Categories" />
            </div>
          ) : null}
        </div>
        <div className={styles.phoneTop}>
          <img src={HERO_TOP} alt="" />
        </div>
      </div>
    </figure>
  );
}

function GoldColumn({ name, hex }) {
  const ratio = ratioLabel(hex);
  return (
    <figure className={styles.goldCard}>
      <figcaption className={styles.goldCaption}>
        <span className={styles.cardLabel}>{name}</span>
        <span className={styles.goldMeta}>
          <span className={styles.swatch} style={{ background: hex }} aria-hidden="true" />
          <code>{hex}</code>
          <span>{ratio} on white</span>
        </span>
      </figcaption>
      <MenuBar gold={hex} />
      <PhoneMenu gold={hex} />
    </figure>
  );
}

export default function LaunchFixesPreview() {
  return (
    <>
      <Seo
        title="Launch fixes preview"
        description="Proposal for search titles, meta descriptions, menu gold, and pages without the category row. Not for indexing."
        path={LAUNCH_FIXES_PATH}
        robots="noindex"
      />
      <article className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>Preview only</p>
          <h1>Launch fixes</h1>
          <p className={styles.lede}>
            Proposed search text, a deeper gold for the menu, and the homepage and Gallery without the
            category row. Nothing here is applied to the live pages, the menu, or the sitemap.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="seo-heading">
          <h2 id="seo-heading">Search titles and descriptions</h2>
          <p className={styles.note}>
            Titles are the full title tag. Descriptions are the meta description. Targets are about 50–60
            characters for a title and about 150–160 for a description.
          </p>
          {COPY.map((page) => (
            <div key={page.id} className={styles.pageBlock}>
              <h3 className={styles.pageName}>{page.name}</h3>
              <div className={styles.compare}>
                <CopyBlock label="Current" title={page.current.title} description={page.current.description} />
                <CopyBlock label="Proposed" title={page.proposed.title} description={page.proposed.description} />
              </div>
            </div>
          ))}
        </section>

        <section className={styles.section} aria-labelledby="gold-heading">
          <h2 id="gold-heading">Menu gold</h2>
          <p className={styles.note}>
            Photography in the white menu bar, and the current page in the phone menu, use {CURRENT_GOLD} (
            {ratioLabel(CURRENT_GOLD)} on white). The proposal is {PROPOSED_GOLD} ({ratioLabel(PROPOSED_GOLD)} on
            white), the same gold deepened past 4.5:1. The thin decorative line stays rgba(196, 163, 90, 0.6) in
            both.
          </p>
          <div className={styles.compare}>
            <GoldColumn name="Current" hex={CURRENT_GOLD} />
            <GoldColumn name="Proposed" hex={PROPOSED_GOLD} />
          </div>
        </section>

        <section className={styles.section} id="phone-categories" aria-labelledby="phone-cat-heading">
          <h2 id="phone-cat-heading">Category row on phones</h2>
          <p className={styles.note}>
            A close-up of the phone header. Journey, Landscape, Animal, Architecture, and People stay in the
            current frame. The frames below show the whole homepage and Gallery, at desktop width and at
            390px, beside the same pages with that row removed.
          </p>
          <div className={styles.phoneStage}>
            <PhoneHeaderMock name="Current" detail="390px · category row kept" showCategories />
            <PhoneHeaderMock name="Proposed" detail="390px · category row removed" showCategories={false} />
          </div>
        </section>

        <section className={styles.section} id="page-frames" aria-labelledby="page-frames-heading">
          <h2 id="page-frames-heading">Homepage and Gallery</h2>
          <p className={styles.note}>
            Desktop frames lay out at 1280px and scale into the column. Phone frames lay out at 390px.
            Current is the live page. Without category row is the same page, preview only, with Journey,
            Landscape, Animal, Architecture, and People removed from the header.
          </p>
          <h3 className={styles.pageName}>Homepage</h3>
          <PagePair heading="Desktop" currentSrc="/" proposedSrc={HOME_NO_CATEGORIES_PATH} width={1280} viewHeight={560} />
          <PagePair heading="Phone" currentSrc="/" proposedSrc={HOME_NO_CATEGORIES_PATH} width={390} viewHeight={680} />
          <h3 className={styles.pageName}>Gallery</h3>
          <PagePair heading="Desktop" currentSrc="/gallery" proposedSrc={GALLERY_NO_CATEGORIES_PATH} width={1280} viewHeight={560} />
          <PagePair heading="Phone" currentSrc="/gallery" proposedSrc={GALLERY_NO_CATEGORIES_PATH} width={390} viewHeight={680} />
        </section>
      </article>
    </>
  );
}

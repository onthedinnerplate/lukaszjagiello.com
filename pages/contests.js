import Link from 'next/link';
import Seo from '@/components/Seo';
import ResponsiveImage from '@/components/ResponsiveImage';
import { presentContests } from '@/lib/contests';
import { getPhotos } from '@/lib/photo-data';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import pageStyles from '@/styles/Page.module.css';
import styles from '@/styles/Contests.module.css';

const meta = {
  path: '/contests',
  title: 'Contests',
  description: `Photography contest entries and results by ${site.photographer}.`,
};

function ContestPhotos({ contest }) {
  if (!contest.photos.length) {
    return <p className={styles.placeholder}>{contest.placeholder}</p>;
  }
  return (
    <div className={styles.entered}>
      <p className={styles.enteredLabel}>Entered</p>
      <ul className={styles.shots}>
        {contest.photos.map((photo) => (
          <li key={photo.slug}>
            <Link href={photo.href} className={styles.shotLink}>
              <span className={styles.shotFrame}>
                <ResponsiveImage
                  pictureClassName={styles.shotPicture}
                  src={photo.thumb}
                  alt=""
                  width={photo.thumbWidth}
                  height={photo.thumbHeight}
                  sizes="(max-width: 640px) 46vw, (max-width: 1100px) 28vw, 200px"
                  srcSet={photo.thumbSrcSet || undefined}
                  className={styles.shot}
                  loading="lazy"
                />
              </span>
              <span className={styles.shotTitle}>{photo.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Contests({ contests }) {
  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['photography contests', 'photo awards', ...contests.map((contest) => contest.name)]}
        jsonLd={graph(websiteNode(), personNode(), pageNode('CollectionPage', meta))}
      />
      <article className={pageStyles.galleryPage}>
        <header className={styles.header}>
          <h1>Contests</h1>
          <p className={pageStyles.lede}>Contest entries and results.</p>
        </header>
        <ul className={styles.list}>
          {contests.map((contest) => (
            <li key={contest.id}>
              <article className={styles.card} id={contest.id} data-status={contest.status} aria-labelledby={`${contest.id}-title`}>
                <p className={styles.status}>{contest.statusLabel}</p>
                <h2 id={`${contest.id}-title`} className={styles.name}>{contest.name}</h2>
                {contest.detail ? <p className={styles.detail}>{contest.detail}</p> : null}
                <dl className={styles.facts}>
                  {contest.deadlineLabel ? (
                    <div>
                      <dt>Deadline</dt>
                      <dd><time dateTime={contest.deadline}>{contest.deadlineLabel}</time></dd>
                    </div>
                  ) : null}
                  {contest.resultsLabel ? (
                    <div>
                      <dt>Results</dt>
                      <dd><time dateTime={contest.results}>{contest.resultsLabel}</time></dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Contest site</dt>
                    <dd>
                      <a href={contest.url} target="_blank" rel="noopener noreferrer">
                        Official site
                        <span className="sr-only"> for {contest.name} (opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                </dl>
                <ContestPhotos contest={contest} />
              </article>
            </li>
          ))}
        </ul>
      </article>
    </>
  );
}

export async function getStaticProps() {
  const gallery = await getPhotos();
  return { props: { contests: presentContests(gallery) } };
}

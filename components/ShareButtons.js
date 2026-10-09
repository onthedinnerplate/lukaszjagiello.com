import ShareButton from './ShareButton';
import BuyIcon from './BuyIcon';
import { alltrailsHref } from '@/lib/affiliate';
import { pinDescription, pinterestPinHref, toAbsoluteUrl } from '@/lib/shareUrls';
import gallery from '@/styles/Gallery.module.css';
import styles from '@/styles/ShareButtons.module.css';

function TrailMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19h18" />
      <path d="M5 19l5.2-9.2a1 1 0 0 1 1.75 0L14.5 15l1.7-2.8a1 1 0 0 1 1.72 0L21 19" />
    </svg>
  );
}

function PinMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 17.2V7.6h3.5a2.8 2.8 0 0 1 0 5.6H9.2" />
    </svg>
  );
}

/**
 * Pinterest, Share, Buy, then AllTrails when the photo is a hike, in the bottom-right corner.
 * Share and Buy are the Gallery controls. Pinterest is the same disc, and pins
 * this image. `pinUrl` is the photo page, or the article when the card belongs
 * to one. The description is the card title.
 */
export function PhotoCardActions({ title, shareUrl, pinUrl, mediaUrl, photo }) {
  const pageUrl = toAbsoluteUrl(pinUrl || shareUrl);
  const media = toAbsoluteUrl(mediaUrl || shareUrl);
  const href = pinterestPinHref({ pageUrl, mediaUrl: media, description: title || '' });
  const trailHref = alltrailsHref(photo);
  const stop = (event) => event.stopPropagation();

  return (
    <span className={gallery.cardActions} data-card-actions="true" onClick={stop}>
      <a
        className={gallery.share}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Pin ${title} on Pinterest`}
        title="Pin on Pinterest"
        onClick={stop}
      >
        <PinMark />
      </a>
      <ShareButton
        title={title}
        url={shareUrl}
        className={gallery.share}
        toastClassName={gallery.toast}
        wrapperClassName={gallery.shareWrap}
      />
      <BuyIcon photo={photo} className={gallery.share} />
      {trailHref ? (
        <a
          className={gallery.share}
          href={trailHref}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label="Find this trail on AllTrails"
          title="Find this trail on AllTrails"
          onClick={stop}
        >
          <TrailMark />
        </a>
      ) : null}
    </span>
  );
}

function PinIcon() {
  return (
    <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 17V7.8h3.15a2.85 2.85 0 0 1 0 5.7H10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Pinterest pin for the article itself, at the end of the story. */
export function ArticleShare({ title, excerpt, articlePath, mediaPath }) {
  const href = pinterestPinHref({
    pageUrl: toAbsoluteUrl(articlePath),
    mediaUrl: toAbsoluteUrl(mediaPath),
    description: pinDescription(title, excerpt),
  });
  return (
    <div className={styles.alignEnd}>
      <a
        className={styles.btn}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-share-pin="entry"
        aria-label={`Pin article: ${title}`}
      >
        <PinIcon />
        <span>Pin article</span>
      </a>
    </div>
  );
}

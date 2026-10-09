import ShareButton from './ShareButton';
import BuyIcon from './BuyIcon';
import gallery from '@/styles/Gallery.module.css';

/**
 * The only image overlay: Share and Buy.
 * Two round circles, bottom-right, at half opacity until hover or focus.
 */
export function PhotoCardActions({ title, shareUrl, photo }) {
  const stop = (event) => event.stopPropagation();
  const buyPhoto = photo ? { ...photo, title: photo.title || title } : { title };

  return (
    <span className={gallery.cardActions} data-card-actions="true" onClick={stop}>
      <ShareButton
        title={title}
        url={shareUrl}
        className={gallery.share}
        toastClassName={gallery.toast}
        wrapperClassName={gallery.shareWrap}
      />
      <BuyIcon photo={buyPhoto} className={gallery.share} />
    </span>
  );
}

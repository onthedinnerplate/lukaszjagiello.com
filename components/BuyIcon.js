import Link from 'next/link';

/** Round "buy a download" shortcut shown beside Share on every image card. */
export default function BuyIcon({ photo, className }) {
  const href = photo?.forSale && photo?.href ? `${photo.href}#buy` : '/contact';
  const label = photo?.title ? `Buy a download of ${photo.title}` : 'Buy a download';
  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      title="Buy a download"
      onClick={(event) => event.stopPropagation()}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    </Link>
  );
}

import { useEffect, useRef, useState } from 'react';

/**
 * Share a photo: native share sheet where available (phones, Safari, Edge),
 * otherwise copy the link and show a brief "Link copied" confirmation.
 */
export default function ShareButton({ title, url, className, toastClassName, wrapperClassName, label }) {
  const [state, setState] = useState(null); // null | 'copied' | 'failed'
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (next) => {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState(null), 1800);
  };

  const onClick = async (e) => {
    e.stopPropagation();
    const href = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const data = { title, text: title, url: href };

    if (typeof navigator !== 'undefined' && navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return; // user dismissed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(href);
      flash('copied');
    } catch {
      flash('failed');
    }
  };

  return (
    <span
      className={wrapperClassName}
      style={{ position: wrapperClassName ? undefined : 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={`Share ${title}`}
        title="Share"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
        </svg>
        {label ? <span>{label}</span> : null}
      </button>
      <span role="status" aria-live="polite" className={toastClassName} data-show={state ? 'true' : 'false'}>
        {state === 'copied' ? 'Link copied' : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </span>
  );
}

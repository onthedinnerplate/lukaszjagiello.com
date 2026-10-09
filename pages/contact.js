import { useState } from 'react';
import { useRouter } from 'next/router';
import Seo from '@/components/Seo';
import JourneysHero from '@/components/JourneysHero';
import { getPhotos, heroNavCounts } from '@/lib/photo-data';
import { journeysThenGalleryPath } from '@/lib/categories';
import { validateContact, LIMITS } from '@/lib/contact';
import { graph, personNode, websiteNode, pageNode } from '@/lib/seo';
import { site } from '@/lib/site';
import styles from '@/styles/Page.module.css';

const meta = {
  path: '/contact',
  title: 'Contact',
  description: `Contact ${site.photographer} about prints, licensing and commissions. Email ${site.email} or use the contact form.`,
};

const FIELDS = ['name', 'email', 'message'];

export default function Contact({ navCounts }) {
  const { query } = useRouter();
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  // Status passed back by the no-JS fallback redirect.
  const fallback = query.status;

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const { errors: found, ok } = validateContact(data);
    setErrors(found);
    if (!ok) {
      const first = FIELDS.find((f) => found[f]);
      form.elements[first]?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus('sent');
        form.reset();
      } else {
        if (json.errors) setErrors(json.errors);
        setServerError(json.error || 'Please check the highlighted fields.');
        setStatus('error');
      }
    } catch {
      setServerError(`Network error. Please try again or email ${site.email}.`);
      setStatus('error');
    }
  }

  const fieldProps = (name) => ({
    id: name,
    name,
    'aria-required': true,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    onInput: () => errors[name] && setErrors((e) => ({ ...e, [name]: undefined })),
  });

  const errorText = (name) =>
    errors[name] ? (
      <p id={`${name}-error`} className={styles.fieldError}>
        {errors[name]}
      </p>
    ) : null;

  const announce =
    status === 'sent' || fallback === 'sent'
      ? { kind: 'success', text: 'Thank you — your message has been sent. I’ll get back to you soon.' }
      : status === 'error'
        ? { kind: 'error', text: serverError }
        : fallback === 'invalid'
          ? { kind: 'error', text: 'Please fill in your name, a valid email, and a message of at least 10 characters.' }
          : fallback === 'error'
            ? { kind: 'error', text: `Something went wrong. Please email ${site.email} directly.` }
            : null;

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        keywords={['hire a photographer', 'photo prints', 'image licensing']}
        jsonLd={graph(websiteNode(), personNode(), { ...pageNode('ContactPage', meta), mainEntity: { '@id': personNode()['@id'] } })}
      />
      {/* Slogan stays a paragraph: "Contact" remains the only h1. */}
      <JourneysHero
        headingAs="p"
        nav={{
          active: '',
          counts: navCounts,
          hrefFor: journeysThenGalleryPath,
          allLabel: 'Journeys',
          label: 'Contact categories',
          disableEmpty: true,
        }}
      />
      <article className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>Contact</h1>
          <p className={styles.lede}>
            Prints, licensing, commissions or just hello — send a message or email{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </header>

        <div role="status" aria-live="polite" aria-atomic="true" className={styles.statusRegion}>
          {status === 'sending' ? <p className="sr-only">Sending your message.</p> : null}
          {announce && <p className={announce.kind === 'success' ? styles.success : styles.errorBox}>{announce.text}</p>}
        </div>

        <form className={styles.form} action="/api/contact" method="post" noValidate onSubmit={onSubmit}>
          <p className={styles.formNote}>All fields are required.</p>

          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input {...fieldProps('name')} type="text" autoComplete="name" required maxLength={LIMITS.name} />
            {errorText('name')}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" required maxLength={LIMITS.email} />
            {errorText('email')}
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Message</label>
            <textarea {...fieldProps('message')} rows={7} required minLength={LIMITS.messageMin} maxLength={LIMITS.message} />
            {errorText('message')}
          </div>

          {/* Honeypot — hidden from people and assistive tech, catches naive bots. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button type="submit" className="button" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </article>
    </>
  );
}

export async function getStaticProps() {
  const photos = await getPhotos();
  return { props: { navCounts: heroNavCounts(photos) } };
}

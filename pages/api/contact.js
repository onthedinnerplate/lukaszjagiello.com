import { validateContact } from '@/lib/contact';

// PLACEHOLDER HANDLER — validates, filters spam, rate-limits, and returns
// success, but does not deliver mail yet. Wire `deliver()` to an email API
// (Resend, Postmark, SendGrid…) and set its key in Render env vars.
async function deliver({ name, email, message }) {
  // Example (Resend):
  //   await fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ from: 'site@lukaszjagiello.com', to: process.env.CONTACT_TO_EMAIL,
  //                            reply_to: email, subject: `Website enquiry from ${name}`, text: message }),
  //   });
  // Never log message content or the sender's address (PII).
  console.info(`[contact] placeholder: received message (${message.length} chars) — delivery not configured`);
}

export const config = { api: { bodyParser: { sizeLimit: '16kb' } } };

// Best-effort in-memory rate limit: 5 submissions / 10 min / IP. Resets on
// restart and isn't shared across instances — fine for one Render instance.
// X-Forwarded-For can be spoofed by a determined spammer, so this is a speed
// bump, not a wall. When real delivery is wired up, add a CAPTCHA such as
// Cloudflare Turnstile (and allow challenges.cloudflare.com in the CSP).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // memory guard
  return recent.length > MAX_HITS;
}

// Same-origin check: browsers send Origin on POST; it must match the Host we
// were reached on. Works for the apex domain, onrender.com and localhost alike.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients / very old browsers
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Reject cross-site form posts (basic CSRF / drive-by spam guard).
  if (!sameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const wantsJson = (req.headers['content-type'] || '').includes('application/json');
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  const respond = (status, payload, redirectStatus) => {
    // No-JS fallback: a plain HTML form POST gets redirected back to the page.
    if (!wantsJson) return res.redirect(303, `/contact?status=${redirectStatus}`);
    return res.status(status).json(payload);
  };

  if (rateLimited(ip)) {
    return respond(429, { ok: false, error: 'Too many messages. Please try again in a few minutes.' }, 'error');
  }

  // Honeypot: real users never see or fill the "website" field.
  if (body.website) return respond(200, { ok: true }, 'sent');

  const { values, errors, ok } = validateContact(body);
  if (!ok) return respond(400, { ok: false, errors }, 'invalid');

  try {
    await deliver(values);
    return respond(200, { ok: true }, 'sent');
  } catch (err) {
    console.error('[contact] delivery failed:', err?.message);
    return respond(502, { ok: false, error: 'Sorry, your message could not be sent. Please email us directly.' }, 'error');
  }
}

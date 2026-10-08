// Minimal Stripe REST client (server-only). No SDK dependency: the two calls we
// need are plain HTTPS. Stripe's API takes application/x-www-form-urlencoded
// bodies with bracket notation for nested fields (line_items[0][price_data][…]).

const API = 'https://api.stripe.com/v1';

function secretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return key;
}

/** Flatten a nested object into Stripe's bracket form encoding. Exported for tests. */
export function formEncode(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => formEncode(typeof item === 'object' ? item : { [i]: item }, typeof item === 'object' ? `${key}[${i}]` : key, out));
    else if (typeof v === 'object') formEncode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function call(method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      'Stripe-Version': '2024-06-20',
    },
    body: body ? formEncode(body).toString() : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `Stripe ${method} ${endpoint} failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.stripe = json?.error;
    throw err;
  }
  return json;
}

export const createCheckoutSession = (params) => call('POST', '/checkout/sessions', params);
export const retrieveCheckoutSession = (id) => call('GET', `/checkout/sessions/${encodeURIComponent(id)}`);

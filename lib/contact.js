// Shared by the contact form (client) and /api/contact (server) so both
// enforce identical rules. Server-side validation is the one that counts.
export const LIMITS = { name: 100, email: 254, message: 5000, messageMin: 10 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact({ name = '', email = '', message = '' } = {}) {
  const values = {
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
  };
  const errors = {};
  if (!values.name) errors.name = 'Please enter your name.';
  else if (values.name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;

  if (!values.email) errors.email = 'Please enter your email address.';
  else if (values.email.length > LIMITS.email || !EMAIL_RE.test(values.email))
    errors.email = 'Please enter a valid email address, like name@example.com.';

  if (!values.message) errors.message = 'Please enter a message.';
  else if (values.message.length < LIMITS.messageMin)
    errors.message = `Message must be at least ${LIMITS.messageMin} characters.`;
  else if (values.message.length > LIMITS.message)
    errors.message = `Message must be ${LIMITS.message} characters or fewer.`;

  return { values, errors, ok: Object.keys(errors).length === 0 };
}

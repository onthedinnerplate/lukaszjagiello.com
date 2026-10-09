// AES-256-GCM for paid downloads. The repo stores ciphertext only.
//
// On-disk layout of private/downloads/NN/<tier>.jpg.enc:
//   bytes 0..11   random 12-byte IV
//   bytes 12..27  16-byte GCM auth tag
//   bytes 28..    ciphertext (same length as the JPEG)
//
// The key is DOWNLOAD_FILES_KEY: 32 raw bytes, base64. It is read at request
// time and never written, logged, or sent to the client. Importing this module
// must succeed when the variable is unset so `next build` still works.

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

export const IV_LEN = 12;
export const TAG_LEN = 16;
export const ENC_OVERHEAD = IV_LEN + TAG_LEN;

/** 32-byte key, or null when the env var is missing or not 32 bytes. */
export function downloadKey() {
  const raw = process.env.DOWNLOAD_FILES_KEY;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const key = Buffer.from(trimmed, 'base64');
  return key.length === 32 ? key : null;
}

function noKey() {
  const err = new Error('DOWNLOAD_FILES_KEY is not set');
  err.code = 'NO_KEY';
  return err;
}

function decryptFailed() {
  const err = new Error('decrypt failed');
  err.code = 'DECRYPT_FAILED';
  return err;
}

/** Encrypt a JPEG. Pass the key explicitly from scripts; the API uses the env var. */
export function encryptDownload(plain, key = downloadKey()) {
  if (!key) throw noKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

/** Decrypt a .jpg.enc buffer. Auth failure throws a generic error. */
export function decryptDownload(enc, key = downloadKey()) {
  if (!key) throw noKey();
  if (!Buffer.isBuffer(enc) || enc.length <= ENC_OVERHEAD) throw decryptFailed();
  const iv = enc.subarray(0, IV_LEN);
  const tag = enc.subarray(IV_LEN, ENC_OVERHEAD);
  const data = enc.subarray(ENC_OVERHEAD);
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  } catch {
    throw decryptFailed();
  }
}

/**
 * Bytes of a paid JPEG for maintainer scripts (fulls, thumbs, hero).
 * Uses a local plaintext file when one is present, otherwise decrypts .jpg.enc.
 * Returns null when neither file exists.
 */
export function readDownloadPlaintext(jpgPath) {
  if (existsSync(jpgPath)) return readFileSync(jpgPath);
  const encPath = `${jpgPath}.enc`;
  if (!existsSync(encPath)) return null;
  return decryptDownload(readFileSync(encPath));
}

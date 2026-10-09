// Replace plaintext paid downloads with AES-256-GCM ciphertext.
//
//   DOWNLOAD_FILES_KEY=<base64 32-byte key> npm run encrypt-downloads
//
// For each private/downloads/NN/{1080,2k,full}.jpg, writes NN/<tier>.jpg.enc
// (12-byte IV + 16-byte GCM tag + ciphertext) and deletes the .jpg only after
// a round-trip decrypt matches. The key is read from the environment and is
// never printed. Safe to re-run: directories that only have .enc files are skipped.

import { timingSafeEqual } from 'node:crypto';
import { readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { decryptDownload, downloadKey, encryptDownload } from '../lib/download-crypto.js';

const TIERS = ['1080.jpg', '2k.jpg', 'full.jpg'];
const root = path.join(process.cwd(), 'private', 'downloads');

const key = downloadKey();
if (!key) {
  console.error('DOWNLOAD_FILES_KEY must be set to a base64-encoded 32-byte key');
  process.exit(1);
}

const entries = await readdir(root, { withFileTypes: true });
let encrypted = 0;
let encBytes = 0;
let removed = 0;
let failed = 0;

for (const dirent of entries) {
  if (!dirent.isDirectory() || !/^\d{2}$/.test(dirent.name)) continue;
  for (const tier of TIERS) {
    const jpg = path.join(root, dirent.name, tier);
    let plain;
    try {
      plain = await readFile(jpg);
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      failed++;
      console.error(`read failed: ${dirent.name}/${tier}`);
      continue;
    }

    const encPath = `${jpg}.enc`;
    const tmp = `${encPath}.tmp`;
    try {
      const enc = encryptDownload(plain, key);
      const back = decryptDownload(enc, key);
      if (back.length !== plain.length || !timingSafeEqual(back, plain)) {
        throw new Error('round-trip mismatch');
      }
      await writeFile(tmp, enc);
      const stored = await readFile(tmp);
      const storedPlain = decryptDownload(stored, key);
      if (storedPlain.length !== plain.length || !timingSafeEqual(storedPlain, plain)) {
        throw new Error('round-trip mismatch');
      }
      await rename(tmp, encPath);
      await unlink(jpg);
      encrypted++;
      removed++;
      encBytes += enc.length;
      console.log(`encrypted ${dirent.name}/${tier}`);
    } catch {
      failed++;
      console.error(`encrypt failed: ${dirent.name}/${tier}`);
      await unlink(tmp).catch(() => {});
    }
  }
}

const mb = (encBytes / (1024 * 1024)).toFixed(1);
console.log(`\n${encrypted} files encrypted, ${removed} plaintext files removed, ${mb} MB ciphertext.`);
if (failed) {
  console.error(`${failed} files failed; plaintext was left in place for those.`);
  process.exit(1);
}

# Paid downloads: NN/{1080,2k,full}.jpg.enc
#
# AES-256-GCM. Layout: 12-byte IV, 16-byte auth tag, ciphertext.
# Decrypted only by /api/download when DOWNLOAD_FILES_KEY is set on the server.
#
# Generate plaintext with: npm run downloads -- --source=<folder of originals>
# Then: npm run encrypt-downloads
#
# Plaintext *.jpg is gitignored and must not be committed.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'crypto';
import { encrypt, decrypt } from '../src/lib/encryption';

describe('encryption: AES-256-GCM token encryption', () => {
    // Generate a valid 32-byte (64 hex characters) test key
    const validTestKey = randomBytes(32).toString('hex');

    it('successfully encrypts and decrypts a plain text string', () => {
        const originalEnvKey = process.env.ENCRYPTION_KEY;
        process.env.ENCRYPTION_KEY = validTestKey;

        try {
            const secretData = 'my-oauth-access-token-12345';
            const encrypted = encrypt(secretData);

            assert.notEqual(encrypted, secretData);
            assert.equal(encrypted.split(':').length, 3);

            const decrypted = decrypt(encrypted);
            assert.equal(decrypted, secretData);
        } finally {
            process.env.ENCRYPTION_KEY = originalEnvKey;
        }
    });

    it('successfully performs roundtrip for JSON serialized OAuth tokens', () => {
        const originalEnvKey = process.env.ENCRYPTION_KEY;
        process.env.ENCRYPTION_KEY = validTestKey;

        try {
            const tokenPayload = JSON.stringify({
                access_token: 'ya29.a0AfH6SM...',
                refresh_token: '1//0gJ78...',
                expiry_date: 1718000000000,
                token_type: 'Bearer',
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
            });

            const encrypted = encrypt(tokenPayload);
            const decrypted = decrypt(encrypted);

            assert.equal(decrypted, tokenPayload);
            const parsed = JSON.parse(decrypted);
            assert.equal(parsed.token_type, 'Bearer');
        } finally {
            process.env.ENCRYPTION_KEY = originalEnvKey;
        }
    });

    it('throws when ENCRYPTION_KEY is missing or invalid length', () => {
        const originalEnvKey = process.env.ENCRYPTION_KEY;

        try {
            // Missing key
            delete process.env.ENCRYPTION_KEY;
            assert.throws(() => encrypt('test'), /ENCRYPTION_KEY must be a 64-character hex string/);

            // Too short key (16 bytes = 32 hex chars)
            process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef';
            assert.throws(() => encrypt('test'), /ENCRYPTION_KEY must be a 64-character hex string/);
        } finally {
            process.env.ENCRYPTION_KEY = originalEnvKey;
        }
    });

    it('throws when decrypting malformed ciphertext structure', () => {
        const originalEnvKey = process.env.ENCRYPTION_KEY;
        process.env.ENCRYPTION_KEY = validTestKey;

        try {
            assert.throws(() => decrypt('not-colon-separated'), /Invalid encrypted format/);
            assert.throws(() => decrypt('iv:only-two-parts'), /Invalid encrypted format/);
        } finally {
            process.env.ENCRYPTION_KEY = originalEnvKey;
        }
    });

    it('throws authentication error when ciphertext or auth tag is tampered with', () => {
        const originalEnvKey = process.env.ENCRYPTION_KEY;
        process.env.ENCRYPTION_KEY = validTestKey;

        try {
            const encrypted = encrypt('sensitive-value');
            const [iv, authTag, ciphertext] = encrypted.split(':');

            // Tamper with the ciphertext by flipping characters
            const tamperedCiphertext = ciphertext.slice(0, -2) + 'ff';
            const tampered = `${iv}:${authTag}:${tamperedCiphertext}`;

            assert.throws(() => decrypt(tampered));
        } finally {
            process.env.ENCRYPTION_KEY = originalEnvKey;
        }
    });
});

/**
 * Token Encryption Utility
 *
 * AES-256-GCM symmetric encryption for securely storing OAuth tokens.
 * The ENCRYPTION_KEY env var must be a 32-byte (64-char) hex string.
 *
 * Generate a new key with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;

function getKey(): Buffer {
    const hex = process.env.ENCRYPTION_KEY;
    if (!hex || hex.length !== 64) {
        throw new Error(
            'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
            'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    return Buffer.from(hex, 'hex');
}

/**
 * Encrypt a plain-text string.
 * @returns `iv:authTag:ciphertext` — all hex-encoded, colon-separated.
 */
export function encrypt(plaintext: string): string {
    const key = getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted.toString('hex'),
    ].join(':');
}

/**
 * Decrypt a previously encrypted string.
 * @param encrypted — `iv:authTag:ciphertext` (hex-encoded).
 */
export function decrypt(encrypted: string): string {
    const key = getKey();
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format — expected "iv:authTag:ciphertext".');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    if (iv.length !== IV_LENGTH) throw new Error('Invalid IV length.');
    if (authTag.length !== TAG_LENGTH) throw new Error('Invalid auth tag length.');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]).toString('utf8');
}

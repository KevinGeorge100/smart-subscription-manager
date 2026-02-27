'use server';

/**
 * SubZero — Gmail Sync Action (Focused)
 *
 * syncGmail(userId) — Reads the user's connected Gmail accounts from
 * Firestore, fetches the last 10 messages matching `label:INVOICE OR
 * label:RECEIPT`, runs each email body through the `extractSub` Genkit
 * parser, and saves any detected subscriptions to Firestore.
 *
 * This is a focused, single-responsibility complement to the broader
 * `syncSubscriptions` action in `gmail.ts` which scans 50 emails with
 * a wider keyword query.
 */

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { decrypt } from '@/lib/encryption';
import { google } from 'googleapis';
import { extractSub } from '@/lib/genkit/parser';
import { addSubscription } from './subscriptions';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredTokens {
    access_token: string | null;
    refresh_token: string | null;
    expiry_date: number | null;
    token_type: string | null;
    scope: string | null;
}

export interface SyncGmailResult {
    success: boolean;
    added: number;
    scanned: number;
    accountsScanned: number;
    error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build an authenticated Gmail API client from an encrypted token doc. */
function buildOAuthClient(userId: string, docId: string, encryptedTokens: string) {
    const tokens: StoredTokens = JSON.parse(decrypt(encryptedTokens));

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: tokens.access_token ?? undefined,
        refresh_token: tokens.refresh_token ?? undefined,
        expiry_date: tokens.expiry_date ?? undefined,
        token_type: tokens.token_type ?? undefined,
        scope: tokens.scope ?? undefined,
    });

    // Persist refreshed tokens automatically
    oauth2Client.on('tokens', async (newTokens) => {
        const updated: StoredTokens = {
            ...tokens,
            access_token: newTokens.access_token ?? tokens.access_token,
            expiry_date: newTokens.expiry_date ?? tokens.expiry_date,
            refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
        };
        const { encrypt } = await import('@/lib/encryption');
        const db = getFirestoreAdmin();
        await db
            .collection('users').doc(userId)
            .collection('connectedEmails').doc(docId)
            .update({ encryptedTokens: encrypt(JSON.stringify(updated)) });
    });

    return oauth2Client;
}

/** Decode Gmail base64url-encoded message body. */
function decodeBase64(encoded: string): string {
    return Buffer.from(
        encoded.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
    ).toString('utf-8');
}

/** Recursively pull plain-text content from MIME parts. */
function extractPlainText(
    parts: Array<{
        mimeType?: string | null;
        body?: { data?: string | null } | null;
        parts?: unknown[] | null;
    }> | null | undefined
): string {
    if (!parts) return '';
    for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
            return decodeBase64(part.body.data);
        }
        if (part.parts) {
            const nested = extractPlainText(part.parts as typeof parts);
            if (nested) return nested;
        }
    }
    return '';
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Fetches Gmail messages matching `label:INVOICE OR label:RECEIPT` from each
 * connected Gmail account, runs them through the Genkit `extractSub` parser,
 * and saves detected subscriptions to Firestore.
 *
 * @param userId          The Firebase Auth UID of the user initiating the sync.
 * @param afterTimestamp  When provided, only emails *after* this date are fetched
 *                        (incremental sync). Omit for a full historical scan.
 */
export async function syncGmail(
    userId: string,
    afterTimestamp?: Date
): Promise<SyncGmailResult> {
    if (!userId) {
        return { success: false, added: 0, scanned: 0, accountsScanned: 0, error: 'No userId provided.' };
    }

    const db = getFirestoreAdmin();

    // Load all connected Gmail accounts for this user
    const emailsSnap = await db
        .collection('users').doc(userId)
        .collection('connectedEmails')
        .get();

    if (emailsSnap.empty) {
        return {
            success: false,
            added: 0,
            scanned: 0,
            accountsScanned: 0,
            error: 'No Gmail accounts connected. Please connect a Gmail account first.',
        };
    }

    let totalScanned = 0;
    let totalAdded = 0;

    // Build Gmail search query — append `after:<epochSeconds>` for incremental syncs
    const baseQuery = 'label:INVOICE OR label:RECEIPT';
    const gmailQuery = afterTimestamp
        ? `${baseQuery} after:${Math.floor(afterTimestamp.getTime() / 1000)}`
        : baseQuery;

    await Promise.allSettled(
        emailsSnap.docs.map(async (accountDoc) => {
            const { email, encryptedTokens } = accountDoc.data() as {
                email: string;
                encryptedTokens: string;
            };

            try {
                const auth = buildOAuthClient(userId, accountDoc.id, encryptedTokens);
                const gmail = google.gmail({ version: 'v1', auth });

                // ── Fetch up to 10 invoice / receipt emails ────────────────
                const listRes = await gmail.users.messages.list({
                    userId: 'me',
                    q: gmailQuery,
                    maxResults: 10,
                });

                const messages = listRes.data.messages ?? [];
                if (messages.length === 0) return;

                // ── Process each message ───────────────────────────────────
                await Promise.allSettled(
                    messages.map(async (msg) => {
                        if (!msg.id) return;

                        const fullMsg = await gmail.users.messages.get({
                            userId: 'me',
                            id: msg.id,
                            format: 'full',
                        });

                        const payload = fullMsg.data.payload;
                        let body = '';

                        if (payload?.body?.data) {
                            body = decodeBase64(payload.body.data);
                        } else if (payload?.parts) {
                            body = extractPlainText(
                                payload.parts as Parameters<typeof extractPlainText>[0]
                            );
                        }

                        if (!body.trim()) return;

                        totalScanned++;

                        // ── Run single-email AI parser ─────────────────────
                        const extracted = await extractSub(body);
                        if (!extracted) return;

                        // ── Persist to Firestore ───────────────────────────
                        const result = await addSubscription(
                            userId,
                            {
                                name: extracted.name,
                                amount: extracted.amount,
                                billingCycle: extracted.billingCycle,
                                // Map to closest known category or fall back to Others
                                category: 'Others' as Category,
                                renewalDate: new Date(extracted.renewalDate),
                            },
                            'ai-detected'
                        );

                        if (result.success) totalAdded++;
                    })
                );

                // ── Update lastSyncedAt on the account doc ─────────────────
                await accountDoc.ref.update({
                    lastSyncedAt: new Date().toISOString(),
                    lastSyncCount: totalAdded,
                });
            } catch (err) {
                console.error(`[syncGmail] Error scanning account "${email}":`, err);
            }
        })
    );

    revalidatePath('/dashboard');

    return {
        success: true,
        added: totalAdded,
        scanned: totalScanned,
        accountsScanned: emailsSnap.size,
    };
}

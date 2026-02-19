'use server';

/**
 * Gmail Server Actions — Multi-Account Support
 *
 * getGmailConnectionStatus — returns all connected Gmail accounts for a user.
 * syncSubscriptions        — scans ALL connected Gmail inboxes and aggregates results.
 * disconnectGmail          — removes a specific connected Gmail account.
 */

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { decrypt } from '@/lib/encryption';
import { google } from 'googleapis';
import { detectSubscriptions } from '@/lib/genkit/flows/detect-subscriptions';
import { addSubscription } from './subscriptions';
import { revalidatePath } from 'next/cache';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredTokens {
    access_token: string | null;
    refresh_token: string | null;
    expiry_date: number | null;
    token_type: string | null;
    scope: string | null;
}

export interface ConnectedEmail {
    id: string;
    email: string;
    connectedAt: string;
    lastSyncedAt: string | null;
    lastSyncCount: number;
}

// ── Helper: build a Gmail client from a token document ────────────────────────

async function buildGmailClientFromDoc(
    userId: string,
    docId: string,
    encryptedTokens: string
) {
    const tokens: StoredTokens = JSON.parse(decrypt(encryptedTokens));

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing Google OAuth environment variables on the server.');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({
        access_token: tokens.access_token ?? undefined,
        refresh_token: tokens.refresh_token ?? undefined,
        expiry_date: tokens.expiry_date ?? undefined,
        token_type: tokens.token_type ?? undefined,
        scope: tokens.scope ?? undefined,
    });

    // Auto-refresh and persist new tokens when access_token expires
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

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

// ── Helper: decode Gmail base64url payload ────────────────────────────────────

function decodeBase64(encoded: string): string {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(normalized, 'base64').toString('utf-8');
}

// ── Helper: extract plain text from MIME parts ────────────────────────────────

function extractTextFromParts(
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
            const nested = extractTextFromParts(part.parts as typeof parts);
            if (nested) return nested;
        }
    }
    return '';
}

// ── Helper: scan one Gmail inbox ──────────────────────────────────────────────

async function scanGmailAccount(
    gmail: ReturnType<typeof google.gmail>,
    accountLabel: string
): Promise<string[]> {
    const query =
        '(invoice OR receipt OR subscription OR billed OR "payment confirmation") newer_than:30d';

    const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
    });

    const messages = listResponse.data.messages ?? [];
    if (messages.length === 0) return [];

    const emailTexts: string[] = [];

    await Promise.allSettled(
        messages.map(async (msg) => {
            if (!msg.id) return;

            const fullMsg = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full',
            });

            const payload = fullMsg.data.payload;
            let text = '';

            if (payload?.body?.data) {
                text = decodeBase64(payload.body.data);
            } else if (payload?.parts) {
                text = extractTextFromParts(
                    payload.parts as Parameters<typeof extractTextFromParts>[0]
                );
            }

            const subject =
                payload?.headers?.find((h) => h.name?.toLowerCase() === 'subject')?.value ?? '';

            if (text.trim()) {
                // Prefix with account so AI knows which inbox this came from
                emailTexts.push(`[Account: ${accountLabel}]\nSubject: ${subject}\n\n${text}`);
            }
        })
    );

    return emailTexts;
}

// ── Exported Server Actions ───────────────────────────────────────────────────

/**
 * Returns all Gmail accounts connected by this user.
 */
export async function getGmailConnectionStatus(userId: string): Promise<{
    connected: boolean;
    accounts: ConnectedEmail[];
}> {
    try {
        const db = getFirestoreAdmin();
        const snapshot = await db
            .collection('users').doc(userId)
            .collection('connectedEmails')
            .orderBy('connectedAt', 'asc')
            .get();

        if (snapshot.empty) return { connected: false, accounts: [] };

        const accounts: ConnectedEmail[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email as string,
            connectedAt: doc.data().connectedAt as string,
            lastSyncedAt: doc.data().lastSyncedAt as string | null,
            lastSyncCount: (doc.data().lastSyncCount as number) ?? 0,
        }));

        return { connected: true, accounts };
    } catch (error) {
        console.error('[getGmailConnectionStatus]', error);
        return { connected: false, accounts: [] };
    }
}

/**
 * Syncs ALL connected Gmail accounts for the user.
 * Scans each inbox, batches emails through Gemini AI, saves detected subscriptions.
 */
export async function syncSubscriptions(userId: string): Promise<{
    success: boolean;
    added?: number;
    scanned?: number;
    accountsScanned?: number;
    error?: string;
}> {
    try {
        const db = getFirestoreAdmin();
        const snapshot = await db
            .collection('users').doc(userId)
            .collection('connectedEmails')
            .get();

        if (snapshot.empty) {
            return { success: false, error: 'No Gmail accounts connected.' };
        }

        // ── Scan each account and collect all email texts ──────────────────────
        const allEmailTexts: string[] = [];

        await Promise.allSettled(
            snapshot.docs.map(async (doc) => {
                const { email, encryptedTokens } = doc.data() as {
                    email: string;
                    encryptedTokens: string;
                };

                const gmail = await buildGmailClientFromDoc(userId, doc.id, encryptedTokens);
                const texts = await scanGmailAccount(gmail, email);
                allEmailTexts.push(...texts);
            })
        );

        if (allEmailTexts.length === 0) {
            return {
                success: true,
                added: 0,
                scanned: 0,
                accountsScanned: snapshot.size,
            };
        }

        // ── Run Genkit AI extraction across all emails ─────────────────────────
        const detected = await detectSubscriptions(allEmailTexts);

        // ── Save each detected subscription ────────────────────────────────────
        let added = 0;
        await Promise.allSettled(
            detected.map(async (sub) => {
                const result = await addSubscription(
                    userId,
                    {
                        name: sub.name,
                        amount: sub.amount,
                        billingCycle: sub.billingCycle,
                        category: sub.category,
                        renewalDate: sub.renewalDate,
                    },
                    'ai-detected'
                );
                if (result.success) added++;
            })
        );

        // ── Update lastSyncedAt on each connected email doc ────────────────────
        const now = new Date().toISOString();
        await Promise.allSettled(
            snapshot.docs.map((doc) =>
                doc.ref.update({ lastSyncedAt: now, lastSyncCount: added })
            )
        );

        revalidatePath('/dashboard');

        return {
            success: true,
            added,
            scanned: allEmailTexts.length,
            accountsScanned: snapshot.size,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[syncSubscriptions]', error);
        return { success: false, error: message };
    }
}

/**
 * Removes a specific connected Gmail account for this user.
 */
export async function disconnectGmail(
    userId: string,
    accountId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const db = getFirestoreAdmin();
        await db
            .collection('users').doc(userId)
            .collection('connectedEmails').doc(accountId)
            .delete();

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[disconnectGmail]', error);
        return { success: false, error: message };
    }
}

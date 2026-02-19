/**
 * Gmail OAuth2 — Callback Handler (Multi-Account)
 *
 * GET /api/gmail/callback?code=<auth_code>&state=<userId>
 *
 * Exchanges the auth code for tokens, looks up the authenticated Gmail address
 * via the Google UserInfo API, encrypts the tokens, and persists them to
 * Firestore at: users/{userId}/connectedEmails/{docId}
 * (one document per Gmail account — supports multiple accounts per user)
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { encrypt } from '@/lib/encryption';

function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error(
            'Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI'
        );
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('state');

    // Handle user denying access
    const errorParam = searchParams.get('error');
    if (errorParam) {
        console.warn('[/api/gmail/callback] User denied access:', errorParam);
        return NextResponse.redirect(new URL('/dashboard?sync=denied', request.url));
    }

    if (!code || !userId) {
        return NextResponse.json(
            { error: 'Missing code or state (userId) from Google OAuth callback.' },
            { status: 400 }
        );
    }

    try {
        const oauth2Client = getOAuth2Client();

        // ── Exchange auth code for tokens ─────────────────────────────────────
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // ── Resolve the Gmail address of the account just connected ───────────
        const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2Api.userinfo.get();
        const gmailAddress = userInfo.email ?? 'unknown@gmail.com';

        // ── Encrypt the full token bundle ─────────────────────────────────────
        const tokenPayload = JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            token_type: tokens.token_type,
            scope: tokens.scope,
        });
        const encryptedTokens = encrypt(tokenPayload);

        // ── Persist to connectedEmails sub-collection ─────────────────────────
        // Each Gmail account is a separate document — enables multiple accounts.
        const db = getFirestoreAdmin();
        const emailsRef = db.collection('users').doc(userId).collection('connectedEmails');

        // Upsert by email address (avoid duplicates if user re-connects same account)
        const existing = await emailsRef.where('email', '==', gmailAddress).limit(1).get();
        if (!existing.empty) {
            await existing.docs[0].ref.update({
                encryptedTokens,
                updatedAt: new Date().toISOString(),
            });
        } else {
            await emailsRef.add({
                email: gmailAddress,
                encryptedTokens,
                connectedAt: new Date().toISOString(),
                lastSyncedAt: null,
                lastSyncCount: 0,
            });
        }

        console.log(`[/api/gmail/callback] Connected Gmail "${gmailAddress}" for user ${userId}`);

        return NextResponse.redirect(new URL('/dashboard?sync=connected', request.url));
    } catch (error) {
        console.error('[/api/gmail/callback] Token exchange failed:', error);
        return NextResponse.redirect(new URL('/dashboard?sync=error', request.url));
    }
}

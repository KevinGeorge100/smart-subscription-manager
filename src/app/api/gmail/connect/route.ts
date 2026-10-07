/**
 * Gmail OAuth2 — Initiate Connection
 *
 * GET /api/gmail/connect?userId=<uid>
 *
 * Builds a Google OAuth2 consent URL and redirects the user to it.
 * The userId is passed as the `state` param so the callback can identify
 * which Firestore user to write tokens to.
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { logger, requestIdFor, safeError } from '@/lib/logger';

/**
 * Resolves the OAuth2 redirect URI.
 * Priority:
 *   1. GOOGLE_REDIRECT_URI env var (if explicitly set to a non-localhost value in prod)
 *   2. Derived from the incoming request's origin (works on Vercel, localhost, any domain)
 */
function getRedirectUri(request: NextRequest): string {
    const envUri = process.env.GOOGLE_REDIRECT_URI;
    // Use the env var only when it is set AND doesn't point to localhost while
    // we are actually running in production.
    if (envUri && !envUri.includes('localhost')) {
        return envUri;
    }
    // Derive from the real request host. Force HTTPS unless running locally.
    const { host } = new URL(request.url);
    const actualProtocol = host.includes('localhost') ? 'http:' : 'https:';
    return `${actualProtocol}//${host}/api/gmail/callback`;
}

function getOAuth2Client(redirectUri: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            'Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET'
        );
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET(request: NextRequest) {
    const requestId = requestIdFor(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400, headers: { 'X-Request-ID': requestId } });
    }

    try {
        const redirectUri = getRedirectUri(request);
        const oauth2Client = getOAuth2Client(redirectUri);



        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',   // Ensures we get a refresh_token
            prompt: 'consent',         // Force re-consent to always get refresh_token
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
            state: userId,             // Echoed back in callback — used to resolve Firestore user
        });

        const response = NextResponse.redirect(authUrl);
        response.headers.set('X-Request-ID', requestId);
        return response;
    } catch (error) {
        logger.error('gmail', 'gmail_oauth_failed', requestId, { operation: 'connect', ...safeError(error) });
        return NextResponse.json(
            { error: 'Failed to initiate Gmail OAuth flow. Check server env vars.' },
            { status: 500, headers: { 'X-Request-ID': requestId } }
        );
    }
}

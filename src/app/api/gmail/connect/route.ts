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
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
    }

    try {
        const oauth2Client = getOAuth2Client();

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',   // Ensures we get a refresh_token
            prompt: 'consent',         // Force re-consent to always get refresh_token
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
            ],
            state: userId,             // Echoed back in callback — used to resolve Firestore user
        });

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('[/api/gmail/connect]', error);
        return NextResponse.json(
            { error: 'Failed to initiate Gmail OAuth flow. Check server env vars.' },
            { status: 500 }
        );
    }
}

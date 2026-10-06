/**
 * POST /api/chat
 *
 * Secured AI chat endpoint for the "Ask SubZero" feature.
 *
 * Auth:   Firebase ID token via `Authorization: Bearer <idToken>` header.
 * Body:   { query: string }
 * Returns: { answer: string, referencedSubs: string[] }
 *
 * Only lean subscription fields (name, amount, billingCycle, category) are
 * sent to the LLM — no raw emails, tokens, or personal identifiers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { askSubZero, type SubscriptionContext } from '@/lib/genkit/flows/chat';
import { verifyRequestAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    // ── 1. Authenticate via Firebase ID Token ──────────────────────────────────
    let uid: string;
    try {
        const authUser = await verifyRequestAuth(request);
        uid = authUser.uid;
    } catch {
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired ID token.' }, { status: 401 });
    }

    // ── 2. Parse and validate request body ────────────────────────────────────
    let query: string;
    try {
        const body = await request.json();
        query = typeof body?.query === 'string' ? body.query.trim() : '';
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (!query || query.length > 500) {
        return NextResponse.json(
            { error: 'Query must be between 1 and 500 characters.' },
            { status: 400 }
        );
    }

    // ── 3. Fetch lean subscription context from Firestore ─────────────────────
    const db = getFirestoreAdmin();
    const subsSnapshot = await db
        .collection('users')
        .doc(uid)
        .collection('subscriptions')
        .get();

    const subscriptions: SubscriptionContext[] = subsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            name: (data.name as string) ?? 'Unknown',
            amount: (data.amount as number) ?? 0,
            billingCycle: (data.billingCycle as 'monthly' | 'yearly') ?? 'monthly',
            category: (data.category as string) ?? 'Others',
        };
    });

    // ── 4. Run the Genkit AI flow ──────────────────────────────────────────────
    try {
        const result = await askSubZero(query, subscriptions);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[/api/chat] askSubZero flow error:', error);
        return NextResponse.json(
            { error: 'AI service encountered an error. Please try again.' },
            { status: 500 }
        );
    }
}

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
import { durationMs, logger, requestIdFor, safeError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const requestId = requestIdFor(request);
    const startedAt = performance.now();
    const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'X-Request-ID': requestId } });
    logger.info('ai', 'ai_request_started', requestId, { endpoint: 'chat' });
    // ── 1. Authenticate via Firebase ID Token ──────────────────────────────────
    let uid: string;
    try {
        const authUser = await verifyRequestAuth(request);
        uid = authUser.uid;
    } catch {
        logger.warn('ai', 'authentication_failed', requestId, { endpoint: 'chat', authenticated: false });
        return reply({ error: 'Unauthorized: Invalid or expired ID token.' }, 401);
    }

    // ── 2. Parse and validate request body ────────────────────────────────────
    let query: string;
    try {
        const body = await request.json();
        query = typeof body?.query === 'string' ? body.query.trim() : '';
    } catch {
        return reply({ error: 'Invalid JSON body.' }, 400);
    }

    if (!query || query.length > 500) {
        return reply({ error: 'Query must be between 1 and 500 characters.' }, 400);
    }

    // ── 3. Fetch lean subscription context from Firestore ─────────────────────
    try {
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
        const result = await askSubZero(query, subscriptions);
        logger.info('ai', 'ai_request_completed', requestId, { endpoint: 'chat', authenticated: true, durationMs: durationMs(startedAt) });
        return reply(result);
    } catch (error) {
        logger.error('ai', 'ai_request_failed', requestId, { endpoint: 'chat', authenticated: true, durationMs: durationMs(startedAt), ...safeError(error) });
        return reply({ error: 'AI service encountered an error. Please try again.' }, 500);
    }
}

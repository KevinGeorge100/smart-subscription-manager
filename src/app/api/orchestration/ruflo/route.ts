import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { RUFLO_WEBHOOK_SECRET } from '@/lib/env';
import { logError } from '@/lib/utils';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// ── Zod Schema ────────────────────────────────────────────────────────────────

const RuFloSubscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  currency: z.string(),
  billingCycle: z.enum(['monthly', 'yearly']),
  renewalDate: z.string()
});

const RuFloPayloadSchema = z.object({
  userId: z.string().min(1),
  subscriptions: z.array(RuFloSubscriptionSchema)
});

type RuFloPayload = z.infer<typeof RuFloPayloadSchema>;

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  const [scheme, token] = authHeader.split(' ');

  let secret: string;
  try {
    secret = RUFLO_WEBHOOK_SECRET();
  } catch (err) {
    logError('ruflo-webhook', err, { phase: 'env-read' });
    return NextResponse.json(
      { error: 'Webhook secret not configured on the server.' },
      { status: 500 }
    );
  }

  if (scheme !== 'Bearer' || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse & Validate Body ───────────────────────────────────────────────
  let payload: RuFloPayload;
  try {
    const raw = await req.json();
    const result = RuFloPayloadSchema.safeParse(raw);

    if (!result.success) {
      logError('ruflo-webhook', new Error('Schema validation failed'), {
        phase: 'parse',
        issues: result.error.flatten()
      });
      return NextResponse.json(
        {
          error: 'Bad Request',
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }
    payload = result.data;
  } catch (err) {
    logError('ruflo-webhook', err, { phase: 'parse' });
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // ── 3. Upsert Subscriptions into Firestore ─────────────────────────────────
  try {
    const { userId, subscriptions } = payload;
    const subsCollection = adminDb
      .collection('users')
      .doc(userId)
      .collection('subscriptions');

    const batch = adminDb.batch();
    const now = FieldValue.serverTimestamp();

    // The user requested to update existing ones based on the service name
    // To do this reliably in a batch without a pre-fetch query, we use the sanitized name as the document ID
    for (const sub of subscriptions) {
      // Create a deterministic ID from the subscription name (lowercase, alphanumeric only, dashes for spaces)
      const sanitizedNameId = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const docRef = subsCollection.doc(`ruflo-${sanitizedNameId}`);

      batch.set(
        docRef,
        {
          name: sub.name,
          amount: sub.amount,
          billingCycle: sub.billingCycle,
          category: 'Others', // Not provided in payload, keeping default
          renewalDate: new Date(sub.renewalDate),
          userId,
          source: 'ai-detected',
          verified: false,
          originalCurrency: sub.currency,
          amountInBaseCurrency: sub.amount, // Real conversion omitted for exact payload
          updatedAt: now,
        },
        { merge: true }
      );

      // Set createdAt only if the document doesn't exist yet
      batch.set(
        docRef,
        { createdAt: now },
        { merge: true }
      );
    }

    await batch.commit();

    // ── 4. Response Logic ─────────────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        message: 'Subscription data orchestrated successfully'
      },
      { status: 200 }
    );
  } catch (err) {
    logError('ruflo-webhook', err, {
      phase: 'firestore-write',
      userId: payload.userId,
      subscriptionCount: payload.subscriptions.length,
    });
    return NextResponse.json(
      { error: 'Failed to write subscriptions to the database.' },
      { status: 500 }
    );
  }
}

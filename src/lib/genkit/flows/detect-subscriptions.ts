/**
 * AI Flow: Detect Subscriptions
 *
 * Parses email data (from Gmail OAuth) to automatically detect
 * recurring subscription charges and suggest adding them.
 *
 * TODO: Wire up Genkit + Gemini when Gmail OAuth is implemented.
 */

import type { SubscriptionFormData } from '@/types';

export interface DetectedSubscription extends SubscriptionFormData {
    confidence: number;
    emailSubject?: string;
}

export async function detectSubscriptions(
    _emailData: unknown
): Promise<DetectedSubscription[]> {
    // ── Placeholder implementation ──────────────────────────
    // Replace with actual Genkit flow when Gmail OAuth is ready:
    //
    // const flow = defineFlow({ name: 'detectSubscriptions', ... });
    // return await flow(emailData);

    console.log('[detectSubscriptions] Placeholder — Gmail OAuth not yet configured.');
    return [];
}

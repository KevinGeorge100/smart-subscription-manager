'use server';

/**
 * Genkit AI Flow: Extract Subscriptions from Email Text
 *
 * Takes raw email body text, sends it to Gemini, and returns structured
 * subscription data found in those emails.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { SubscriptionFormData } from '@/types';
import { BILLING_CYCLES, CATEGORIES } from '@/types';

// ── Genkit Instance ──────────────────────────────────────────────────────────

const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash',
});

// ── Schemas ──────────────────────────────────────────────────────────────────

const EmailBatchInputSchema = z.object({
    emailTexts: z.array(z.string()).min(1).max(50),
});

const DetectedSubscriptionSchema = z.object({
    name: z.string(),
    amount: z.number().positive(),
    billingCycle: z.enum(BILLING_CYCLES),
    category: z.enum(CATEGORIES),
    renewalDate: z.string(), // ISO date string e.g. "2025-03-15"
    confidence: z.number().min(0).max(1),
    emailSubject: z.string().optional(),
});

const ExtractOutputSchema = z.object({
    subscriptions: z.array(DetectedSubscriptionSchema),
});

export interface DetectedSubscription extends SubscriptionFormData {
    confidence: number;
    emailSubject?: string;
}

// ── Flow ─────────────────────────────────────────────────────────────────────

const extractSubscriptionFlow = ai.defineFlow(
    {
        name: 'extractSubscriptionFlow',
        inputSchema: EmailBatchInputSchema,
        outputSchema: ExtractOutputSchema,
    },
    async ({ emailTexts }) => {
        const combinedText = emailTexts
            .map((text, i) => `--- Email ${i + 1} ---\n${text.slice(0, 2000)}`)
            .join('\n\n');

        const prompt = `You are a financial data extraction assistant. Analyze the following email texts and extract information about recurring subscription services or software.

For each subscription found, provide:
- name: The service or company name (e.g., "Netflix", "Spotify", "AWS")
- amount: The exact billed amount as a number (e.g., 9.99)
- billingCycle: Either "monthly" or "yearly"
- category: One of: "Streaming", "Software", "Cloud", "Education", "Utilities", "Others"
- renewalDate: The next billing/renewal date in ISO format YYYY-MM-DD. If only a billing date is mentioned (not renewal), add the billing cycle to that date. If unknown, use a date 30 days from today.
- confidence: A number 0-1 representing how confident you are this is a recurring subscription (not a one-time purchase)
- emailSubject: A brief description of what email this came from

Only include services that appear to be RECURRING subscriptions. Ignore one-time purchases, shipping notifications, and promotional emails.
If no subscriptions are found, return an empty array.

Return ONLY valid JSON matching this exact schema:
{ "subscriptions": [ { "name": "...", "amount": 0.00, "billingCycle": "monthly"|"yearly", "category": "...", "renewalDate": "YYYY-MM-DD", "confidence": 0.0, "emailSubject": "..." } ] }

Emails to analyze:
${combinedText}`;

        const { output } = await ai.generate({
            prompt,
            output: { schema: ExtractOutputSchema },
        });

        return output ?? { subscriptions: [] };
    }
);

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run the Genkit extraction flow on a batch of raw email texts.
 * Filters results to those with confidence >= 0.6.
 */
export async function detectSubscriptions(
    emailTexts: string[]
): Promise<DetectedSubscription[]> {
    if (!emailTexts.length) return [];

    try {
        const result = await extractSubscriptionFlow({ emailTexts });

        return result.subscriptions
            .filter((s) => s.confidence >= 0.6)
            .map((s) => ({
                name: s.name,
                amount: s.amount,
                billingCycle: s.billingCycle,
                category: s.category,
                renewalDate: new Date(s.renewalDate),
                confidence: s.confidence,
                emailSubject: s.emailSubject,
            }));
    } catch (error) {
        console.error('[detectSubscriptions] Genkit flow error:', error);
        return [];
    }
}

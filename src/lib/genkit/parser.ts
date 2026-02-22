'use server';

/**
 * SubZero AI Parser — Single-Email Subscription Extractor
 *
 * Exposes an `extractSub` Genkit flow that takes a single raw email body
 * string and returns structured subscription data:
 *   { name, amount, currency, billingCycle, renewalDate }
 *
 * Used as a composable primitive by sync-gmail.ts.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// ── Genkit Instance ────────────────────────────────────────────────────────────

const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash',
});

// ── Input / Output Schemas ────────────────────────────────────────────────────

const ExtractSubInputSchema = z.object({
    emailBody: z.string().min(1, 'Email body must not be empty'),
});

/** The structured subscription data returned by `extractSub`. */
export const ExtractSubOutputSchema = z.object({
    name: z.string().describe('The service or product name, e.g. "Netflix"'),
    amount: z.number().positive().describe('Billed amount as a positive number'),
    currency: z.string().length(3).describe('ISO 4217 currency code, e.g. "USD", "INR"'),
    billingCycle: z.enum(['monthly', 'yearly']).describe('Recurring billing frequency'),
    renewalDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
        .describe('Next renewal/billing date in ISO format'),
    confidence: z
        .number()
        .min(0)
        .max(1)
        .describe('Confidence score that this is a recurring subscription (0–1)'),
});

export type ExtractSubOutput = z.infer<typeof ExtractSubOutputSchema>;

/** Null output when no subscription is found in the email. */
const ExtractSubResultSchema = z.union([ExtractSubOutputSchema, z.null()]);

// ── Flow Definition ───────────────────────────────────────────────────────────

const extractSubFlow = ai.defineFlow(
    {
        name: 'extractSub',
        inputSchema: ExtractSubInputSchema,
        outputSchema: ExtractSubResultSchema,
    },
    async ({ emailBody }) => {
        const today = new Date().toISOString().split('T')[0];

        const prompt = `You are a financial data extraction AI. Analyze the following email body and determine if it contains a **recurring subscription charge or upcoming renewal**.

If a recurring subscription IS found, extract and return a single JSON object exactly matching this schema:
{
  "name": "<service or company name, e.g. Netflix>",
  "amount": <numeric charge amount, e.g. 9.99>,
  "currency": "<3-letter ISO 4217 currency code, e.g. USD, INR, EUR>",
  "billingCycle": "<'monthly' or 'yearly' only>",
  "renewalDate": "<next renewal date as YYYY-MM-DD. If only a billing date is mentioned, add one billing cycle to it. If unknown, use 30 days from today: ${today}>",
  "confidence": <float 0.0–1.0 reflecting certainty this is a RECURRING subscription>
}

If NO recurring subscription is found (e.g. one-time purchase, shipping notification, promotional email), return exactly: null

Rules:
- Return ONLY the JSON object or null — no extra text, no code fences.
- Amount must be a number, not a string.
- billingCycle must be exactly "monthly" or "yearly".
- confidence ≥ 0.7 means you are confident it is recurring.

Email body to analyze:
---
${emailBody.slice(0, 3000)}
---`;

        const { output } = await ai.generate({
            prompt,
            output: { schema: ExtractSubResultSchema },
        });

        return output ?? null;
    }
);

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Runs the `extractSub` Genkit flow on a single raw email body string.
 * Returns the extracted subscription data, or `null` if none found or
 * confidence is below the 0.65 threshold.
 *
 * @param emailBody  Raw plain-text or HTML body of a single email message.
 */
export async function extractSub(emailBody: string): Promise<ExtractSubOutput | null> {
    if (!emailBody.trim()) return null;

    try {
        const result = await extractSubFlow({ emailBody });
        if (!result) return null;
        // Filter out low-confidence hits
        if (result.confidence < 0.65) return null;
        return result;
    } catch (error) {
        console.error('[extractSub] Genkit flow error:', error);
        return null;
    }
}

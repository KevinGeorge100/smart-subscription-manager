'use server';

/**
 * AI Flow: Extract Subscriptions from Email Text (NATIVE REST API)
 *
 * Takes raw email body text, sends it directly to Gemini 1.5 Flash via REST,
 * and returns structured subscription data found in those emails.
 * Bypasses Genkit telemetry entirely for maximum Vercel edge stability.
 */

import type { SubscriptionFormData } from '@/types';

export interface DetectedSubscription extends SubscriptionFormData {
    confidence: number;
    emailSubject?: string;
}

/**
 * Run Gemini extraction on a batch of raw email texts.
 * Filters results to those with confidence >= 0.6.
 */
export async function detectSubscriptions(
    emailTexts: string[]
): Promise<DetectedSubscription[]> {
    if (!emailTexts.length) return [];

    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[detectSubscriptions] Missing GOOGLE_GENAI_API_KEY environment variable.');
        return [];
    }

    try {
        const CHUNK_SIZE = 15; // Process emails in batches to avoid payload limits
        const allSubscriptions: DetectedSubscription[] = [];

        for (let i = 0; i < emailTexts.length; i += CHUNK_SIZE) {
            const chunk = emailTexts.slice(i, i + CHUNK_SIZE);

            const combinedText = chunk
                .map((text, idx) => `--- Email ${idx + 1} ---\n${text.slice(0, 3000)}`)
                .join('\n\n');

            const prompt = `You are a financial data extraction assistant. Analyze the following email texts and extract information about recurring subscription services or software.

For each subscription found, provide:
- name: The service or company name (e.g., "Netflix", "Spotify", "AWS")
- amount: The exact billed amount as a number (e.g., 9.99)
- billingCycle: Either "monthly" or "yearly"
- category: One of: "Streaming", "Software", "Cloud", "Education", "Utilities", "Others"
- renewalDate: The next billing/renewal date in ISO format YYYY-MM-DD. If unknown, use a date 30 days from today.
- confidence: A number between 0 and 1 representing your confidence (e.g., 0.95).
- emailSubject: A brief description of the email's subject or context.

Return ONLY a valid JSON object matching exactly this schema and nothing else:
{ "subscriptions": [ { "name": "string", "amount": 0, "billingCycle": "monthly", "category": "Streaming", "renewalDate": "YYYY-MM-DD", "confidence": 0, "emailSubject": "string" } ] }`;

            try {
                console.log(`[detectSubscriptions] Sending ${chunk.length} emails natively to Gemini via REST API...`);

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt + '\n' + combinedText }] }],
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.1,
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[detectSubscriptions] Gemini API Error HTTP ${response.status}:`, errorText);
                    continue;
                }

                const data = await response.json();
                const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (rawContent) {
                    const parsed = JSON.parse(rawContent);
                    if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) {
                        console.log(`[detectSubscriptions] Gemini returned ${parsed.subscriptions.length} subscriptions in this batch.`);
                        allSubscriptions.push(...parsed.subscriptions);
                    }
                }
            } catch (chunkError: any) {
                console.error(`[detectSubscriptions] Error processing chunk ${i}-${i + CHUNK_SIZE}:`, chunkError.message);
            }
        }

        return allSubscriptions
            .filter((s) => s.confidence >= 0.6)
            .map((s) => ({
                name: s.name || 'Unknown',
                amount: Number(s.amount) || 0,
                billingCycle: s.billingCycle === 'yearly' ? 'yearly' : 'monthly',
                category: (s.category as any) || 'Others',
                renewalDate: new Date(s.renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
                confidence: Number(s.confidence) || 1,
                emailSubject: s.emailSubject || '',
            }));
    } catch (error: any) {
        console.error('[detectSubscriptions] Global AI generation error:', error.message);
        return [];
    }
}

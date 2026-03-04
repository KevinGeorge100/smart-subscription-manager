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
): Promise<{ data: DetectedSubscription[], debug: string }> {
    let debug = '';

    if (!emailTexts.length) return { data: [], debug: 'No emails provided.' };

    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { data: [], debug: 'Missing GOOGLE_GENAI_API_KEY environment var on server.' };
    }

    try {
        const CHUNK_SIZE = 15; // Process emails in batches to avoid payload limits
        const allSubscriptions: DetectedSubscription[] = [];

        for (let i = 0; i < emailTexts.length; i += CHUNK_SIZE) {
            const chunk = emailTexts.slice(i, i + CHUNK_SIZE);
            debug += `Batch ${i}-${i + CHUNK_SIZE} start. `;

            const combinedText = chunk
                .map((text, idx) => `--- Email ${idx + 1} ---\n${text.slice(0, 3000)}`)
                .join('\n\n');

            const prompt = `You are a financial data extraction assistant. Analyze the following email texts and extract information about recurring subscription services or software.

For each subscription found, provide:
- name: The service or company name
- amount: The exact billed amount as a number
- billingCycle: Either "monthly" or "yearly"
- category: One of: "Streaming", "Software", "Cloud", "Education", "Utilities", "Others"
- renewalDate: ISO format YYYY-MM-DD
- confidence: A number 0-1
- emailSubject: Brief email description.

Return ONLY a valid JSON object matching exactly this schema and nothing else:
{ "subscriptions": [ { "name": "string", "amount": 0, "billingCycle": "monthly", "category": "Streaming", "renewalDate": "YYYY-MM-DD", "confidence": 0, "emailSubject": "string" } ] }`;

            try {
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
                    debug += `HTTP ${response.status} Error: ${errorText.substring(0, 150)}... `;
                    continue;
                }

                const data = await response.json();
                const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (rawContent) {
                    debug += `RawContent: ${rawContent.substring(0, 60)}... `;
                    const cleanContent = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
                    const parsed = JSON.parse(cleanContent);
                    if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) {
                        allSubscriptions.push(...parsed.subscriptions);
                        debug += `Parsed ${parsed.subscriptions.length} subs. `;
                    } else {
                        debug += `No subs array in JSON. `;
                    }
                } else {
                    debug += `No rawContent returned. `;
                }
            } catch (chunkError: any) {
                debug += `Chunk error: ${chunkError.message}. `;
            }
        }

        const data = allSubscriptions
            .filter((s) => s.confidence >= 0.6)
            .map((s) => ({
                name: s.name || 'Unknown',
                amount: Number(s.amount) || 0,
                billingCycle: s.billingCycle === 'yearly' ? 'yearly' as const : 'monthly' as const,
                category: (s.category as any) || 'Others',
                renewalDate: new Date(s.renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
                confidence: Number(s.confidence) || 1,
                emailSubject: s.emailSubject || '',
            }));

        return { data, debug };
    } catch (error: any) {
        return { data: [], debug: `Global error: ${error.message}` };
    }
}

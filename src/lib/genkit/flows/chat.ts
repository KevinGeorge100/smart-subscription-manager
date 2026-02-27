'use server';

/**
 * SubZero AI Chat Flow
 *
 * askSubZero(query, subscriptions) — Takes a user's natural-language query and a
 * lean snapshot of their subscriptions, then returns an AI-crafted answer with
 * a list of subscriptions it referenced.
 *
 * Only privacy-safe, token-efficient fields are sent to the LLM:
 *   { name, amount, billingCycle, category }
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// ── Genkit Instance ───────────────────────────────────────────────────────────

const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash',
});

// ── Schemas ───────────────────────────────────────────────────────────────────

/** Lean subscription context — only the fields needed by the AI. */
const SubscriptionContextSchema = z.object({
    name: z.string(),
    amount: z.number(),
    billingCycle: z.enum(['monthly', 'yearly']),
    category: z.string(),
});

export type SubscriptionContext = z.infer<typeof SubscriptionContextSchema>;

const ChatInputSchema = z.object({
    query: z.string().min(1).max(500),
    subscriptions: z.array(SubscriptionContextSchema).max(100),
});

const ChatOutputSchema = z.object({
    answer: z.string().describe('The AI response to the user query.'),
    referencedSubs: z
        .array(z.string())
        .describe('Names of subscriptions specifically mentioned in the answer.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are SubZero AI, a genius financial advisor built into the SubZero subscription manager. You have full visibility into the user's active subscriptions.

Your personality: precise, witty, and direct. You don't pad answers — you give actionable advice immediately.

Rules:
- When asked about spending, calculate exact totals from the provided data. All amounts are assumed to be in INR.
- When asked for advice, prioritize concrete savings (e.g. cancelling, switching billing cycles).
- Never make up subscriptions or amounts — only reference what is in the data.
- Keep answers to 2–4 sentences unless a detailed breakdown is truly needed.
- If the user asks something unrelated to finances or subscriptions, gently redirect them.
- Respond in the referencedSubs field with the exact names of any subscriptions you specifically mentioned.`;

// ── Flow ──────────────────────────────────────────────────────────────────────

const askSubZeroFlow = ai.defineFlow(
    {
        name: 'askSubZero',
        inputSchema: ChatInputSchema,
        outputSchema: ChatOutputSchema,
    },
    async ({ query, subscriptions }) => {
        const subList =
            subscriptions.length === 0
                ? 'No subscriptions found.'
                : subscriptions
                    .map(
                        (s) =>
                            `- ${s.name} | ₹${s.amount} | ${s.billingCycle} | ${s.category}`
                    )
                    .join('\n');

        const prompt = `${SYSTEM_PROMPT}

--- USER'S ACTIVE SUBSCRIPTIONS ---
${subList}
------------------------------------

User query: "${query}"

Respond with a JSON object matching: { "answer": "<your response>", "referencedSubs": ["<sub name>", ...] }`;

        const { output } = await ai.generate({
            prompt,
            output: { schema: ChatOutputSchema },
        });

        return (
            output ?? {
                answer: "I'm having trouble processing that right now. Please try again.",
                referencedSubs: [],
            }
        );
    }
);

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Ask SubZero AI a question about the user's subscriptions.
 *
 * @param query          The user's natural-language question.
 * @param subscriptions  Lean subscription context (name, amount, billingCycle, category).
 */
export async function askSubZero(
    query: string,
    subscriptions: SubscriptionContext[]
): Promise<ChatOutput> {
    try {
        return await askSubZeroFlow({ query, subscriptions });
    } catch (error) {
        console.error('[askSubZero] Genkit flow error:', error);
        return {
            answer: "I ran into an issue processing your request. Please try again in a moment.",
            referencedSubs: [],
        };
    }
}

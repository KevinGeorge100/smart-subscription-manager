'use server';
/**
 * @fileOverview Generates AI-powered insights for user subscriptions.
 *
 * - generateAIInsights - A function that analyzes subscriptions and provides actionable advice.
 * - AIInsightsInputSchema - The input type for the generateAIInsights function.
 * - AIInsightsOutputSchema - The return type for the generateAIInsights function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SubscriptionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  amount: z.number(),
  billingCycle: z.enum(['monthly', 'yearly']),
  // The date can come in as a string or Date, so we'll transform it.
  renewalDate: z.union([z.date(), z.string()]).transform((val) => new Date(val).toISOString()),
  userId: z.string().optional(),
  reminderSentAt: z.any().optional(),
});

export const AIInsightsInputSchema = z.object({
  subscriptions: z.array(SubscriptionSchema),
});
export type AIInsightsInput = z.infer<typeof AIInsightsInputSchema>;

export const AIInsightsOutputSchema = z.string();
export type AIInsightsOutput = z.infer<typeof AIInsightsOutputSchema>;

const insightsPrompt = ai.definePrompt(
  {
    name: 'subscriptionInsightsPrompt',
    input: { schema: AIInsightsInputSchema },
    output: { schema: AIInsightsOutputSchema },
    prompt: `
You are a financial assistant helping users manage subscriptions.

Analyze the following subscriptions and generate 3–5 short, actionable insights.
Focus on:
- High spending patterns
- Redundant subscriptions
- Risky upcoming renewals
- Cost optimization suggestions

Use a friendly, clear tone.
Do NOT mention AI, ML, or models.
Do NOT repeat raw data.
Do NOT give generic advice.
Format your output as a single string with each insight on a new line, prefixed with a relevant emoji.

Subscriptions:
{{{json subscriptions}}}
`,
    config: {
      temperature: 0.4,
    },
  },
);

const generateAIInsightsFlow = ai.defineFlow(
  {
    name: 'generateAIInsightsFlow',
    inputSchema: AIInsightsInputSchema,
    outputSchema: AIInsightsOutputSchema,
  },
  async ({ subscriptions }) => {
    const response = await insightsPrompt({ subscriptions });
    return response.output || "Could not generate insights at this time.";
  }
);


export async function generateAIInsights(input: AIInsightsInput): Promise<AIInsightsOutput> {
  return generateAIInsightsFlow(input);
}

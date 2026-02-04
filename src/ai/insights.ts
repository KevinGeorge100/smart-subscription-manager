'use server';
/**
 * @fileOverview Generates AI-powered insights for user subscriptions.
 *
 * - generateAIInsights - A function that analyzes subscriptions and provides actionable advice.
 */
import { ai } from '@/ai/genkit';
import {
  AIInsightsInputSchema,
  AIInsightsOutputSchema,
  type AIInsightsInput,
  type AIInsightsOutput,
} from '@/lib/ai-insights-schema';

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
Do NOT repeat raw data or raw numbers excessively.
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

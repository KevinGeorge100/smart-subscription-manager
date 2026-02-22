/**
 * AI Flow: Analyze Spending
 *
 * Accepts a user's subscription list and returns AI-generated insights
 * about spending patterns, potential savings, and recommendations.
 *
 * TODO: Wire up Genkit + Gemini when API keys are configured.
 */

import type { Subscription, AIAnalysisResult, AIInsight } from '@/types';

export async function analyzeSpending(
    subscriptions: Subscription[]
): Promise<AIAnalysisResult> {
    // ── Placeholder implementation ──────────────────────────
    // Replace with actual Genkit flow when ready:
    //
    // const flow = defineFlow({ name: 'analyzeSpending', ... });
    // return await flow(subscriptions);

    const totalMonthly = subscriptions.reduce((sum, sub) => {
        return sum + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount);
    }, 0);

    const insights: AIInsight[] = [];

    if (totalMonthly > 100) {
        insights.push({
            title: 'High Monthly Spend Detected',
            summary: `You're spending ₹${totalMonthly.toFixed(2)}/month on subscriptions. Consider reviewing services you rarely use.`,
            type: 'warning',
            confidence: 0.85,
        });
    }

    const streamingCount = subscriptions.filter(s => s.category === 'Streaming').length;
    if (streamingCount > 2) {
        insights.push({
            title: 'Streaming Service Fatigue',
            summary: `You have ${streamingCount} active streaming services. Consider canceling 1-2 to save up to ₹${(totalMonthly * 0.2).toFixed(0)}/mo.`,
            type: 'kill',
            confidence: 0.82,
        });
    }

    // Detect Duplicates
    const counts: Record<string, number> = {};
    subscriptions.forEach(s => {
        const name = s.name.toLowerCase().trim();
        counts[name] = (counts[name] || 0) + 1;
    });

    Object.entries(counts).forEach(([name, count]) => {
        if (count > 1) {
            insights.push({
                title: `Duplicate Detected: ${name}`,
                summary: `You appear to have ${count} active subscriptions for "${name}". This might be redundant or an error.`,
                type: 'kill',
                confidence: 0.95,
            });
        }
    });

    if (insights.length === 0) {
        insights.push({
            title: 'Looking Good!',
            summary: 'Your subscription spending appears well-optimized. Keep it up!',
            type: 'tip',
            confidence: 0.9,
        });
    }

    return {
        insights,
        estimatedMonthlySavings: totalMonthly > 100 ? totalMonthly * 0.15 : 0,
        analyzedAt: new Date(),
    };
}

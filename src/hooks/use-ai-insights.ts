'use client';

import { useState, useEffect } from 'react';
import { Subscription, AIAnalysisResult } from '@/types';
import { analyzeSpending } from '@/lib/genkit/flows/analyze-spending';

export function useAIInsights(subscriptions: Subscription[]) {
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (subscriptions.length === 0) {
            setAnalysis(null);
            return;
        }

        async function runAnalysis() {
            setIsLoading(true);
            try {
                const result = await analyzeSpending(subscriptions);
                setAnalysis(result);
            } catch (error) {
                console.error('[useAIInsights] Analysis failed:', error);
            } finally {
                setIsLoading(false);
            }
        }

        runAnalysis();
    }, [subscriptions]);

    return {
        insights: analysis?.insights || [],
        estimatedMonthlySavings: analysis?.estimatedMonthlySavings || 0,
        isLoading
    };
}

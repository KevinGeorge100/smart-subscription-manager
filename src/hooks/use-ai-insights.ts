'use client';

import { useState, useEffect, useRef } from 'react';
import type { Subscription, AIAnalysisResult } from '@/types';

/**
 * useAIInsights — Fetches AI-generated spending insights via the server API.
 *
 * Uses the existing POST /api/ai/insights endpoint instead of importing
 * the Genkit flow directly, keeping a clean client/server boundary and
 * preventing Node.js-only modules from being bundled into client JS.
 *
 * Debounces 2 s after subscriptions settle to avoid hammering the AI
 * endpoint on every incremental Firestore update.
 */
export function useAIInsights(subscriptions: Subscription[]) {
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (subscriptions.length === 0) {
            setAnalysis(null);
            return;
        }

        // Clear any pending debounce on subscription changes
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/ai/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscriptions }),
                });
                if (!res.ok) throw new Error(`AI insights API returned ${res.status}`);
                const data = await res.json();
                setAnalysis({
                    insights: data.insights ?? [],
                    estimatedMonthlySavings: data.estimatedMonthlySavings ?? 0,
                    analyzedAt: new Date(),
                });
            } catch (error) {
                console.error('[useAIInsights] Analysis failed:', error);
            } finally {
                setIsLoading(false);
            }
        }, 2000); // 2-second debounce

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [subscriptions]);

    return {
        insights: analysis?.insights ?? [],
        estimatedMonthlySavings: analysis?.estimatedMonthlySavings ?? 0,
        isLoading,
    };
}

'use client';

import { useMemo } from 'react';
import type { Subscription, BurnDataPoint } from '@/types';
import { addMonths, subMonths, format, isSameMonth } from 'date-fns';
import { calculateOptimization, calculateAnnualSavings } from '@/lib/finance-utils';

export function useAnalytics(subscriptions: Subscription[]) {
    const now = new Date();
    const currentMonthLabel = format(now, 'MMM yy');

    const burnData: BurnDataPoint[] = useMemo(() => {
        const baseMonthlyCost = subscriptions.reduce((sum, sub) =>
            sum + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount), 0
        );

        const round = (n: number) => Math.round(n * 100) / 100;

        const yearlyHitForMonth = (targetDate: Date): number =>
            subscriptions
                .filter((s) => s.billingCycle === 'yearly' && isSameMonth(s.renewalDate, targetDate))
                .reduce((sum, s) => sum + s.amount, 0);

        const points: BurnDataPoint[] = [];

        for (let i = 5; i >= 1; i--) {
            const date = subMonths(now, i);
            points.push({
                month: format(date, 'MMM yy'),
                actual: round(baseMonthlyCost),
            });
        }

        points.push({
            month: currentMonthLabel,
            actual: round(baseMonthlyCost),
            projected: round(baseMonthlyCost),
        });

        for (let i = 1; i <= 6; i++) {
            const date = addMonths(now, i);
            const hit = yearlyHitForMonth(date);
            points.push({
                month: format(date, 'MMM yy'),
                projected: round(baseMonthlyCost + hit),
            });
        }

        return points;
    }, [subscriptions, currentMonthLabel]);

    const optimizedData = useMemo(
        () => calculateOptimization(subscriptions, burnData.map((p) => p.month)),
        [subscriptions, burnData]
    );

    const annualSavings = useMemo(() => calculateAnnualSavings(subscriptions), [subscriptions]);

    const burnDataWithOptimized: BurnDataPoint[] = useMemo(
        () => burnData.map((point, i) => ({ ...point, optimized: optimizedData[i]?.optimized })),
        [burnData, optimizedData]
    );

    return {
        burnData: burnDataWithOptimized,
        currentMonthLabel,
        annualSavings,
    };
}

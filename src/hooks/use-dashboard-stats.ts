'use client';

import { useMemo } from 'react';
import type { Subscription, DashboardStats } from '@/types';
import { differenceInDays } from 'date-fns';

export function useDashboardStats(subscriptions: Subscription[], isLoading: boolean) {
    return useMemo(() => {
        if (isLoading) return null;
        const now = new Date();

        const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
            const base = sub.amountInBaseCurrency ?? sub.amount;
            return sum + (sub.billingCycle === 'yearly' ? base / 12 : base);
        }, 0);

        return {
            totalMonthlySpend,
            totalYearlySpend: totalMonthlySpend * 12,
            activeCount: subscriptions.length,
            aiDetectedCount: subscriptions.filter((s) => s.source === 'ai-detected').length,
            upcomingRenewals: subscriptions.filter((s) => {
                const diff = differenceInDays(s.renewalDate, now);
                return diff >= 0 && diff <= 7;
            }).length,
        } as DashboardStats;
    }, [subscriptions, isLoading]);
}

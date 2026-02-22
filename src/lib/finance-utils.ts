/**
 * SubZero — Financial Utility Functions
 *
 * toINR()                — converts any currency amount to INR (hardcoded rates)
 * calculateOptimization() — builds the 12-month "Optimized Path" chart series,
 *                          showing projected spend if all monthly subs switch to
 *                          yearly billing (20% savings model).
 */

import type { BurnDataPoint, Subscription } from '@/types';
import { addMonths, subMonths, format, isSameMonth } from 'date-fns';

// ── Exchange Rates (hardcoded, INR base) ──────────────────────────────────────

export const EXCHANGE_RATES: Record<string, number> = {
    INR: 1,
    USD: 83,
    EUR: 90,
    GBP: 105,
    AUD: 54,
    CAD: 61,
    SGD: 62,
    JPY: 0.56,
    AED: 22.6,
};

/**
 * Converts an amount in the given currency to INR.
 * Falls back to treating unknown currencies as INR (rate = 1).
 */
export function toINR(amount: number, currency: string): number {
    const rate = EXCHANGE_RATES[currency.toUpperCase()] ?? 1;
    return Math.round(amount * rate * 100) / 100;
}

// ── Optimization Engine ───────────────────────────────────────────────────────

/**
 * Calculates the "Optimized Path" series for the 12-Month Predictive Burn chart.
 *
 * Model:
 *  - Monthly subscriptions that switch to yearly billing save 20%.
 *    Yearly equivalent monthly cost = (amount * 12 * 0.80) / 12 = amount * 0.80
 *  - Already-yearly subscriptions are unchanged.
 *  - The result replaces `projected` values with lower optimized values.
 *
 * @param subs  All active subscriptions (using amountInBaseCurrency for INR totals)
 * @param months The month labels array from the existing BurnDataPoint data, so
 *               the optimized series is perfectly aligned to the chart's x-axis.
 */
export function calculateOptimization(
    subs: Subscription[],
    months: string[]
): Pick<BurnDataPoint, 'month' | 'optimized'>[] {
    const now = new Date();

    // Monthly equivalent cost after optimization (per sub, in INR)
    const optimizedMonthlyBase = subs.reduce((sum, sub) => {
        const base = sub.amountInBaseCurrency ?? sub.amount;
        if (sub.billingCycle === 'monthly') {
            // 20% discount if switching to yearly
            return sum + base * 0.80;
        }
        // Yearly subs: already optimal, amortise to monthly
        return sum + base / 12;
    }, 0);

    const round = (n: number) => Math.round(n * 100) / 100;

    // Helper: extra one-time hit for yearly subs renewing in a target month
    const yearlyHitForMonth = (targetDate: Date): number =>
        subs
            .filter((s) => s.billingCycle === 'yearly' && isSameMonth(s.renewalDate, targetDate))
            .reduce((sum, s) => sum + (s.amountInBaseCurrency ?? s.amount), 0);

    return months.map((month, index) => {
        // Map month label back to an approximate date
        // months[5] = current month, months[6..11] = future
        const offset = index - 5; // negative = past, 0 = current, positive = future
        const date = offset >= 0 ? addMonths(now, offset) : subMonths(now, -offset);

        // Only show optimized on projected portion (current month onward)
        if (offset < 0) {
            return { month }; // past months: no optimized value
        }

        const hit = yearlyHitForMonth(date);
        return {
            month,
            optimized: round(optimizedMonthlyBase + hit),
        };
    });
}

// ── Savings Summary ───────────────────────────────────────────────────────────

/**
 * Computes total annual savings if all monthly subs switch to yearly.
 */
export function calculateAnnualSavings(subs: Subscription[]): number {
    return subs.reduce((sum, sub) => {
        if (sub.billingCycle !== 'monthly') return sum;
        const base = sub.amountInBaseCurrency ?? sub.amount;
        // Monthly cost * 12 vs yearly cost * 0.80
        return sum + base * 12 * 0.20;
    }, 0);
}

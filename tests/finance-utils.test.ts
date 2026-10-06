import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toINR, calculateAnnualSavings, calculateOptimization, EXCHANGE_RATES } from '../src/lib/finance-utils';
import type { Subscription } from '../src/types';

describe('finance-utils: toINR', () => {
    it('converts base INR with 1:1 rate', () => {
        assert.equal(toINR(1500, 'INR'), 1500);
    });

    it('converts foreign currencies using predefined rates', () => {
        assert.equal(toINR(10, 'USD'), 830);
        assert.equal(toINR(20, 'EUR'), 1800);
        assert.equal(toINR(10, 'GBP'), 1050);
    });

    it('handles lowercase and mixed-case currency codes', () => {
        assert.equal(toINR(10, 'usd'), 830);
        assert.equal(toINR(20, 'Eur'), 1800);
    });

    it('falls back to 1:1 rate for unknown currencies', () => {
        assert.equal(toINR(250, 'UNKNOWN_CURRENCY'), 250);
    });

    it('rounds results to 2 decimal places', () => {
        assert.equal(toINR(10.555, 'USD'), 876.07);
    });
});

describe('finance-utils: calculateAnnualSavings', () => {
    it('returns 0 when subscriptions list is empty', () => {
        assert.equal(calculateAnnualSavings([]), 0);
    });

    it('calculates 20% annual savings for monthly subscriptions', () => {
        const dummySubs: Subscription[] = [
            {
                id: 'sub-1',
                name: 'Netflix',
                amount: 1000,
                billingCycle: 'monthly',
                category: 'Streaming',
                renewalDate: new Date(),
                userId: 'user-1',
                source: 'manual',
                verified: true,
                originalCurrency: 'INR',
                amountInBaseCurrency: 1000,
            },
        ];
        // 1000 * 12 * 0.20 = 2400
        assert.equal(calculateAnnualSavings(dummySubs), 2400);
    });

    it('ignores yearly subscriptions since they already have annual pricing', () => {
        const dummySubs: Subscription[] = [
            {
                id: 'sub-1',
                name: 'AWS',
                amount: 12000,
                billingCycle: 'yearly',
                category: 'Cloud',
                renewalDate: new Date(),
                userId: 'user-1',
                source: 'manual',
                verified: true,
                originalCurrency: 'INR',
                amountInBaseCurrency: 12000,
            },
        ];
        assert.equal(calculateAnnualSavings(dummySubs), 0);
    });

    it('calculates combined savings for mixed billing cycles and uses amount fallback', () => {
        const dummySubs: Subscription[] = [
            {
                id: 'sub-1',
                name: 'Spotify',
                amount: 200,
                billingCycle: 'monthly',
                category: 'Streaming',
                renewalDate: new Date(),
                userId: 'user-1',
                source: 'manual',
                verified: true,
                originalCurrency: 'INR',
                amountInBaseCurrency: 200,
            },
            {
                id: 'sub-2',
                name: 'GitHub Copilot',
                amount: 500,
                billingCycle: 'monthly',
                category: 'Software',
                renewalDate: new Date(),
                userId: 'user-1',
                source: 'manual',
                verified: true,
                originalCurrency: 'INR',
                amountInBaseCurrency: undefined as any, // tests amount fallback when base is undefined
            },
            {
                id: 'sub-3',
                name: 'Domain',
                amount: 1000,
                billingCycle: 'yearly',
                category: 'Utilities',
                renewalDate: new Date(),
                userId: 'user-1',
                source: 'manual',
                verified: true,
                originalCurrency: 'INR',
                amountInBaseCurrency: 1000,
            },
        ];
        // sub-1: 200 * 12 * 0.20 = 480
        // sub-2: amountInBaseCurrency is 0, falls back to 500 -> 500 * 12 * 0.20 = 1200
        // sub-3: yearly -> 0
        // total: 1680
        assert.equal(calculateAnnualSavings(dummySubs), 1680);
    });
});

describe('finance-utils: calculateOptimization', () => {
    const monthLabels = [
        'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', // Oct = index 5 (current month)
        'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr',
    ];

    it('does not include optimized values for past months (offset < 0)', () => {
        const result = calculateOptimization([], monthLabels);
        assert.equal(result.length, 12);
        // Past months 0..4 have only month label
        for (let i = 0; i < 5; i++) {
            assert.equal(result[i].optimized, undefined);
            assert.equal(result[i].month, monthLabels[i]);
        }
    });

    it('calculates optimized projection for current and future months', () => {
        const dummySubs: Subscription[] = [
            {
                id: 'sub-1',
                name: 'SaaS',
                amount: 1000,
                billingCycle: 'monthly',
                category: 'Software',
                renewalDate: new Date(),
                userId: 'user-1',
                source: 'manual',
                verified: true,
                originalCurrency: 'INR',
                amountInBaseCurrency: 1000,
            },
        ];
        const result = calculateOptimization(dummySubs, monthLabels);
        // For monthly subs, 1000 * 0.80 = 800
        for (let i = 5; i < 12; i++) {
            assert.equal(typeof result[i].optimized, 'number');
            assert.equal(result[i].optimized, 800);
        }
    });
});

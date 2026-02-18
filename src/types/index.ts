import { z } from 'zod';

// ──────────────────────────────────────────────
// User
// ──────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: Date;
}

// ──────────────────────────────────────────────
// Subscription
// ──────────────────────────────────────────────

export const BILLING_CYCLES = ['monthly', 'yearly'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const CATEGORIES = [
  'Streaming',
  'Software',
  'Cloud',
  'Education',
  'Utilities',
  'Others',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SOURCES = ['manual', 'ai-detected'] as const;
export type SubscriptionSource = (typeof SOURCES)[number];

/**
 * The canonical Subscription type used across the entire app.
 * Stored in Firestore at: users/{userId}/subscriptions/{id}
 */
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: Category;
  renewalDate: Date;
  userId: string;
  source: SubscriptionSource;
  reminderSentAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ──────────────────────────────────────────────
// Zod Schema — Add / Edit Form
// ──────────────────────────────────────────────

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'Subscription name is required').max(100),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero'),
  billingCycle: z.enum(BILLING_CYCLES, {
    errorMap: () => ({ message: 'Select a billing cycle' }),
  }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Select a category' }),
  }),
  renewalDate: z.coerce.date({ errorMap: () => ({ message: 'Select a renewal date' }) }),
});

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

// ──────────────────────────────────────────────
// Dashboard Stats
// ──────────────────────────────────────────────

export interface DashboardStats {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  activeCount: number;
  aiDetectedCount: number;
  upcomingRenewals: number;
}

export interface SpendingTrendPoint {
  month: string;
  amount: number;
}

// ──────────────────────────────────────────────
// AI Insights (Genkit)
// ──────────────────────────────────────────────

export interface AIInsight {
  title: string;
  summary: string;
  type: 'saving' | 'warning' | 'tip';
  confidence: number; // 0–1
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  estimatedMonthlySavings: number;
  analyzedAt: Date;
}

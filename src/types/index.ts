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
  settings?: {
    notifications: {
      email: boolean;
      dashboard: boolean;
    };
  };
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
  /** True once the user has manually confirmed an AI-detected subscription. */
  verified: boolean;
  /** ISO 4217 currency code as received from the AI parser, e.g. "USD". */
  originalCurrency: string;
  /** Amount normalised to INR using hardcoded exchange rates. */
  amountInBaseCurrency: number;
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

/** One data point in the 12-Month Predictive Burn chart. */
export interface BurnDataPoint {
  /** Short month label, e.g. "Jan 26" */
  month: string;
  /** Actual spend (past months + current month). Undefined for future months. */
  actual?: number;
  /** Projected spend (current month onward). Undefined for purely past months. */
  projected?: number;
  /** Optimized projected spend if all monthly subs switch to yearly (20% saving). */
  optimized?: number;
}

// ──────────────────────────────────────────────
// AI Insights (Genkit)
// ──────────────────────────────────────────────

export interface AIInsight {
  title: string;
  summary: string;
  type: 'saving' | 'warning' | 'tip' | 'kill';
  confidence: number; // 0–1
}

// ──────────────────────────────────────────────
// AI Analysis Result
// ──────────────────────────────────────────────

export interface AIAnalysisResult {
  insights: AIInsight[];
  estimatedMonthlySavings: number;
  analyzedAt: Date;
}

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────

export type NotificationType = 'renewal' | 'saving' | 'warning' | 'info';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date | any; // allow Firestore Timestamps
  link?: string;
  metadata?: {
    subscriptionId?: string;
    amount?: number;
    daysLeft?: number;
  };
}

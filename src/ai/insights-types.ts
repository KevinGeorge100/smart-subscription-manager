'use server';
/**
 * @fileOverview Types and schemas for AI-powered subscription insights.
 */
import { z } from 'zod';

export const SubscriptionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  amount: z.number(),
  billingCycle: z.enum(['monthly', 'yearly']),
  // The date can come in as a string or Date, so we'll transform it.
  renewalDate: z.union([z.date(), z.string()]).transform((val) => new Date(val).toISOString()),
  userId: z.string().optional(),
  reminderSentAt: z.any().optional(),
});

export const AIInsightsInputSchema = z.object({
  subscriptions: z.array(SubscriptionSchema),
});
export type AIInsightsInput = z.infer<typeof AIInsightsInputSchema>;

export const AIInsightsOutputSchema = z.string();
export type AIInsightsOutput = z.infer<typeof AIInsightsOutputSchema>;

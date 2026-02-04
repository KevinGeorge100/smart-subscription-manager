
import { z } from "zod";

export const SubscriptionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  amount: z.number(),
  billingCycle: z.enum(["monthly", "yearly"]),
  renewalDate: z.string(), // Normalized to ISO string before being sent
  userId: z.string().optional(),
  reminderSentAt: z.any().optional(),
});

export const AIInsightsInputSchema = z.object({
  subscriptions: z.array(SubscriptionSchema),
});
export type AIInsightsInput = z.infer<typeof AIInsightsInputSchema>;

export const AIInsightsOutputSchema = z.string();
export type AIInsightsOutput = z.infer<typeof AIInsightsOutputSchema>;

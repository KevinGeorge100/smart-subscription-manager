'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, Flame } from "lucide-react";

type Subscription = {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: "monthly" | "yearly";
  renewalDate: Date;
};

type Insight = {
  id: string;
  type: "warning" | "info" | "suggestion";
  title: string;
  message: string;
};

function generateInsights(subscriptions: Subscription[]): Insight[] {
  if (!subscriptions.length) return [];

  const insights: Insight[] = [];

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
    return sum + (sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount);
  }, 0);

  /* 🔴 Insight 1: High-cost subscription */
  const mostExpensive = [...subscriptions].sort((a, b) => b.amount - a.amount)[0];
  if (mostExpensive) {
    insights.push({
      id: "high-cost",
      type: "warning",
      title: "High Cost Subscription",
      message: `${mostExpensive.name} costs ₹${mostExpensive.amount} per ${mostExpensive.billingCycle}. It is your most expensive subscription.`,
    });
  }

  /* 🔴 Insight 2: Category concentration */
  const categorySpend: Record<string, number> = {};
  subscriptions.forEach(sub => {
    const monthly = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
    categorySpend[sub.category] = (categorySpend[sub.category] || 0) + monthly;
  });

  const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const percent = Math.round((topCategory[1] / totalMonthlySpend) * 100);
    if (percent >= 40) {
      insights.push({
        id: "category-heavy",
        type: "info",
        title: "Spending Concentration",
        message: `${percent}% of your monthly spend goes to ${topCategory[0]} subscriptions.`,
      });
    }
  }

  /* 🔴 Insight 3: Multiple subscriptions in same category */
  const categoryCounts: Record<string, number> = {};
  subscriptions.forEach(sub => {
    categoryCounts[sub.category] = (categoryCounts[sub.category] || 0) + 1;
  });

  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (count >= 3) {
      insights.push({
        id: `duplicate-${category}`,
        type: "suggestion",
        title: "Possible Redundancy",
        message: `You have ${count} active subscriptions under ${category}. Consider consolidating.`,
      });
    }
  });

  return insights;
}

export default function AIInsightsPanel({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const insights = generateInsights(subscriptions);

  if (!insights.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🧠 Smart Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add subscriptions to unlock personalized insights.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Smart Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            {insight.type === "warning" && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {insight.type === "info" && <Flame className="h-5 w-5 text-orange-500" />}
            {insight.type === "suggestion" && <Lightbulb className="h-5 w-5 text-blue-500" />}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{insight.title}</p>
                <Badge variant="secondary">{insight.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{insight.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

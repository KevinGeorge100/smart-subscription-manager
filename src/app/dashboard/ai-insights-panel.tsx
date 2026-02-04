'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, PieChart } from "lucide-react";
import { ProcessedSubscription } from './page';
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Insight = {
  id: string;
  type: "warning" | "info" | "suggestion";
  title: string;
  message: string;
};

function generateInsights(subscriptions: ProcessedSubscription[]): Insight[] {
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
  if (topCategory && totalMonthlySpend > 0) {
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

const InsightIcon = ({ type }: { type: Insight['type'] }) => {
  const iconClasses = "h-6 w-6";
  const iconMap = {
    warning: <AlertTriangle className={cn(iconClasses, "text-destructive")} />,
    info: <PieChart className={cn(iconClasses, "text-amber-500")} />,
    suggestion: <Lightbulb className={cn(iconClasses, "text-primary")} />,
  };
  return iconMap[type];
};

export default function AIInsightsPanel({
  subscriptions,
}: {
  subscriptions: ProcessedSubscription[];
}) {
  const insights = generateInsights(subscriptions);
  const [aiText, setAiText] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (!subscriptions.length) {
      setAiText(null);
      return;
    };

    setLoadingAI(true);
    setAiText(null);
    
    const normalizedSubs = subscriptions.map(sub => ({
        ...sub,
        renewalDate: sub.renewalDate.toISOString(),
    }));

    fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptions: normalizedSubs }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch AI insights");
        return res.json();
      })
      .then(data => setAiText(data.insights))
      .catch((err) => {
        console.error("AI Insights fetch error:", err);
        setAiText("Could not load AI insights at this moment.");
      })
      .finally(() => setLoadingAI(false));
  }, [subscriptions]);


  if (!insights.length && subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            <span>Smart Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add some subscriptions to unlock personalized insights and an AI-powered summary.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          <span>Smart Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            {insights.map((insight) => (
            <div
                key={insight.id}
                className="flex items-start gap-4 rounded-lg border bg-background/50 p-4 transition-all hover:bg-accent"
            >
                <div className="mt-1">
                    <InsightIcon type={insight.type} />
                </div>
                <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">{insight.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
                </div>
            </div>
            ))}
        </div>
        
        <div className="rounded-lg border bg-background/50 p-4">
          <p className="mb-3 font-medium text-lg">🤖 AI Summary</p>

          {loadingAI && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
            </div>
          )}

          {!loadingAI && aiText && (
            <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
              {aiText.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">{line}</p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

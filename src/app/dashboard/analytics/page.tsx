'use client';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useAnalytics } from '@/hooks/use-analytics';
import { FinancialPulse } from '../components/financial-pulse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

export default function AnalyticsPage() {
    const { subscriptions, isLoading } = useSubscriptions();
    const { burnData, currentMonthLabel, annualSavings } = useAnalytics(subscriptions);

    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};
        subscriptions.forEach((sub) => {
            const amount = sub.amountInBaseCurrency ?? sub.amount;
            const monthly = sub.billingCycle === 'yearly' ? amount / 12 : amount;
            categories[sub.category] = (categories[sub.category] || 0) + monthly;
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [subscriptions]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Deep dive into your spending patterns and future forecasts.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <FinancialPulse
                        data={burnData}
                        currentMonth={currentMonthLabel}
                        annualSavings={annualSavings}
                    />
                </div>

                {/* Category Breakdown */}
                <Card className="glass border-border/40">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
                        <CardDescription>Monthly equivalent spend per category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoading ? (
                            <div className="h-full w-full animate-pulse bg-muted/20 rounded-lg" />
                        ) : categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Savings Potential Card */}
                <Card className="glass border-border/40 bg-gradient-to-br from-primary/5 to-purple-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Optimization Insights</CardTitle>
                        <CardDescription>How to reduce your monthly burn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                            <p className="text-sm font-medium text-emerald-400">Annual Savings Potential</p>
                            <p className="text-3xl font-bold text-emerald-500 mt-1">₹{annualSavings.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                By switching eligible monthly plans to annual billing.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Categories</p>
                            {categoryData.sort((a, b) => b.value - a.value).slice(0, 3).map((cat, i) => (
                                <div key={cat.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span>{cat.name}</span>
                                    </div>
                                    <span className="font-semibold">₹{cat.value.toFixed(0)}/mo</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

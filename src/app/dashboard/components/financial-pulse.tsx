'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SpendingTrendPoint } from '@/types';

interface FinancialPulseProps {
    data: SpendingTrendPoint[];
}

export function FinancialPulse({ data }: FinancialPulseProps) {
    return (
        <Card className="glass border-border/40">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Financial Pulse
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => `₹${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(222 47% 10%)',
                                    border: '1px solid hsl(215 28% 16%)',
                                    borderRadius: '0.5rem',
                                    color: 'hsl(210 40% 96%)',
                                }}
                                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Spending']}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="hsl(217 91% 60%)"
                                strokeWidth={2}
                                fill="url(#pulseGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

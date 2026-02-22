'use client';

/**
 * 12-Month Predictive Burn — SubZero Dashboard Chart
 *
 * Series:
 *  – Actual    : solid blue  — past 5 months + current month
 *  – Projected : dashed cyan — current month + next 6 months
 *  – Optimized : solid green [TOGGLE] — projected spend if all monthly subs
 *                switch to yearly billing (20% saving model)
 *
 * The Optimized line fades in/out via Framer Motion AnimatePresence.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { BurnDataPoint } from '@/types';

interface FinancialPulseProps {
    data: BurnDataPoint[];
    /** Short label of the current month, e.g. "Feb 26". Anchors the ReferenceLine. */
    currentMonth: string;
    /** Annual savings achievable by switching monthly subs to yearly (INR). */
    annualSavings?: number;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function BurnTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs">
            <p className="font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((entry) => (
                <p key={entry.name} style={{ color: entry.color }} className="capitalize leading-5">
                    {entry.name === 'actual'
                        ? 'Actual'
                        : entry.name === 'projected'
                            ? 'Projected'
                            : 'Optimized'}
                    : <span className="font-medium">₹{entry.value.toFixed(2)}</span>
                </p>
            ))}
        </div>
    );
}

// ── Chart Component ────────────────────────────────────────────────────────────

export function FinancialPulse({ data, currentMonth, annualSavings = 0 }: FinancialPulseProps) {
    const [showOptimized, setShowOptimized] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const totalProjected = data.reduce((sum, p) => sum + (p.projected ?? 0), 0);

    return (
        <Card className="glass border-border/40">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                            12-Month Predictive Burn
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                            Actual spend + 6-month AI projection based on active subscriptions
                        </CardDescription>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {/* Projected annual badge */}
                        {totalProjected > 0 && (
                            <div className="rounded-md bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-right">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Projected Annual</p>
                                <p className="text-sm font-bold text-cyan-400">₹{totalProjected.toFixed(0)}</p>
                            </div>
                        )}

                        {/* Optimized path toggle */}
                        <div className="flex items-center gap-2">
                            <Switch
                                id="optimized-toggle"
                                checked={showOptimized}
                                onCheckedChange={setShowOptimized}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                            <Label
                                htmlFor="optimized-toggle"
                                className="text-xs text-muted-foreground cursor-pointer select-none"
                            >
                                Show Optimized Path
                            </Label>
                        </div>

                        {/* Savings callout — only when toggle is ON and savings exist */}
                        <AnimatePresence>
                            {showOptimized && annualSavings > 0 && (
                                <motion.div
                                    key="savings-badge"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.3 }}
                                    className="rounded-md bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-right"
                                >
                                    <p className="text-[10px] text-emerald-400/70 uppercase tracking-wide">Potential Savings</p>
                                    <p className="text-sm font-bold text-emerald-400">Save ₹{Math.round(annualSavings).toLocaleString()}/yr</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-[280px] w-full">
                    {!mounted ? (
                        <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">Loading chart...</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    {/* Actual — blue */}
                                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                                    </linearGradient>
                                    {/* Projected — cyan */}
                                    <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(189 94% 43%)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(189 94% 43%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 16%)" vertical={false} />

                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: number) => `₹${v}`}
                                    width={55}
                                />

                                <Tooltip content={<BurnTooltip />} />

                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                                    formatter={(value: string) => {
                                        if (value === 'actual') return 'Actual Spend';
                                        if (value === 'projected') return 'Projected Spend';
                                        return 'Optimized Path';
                                    }}
                                />

                                {/* Today reference line */}
                                <ReferenceLine
                                    x={currentMonth}
                                    stroke="hsl(215 20% 40%)"
                                    strokeDasharray="4 4"
                                    label={{
                                        value: 'Today',
                                        position: 'insideTopRight',
                                        fill: 'hsl(215 20% 55%)',
                                        fontSize: 10,
                                    }}
                                />

                                {/* Actual spend — solid blue area */}
                                <Area
                                    type="monotone"
                                    dataKey="actual"
                                    name="actual"
                                    stroke="hsl(217 91% 60%)"
                                    strokeWidth={2}
                                    fill="url(#gradActual)"
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />

                                {/* Projected spend — dashed cyan area */}
                                <Area
                                    type="monotone"
                                    dataKey="projected"
                                    name="projected"
                                    stroke="hsl(189 94% 43%)"
                                    strokeWidth={2}
                                    strokeDasharray="5 3"
                                    fill="url(#gradProjected)"
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />

                                {/* Optimized path — green dashed line (Framer Motion fade) */}
                                {showOptimized && (
                                    <Line
                                        type="monotone"
                                        dataKey="optimized"
                                        name="optimized"
                                        stroke="hsl(142 76% 36%)"
                                        strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(142 76% 36%)' }}
                                        connectNulls
                                        isAnimationActive={true}
                                        animationDuration={600}
                                        animationEasing="ease-out"
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Framer-animated hint below chart when toggle is on */}
                <AnimatePresence>
                    {showOptimized && (
                        <motion.p
                            key="hint"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35 }}
                            className="text-[11px] text-emerald-400/60 mt-2 text-center overflow-hidden"
                        >
                            💡 Optimized path assumes all monthly subscriptions switch to annual billing (20% discount)
                        </motion.p>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

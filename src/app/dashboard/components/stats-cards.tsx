import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, IndianRupee, BrainCircuit, CalendarClock } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
    stats: DashboardStats | null;
    isLoading: boolean;
}

const cards = [
    {
        label: 'Monthly Spend',
        key: 'totalMonthlySpend' as const,
        icon: IndianRupee,
        format: (v: number) => `₹${v.toFixed(2)}`,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
    },
    {
        label: 'Active Subs',
        key: 'activeCount' as const,
        icon: CreditCard,
        format: (v: number) => String(v),
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
    },
    {
        label: 'AI Detected',
        key: 'aiDetectedCount' as const,
        icon: BrainCircuit,
        format: (v: number) => String(v),
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
    },
    {
        label: 'Upcoming',
        key: 'upcomingRenewals' as const,
        icon: CalendarClock,
        format: (v: number) => String(v),
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
    },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.label} className="glass border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {card.label}
                        </CardTitle>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(isLoading || !stats || !mounted) ? (
                            <div className="h-8 w-24 rounded bg-muted/30 animate-pulse" />
                        ) : (
                            <p className="text-2xl font-bold">{card.format(stats[card.key])}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

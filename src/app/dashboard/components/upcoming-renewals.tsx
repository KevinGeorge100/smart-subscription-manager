'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';
import { format, differenceInDays, isBefore, addDays } from 'date-fns';
import type { Subscription } from '@/types';
import { cn } from '@/lib/utils';

interface UpcomingRenewalsProps {
    subscriptions: Subscription[] | null;
    isLoading: boolean;
}

export function UpcomingRenewals({ subscriptions, isLoading }: UpcomingRenewalsProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (isLoading || !mounted) {
        return (
            <Card className="glass border-border/40">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Upcoming Renewals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 rounded-lg bg-muted/30 animate-pulse" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    const now = new Date();
    const sevenDaysOut = addDays(now, 7);

    const upcoming = (subscriptions ?? [])
        .filter((sub) => {
            if (!(sub.renewalDate instanceof Date)) return false;
            return !isBefore(sub.renewalDate, now) && isBefore(sub.renewalDate, sevenDaysOut);
        })
        .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

    return (
        <Card className="glass border-border/40">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Upcoming Renewals
                </CardTitle>
            </CardHeader>
            <CardContent>
                {upcoming.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        No renewals in the next 7 days 🎉
                    </p>
                ) : (
                    <div className="space-y-2">
                        {upcoming.map((sub) => {
                            const daysLeft = differenceInDays(sub.renewalDate, now);
                            return (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/10 p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{sub.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(sub.renewalDate, 'MMM d')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">₹{sub.amount.toFixed(2)}</p>
                                        <p
                                            className={cn(
                                                'text-xs',
                                                daysLeft <= 1 ? 'text-destructive' : 'text-amber-400'
                                            )}
                                        >
                                            {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

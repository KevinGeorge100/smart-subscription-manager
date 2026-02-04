'use client';

import { useMemo, useState, useEffect } from 'react';
import { Subscription } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { differenceInDays, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ProcessedSubscription } from './page';


interface UpcomingSubscription extends ProcessedSubscription {
    daysRemaining: number;
}

interface UpcomingRenewalsProps {
    subscriptions: ProcessedSubscription[] | null;
    isLoading: boolean;
}

export function UpcomingRenewals({ subscriptions, isLoading }: UpcomingRenewalsProps) {
    const [upcoming, setUpcoming] = useState<UpcomingSubscription[] | null>(null);

    useEffect(() => {
        if (subscriptions) {
            const today = startOfDay(new Date());
            const thirtyDaysFromNow = addDays(today, 30);

            const upcomingSubscriptions: UpcomingSubscription[] = subscriptions
                .filter(sub => {
                    if (!sub.renewalDate || !(sub.renewalDate instanceof Date) || isNaN(sub.renewalDate.getTime())) return false;
                    return isAfter(sub.renewalDate, today) && isBefore(sub.renewalDate, thirtyDaysFromNow);
                })
                .map(sub => ({
                    ...sub,
                    daysRemaining: differenceInDays(sub.renewalDate, today),
                }))
                .sort((a, b) => a.daysRemaining - b.daysRemaining);
            
            setUpcoming(upcomingSubscriptions);
        } else {
            setUpcoming([]);
        }
    }, [subscriptions]);

    const showLoading = isLoading || upcoming === null;

    if (showLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Renewals</CardTitle>
                    <CardDescription>Subscriptions renewing in the next 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span>Upcoming Renewals</span>
                </CardTitle>
                <CardDescription>These subscriptions are renewing in the next 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                {upcoming.length > 0 ? (
                    <div className="space-y-3">
                        {upcoming.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{sub.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Renews on {sub.renewalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                     <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                                     <p className="text-sm text-amber-600 font-medium">
                                         {sub.daysRemaining} {sub.daysRemaining === 1 ? 'day' : 'days'} left
                                     </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming renewals in the next 30 days. You're all set!
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

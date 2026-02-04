'use client';

import { Subscription } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutList, Wallet, BellRing } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ProcessedSubscription } from './page';


interface DashboardStatsProps {
    subscriptions: ProcessedSubscription[] | null;
    isLoading: boolean;
}

export function DashboardStats({ subscriptions, isLoading }: DashboardStatsProps) {
    const [upcomingRenewalsCount, setUpcomingRenewalsCount] = useState<number | null>(null);

    const staticStats = useMemo(() => {
        if (!subscriptions) {
            return {
                totalSubscriptions: 0,
                monthlySpend: 0,
            };
        }

        const monthlySpend = subscriptions.reduce((total, sub) => {
            const amount = sub.amount; // Already a number
            if (sub.billingCycle === 'monthly') {
                return total + amount;
            }
            if (sub.billingCycle === 'yearly') {
                return total + amount / 12;
            }
            return total;
        }, 0);

        return {
            totalSubscriptions: subscriptions.length,
            monthlySpend,
        };
    }, [subscriptions]);
    
    useEffect(() => {
        if (subscriptions) {
            const today = startOfDay(new Date());
            const thirtyDaysFromNow = addDays(today, 30);
            
            const upcomingRenewals = subscriptions.filter(sub => {
                const renewalDate = sub.renewalDate; // Already a Date object
                return renewalDate && isAfter(renewalDate, today) && isBefore(renewalDate, thirtyDaysFromNow);
            }).length;
            setUpcomingRenewalsCount(upcomingRenewals);
        } else {
            setUpcomingRenewalsCount(0);
        }
    }, [subscriptions]);


    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        );
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-200 ease-in-out hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                    <LayoutList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{staticStats.totalSubscriptions}</div>
                    <p className="text-xs text-muted-foreground">
                        Active subscriptions you are tracking
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-200 ease-in-out hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(staticStats.monthlySpend)}</div>
                    <p className="text-xs text-muted-foreground">
                        Estimated monthly cost
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-200 ease-in-out hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {upcomingRenewalsCount === null ? (
                        <Skeleton className="h-7 w-12" />
                    ) : (
                        <div className="text-2xl font-bold">+{upcomingRenewalsCount}</div>
                    )}
                     <p className="text-xs text-muted-foreground">
                        In the next 30 days
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

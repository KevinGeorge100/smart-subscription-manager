'use client';

import { Subscription } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutList, Wallet, BellRing } from 'lucide-react';
import { useMemo } from 'react';
import { addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
    subscriptions: Subscription[] | null;
    isLoading: boolean;
}

export function DashboardStats({ subscriptions, isLoading }: DashboardStatsProps) {
    const stats = useMemo(() => {
        if (!subscriptions) {
            return {
                totalSubscriptions: 0,
                monthlySpend: 0,
                upcomingRenewals: 0,
            };
        }

        const monthlySpend = subscriptions.reduce((total, sub) => {
            if (sub.billingCycle === 'monthly') {
                return total + sub.amount;
            }
            if (sub.billingCycle === 'yearly') {
                return total + sub.amount / 12;
            }
            return total;
        }, 0);

        const today = startOfDay(new Date());
        const thirtyDaysFromNow = addDays(today, 30);
        
        const upcomingRenewals = subscriptions.filter(sub => {
            const renewalDate = sub.renewalDate && typeof (sub.renewalDate as any).toDate === 'function' 
                ? (sub.renewalDate as any).toDate()
                : sub.renewalDate as Date;
            return renewalDate && isAfter(renewalDate, today) && isBefore(renewalDate, thirtyDaysFromNow);
        }).length;

        return {
            totalSubscriptions: subscriptions.length,
            monthlySpend,
            upcomingRenewals,
        };
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                    <LayoutList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                    <p className="text-xs text-muted-foreground">
                        Active subscriptions you are tracking
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.monthlySpend)}</div>
                    <p className="text-xs text-muted-foreground">
                        Estimated monthly cost
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.upcomingRenewals}</div>
                     <p className="text-xs text-muted-foreground">
                        In the next 30 days
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

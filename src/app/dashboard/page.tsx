'use client';

import { useState, useMemo, useOptimistic, useCallback, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { getGmailConnectionStatus } from '@/actions/gmail';
import type { ConnectedEmail } from '@/actions/gmail';
import { doc, collection, deleteDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { User, Subscription, SubscriptionFormData, DashboardStats, BurnDataPoint } from '@/types';
import { differenceInDays, addDays, addMonths, subMonths, format, isSameMonth } from 'date-fns';
import { toINR, calculateOptimization, calculateAnnualSavings } from '@/lib/finance-utils';

import { StatsCards } from './components/stats-cards';
import { FinancialPulse } from './components/financial-pulse';
import { QuickSyncCard } from './components/quick-sync-card';
import { SubscriptionTable } from './components/subscription-table';
import { UpcomingRenewals } from './components/upcoming-renewals';
import { AddSubscriptionModal } from './components/add-subscription-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ──────────────────────────────────────────────
// Main Dashboard Page
// ──────────────────────────────────────────────

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Gmail connection status — array of all connected accounts
    const [gmailAccounts, setGmailAccounts] = useState<ConnectedEmail[]>([]);

    const fetchGmailStatus = useCallback(async () => {
        if (!user?.uid) return;
        const { accounts } = await getGmailConnectionStatus(user.uid);
        setGmailAccounts(accounts);
    }, [user?.uid]);

    useEffect(() => {
        fetchGmailStatus();
    }, [fetchGmailStatus]);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // ── Firestore Queries ──
    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userData } = useDoc<User>(userDocRef);

    const subscriptionsQuery = useMemoFirebase(
        () => (user && firestore ? collection(firestore, 'users', user.uid, 'subscriptions') : null),
        [user, firestore]
    );
    const { data: rawSubscriptions, isLoading } = useCollection<Subscription>(subscriptionsQuery);

    // ── Process subscriptions ──
    const processedSubscriptions: Subscription[] = useMemo(() => {
        if (!rawSubscriptions) return [];
        return rawSubscriptions
            .map((sub) => {
                let renewalDate: Date | null = null;
                if (sub.renewalDate && typeof (sub.renewalDate as any).toDate === 'function') {
                    renewalDate = (sub.renewalDate as any).toDate();
                } else if (sub.renewalDate instanceof Date && !isNaN(sub.renewalDate.getTime())) {
                    renewalDate = sub.renewalDate;
                }
                if (!renewalDate) return null;
                const amount = typeof sub.amount === 'number' && !isNaN(sub.amount) ? sub.amount : 0;
                const originalCurrency = sub.originalCurrency ?? 'INR';
                return {
                    ...sub,
                    id: sub.id || '',
                    amount,
                    originalCurrency,
                    // Normalize to INR for all financial calculations
                    amountInBaseCurrency: toINR(amount, originalCurrency),
                    verified: sub.verified ?? sub.source === 'manual',
                    renewalDate,
                    source: sub.source ?? 'manual',
                } as Subscription;
            })
            .filter((sub): sub is Subscription => sub !== null);
    }, [rawSubscriptions]);

    // ── Optimistic state ──
    const [optimisticSubs, addOptimistic] = useOptimistic(
        processedSubscriptions,
        (state: Subscription[], action: { type: 'add' | 'delete'; payload: Subscription | string }) => {
            if (action.type === 'add') {
                return [...state, action.payload as Subscription];
            }
            if (action.type === 'delete') {
                return state.filter((s) => s.id !== action.payload);
            }
            return state;
        }
    );

    // ── Filtered list ──
    const filteredSubscriptions = useMemo(() => {
        let subs = [...optimisticSubs];
        if (searchTerm) {
            subs = subs.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filterCategory !== 'All') {
            subs = subs.filter((s) => s.category === filterCategory);
        }
        subs.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());
        return subs;
    }, [optimisticSubs, searchTerm, filterCategory]);

    // ── Dashboard stats (INR-normalised) ──
    const stats: DashboardStats | null = useMemo(() => {
        if (isLoading) return null;
        const now = new Date();

        // Use amountInBaseCurrency (INR) for all monetary totals
        const totalMonthlySpend = optimisticSubs.reduce((sum, sub) => {
            const base = sub.amountInBaseCurrency ?? sub.amount;
            return sum + (sub.billingCycle === 'yearly' ? base / 12 : base);
        }, 0);

        return {
            totalMonthlySpend,
            totalYearlySpend: totalMonthlySpend * 12,
            activeCount: optimisticSubs.length,
            aiDetectedCount: optimisticSubs.filter((s) => s.source === 'ai-detected').length,
            upcomingRenewals: optimisticSubs.filter((s) => {
                const diff = differenceInDays(s.renewalDate, now);
                return diff >= 0 && diff <= 7;
            }).length,
        };
    }, [optimisticSubs, isLoading]);

    // ── 12-Month Predictive Burn data ──
    const now = new Date();
    const currentMonthLabel = format(now, 'MMM yy');

    const burnData: BurnDataPoint[] = useMemo(() => {
        // Monthly equivalent spend across all subscriptions
        const baseMonthlyCost = optimisticSubs.reduce((sum, sub) =>
            sum + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount), 0
        );

        const round = (n: number) => Math.round(n * 100) / 100;

        // Helper: extra spend in a given month from yearly subs renewing then
        const yearlyHitForMonth = (targetDate: Date): number =>
            optimisticSubs
                .filter((s) => s.billingCycle === 'yearly' && isSameMonth(s.renewalDate, targetDate))
                .reduce((sum, s) => sum + s.amount, 0);

        const points: BurnDataPoint[] = [];

        // ── 5 past months (actual only) ──────────────────────────────────
        for (let i = 5; i >= 1; i--) {
            const date = subMonths(now, i);
            points.push({
                month: format(date, 'MMM yy'),
                actual: round(baseMonthlyCost),
            });
        }

        // ── Current month (bridges actual → projected) ───────────────────
        points.push({
            month: currentMonthLabel,
            actual: round(baseMonthlyCost),
            projected: round(baseMonthlyCost),
        });

        // ── 6 future months (projected only) ────────────────────────────
        for (let i = 1; i <= 6; i++) {
            const date = addMonths(now, i);
            const hit = yearlyHitForMonth(date);
            points.push({
                month: format(date, 'MMM yy'),
                projected: round(baseMonthlyCost + hit),
            });
        }

        return points;
    }, [optimisticSubs, currentMonthLabel]);

    // ── Optimized path + annual savings (finance-utils) ──
    const optimizedData = useMemo(
        () => calculateOptimization(optimisticSubs, burnData.map((p) => p.month)),
        [optimisticSubs, burnData]
    );
    const annualSavings = useMemo(() => calculateAnnualSavings(optimisticSubs), [optimisticSubs]);

    // Merge optimized values into burnData for the chart
    const burnDataWithOptimized: BurnDataPoint[] = useMemo(
        () => burnData.map((point, i) => ({ ...point, optimized: optimizedData[i]?.optimized })),
        [burnData, optimizedData]
    );

    // ── Handlers ──
    const handleAdd = useCallback(
        async (data: SubscriptionFormData) => {
            if (!user || !firestore) return;

            if (editingSubscription) {
                // Update
                try {
                    const ref = doc(
                        firestore,
                        'users',
                        user.uid,
                        'subscriptions',
                        editingSubscription.id
                    );
                    await updateDoc(ref, {
                        ...data,
                        renewalDate: Timestamp.fromDate(new Date(data.renewalDate)),
                        updatedAt: Timestamp.now(),
                    });
                    toast({ title: 'Updated', description: `${data.name} has been updated.` });
                } catch {
                    toast({ title: 'Error', description: 'Failed to update subscription.', variant: 'destructive' });
                }
                setEditingSubscription(null);
                return;
            }

            // Add with optimistic update
            const tempId = `temp_${Date.now()}`;
            const optimisticSub: Subscription = {
                id: tempId,
                ...data,
                renewalDate: new Date(data.renewalDate),
                userId: user.uid,
                source: 'manual',
                verified: true,           // manually added = pre-verified
                originalCurrency: 'INR',
                amountInBaseCurrency: data.amount,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            addOptimistic({ type: 'add', payload: optimisticSub });

            try {
                const ref = doc(collection(firestore, 'users', user.uid, 'subscriptions'));
                await setDoc(ref, {
                    ...data,
                    id: ref.id,
                    userId: user.uid,
                    source: 'manual',
                    renewalDate: Timestamp.fromDate(new Date(data.renewalDate)),
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
                toast({ title: 'Added', description: `${data.name} is now being tracked.` });
            } catch {
                toast({ title: 'Error', description: 'Failed to add subscription.', variant: 'destructive' });
            }
        },
        [user, firestore, editingSubscription, addOptimistic, toast]
    );

    const handleDelete = useCallback(
        async (id: string) => {
            if (!user || !firestore) return;

            addOptimistic({ type: 'delete', payload: id });

            try {
                await deleteDoc(doc(firestore, 'users', user.uid, 'subscriptions', id));
                toast({ title: 'Deleted', description: 'Subscription removed.' });
            } catch {
                toast({ title: 'Error', description: 'Failed to delete subscription.', variant: 'destructive' });
            }
        },
        [user, firestore, addOptimistic, toast]
    );

    const handleVerify = useCallback(
        async (id: string) => {
            if (!user || !firestore) return;
            try {
                const ref = doc(firestore, 'users', user.uid, 'subscriptions', id);
                await updateDoc(ref, { verified: true, updatedAt: Timestamp.now() });
                toast({ title: '✓ Verified', description: 'Subscription confirmed as accurate.' });
            } catch {
                toast({ title: 'Error', description: 'Failed to verify subscription.', variant: 'destructive' });
            }
        },
        [user, firestore, toast]
    );

    const handleEdit = (sub: Subscription) => {
        setEditingSubscription(sub);
        setModalOpen(true);
    };

    const handleOpenNewModal = () => {
        setEditingSubscription(null);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back, {userData?.firstName || user?.email?.split('@')[0] || ''}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Here&apos;s your subscription overview. Stay in control.
                    </p>
                </div>
                <Button onClick={handleOpenNewModal} size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Subscription
                </Button>
            </div>

            {/* Stats */}
            <StatsCards stats={stats} isLoading={isLoading} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <FinancialPulse
                        data={burnDataWithOptimized}
                        currentMonth={currentMonthLabel}
                        annualSavings={annualSavings}
                    />
                    <SubscriptionTable
                        subscriptions={filteredSubscriptions}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filterCategory={filterCategory}
                        onCategoryChange={setFilterCategory}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onVerify={handleVerify}
                    />
                </div>
                <div className="space-y-6">
                    <QuickSyncCard
                        userId={user?.uid ?? ''}
                        accounts={gmailAccounts}
                        onAccountsChanged={fetchGmailStatus}
                    />
                    <UpcomingRenewals subscriptions={optimisticSubs} isLoading={isLoading} />
                </div>
            </div>

            {/* Modal */}
            <AddSubscriptionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSubmit={handleAdd}
                editingSubscription={editingSubscription}
            />
        </div>
    );
}

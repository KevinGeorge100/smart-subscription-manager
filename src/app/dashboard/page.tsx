'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { getGmailConnectionStatus, syncSubscriptions } from '@/actions/gmail';
import type { ConnectedEmail } from '@/actions/gmail';
import { doc } from 'firebase/firestore';
import type { User, Subscription, SubscriptionFormData } from '@/types';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAIInsights } from '@/hooks/use-ai-insights';

import { StatsCards } from './components/stats-cards';
import { FinancialPulse } from './components/financial-pulse';
import { QuickSyncCard } from './components/quick-sync-card';
import { KillListCard } from './components/kill-list-card';
import { SubscriptionTable } from './components/subscription-table';
import { UpcomingRenewals } from './components/upcoming-renewals';
import { AddSubscriptionModal } from './components/add-subscription-modal';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInHours } from 'date-fns';

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Shared Hooks
    const { subscriptions, isLoading, handleAdd, handleDelete, handleVerify } = useSubscriptions();
    const stats = useDashboardStats(subscriptions, isLoading);
    const { burnData, currentMonthLabel, annualSavings } = useAnalytics(subscriptions);
    const { insights, isLoading: isAIAnalysisLoading } = useAIInsights(subscriptions);
    const { toast } = useToast();

    // Auto-sync logic
    useEffect(() => {
        if (gmailAccounts.length === 0 || !user?.uid) return;

        // Find the most recent sync across all accounts
        const syncDates = gmailAccounts
            .map(a => a.lastSyncedAt ? new Date(a.lastSyncedAt) : new Date(0))
            .sort((a, b) => b.getTime() - a.getTime());

        const lastSync = syncDates[0] || new Date(0);
        const hoursSinceSync = differenceInHours(new Date(), lastSync);

        if (hoursSinceSync >= 24) {
            console.log(`[Auto-Sync] Triggering sync. Last sync was ${hoursSinceSync}h ago.`);

            toast({
                title: "🔄 Auto-Syncing",
                description: "Updating your subscriptions from Gmail...",
            });

            syncSubscriptions(user.uid).then((res) => {
                if (res.success) {
                    toast({
                        title: "✅ Data Refreshed",
                        description: `Found ${res.added} new subscriptions.`,
                    });
                    fetchGmailStatus();
                }
            });
        }
    }, [gmailAccounts, user?.uid, toast, fetchGmailStatus]);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Gmail connection
    const [gmailAccounts, setGmailAccounts] = useState<ConnectedEmail[]>([]);
    const fetchGmailStatus = useCallback(async () => {
        if (!user?.uid) return;
        const { accounts } = await getGmailConnectionStatus(user.uid);
        setGmailAccounts(accounts);
    }, [user?.uid]);

    useEffect(() => {
        fetchGmailStatus();
    }, [fetchGmailStatus]);

    // Filter state (for preview table)
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userData } = useDoc<User>(userDocRef);

    const filteredSubscriptions = useMemo(() => {
        let subs = [...subscriptions];
        if (searchTerm) {
            subs = subs.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filterCategory !== 'All') {
            subs = subs.filter((s) => s.category === filterCategory);
        }
        subs.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());
        // Show only upcoming 5 on the overview
        return subs.slice(0, 5);
    }, [subscriptions, searchTerm, filterCategory]);

    const handleEdit = (sub: Subscription) => {
        setEditingSubscription(sub);
        setModalOpen(true);
    };

    const handleOpenNewModal = () => {
        setEditingSubscription(null);
        setModalOpen(true);
    };

    const onFormSubmit = async (data: SubscriptionFormData) => {
        await handleAdd(data, editingSubscription);
        setModalOpen(false);
        setEditingSubscription(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back, {userData?.firstName || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || ''}
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

            <StatsCards stats={stats} isLoading={isLoading} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <FinancialPulse
                        data={burnData}
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
                        isCompact={true}
                    />
                </div>
                <div className="space-y-6">
                    <QuickSyncCard
                        userId={user?.uid ?? ''}
                        accounts={gmailAccounts}
                        onAccountsChanged={fetchGmailStatus}
                    />
                    <KillListCard insights={insights} isLoading={isAIAnalysisLoading} />
                    <UpcomingRenewals subscriptions={subscriptions} isLoading={isLoading} />
                </div>
            </div>

            <AddSubscriptionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSubmit={onFormSubmit}
                editingSubscription={editingSubscription}
            />
        </div>
    );
}

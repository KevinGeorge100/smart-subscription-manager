'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { AddSubscriptionForm } from './add-subscription-form';
import { UserAccount, Subscription } from '@/lib/types';
import { doc, collection } from 'firebase/firestore';
import { SubscriptionList } from './subscription-list';
import { DashboardStats } from './dashboard-stats';
import { UpcomingRenewals } from './upcoming-renewals';
import { SubscriptionControls } from './subscription-controls';

// Define a more robust client-side subscription type
export type ProcessedSubscription = {
    id: string;
    name: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
    category: 'Streaming' | 'Software' | 'Cloud' | 'Education' | 'Utilities' | 'Others';
    renewalDate: Date;
    userId: string;
};


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [editingSubscription, setEditingSubscription] = useState<ProcessedSubscription | null>(null);

    // Add state for controls
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortOption, setSortOption] = useState('renewalDate-asc');

    const userDocRef = useMemoFirebase(
      () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
      [user, firestore]
    );
    const { data: userData } = useDoc<UserAccount>(userDocRef);

    const subscriptionsQuery = useMemoFirebase(
        () => (user && firestore ? collection(firestore, 'users', user.uid, 'subscriptions') : null),
        [user, firestore]
    );
    const { data: rawSubscriptions, isLoading: isLoadingSubscriptions, error: subscriptionsError } = useCollection<Subscription>(subscriptionsQuery);
    
    // Normalize Firestore data for client-side use
    const processedSubscriptions: ProcessedSubscription[] | null = useMemo(() => {
        if (!rawSubscriptions) return null;
        
        return rawSubscriptions.map(sub => {
            let renewalDate: Date;
            if (sub.renewalDate && typeof (sub.renewalDate as any).toDate === 'function') {
                renewalDate = (sub.renewalDate as any).toDate();
            } else if (sub.renewalDate instanceof Date) {
                renewalDate = sub.renewalDate;
            } else {
                // Fallback for invalid or missing dates to prevent crashes
                renewalDate = new Date(); 
            }

            return {
                ...sub,
                id: sub.id!,
                amount: typeof sub.amount === 'number' && !isNaN(sub.amount) ? sub.amount : 0,
                renewalDate,
            };
        });
    }, [rawSubscriptions]);

    const filteredAndSortedSubscriptions = useMemo(() => {
        if (!processedSubscriptions) return null;

        let subscriptions = [...processedSubscriptions];

        // 1. Filter by search term
        if (searchTerm) {
            subscriptions = subscriptions.filter(sub =>
                sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Filter by category
        if (filterCategory !== 'All') {
            subscriptions = subscriptions.filter(sub =>
                sub.category === filterCategory
            );
        }

        // 3. Sort
        subscriptions.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'renewalDate-asc':
                default:
                    // Dates are now guaranteed to be JS Date objects
                    if (a.renewalDate && b.renewalDate) {
                        return a.renewalDate.getTime() - b.renewalDate.getTime();
                    }
                    return 0;
            }
        });

        return subscriptions;

    }, [processedSubscriptions, searchTerm, filterCategory, sortOption]);

    const handleEdit = (subscription: ProcessedSubscription) => {
        setEditingSubscription(subscription);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    const handleFinishEditing = () => {
        setEditingSubscription(null);
    }
    
    const displaySubscriptions = filteredAndSortedSubscriptions ?? processedSubscriptions;

    return (
        <main className="container p-4 sm:p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {userData?.firstName || user?.email || ''}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here's your subscription dashboard. You can add, view, and manage your subscriptions.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8">
                <DashboardStats subscriptions={processedSubscriptions} isLoading={isLoadingSubscriptions} />
                <UpcomingRenewals subscriptions={processedSubscriptions} isLoading={isLoadingSubscriptions} />
                
                <SubscriptionControls
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterCategory={filterCategory}
                    onCategoryChange={setFilterCategory}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                />
                
                <SubscriptionList 
                    subscriptions={displaySubscriptions} 
                    isLoading={isLoadingSubscriptions} 
                    error={subscriptionsError}
                    onEdit={handleEdit} 
                />
                <AddSubscriptionForm 
                    subscriptionToEdit={editingSubscription} 
                    onFinishEditing={handleFinishEditing} 
                />
            </div>
        </main>
    );
}

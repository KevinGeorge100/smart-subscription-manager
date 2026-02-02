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

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

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
    const { data: subscriptions, isLoading: isLoadingSubscriptions, error: subscriptionsError } = useCollection<Subscription>(subscriptionsQuery);
    
    const filteredAndSortedSubscriptions = useMemo(() => {
        if (!subscriptions) return null;

        let processedSubscriptions = [...subscriptions];

        // 1. Filter by search term
        if (searchTerm) {
            processedSubscriptions = processedSubscriptions.filter(sub =>
                sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Filter by category
        if (filterCategory !== 'All') {
            processedSubscriptions = processedSubscriptions.filter(sub =>
                sub.category === filterCategory
            );
        }

        // 3. Sort
        processedSubscriptions.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'renewalDate-asc':
                default:
                    const dateA = a.renewalDate && typeof (a.renewalDate as any).toDate === 'function' ? (a.renewalDate as any).toDate() : a.renewalDate as Date;
                    const dateB = b.renewalDate && typeof (b.renewalDate as any).toDate === 'function' ? (b.renewalDate as any).toDate() : b.renewalDate as Date;
                    if (!dateA || isNaN(dateA.getTime())) return 1;
                    if (!dateB || isNaN(dateB.getTime())) return -1;
                    return dateA.getTime() - dateB.getTime();
            }
        });

        return processedSubscriptions;

    }, [subscriptions, searchTerm, filterCategory, sortOption]);

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    const handleFinishEditing = () => {
        setEditingSubscription(null);
    }
    
    const displaySubscriptions = filteredAndSortedSubscriptions ?? subscriptions;

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
                <DashboardStats subscriptions={subscriptions} isLoading={isLoadingSubscriptions} />
                <UpcomingRenewals subscriptions={subscriptions} isLoading={isLoadingSubscriptions} />
                
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

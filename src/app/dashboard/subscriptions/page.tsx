'use client';

import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { SubscriptionTable } from '../components/subscription-table';
import { AddSubscriptionModal } from '../components/add-subscription-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Subscription, SubscriptionFormData } from '@/types';

export default function SubscriptionsPage() {
    const { subscriptions, isLoading, handleAdd, handleDelete, handleVerify } = useSubscriptions();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const filteredSubscriptions = useMemo(() => {
        let subs = [...subscriptions];
        if (searchTerm) {
            subs = subs.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filterCategory !== 'All') {
            subs = subs.filter((s) => s.category === filterCategory);
        }
        subs.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());
        return subs;
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
                    <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage all your active and upcoming subscriptions in one place.
                    </p>
                </div>
                <Button onClick={handleOpenNewModal} size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Subscription
                </Button>
            </div>

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
                isCompact={false}
            />

            <AddSubscriptionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSubmit={onFormSubmit}
                editingSubscription={editingSubscription}
            />
        </div>
    );
}

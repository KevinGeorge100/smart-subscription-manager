'use client';

import { useMemo, useOptimistic, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, deleteDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Subscription, SubscriptionFormData } from '@/types';
import { toINR } from '@/lib/finance-utils';
import { useToast } from '@/hooks/use-toast';

export function useSubscriptions() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const subscriptionsQuery = useMemoFirebase(
        () => (user && firestore ? collection(firestore, 'users', user.uid, 'subscriptions') : null),
        [user, firestore]
    );
    const { data: rawSubscriptions, isLoading } = useCollection<Subscription>(subscriptionsQuery);

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
                    amountInBaseCurrency: toINR(amount, originalCurrency),
                    verified: sub.verified ?? sub.source === 'manual',
                    renewalDate,
                    source: sub.source ?? 'manual',
                } as Subscription;
            })
            .filter((sub): sub is Subscription => sub !== null);
    }, [rawSubscriptions]);

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

    const handleAdd = useCallback(
        async (data: SubscriptionFormData, editingSubscription: Subscription | null = null) => {
            if (!user || !firestore) return;

            if (editingSubscription) {
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
                return;
            }

            const tempId = `temp_${Date.now()}`;
            const optimisticSub: Subscription = {
                id: tempId,
                ...data,
                renewalDate: new Date(data.renewalDate),
                userId: user.uid,
                source: 'manual',
                verified: true,
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
        [user, firestore, addOptimistic, toast]
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

    return {
        subscriptions: optimisticSubs,
        isLoading,
        handleAdd,
        handleDelete,
        handleVerify,
    };
}

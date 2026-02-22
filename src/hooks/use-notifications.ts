'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, updateDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Notification } from '@/types';

export function useNotifications() {
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(
        () => (user && firestore
            ? query(
                collection(firestore, 'users', user.uid, 'notifications'),
                orderBy('createdAt', 'desc'),
                limit(20)
            )
            : null),
        [user, firestore]
    );

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    const unreadCount = useMemo(() => {
        if (!notifications) return 0;
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const markAsRead = useCallback(async (id: string) => {
        if (!user || !firestore) return;
        try {
            const ref = doc(firestore, 'users', user.uid, 'notifications', id);
            await updateDoc(ref, { read: true });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [user, firestore]);

    const markAllAsRead = useCallback(async () => {
        if (!user || !firestore || !notifications) return;
        const unread = notifications.filter(n => !n.read);
        try {
            await Promise.all(unread.map(n => {
                const ref = doc(firestore, 'users', user.uid, 'notifications', n.id);
                return updateDoc(ref, { read: true });
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [user, firestore, notifications]);

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead
    };
}

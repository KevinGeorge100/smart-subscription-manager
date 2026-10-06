'use server';

/**
 * Server Actions for Subscription CRUD.
 * These run on the server and are called directly from client components.
 * They use Firebase Admin SDK for secure, privileged Firestore access.
 *
 * NOTE: revalidatePath is intentionally NOT called here.
 * The client uses Firestore realtime listeners (useCollection) which update
 * the UI instantly without needing a full RSC cache invalidation.
 * Calling revalidatePath caused a brief "Failed to load dashboard" crash.
 */

import type { SubscriptionFormData, SubscriptionSource } from '@/types';
import { verifyAuth } from '@/lib/auth';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function getAdminFirestore() {
    const { getFirestoreAdmin } = await import('@/lib/firebase-admin');
    return getFirestoreAdmin();
}

// ──────────────────────────────────────────────
// Add Subscription
// ──────────────────────────────────────────────

export async function addSubscription(
    userId: string,
    data: SubscriptionFormData,
    source: SubscriptionSource = 'manual',
    idToken?: string
) {
    try {
        const { uid: authUid } = await verifyAuth(idToken);
        if (userId && userId !== authUid) {
            return { success: false, error: 'Forbidden: Cannot modify another user subscriptions' };
        }

        const db = await getAdminFirestore();
        const ref = db.collection('users').doc(authUid).collection('subscriptions').doc();

        await ref.set({
            ...data,
            id: ref.id,
            userId: authUid,
            source,
            verified: source === 'manual',
            originalCurrency: 'INR',
            amountInBaseCurrency: data.amount,
            renewalDate: data.renewalDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return { success: true, id: ref.id };
    } catch (error: any) {
        console.error('[addSubscription]', error);
        return { success: false, error: error?.message || 'Failed to add subscription' };
    }
}

// ──────────────────────────────────────────────
// Update Subscription
// ──────────────────────────────────────────────

export async function updateSubscription(
    userId: string,
    subscriptionId: string,
    data: Partial<SubscriptionFormData>,
    idToken?: string
) {
    try {
        const { uid: authUid } = await verifyAuth(idToken);
        if (userId && userId !== authUid) {
            return { success: false, error: 'Forbidden: Cannot modify another user subscriptions' };
        }

        const db = await getAdminFirestore();
        const ref = db
            .collection('users')
            .doc(authUid)
            .collection('subscriptions')
            .doc(subscriptionId);

        await ref.update({
            ...data,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('[updateSubscription]', error);
        return { success: false, error: error?.message || 'Failed to update subscription' };
    }
}

// ──────────────────────────────────────────────
// Delete Subscription
// ──────────────────────────────────────────────

export async function deleteSubscription(userId: string, subscriptionId: string, idToken?: string) {
    try {
        const { uid: authUid } = await verifyAuth(idToken);
        if (userId && userId !== authUid) {
            return { success: false, error: 'Forbidden: Cannot delete another user subscription' };
        }

        const db = await getAdminFirestore();
        await db
            .collection('users')
            .doc(authUid)
            .collection('subscriptions')
            .doc(subscriptionId)
            .delete();

        return { success: true };
    } catch (error: any) {
        console.error('[deleteSubscription]', error);
        return { success: false, error: error?.message || 'Failed to delete subscription' };
    }
}


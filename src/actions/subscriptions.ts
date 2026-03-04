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
    source: SubscriptionSource = 'manual'
) {
    try {
        const db = await getAdminFirestore();
        const ref = db.collection('users').doc(userId).collection('subscriptions').doc();

        await ref.set({
            ...data,
            id: ref.id,
            userId,
            source,
            verified: source === 'manual',
            originalCurrency: 'INR',
            amountInBaseCurrency: data.amount,
            renewalDate: data.renewalDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return { success: true, id: ref.id };
    } catch (error) {
        console.error('[addSubscription]', error);
        return { success: false, error: 'Failed to add subscription' };
    }
}

// ──────────────────────────────────────────────
// Update Subscription
// ──────────────────────────────────────────────

export async function updateSubscription(
    userId: string,
    subscriptionId: string,
    data: Partial<SubscriptionFormData>
) {
    try {
        const db = await getAdminFirestore();
        const ref = db
            .collection('users')
            .doc(userId)
            .collection('subscriptions')
            .doc(subscriptionId);

        await ref.update({
            ...data,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error('[updateSubscription]', error);
        return { success: false, error: 'Failed to update subscription' };
    }
}

// ──────────────────────────────────────────────
// Delete Subscription
// ──────────────────────────────────────────────

export async function deleteSubscription(userId: string, subscriptionId: string) {
    try {
        const db = await getAdminFirestore();
        await db
            .collection('users')
            .doc(userId)
            .collection('subscriptions')
            .doc(subscriptionId)
            .delete();

        return { success: true };
    } catch (error) {
        console.error('[deleteSubscription]', error);
        return { success: false, error: 'Failed to delete subscription' };
    }
}

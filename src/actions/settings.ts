'use server';

import { getFirestoreAdmin, getAuthAdmin } from '@/lib/firebase-admin';

export async function updateNotificationSettings(
    userId: string,
    settings: { email: boolean; dashboard: boolean }
) {
    if (!userId) return { success: false, error: 'User ID is required' };

    try {
        const db = getFirestoreAdmin();
        await db.collection('users').doc(userId).update({
            'settings.notifications': settings
        });
        return { success: true };
    } catch (error) {
        console.error('[updateNotificationSettings]', error);
        return { success: false, error: 'Failed to update settings' };
    }
}

export async function updateProfile(
    userId: string,
    data: { firstName: string; lastName: string; photoURL?: string }
) {
    if (!userId) return { success: false, error: 'User ID is required' };

    try {
        const db = getFirestoreAdmin();
        const auth = getAuthAdmin();

        // Update Firestore user document
        await db.collection('users').doc(userId).update({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
            updatedAt: new Date(),
        });

        // Also update Firebase Auth display name
        await auth.updateUser(userId, {
            displayName: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
            ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
        });

        return { success: true };
    } catch (error) {
        console.error('[updateProfile]', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function deleteAccount(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required' };

    try {
        const db = getFirestoreAdmin();
        const auth = getAuthAdmin();

        // Delete all subcollections
        const batch = db.batch();

        const subsSnap = await db.collection('users').doc(userId).collection('subscriptions').get();
        subsSnap.docs.forEach((d) => batch.delete(d.ref));

        const emailsSnap = await db.collection('users').doc(userId).collection('connectedEmails').get();
        emailsSnap.docs.forEach((d) => batch.delete(d.ref));

        // Delete user document
        batch.delete(db.collection('users').doc(userId));

        await batch.commit();

        // Delete Firebase Auth account
        await auth.deleteUser(userId);

        return { success: true };
    } catch (error) {
        console.error('[deleteAccount]', error);
        return { success: false, error: 'Failed to delete account' };
    }
}

'use server';

import { getFirestoreAdmin, getAuthAdmin } from '@/lib/firebase-admin';
import { verifyAuth } from '@/lib/auth';

export async function updateNotificationSettings(
    userId: string,
    settings: { email: boolean; dashboard: boolean },
    idToken?: string
) {
    try {
        const { uid: authUid } = await verifyAuth(idToken);
        if (userId && userId !== authUid) {
            return { success: false, error: 'Forbidden: Cannot modify another user settings' };
        }

        const db = getFirestoreAdmin();
        await db.collection('users').doc(authUid).update({
            'settings.notifications': settings
        });
        return { success: true };
    } catch (error: any) {
        console.error('[updateNotificationSettings]', error);
        return { success: false, error: error?.message || 'Failed to update settings' };
    }
}

export async function updateProfile(
    userId: string,
    data: { firstName: string; lastName: string; photoURL?: string },
    idToken?: string
) {
    try {
        const { uid: authUid } = await verifyAuth(idToken);
        if (userId && userId !== authUid) {
            return { success: false, error: 'Forbidden: Cannot update another user profile' };
        }

        const db = getFirestoreAdmin();
        const auth = getAuthAdmin();

        // Update Firestore user document
        await db.collection('users').doc(authUid).update({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
            updatedAt: new Date(),
        });

        // Also update Firebase Auth display name
        await auth.updateUser(authUid, {
            displayName: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
            ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
        });

        return { success: true };
    } catch (error: any) {
        console.error('[updateProfile]', error);
        return { success: false, error: error?.message || 'Failed to update profile' };
    }
}

export async function deleteAccount(userId: string, idToken?: string) {
    try {
        const { uid: authUid } = await verifyAuth(idToken);
        if (userId && userId !== authUid) {
            return { success: false, error: 'Forbidden: Cannot delete another user account' };
        }

        const db = getFirestoreAdmin();
        const auth = getAuthAdmin();

        // Delete all subcollections
        const batch = db.batch();

        const subsSnap = await db.collection('users').doc(authUid).collection('subscriptions').get();
        subsSnap.docs.forEach((d) => batch.delete(d.ref));

        const emailsSnap = await db.collection('users').doc(authUid).collection('connectedEmails').get();
        emailsSnap.docs.forEach((d) => batch.delete(d.ref));

        // Delete user document
        batch.delete(db.collection('users').doc(authUid));

        await batch.commit();

        // Delete Firebase Auth account
        await auth.deleteUser(authUid);

        return { success: true };
    } catch (error: any) {
        console.error('[deleteAccount]', error);
        return { success: false, error: error?.message || 'Failed to delete account' };
    }
}


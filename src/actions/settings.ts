'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

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

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('[updateNotificationSettings]', error);
        return { success: false, error: 'Failed to update settings' };
    }
}

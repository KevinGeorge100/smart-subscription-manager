/**
 * Per-route metadata for the dashboard section.
 * This file is a Server Component and can safely export `metadata`.
 * The client-side layout.tsx wraps it after auth guard — metadata is still picked up by Next.js.
 */
import type { Metadata } from 'next';

export const dashboardMetadata: Metadata = {
    title: 'Dashboard — SubZero',
    description:
        'Your AI-powered subscription command centre. Track spend, catch renewals, and kill wasteful subscriptions.',
    robots: { index: false, follow: false }, // Private — do not index
    openGraph: {
        title: 'SubZero Dashboard',
        description: 'Real-time subscription intelligence powered by Gmail AI sync.',
        type: 'website',
    },
};

export const subscriptionsMetadata: Metadata = {
    title: 'Subscriptions — SubZero',
    description: 'View, manage and verify all your tracked subscriptions in one place.',
    robots: { index: false, follow: false },
};

export const analyticsMetadata: Metadata = {
    title: 'Analytics — SubZero',
    description: 'Visualise your subscription spend trends, savings opportunities, and renewal calendar.',
    robots: { index: false, follow: false },
};

export const settingsMetadata: Metadata = {
    title: 'Settings — SubZero',
    description: 'Manage your SubZero account, connected Gmail accounts, and preferences.',
    robots: { index: false, follow: false },
};

'use client';

/**
 * SyncButton — triggers Gmail subscription sync across ALL connected accounts.
 * Shows animated progress messages while scanning to reassure the user.
 */

import { useState, useEffect, useRef } from 'react';
import { syncSubscriptions } from '@/actions/gmail';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

interface SyncButtonProps {
    userId: string;
    accountCount: number;
    onSyncComplete?: () => void;
    timeframe?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    label?: string;
}

const QUICK_STEPS = [
    'Reading emails...',
    'Analysing with AI...',
    'Saving results...',
];

const DEEP_STEPS = [
    'Fetching inbox...',
    'Reading emails...',
    'Analysing with AI...',
    'Detecting subscriptions...',
    'Saving results...',
];

export function SyncButton({
    userId,
    accountCount,
    onSyncComplete,
    timeframe = '30d',
    variant = 'default',
    label
}: SyncButtonProps) {
    const [isPending, setIsPending] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const steps = timeframe === '30d' ? QUICK_STEPS : DEEP_STEPS;

    // Cycle through progress messages while pending
    useEffect(() => {
        if (isPending) {
            setStepIndex(0);
            intervalRef.current = setInterval(() => {
                setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
            }, timeframe === '30d' ? 2500 : 4000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPending, timeframe, steps.length]);

    async function handleSync() {
        if (isPending) return;
        setIsPending(true);
        try {
            const result = await syncSubscriptions(userId, timeframe);

            if (result.success) {
                onSyncComplete?.();
                if (result.added === 0) {
                    toast({
                        title: `✅ ${timeframe === '30d' ? 'Quick' : 'Deep'} Sync Complete`,
                        description: `Scanned ${result.scanned} emails across ${result.accountsScanned} account${result.accountsScanned === 1 ? '' : 's'} — no new subscriptions found.`,
                    });
                } else {
                    toast({
                        title: `✅ ${timeframe === '30d' ? 'Quick' : 'Deep'} Sync Complete`,
                        description: `Found ${result.added} new subscription${result.added === 1 ? '' : 's'} from ${result.scanned} emails across ${result.accountsScanned} account${result.accountsScanned === 1 ? '' : 's'}.`,
                    });
                }
            } else {
                toast({
                    title: 'Sync Failed',
                    description: result.error ?? 'An unexpected error occurred.',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Sync Failed',
                description: 'The request timed out or was interrupted. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Button
            onClick={handleSync}
            disabled={isPending}
            size="sm"
            variant={variant}
            className="w-full"
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="transition-all duration-500">{steps[stepIndex]}</span>
                </>
            ) : (
                <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {label || `Sync All ${accountCount > 1 ? `(${accountCount})` : ''}`}
                </>
            )}
        </Button>
    );
}

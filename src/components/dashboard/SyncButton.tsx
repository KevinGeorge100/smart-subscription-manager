'use client';

/**
 * SyncButton — triggers Gmail subscription sync across ALL connected accounts.
 */

import { useTransition } from 'react';
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

export function SyncButton({
    userId,
    accountCount,
    onSyncComplete,
    timeframe = '30d',
    variant = 'default',
    label
}: SyncButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    function handleSync() {
        startTransition(async () => {
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
        });
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
                    {timeframe === '30d' ? 'Scanning...' : 'Deep Scanning...'}
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

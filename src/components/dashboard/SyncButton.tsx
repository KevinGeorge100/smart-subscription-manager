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
}

export function SyncButton({ userId, accountCount, onSyncComplete }: SyncButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    function handleSync() {
        startTransition(async () => {
            const result = await syncSubscriptions(userId);

            if (result.success) {
                onSyncComplete?.();
                if (result.added === 0) {
                    toast({
                        title: '✅ Sync Complete',
                        description: `Scanned ${result.scanned} emails across ${result.accountsScanned} account${result.accountsScanned === 1 ? '' : 's'} — no new subscriptions found.`,
                    });
                } else {
                    toast({
                        title: '✅ Sync Complete',
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
            className="w-full"
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning {accountCount} inbox{accountCount === 1 ? '' : 'es'}…
                </>
            ) : (
                <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync All {accountCount > 1 ? `(${accountCount} accounts)` : ''}
                </>
            )}
        </Button>
    );
}

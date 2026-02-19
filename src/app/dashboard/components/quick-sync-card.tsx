'use client';

/**
 * QuickSyncCard — Multi-account Gmail OAuth connection widget.
 *
 * - Shows each connected Gmail account with disconnect option
 * - "Add another Gmail" button to connect additional accounts
 * - "Sync All" button to scan all connected inboxes at once
 */

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SyncButton } from '@/components/dashboard/SyncButton';
import { Mail, ExternalLink, ShieldCheck, X, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { disconnectGmail } from '@/actions/gmail';
import type { ConnectedEmail } from '@/actions/gmail';
import { formatDistanceToNow } from 'date-fns';

interface QuickSyncCardProps {
    userId: string;
    accounts: ConnectedEmail[];
    onAccountsChanged: () => void; // triggers re-fetch in parent
}

export function QuickSyncCard({ userId, accounts, onAccountsChanged }: QuickSyncCardProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const connectUrl = `/api/gmail/connect?userId=${encodeURIComponent(userId)}`;
    const isConnected = accounts.length > 0;

    function handleDisconnect(accountId: string, email: string) {
        startTransition(async () => {
            const result = await disconnectGmail(userId, accountId);
            if (result.success) {
                toast({ title: `Disconnected ${email}` });
                onAccountsChanged();
            } else {
                toast({
                    title: 'Error',
                    description: result.error ?? 'Failed to disconnect.',
                    variant: 'destructive',
                });
            }
        });
    }

    return (
        <Card className="glass border-border/40">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Quick Sync</CardTitle>
                    {isConnected && (
                        <span className="text-xs text-muted-foreground">
                            {accounts.length} account{accounts.length > 1 ? 's' : ''} connected
                        </span>
                    )}
                </div>
                <CardDescription>
                    {isConnected
                        ? 'Scanning all connected inboxes for subscriptions'
                        : 'Connect Gmail to auto-detect subscriptions'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">

                {/* No accounts — single connect prompt */}
                {!isConnected && (
                    <div className="flex items-center gap-4 rounded-lg border border-dashed border-border/60 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Gmail</p>
                            <p className="text-xs text-muted-foreground">
                                Scan inbox for subscription receipts
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href={connectUrl}>
                                Connect
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                        </Button>
                    </div>
                )}

                {/* Connected accounts list */}
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 flex-shrink-0">
                            <Mail className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{account.email}</p>
                            <p className="text-xs text-muted-foreground">
                                {account.lastSyncedAt
                                    ? `Synced ${formatDistanceToNow(new Date(account.lastSyncedAt), { addSuffix: true })}`
                                    : `Connected ${formatDistanceToNow(new Date(account.connectedAt), { addSuffix: true })}`}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => handleDisconnect(account.id, account.email)}
                            disabled={isPending}
                            title={`Disconnect ${account.email}`}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}

                {/* Add another Gmail */}
                {isConnected && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={connectUrl}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add another Gmail
                        </a>
                    </Button>
                )}

                {/* Sync All */}
                {isConnected && (
                    <SyncButton
                        userId={userId}
                        accountCount={accounts.length}
                        onSyncComplete={onAccountsChanged}
                    />
                )}

                {/* Privacy note */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Read-only access. Tokens are AES-256 encrypted.</span>
                </div>
            </CardContent>
        </Card>
    );
}

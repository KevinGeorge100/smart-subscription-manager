'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GlobalError]', error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="glass rounded-2xl p-8 text-center max-w-md w-full space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred. Please try again or contact support if the issue
                        persists.
                    </p>
                </div>
                <Button onClick={reset} className="w-full">
                    Try Again
                </Button>
            </div>
        </div>
    );
}

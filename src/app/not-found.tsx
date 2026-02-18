import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="glass rounded-2xl p-8 text-center max-w-md w-full space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Ghost className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold">404</h2>
                    <p className="text-sm text-muted-foreground">
                        This page doesn&apos;t exist. It might have been moved or deleted.
                    </p>
                </div>
                <Link href="/">
                    <Button className="w-full">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}

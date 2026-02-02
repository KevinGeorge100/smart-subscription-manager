'use client';

import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isUserLoading } = useUser();
    const { auth } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleSignOut = () => {
        if (auth) {
            signOut(auth).then(() => {
                router.push('/login');
            });
        }
    };

    if (isUserLoading || !user) {
        return (
            <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-muted/40">
                <div className="mb-8 flex items-center space-x-2 text-primary">
                    <ShieldCheck className="h-8 w-8 animate-pulse" />
                    <span className="text-2xl font-bold">Smart Subscription Manager</span>
                </div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh flex-col bg-background text-foreground">
             <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                    <div className="mr-4 flex">
                        <a href="/" className="mr-6 flex items-center space-x-2">
                          <ShieldCheck className="h-6 w-6 text-primary" />
                          <span className="font-bold sm:inline-block">
                            Smart Subscription Manager
                          </span>
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
                        <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    );
}

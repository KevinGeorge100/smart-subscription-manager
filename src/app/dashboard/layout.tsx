'use client';

import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

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
            <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
             <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <div className="flex-1">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-6 w-6" />
                    <span>Subscription Clarity</span>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        </div>
    );
}

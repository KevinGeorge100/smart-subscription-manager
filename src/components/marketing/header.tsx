'use client';

import Link from 'next/link';
import { SubZeroLogo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function MarketingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/60 backdrop-blur-2xl">
            <div className="container flex h-16 max-w-screen-2xl items-center">
                <Link href="/" className="flex items-center gap-2.5">
                    <SubZeroLogo className="h-8 w-8" />
                    <span className="text-lg font-bold tracking-tight">SubZero</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 ml-10">
                    <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                    <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Docs
                    </Link>
                </nav>

                <div className="flex flex-1 items-center justify-end gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">
                            Get Started
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

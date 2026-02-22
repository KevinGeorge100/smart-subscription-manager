'use client';

import Link from 'next/link';
import { SubZeroLogo } from '@/components/ui/logo';

export function MarketingFooter() {
    return (
        <footer className="border-t border-border/30 py-10">
            <div className="container max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2.5">
                    <SubZeroLogo className="h-7 w-7" />
                    <span className="text-sm font-bold">SubZero</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                </div>
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} SubZero. Made in India 🇮🇳
                </p>
            </div>
        </footer>
    );
}

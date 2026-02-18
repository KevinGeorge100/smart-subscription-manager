'use client';

import { useUser, useFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import {
    BarChart3,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SubZeroLogo } from '@/components/ui/logo';

const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Subscriptions', href: '/dashboard', icon: CreditCard },
    { label: 'Analytics', href: '/dashboard', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isUserLoading } = useUser();
    const { auth } = useFirebase();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleSignOut = () => {
        if (auth) {
            signOut(auth).then(() => router.push('/login'));
        }
    };

    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* ─── Sidebar (Desktop) ─── */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-sidebar-border bg-sidebar">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
                    <SubZeroLogo className="h-8 w-8" />
                    <span className="text-lg font-bold tracking-tight">SubZero</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-sidebar-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                            {user.email?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* ─── Mobile Sidebar Overlay ─── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
                        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
                            <div className="flex items-center gap-2">
                                <SubZeroLogo className="h-8 w-8" />
                                <span className="text-lg font-bold">SubZero</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <nav className="space-y-1 px-3 py-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            {/* ─── Main Content ─── */}
            <div className="flex-1 lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-sm text-muted-foreground">
                            {user.email}
                        </span>
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                        >
                            <LogOut className="h-4 w-4 mr-1.5" />
                            Sign Out
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

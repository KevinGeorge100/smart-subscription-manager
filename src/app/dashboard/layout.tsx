'use client';

import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/types';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import {
    BarChart3,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    UserCog,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SubZeroLogo } from '@/components/ui/logo';
import { NotificationCenter } from './components/notification-center';
import { ThemeToggle } from '@/components/theme-toggle';
import { AIChat } from '@/components/dashboard/ai-chat';
import { ErrorBoundary } from '@/components/error-boundary';


const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isUserLoading } = useUser();
    const { auth, firestore } = useFirebase();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Realtime Firestore profile — always fresh after profile saves
    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userData } = useDoc<UserType>(userDocRef);

    // Resolved display name: Firestore firstName+lastName → Auth displayName → email prefix
    const firestoreName = userData
        ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        : '';
        
    // Firebase Auth sometimes auto-generates displayName from the email prefix.
    // We want to ignore it if it's just the email prefix so we can use the real Firestore name.
    const emailPrefix = user?.email?.split('@')[0] || '';
    const authDisplayName = user?.displayName === emailPrefix ? '' : (user?.displayName || '');
    
    // Never fallback to emailPrefix as requested by user. Should just be User if absolutely nothing exists.
    const displayName = firestoreName || authDisplayName || 'User';

    // Avatar: Firestore photoURL → Firebase Auth photoURL → initials
    const photoURL = userData?.photoURL || user?.photoURL || null;
    const avatarInitial = displayName[0]?.toUpperCase() ?? 'U';

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
                <Link href="/" className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border hover:opacity-80 transition-opacity">
                    <SubZeroLogo className="h-8 w-8" />
                    <span className="text-lg font-bold tracking-tight">SubZero</span>
                </Link>

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
                <div className="border-t border-sidebar-border p-4 mt-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-3 p-2 rounded-xl border border-transparent hover:bg-sidebar-accent hover:border-sidebar-border transition-all duration-200 text-left outline-none group">
                                <Avatar className="h-9 w-9 border border-sidebar-border group-hover:border-primary/20 transition-colors">
                                    <AvatarImage src={photoURL || ''} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {avatarInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="right" className="w-56 mb-2">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/dashboard/settings">
                                <DropdownMenuItem className="cursor-pointer">
                                    <UserCog className="mr-2 h-4 w-4" />
                                    <span>Edit Profile</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/dashboard/settings">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Account Settings</span>
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-400 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setSidebarOpen(false)}>
                                <SubZeroLogo className="h-8 w-8" />
                                <span className="text-lg font-bold">SubZero</span>
                            </Link>
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
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <NotificationCenter />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                                    <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
                                        {displayName}
                                    </span>
                                    <Avatar className="h-8 w-8 border border-border/50">
                                        <AvatarImage src={photoURL || ''} alt={displayName} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                            {avatarInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <DropdownMenuLabel className="font-normal lg:hidden">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{displayName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="lg:hidden" />
                                <Link href="/dashboard/settings">
                                    <DropdownMenuItem className="cursor-pointer">
                                        <UserCog className="mr-2 h-4 w-4" />
                                        <span>Edit Profile</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link href="/dashboard/settings">
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Account Settings</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-400 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">
                    <ErrorBoundary label="dashboard">
                        {children}
                    </ErrorBoundary>
                </main>
            </div>

            {/* ─── Floating AI Chat Bubble ─── */}
            <ErrorBoundary>
                <AIChat />
            </ErrorBoundary>
        </div>
    );
}

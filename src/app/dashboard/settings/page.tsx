'use client';

import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Bell, CreditCard, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useUser();
    const { auth, firestore } = useFirebase();
    const router = useRouter();

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userData } = useDoc<UserType>(userDocRef);

    const handleSignOut = () => {
        if (auth) {
            signOut(auth).then(() => router.push('/login'));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your profile, account preferences, and security settings.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Navigation Sidebar (Vertical Tabs style) */}
                <div className="space-y-1">
                    <Button variant="secondary" className="w-full justify-start gap-3">
                        <User className="h-4 w-4" />
                        Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Security
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        Billing
                    </Button>
                </div>

                {/* Main Settings Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <Card className="glass border-border/40">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and how others see you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" value={userData?.firstName || ''} readOnly className="bg-muted/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" value={userData?.lastName || ''} readOnly className="bg-muted/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={user?.email || ''} readOnly className="bg-muted/20" />
                            </div>
                            <Button disabled className="mt-2">Save Changes</Button>
                        </CardContent>
                    </Card>

                    {/* Account Management */}
                    <Card className="glass border-border/40 border-red-500/10">
                        <CardHeader>
                            <CardTitle className="text-red-400">Danger Zone</CardTitle>
                            <CardDescription>Actions that affect your account and data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                                <div>
                                    <p className="text-sm font-medium">Log out of SubZero</p>
                                    <p className="text-xs text-muted-foreground">Sign out of your current session.</p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={handleSignOut}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-colors cursor-not-allowed group">
                                <div>
                                    <p className="text-sm font-medium group-hover:text-red-400 transition-colors">Delete Account</p>
                                    <p className="text-xs text-muted-foreground">Permanently remove your account and all data.</p>
                                </div>
                                <Button variant="outline" size="sm" className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" disabled>
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

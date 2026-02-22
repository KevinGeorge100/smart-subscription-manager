'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Bell, CreditCard, LogOut, CheckCircle2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { updateNotificationSettings } from '@/actions/settings';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { user } = useUser();
    const { auth, firestore } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userData } = useDoc<UserType>(userDocRef);

    const [notifSettings, setNotifSettings] = useState({
        email: true,
        dashboard: true
    });

    useEffect(() => {
        if (userData?.settings?.notifications) {
            setNotifSettings(userData.settings.notifications);
        }
    }, [userData]);

    const handleSignOut = () => {
        if (auth) {
            signOut(auth).then(() => router.push('/login'));
        }
    };

    const handleToggleNotif = async (type: 'email' | 'dashboard', checked: boolean) => {
        if (!user) return;

        const newSettings = { ...notifSettings, [type]: checked };
        setNotifSettings(newSettings);

        const result = await updateNotificationSettings(user.uid, newSettings);
        if (result.success) {
            toast({
                title: 'Settings Updated',
                description: `${type === 'email' ? 'Email' : 'Dashboard'} alerts ${checked ? 'enabled' : 'disabled'}.`,
            });
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update notification settings.',
                variant: 'destructive',
            });
            // Revert on failure
            setNotifSettings(notifSettings);
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

            <Tabs defaultValue="profile" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Navigation Sidebar */}
                    <TabsList className="flex md:flex-col h-auto bg-transparent border-none p-0 gap-1 md:w-64">
                        <TabsTrigger
                            value="profile"
                            className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger
                            value="billing"
                            className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <CreditCard className="h-4 w-4" />
                            Billing
                        </TabsTrigger>
                    </TabsList>

                    {/* Main Settings Content */}
                    <div className="flex-1 space-y-6">
                        <TabsContent value="profile" className="m-0 space-y-6">
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal details and how others see you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="m-0 space-y-6">
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>Choose how you want to be alerted about upcoming renewals.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex flex-col space-y-0.5">
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive renewal reminders directly in your inbox.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifSettings.email}
                                            onCheckedChange={(checked) => handleToggleNotif('email', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex flex-col space-y-0.5">
                                            <Label className="text-base">Dashboard Alerts</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Show renewal notifications in the dashboard header.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifSettings.dashboard}
                                            onCheckedChange={(checked) => handleToggleNotif('dashboard', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass border-border/40 bg-primary/5">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Standard Reminder Schedule</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Reminders are currently sent 7 days and 48 hours before each subscription's renewal date.
                                                You can mute these per-device by disabling browser notifications.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="m-0">
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Manage your account security and authentication.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-40 flex items-center justify-center text-muted-foreground text-sm italic">
                                    Security settings coming soon...
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="billing" className="m-0">
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Billing & Subscription</CardTitle>
                                    <CardDescription>Manage your SubZero plan and payment methods.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-40 flex items-center justify-center text-muted-foreground text-sm italic">
                                    Billing management coming soon...
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { User as UserType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Shield,
    Bell,
    LogOut,
    CheckCircle2,
    Camera,
    Loader2,
    Mail,
    Trash2,
    Key,
    AlertTriangle,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { updateNotificationSettings, updateProfile, deleteAccount } from '@/actions/settings';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { user } = useUser();
    const { auth, firestore, storage } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userData } = useDoc<UserType>(userDocRef);

    // ── Profile state ─────────────────────────────────────────────────────────
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
            setPhotoURL(userData.photoURL || user?.photoURL || '');
        }
    }, [userData, user]);

    // ── Notification state ────────────────────────────────────────────────────
    const [notifSettings, setNotifSettings] = useState({ email: true, dashboard: true });

    useEffect(() => {
        if (userData?.settings?.notifications) {
            setNotifSettings(userData.settings.notifications);
        }
    }, [userData]);

    // ── Password change state ─────────────────────────────────────────────────
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);

    // ── Derived display name ──────────────────────────────────────────────────
    const displayName = userData
        ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
        user?.displayName ||
        user?.email?.split('@')[0] ||
        'User'
        : user?.displayName || user?.email?.split('@')[0] || 'User';

    const avatarInitial = displayName[0]?.toUpperCase() ?? 'U';
    const isEmailProvider = user?.providerData?.some((p) => p.providerId === 'password');

    // ── Avatar upload ─────────────────────────────────────────────────────────
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !storage) return;

        if (file.size > 3 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Please choose an image under 3MB.', variant: 'destructive' });
            return;
        }

        setPhotoUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setPhotoURL(url);
            toast({ title: 'Photo uploaded', description: 'Click "Save Changes" to apply.' });
        } catch {
            toast({ title: 'Upload failed', description: 'Could not upload photo.', variant: 'destructive' });
        } finally {
            setPhotoUploading(false);
        }
    };

    // ── Save profile ──────────────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        if (!user || !firstName.trim()) return;
        setProfileSaving(true);
        try {
            const result = await updateProfile(user.uid, { firstName, lastName, photoURL });
            if (result.success) {
                toast({ title: '✅ Profile updated', description: 'Your name and photo have been saved.' });
            } else {
                throw new Error(result.error);
            }
        } catch (err: unknown) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save.', variant: 'destructive' });
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Change password ───────────────────────────────────────────────────────
    const handleChangePassword = async () => {
        if (!user || !auth) return;
        if (newPassword !== confirmPassword) {
            toast({ title: 'Passwords do not match', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: 'Password too short', description: 'Must be at least 8 characters.', variant: 'destructive' });
            return;
        }

        setPasswordSaving(true);
        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            toast({ title: '✅ Password changed', description: 'Your password has been updated.' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            const msg = code === 'auth/wrong-password'
                ? 'Current password is incorrect.'
                : code === 'auth/too-many-requests'
                    ? 'Too many attempts. Please try again later.'
                    : 'Failed to change password.';
            toast({ title: 'Error', description: msg, variant: 'destructive' });
        } finally {
            setPasswordSaving(false);
        }
    };

    // ── Notification toggle ───────────────────────────────────────────────────
    const handleToggleNotif = async (type: 'email' | 'dashboard', checked: boolean) => {
        if (!user) return;
        const newSettings = { ...notifSettings, [type]: checked };
        setNotifSettings(newSettings);
        const result = await updateNotificationSettings(user.uid, newSettings);
        if (result.success) {
            toast({ title: 'Settings Updated', description: `${type === 'email' ? 'Email' : 'Dashboard'} alerts ${checked ? 'enabled' : 'disabled'}.` });
        } else {
            setNotifSettings(notifSettings);
            toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
        }
    };

    // ── Sign out ──────────────────────────────────────────────────────────────
    const handleSignOut = () => {
        if (auth) signOut(auth).then(() => router.push('/login'));
    };

    // ── Delete account ────────────────────────────────────────────────────────
    const handleDeleteAccount = async () => {
        if (!user) return;
        const result = await deleteAccount(user.uid);
        if (result.success) {
            if (auth) await signOut(auth);
            router.push('/');
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
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
                    <TabsList className="flex md:flex-col h-auto bg-transparent border-none p-0 gap-1 md:w-56 shrink-0">
                        {[
                            { value: 'profile', icon: User, label: 'Profile' },
                            { value: 'security', icon: Shield, label: 'Security' },
                            { value: 'notifications', icon: Bell, label: 'Notifications' },
                        ].map(({ value, icon: Icon, label }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="w-full justify-start gap-3 px-4 py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground"
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6 min-w-0">

                        {/* ── Profile Tab ──────────────────────────────── */}
                        <TabsContent value="profile" className="m-0 space-y-6">

                            {/* Avatar + Name */}
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Your name and photo are shown across the dashboard.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-5">
                                        <div className="relative group">
                                            <div
                                                onClick={handleAvatarClick}
                                                className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center cursor-pointer overflow-hidden relative"
                                            >
                                                {photoURL ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={photoURL} alt="Avatar" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-primary">{avatarInitial}</span>
                                                )}
                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                                    {photoUploading
                                                        ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                                                        : <Camera className="h-5 w-5 text-white" />
                                                    }
                                                </div>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{displayName}</p>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                            <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs px-2 text-muted-foreground" onClick={handleAvatarClick}>
                                                <Camera className="h-3 w-3 mr-1" />
                                                Change photo
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Name fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Kevin"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="George"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Input id="email" value={user?.email || ''} readOnly className="bg-muted/20 pr-24" />
                                            <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
                                                <Mail className="h-2.5 w-2.5 mr-1" />
                                                Verified
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Email cannot be changed directly. Contact support.</p>
                                    </div>

                                    <Button onClick={handleSaveProfile} disabled={profileSaving || !firstName.trim()}>
                                        {profileSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Linked accounts */}
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Linked Accounts</CardTitle>
                                    <CardDescription>Third-party accounts connected to your SubZero profile.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {user?.providerData.map((provider) => (
                                        <div key={provider.providerId} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium capitalize">
                                                        {provider.providerId === 'password' ? 'Email / Password' : provider.providerId.replace('.com', '')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{provider.email || provider.uid}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">Connected</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="glass border-red-500/20">
                                <CardHeader>
                                    <CardTitle className="text-red-400 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10">
                                        <div>
                                            <p className="text-sm font-medium">Sign out</p>
                                            <p className="text-xs text-muted-foreground">Sign out of your current session.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleSignOut}>
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                                        <div>
                                            <p className="text-sm font-medium text-red-400">Delete Account</p>
                                            <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete your account, all subscriptions, and connected Gmail accounts. This action <strong>cannot be undone</strong>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteAccount}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Yes, delete everything
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Security Tab ─────────────────────────────── */}
                        <TabsContent value="security" className="m-0 space-y-6">
                            {isEmailProvider ? (
                                <Card className="glass border-border/40">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            Change Password
                                        </CardTitle>
                                        <CardDescription>Update your password. You'll need your current password to confirm.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min. 8 characters"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repeat new password"
                                            />
                                        </div>
                                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                            <p className="text-xs text-destructive">Passwords do not match.</p>
                                        )}
                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={passwordSaving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                        >
                                            {passwordSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : 'Update Password'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="glass border-border/40">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/10 border border-border/30">
                                            <Shield className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Managed by your provider</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Your account is signed in via a third-party provider (e.g. Google). Password management is handled through that provider.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Active Sessions</CardTitle>
                                    <CardDescription>Devices currently signed into your account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <div>
                                                <p className="text-sm font-medium">Current Session</p>
                                                <p className="text-xs text-muted-foreground">Active now</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs text-muted-foreground">
                                            Sign out
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Notifications Tab ─────────────────────────── */}
                        <TabsContent value="notifications" className="m-0 space-y-6">
                            <Card className="glass border-border/40">
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>Choose how you want to be alerted about upcoming renewals.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {[
                                        {
                                            key: 'email' as const,
                                            label: 'Email Notifications',
                                            desc: 'Receive renewal reminders directly in your inbox.',
                                        },
                                        {
                                            key: 'dashboard' as const,
                                            label: 'Dashboard Alerts',
                                            desc: 'Show renewal notifications in the dashboard header.',
                                        },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between space-x-4">
                                            <div className="flex flex-col space-y-0.5">
                                                <Label className="text-base">{label}</Label>
                                                <p className="text-sm text-muted-foreground">{desc}</p>
                                            </div>
                                            <Switch
                                                checked={notifSettings[key]}
                                                onCheckedChange={(checked) => handleToggleNotif(key, checked)}
                                            />
                                        </div>
                                    ))}
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
                                                Reminders are sent 7 days and 48 hours before each subscription&apos;s renewal date.
                                                You can mute these per-device by disabling browser notifications.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

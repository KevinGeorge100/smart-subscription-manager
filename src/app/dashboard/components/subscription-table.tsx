'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { BrainCircuit, Edit3, Search, Trash2, User } from 'lucide-react';
import type { Subscription } from '@/types';
import { CATEGORIES } from '@/types';
import { format } from 'date-fns';

interface SubscriptionTableProps {
    subscriptions: Subscription[] | null;
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterCategory: string;
    onCategoryChange: (v: string) => void;
    onEdit: (sub: Subscription) => void;
    onDelete: (id: string) => void;
}

export function SubscriptionTable({
    subscriptions,
    isLoading,
    searchTerm,
    onSearchChange,
    filterCategory,
    onCategoryChange,
    onEdit,
    onDelete,
}: SubscriptionTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <Card className="glass border-border/40">
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-12 rounded-lg bg-muted/30 animate-pulse"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass border-border/40">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            Subscriptions
                        </CardTitle>
                        <CardDescription>
                            {subscriptions?.length ?? 0} active subscription
                            {(subscriptions?.length ?? 0) !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1 sm:w-48">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 bg-muted/30"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={onCategoryChange}>
                            <SelectTrigger className="w-[140px] bg-muted/30">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Categories</SelectItem>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!subscriptions || subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 mb-4">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No subscriptions found. Add your first one!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {subscriptions.map((sub) => (
                            <div
                                key={sub.id}
                                className="flex items-center gap-4 rounded-lg border border-border/30 bg-muted/10 p-3 transition-colors hover:bg-muted/20"
                            >
                                {/* Name & Category */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm truncate">{sub.name}</p>
                                        <Badge
                                            variant={
                                                sub.source === 'ai-detected' ? 'default' : 'secondary'
                                            }
                                            className="text-[10px] px-1.5 py-0"
                                        >
                                            {sub.source === 'ai-detected' ? (
                                                <BrainCircuit className="h-3 w-3 mr-1" />
                                            ) : (
                                                <User className="h-3 w-3 mr-1" />
                                            )}
                                            {sub.source === 'ai-detected' ? 'AI' : 'Manual'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {sub.category} · Renews{' '}
                                        {sub.renewalDate instanceof Date
                                            ? format(sub.renewalDate, 'MMM d, yyyy')
                                            : 'N/A'}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right shrink-0">
                                    <p className="font-semibold text-sm">
                                        ₹{sub.amount.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        /{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => onEdit(sub)}
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => setDeletingId(sub.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete &quot;{sub.name}&quot;?
                                                    This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => onDelete(sub.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

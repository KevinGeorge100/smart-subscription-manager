'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
    subscriptionFormSchema,
    type SubscriptionFormData,
    type Subscription,
    BILLING_CYCLES,
    CATEGORIES,
} from '@/types';

interface AddSubscriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SubscriptionFormData) => Promise<void>;
    editingSubscription?: Subscription | null;
}

export function AddSubscriptionModal({
    open,
    onOpenChange,
    onSubmit,
    editingSubscription,
}: AddSubscriptionModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SubscriptionFormData>({
        resolver: zodResolver(subscriptionFormSchema),
        defaultValues: {
            name: '',
            amount: 0,
            billingCycle: 'monthly',
            category: 'Others',
            renewalDate: new Date(),
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (editingSubscription) {
            reset({
                name: editingSubscription.name,
                amount: editingSubscription.amount,
                billingCycle: editingSubscription.billingCycle,
                category: editingSubscription.category,
                renewalDate: editingSubscription.renewalDate,
            });
        } else {
            reset({
                name: '',
                amount: 0,
                billingCycle: 'monthly',
                category: 'Others',
                renewalDate: new Date(),
            });
        }
    }, [editingSubscription, reset]);

    const handleFormSubmit = async (data: SubscriptionFormData) => {
        await onSubmit(data);
        reset();
        onOpenChange(false);
    };

    const isEditing = !!editingSubscription;

    if (!mounted) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Subscription' : 'Add Subscription'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details for this subscription.'
                            : 'Manually add a new subscription to track.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Netflix, Spotify"
                            {...register('name')}
                            className="bg-muted/30"
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="9.99"
                            {...register('amount')}
                            className="bg-muted/30"
                        />
                        {errors.amount && (
                            <p className="text-xs text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Billing & Category Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Billing Cycle</Label>
                            <Select
                                defaultValue={editingSubscription?.billingCycle ?? 'monthly'}
                                onValueChange={(v) =>
                                    setValue('billingCycle', v as SubscriptionFormData['billingCycle'])
                                }
                            >
                                <SelectTrigger className="bg-muted/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BILLING_CYCLES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c.charAt(0).toUpperCase() + c.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.billingCycle && (
                                <p className="text-xs text-destructive">{errors.billingCycle.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                defaultValue={editingSubscription?.category ?? 'Others'}
                                onValueChange={(v) =>
                                    setValue('category', v as SubscriptionFormData['category'])
                                }
                            >
                                <SelectTrigger className="bg-muted/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-xs text-destructive">{errors.category.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Renewal Date */}
                    <div className="space-y-2">
                        <Label htmlFor="renewalDate">Renewal Date</Label>
                        <Input
                            id="renewalDate"
                            type="date"
                            {...register('renewalDate')}
                            className="bg-muted/30"
                        />
                        {errors.renewalDate && (
                            <p className="text-xs text-destructive">{errors.renewalDate.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Add Subscription'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

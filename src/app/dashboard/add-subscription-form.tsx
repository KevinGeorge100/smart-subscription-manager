'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Subscription } from '@/lib/types';
import { ProcessedSubscription } from './page';


const formSchema = z.object({
  name: z.string().min(1, 'Subscription name is required.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  billingCycle: z.enum(['monthly', 'yearly']),
  category: z.enum(['Streaming', 'Software', 'Cloud', 'Education', 'Utilities', 'Others']),
  renewalDate: z.date({
    required_error: 'A renewal date is required.',
  }),
});

interface AddSubscriptionFormProps {
    subscriptionToEdit: ProcessedSubscription | null;
    onFinishEditing: () => void;
}

export function AddSubscriptionForm({ subscriptionToEdit, onFinishEditing }: AddSubscriptionFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isEditMode = !!subscriptionToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      billingCycle: 'monthly',
      category: 'Software',
      renewalDate: undefined,
    },
  });

  useEffect(() => {
    if (subscriptionToEdit) {
      form.reset({
        ...subscriptionToEdit,
        renewalDate: subscriptionToEdit.renewalDate,
      });
    } else {
      form.reset({
        name: '',
        amount: undefined,
        billingCycle: 'monthly',
        category: 'Software',
        renewalDate: undefined,
      });
    }
  }, [subscriptionToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    if (isEditMode && subscriptionToEdit?.id) {
        const docRef = doc(firestore, 'users', user.uid, 'subscriptions', subscriptionToEdit.id);
        updateDocumentNonBlocking(docRef, { ...values, userId: user.uid });
        toast({
            title: 'Subscription Updated',
            description: `${values.name} has been updated.`,
        });
        onFinishEditing();
    } else {
        const subscriptionsRef = collection(firestore, 'users', user.uid, 'subscriptions');
        addDocumentNonBlocking(subscriptionsRef, { ...values, userId: user.uid })
        .then(() => {
            toast({
            title: 'Subscription Added',
            description: `${values.name} has been added to your list.`,
            });
            form.reset();
        });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</CardTitle>
            <CardDescription>{isEditMode ? `Updating details for ${subscriptionToEdit.name}.` : 'Enter the details of your new subscription.'}</CardDescription>
        </div>
        {isEditMode && (
            <Button variant="ghost" size="icon" onClick={onFinishEditing} className="-mt-1 -mr-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Cancel edit</span>
            </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="14.99" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a billing cycle" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {['Streaming', 'Software', 'Cloud', 'Education', 'Utilities', 'Others'].map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="renewalDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                    <FormLabel>Next Renewal Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP')
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="flex items-center space-x-4">
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                    {isEditMode ? 
                        (form.formState.isSubmitting ? 'Updating...' : 'Update Subscription') :
                        (form.formState.isSubmitting ? 'Adding...' : 'Add Subscription')
                    }
                </Button>
                {isEditMode && (
                    <Button variant="outline" onClick={onFinishEditing} type="button">Cancel</Button>
                )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

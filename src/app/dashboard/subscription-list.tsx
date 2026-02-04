'use client';

import { useState } from 'react';
import { useUser, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc, FirestoreError } from 'firebase/firestore';
import { Subscription } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { ProcessedSubscription } from './page';

function formatDate(date: Date | null) {
    if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    return 'Invalid Date';
}

interface SubscriptionListProps {
  subscriptions: ProcessedSubscription[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
  onEdit: (subscription: ProcessedSubscription) => void;
}


export function SubscriptionList({ subscriptions, isLoading, error, onEdit }: SubscriptionListProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [deleteCandidate, setDeleteCandidate] = useState<ProcessedSubscription | null>(null);

  const handleDelete = () => {
    if (!user || !firestore || !deleteCandidate || !deleteCandidate.id) return;
    
    const docRef = doc(firestore, 'users', user.uid, 'subscriptions', deleteCandidate.id);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: "Subscription Deleted",
        description: `${deleteCandidate.name} has been removed.`,
    });
    setDeleteCandidate(null);
  }

  if (isLoading) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle>Your Subscriptions</CardTitle>
                <CardDescription>A list of your recurring payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
  }
  
  if (error) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle>Your Subscriptions</CardTitle>
                <CardDescription>A list of your recurring payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 mt-8 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
                    <p className="text-center text-destructive">Could not load subscriptions. Please try again later.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl overflow-hidden border border-border/50 transition-all duration-200 ease-in-out hover:shadow-lg">
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>A list of your recurring payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              {(!subscriptions || subscriptions.length === 0) && (
                  <TableCaption>You haven't added any subscriptions yet.</TableCaption>
              )}
              <TableHeader>
                  <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Billing Cycle</TableHead>
                  <TableHead className="hidden sm:table-cell">Next Renewal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {subscriptions && subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.name}</TableCell>
                          <TableCell>
                              <Badge variant="outline">{sub.category}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(sub.amount)}</TableCell>
                          <TableCell className="hidden sm:table-cell capitalize">{sub.billingCycle}</TableCell>
                          <TableCell className="hidden sm:table-cell">{formatDate(sub.renewalDate)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(sub)}>
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteCandidate(sub)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      subscription for <span className="font-semibold">{deleteCandidate?.name}</span>.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

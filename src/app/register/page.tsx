'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';


const formSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});


export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const pendingData = useRef<{firstName: string, lastName: string} | null>(null);
  const userCreationTriggered = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Authentication service is not available. Please try again later.",
        });
        return;
    };
    pendingData.current = { firstName: values.firstName, lastName: values.lastName };
    userCreationTriggered.current = true;
    initiateEmailSignUp(auth, values.email, values.password);
  }

  useEffect(() => {
    if (user && userCreationTriggered.current && pendingData.current && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      const userData = {
        id: user.uid,
        firstName: pendingData.current.firstName,
        lastName: pendingData.current.lastName,
        email: user.email,
      };
      setDocumentNonBlocking(userRef, userData, { merge: true });
      
      pendingData.current = null;
      userCreationTriggered.current = false;
      
      router.push('/dashboard');
    }
  }, [user, firestore, router]);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
        <div className="mb-8 flex items-center space-x-2 text-primary">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-2xl font-bold">Subscription Clarity</span>
        </div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Max" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Robinson" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                Create an account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

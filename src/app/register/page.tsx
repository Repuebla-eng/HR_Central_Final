'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Building, Loader2, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      console.log("Starting registration for:", values.email);
      
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      console.log("Auth user created. UID:", user.uid);

      const newEmployeeData = {
        uid: user.uid,
        name: values.name,
        email: values.email,
        jobTitle: 'New Hire',
        department: 'Unassigned',
        status: 'Active',
        hireDate: Timestamp.now(),
        avatarUrl: `https://picsum.photos/seed/${user.uid.substring(0,5)}/100/100`,
        role: 'employee' as const,
      };

      const employeeRef = doc(db, 'employees', user.uid);
      
      // 2. Create employee document in Firestore
      try {
        console.log("Attempting to write to Firestore...");
        await setDoc(employeeRef, newEmployeeData);
        console.log("Firestore document created successfully.");
        setRegistrationSuccess(true);
      } catch (firestoreError: any) {
        console.error("Firestore Write Error details:", {
          code: firestoreError.code,
          message: firestoreError.message,
          name: firestoreError.name
        });
        
        throw {
          code: 'firestore/' + (firestoreError.code || 'unknown'),
          message: firestoreError.message,
          originalError: firestoreError
        };
      }

    } catch (error: any) {
      console.error("Registration flow failed:", error);
      let description = 'An unexpected error occurred.';
      
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already registered.';
      } else if (error.code?.startsWith('firestore/permission-denied') || error.message?.includes('permission-denied')) {
        description = 'Database error: Permission denied. The account was created in Auth but your profile could not be initialized in the database. Please contact support.';
      } else if (error.code?.startsWith('firestore/')) {
        description = `Database error (${error.code}): ${error.message}`;
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Registration Issue',
        description: description,
      });
    } finally {
      setLoading(false);
    }
  }

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-2 mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-headline">Registration Successful!</CardTitle>
            <CardDescription>Your account has been created. You can now sign in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
     <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold text-primary">HR Central</h1>
          </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Get started with HR Central</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@hrcentral.app" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

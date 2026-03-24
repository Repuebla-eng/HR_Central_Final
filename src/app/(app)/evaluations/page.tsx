// src/app/(app)/evaluations/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Evaluation, EvaluationStatus, EvaluationType } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePen, Check, Clock, User, Users, ClipboardCheck, Trash2, Loader2, BarChart3 } from 'lucide-react';
import NewEvaluationDialog from './new-evaluation-dialog';
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
import Link from 'next/link';

export default function EvaluationsPage() {
  const [pendingEvals, setPendingEvals] = useState<Evaluation[]>([]);
  const [completedEvals, setCompletedEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshEvaluations = useCallback(() => {
    // Do not run the query until authentication is complete and we have a user.
    if (authLoading || !user) {
      setLoading(false); // Stop loading if auth isn't ready or no user.
      return () => {}; // Return an empty unsubscribe function
    }

    setLoading(true);
    const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

    let q;
    if (isManagerOrAdmin) {
        // Managers and admins can see all evaluations
        q = collection(db, "evaluations");
    } else {
        // Employees can only see evaluations they are assigned to evaluate
        q = query(collection(db, "evaluations"), where("evaluadorId", "==", user.uid));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allEvalsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation));
        
        const pending = allEvalsData.filter(e => e.status === 'Pendiente');
        const completed = allEvalsData.filter(e => e.status === 'Completada');

        setPendingEvals(pending);
        setCompletedEvals(completed);
        setLoading(false);
    }, (error) => {
        console.error(`Error fetching evaluations:`, error);
        toast({
            variant: "destructive",
            title: "Permission Error",
            description: "Could not fetch evaluations. You may not have the required permissions.",
        });
        setLoading(false);
    });
    
    // Cleanup function to unsubscribe from the listener when the component unmounts
    // or when the dependencies (user, role, authLoading) change.
    return unsubscribe;
  }, [user, role, authLoading, toast]);
  
  useEffect(() => {
    const unsubscribe = refreshEvaluations();
    return () => {
        if(unsubscribe) unsubscribe();
    }
  }, [refreshEvaluations])


  const handleDeleteClick = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!evaluationToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'evaluations', evaluationToDelete.id));
      toast({
        title: 'Evaluation Deleted',
        description: 'The evaluation has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the evaluation.',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setEvaluationToDelete(null);
    }
  };


  const EvaluationTable = ({ evaluations, status }: { evaluations: Evaluation[], status: EvaluationStatus }) => {
    
    const handleEvaluate = (evaluation: Evaluation) => {
        router.push(`/evaluations/${evaluation.id}`);
    }

    const getTypeIcon = (type: EvaluationType) => {
      if (type === 'Desempeño') {
        return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
      }
      return <Users className="h-4 w-4 text-blue-500" />;
    }

    const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Evaluated</TableHead>
                    <TableHead>Evaluator</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    [1, 2].map(i => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : evaluations.length > 0 ? (
                    evaluations.map((ev) => (
                        <TableRow key={ev.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                               {getTypeIcon(ev.type)} {ev.title}
                            </TableCell>
                            <TableCell>{ev.evaluadoName || ev.evaluadoId}</TableCell>
                            <TableCell>{ev.evaluadorName || ev.evaluadorId}</TableCell>
                            <TableCell><Badge variant="outline">{ev.relation}</Badge></TableCell>
                            <TableCell>{ev.deadline.toDate ? format(ev.deadline.toDate(), 'PPP') : 'Invalid Date'}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEvaluate(ev)}>
                                    {status === 'Pendiente' ? 'Start' : 'View'}
                                    <FilePen className="ml-2 h-4 w-4" />
                                </Button>
                                {isManagerOrAdmin && (
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(ev)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No {status.toLowerCase()} evaluations found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
  };

  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  // While auth is loading, show a generic loading state.
  if (authLoading) {
    return (
       <Card>
        <CardHeader>
           <Skeleton className="h-8 w-1/2" />
           <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
            <CardTitle className="font-headline">Performance Evaluations</CardTitle>
            <CardDescription>Complete your assigned performance and competency evaluations.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            {isManagerOrAdmin && (
              <Button asChild variant="outline">
                <Link href="/evaluations/results">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Results
                </Link>
              </Button>
            )}
            {isManagerOrAdmin && <NewEvaluationDialog onEvaluationCreated={() => {}} />}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending ({pendingEvals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Check className="mr-2 h-4 w-4" />
              Completed ({completedEvals.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <EvaluationTable evaluations={pendingEvals} status="Pendiente" />
          </TabsContent>
          <TabsContent value="completed">
            <EvaluationTable evaluations={completedEvals} status="Completada" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the evaluation
              for <span className="font-semibold">{evaluationToDelete?.evaluadoName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

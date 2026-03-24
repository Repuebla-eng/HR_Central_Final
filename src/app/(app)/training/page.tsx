// src/app/(app)/training/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { TrainingPlan, Employee, Course } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import NewTrainingPlanDialog from './new-training-plan-dialog';


type EnrichedTrainingPlan = TrainingPlan & {
  employeeName?: string;
  courseTitle?: string;
};

export default function TrainingPage() {
  const [plans, setPlans] = useState<EnrichedTrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  const fetchTrainingPlans = useCallback(() => {
    if (!user) {
        setLoading(false);
        return () => {}; // Return an empty function if there's no user
    }
    setLoading(true);

    let plansQuery = collection(db, "trainingPlans");
    if (!isManagerOrAdmin) {
      plansQuery = query(collection(db, "trainingPlans"), where("employeeId", "==", user.uid)) as any;
    }
    
    const unsubscribe = onSnapshot(plansQuery, async (snapshot) => {
      const plansData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingPlan));
      
      // Enrich data with employee and course names
      const enrichedPlans = await Promise.all(plansData.map(async (plan) => {
        let employeeName: string | undefined = undefined;
        let courseTitle: string | undefined = undefined;

        if (plan.employeeId) {
            try {
                const empDoc = await getDoc(doc(db, "employees", plan.employeeId));
                if (empDoc.exists()) {
                    employeeName = (empDoc.data() as Employee).name;
                }
            } catch (e) {
                console.warn(`Could not fetch employee name for ID ${plan.employeeId}`, e);
            }
        }
        if (plan.assignedCourseId) {
            try {
                const courseDoc = await getDoc(doc(db, "courses", plan.assignedCourseId));
                if (courseDoc.exists()) {
                    courseTitle = (courseDoc.data() as Course).title;
                }
            } catch (e) {
                console.warn(`Could not fetch course title for ID ${plan.assignedCourseId}`, e);
            }
        }

        return { ...plan, employeeName, courseTitle };
      }));

      setPlans(enrichedPlans);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching training plans: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load training plans.'});
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isManagerOrAdmin, toast]);

  useEffect(() => {
    const unsubscribe = fetchTrainingPlans();
    return () => {
      unsubscribe();
    }
  }, [fetchTrainingPlans]);
  
  const handleStatusChange = async (planId: string, newStatus: 'Pending' | 'Completed') => {
      const planRef = doc(db, 'trainingPlans', planId);
      try {
        await updateDoc(planRef, { status: newStatus });
        toast({
            title: 'Success',
            description: 'Training plan status updated.',
        });
      } catch (error) {
        console.error("Error updating status:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update the plan status.',
        });
      }
  }

  const renderSkeleton = () => (
    <TableRow>
      {isManagerOrAdmin && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Training Plans</CardTitle>
          <CardDescription>View and manage all employee training plans.</CardDescription>
        </div>
        {isManagerOrAdmin && <NewTrainingPlanDialog onPlanCreated={fetchTrainingPlans} />}
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    {isManagerOrAdmin && <TableHead>Employee</TableHead>}
                    <TableHead>Training Reason</TableHead>
                    <TableHead>Assigned Course</TableHead>
                    <TableHead className="hidden md:table-cell">Deadline</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <>
                        {renderSkeleton()}
                        {renderSkeleton()}
                    </>
                ) : plans.length > 0 ? (
                    plans.map((plan) => (
                        <TableRow key={plan.id}>
                            {isManagerOrAdmin && (
                                <TableCell className="font-medium">
                                    <Link href={`/employees/${plan.employeeId}`} className="hover:underline">
                                        {plan.employeeName || plan.employeeId}
                                    </Link>
                                </TableCell>
                            )}
                            <TableCell>{plan.trainingReason || 'N/A'}</TableCell>
                            <TableCell>
                                {plan.assignedCourseId ? (
                                     <Link href={`/courses`} className="hover:underline">
                                        {plan.courseTitle || plan.assignedCourseId}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">Not assigned</span>
                                )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {plan.deadline ? plan.deadline.toDate().toLocaleDateString() : 'Not set'}
                            </TableCell>
                            <TableCell>
                                <Select
                                  value={plan.status}
                                  onValueChange={(newStatus: 'Pending' | 'Completed') => handleStatusChange(plan.id, newStatus)}
                                  disabled={loading || (!isManagerOrAdmin && user?.uid !== plan.employeeId)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                          Pending
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Completed">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          Completed
                                        </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={isManagerOrAdmin ? 5 : 4} className="h-24 text-center">
                            No training plans found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

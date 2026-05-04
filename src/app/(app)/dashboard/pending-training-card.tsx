'use client';
// src/app/(app)/dashboard/pending-training-card.tsx

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, BookOpen } from "lucide-react";
import type { TrainingPlan } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface PendingTrainingCardProps {
    trainingPlans: TrainingPlan[];
    loading: boolean;
}

export default function PendingTrainingCard({ trainingPlans, loading }: PendingTrainingCardProps) {
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Pending Training Plans
            </CardTitle>
            <CardDescription>Courses and training assigned to you.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            ) : trainingPlans.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {trainingPlans.map(tp => (
                        <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                           <div className="flex-1">
                                <p className="font-semibold text-primary">{tp.trainingReason}</p>
                                <p className="text-sm text-muted-foreground">
                                    Status: <span className="font-medium">{tp.status}</span> 
                                    {tp.deadline && ` | Due: ${format(tp.deadline.toDate(), 'MMM d, yyyy')}`}
                                </p>
                           </div>
                           <Link href="/training">
                               <Button size="sm" variant="outline">
                                    Go
                                    <BookOpen className="ml-2 h-4 w-4" />
                               </Button>
                           </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <Info className="h-8 w-8 mb-2" />
                    <p className="font-semibold text-sm">No pending training.</p>
                    <p className="text-xs">You are fully trained!</p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}

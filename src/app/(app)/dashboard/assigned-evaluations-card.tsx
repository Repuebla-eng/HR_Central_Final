// src/app/(app)/dashboard/assigned-evaluations-card.tsx
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, FilePen } from "lucide-react";
import type { Evaluation } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AssignedEvaluationsCardProps {
    evaluations: Evaluation[];
    loading: boolean;
}

export default function AssignedEvaluationsCard({ evaluations, loading }: AssignedEvaluationsCardProps) {
    const router = useRouter();

    const handleEvaluate = (evaluationId: string) => {
        router.push(`/evaluations/${evaluationId}`);
    }
    
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FilePen />
                My Pending Evaluations
            </CardTitle>
            <CardDescription>Evaluations you need to complete.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            ) : evaluations.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {evaluations.map(ev => {
                        const evaluatedPerson = ev.evaluadoName || ev.evaluadoId;
                        return (
                            <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                               <div className="flex-1">
                                    <p className="font-semibold text-primary">{ev.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Evaluating: <span className="font-medium">{evaluatedPerson}</span> | Due: {format(ev.deadline.toDate(), 'MMM d, yyyy')}
                                    </p>
                               </div>
                               <Button size="sm" variant="outline" onClick={() => handleEvaluate(ev.id)}>
                                    Start
                                    <FilePen className="ml-2 h-4 w-4" />
                               </Button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Info className="h-10 w-10 mb-2" />
                    <p className="font-semibold">No pending evaluations.</p>
                    <p className="text-sm">You're all caught up!</p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}

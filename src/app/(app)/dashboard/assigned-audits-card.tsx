// src/app/(app)/dashboard/assigned-audits-card.tsx
'use client';

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, ClipboardCheck, FilePen } from "lucide-react";
import type { TechnicalAudit } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AssignedAuditsCardProps {
    audits: TechnicalAudit[];
    loading: boolean;
}

export default function AssignedAuditsCard({ audits, loading }: AssignedAuditsCardProps) {
    const router = useRouter();

    const handleAudit = (auditId: string) => {
        router.push(`/audits/${auditId}`);
    }
    
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ClipboardCheck />
                My Pending Technical Audits
            </CardTitle>
            <CardDescription>Technical audits you need to complete.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                </div>
            ) : audits.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {audits.map(au => (
                        <div key={au.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                           <div className="flex-1">
                                <p className="font-semibold text-primary">{au.auditType}</p>
                                <p className="text-sm text-muted-foreground">
                                    Due: {format(au.deadline.toDate(), 'MMM d, yyyy')}
                                </p>
                           </div>
                           <Button size="sm" variant="outline" onClick={() => handleAudit(au.id)}>
                                Start
                                <FilePen className="ml-2 h-4 w-4" />
                           </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Info className="h-10 w-10 mb-2" />
                    <p className="font-semibold">No pending audits.</p>
                    <p className="text-sm">You're all caught up!</p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}

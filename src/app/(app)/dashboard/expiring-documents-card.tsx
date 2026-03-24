// src/app/(app)/dashboard/expiring-documents-card.tsx
'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, FileWarning, Info } from "lucide-react";
import type { EnrichedDocument } from "./page";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ExpiringDocumentsCardProps {
    documents: EnrichedDocument[];
    loading: boolean;
}

export default function ExpiringDocumentsCard({ documents, loading }: ExpiringDocumentsCardProps) {
    
    const getExpiryBadge = (expiresAt: Date) => {
        const daysLeft = differenceInDays(expiresAt, new Date());
        if (daysLeft <= 0) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (daysLeft <= 30) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Expires in {daysLeft}d</Badge>;
        }
        return <Badge variant="secondary">Expires in {daysLeft}d</Badge>;
    };
    
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileWarning />
                Expiring Documents
            </CardTitle>
            <CardDescription>Documents that will expire in the next 60 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : documents.length > 0 ? (
                <div className="space-y-4 max-h-[280px] overflow-y-auto">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                           <div>
                                <p className="font-semibold">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Employee: <Link href={`/employees/${doc.employeeId}`} className="font-medium text-primary hover:underline">{doc.employeeName}</Link>
                                </p>
                           </div>
                           <div className="text-right">
                             {getExpiryBadge(doc.expiresAt!)}
                             <p className="text-xs text-muted-foreground mt-1">{format(doc.expiresAt!, 'MMM d, yyyy')}</p>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Info className="h-10 w-10 mb-2" />
                    <p className="font-semibold">No documents are expiring soon.</p>
                    <p className="text-sm">All certifications and documents are up to date.</p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}

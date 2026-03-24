// src/app/(app)/employees/[id]/documents-tab.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import type { UserDocument } from "@/lib/types";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import UploadDocumentDialog from "./upload-document-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Info, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DocumentsTab({ employeeId }: { employeeId: string }) {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    const q = query(collection(db, "employees", employeeId, "documents"), orderBy("uploadedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          url: data.url,
          uploadedAt: data.uploadedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        } as UserDocument;
      });
      setDocuments(docsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching documents:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [employeeId]);

  useEffect(() => {
    const unsubscribe = fetchDocuments();
    return () => unsubscribe && unsubscribe();
  }, [fetchDocuments]);

  const getExpiryStatus = (expiresAt?: Date): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } | null => {
    if (!expiresAt) return null;
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiresAt, today);

    if (daysUntilExpiry < 0) {
      return { label: 'Expired', variant: 'destructive' };
    }
    if (daysUntilExpiry <= 30) {
      return { label: 'Expires Soon', variant: 'outline' };
    }
    return { label: 'Valid', variant: 'secondary' };
  };

  const renderSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Manage employee-related documents and links.</CardDescription>
        </div>
        <UploadDocumentDialog employeeId={employeeId} disabled={!isManagerOrAdmin} onDocumentUploaded={fetchDocuments} />
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead className="text-right">Link</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <>
                        {renderSkeleton()}
                        {renderSkeleton()}
                    </>
                ) : documents.length > 0 ? (
                    documents.map((doc) => {
                        const expiryStatus = getExpiryStatus(doc.expiresAt);
                        return (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {doc.name}
                                </TableCell>
                                <TableCell>
                                    {doc.uploadedAt ? format(doc.uploadedAt, 'PPP') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {doc.expiresAt && (
                                        <div className="flex flex-col">
                                            <span>{format(doc.expiresAt, 'PPP')}</span>
                                            {expiryStatus && <Badge variant={expiryStatus.variant} className={cn("w-fit mt-1", expiryStatus.variant === 'outline' && "bg-yellow-100 text-yellow-800 border-yellow-300")}>{expiryStatus.label}</Badge>}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            Open
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                           <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Info className="h-8 w-8" />
                                <span>No documents have been added for this employee yet.</span>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

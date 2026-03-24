
'use client';

import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { JobTitle } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import NewRoleDialog from "@/components/roles/new-role-dialog";
import { Button } from "@/components/ui/button";
import { FirestorePermissionError } from "@/lib/firebase/errors";
import { errorEmitter } from "@/lib/firebase/error-emitter";

export default function RolesPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  const fetchJobTitles = useCallback(() => {
    if (user && !isManagerOrAdmin) {
      toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.'});
      router.push('/dashboard');
      setLoading(false);
      return () => {};
    }

    const q = collection(db, "jobTitles");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const titlesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobTitle));
      setJobTitles(titlesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching job titles:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: (q as any)._path?.canonical, operation: 'list' }));
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isManagerOrAdmin, router, toast]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = fetchJobTitles();
    return () => unsubscribe && unsubscribe();
  }, [fetchJobTitles, user]);

  const renderSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
    </TableRow>
  );

  if (!isManagerOrAdmin && !loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Job Roles</CardTitle>
          <CardDescription>Manage job titles and their competency matrices.</CardDescription>
        </div>
        {role && ['admin', 'manager'].includes(role) && (
            <NewRoleDialog />
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {renderSkeleton()}
                {renderSkeleton()}
              </>
            ) : jobTitles.length > 0 ? (
              jobTitles.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.description}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/roles/${job.id}`}>Manage Competencies</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        No job roles found. Create one to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

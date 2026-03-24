
// src/app/(app)/competencies/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Competency } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import NewCompetencyDialog from './new-competency-dialog';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'competencies'), orderBy('category'), orderBy('name'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Competency));
        setCompetencies(data);
        setLoading(false);
      }, 
      (error) => {
        console.error("Error fetching competencies:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: (q as any)._path?.canonical,
          operation: 'list',
        }));
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, []);

  const renderSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Competencies</CardTitle>
          <CardDescription>Manage the organization's competency catalog.</CardDescription>
        </div>
        {isManagerOrAdmin && <NewCompetencyDialog />}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {renderSkeleton()}
                {renderSkeleton()}
                {renderSkeleton()}
              </>
            ) : competencies.length > 0 ? (
              competencies.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell className="font-medium">{comp.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{comp.category}</Badge>
                  </TableCell>
                  <TableCell>{comp.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No competencies found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

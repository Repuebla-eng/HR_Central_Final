
// src/app/(app)/courses/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Course } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import NewCourseDialog from './new-course-dialog';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const q = query(collection(db, "courses"), orderBy("title"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      setCourses(coursesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching courses:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: (q as any)._path?.canonical,
          operation: 'list'
      }));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = fetchCourses();
    return () => unsubscribe && unsubscribe();
  }, [fetchCourses]);

  const renderSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Courses</CardTitle>
          <CardDescription>Manage the catalog of available training courses.</CardDescription>
        </div>
        {isManagerOrAdmin && <NewCourseDialog onCourseAdded={fetchCourses} />}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Provider</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {renderSkeleton()}
                {renderSkeleton()}
              </>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell className="hidden md:table-cell">{course.provider}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <a href={course.url} target="_blank" rel="noopener noreferrer">
                        Open
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No courses found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

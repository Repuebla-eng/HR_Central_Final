
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { JobTitle } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Target, CheckSquare, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import CompetencyMatrix from './competency-matrix';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const [jobTitle, setJobTitle] = useState<JobTitle | null>(null);
  const [loading, setLoading] = useState(true);
  const jobTitleId = params.id;

  useEffect(() => {
    if (jobTitleId) {
      const docRef = doc(db, 'jobTitles', jobTitleId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setJobTitle({ id: docSnap.id, ...docSnap.data() } as JobTitle);
        } else {
          console.log('No such document!');
          setJobTitle(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching job title:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [jobTitleId]);

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (!jobTitle) {
    return <div>Job role not found.</div>;
  }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/roles">
                    <ArrowLeft />
                    Back to Roles
                </Link>
            </Button>
            <h1 className="text-3xl font-headline font-bold">{jobTitle.title}</h1>
            <p className="text-muted-foreground">{jobTitle.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target />
              Misión del Cargo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{jobTitle.mission || "No mission defined for this role."}</p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckSquare /> Funciones y Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              {jobTitle.mainFunctions && jobTitle.mainFunctions.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {jobTitle.mainFunctions.map((func, i) => <li key={i}>{func}</li>)}
                </ul>
              ) : <p className="text-muted-foreground">No functions defined.</p>}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck /> Responsabilidades</CardTitle>
            </CardHeader>
            <CardContent>
              {jobTitle.responsibilities && jobTitle.responsibilities.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {jobTitle.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                </ul>
              ) : <p className="text-muted-foreground">No responsibilities defined.</p>}
            </CardContent>
          </Card>
        </div>

       <CompetencyMatrix jobTitleId={jobTitleId} jobTitleName={jobTitle.title} competencyLinks={jobTitle.competencies || []} />
    </div>
  );
}

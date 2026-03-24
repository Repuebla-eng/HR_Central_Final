
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Info } from "lucide-react";
import { suggestPersonalizedTrainingPlans } from "@/ai/flows/suggest-personalized-training-plans";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Employee, JobTitleCompetency, Competency, CompetencyAssessment } from '@/lib/types';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AssessCompetencyDialog from "./assess-competency-dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type CompetencyData = JobTitleCompetency & { achievedLevel?: number, assessmentDate?: Date };

export default function PerformanceTab({ employeeId }: { employeeId: string }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{courses: string[], justification: string} | null>(null);
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [competencies, setCompetencies] = useState<CompetencyData[]>([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);

  const fetchPerformanceData = useCallback(async () => {
    setLoadingCompetencies(true);
    try {
      // 1. Get employee's job title
      const employeeRef = doc(db, 'employees', employeeId);
      const employeeSnap = await getDoc(employeeRef);
      if (!employeeSnap.exists()) throw new Error("Employee not found");
      const employee = employeeSnap.data() as Employee;
      const jobTitleName = employee.jobTitle;

      // 2. Get the job title document to find competency links
      const jobTitlesQuery = query(collection(db, "jobTitles"), where("title", "==", jobTitleName));
      const jobTitlesSnap = await getDocs(jobTitlesQuery);
      if (jobTitlesSnap.empty) {
        console.warn(`Job title "${jobTitleName}" not found.`);
        setCompetencies([]);
        setLoadingCompetencies(false);
        return;
      };
      const jobTitleDoc = jobTitlesSnap.docs[0];
      const jobTitleData = jobTitleDoc.data();
      const competencyLinks: { competencyId: string; requiredLevel: number }[] = jobTitleData.competencies || [];
      
      // 3. Fetch the full data for each linked competency from the root /competencies collection
      const competencyPromises = competencyLinks.map(async (link) => {
        const competencyRef = doc(db, 'competencies', link.competencyId);
        const competencySnap = await getDoc(competencyRef);
        if (competencySnap.exists()) {
          return {
            id: competencySnap.id,
            ...competencySnap.data(),
            requiredLevel: link.requiredLevel,
          } as JobTitleCompetency;
        }
        return null;
      });
      const requiredCompetencies = (await Promise.all(competencyPromises)).filter(c => c !== null) as JobTitleCompetency[];

      // 4. Fetch the employee's assessments
      const assessmentsRef = collection(db, "employees", employeeId, "competencyAssessments");
      const assessmentsSnap = await getDocs(assessmentsRef);
      const achievedAssessments = new Map<string, CompetencyAssessment>();
      assessmentsSnap.forEach(doc => {
          const data = doc.data();
          achievedAssessments.set(data.competencyId, { 
              ...data, 
              assessmentDate: data.assessmentDate.toDate() 
          } as CompetencyAssessment);
      });

      // 5. Merge required competencies with achieved assessments
      const mergedCompetencies = requiredCompetencies.map(reqComp => {
          const assessment = achievedAssessments.get(reqComp.id);
          return {
              ...reqComp,
              achievedLevel: assessment?.achievedLevel,
              assessmentDate: assessment?.assessmentDate,
          };
      });
      
      setCompetencies(mergedCompetencies);

    } catch(e) {
      console.error(e);
       toast({
        variant: 'destructive',
        title: "Error fetching performance data",
        description: "Could not load competency information."
      })
    } finally {
      setLoadingCompetencies(false);
    }

  }, [employeeId, toast]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const handleSuggestPlan = async (competency: CompetencyData) => {
    setLoading(true);
    setSuggestion(null);
    try {
      const gapDescription = `Employee needs to improve ${competency.name}. Required level is ${competency.requiredLevel}, but current level is ${competency.achievedLevel || 'not assessed'}.`;
      const result = await suggestPersonalizedTrainingPlans({
        employeeId: employeeId,
        competencyId: competency.id,
        gapDescription: gapDescription,
      });
      setSuggestion({
        courses: result.suggestedCourses,
        justification: result.justification
      });
    } catch(e) {
      toast({
        variant: 'destructive',
        title: "AI Suggestion Failed",
        description: "Could not generate training suggestions at this time."
      })
    } finally {
      setLoading(false);
    }
  }

  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  const renderSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16 rounded" /></TableCell>
        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Competency Analysis</CardTitle>
          <CardDescription>Comparison of required and achieved competency levels for the employee's role. Click on the 'Achieved' value to assess.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competency</TableHead>
                <TableHead className="text-center">Required</TableHead>
                <TableHead className="text-center">Achieved</TableHead>
                <TableHead className="text-center">Gap</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCompetencies ? (
                <>
                  {renderSkeleton()}
                  {renderSkeleton()}
                </>
              ) : competencies.length > 0 ? (
                competencies.map((comp) => {
                  const gap = comp.requiredLevel - (comp.achievedLevel || 0);
                  return (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-base w-8 justify-center">{comp.requiredLevel}</Badge>
                      </TableCell>
                       <TableCell className="text-center">
                         <AssessCompetencyDialog 
                            competency={comp} 
                            employeeId={employeeId} 
                            assessorId={user!.uid}
                            disabled={!isManagerOrAdmin}
                            onAssessmentSaved={fetchPerformanceData}
                          >
                            {comp.achievedLevel ? (
                              <Badge className={cn("text-base w-8 justify-center", isManagerOrAdmin && "cursor-pointer hover:bg-primary/80")}>{comp.achievedLevel}</Badge>
                            ) : (
                              <Badge variant="outline" className={cn("text-base w-8 justify-center", isManagerOrAdmin && "cursor-pointer hover:bg-accent/50")}>-</Badge>
                            )}
                         </AssessCompetencyDialog>
                      </TableCell>
                      <TableCell className="text-center">
                        {comp.achievedLevel === undefined ? (
                            <Badge variant="outline" className="text-base w-8 justify-center">-</Badge>
                        ): gap > 0 ? (
                            <Badge variant="destructive" className="text-base w-8 justify-center">-{gap}</Badge>
                        ) : (
                             <Badge className="text-base bg-green-600 w-8 justify-center">+{Math.abs(gap)}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                         {gap > 0 && (
                            <Button size="sm" onClick={() => handleSuggestPlan(comp)} disabled={loading || !isManagerOrAdmin}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {loading ? 'Analyzing...' : 'Suggest Plan'}
                            </Button>
                         )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                     <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Info className="h-8 w-8" />
                        <span>No competencies defined for this employee's job role yet.</span>
                        <span className="text-xs">Go to "Job Roles" to define them.</span>
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {suggestion && (
        <Card>
          <CardHeader>
             <CardTitle>AI-Powered Training Suggestion</CardTitle>
             <CardDescription>Generated based on the selected competency gap.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-bold mb-2">Suggested Courses:</h4>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                {suggestion.courses.map(course => <li key={course}>{course}</li>)}
              </ul>
              <h4 className="font-bold mb-2">Justification:</h4>
              <p className="text-sm text-muted-foreground">{suggestion.justification}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

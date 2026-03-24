
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Briefcase, Target, CheckCircle, TrendingDown, Award } from "lucide-react";
import { collection, getDocs, query, where, collectionGroup, doc, getDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RiskAnalysisChart from "./risk-analysis-chart";
import ExpiringDocumentsCard from "./expiring-documents-card";
import AssignedEvaluationsCard from "./assigned-evaluations-card";
import AssignedAuditsCard from "./assigned-audits-card"; // Import the new component
import type { UserDocument, Employee, Evaluation, TechnicalAudit } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";


interface KpiData {
  totalEmployees: number;
  totalJobRoles: number;
  pendingTrainingPlans: number;
  turnoverRate: number;
  trainingCompletionRate: number;
  averageCompetencyGap: number;
}

export type EnrichedDocument = UserDocument & { employeeName: string; employeeId: string; };

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [expiringDocuments, setExpiringDocuments] = useState<EnrichedDocument[]>([]);
  const [assignedEvaluations, setAssignedEvaluations] = useState<Evaluation[]>([]);
  const [assignedAudits, setAssignedAudits] = useState<TechnicalAudit[]>([]); // New state for audits
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

   const fetchDashboardData = useCallback(async () => {
      if (!user || !role) { // Ensure user and role are loaded
        return;
      }
      setLoading(true);

      const today = Timestamp.now();
      const futureDate = Timestamp.fromMillis(today.toMillis() + 60 * 24 * 60 * 60 * 1000);

      try {
        if (isManagerOrAdmin) {
            const employeesQuery = query(collection(db, "employees"), where("status", "!=", "Terminated"));
            const allEmployeesQuery = query(collection(db, "employees"));
            const jobTitlesCollection = collection(db, "jobTitles");
            const trainingPlansCollection = collection(db, "trainingPlans");
            const allAssessmentsQuery = collectionGroup(db, "competencyAssessments");
             const expiringDocsQuery = query(
                collectionGroup(db, 'documents'),
                where('expiresAt', '>=', today),
                where('expiresAt', '<=', futureDate)
            );

            const [
                employeesSnap,
                allEmployeesSnap,
                jobTitlesSnap,
                trainingPlansSnap,
                allAssessmentsSnap,
                expiringDocsSnap
            ] = await Promise.all([
                getDocs(employeesQuery),
                getDocs(allEmployeesQuery),
                getDocs(jobTitlesCollection),
                getDocs(trainingPlansCollection),
                getDocs(allAssessmentsQuery),
                getDocs(expiringDocsQuery),
            ]);

            const totalEmployees = employeesSnap.size;
            const terminatedEmployees = allEmployeesSnap.docs.filter(doc => doc.data().status === 'Terminated').length;
            const turnoverRate = allEmployeesSnap.size > 0 ? (terminatedEmployees / allEmployeesSnap.size) * 100 : 0;
            const completedTrainingPlans = trainingPlansSnap.docs.filter(doc => doc.data().status === 'Completed').length;
            const trainingCompletionRate = trainingPlansSnap.size > 0 ? (completedTrainingPlans / trainingPlansSnap.size) * 100 : 0;

            let totalGap = 0;
            allAssessmentsSnap.forEach(assessment => {
                const gap = (assessment.data().requiredLevel || 0) - (assessment.data().achievedLevel || 0);
                if (gap > 0) totalGap += gap;
            });
            const averageCompetencyGap = allAssessmentsSnap.size > 0 ? totalGap / allAssessmentsSnap.size : 0;

            setKpiData({
                totalEmployees,
                totalJobRoles: jobTitlesSnap.size,
                pendingTrainingPlans: trainingPlansSnap.size - completedTrainingPlans,
                turnoverRate,
                trainingCompletionRate,
                averageCompetencyGap,
            });

            const employeesMap = new Map(employeesSnap.docs.map(doc => [doc.id, doc.data() as Employee]));
            const enrichedDocs = expiringDocsSnap.docs.map(docSnap => {
                const docData = docSnap.data();
                const employeeId = docSnap.ref.parent.parent!.id;
                const employee = employeesMap.get(employeeId);
                return {
                    id: docSnap.id,
                    ...docData,
                    expiresAt: docData.expiresAt?.toDate(),
                    employeeId: employeeId,
                    employeeName: employee?.name || 'Unknown Employee',
                } as EnrichedDocument;
            }).sort((a, b) => a.expiresAt!.getTime() - b.expiresAt!.getTime());
            setExpiringDocuments(enrichedDocs);

        } else {
            // --- Employee-specific data ---
            const currentUserDocRef = doc(db, 'employees', user.uid);
            const currentUserSnap = await getDoc(currentUserDocRef);
            const currentUserData = currentUserSnap.exists() ? currentUserSnap.data() as Employee : null;

            const expiringDocsQuery = query(
                collection(db, 'employees', user.uid, 'documents'),
                where('expiresAt', '>=', today),
                where('expiresAt', '<=', futureDate)
            );
            const expiringDocsSnap = await getDocs(expiringDocsQuery);
            
            const enrichedDocs = expiringDocsSnap.docs
                .map(docSnap => {
                    const docData = docSnap.data();
                    return {
                        id: docSnap.id,
                        ...docData,
                        expiresAt: docData.expiresAt?.toDate(),
                        employeeId: user.uid,
                        employeeName: currentUserData?.name || 'Me',
                    } as EnrichedDocument;
                }).sort((a, b) => a.expiresAt!.getTime() - b.expiresAt!.getTime());
            
            setExpiringDocuments(enrichedDocs);
        }
      } catch(e) {
          console.error("Error fetching dashboard data:", e);
           toast({
              variant: "destructive",
              title: "Dashboard Error",
              description: "Could not load some dashboard components.",
          });
      } finally {
        setLoading(false);
      }
    }, [user, role, isManagerOrAdmin, toast]);
  
    useEffect(() => {
        if (!authLoading) {
            fetchDashboardData();
        }
    }, [authLoading, fetchDashboardData]);

    // Separate useEffect for real-time listeners to handle cleanup correctly.
    useEffect(() => {
        if (authLoading || !user) {
            setAssignedEvaluations([]);
            setAssignedAudits([]);
            return;
        }

        const commonQueryError = (collectionName: string) => (error: Error) => {
            console.error(`Error fetching assigned ${collectionName}:`, error);
        };
        
        // Listener for assigned evaluations
        const assignedEvalsQuery = query(
            collection(db, "evaluations"),
            where("evaluadorId", "==", user.uid),
            where("status", "==", "Pendiente")
        );
        const evalsUnsubscribe = onSnapshot(assignedEvalsQuery, async (snapshot) => {
            const evalsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation));
            
            const enrichedEvals = await Promise.all(evalsData.map(async (ev) => {
                if (ev.evaluadoId === user.uid) {
                    return { ...ev, evaluadoName: 'Yourself' };
                }
                if (!ev.evaluadoName && ev.evaluadoId) {
                    try {
                        const empDoc = await getDoc(doc(db, "employees", ev.evaluadoId));
                        if (empDoc.exists()) {
                            return { ...ev, evaluadoName: (empDoc.data() as Employee).name };
                        }
                    } catch (e) {
                        console.warn(`Could not fetch employee name for ID ${ev.evaluadoId}`, e);
                    }
                }
                return ev;
            }));

            setAssignedEvaluations(enrichedEvals);
        }, commonQueryError('evaluations'));
        
        // Listener for assigned technical audits
        const assignedAuditsQuery = query(
            collection(db, "technicalAudits"),
            where("evaluadoId", "==", user.uid),
            where("status", "==", "Pendiente")
        );
        const auditsUnsubscribe = onSnapshot(assignedAuditsQuery, (snapshot) => {
            const auditsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TechnicalAudit));
            setAssignedAudits(auditsData);
        }, commonQueryError('technical audits'));


        return () => {
            evalsUnsubscribe();
            auditsUnsubscribe();
        };
    }, [authLoading, user]);


  const KpiCard = ({ title, value, icon: Icon, description, isLoading, format = "number" }: { title: string, value: string | number, icon: React.ElementType, description?: string, isLoading: boolean, format?: "number" | "percentage" | "decimal" }) => {

    const formatValue = (val: number) => {
        switch(format) {
            case "percentage": return `${val.toFixed(1)}%`;
            case "decimal": return val.toFixed(2);
            default: return val.toLocaleString();
        }
    }

    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16" />
                {description && <Skeleton className="h-4 w-24 mt-2" />}
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatValue(Number(value))}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
              </>
            )}
          </CardContent>
        </Card>
    );
  }

  const isLoading = loading || authLoading;

  return (
    <>
      <h1 className="text-3xl font-headline font-bold mb-6">Dashboard</h1>
      
      {isManagerOrAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-8">
            <KpiCard
              title="Total Employees"
              value={kpiData?.totalEmployees ?? 0}
              icon={Users}
              isLoading={isLoading}
            />
            <KpiCard
              title="Job Roles Defined"
              value={kpiData?.totalJobRoles ?? 0}
              icon={Briefcase}
              isLoading={isLoading}
            />
            <KpiCard
              title="Pending Training Plans"
              value={kpiData?.pendingTrainingPlans ?? 0}
              icon={Target}
              isLoading={isLoading}
            />
            <KpiCard
              title="Turnover Rate"
              value={kpiData?.turnoverRate ?? 0}
              icon={TrendingDown}
              isLoading={isLoading}
              format="percentage"
              description="Employee departures"
            />
            <KpiCard
              title="Training Completion"
              value={kpiData?.trainingCompletionRate ?? 0}
              icon={Award}
              isLoading={isLoading}
              format="percentage"
              description="Completed plans"
            />
             <KpiCard
              title="Avg. Competency Gap"
              value={kpiData?.averageCompetencyGap ?? 0}
              icon={CheckCircle}
              isLoading={isLoading}
              format="decimal"
              description="Average skill gap"
            />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <RiskAnalysisChart />
            <ExpiringDocumentsCard documents={expiringDocuments} loading={isLoading} />
          </div>
        </>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AssignedEvaluationsCard evaluations={assignedEvaluations} loading={isLoading} />
              <AssignedAuditsCard audits={assignedAudits} loading={isLoading} />
              <ExpiringDocumentsCard documents={expiringDocuments} loading={isLoading} />
          </div>
      )}
    </>
  );
}

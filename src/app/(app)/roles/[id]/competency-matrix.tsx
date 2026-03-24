
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { JobTitleCompetency, Competency } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import NewCompetencyDialog from "./new-competency-dialog";
import { Badge } from "@/components/ui/badge";

export default function CompetencyMatrix({ jobTitleId, jobTitleName, competencyLinks }: { jobTitleId: string, jobTitleName: string, competencyLinks: { competencyId: string; requiredLevel: number }[] }) {
    const [competencies, setCompetencies] = useState<JobTitleCompetency[]>([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();
    const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

    useEffect(() => {
        setLoading(true);
        if (!competencyLinks || competencyLinks.length === 0) {
            setCompetencies([]);
            setLoading(false);
            return;
        }

        const fetchCompetencies = async () => {
            const competencyPromises = competencyLinks.map(async (link) => {
                const docRef = doc(db, "competencies", link.competencyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const competencyData = docSnap.data() as Competency;
                    return {
                        ...competencyData,
                        id: docSnap.id,
                        requiredLevel: link.requiredLevel,
                    } as JobTitleCompetency;
                }
                return null;
            });

            const resolvedCompetencies = (await Promise.all(competencyPromises)).filter(c => c !== null) as JobTitleCompetency[];
            setCompetencies(resolvedCompetencies);
            setLoading(false);
        };

        fetchCompetencies();

    }, [competencyLinks]);

    const renderSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-6 w-8 rounded-full" /></TableCell>
        </TableRow>
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Competency Matrix</CardTitle>
                    <CardDescription>Required competencies for the {`"${jobTitleName}"`} role.</CardDescription>
                </div>
                {isManagerOrAdmin && (
                    <NewCompetencyDialog jobTitleId={jobTitleId} existingCompetencyIds={competencies.map(c => c.id)} />
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Competency</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[150px] text-center">Required Level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <>
                                {renderSkeleton()}
                                {renderSkeleton()}
                            </>
                        ) : competencies.length > 0 ? (
                            competencies.map((comp) => (
                                <TableRow key={comp.id}>
                                    <TableCell className="font-medium">{comp.name}</TableCell>
                                    <TableCell><Badge variant="outline">{comp.category}</Badge></TableCell>
                                    <TableCell>{comp.description}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="text-base">
                                            {comp.requiredLevel}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No competencies defined for this role yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

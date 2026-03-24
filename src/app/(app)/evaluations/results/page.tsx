// src/app/(app)/evaluations/results/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Evaluation, Employee } from '@/lib/types';
import { surveys } from '@/lib/surveys-data';
import { useAuth } from '@/hooks/use-auth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FilterX } from 'lucide-react';
import Link from 'next/link';

interface ChartData {
  name: string;
  averageScore: number;
}

const chartConfig = {
  averageScore: {
    label: 'Avg. Score',
    color: 'hsl(var(--primary))',
  },
};

export default function EvaluationResultsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedSurveyTitle, setSelectedSurveyTitle] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const evalsQuery = query(collection(db, 'evaluations'), where('status', '==', 'Completada'));
        const employeesQuery = query(collection(db, 'employees'), orderBy('name'));

        const [evalsSnapshot, employeesSnapshot] = await Promise.all([
          getDocs(evalsQuery),
          getDocs(employeesQuery),
        ]);

        const evalsData = evalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evaluation));
        const employeesData = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));

        setEvaluations(evalsData);
        setEmployees(employeesData);

        // Set default year filter to the most recent one
        const years = [...new Set(evalsData.map(e => e.cycleId))].sort((a, b) => Number(b) - Number(a));
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }

      } catch (error) {
        console.error("Error fetching evaluation results:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { years, surveyTitles } = useMemo(() => {
    const allYears = [...new Set(evaluations.map(e => e.cycleId))].sort((a, b) => Number(b) - Number(a));
    const allTitles = [...new Set(evaluations.map(e => e.title))].sort();
    return { years: allYears, surveyTitles: allTitles };
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const yearMatch = selectedYear ? e.cycleId === selectedYear : true;
      const employeeMatch = selectedEmployeeId ? e.evaluadoId === selectedEmployeeId : true;
      const surveyMatch = selectedSurveyTitle ? e.title === selectedSurveyTitle : true;
      return yearMatch && employeeMatch && surveyMatch;
    });
  }, [evaluations, selectedYear, selectedEmployeeId, selectedSurveyTitle]);

  const { chartData, detailedData } = useMemo(() => {
    if (filteredEvaluations.length === 0) {
      return { chartData: [], detailedData: [] };
    }

    const surveyMap = new Map(surveys.map(s => [s.title, s]));
    const categoryScores: { [key: string]: { totalScore: number; count: number } } = {};
    const detailedResult: { categoryName: string; itemName: string; score: number, comment?: string, evaluator: string }[] = [];

    for (const e of filteredEvaluations) {
      const survey = surveyMap.get(e.title);
      if (!survey || !e.answers?.competencies) continue;

      survey.competencyCategories.forEach(category => {
        if (!categoryScores[category.name]) {
          categoryScores[category.name] = { totalScore: 0, count: 0 };
        }
        
        category.items.forEach(item => {
           const answer = e.answers.competencies?.[item.id];
           if (answer) {
               categoryScores[category.name].totalScore += answer.score;
               categoryScores[category.name].count += 1;
               detailedResult.push({
                   categoryName: category.name,
                   itemName: item.title,
                   score: answer.score,
                   comment: answer.comment,
                   evaluator: e.evaluadorName || 'Unknown'
               });
           }
        });
      });

      survey.paragraphQuestions.forEach(question => {
          const answer = e.answers?.paragraphs?.[question.id];
          if(answer) {
               detailedResult.push({
                   categoryName: 'Open-ended Questions',
                   itemName: question.title,
                   score: -1, // Indicates paragraph
                   comment: answer,
                   evaluator: e.evaluadorName || 'Unknown'
               });
          }
      });
    }

    const finalChartData = Object.entries(categoryScores).map(([name, data]) => ({
      name,
      averageScore: data.count > 0 ? parseFloat((data.totalScore / data.count).toFixed(2)) : 0,
    }));
    
    return { chartData: finalChartData, detailedData: detailedResult };
  }, [filteredEvaluations]);

  const resetFilters = () => {
      setSelectedYear(years.length > 0 ? years[0] : '');
      setSelectedEmployeeId('');
      setSelectedSurveyTitle('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/evaluations">
              <ArrowLeft />
              Back to Evaluations
            </Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold">Evaluation Results</h1>
          <p className="text-muted-foreground">Analyze and visualize completed performance evaluations.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Use the filters below to segment the evaluation data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSurveyTitle} onValueChange={setSelectedSurveyTitle}>
            <SelectTrigger>
              <SelectValue placeholder="Select Evaluation" />
            </SelectTrigger>
            <SelectContent>
              {surveyTitles.map(title => <SelectItem key={title} value={title}>{title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={resetFilters} variant="ghost" className="lg:justify-self-end">
              <FilterX className="mr-2 h-4 w-4"/>
              Reset Filters
          </Button>
        </CardContent>
      </Card>

      {loading ? (
          <Skeleton className="h-96 w-full" />
      ) : filteredEvaluations.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Competency Score Summary</CardTitle>
              <CardDescription>Average scores for each competency category based on selected filters.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <BarChart data={chartData} accessibilityLayer margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 5]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="averageScore" fill="var(--color-averageScore)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>Individual answers and comments from the selected evaluations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Item / Question</TableHead>
                            <TableHead>Score / Answer</TableHead>
                            <TableHead>Evaluator</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {detailedData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium align-top">{item.categoryName}</TableCell>
                                <TableCell className="align-top">{item.itemName}</TableCell>
                                <TableCell className="align-top">
                                    {item.score === -1 ? (
                                        <p className="text-sm text-muted-foreground italic">"{item.comment}"</p>
                                    ) : (
                                        <>
                                            <p className="font-semibold">{item.score} / 5</p>
                                            {item.comment && <p className="text-xs text-muted-foreground italic mt-1">"{item.comment}"</p>}
                                        </>
                                    )}
                                </TableCell>
                                <TableCell className="align-top">{item.evaluator}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No completed evaluations match the selected filters.</p>
        </Card>
      )}
    </div>
  );
}

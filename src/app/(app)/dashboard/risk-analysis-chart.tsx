// src/app/(app)/dashboard/risk-analysis-chart.tsx
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const chartConfig = {
  count: {
    label: 'Employees',
  },
  'Muy Alto': { color: 'hsl(var(--destructive))' },
  'Alto': { color: 'hsl(var(--destructive) / 0.7)' },
  'Medio': { color: 'hsl(30 80% 55%)' },
  'Bajo': { color: 'hsl(var(--chart-2))' },
  'Nulo': { color: 'hsl(var(--chart-2) / 0.6)' },
};

export default function RiskAnalysisChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!isManagerOrAdmin) {
          setLoading(false);
          return;
      }
      try {
        const snapshot = await getDocs(collection(db, 'psychosocialAssessments'));
        const riskLevels = {
          'Nulo': 0,
          'Bajo': 0,
          'Medio': 0,
          'Alto': 0,
          'Muy Alto': 0,
        };

        snapshot.forEach((doc) => {
          const level = doc.data().riskLevel;
          if (level in riskLevels) {
            riskLevels[level]++;
          }
        });

        const formattedData = Object.entries(riskLevels).map(([name, count]) => ({
          name,
          count,
          fill: `var(--color-${name})`
        }));
        
        setChartData(formattedData as any);
      } catch (error) {
        console.error('Error fetching chart data: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [isManagerOrAdmin]);

  if (!isManagerOrAdmin) {
      return null; // Don't render the chart for non-managers
  }

  if (loading) {
      return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Psychosocial Risk Analysis</CardTitle>
        <CardDescription>Distribution of risk levels across the organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="count" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

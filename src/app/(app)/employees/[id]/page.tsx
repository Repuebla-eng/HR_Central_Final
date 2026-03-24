'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileTab from "./profile-tab";
import PerformanceTab from "./performance-tab";
import DocumentsTab from "./documents-tab";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from '@/lib/types';
import { User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'employees', employeeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setEmployee({
                id: docSnap.id,
                ...data,
                hireDate: data.hireDate?.toDate ? data.hireDate.toDate() : new Date(),
            } as Employee);
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
        fetchEmployee();
    }
  }, [employeeId]);
  
  if (loading) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-5 w-5" />
                    <span>Employee Profile</span>
                </div>
                <Skeleton className="h-9 w-48" />
            </div>
             <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    )
  }
  
  if (!employee) {
    return <div>Employee not found.</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <User className="h-5 w-5" />
            <span>Employee Profile</span>
        </div>
        <h1 className="text-3xl font-headline font-bold">{employee.name}</h1>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab employee={employee} />
        </TabsContent>
        <TabsContent value="performance">
          <PerformanceTab employeeId={employeeId} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab employeeId={employeeId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

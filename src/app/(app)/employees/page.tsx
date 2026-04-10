
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Employee } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeFormDialog from "./employee-form-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/lib/firebase/errors";
import { errorEmitter } from "@/lib/firebase/error-emitter";


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);

  const fetchEmployees = useCallback(() => {
     if (user && !isManagerOrAdmin) {
        toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.'});
        router.push('/dashboard');
        setLoading(false);
        return () => {};
    }
     setLoading(true);
      const q = query(
        collection(db, "employees"), 
        where("status", "!=", "Terminated"),
        orderBy("status"),
        orderBy("name")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const employeesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            hireDate: data.hireDate?.toDate ? data.hireDate.toDate() : new Date(),
          } as Employee;
        });
        setEmployees(employeesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching employees:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'employees',
          operation: 'list'
        }));
        setLoading(false);
      });

      return unsubscribe;
  }, [user, isManagerOrAdmin, router, toast]);

  useEffect(() => {
    if (!user) return; // Wait until user auth state is determined
    const unsubscribe = fetchEmployees();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchEmployees, user]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'On Leave': return 'secondary';
      case 'Terminated': return 'destructive';
      default: return 'outline';
    }
  }

  const renderSkeleton = () => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  )
  
  if (!isManagerOrAdmin && !loading) {
      return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Employees</CardTitle>
            <CardDescription>A list of all employees in the organization.</CardDescription>
        </div>
        {isManagerOrAdmin && (
          <EmployeeFormDialog onEmployeeUpdated={fetchEmployees}>
             <Button>
                Add Employee
            </Button>
          </EmployeeFormDialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Job Title</TableHead>
              <TableHead className="hidden lg:table-cell">Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {renderSkeleton()}
                {renderSkeleton()}
                {renderSkeleton()}
              </>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Link href={`/employees/${employee.id}`} className="flex items-center gap-4 hover:underline">
                      <Avatar>
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                        <AvatarFallback>{employee.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.jobTitle}</TableCell>
                  <TableCell className="hidden lg:table-cell">{employee.department}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(employee.status) as any}>{employee.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isManagerOrAdmin && (
                        <EmployeeFormDialog employee={employee} onEmployeeUpdated={fetchEmployees}>
                             <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </EmployeeFormDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

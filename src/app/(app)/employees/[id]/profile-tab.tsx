// src/app/(app)/employees/[id]/profile-tab.tsx
'use client';

import type { Employee } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function ProfileTab({ employee }: { employee: Employee }) {

  if (!employee) {
    return (
      <Card>
        <CardContent>
          <p>Employee not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Avatar className="h-32 w-32 border-4 border-primary/20">
                            <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-headline">{employee.name}</CardTitle>
                            <CardDescription>{employee.jobTitle}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="text-center">
                     <p className="text-sm text-muted-foreground">UID: {employee.uid}</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{employee.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Department</p>
                            <p>{employee.department}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p>{employee.status}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Hire Date</p>
                            <p>{format(employee.hireDate, 'MMMM d, yyyy')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { LeaveRequest, Employee } from '@/lib/types';
import { format, getMonth, getYear, differenceInHours, differenceInDays } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles: { [key: string]: string } = {
  Approved: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
  Pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
  Delegated: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
};

const months = [
  { value: '0', label: 'January' }, { value: '1', label: 'February' }, { value: '2', label: 'March' }, 
  { value: '3', label: 'April' }, { value: '4', label: 'May' }, { value: '5', label: 'June' }, 
  { value: '6', label: 'July' }, { value: '7', label: 'August' }, { value: '8', label: 'September' }, 
  { value: '9', label: 'October' }, { value: '10', label: 'November' }, { value: '11', label: 'December' }
];

const DAILY_HOURS_EQUIVALENT = 8;

export default function LeaveSummaryPage() {
  const { role, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const isAuthorized = useMemo(() => role === 'admin' || role === 'manager', [role]);

  useEffect(() => {
    if (!isAuthorized) {
        setLoading(false);
        return;
    };

    const fetchData = async () => {
      try {
        const reqQuery = query(collection(db, 'leaveRequests'));
        const empQuery = query(collection(db, 'employees'));

        const [requestsSnapshot, employeesSnapshot] = await Promise.all([
          getDocs(reqQuery),
          getDocs(empQuery)
        ]);

        const fetchedRequests = requestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as LeaveRequest[];
        const fetchedEmployees = employeesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Employee[];

        setRequests(fetchedRequests.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        setEmployees(fetchedEmployees.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching leave summary data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [isAuthorized]);

  const filteredRequests = useMemo(() => {
    let result = requests;
    const currentYear = getYear(new Date());

    if (selectedUser) {
      result = result.filter(req => req.requesterId === selectedUser);
    }

    if (selectedMonth) {
        const monthNumber = parseInt(selectedMonth, 10);
        result = result.filter(req => {
            const reqDate = req.startDate.toDate();
            return getMonth(reqDate) === monthNumber && getYear(reqDate) === currentYear;
        });
    }

    return result;
  }, [requests, selectedUser, selectedMonth]);

  const totalApprovedHours = useMemo(() => {
    return filteredRequests.reduce((total, req) => {
        if (req.status === 'Approved') {
            const startDate = req.startDate.toDate();
            const endDate = req.endDate.toDate();

            if (req.requestType === 'hourly') {
                total += differenceInHours(endDate, startDate);
            } else if (req.requestType === 'daily') {
                // Add 1 to include the start day in the calculation
                const dayDiff = differenceInDays(endDate, startDate) + 1;
                total += dayDiff * DAILY_HOURS_EQUIVALENT;
            }
        }
        return total;
    }, 0);
  }, [filteredRequests]);

  const handleClearFilters = () => {
      setSelectedUser('');
      setSelectedMonth('');
  }

  if (authLoading || loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-64"/>
                <Skeleton className="h-4 w-80 mt-2"/>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-48"/>
                    <Skeleton className="h-10 w-48"/>
                    <Skeleton className="h-10 w-24"/>
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-5 w-1/5" />
                        <Skeleton className="h-5 w-1/5" />
                        <Skeleton className="h-5 w-1/5" />
                        <Skeleton className="h-5 w-1/5" />
                        <Skeleton className="h-5 w-1/5" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Leave Summary</CardTitle>
        <CardDescription>View, filter, and count all employee leave and vacation requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Total Approved Hours</h3>
                <p className="text-2xl font-bold">{totalApprovedHours}</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Employee" />
                </SelectTrigger>
                <SelectContent>
                    {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.requesterName}</TableCell>
                  <TableCell className="capitalize">{req.requestType}</TableCell>
                  <TableCell>{format(req.startDate.toDate(), 'PPP p')}</TableCell>
                  <TableCell>{format(req.endDate.toDate(), 'PPP p')}</TableCell>
                  <TableCell>
                    <Badge className={statusStyles[req.status] || statusStyles.default}>
                      {req.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No requests found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

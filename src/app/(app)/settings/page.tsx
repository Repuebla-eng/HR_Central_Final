
'use client';
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Employee } from "@/lib/types";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function SettingsPage() {
    const { user, role } = useAuth();
    const { toast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (role !== 'admin') {
                setLoading(false);
                return;
            }
            try {
                const querySnapshot = await getDocs(collection(db, "employees"));
                const employeesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                    } as Employee;
                });
                setEmployees(employeesData);
            } catch (error) {
                console.error("Error fetching employees:", error);
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch employee list.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [role, toast]);

    const handleRoleChange = async (employeeId: string, newRole: UserRole) => {
        try {
            // Note: This only updates Firestore. A backend function is needed to update the actual Custom Claim.
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                role: newRole
            });
            
            setEmployees(prevEmployees => 
                prevEmployees.map(emp => 
                    emp.id === employeeId ? { ...emp, role: newRole } : emp
                )
            );

            toast({
                title: "Role Updated in Firestore",
                description: `Run the set-admin script to apply the '${newRole}' role claim.`,
            });
        } catch (error) {
            console.error("Error updating role: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update user role in Firestore.",
            });
        }
    };


    if (role !== 'admin') {
        return (
            <Card className="flex items-center justify-center h-64">
                <CardContent className="text-center pt-6">
                    <p className="text-lg text-muted-foreground">You do not have permission to view this page.</p>
                    <p className="text-sm text-muted-foreground">This page is for administrators only.</p>
                </CardContent>
            </Card>
        )
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
            <TableCell><Skeleton className="h-8 w-32" /></TableCell>
        </TableRow>
    )

  return (
    <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">User Role Management</CardTitle>
                <CardDescription>Assign roles to users in the system. Changes are saved to the database.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="w-[200px]">Role in Database</TableHead>
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
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                                                <AvatarFallback>{employee.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{employee.name}</div>
                                                <div className="text-sm text-muted-foreground">{employee.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={employee.role || 'employee'}
                                            onValueChange={(newRole: UserRole) => handleRoleChange(employee.id, newRole)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="employee">Employee</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Important: Applying Role Changes</AlertTitle>
            <AlertDescription>
                Changing a role here only updates the Firestore database. For the permissions to take full effect, you must run the `set-admin.js` script from your terminal for that user.
                <br />
                Example: <code className="font-mono bg-muted p-1 rounded">node set-admin.js user@example.com admin</code>
                <br />
                The user will need to sign out and sign back in for the new role to be active.
            </AlertDescription>
        </Alert>
    </div>
  );
}

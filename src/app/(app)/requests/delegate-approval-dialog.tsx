'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Employee } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

interface DelegateApprovalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelegate: (delegateId: string, delegateName: string) => void;
}

type SelectedEmployee = {
    id: string;
    name: string;
};

export default function DelegateApprovalDialog({ isOpen, onOpenChange, onDelegate }: DelegateApprovalDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if(user) {
        const fetchEmployees = async () => {
        // Fetch all active employees except the current user
        const q = query(
            collection(db, 'employees'), 
            where('status', '==', 'Active'), 
            where('uid', '!=', user.uid)
        );
        const snapshot = await getDocs(q);
        const employeeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(employeeList);
        };
        fetchEmployees();
    }
  }, [user]);

  const handleSelectChange = (value: string) => {
      try {
          const parsed: SelectedEmployee = JSON.parse(value);
          setSelectedEmployee(parsed);
      } catch(e) {
          console.error("Invalid employee data selected", e)
          setSelectedEmployee(null);
      }
  }

  const handleDelegate = () => {
    if (selectedEmployee) {
      onDelegate(selectedEmployee.id, selectedEmployee.name);
      onOpenChange(false); // Close dialog after action
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delegate Approval Authority</DialogTitle>
          <DialogDescription>Select an employee to delegate your approval responsibilities to.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={JSON.stringify({ id: emp.id, name: emp.name })}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDelegate} disabled={!selectedEmployee}>Delegate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

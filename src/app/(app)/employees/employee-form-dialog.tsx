'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { Employee, JobTitle } from '@/lib/types';
import { format, parse, isValid } from 'date-fns';
import { createEmployee } from './actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  jobTitle: z.string().min(1, 'Please select a job title.'),
  department: z.string().min(2, 'Department must be at least 2 characters.'),
  status: z.enum(['Active', 'On Leave', 'Terminated']),
  hireDate: z.date(),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
});

interface EmployeeFormDialogProps {
  employee?: Employee; // Now optional
  onEmployeeUpdated: () => void;
  children: React.ReactNode;
}

export default function EmployeeFormDialog({
  employee,
  onEmployeeUpdated,
  children,
}: EmployeeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      jobTitle: '',
      department: '',
      status: 'Active',
      hireDate: new Date(),
      password: '',
    }
  });
  
  useEffect(() => {
    async function fetchJobTitles() {
      if (!open) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'jobTitles'));
        const titles = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as JobTitle)
        );
        setJobTitles(titles);
      } catch (error) {
        console.error('Error fetching job titles: ', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch job titles for the form.',
        });
      }
    }
    fetchJobTitles();
  }, [open, toast]);

  useEffect(() => {
    if (open && employee) {
        form.reset({
            ...employee,
            hireDate: employee.hireDate instanceof Timestamp ? employee.hireDate.toDate() : employee.hireDate,
        });
    }
  }, [employee, form, open]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (employee) {
        // Edit Mode
        const employeeRef = doc(db, 'employees', employee.id);
        await updateDoc(employeeRef, {
            ...values,
            hireDate: Timestamp.fromDate(values.hireDate),
        });
        toast({
          title: 'Success',
          description: 'Employee details have been updated.',
        });
      } else {
        // Create Mode
        const result = await createEmployee({
          ...values,
          password: values.password || undefined,
        });

        if (!result.success) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error,
          });
          setLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'New employee has been registered successfully.',
        });
      }
      
      onEmployeeUpdated();
      setOpen(false);
      if (!employee) form.reset();
    } catch (error: any) {
      console.error('Error in onSubmit:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Registro',
        description: error.message || 'No se pudo registrar el empleado. Por favor, intente de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Register New Employee'}</DialogTitle>
          <DialogDescription>
            {employee 
              ? 'Update the details for this employee.' 
              : 'Enter the details to create a new employee account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} disabled={!!employee} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {!employee && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min 6 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                        <FormControl>
                        <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select a job role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {jobTitles.map(jt => (
                            <SelectItem key={jt.id} value={jt.title}>{jt.title}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Production" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                            <FormControl>
                            <SelectTrigger id={field.name}>
                                <SelectValue placeholder="Select employee status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                                <SelectItem value="Terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Hire Date</FormLabel>
                            <Popover>
                                <div className="relative">
                                <FormControl>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                                            if (isValid(date)) {
                                                field.onChange(date);
                                            }
                                        }}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </FormControl>
                                <PopoverTrigger asChild>
                                   <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3">
                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                        <span className="sr-only">Open calendar</span>
                                   </Button>
                                </PopoverTrigger>
                                </div>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => date && field.onChange(date)}
                                        defaultMonth={field.value}
                                        initialFocus
                                        captionLayout="dropdown-buttons"
                                        fromYear={1960}
                                        toYear={new Date().getFullYear()}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || (jobTitles.length === 0 && !employee)}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Saving...' : (employee ? 'Save Changes' : 'Register Employee')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

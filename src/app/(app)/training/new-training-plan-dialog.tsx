// src/app/(app)/training/new-training-plan-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { Employee, Course } from '@/lib/types';
import { format } from 'date-fns';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Library, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Please select the employee to be trained.'),
  trainingReason: z.string().min(10, 'Please provide a reason for the training.'),
  assignedCourseId: z.string().optional(),
  deadline: z.date().optional(),
});

interface NewTrainingPlanDialogProps {
  onPlanCreated: () => void;
  triggerButton?: React.ReactNode;
  initialValues?: Partial<z.infer<typeof formSchema>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NewTrainingPlanDialog({
  onPlanCreated,
  triggerButton,
  initialValues,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: NewTrainingPlanDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {},
  });
  
  useEffect(() => {
    if (open) {
        form.reset(initialValues || {
            employeeId: '',
            trainingReason: '',
            assignedCourseId: undefined,
            deadline: undefined,
        });
    }
  }, [initialValues, form, open]);


  useEffect(() => {
    async function fetchData() {
      if (!open) return;
      setLoading(true);
      try {
        const employeesPromise = getDocs(collection(db, 'employees'));
        const coursesPromise = getDocs(collection(db, 'courses'));

        const [employeeSnapshot, courseSnapshot] = await Promise.all([employeesPromise, coursesPromise]);
        
        const employeeList = employeeSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Employee)
        );
        setEmployees(employeeList);
        
        const courseList = courseSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Course)
        );
        setCourses(courseList);

      } catch (error) {
        console.error('Error fetching data: ', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch employees or courses.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [open, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'trainingPlans'), {
        ...values,
        deadline: values.deadline ? Timestamp.fromDate(values.deadline) : null,
        status: 'Pending',
        creatorId: user.uid,
      });
      toast({
        title: 'Éxito',
        description: 'The new training plan has been assigned.',
      });
      onPlanCreated();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating training plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not assign the new training plan.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      {!triggerButton && controlledOpen === undefined && (
         <DialogTrigger asChild>
            <Button>
                <Library className="mr-2 h-4 w-4" />
                New Training Plan
            </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Training Plan</DialogTitle>
          <DialogDescription>
            Assign a new training plan to an employee to address a specific need.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!initialValues?.employeeId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trainingReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Reason / Gap Description</FormLabel>
                   <FormControl>
                        <Textarea 
                            placeholder="Describe the competency gap or reason for this training..." 
                            {...field}
                            readOnly={!!initialValues?.trainingReason} 
                            className={initialValues?.trainingReason ? "bg-muted/50" : ""}
                        />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="assignedCourseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Course (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course from the catalog" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || (employees.length === 0 && !initialValues?.employeeId) }>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Assigning...' : 'Assign Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

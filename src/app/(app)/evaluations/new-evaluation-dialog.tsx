// src/app/(app)/evaluations/new-evaluation-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { Employee, EvaluationRelation, EvaluationType } from '@/lib/types';
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
import { Loader2, PlusCircle, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const evaluationRelations: EvaluationRelation[] = ['Superior', 'Par', 'Subordinado', 'Autoevaluación'];
const evaluationTitles = [
    'Evaluación 360',
    'Evaluación Ayudante de Inspección',
    'Evaluación Coordinador Administrativo',
    'Evaluación Coordinador de Producción',
    'Evaluación Inspector de Ensayos No Destructivos Nivel 2',
    'Evaluación Superintendente de Operaciones',
    'Evaluación Supervisor de Inspección',
];

const formSchema = z.object({
  title: z.string().min(1, 'Please select a title.'),
  evaluadoId: z.string().min(1, 'Please select the employee to be evaluated.'),
  evaluadorId: z.string().min(1, 'Please select the evaluator.'),
  relation: z.enum(evaluationRelations),
  deadline: z.date({
    required_error: 'A deadline is required.',
  }),
});

interface NewEvaluationDialogProps {
  onEvaluationCreated: () => void;
}

export default function NewEvaluationDialog({ onEvaluationCreated }: NewEvaluationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: 'Evaluación 360',
      relation: 'Par',
    },
  });

  useEffect(() => {
    async function fetchEmployees() {
      if (!open) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        const employeeList = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Employee)
        );
        setEmployees(employeeList);
      } catch (error) {
        console.error('Error fetching employees: ', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch employees for the form.',
        });
      }
    }
    fetchEmployees();
  }, [open, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setLoading(true);

    const evaluadoName = employees.find(e => e.id === values.evaluadoId)?.name;
    const evaluadorName = employees.find(e => e.id === values.evaluadorId)?.name;
    
    const type: EvaluationType = values.title === 'Evaluación 360' ? '360' : 'Desempeño';


    try {
      await addDoc(collection(db, 'evaluations'), {
        ...values,
        type,
        deadline: Timestamp.fromDate(values.deadline),
        status: 'Pendiente',
        isConfidential: values.relation !== 'Superior', // Confidential unless it's the superior
        cycleId: new Date().getFullYear().toString(), // Example cycle ID
        evaluadoName, // Denormalized
        evaluadorName, // Denormalized
      });
      toast({
        title: 'Success',
        description: 'New evaluation has been assigned.',
      });
      onEvaluationCreated();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign the new evaluation.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Evaluation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign New Evaluation</DialogTitle>
          <DialogDescription>
            Create an evaluation task and assign it to an employee.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation Title</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an evaluation title" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {evaluationTitles.sort().map(title => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                control={form.control}
                name="relation"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a relationship" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {evaluationRelations.map(rel => (
                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
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
                        <FormLabel>Deadline</FormLabel>
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
            </div>
            <FormField
              control={form.control}
              name="evaluadoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee to Evaluate</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="evaluadorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluator</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || employees.length === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Assigning...' : 'Assign Evaluation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

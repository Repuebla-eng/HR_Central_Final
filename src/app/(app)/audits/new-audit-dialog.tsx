// src/app/(app)/audits/new-audit-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { Employee, TechnicalAuditType } from '@/lib/types';
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
import { Loader2, PlusCircle, CalendarIcon, ClipboardCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const auditTypes: TechnicalAuditType[] = [
    'Inspección con Partículas Magnéticas',
    'Medición de espesores con UT',
    'Inspección Visual y Dimensional',
    'Inspección con Tintas Penetrantes',
    'Inspección con Ultrasonido',
];

const formSchema = z.object({
  auditType: z.string().min(1, 'Por favor seleccione un tipo de auditoría.'),
  evaluadoId: z.string().min(1, 'Por favor seleccione el empleado a ser auditado.'),
  deadline: z.date({
    required_error: 'La fecha límite es requerida.',
  }),
});

interface NewAuditDialogProps {
  onAuditCreated: () => void;
}

export default function NewAuditDialog({ onAuditCreated }: NewAuditDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      auditType: 'Inspección con Partículas Magnéticas',
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
          description: 'No se pudo obtener la lista de empleados.',
        });
      }
    }
    fetchEmployees();
  }, [open, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setLoading(true);

    const evaluatedName = employees.find(e => e.id === values.evaluadoId)?.name;

    try {
      await addDoc(collection(db, 'technicalAudits'), {
        ...values,
        deadline: Timestamp.fromDate(values.deadline),
        status: 'Pendiente',
        evaluatedName, // Denormalized
        creatorId: user.uid,
      });
      toast({
        title: 'Éxito',
        description: 'La nueva auditoría de competencia ha sido asignada.',
      });
      onAuditCreated();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating audit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo asignar la nueva auditoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Nueva Auditoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar Auditoría de Competencia Técnica</DialogTitle>
          <DialogDescription>
            Cree una tarea de auditoría técnica y asígnela a un inspector.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="auditType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Auditoría Técnica</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de auditoría" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {auditTypes.map(title => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="evaluadoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspector a Auditar</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un inspector" />
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
                name="deadline"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Fecha Límite</FormLabel>
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
                                <span>Seleccionar fecha</span>
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
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || employees.length === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Asignando...' : 'Asignar Auditoría'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

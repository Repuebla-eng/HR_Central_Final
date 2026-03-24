// src/app/(app)/employees/[id]/assess-competency-dialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { Competency } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
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
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  achievedLevel: z.coerce.number().min(1).max(5),
});

type CompetencyData = Competency & { achievedLevel?: number, assessmentDate?: Date };

interface AssessCompetencyDialogProps {
    children: React.ReactNode;
    competency: CompetencyData;
    employeeId: string;
    assessorId: string;
    disabled?: boolean;
    onAssessmentSaved: () => void;
}

export default function AssessCompetencyDialog({ children, competency, employeeId, assessorId, disabled, onAssessmentSaved }: AssessCompetencyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      achievedLevel: competency.achievedLevel || 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const assessmentRef = doc(db, 'employees', employeeId, 'competencyAssessments', competency.id);
      
      const assessmentData = {
        competencyId: competency.id,
        competencyName: competency.name,
        requiredLevel: competency.requiredLevel,
        achievedLevel: values.achievedLevel,
        assessmentDate: serverTimestamp(),
        assessorId: assessorId,
      };

      await setDoc(assessmentRef, assessmentData);

      toast({
        title: 'Success',
        description: `Competency "${competency.name}" has been assessed.`,
      });
      onAssessmentSaved(); // Re-fetch data in the parent component
      setOpen(false);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the assessment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if(disabled) return;
    if (isOpen) {
      form.reset({ achievedLevel: competency.achievedLevel || 1 });
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assess: {competency.name}</DialogTitle>
          <DialogDescription>
            Evaluate the employee's proficiency level for this competency. Required level is {competency.requiredLevel}.
            {competency.assessmentDate && <span className="block text-xs text-muted-foreground mt-2">Last assessed on {format(competency.assessmentDate, 'PPP')}</span>}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="achievedLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Achieved Level (1-5)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an achieved level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1,2,3,4,5].map(level => (
                        <SelectItem key={level} value={String(level)}>Level {level}</SelectItem>
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
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Saving...' : 'Save Assessment'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

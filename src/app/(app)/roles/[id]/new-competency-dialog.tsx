
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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
import { Loader2, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  competencyId: z.string().min(1, { message: 'Please select a competency.' }),
  requiredLevel: z.coerce.number().min(1).max(5),
});

export default function NewCompetencyDialog({ jobTitleId, existingCompetencyIds }: { jobTitleId: string, existingCompetencyIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCompetencies, setAvailableCompetencies] = useState<Competency[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competencyId: '',
      requiredLevel: 3,
    },
  });

  useEffect(() => {
    if (!open) return;

    const q = query(collection(db, "competencies"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allCompetencies = snapshot.docs.map(d => ({id: d.id, ...d.data()} as Competency));
        const filtered = allCompetencies.filter(c => !existingCompetencyIds.includes(c.id));
        setAvailableCompetencies(filtered);
    });
    
    return () => unsubscribe();
  }, [open, existingCompetencyIds]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const jobTitleRef = doc(db, 'jobTitles', jobTitleId);
      await updateDoc(jobTitleRef, {
          competencies: arrayUnion({
              competencyId: values.competencyId,
              requiredLevel: values.requiredLevel
          })
      });

      toast({
        title: 'Success',
        description: 'Competency has been linked to this role.',
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error linking competency:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to link competency.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Link Competency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Competency to Role</DialogTitle>
          <DialogDescription>
            Select a competency from the catalog and set the required level for this role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="competencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competency</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a competency to add" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCompetencies.length > 0 ? availableCompetencies.map(comp => (
                        <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
                      )) : <SelectItem value="-" disabled>No more competencies to add</SelectItem>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiredLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Level (1-5)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a required level" />
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
                <Button type="submit" disabled={loading || availableCompetencies.length === 0}>
                    {loading && <Loader2 className="animate-spin" />}
                    {loading ? 'Linking...' : 'Link Competency'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

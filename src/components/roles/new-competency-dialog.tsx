
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { CompetencyCategory } from '@/lib/types';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  requiredLevel: z.coerce.number().min(1).max(5),
  evidenceRequired: z.string().min(5, { message: 'Evidence description must be at least 5 characters.' }),
  category: z.enum(['Técnica', 'Blanda', 'De Gestión', 'Estratégica']),
});

export default function NewCompetencyDialog({ jobTitleId }: { jobTitleId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      requiredLevel: 3,
      evidenceRequired: '',
      category: 'Técnica'
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'jobTitles', jobTitleId, 'competencies'), values);
      toast({
        title: 'Success',
        description: 'New competency has been added.',
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating competency:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add new competency.',
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
          Add Competency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Competency</DialogTitle>
          <DialogDescription>
            Define a required competency and the criteria to measure it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competency Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Knowledge of ISO 9001:2015" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this competency entails."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="evidenceRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence Required</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Certification, Project delivery" {...field} />
                  </FormControl>
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
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />}
                    {loading ? 'Adding...' : 'Add Competency'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

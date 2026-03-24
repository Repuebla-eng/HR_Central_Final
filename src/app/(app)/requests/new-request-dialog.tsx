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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { LeaveRequest } from '@/lib/types';

const requestSchema = z.object({
  requestType: z.enum(['hourly', 'daily', 'vacation'], { required_error: 'Please select a request type.' }),
  startDate: z.string().nonempty('Start date is required.'),
  endDate: z.string().nonempty('End date is required.'),
  reason: z.string().nonempty('Reason is required.').min(10, 'Reason must be at least 10 characters.'),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type RequestFormValues = z.infer<typeof requestSchema>;

const APPROVER_TITLES = {
  OPERATIONS_SUPERINTENDENT: 'Superintendente de Operaciones',
  HR_MANAGER: 'Gerente de Recursos Humanos',
};

export default function NewRequestDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }) {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestType: 'hourly', 
      startDate: '',
      endDate: '',
      reason: '',
    }
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const findApproverId = async (jobTitle: string): Promise<string | null> => {
    const q = query(collection(db, 'employees'), where('jobTitle', '==', jobTitle));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  };

  const onSubmit = async (data: RequestFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to submit a request.' });
      return;
    }

    try {
      const employeeDocRef = doc(db, 'employees', user.uid);
      const employeeDoc = await getDoc(employeeDocRef);
      if (!employeeDoc.exists()) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not find your employee record.' });
          return;
      }
      const employeeName = employeeDoc.data().name;

      const superintendentId = await findApproverId(APPROVER_TITLES.OPERATIONS_SUPERINTENDENT);
      if (!superintendentId) {
        toast({ variant: 'destructive', title: 'Configuration Error', description: `Could not find approver with title: ${APPROVER_TITLES.OPERATIONS_SUPERINTENDENT}` });
        return;
      }

      const newRequest: Omit<LeaveRequest, 'id'> = {
        requesterId: user.uid,
        requesterName: employeeName, 
        requestType: data.requestType,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        endDate: Timestamp.fromDate(new Date(data.endDate)),
        reason: data.reason,
        status: 'Pending',
        createdAt: Timestamp.now(),
        approvers: {
          operationsSuperintendent: {
            approverId: superintendentId,
            status: 'Pending',
          },
        },
      };

      if (data.requestType === 'daily' || data.requestType === 'vacation') {
        const hrManagerId = await findApproverId(APPROVER_TITLES.HR_MANAGER);
        if (!hrManagerId) {
          toast({ variant: 'destructive', title: 'Configuration Error', description: `Could not find approver with title: ${APPROVER_TITLES.HR_MANAGER}` });
          return;
        }
        newRequest.approvers.hrManager = {
          approverId: hrManagerId,
          status: 'Pending',
        };
      }

      await addDoc(collection(db, 'leaveRequests'), newRequest);
      
      toast({ title: 'Success', description: 'Your leave request has been submitted.' });
      form.reset();
      onOpenChange(false);

    } catch (error) {
      console.error("Error submitting request:", error);
      toast({ variant: 'destructive', title: 'Submission Error', description: 'An unexpected error occurred.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogDescription>Fill out the form to request leave.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Request Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="hourly" />
                        </FormControl>
                        <FormLabel className="font-normal">Hourly</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="daily" />
                        </FormControl>
                        <FormLabel className="font-normal">Daily</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="vacation" />
                        </FormControl>
                        <FormLabel className="font-normal">Vacation</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date/Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date/Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Explain the reason for your leave..."/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
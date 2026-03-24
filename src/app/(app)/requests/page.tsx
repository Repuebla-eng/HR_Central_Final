'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NewRequestDialog from './new-request-dialog';
import DelegateApprovalDialog from './delegate-approval-dialog';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, writeBatch, Timestamp, runTransaction } from 'firebase/firestore';
import type { LeaveRequest, Delegation } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const APPROVER_TITLE = 'Superintendente de Operaciones';

// Define styles for badges for better readability and maintenance
const statusStyles: { [key: string]: string } = {
  Approved: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
  Pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
  Delegated: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
};


export default function RequestsPage() {
  const [isNewRequestDialogOpen, setNewRequestDialogOpen] = useState(false);
  const [isDelegateDialogOpen, setDelegateDialogOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperintendent, setIsSuperintendent] = useState(false);
  const [activeDelegation, setActiveDelegation] = useState<Delegation | null>(null);
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading || !user) return;
  
    const checkRoleAndDelegation = async () => {
      const userDoc = await getDoc(doc(db, 'employees', user.uid));
      if (userDoc.exists() && userDoc.data().jobTitle === APPROVER_TITLE) {
        setIsSuperintendent(true);
        const delegationDocRef = doc(db, 'delegations', user.uid);
        const unsubscribe = onSnapshot(delegationDocRef, (doc) => {
          if (doc.exists() && doc.data().active) {
            setActiveDelegation(doc.data() as Delegation);
          } else {
            setActiveDelegation(null);
          }
        });
        return unsubscribe; // Return unsubscribe for cleanup
      }
    };
  
    const unsubscribeDelegation = checkRoleAndDelegation();
  
    return () => {
      unsubscribeDelegation?.then(unsub => unsub && unsub());
    };
  }, [user, authLoading]);
  

  useEffect(() => {
    if (!user || !role) return;
  
    setLoading(true);
    const requestsRef = collection(db, 'leaveRequests');
    let queries = [];
  
    // Build queries based on user role
    if (role === 'admin') {
      queries.push(query(requestsRef));
    } else {
      queries.push(query(requestsRef, where('requesterId', '==', user.uid)));
      queries.push(query(requestsRef, where('approvers.operationsSuperintendent.approverId', '==', user.uid)));
      queries.push(query(requestsRef, where('approvers.operationsSuperintendent.delegatedTo', '==', user.uid)));
      queries.push(query(requestsRef, where('approvers.hrManager.approverId', '==', user.uid)));
    }
  
    const unsubscribes = queries.map(q => {
      return onSnapshot(q, (snapshot) => {
        const fetchedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
        
        // Use a map to merge results and avoid duplicates
        setRequests(prevRequests => {
          const requestsMap = new Map(prevRequests.map(r => [r.id, r]));
          fetchedRequests.forEach(req => requestsMap.set(req.id, req));
          return Array.from(requestsMap.values()).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        });
  
        setLoading(false);
      }, (error) => {
        console.error("Error fetching requests:", error);
        toast({ title: 'Error', description: 'Could not fetch requests.', variant: 'destructive' });
        setLoading(false);
      });
    });
  
    // Cleanup listeners on component unmount
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, role, toast]);


  const handleApproval = useCallback(async (requestId: string, approverKey: 'operationsSuperintendent' | 'hrManager', newStatus: 'Approved' | 'Rejected') => {
    if (!user) return;
    const requestRef = doc(db, 'leaveRequests', requestId);

    try {
      await runTransaction(db, async (transaction) => {
        const requestDoc = await transaction.get(requestRef);
        if (!requestDoc.exists()) {
          throw new Error("Request document does not exist!");
        }

        const currentData = requestDoc.data() as LeaveRequest;
        const updateData: { [key: string]: any } = {};
        
        // Update the specific approver's status
        updateData[`approvers.${approverKey}.status`] = newStatus;

        // Determine the overall status
        if (newStatus === 'Rejected') {
          updateData['status'] = 'Rejected';
        } else {
          // Check if all other required approvers have approved
          const otherApprovers = Object.entries(currentData.approvers)
            .filter(([key]) => key !== approverKey);
          
          const allOthersApproved = otherApprovers.every(([, approver]) => approver.status === 'Approved');
          
          if (allOthersApproved) {
            updateData['status'] = 'Approved';
          }
        }
        
        transaction.update(requestRef, updateData);
      });

      toast({ title: 'Success', description: `Request has been ${newStatus.toLowerCase()}.` });
    } catch (error) {
      console.error("Transaction failed: ", error);
      toast({ title: 'Error', description: 'Failed to update request status.', variant: 'destructive' });
    }
  }, [user, toast]);
  

  const handleDelegation = async (delegateId: string, delegateName: string) => {
      if (!user || !isSuperintendent) return;
      const batch = writeBatch(db);
      const delegationRef = doc(db, 'delegations', user.uid);
      batch.set(delegationRef, { delegateId, delegateName, active: true, delegatedAt: Timestamp.now() });
      
      const q = query(collection(db, 'leaveRequests'), where('approvers.operationsSuperintendent.approverId', '==', user.uid), where('status', '==', 'Pending'));
      const snap = await getDocs(q);

      snap.forEach(doc => {
        batch.update(doc.ref, { 
          'approvers.operationsSuperintendent.delegatedTo': delegateId, 
          'status': 'Delegated' 
        });
      });

      await batch.commit();
      toast({ title: "Success", description: `Approvals delegated to ${delegateName}.`});
      setDelegateDialogOpen(false);
  };


  const handleRevokeDelegation = async () => {
      if (!user || !activeDelegation) return;
      const batch = writeBatch(db);
      const delegationRef = doc(db, 'delegations', user.uid);
      batch.update(delegationRef, { active: false });

      const q = query(collection(db, 'leaveRequests'), where('approvers.operationsSuperintendent.delegatedTo', '==', activeDelegation.delegateId), where('status', '==', 'Delegated'));
      const snap = await getDocs(q);
      snap.forEach(doc => {
        batch.update(doc.ref, { 
          'approvers.operationsSuperintendent.delegatedTo': null, 
          'status': 'Pending' 
        });
      });

      await batch.commit();
      toast({ title: "Success", description: "Delegation has been revoked." });
  }

  const canApprove = (request: LeaveRequest) => {
    if (!user) return null;

    const { operationsSuperintendent, hrManager } = request.approvers;
    const isSuperintendent = operationsSuperintendent.approverId === user.uid;
    const isDelegate = operationsSuperintendent.delegatedTo === user.uid;
    const isHrManager = hrManager?.approverId === user.uid;

    // Handle Superintendent/Delegate approval
    if (operationsSuperintendent.status === 'Pending') {
      // If the request is delegated, only the delegate can approve.
      if (request.status === 'Delegated' && isDelegate) {
        return 'operationsSuperintendent';
      }
      // If the request is pending (not delegated), only the superintendent can approve.
      if (request.status === 'Pending' && isSuperintendent) {
        return 'operationsSuperintendent';
      }
    }

    // Handle HR Manager approval (this is a separate step)
    if (hrManager?.status === 'Pending' && isHrManager) {
      return 'hrManager';
    }

    return null;
  };
  
  const TableSkeleton = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-20" />
          <div className="flex-grow" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle className="font-headline">Leave & Vacation Requests</CardTitle>
              <CardDescription>Manage all your leave and vacation requests.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
              {isSuperintendent && (
                  activeDelegation 
                  ? <Button variant="destructive" onClick={handleRevokeDelegation}>Revoke from {activeDelegation.delegateName}</Button>
                  : <Button variant="outline" onClick={() => setDelegateDialogOpen(true)}>Delegate Approvals</Button>
              )}
              <Button onClick={() => setNewRequestDialogOpen(true)}>New Request</Button>
          </div>
      </CardHeader>
      <CardContent>
        {loading ? <TableSkeleton /> : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Requester</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {requests.length > 0 ? requests.map((req) => {
              const approverKey = canApprove(req);
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.requesterName}</TableCell>
                  <TableCell className="capitalize">{req.requestType}</TableCell>
                  <TableCell>{format(req.startDate.toDate(), 'PPP p')}</TableCell>
                  <TableCell>{format(req.endDate.toDate(), 'PPP p')}</TableCell>
                  <TableCell>
                    <Badge className={statusStyles[req.status] || statusStyles.default}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {approverKey ? (
                      <div className="space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproval(req.id, approverKey, 'Approved')}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleApproval(req.id, approverKey, 'Rejected')}>Reject</Button>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">No pending actions</span>}
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No requests found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
      <NewRequestDialog isOpen={isNewRequestDialogOpen} onOpenChange={setNewRequestDialogOpen} />
      {isSuperintendent && <DelegateApprovalDialog isOpen={isDelegateDialogOpen} onOpenChange={setDelegateDialogOpen} onDelegate={handleDelegation}/>}
    </Card>
  );
}

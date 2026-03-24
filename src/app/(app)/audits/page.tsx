
// src/app/(app)/audits/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { TechnicalAudit, TechnicalAuditStatus } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePen, Check, Clock, Trash2, Loader2, ClipboardCheck } from 'lucide-react';
import NewAuditDialog from './new-audit-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

export default function AuditsPage() {
  const [pendingAudits, setPendingAudits] = useState<TechnicalAudit[]>([]);
  const [completedAudits, setCompletedAudits] = useState<TechnicalAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isManagerOrAdmin = role && ['manager', 'admin'].includes(role);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<TechnicalAudit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshAudits = useCallback(() => {
    let unsubPending: () => void = () => {};
    let unsubCompleted: () => void = () => {};
    
    if (!user) {
        setLoading(false);
        return () => {};
    }
     if (user && !isManagerOrAdmin) {
        toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.'});
        router.push('/dashboard');
        setLoading(false);
        return () => {};
    }
    
    setLoading(true);

    const pendingQuery = query(collection(db, "technicalAudits"), where("status", "==", 'Pendiente'));
    unsubPending = onSnapshot(pendingQuery, (snapshot) => {
      const auditsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TechnicalAudit));
      setPendingAudits(auditsData);
      setLoading(false); 
    }, (error) => {
      console.error(`Error fetching Pending audits:`, error);
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: (pendingQuery as any)._path?.canonical,
        operation: 'list'
      }));
      setLoading(false);
    });
    
    const completedQuery = query(collection(db, "technicalAudits"), where("status", "==", 'Completada'));
    unsubCompleted = onSnapshot(completedQuery, (snapshot) => {
        const auditsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TechnicalAudit));
        setCompletedAudits(auditsData);
        setLoading(false);
    }, (error) => {
        console.error(`Error fetching Completed audits:`, error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: (completedQuery as any)._path?.canonical,
            operation: 'list'
        }));
        setLoading(false);
    });

    return () => {
        unsubPending();
        unsubCompleted();
    };
  }, [user, isManagerOrAdmin, router, toast]);


  useEffect(() => {
    const unsubscribe = refreshAudits();
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const handleDeleteClick = (audit: TechnicalAudit) => {
    setAuditToDelete(audit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!auditToDelete) return;
    setIsDeleting(true);
    const auditRef = doc(db, 'technicalAudits', auditToDelete.id);
    
    try {
      await deleteDoc(auditRef);
      toast({
        title: 'Auditoría Eliminada',
        description: 'La auditoría ha sido eliminada con éxito.',
      });
    } catch (serverError) {
       const permissionError = new FirestorePermissionError({
          path: auditRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setAuditToDelete(null);
    }
  };

  const AuditTable = ({ audits, status }: { audits: TechnicalAudit[], status: TechnicalAuditStatus }) => {
    const handleEvaluate = (audit: TechnicalAudit) => {
        router.push(`/audits/${audit.id}`);
    }
    
    const getStatusVariant = (status: TechnicalAuditStatus) => {
        return status === 'Completada' ? 'default' : 'secondary';
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tipo de Auditoría</TableHead>
                    <TableHead>Inspector Auditado</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    [1, 2].map(i => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : audits.length > 0 ? (
                    audits.map((au) => (
                        <TableRow key={au.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                               <ClipboardCheck className="h-4 w-4 text-muted-foreground" /> {au.auditType}
                            </TableCell>
                            <TableCell>{au.evaluatedName || au.evaluadoId}</TableCell>
                            <TableCell>{format(au.deadline.toDate(), 'PPP')}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(au.status)}>{au.status}</Badge></TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEvaluate(au)}>
                                    {status === 'Pendiente' ? 'Realizar' : 'Ver'}
                                    <FilePen className="ml-2 h-4 w-4" />
                                </Button>
                                {isManagerOrAdmin && (
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(au)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No se encontraron auditorías {status.toLowerCase()}s.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
  };

  if (!isManagerOrAdmin && !loading) {
      return null;
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
            <CardTitle className="font-headline">Auditorías de Competencia Técnica</CardTitle>
            <CardDescription>Asignar y completar auditorías técnicas para los inspectores.</CardDescription>
        </div>
        {isManagerOrAdmin && <NewAuditDialog onAuditCreated={refreshAudits} />}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pendientes ({pendingAudits.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Check className="mr-2 h-4 w-4" />
              Completadas ({completedAudits.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <AuditTable audits={pendingAudits} status="Pendiente" />
          </TabsContent>
          <TabsContent value="completed">
            <AuditTable audits={completedAudits} status="Completada" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la auditoría para <span className="font-semibold">{auditToDelete?.evaluatedName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

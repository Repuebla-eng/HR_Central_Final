// src/app/(app)/audits/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { TechnicalAudit, AuditCompetency } from '@/lib/types';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
import NewTrainingPlanDialog from '../../training/new-training-plan-dialog';

const magneticParticlesCompetencies: AuditCompetency[] = [
    { id: 'c1', statement: 'Revisa y aplica la Instrucción de Trabajo (IT) o el Procedimiento de Inspección (PI) PM antes de iniciar la tarea.', requirement: 'ISO 17020 (7.1.4, 7.1.5)' },
    { id: 'c2', statement: 'Realiza la verificación de los equipos (ej. Lift Test, luz negra, medidor de campo) de manera correcta y documentada, asegurando su trazabilidad.', requirement: 'ISO 17020 (6.2.6, 6.2.9, 6.2.14)' },
    { id: 'c3', statement: 'Aplica las técnicas de magnetización y los medios de ensayo (partículas) según el procedimiento aprobado (ASNT TC 1A).', requirement: 'ASNT TC 1A (Ejecución)' },
    { id: 'c4', statement: 'Mantiene la trazabilidad e identificación única del ítem o lote inspeccionado durante todo el proceso.', requirement: 'ISO 17020 (7.2.1)' },
    { id: 'c5', statement: 'Demuestra juicio profesional al clasificar las indicaciones y emitir conclusiones objetivas, sin sesgos comerciales.', requirement: 'ISO 17020 (4.1, Intro)' },
    { id: 'c6', statement: 'Documenta los resultados de la inspección de manera clara, precisa y completa en el informe/certificado (ISO 17020, 7.4).', requirement: 'ISO 17020 (7.3, 7.4)' },
    { id: 'c7', statement: 'Supervisa y guía eficazmente al personal de Nivel 1 o en entrenamiento, identificando sus necesidades de competencia.', requirement: 'ISO 17020 (6.1.8)' },
    { id: 'c8', statement: 'Cumple y exige el uso adecuado de los equipos de protección personal (EPP) y normas de SST específicas de la inspección.', requirement: 'ISO 45001 (8.1.2)' },
    { id: 'c9', statement: 'Maneja activamente situaciones de No Conformidad o Quejas de Clientes, asegurando que la imparcialidad no se vea comprometida.', requirement: 'ISO 17020 (4.1, 7.5)' },
    { id: 'c10', statement: 'Busca oportunidades de mejora en el proceso de inspección o en el sistema de gestión de la SST/Calidad.', requirement: 'ISO 19011 (4.g), ISO 9001/45001 (10.3)' }
];

const utThicknessMeasurementCompetencies: AuditCompetency[] = [
    { id: 'ut_c1', statement: 'Verifica las condiciones de la superficie de inspección (ej. rugosidad, temperatura) y aplica el acoplante adecuado, según el procedimiento.', requirement: 'ISO 9712 / PI-UT' },
    { id: 'ut_c2', statement: 'Realiza la calibración del equipo (ej. ajuste de velocidad, cero, transductor) utilizando bloques de referencia trazables y registra la evidencia (ISO 17020, 6.2.7).', requirement: 'ISO 17020 (6.2.6)' },
    { id: 'ut_c3', statement: 'Selecciona correctamente el transductor (frecuencia, diámetro, tipo) y el modo de medición (ej. simple eco, eco a eco) para el material y geometría a inspeccionar.', requirement: 'ISO 9712 / PI-UT' },
    { id: 'ut_c4', statement: 'Asegura la trazabilidad de los puntos de medición a través de un plano o sistema de coordenadas, evitando la pérdida de información (ISO 17020, 7.2).', requirement: 'ISO 17020 (7.2.1)' },
    { id: 'ut_c5', statement: 'Demuestra juicio profesional al determinar el patrón de medición (ej. cuadrícula) en áreas de alta corrosión para emitir una conclusión representativa.', requirement: 'ISO 17020 (Intro, 7.1.2)' },
    { id: 'ut_c6', statement: 'Documenta los resultados de manera clara, incluyendo la incertidumbre de la medición y las condiciones ambientales relevantes (ISO 17020, 7.4).', requirement: 'ISO 17020 (7.4)' },
    { id: 'ut_c7', statement: 'Comunica internamente los requisitos del plan de inspección a los niveles pertinentes antes de iniciar la ejecución.', requirement: 'ISO 17020 (7.4.2)' },
    { id: 'ut_c8', statement: 'Identifica y gestiona los peligros de la SST asociados con el uso de equipos UT en campo (ej. trabajo en altura, espacios confinados).', requirement: 'ISO 45001 (6.1.2.1, 8.1.2)' },
    { id: 'ut_c9', statement: 'Maneja y custodia la información de los clientes (ej. coordenadas de medición, planos) según la política de confidencialidad de la organización.', requirement: 'ISO 17020 (4.2)' },
    { id: 'ut_c10', statement: 'Propone mejoras factibles en la selección de equipos o metodología UT para aumentar la eficiencia del proceso de inspección.', requirement: 'ISO 19011 (4.g), ISO 9001/45001 (10.3)' }
];

const visualDimensionalCompetencies: AuditCompetency[] = [
    { id: 'vt_c1', statement: 'Prepara y verifica la iluminación y agudeza visual según el procedimiento antes de iniciar la inspección.', requirement: 'ISO 9712 / ISO 17020 (6.1.3)' },
    { id: 'vt_c2', statement: 'Selecciona y utiliza herramientas de medición dimensional (ej. calibradores, galgas) con la calibración vigente y registra el estado.', requirement: 'ISO 17020 (6.2.6, 6.2.7)' },
    { id: 'vt_c3', statement: 'Aplica la normativa/código específico (ej. AWS D1.1, API) para la aceptación/rechazo de discontinuidades superficiales (ej. mordedura, socavación).', requirement: 'ISO 9712 / PI-VT' },
    { id: 'vt_c4', statement: 'Identifica y evalúa si las tolerancias dimensionales cumplen con los planos o especificaciones del cliente (ISO 9001).', requirement: 'ISO 9001 (8.2.3, 8.5.1)' },
    { id: 'vt_c5', statement: 'Demuestra juicio profesional al determinar la idoneidad del ítem para la inspección visual (ej. preparación superficial adecuada).', requirement: 'ISO 17020 (7.2.2)' },
    { id: 'vt_c6', statement: 'Documenta las mediciones, observaciones y referencias al plano/especificación de manera trazable y precisa.', requirement: 'ISO 17020 (7.4)' },
    { id: 'vt_c7', statement: 'Supervisa y orienta a los Nivel 1 en el uso correcto de lupas, galgas y herramientas dimensionales.', requirement: 'ISO 17020 (6.1.8)' },
    { id: 'vt_c8', statement: 'Asegura la ergonomía del puesto de inspección visual para prevenir deterioro de la salud (ISO 45001).', requirement: 'ISO 45001 (6.1.2.1)' },
    { id: 'vt_c9', statement: 'Comunica las no conformidades dimensionales o visuales a la dirección pertinente y al cliente de forma oportuna.', requirement: 'ISO 17020 (7.4.4)' },
    { id: 'vt_c10', statement: 'Propone mejoras en los formatos de registro visual para aumentar la claridad y la trazabilidad de la inspección.', requirement: 'ISO 19011 (4.g)' }
];

const penetratingInkCompetencies: AuditCompetency[] = [
    { id: 'pt_c1', statement: 'Realiza la limpieza pre-inspección asegurando la remoción total de contaminantes sin afectar la superficie.', requirement: 'ISO 9712 / PI-PT' },
    { id: 'pt_c2', statement: 'Selecciona el tipo de penetrante (sensibilidad), revelador y método de remoción adecuado según el procedimiento y material.', requirement: 'ISO 9712' },
    { id: 'pt_c3', statement: 'Controla los tiempos de penetración, remoción y revelado según el procedimiento aprobado y las condiciones ambientales.', requirement: 'ISO 9712 / PI-PT' },
    { id: 'pt_c4', statement: 'Verifica la intensidad de la luz (visible y/o negra) y temperatura ambiente antes y durante la inspección (ISO 17020, 6.2.6).', requirement: 'ISO 17020 (6.2.6)' },
    { id: 'pt_c5', statement: 'Demuestra juicio profesional al distinguir entre indicaciones falsas, no relevantes y discontinuidades reales.', requirement: 'ISO 9712' },
    { id: 'pt_c6', statement: 'Documenta los resultados de manera que el informe refleje los parámetros de ensayo utilizados (ej. tipo de penetrante, tiempo de revelado).', requirement: 'ISO 17020 (7.4)' },
    { id: 'pt_c7', statement: 'Gestiona correctamente los químicos de PT (almacenamiento, disposición de residuos) conforme a las fichas de seguridad (ISO 14001/45001).', requirement: 'ISO 14001 (8.1) / ISO 45001 (8.1.4.1)' },
    { id: 'pt_c8', statement: 'Supervisa el correcto uso del EPP (ej. guantes, gafas) y la ventilación durante la aplicación de los productos químicos (ISO 45001).', requirement: 'ISO 45001 (8.1.2)' },
    { id: 'pt_c9', statement: 'Maneja y resuelve quejas o apelaciones sobre la interpretación de indicaciones, manteniendo la objetividad.', requirement: 'ISO 17020 (4.1, 7.5)' },
    { id: 'pt_c10', statement: 'Propone la validación de nuevos productos químicos de PT para aumentar la eficiencia o reducir el impacto ambiental/SST.', requirement: 'ISO 14001 (10.3) / ISO 45001 (8.1.3)' }
];

const conventionalUltrasoundCompetencies: AuditCompetency[] = [
    { id: 'utfd_c1', statement: 'Revisa la documentación (PI) y selecciona el bloque de calibración según el material y geometría del ítem a inspeccionar.', requirement: 'ISO 9712 / PI-UT' },
    { id: 'utfd_c2', statement: 'Realiza la calibración del equipo (ej. curva DAC/AVG, ajuste de sensibilidad, linealidad) y registra las curvas de forma trazable.', requirement: 'ISO 17020 (6.2.6, 6.2.7)' },
    { id: 'utfd_c3', statement: 'Selecciona y configura el palpador (transductor) y el cable apropiados para el tipo de discontinuidad buscada (ej. haz recto vs. haz angular).', requirement: 'ISO 9712 / PI-UT' },
    { id: 'utfd_c4', statement: 'Aplica el plan de escaneo geométrico y la velocidad de barrido requerida para asegurar la cobertura total del área crítica (ISO 17020).', requirement: 'PI-UT / ISO 17020 (7.1.2)' },
    { id: 'utfd_c5', statement: 'Demuestra juicio profesional en la interpretación del A-scan (evaluación de la discontinuidad, altura, longitud, caracterización).', requirement: 'ISO 9712' },
    { id: 'utfd_c6', statement: 'Documenta las discontinuidades encontradas, incluyendo su localización (plano), tipo, tamaño y criterios de aceptación/rechazo (ISO 17020, 7.4).', requirement: 'ISO 17020 (7.4)' },
    { id: 'utfd_c7', statement: 'Identifica las áreas de riesgo de SST específicas de la inspección UT (ej. riesgo eléctrico, ergonomía en escaneo prolongado).', requirement: 'ISO 45001 (6.1.2.1)' },
    { id: 'utfd_c8', statement: 'Supervisa la correcta aplicación del PI por parte del Nivel 1, enfocándose en la calibración y el patrón de escaneo.', requirement: 'ISO 17020 (6.1.8)' },
    { id: 'utfd_c9', statement: 'Mantiene la independencia de juicio al rechazar ítems a pesar de presiones comerciales o internas (ISO 17020).', requirement: 'ISO 17020 (4.1)' },
    { id: 'utfd_c10', statement: 'Propone la validación o implementación de tecnologías avanzadas (ej. Phased Array) para mejorar la eficacia de la detección de fallas.', requirement: 'ISO 19011 (4.g)' }
];


const formSchema = z.object({
  evaluatedName: z.string().min(1, "El nombre es requerido."),
  evaluationDate: z.date(),
  independenceCriterion: z.enum(['tipo_a', 'tipo_b', 'tipo_c']),
  certificateNumber: z.string().min(1, "El número de certificado es requerido."),
  scores: z.record(z.coerce.number().min(0).max(5)),
  overallScore: z.number().optional(),
  finalConclusion: z.enum(['competente', 'requiere_formacion', 'no_competente']),
  improvementActions: z.string().optional(),
});

export default function AuditFormPage() {
  const router = useRouter();
  const params = useParams();
  const auditId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [audit, setAudit] = useState<TechnicalAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [competencies, setCompetencies] = useState<AuditCompetency[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [trainingInitialValues, setTrainingInitialValues] = useState({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evaluatedName: '',
      evaluationDate: new Date(),
      certificateNumber: '',
      scores: {},
      improvementActions: '',
      independenceCriterion: undefined,
      finalConclusion: undefined,
    },
  });

  const scores = useWatch({ control: form.control, name: 'scores' });

  useEffect(() => {
    let totalScore = 0;
    let count = 0;
    Object.values(scores).forEach(score => {
      if (typeof score === 'number') {
        totalScore += score;
        count++;
      }
    });
    if (count > 0 && count === competencies.length) {
      form.setValue('overallScore', parseFloat((totalScore / count).toFixed(2)));
    } else {
      form.setValue('overallScore', undefined);
    }
  }, [scores, form, competencies.length]);


  useEffect(() => {
    if (!user || !auditId) return;
    
    async function fetchAuditData() {
        setLoading(true);
        try {
            const auditRef = doc(db, 'technicalAudits', auditId);
            const auditSnap = await getDoc(auditRef);

            if (!auditSnap.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Auditoría no encontrada.' });
                router.push('/audits');
                return;
            }
            const auditData = { id: auditSnap.id, ...auditSnap.data() } as TechnicalAudit;
            setAudit(auditData);
            
            if (auditData.status === 'Completada') {
              setIsReadOnly(true);
            }

            let currentCompetencies: AuditCompetency[] = [];
            if (auditData.auditType === 'Inspección con Partículas Magnéticas') {
                currentCompetencies = magneticParticlesCompetencies;
            } else if (auditData.auditType === 'Medición de espesores con UT') {
                 currentCompetencies = utThicknessMeasurementCompetencies;
            } else if (auditData.auditType === 'Inspección Visual y Dimensional') {
                 currentCompetencies = visualDimensionalCompetencies;
            } else if (auditData.auditType === 'Inspección con Tintas Penetrantes') {
                 currentCompetencies = penetratingInkCompetencies;
            } else if (auditData.auditType === 'Inspección con Ultrasonido') {
                 currentCompetencies = conventionalUltrasoundCompetencies;
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Tipo de auditoría no soportado.' });
                setCompetencies([]);
                currentCompetencies = [];
            }
            setCompetencies(currentCompetencies);

            if (currentCompetencies.length > 0) {
                const initialScores = currentCompetencies.reduce((acc, comp) => {
                    acc[comp.id] = 0;
                    return acc;
                }, {} as Record<string, number>);
                
                form.reset({
                    evaluatedName: auditData.evaluatedName || '',
                    evaluationDate: auditData.evaluationDate ? (auditData.evaluationDate as Timestamp).toDate() : new Date(),
                    independenceCriterion: auditData.independenceCriterion || undefined,
                    certificateNumber: auditData.certificateNumber || '',
                    scores: auditData.scores || initialScores,
                    overallScore: auditData.overallScore,
                    finalConclusion: auditData.finalConclusion,
                    improvementActions: auditData.improvementActions || '',
                });
            }

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la auditoría.' });
        } finally {
            setLoading(false);
        }
    }
    
    fetchAuditData();

  }, [auditId, user, router, toast, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isReadOnly) return;
    setIsSubmitting(true);
    try {
        const auditRef = doc(db, 'technicalAudits', auditId);
        await updateDoc(auditRef, {
            ...data,
            evaluationDate: Timestamp.fromDate(data.evaluationDate),
            status: 'Completada',
            submittedAt: serverTimestamp(),
            evaluadorId: user?.uid,
            evaluatorName: user?.displayName,
        });
        toast({ title: 'Auditoría Guardada', description: 'La auditoría de competencia ha sido guardada con éxito.' });
        
        if (data.finalConclusion === 'requiere_formacion' && audit) {
            setTrainingInitialValues({
                employeeId: audit.evaluadoId,
                trainingReason: data.improvementActions || `Follow-up for technical audit: ${audit.auditType}`,
            });
            setShowConfirmationDialog(true);
        } else {
            router.push('/audits');
        }
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error al Guardar', description: 'No se pudo guardar la auditoría.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
   if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <Card><CardContent><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    );
  }
  
  const handleCreatePlan = () => {
    setShowConfirmationDialog(false);
    setShowTrainingDialog(true);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Plan de Formación Recomendado</AlertDialogTitle>
                    <AlertDialogDescription>
                        La auditoría concluyó que se requiere formación. ¿Desea crear un plan de formación ahora?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => router.push('/audits')}>No, volver a la lista</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreatePlan}>Sí, crear plan</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        <NewTrainingPlanDialog 
            open={showTrainingDialog}
            onOpenChange={setShowTrainingDialog}
            initialValues={trainingInitialValues}
            onPlanCreated={() => {
                toast({ title: 'Plan de Formación Asignado', description: 'El nuevo plan ha sido creado con éxito.' });
                router.push('/training');
            }}
        />

        <header className="bg-card p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold text-primary border-b-4 border-yellow-500 pb-2">
                {audit?.auditType}
            </h1>
            <p className="mt-2 text-muted-foreground">
                Evaluación basada en la observación del desempeño y la aplicación de procedimientos del sistema de gestión (ISO/IEC 17020, ISO 9712).
            </p>
        </header>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Sección I: Datos Generales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <span className="text-green-500">🟢</span> Sección I: Datos Generales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField control={form.control} name="evaluatedName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Evaluado</FormLabel>
                                <FormControl>
                                    <Input {...field} readOnly className="bg-muted/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="evaluationDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha de la Evaluación</FormLabel>
                                <Popover><PopoverTrigger asChild disabled={isReadOnly}>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground", isReadOnly && "bg-muted/50")}>
                                        {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={isReadOnly}/>
                                </PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="independenceCriterion" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Criterio de Independencia (ISO/IEC 17020, 4.1)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                    <FormControl><SelectTrigger className={isReadOnly ? "bg-muted/50" : ""}><SelectValue placeholder="Seleccione el Tipo..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="tipo_a">Tipo A (Tercera Parte)</SelectItem>
                                        <SelectItem value="tipo_b">Tipo B (Inspección Interna Exclusiva)</SelectItem>
                                        <SelectItem value="tipo_c">Tipo C (Inspección Interna y a Terceros)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="certificateNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Certificado Nivel 2</FormLabel>
                                <FormControl><Input {...field} readOnly={isReadOnly} className={isReadOnly ? "bg-muted/50" : ""}/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Sección II: Evaluación */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <span className="text-yellow-500">🟡</span> Evaluación de Competencias
                        </CardTitle>
                         {isReadOnly && <CardDescription>Esta auditoría ha sido completada y no puede ser modificada.</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/2">Competencia / Criterio de Auditoría</TableHead>
                                    <TableHead className="text-center">Requisito Base</TableHead>
                                    <TableHead className="text-center w-[120px]">Puntuación (0-5)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {competencies.map(comp => (
                                    <TableRow key={comp.id}>
                                        <TableCell className="font-medium">{comp.statement}</TableCell>
                                        <TableCell className="text-center text-xs text-muted-foreground">{comp.requirement}</TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`scores.${comp.id}`} render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value ?? '')} disabled={isReadOnly}>
                                                        <FormControl><SelectTrigger className={isReadOnly ? "bg-muted/50" : ""}><SelectValue placeholder="--" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {[0,1,2,3,4,5].map(i => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/50 rounded-lg">
                            <strong>Escala:</strong> 0: Deficiente | 1: Muy Bajo | 2: Mejorable | 3: Aceptable | 4: Bueno | 5: Excelente.
                        </div>
                    </CardContent>
                </Card>
                
                {/* Sección IV: Conclusión */}
                <Card className="border-l-4 border-red-500">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-red-700">
                           <span className="text-red-500">🟥</span> Sección III: Conclusión del Evaluador
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="overallScore" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Puntuación Global (Promedio)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ''} readOnly className="bg-muted font-bold" placeholder="Calculado automáticamente" /></FormControl>
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="finalConclusion" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Conclusión General (Competencia)</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-6 pt-2" disabled={isReadOnly}>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="competente" /></FormControl><FormLabel className="font-semibold text-green-700">Competente</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="requiere_formacion" /></FormControl><FormLabel className="font-semibold text-yellow-700">Requiere Formación</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no_competente" /></FormControl><FormLabel className="font-semibold text-red-700">No Competente</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="improvementActions" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Acciones de Mejora/Formación Requerida (ISO 19011, 7.6)</FormLabel>
                                <FormControl><Textarea rows={4} placeholder="Especificar brechas y acciones necesarias..." {...field} readOnly={isReadOnly} className={isReadOnly ? "bg-muted/50" : ""}/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <div>
                            <FormLabel>Firma del Evaluador (Nombre)</FormLabel>
                            <Input readOnly value={user?.displayName || user?.email || ''} className="mt-2 bg-muted/50" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    {isReadOnly ? (
                        <Button asChild size="lg">
                            <Link href="/audits"><ArrowLeft /> Volver a la Lista</Link>
                        </Button>
                    ) : (
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                            {isSubmitting ? 'Guardando...' : 'Finalizar Auditoría y Guardar'}
                        </Button>
                    )}
              </div>

            </form>
        </Form>
    </div>
  );
}

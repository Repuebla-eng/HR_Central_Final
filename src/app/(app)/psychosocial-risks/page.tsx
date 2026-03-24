// src/app/(app)/psychosocial-risks/page.tsx
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';


type Question = {
  id: string;
  text: string;
  isReversed?: boolean; // For scoring
};

type Domain = {
  id: string;
  name: string;
  questions: Question[];
};

type Category = {
  id: string;
  name: string;
  domains: Domain[];
};

const surveyData: Category[] = [
    {
        id: 'cat1',
        name: 'Ambiente de trabajo',
        domains: [
            {
                id: 'dom1',
                name: 'Condiciones en el ambiente de trabajo',
                questions: [
                    { id: 'q1', text: 'El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica.' },
                    { id: 'q2', text: 'Mi trabajo me exige hacer mucho esfuerzo físico.', isReversed: true },
                    { id: 'q3', text: 'Me preocupa sufrir un accidente en mi trabajo.', isReversed: true },
                    { id: 'q4', text: 'Considero que en mi trabajo se aplican las normas de seguridad y salud en el trabajo.' },
                    { id: 'q5', text: 'Considero que las actividades que realizo son peligrosas.', isReversed: true },
                ],
            },
        ],
    },
    {
        id: 'cat2',
        name: 'Factores propios de la actividad',
        domains: [
            {
                id: 'dom2',
                name: 'Carga de trabajo',
                questions: [
                    { id: 'q6', text: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno.', isReversed: true },
                    { id: 'q7', text: 'Por la cantidad de trabajo que tengo debo trabajar sin parar.', isReversed: true },
                    { id: 'q8', text: 'Considero que es necesario mantener un ritmo de trabajo acelerado.', isReversed: true },
                    { id: 'q9', text: 'Mi trabajo exige que esté muy concentrado.', isReversed: true },
                    { id: 'q10', text: 'Mi trabajo requiere que memorice mucha información.', isReversed: true },
                    { id: 'q11', text: 'En mi trabajo tengo que tomar decisiones difíciles o importantes.', isReversed: true },
                    { id: 'q12', text: 'En mi trabajo soy responsable de cosas de mucho valor.', isReversed: true },
                    { id: 'q13', text: 'Respondo ante mi jefe por los resultados de toda mi área de trabajo.', isReversed: true },
                    { id: 'q14', text: 'En mi trabajo me dan órdenes contradictorias.', isReversed: true },
                    { id: 'q15', text: 'Considero que mi trabajo es socialmente poco importante.', isReversed: true },
                ],
            },
            {
                id: 'dom3',
                name: 'Falta de control sobre el trabajo',
                questions: [
                    { id: 'q16', text: 'Mi trabajo permite que desarrolle nuevas habilidades.' },
                    { id: 'q17', text: 'En mi trabajo puedo aspirar a un mejor puesto.' },
                    { id: 'q18', text: 'Durante mi jornada de trabajo puedo tomar pausas cuando las necesito.' },
                    { id: 'q19', text: 'Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo.' },
                    { id: 'q20', text: 'Puedo cambiar el orden de las actividades que realizo en mi trabajo.' },
                ],
            },
        ],
    },
    {
        id: 'cat3',
        name: 'Organización del tiempo de trabajo',
        domains: [
            {
                id: 'dom4',
                name: 'Jornada de trabajo',
                questions: [
                    { id: 'q21', text: 'Trabajo horas extras más de tres veces a la semana.', isReversed: true },
                    { id: 'q22', text: 'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana.', isReversed: true },
                    { id: 'q23', text: 'Considero que el tiempo en el trabajo es mucho y perjudica mi vida familiar o personal.', isReversed: true },
                    { id: 'q24', text: 'Debo atender asuntos de trabajo cuando estoy en casa.', isReversed: true },
                    { id: 'q25', text: 'Pienso en las actividades familiares o personales cuando estoy en mi trabajo.', isReversed: true },
                ],
            },
            {
                id: 'dom5',
                name: 'Interferencia en la relación trabajo-familia',
                questions: [
                    { id: 'q26', text: 'Mi trabajo permite que atienda asuntos familiares o personales cuando lo necesito.' },
                    { id: 'q27', text: 'Debo prolongar mi jornada para cumplir con mis tareas o para que no me despidan.', isReversed: true },
                ],
            },
        ],
    },
    {
        id: 'cat4',
        name: 'Liderazgo y relaciones en el trabajo',
        domains: [
            {
                id: 'dom6',
                name: 'Liderazgo',
                questions: [
                    { id: 'q28', text: 'Mi jefe ayuda a organizar mejor el trabajo.' },
                    { id: 'q29', text: 'Mi jefe tiene en cuenta mis puntos de vista y opiniones.' },
                    { id: 'q30', text: 'Mi jefe me comunca a tiempo la información relacionada con el trabajo.' },
                    { id: 'q31', text: 'La orientación que me da mi jefe me ayuda a realizar mejor mi trabajo.' },
                    { id: 'q32', text: 'Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo.' },
                ],
            },
            {
                id: 'dom7',
                name: 'Relaciones en el trabajo',
                questions: [
                    { id: 'q33', text: 'Puedo confiar en mis compañeros de trabajo.' },
                    { id: 'q34', text: 'Entre compañeros solucionamos los problemas de trabajo de forma respetuosa.' },
                    { id: 'q35', text: 'En mi trabajo me hacen sentir parte del grupo.' },
                    { id: 'q36', text: 'Cuando tenemos que realizar trabajo de equipo los compañeros colaboran.' },
                    { id: 'q37', text: 'Mis compañeros de trabajo me ayudan cuando tengo dificultades.' },
                ],
            },
            {
                id: 'dom8',
                name: 'Violencia',
                questions: [
                    { id: 'q38', text: 'En mi trabajo puedo expresarme sin interrupciones.', isReversed: true },
                    { id: 'q39', text: 'Recibo críticas constantes a mi persona y/o trabajo.' },
                    { id: 'q40', text: 'Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones.' },
                    { id: 'q41', text: 'Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones.' },
                    { id: 'q42', text: 'Se manipulan las situaciones para hacerme parecer un mal trabajador.' },
                    { id: 'q43', text: 'Se me asignan tareas o proyectos con plazos irrealistas para que no cumpla.' },
                    { id: 'q44', text: 'Me ignoran o me hacen el vacío.' },
                    { id: 'q45', text: 'He sufrido acoso sexual (es decir, me han hecho comentarios, me han mirado de forma que me moleste o me han chantajeado para tener una relación).' },
                    { id: 'q46', text: 'He sufrido violencia física (por ejemplo, empujones, jalones, etc.).' },
                ],
            },
        ],
    },
     {
        id: 'cat5',
        name: 'Entorno Organizacional',
        domains: [
            {
                id: 'dom9',
                name: 'Reconocimiento del desempeño',
                questions: [
                    { id: 'q47', text: 'Recibo reconocimiento de mi jefe cuando realizo bien mi trabajo.' },
                    { id: 'q48', text: 'Me informan sobre la forma en que evalúan mi trabajo.' },
                    { id: 'q49', text: 'En mi centro de trabajo se busca y se fomenta que los trabajadores mejoremos nuestro desempeño.' },
                ],
            },
            {
                id: 'dom10',
                name: 'Insuficiente sentido de pertenencia e inestabilidad',
                questions: [
                    { id: 'q50', text: 'En mi trabajo siento que mi esfuerzo es valorado.' },
                    { id: 'q51', text: 'Siento que mi trabajo es estable.' },
                    { id: 'q52', text: 'Me siento orgulloso de trabajar en este centro de trabajo.' },
                ],
            },
        ],
    },
];

const allQuestions = surveyData.flatMap(c => c.domains.flatMap(d => d.questions));

const responseOptions = [
  { value: '0', label: 'Nunca' },
  { value: '1', label: 'Casi nunca' },
  { value: '2', label: 'Algunas veces' },
  { value: '3', label: 'Casi siempre' },
  { value: '4', label: 'Siempre' },
];

const calculateScore = (answers: Record<string, string>) => {
  let totalScore = 0;
  for (const question of allQuestions) {
    const answerValue = parseInt(answers[question.id] || '0', 10);
    // NOM-035 scoring: for positive items, 0->0, 1->1, 2->2, 3->3, 4->4
    // For reversed items: 0->4, 1->3, 2->2, 3->1, 4->0
    if (question.isReversed) {
        // These are items where "Siempre" is negative (e.g. "Trabajo horas extras...")
        // In the original NOM-035, these are scored directly.
        // We'll score them based on risk. 'Siempre' (4) is high risk.
        totalScore += answerValue;
    } else {
        // These are items where "Siempre" is positive (e.g. "Mi jefe me ayuda...")
        // A high value is good, a low value is bad. For risk, we reverse it.
        // 'Nunca' (0) is a high risk, so we score it as 4.
        totalScore += (4 - answerValue);
    }
  }
  return totalScore;
};

const getRiskLevel = (score: number) => {
  if (score < 45) return 'Nulo';
  if (score < 75) return 'Bajo';
  if (score < 99) return 'Medio';
  if (score < 140) return 'Alto';
  return 'Muy Alto';
};


export default function PsychosocialRisksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSubmission = async () => {
        if (!user) return;
        setLoading(true);
        const q = query(collection(db, 'psychosocialAssessments'), where('employeeId', '==', user.uid));
        
        try {
            const querySnapshot = await getDocs(q);
            setHasAlreadySubmitted(!querySnapshot.empty);
        } catch (error) {
            console.error("Permission error checking submission:", error);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `psychosocialAssessments`,
                operation: 'list'
            }));
        } finally {
            setLoading(false);
        }
    }
    checkSubmission();
  }, [user]);

  const handleValueChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const totalQuestions = allQuestions.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < totalQuestions) {
      toast({
        variant: 'destructive',
        title: 'Formulario incompleto',
        description: `Por favor, responde todas las ${totalQuestions} preguntas antes de enviar.`,
      });
      return;
    }

    if (!user) {
         toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para enviar.' });
         return;
    }

    setLoading(true);
    const assessmentsRef = collection(db, 'psychosocialAssessments');
    try {
        const totalScore = calculateScore(answers);
        const riskLevel = getRiskLevel(totalScore);

        await addDoc(assessmentsRef, {
            employeeId: user.uid,
            answers,
            totalScore,
            riskLevel,
            submittedAt: serverTimestamp(),
        });

        toast({
            title: 'Evaluación enviada',
            description: 'Gracias por completar la evaluación de riesgos psicosociales.',
        });
        setHasAlreadySubmitted(true);

    } catch (error) {
        console.error("Error saving assessment:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: assessmentsRef.path,
            operation: 'create',
            requestResourceData: { employeeId: user.uid, /* answers could be included here */ }
        }));
    } finally {
        setLoading(false);
    }
  };

  if (loading && hasAlreadySubmitted === null) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </CardContent>
        </Card>
    );
  }

  if (hasAlreadySubmitted) {
     return (
        <Card>
             <CardHeader>
                <CardTitle className="font-headline">
                Evaluación de Riesgos Psicosociales
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AlertDialog defaultOpen={true}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¡Gracias!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ya has completado la evaluación de riesgos psicosociales. Agradecemos tu participación.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           {/*  This button is just for show, dialog is not closable in this state */}
                            <AlertDialogAction disabled>Ok</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          Evaluación de Riesgos Psicosociales
        </CardTitle>
        <CardDescription>
          Identificación y análisis de factores de riesgo psicosocial (NOM-035).
          Responde a todas las preguntas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Accordion type="multiple" className="w-full">
            {surveyData.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline">
                  {category.name}
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="multiple" className="w-full space-y-4">
                    {category.domains.map((domain) => (
                      <AccordionItem key={domain.id} value={domain.id}>
                        <AccordionTrigger className="font-semibold">
                          {domain.name}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                          {domain.questions.map((question) => (
                            <div key={question.id}>
                              <p className="font-medium mb-3">{question.text}</p>
                              <RadioGroup
                                onValueChange={(value) => handleValueChange(question.id, value)}
                                value={answers[question.id]}
                                className="flex flex-wrap gap-x-6 gap-y-2"
                              >
                                {responseOptions.map((opt) => (
                                  <div
                                    key={opt.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <RadioGroupItem
                                      value={opt.value}
                                      id={`${question.id}-${opt.value}`}
                                    />
                                    <Label htmlFor={`${question.id}-${opt.value}`}>
                                      {opt.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar Evaluación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

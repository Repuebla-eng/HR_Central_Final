// src/app/(app)/evaluations/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Evaluation, Survey } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Send, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { surveys, responseOptions } from '@/lib/surveys-data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


type FormValues = {
  competencyAnswers: {
    itemId: string;
    score: number;
    comment: string;
  }[];
  paragraphAnswers: {
    questionId: string;
    answer: string;
  }[];
};

const INSTRUCTIONAL_VIDEO_URL = "https://drive.google.com/file/d/1zHsuUiEWvnqJ75NbHp8gFTgigozZdGgU/preview";

export default function EvaluationFormPage() {
  const router = useRouter();
  const params = useParams();
  const evalId = params.id as string;
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(true);

  const form = useForm<FormValues>({
    defaultValues: {
      competencyAnswers: [],
      paragraphAnswers: [],
    },
  });

  const { fields: competencyFields } = useFieldArray({
    control: form.control,
    name: "competencyAnswers",
  });
  const { fields: paragraphFields } = useFieldArray({
    control: form.control,
    name: "paragraphAnswers",
  });

  const fetchEvaluationData = useCallback(async () => {
    if (!user || !evalId || !role) return;
    setLoading(true);
    try {
      const evalRef = doc(db, 'evaluations', evalId);
      const evalSnap = await getDoc(evalRef);
      const isManagerOrAdmin = role === 'manager' || role === 'admin';
      const evalData = evalSnap.data();

      if (!evalSnap.exists() || (!isManagerOrAdmin && evalData?.evaluadorId !== user.uid)) {
        toast({ variant: 'destructive', title: 'Error', description: 'Evaluation not found or you do not have permission to access it.' });
        router.push('/evaluations');
        return;
      }
      
      const typedEvalData = { id: evalSnap.id, ...evalData } as Evaluation;
      
      if (typedEvalData.status === 'Completada') {
        setShowVideoDialog(false); // Do not show video if already completed
      }
      
      setEvaluation(typedEvalData);

      const selectedSurvey = surveys.find(s => s.title === typedEvalData.title);
      if (!selectedSurvey) {
        toast({ variant: 'destructive', title: 'Error', description: `Survey form for "${typedEvalData.title}" not found.` });
        setLoading(false);
        return;
      }
      setSurvey(selectedSurvey);

      // Initialize form fields based on the survey structure
      const initialCompetencyAnswers = selectedSurvey.competencyCategories.flatMap(cat =>
        cat.items.map(item => ({
          itemId: item.id,
          score: 3, // Default score
          comment: '',
        }))
      );
      const initialParagraphAnswers = selectedSurvey.paragraphQuestions.map(q => ({
        questionId: q.id,
        answer: '',
      }));

      form.reset({
        competencyAnswers: initialCompetencyAnswers,
        paragraphAnswers: initialParagraphAnswers
      });

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error loading page', description: 'Could not load the necessary data for the evaluation.' });
    } finally {
      setLoading(false);
    }
  }, [evalId, user, role, router, toast, form]);

  useEffect(() => {
    fetchEvaluationData();
  }, [fetchEvaluationData]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    const competencyAnswersMap = data.competencyAnswers.reduce((acc, ans) => {
        acc[ans.itemId] = { score: ans.score, comment: ans.comment };
        return acc;
    }, {} as NonNullable<Evaluation['answers']>['competencies']);

    const paragraphAnswersMap = data.paragraphAnswers.reduce((acc, ans) => {
        acc[ans.questionId] = ans.answer;
        return acc;
    }, {} as NonNullable<Evaluation['answers']>['paragraphs']);

    try {
        const evalRef = doc(db, 'evaluations', evalId);
        await updateDoc(evalRef, {
            answers: {
                competencies: competencyAnswersMap,
                paragraphs: paragraphAnswersMap,
            },
            status: 'Completada',
            submittedAt: serverTimestamp(),
        });
        toast({ title: 'Evaluation Submitted', description: 'Thank you for completing the evaluation.' });
        router.push('/evaluations');
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not save your evaluation. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (evaluation?.status === 'Completada') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Evaluation Already Completed</CardTitle>
                        <CardDescription>You have already submitted this evaluation. Thank you for your feedback.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href="/evaluations">
                                <ArrowLeft className="mr-2" />
                                Back to Evaluations
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
          </div>
      )
  }

  if (!survey) {
     return (
          <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Survey Not Found</CardTitle>
                        <CardDescription>The survey form for "{evaluation?.title}" could not be found.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href="/evaluations">
                                <ArrowLeft className="mr-2" />
                                Back to Evaluations
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
          </div>
      )
  }

  return (
    <>
      <AlertDialog open={showVideoDialog}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <PlayCircle className="text-primary" />
              Video de Instrucciones
            </AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, mira este breve video antes de comenzar la evaluación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="aspect-video w-full rounded-lg overflow-hidden border">
            <iframe
              width="100%"
              height="100%"
              src={INSTRUCTIONAL_VIDEO_URL}
              title="Video de Instrucciones"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowVideoDialog(false)}>
              He visto el video, continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/evaluations"><ArrowLeft /> Back to List</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{evaluation?.title}</CardTitle>
            <CardDescription>
              Evaluating: <span className="font-semibold text-primary">{evaluation?.evaluadoName}</span> |
              Relationship: <Badge variant="outline" className="ml-1">{evaluation?.relation}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTitle>Instructions for the Evaluator</AlertTitle>
              <AlertDescription>
                Please be honest, objective, and constructive. Focus on observable behaviors and provide specific examples in your comments to support your ratings.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {survey.competencyCategories.map((category) => (
                  <div key={category.id} className="space-y-6">
                    <h3 className="text-xl font-bold text-primary border-b pb-2">{category.name}</h3>
                    {category.items.map((item, itemIndex) => {
                      const fieldIndex = form.getValues('competencyAnswers').findIndex(f => f.itemId === item.id);
                      if (fieldIndex === -1) return null;

                      return (
                        <Card key={item.id} className="bg-muted/30 p-6">
                          <p className="font-semibold mb-2">{item.title}</p>
                          {item.descriptions && item.descriptions.length > 0 && (
                            <ul className="list-disc pl-5 mb-4 text-sm text-muted-foreground space-y-1">
                              {item.descriptions.map((desc, i) => <li key={i}>{desc}</li>)}
                            </ul>
                          )}
                          <div className="space-y-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`competencyAnswers.${fieldIndex}.score`}
                              render={({ field: scoreField }) => (
                                <FormItem>
                                  <FormLabel>Score: {scoreField.value}</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(value) => scoreField.onChange(parseInt(value))}
                                      value={String(scoreField.value)}
                                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4"
                                      required
                                    >
                                      <Label className="text-muted-foreground">{responseOptions[0].label}</Label>
                                      <div className="flex gap-x-4 sm:gap-x-8">
                                        {responseOptions.map((opt) => (
                                          <div
                                            key={opt.value}
                                            className="flex flex-col items-center space-y-2"
                                          >
                                            <Label htmlFor={`${item.id}-${opt.value}`} className="text-xs">{opt.value}</Label>
                                            <RadioGroupItem
                                              value={opt.value}
                                              id={`${item.id}-${opt.value}`}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                      <Label className="text-muted-foreground">{responseOptions[responseOptions.length - 1].label}</Label>
                                    </RadioGroup>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`competencyAnswers.${fieldIndex}.comment`}
                              render={({ field: commentField }) => (
                                <FormItem>
                                  <FormLabel>Comments / Examples (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Provide specific examples for your score."
                                      {...commentField}
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ))}

                {survey.paragraphQuestions.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <h3 className="text-xl font-bold text-primary border-b pb-2">Open-ended Questions</h3>
                    {survey.paragraphQuestions.map((question, questionIndex) => {
                      const fieldIndex = form.getValues('paragraphAnswers').findIndex(f => f.questionId === question.id);
                      if (fieldIndex === -1) return null;
                      return (
                        <Card key={question.id} className="bg-muted/30 p-6">
                          <FormField
                            control={form.control}
                            name={`paragraphAnswers.${fieldIndex}.answer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-base">{question.title}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Your response..."
                                    {...field}
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </Card>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting || user?.uid !== evaluation?.evaluadorId}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                    {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

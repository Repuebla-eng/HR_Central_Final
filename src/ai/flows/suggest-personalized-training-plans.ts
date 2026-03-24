// src/ai/flows/suggest-personalized-training-plans.ts
'use server';
/**
 * @fileOverview An AI agent to suggest personalized training plans based on competency gaps.
 *
 * - suggestPersonalizedTrainingPlans - A function that suggests training plans based on employee competency gaps.
 * - SuggestTrainingPlansInput - The input type for the suggestPersonalizedTrainingPlans function.
 * - SuggestedTrainingPlansOutput - The return type for the suggestPersonalizedTrainingPlans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrainingPlansInputSchema = z.object({
  employeeId: z
    .string()
    .describe('The ID of the employee to generate a training plan for.'),
  competencyId: z
    .string()
    .describe('The ID of the competency that needs improvement.'),
  gapDescription: z
    .string()
    .describe('Description of the gap between required and achieved competency levels.'),
});
export type SuggestTrainingPlansInput = z.infer<typeof SuggestTrainingPlansInputSchema>;

const SuggestedTrainingPlansOutputSchema = z.object({
  suggestedCourses: z
    .array(z.string())
    .describe('A list of suggested course titles to address the competency gap.'),
  justification: z
    .string()
    .describe('Explanation of why these courses are suitable for addressing the gap.'),
});
export type SuggestedTrainingPlansOutput = z.infer<typeof SuggestedTrainingPlansOutputSchema>;

export async function suggestPersonalizedTrainingPlans(
  input: SuggestTrainingPlansInput
): Promise<SuggestedTrainingPlansOutput> {
  return suggestPersonalizedTrainingPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrainingPlansPrompt',
  input: {schema: SuggestTrainingPlansInputSchema},
  output: {schema: SuggestedTrainingPlansOutputSchema},
  prompt: `You are an HR expert specializing in personalized training plan creation. Based on the identified competency gap, suggest a list of relevant course titles and justify your selections.

Employee ID: {{{employeeId}}}
Competency ID: {{{competencyId}}}
Competency Gap Description: {{{gapDescription}}}

Respond with a list of suggested course titles, and a justification for why each course would be suitable.

Format your response as:
{
  "suggestedCourses": ["Course Title 1", "Course Title 2"],
  "justification": "Explanation of why these courses are suitable for addressing the gap."
}
`,
});

const suggestPersonalizedTrainingPlansFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedTrainingPlansFlow',
    inputSchema: SuggestTrainingPlansInputSchema,
    outputSchema: SuggestedTrainingPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

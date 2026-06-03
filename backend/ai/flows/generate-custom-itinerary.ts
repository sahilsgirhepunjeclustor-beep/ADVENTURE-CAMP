'use server';
/**
 * @fileOverview A Genkit flow for generating a custom 5-day itinerary and safety recommendations.
 *
 * - generateCustomItinerary - A function that handles the custom itinerary generation process.
 * - GenerateCustomItineraryInput - The input type for the generateCustomItinerary function.
 * - GenerateCustomItineraryOutput - The return type for the generateCustomItinerary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCustomItineraryInputSchema = z.object({
  location: z
    .string()
    .describe('The geographical location for the adventure (e.g., "Manali, Himachal Pradesh").'),
  terrainType: z
    .string()
    .describe(
      'The type of terrain (e.g., "mountain", "river", "forest", "desert", "beach").'
    ),
});
export type GenerateCustomItineraryInput = z.infer<
  typeof GenerateCustomItineraryInputSchema
>;

const ItineraryDaySchema = z.object({
  day: z.string().describe('e.g., "Day 1"'),
  title: z.string().describe('A short title for the day\'s activities'),
  description: z
    .string()
    .describe('A detailed description of the activities and highlights for the day.'),
});

const GenerateCustomItineraryOutputSchema = z.object({
  itinerary: z
    .array(ItineraryDaySchema)
    .describe('A 5-day itinerary for the adventure.'),
  safetyRecommendations: z
    .array(z.string())
    .describe('Safety recommendations specific to the location and terrain type.'),
});
export type GenerateCustomItineraryOutput = z.infer<
  typeof GenerateCustomItineraryOutputSchema
>;

export async function generateCustomItinerary(
  input: GenerateCustomItineraryInput
): Promise<GenerateCustomItineraryOutput> {
  return generateCustomItineraryFlow(input);
}

const generateCustomItineraryPrompt = ai.definePrompt({
  name: 'generateCustomItineraryPrompt',
  input: { schema: GenerateCustomItineraryInputSchema },
  output: { schema: GenerateCustomItineraryOutputSchema },
  prompt: `You are an expert adventure planner. Your task is to create a detailed 5-day itinerary and provide safety recommendations for an adventure based on the user's specified location and terrain type.

### Input
Location: {{{location}}}
Terrain Type: {{{terrainType}}}

### Instructions:
1.  **Itinerary**: Create a comprehensive 5-day itinerary. Each day should include a title and a detailed description of activities, sights, and experiences. Ensure the activities are suitable for the specified location and terrain type.
2.  **Safety Recommendations**: Provide a list of critical safety recommendations pertinent to the specified location and terrain type. Think about common hazards, necessary equipment, and general precautions.

Ensure your output strictly adheres to the JSON schema provided.
`,
});

const generateCustomItineraryFlow = ai.defineFlow(
  {
    name: 'generateCustomItineraryFlow',
    inputSchema: GenerateCustomItineraryInputSchema,
    outputSchema: GenerateCustomItineraryOutputSchema,
  },
  async (input) => {
    const { output } = await generateCustomItineraryPrompt(input);
    return output!;
  }
);

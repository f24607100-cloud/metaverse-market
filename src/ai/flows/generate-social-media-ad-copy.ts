'use server';
/**
 * @fileOverview A social media ad copy generator AI agent.
 *
 * - generateSocialMediaAdCopy - A function that handles the ad copy generation process.
 * - GenerateSocialMediaAdCopyInput - The input type for the generateSocialMediaAdCopy function.
 * - GenerateSocialMediaAdCopyOutput - The return type for the generateSocialMediaAdCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaAdCopyInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  targetAudience: z.string().describe('The target audience for the ad.'),
  tone: z.enum(['Formal', 'Informal', 'Funny', 'Serious']).describe('The desired tone of the ad copy.'),
  platform: z.enum(['Facebook', 'Instagram', 'Twitter', 'LinkedIn']).describe('The social media platform for the ad.'),
});
export type GenerateSocialMediaAdCopyInput = z.infer<typeof GenerateSocialMediaAdCopyInputSchema>;

const GenerateSocialMediaAdCopyOutputSchema = z.object({
  adCopy: z.string().describe('The generated social media ad copy.'),
});
export type GenerateSocialMediaAdCopyOutput = z.infer<typeof GenerateSocialMediaAdCopyOutputSchema>;

export async function generateSocialMediaAdCopy(input: GenerateSocialMediaAdCopyInput): Promise<GenerateSocialMediaAdCopyOutput> {
  return generateSocialMediaAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaAdCopyPrompt',
  input: {schema: GenerateSocialMediaAdCopyInputSchema},
  output: {schema: GenerateSocialMediaAdCopyOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in creating engaging social media ad copy.

  Given the following product information, target audience, desired tone, and platform, generate compelling ad copy.

  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Target Audience: {{{targetAudience}}}
  Tone: {{{tone}}}
  Platform: {{{platform}}}

  Ad Copy:`,
});

const generateSocialMediaAdCopyFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaAdCopyFlow',
    inputSchema: GenerateSocialMediaAdCopyInputSchema,
    outputSchema: GenerateSocialMediaAdCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview This file defines a Genkit flow for automatically generating product tags and SEO text.
 *
 * The flow takes product details as input and returns generated tags and SEO text.
 * - generateProductTagsAndSeoText - A function that handles the generation of product tags and SEO text.
 * - GenerateProductTagsAndSeoTextInput - The input type for the generateProductTagsAndSeoText function.
 * - GenerateProductTagsAndSeoTextOutput - The return type for the generateProductTagsAndSeoText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductTagsAndSeoTextInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  productCategory: z.string().describe('The category the product belongs to.'),
  targetAudience: z.string().describe('The target audience for the product.'),
});
export type GenerateProductTagsAndSeoTextInput = z.infer<typeof GenerateProductTagsAndSeoTextInputSchema>;

const GenerateProductTagsAndSeoTextOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant tags for the product.'),
  seoTitle: z.string().describe('An SEO-optimized title for the product.'),
  seoDescription: z.string().describe('An SEO-optimized description for the product.'),
});
export type GenerateProductTagsAndSeoTextOutput = z.infer<typeof GenerateProductTagsAndSeoTextOutputSchema>;

export async function generateProductTagsAndSeoText(
  input: GenerateProductTagsAndSeoTextInput
): Promise<GenerateProductTagsAndSeoTextOutput> {
  return generateProductTagsAndSeoTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductTagsAndSeoTextPrompt',
  input: {schema: GenerateProductTagsAndSeoTextInputSchema},
  output: {schema: GenerateProductTagsAndSeoTextOutputSchema},
  prompt: `You are an expert in generating product tags and SEO text.

  Given the following product details, generate relevant tags, an SEO title, and an SEO description.

  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Product Category: {{{productCategory}}}
  Target Audience: {{{targetAudience}}}

  Tags should be concise and relevant to the product.
  The SEO title should be engaging and include relevant keywords.
  The SEO description should be compelling and entice users to learn more. Make sure to stay within the character limit of 160 characters.

  Ensure that your output is optimized for search engines and user engagement.
  `,}
);

const generateProductTagsAndSeoTextFlow = ai.defineFlow(
  {
    name: 'generateProductTagsAndSeoTextFlow',
    inputSchema: GenerateProductTagsAndSeoTextInputSchema,
    outputSchema: GenerateProductTagsAndSeoTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview This file defines a Genkit flow for automatically generating product details.
 *
 * The flow takes a product name as input and returns a generated description, category, and target audience.
 * - generateProductDetails - A function that handles the generation of product details.
 * - GenerateProductDetailsInput - The input type for the generateProductDetails function.
 * - GenerateProductDetailsOutput - The return type for the generateProductDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDetailsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type GenerateProductDetailsInput = z.infer<typeof GenerateProductDetailsInputSchema>;

const GenerateProductDetailsOutputSchema = z.object({
  productDescription: z.string().describe('A detailed, engaging description of the product.'),
  productCategory: z.string().describe('A suitable category for the product (e.g., Electronics, Fashion, Home & Kitchen).'),
  targetAudience: z.string().describe('The ideal target audience for the product (e.g., Students, Professionals, Gamers).'),
});
export type GenerateProductDetailsOutput = z.infer<typeof GenerateProductDetailsOutputSchema>;

export async function generateProductDetails(
  input: GenerateProductDetailsInput
): Promise<GenerateProductDetailsOutput> {
  return generateProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDetailsPrompt',
  input: {schema: GenerateProductDetailsInputSchema},
  output: {schema: GenerateProductDetailsOutputSchema},
  prompt: `You are an expert e-commerce assistant.

  Given the following product name, generate a compelling product description, a relevant product category, and a specific target audience.

  Product Name: {{{productName}}}

  The product description should be engaging and highlight potential key features and benefits.
  The product category should be a common e-commerce category.
  The target audience should describe the ideal customer for this product.
  `,
});

const generateProductDetailsFlow = ai.defineFlow(
  {
    name: 'generateProductDetailsFlow',
    inputSchema: GenerateProductDetailsInputSchema,
    outputSchema: GenerateProductDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

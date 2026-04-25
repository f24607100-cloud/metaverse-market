// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that provides tailored product recommendations based on user history.
 *
 * - suggestTailoredProducts - A function that suggests products tailored to individual users based on browsing history and purchase behavior.
 * - SuggestTailoredProductsInput - The input type for the suggestTailoredProducts function.
 * - SuggestTailoredProductsOutput - The return type for the suggestTailoredProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTailoredProductsInputSchema = z.object({
  browsingHistory: z.string().describe('The user\u2019s browsing history.'),
  purchaseHistory: z.string().describe('The user\u2019s purchase history.'),
  productCatalog: z.string().describe('A comprehensive catalog of available products.'),
});
export type SuggestTailoredProductsInput = z.infer<typeof SuggestTailoredProductsInputSchema>;

const SuggestTailoredProductsOutputSchema = z.object({
  recommendedProducts: z.array(z.string()).describe('A list of product names that are recommended for the user.'),
});
export type SuggestTailoredProductsOutput = z.infer<typeof SuggestTailoredProductsOutputSchema>;

export async function suggestTailoredProducts(input: SuggestTailoredProductsInput): Promise<SuggestTailoredProductsOutput> {
  return suggestTailoredProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTailoredProductsPrompt',
  input: {schema: SuggestTailoredProductsInputSchema},
  output: {schema: SuggestTailoredProductsOutputSchema},
  prompt: `You are an expert product recommendation engine. Based on the user's browsing history, purchase history, and the available product catalog, you will suggest products that the user is likely to be interested in.

User Browsing History: {{{browsingHistory}}}
User Purchase History: {{{purchaseHistory}}}
Product Catalog: {{{productCatalog}}}

Recommend products tailored to the user's interests.`,
});

const suggestTailoredProductsFlow = ai.defineFlow(
  {
    name: 'suggestTailoredProductsFlow',
    inputSchema: SuggestTailoredProductsInputSchema,
    outputSchema: SuggestTailoredProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

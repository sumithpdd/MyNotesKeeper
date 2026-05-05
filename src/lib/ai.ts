import 'server-only';
import { generateText, generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { AIGenerationRequest, AIGenerationResponse } from '@/types';
import { formatProductDisplayName } from '@/lib/productDisplay';

/**
 * Server-only Gemini service. Uses the Vercel AI SDK (`ai` + `@ai-sdk/google`)
 * so swapping providers later is a one-line change.
 *
 * Env: `GEMINI_API_KEY` (server-only). Never expose with NEXT_PUBLIC_ prefix.
 */

const MODEL_ID = 'gemini-2.0-flash';

let providerSingleton: ReturnType<typeof createGoogleGenerativeAI> | null = null;

function getModel() {
  if (!providerSingleton) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Gemini API key is not configured. Please add GEMINI_API_KEY (server-only) to your .env.local and restart the server. Get your key from: https://aistudio.google.com/app/apikey',
      );
    }
    if (!apiKey.startsWith('AIza')) {
      throw new Error(
        'Invalid API key format. Please check your key from https://aistudio.google.com/app/apikey and update your .env.local file.',
      );
    }
    providerSingleton = createGoogleGenerativeAI({ apiKey });
  }
  return providerSingleton(MODEL_ID);
}

function decoratedRuntimeError(error: unknown, fallback: string): Error {
  const e = error as { message?: string; code?: number | string };
  const message = e?.message || '';
  if (message.includes('API key') || message.includes('not configured')) {
    return error instanceof Error ? error : new Error(message || fallback);
  }
  if (message.includes('403') || e?.code === 403) {
    return new Error(
      'Your Gemini API key is invalid or restricted. Please get a new key from https://aistudio.google.com/app/apikey and update your env vars.',
    );
  }
  if (message.includes('404') || e?.code === 404) {
    return new Error(
      'The Gemini API endpoint was not found. Please check your API key from https://aistudio.google.com/app/apikey.',
    );
  }
  if (message.includes('429') || e?.code === 429) {
    return new Error('Rate limit exceeded. Please wait a moment and try again.');
  }
  if (message.includes('network') || message.includes('fetch')) {
    return new Error('Network error connecting to Gemini API. Please try again.');
  }
  return new Error(`${fallback}${message ? `: ${message}` : ''}`);
}

const taskDraftSchema = z.object({
  description: z.string(),
  checklist: z.array(z.string()),
  subtasks: z.array(z.string()),
});

export class AIService {
  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);
      const { text } = await generateText({ model: getModel(), prompt });
      return { content: text, suggestions: this.extractSuggestions(text) };
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw decoratedRuntimeError(error, 'Failed to generate AI content');
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const { customerName, context, type } = request;

    switch (type) {
      case 'notes':
        return `Generate professional meeting notes for customer: ${customerName}. 
        Context: ${context}
        Please provide structured notes including key points, action items, and next steps.`;

      case 'summary':
        return `Create a concise summary for customer: ${customerName}.
        Context: ${context}
        Focus on main outcomes, decisions made, and important details.`;

      case 'suggestions':
        return `Provide strategic suggestions for customer: ${customerName}.
        Context: ${context}
        Include recommendations for Products, Partners, and next steps.`;

      default:
        return `Generate helpful content for customer: ${customerName}.
        Context: ${context}`;
    }
  }

  private extractSuggestions(text: string): string[] {
    const suggestions = text
      .split('\n')
      .filter((line) => line.trim().match(/^[-•*]\s|^\d+\.\s/))
      .map((line) => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter((suggestion) => suggestion.length > 0);

    return suggestions.slice(0, 5);
  }

  async generateMeetingNotes(customerName: string, context: string): Promise<string> {
    const result = await this.generateContent({ customerName, context, type: 'notes' });
    return result.content;
  }

  async generateSummary(customerName: string, context: string): Promise<string> {
    const result = await this.generateContent({ customerName, context, type: 'summary' });
    return result.content;
  }

  async generateSuggestions(customerName: string, context: string): Promise<string[]> {
    const result = await this.generateContent({ customerName, context, type: 'suggestions' });
    return result.suggestions || [];
  }

  /**
   * Propose description, checklist lines, and subtask titles from a task title + light context.
   * Uses `generateObject` with a Zod schema (no manual JSON parsing).
   */
  async draftEngagementTaskStructured(input: {
    title: string;
    categoryName?: string;
    customerName?: string;
    opportunityName?: string;
  }): Promise<{ description: string; checklist: string[]; subtasks: string[] }> {
    const title = input.title.trim();
    if (!title) throw new Error('Title required for AI draft');

    const hint = `
Task title: ${title}
${input.categoryName ? `Category: ${input.categoryName}\n` : ''}${input.customerName ? `Account: ${input.customerName}\n` : ''}${input.opportunityName ? `Opportunity: ${input.opportunityName}\n` : ''}`.trim();

    const prompt = `You assist a SaaS engagement / sales consultant. Based on the following, propose a concise task briefing.

${hint}

Requirements:
- description: 2–5 short sentences.
- checklist: 3–8 discrete yes/no QA items suitable for ticking off before the work ships.
- subtasks: 3–8 concrete action steps (owners implied: the AE or SC).
- No duplicate wording between checklist vs subtasks; keep each line under ~90 characters.`;

    try {
      const { object } = await generateObject({
        model: getModel(),
        schema: taskDraftSchema,
        prompt,
      });
      return {
        description: object.description.trim(),
        checklist: object.checklist.map((s) => s.trim()).filter(Boolean).slice(0, 12),
        subtasks: object.subtasks.map((s) => s.trim()).filter(Boolean).slice(0, 12),
      };
    } catch (error) {
      console.error('draftEngagementTaskStructured', error);
      throw decoratedRuntimeError(error, 'Failed to draft task with AI');
    }
  }

  async refineText(
    currentText: string,
    action: 'expand' | 'refine' | 'elaborate',
    context?: string,
  ): Promise<string> {
    try {
      const actionPrompts = {
        expand: `Expand the following text with more details and depth. Keep it professional and sales-focused.\n\nText: ${currentText}`,
        refine: `Refine and improve the following text to make it more professional and compelling. Keep the main message intact.\n\nText: ${currentText}`,
        elaborate: `Elaborate on the following text with additional context and examples. Keep it relevant and professional.\n\nText: ${currentText}${context ? `\n\nAdditional context: ${context}` : ''}`,
      };

      const { text } = await generateText({ model: getModel(), prompt: actionPrompts[action] });
      return text;
    } catch (error) {
      console.error('Error refining text:', error);
      throw decoratedRuntimeError(error, 'Failed to refine text');
    }
  }

  async generateCustomerSummary(customer: {
    customerName?: string;
    products?: Array<{ name: string; version?: string }>;
    migrationComplexity?: string;
    perpetualOrSubscription?: string;
    hostingLocation?: string;
    compellingEvent?: string;
    existingMigrationOpp?: string;
    migrationNotes?: string;
    mergedNotes?: string;
  }): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Generating customer summary for', customer.customerName);
      }

      const prompt = `Generate a comprehensive customer summary for ${customer.customerName || 'this customer'}.

Customer Information:
- Products: ${customer.products?.map((p) => formatProductDisplayName(p)).join(', ') || 'N/A'}
- Migration Complexity: ${customer.migrationComplexity || 'Not specified'}
- License Type: ${customer.perpetualOrSubscription || 'Not specified'}
- Hosting: ${customer.hostingLocation || 'Not specified'}
- Compelling Event: ${customer.compellingEvent || 'None specified'}
- Migration Opportunity: ${customer.existingMigrationOpp || 'No'}
${customer.migrationNotes ? `- Migration Notes: ${customer.migrationNotes}` : ''}
${customer.compellingEvent ? `- Compelling Event: ${customer.compellingEvent}` : ''}
${customer.mergedNotes ? `- Additional Notes: ${customer.mergedNotes}` : ''}

Please provide a concise, professional summary focusing on:
1. Current status and products
2. Migration opportunity and complexity
3. Key compelling events
4. Recommended next steps for the sales consultant

Be specific and actionable.`;

      const { text } = await generateText({ model: getModel(), prompt });
      return text;
    } catch (error) {
      console.error('Error generating customer summary:', error);
      throw decoratedRuntimeError(error, 'Failed to generate customer summary');
    }
  }
}

export const aiService = new AIService();
